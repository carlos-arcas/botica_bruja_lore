"""Servicio de importación masiva para backoffice."""

import logging
import uuid

from django.db import transaction

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.esquemas import (
    ESQUEMAS_IMPORTACION,
    detectar_entidad_por_columnas,
)
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.imagenes import resolver_imagen
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.resultados import ResultadoImportacion
from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
    ArticuloEditorialModelo,
    IntencionModelo,
    ProductoModelo,
    RitualModelo,
    SeccionPublicaModelo,
)



LOGGER = logging.getLogger(__name__)
MODO_SOLO_CREAR = "solo_crear"
MODO_UPSERT = "crear_actualizar"
MODO_SOLO_VALIDAR = "solo_validar"
MODOS = (MODO_SOLO_CREAR, MODO_UPSERT, MODO_SOLO_VALIDAR)
SECCIONES_PUBLICAS_PRODUCTO_CANONICAS = (
    "botica-natural",
    "velas-e-incienso",
    "minerales-y-energia",
    "herramientas-esotericas",
)
SECCIONES_PUBLICAS_PRODUCTO_CANONICAS_SET = set(SECCIONES_PUBLICAS_PRODUCTO_CANONICAS)


def procesar_importacion(
    filas: list[dict[str, str]],
    columnas: list[str],
    entidad_solicitada: str,
    modo: str,
    imagenes_por_referencia: dict[str, str],
    usuario,
) -> ResultadoImportacion:
    entidad_detectada = entidad_solicitada or detectar_entidad_por_columnas(set(columnas))
    if not entidad_detectada:
        raise ValueError("No se pudo detectar la entidad por cabeceras.")

    esquema = ESQUEMAS_IMPORTACION[entidad_detectada]
    resultado = ResultadoImportacion(entidad=entidad_detectada)
    resultado.columnas_detectadas = columnas
    resultado.columnas_faltantes = [c for c in esquema.columnas_obligatorias if c not in set(columnas)]
    if resultado.columnas_faltantes:
        return resultado

    if modo not in MODOS:
        raise ValueError("Modo de importación inválido.")

    persistir = modo != MODO_SOLO_VALIDAR
    for indice, row in enumerate(filas, start=2):
        resultado.filas_procesadas += 1
        try:
            _procesar_fila(entidad_detectada, row, modo, persistir, resultado, imagenes_por_referencia)
        except ValueError as exc:
            resultado.registrar_error(indice, str(exc))

    LOGGER.info(
        "importacion_masiva_resultado",
        extra={
            "usuario": getattr(usuario, "username", "anonimo"),
            "entidad": entidad_detectada,
            "modo": modo,
            "filas": resultado.filas_procesadas,
            "creadas": resultado.creadas,
            "actualizadas": resultado.actualizadas,
            "fallidas": resultado.fallidas,
        },
    )
    return resultado


def generar_slug_unico(modelo, base: str, actual_id=None) -> str:
    from django.utils.text import slugify

    semilla = slugify(base or "") or "registro"
    slug = semilla
    secuencia = 2
    while True:
        consulta = modelo.objects.filter(slug=slug)
        if actual_id is not None:
            consulta = consulta.exclude(pk=actual_id)
        if not consulta.exists():
            return slug
        slug = f"{semilla}-{secuencia}"
        secuencia += 1


def _parse_bool(valor: str, campo: str) -> bool:
    normalizado = valor.strip().lower()
    if normalizado in {"true", "1", "si", "sí", "yes"}:
        return True
    if normalizado in {"false", "0", "no"}:
        return False
    raise ValueError(f"{campo} debe ser booleano (true/false).")


def _normalizar_seccion_publica_producto(valor: str) -> str:
    seccion = valor.strip().lower()
    if seccion not in SECCIONES_PUBLICAS_PRODUCTO_CANONICAS_SET:
        mapa = ", ".join(SECCIONES_PUBLICAS_PRODUCTO_CANONICAS)
        raise ValueError(f"Seccion publica de producto invalida. Usa una de: {mapa}.")
    return seccion


def _procesar_fila(entidad, row, modo, persistir, resultado, imagenes_por_referencia):
    if entidad == "productos":
        _upsert_producto(row, modo, persistir, resultado, imagenes_por_referencia)
        return
    if entidad == "rituales":
        _upsert_ritual(row, modo, persistir, resultado, imagenes_por_referencia)
        return
    if entidad == "articulos_editoriales":
        _upsert_articulo(row, modo, persistir, resultado, imagenes_por_referencia)
        return
    if entidad == "secciones_publicas":
        _upsert_seccion(row, modo, persistir, resultado)
        return
    raise ValueError("Entidad no soportada.")


def _upsert_producto(row, modo, persistir, resultado, imagenes):
    sku = row.get("sku", "").strip()
    nombre = row.get("nombre", "").strip()
    if not sku or not nombre:
        raise ValueError("Producto requiere sku y nombre.")
    seccion_publica = _normalizar_seccion_publica_producto(row.get("seccion_publica", ""))
    slug_entrada = row.get("slug", "").strip()
    slug = slug_entrada or nombre
    defaults = {
        "nombre": row.get("nombre", "").strip(),
        "tipo_producto": row.get("tipo_producto", "").strip(),
        "categoria_comercial": row.get("categoria_comercial", "").strip(),
        "seccion_publica": seccion_publica,
        "descripcion_corta": row.get("descripcion_corta", "").strip(),
        "precio_visible": row.get("precio_visible", "").strip(),
        "publicado": _parse_bool(row.get("publicado", ""), "publicado"),
        "orden_publicacion": int(row.get("orden_publicacion", "100") or 100),
        "imagen_url": resolver_imagen(row, imagenes),
    }
    existente = ProductoModelo.objects.filter(slug=slug_entrada).first() if slug_entrada else None
    slug = generar_slug_unico(ProductoModelo, slug, existente.id if existente else None)
    if existente and existente.sku != sku:
        raise ValueError(f"Conflicto: slug {slug} ya existe con otro sku.")
    if modo == MODO_SOLO_CREAR and (existente or ProductoModelo.objects.filter(sku=sku).exists()):
        resultado.ignoradas += 1
        return
    if not persistir:
        if existente:
            resultado.actualizadas += 1
        else:
            resultado.creadas += 1
        return
    with transaction.atomic():
        obj, creado = ProductoModelo.objects.update_or_create(
            slug=slug,
            defaults={"id": existente.id if existente else str(uuid.uuid4()), "sku": sku, **defaults},
        )
    resultado.creadas += int(creado)
    resultado.actualizadas += int(not creado)


def _upsert_seccion(row, modo, persistir, resultado):
    nombre = row.get("nombre", "").strip()
    if not nombre:
        raise ValueError("Sección requiere nombre.")
    slug_entrada = row.get("slug", "").strip()
    slug = slug_entrada or nombre
    defaults = {
        "nombre": row.get("nombre", "").strip(),
        "descripcion": row.get("descripcion", "").strip(),
        "orden": int(row.get("orden", "100") or 100),
        "publicada": _parse_bool(row.get("publicada", ""), "publicada"),
    }
    existente = SeccionPublicaModelo.objects.filter(slug=slug_entrada).first() if slug_entrada else None
    slug = generar_slug_unico(SeccionPublicaModelo, slug, existente.id if existente else None)
    if modo == MODO_SOLO_CREAR and existente:
        resultado.ignoradas += 1
        return
    if not persistir:
        resultado.actualizadas += int(bool(existente))
        resultado.creadas += int(not existente)
        return
    obj, creado = SeccionPublicaModelo.objects.update_or_create(slug=slug, defaults=defaults)
    resultado.creadas += int(creado)
    resultado.actualizadas += int(not creado)


def _resolver_relacion_slugs(texto: str) -> list[str]:
    return [item.strip() for item in (texto or "").split(",") if item.strip()]


def _upsert_ritual(row, modo, persistir, resultado, imagenes):
    nombre = row.get("nombre", "").strip()
    if not nombre:
        raise ValueError("Ritual requiere nombre.")
    slug_entrada = row.get("slug", "").strip()
    slug = slug_entrada or nombre
    intenciones_slugs = _resolver_relacion_slugs(row.get("intenciones_relacionadas", ""))
    productos_slugs = _resolver_relacion_slugs(row.get("productos_relacionados", ""))
    intenciones = list(IntencionModelo.objects.filter(slug__in=intenciones_slugs))
    productos = list(ProductoModelo.objects.filter(slug__in=productos_slugs))
    faltantes_intenciones = sorted(set(intenciones_slugs) - {i.slug for i in intenciones})
    faltantes_productos = sorted(set(productos_slugs) - {p.slug for p in productos})
    if faltantes_intenciones or faltantes_productos:
        raise ValueError(
            f"Relaciones inexistentes. intenciones={faltantes_intenciones} productos={faltantes_productos}"
        )
    defaults = {
        "nombre": row.get("nombre", "").strip(),
        "contexto_breve": row.get("contexto_breve", "").strip(),
        "contenido": row.get("contenido", "").strip(),
        "publicado": _parse_bool(row.get("publicado", ""), "publicado"),
        "imagen_url": resolver_imagen(row, imagenes),
    }
    existente = RitualModelo.objects.filter(slug=slug_entrada).first() if slug_entrada else None
    slug = generar_slug_unico(RitualModelo, slug, existente.id if existente else None)
    if modo == MODO_SOLO_CREAR and existente:
        resultado.ignoradas += 1
        return
    if not persistir:
        resultado.actualizadas += int(bool(existente))
        resultado.creadas += int(not existente)
        return
    with transaction.atomic():
        obj, creado = RitualModelo.objects.update_or_create(
            slug=slug, defaults={"id": existente.id if existente else str(uuid.uuid4()), **defaults}
        )
        obj.intenciones.set(intenciones)
        obj.productos_relacionados.set(productos)
    resultado.creadas += int(creado)
    resultado.actualizadas += int(not creado)


def _upsert_articulo(row, modo, persistir, resultado, imagenes):
    titulo = row.get("titulo", "").strip()
    if not titulo:
        raise ValueError("Artículo requiere título.")
    slug_entrada = row.get("slug", "").strip()
    slug = slug_entrada or titulo
    seccion_slug = row.get("seccion_publica", "").strip()
    seccion = None
    if seccion_slug:
        seccion = SeccionPublicaModelo.objects.filter(slug=seccion_slug).first()
        if not seccion:
            raise ValueError(f"Sección pública no existe: {seccion_slug}")
    defaults = {
        "titulo": row.get("titulo", "").strip(),
        "resumen": row.get("resumen", "").strip(),
        "contenido": row.get("contenido", "").strip(),
        "publicado": _parse_bool(row.get("publicado", ""), "publicado"),
        "indexable": _parse_bool(row.get("indexable", ""), "indexable"),
        "tema": row.get("tema", "").strip(),
        "hub": row.get("hub", "").strip(),
        "subhub": row.get("subhub", "").strip(),
        "seccion_publica": seccion,
        "imagen_url": resolver_imagen(row, imagenes),
    }
    existente = ArticuloEditorialModelo.objects.filter(slug=slug_entrada).first() if slug_entrada else None
    slug = generar_slug_unico(ArticuloEditorialModelo, slug, existente.id if existente else None)
    if modo == MODO_SOLO_CREAR and existente:
        resultado.ignoradas += 1
        return
    if not persistir:
        resultado.actualizadas += int(bool(existente))
        resultado.creadas += int(not existente)
        return
    obj, creado = ArticuloEditorialModelo.objects.update_or_create(slug=slug, defaults=defaults)
    resultado.creadas += int(creado)
    resultado.actualizadas += int(not creado)
