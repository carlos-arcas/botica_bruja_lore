#!/usr/bin/env python3
"""Gate local de ecommerce real con pago simulado (solo lectura)."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
SEVERIDADES = ("BLOCKER", "WARNING", "OK")


@dataclass(frozen=True, slots=True)
class ResultadoCheck:
    severidad: str
    codigo: str
    detalle: str
    ruta: str
    accion_sugerida: str


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gate local de ecommerce simulado.")
    parser.add_argument("--json", action="store_true", help="Emite salida JSON.")
    parser.add_argument("--fail-on", choices=("blocker", "warning", "none"), default="blocker")
    return parser.parse_args(argv)


def _rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT_DIR).as_posix()
    except ValueError:
        return path.as_posix()


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _exists(root: Path, rel_path: str, codigo: str, detalle: str) -> ResultadoCheck:
    path = root / rel_path
    if path.exists():
        return ResultadoCheck("OK", codigo, detalle, rel_path, "Sin accion.")
    return ResultadoCheck("BLOCKER", codigo, f"No existe {rel_path}.", rel_path, "Restaurar el archivo requerido por el gate local.")


def _contains(root: Path, rel_path: str, patrones: tuple[str, ...], codigo: str, detalle: str) -> ResultadoCheck:
    path = root / rel_path
    if not path.exists():
        return ResultadoCheck("BLOCKER", codigo, f"No existe {rel_path}.", rel_path, "Restaurar el archivo requerido.")
    contenido = _read(path)
    faltantes = [patron for patron in patrones if patron not in contenido]
    if not faltantes:
        return ResultadoCheck("OK", codigo, detalle, rel_path, "Sin accion.")
    return ResultadoCheck("BLOCKER", codigo, f"Faltan marcadores: {', '.join(faltantes)}.", rel_path, "Revisar contrato local simulado.")


def _check_roadmap(root: Path) -> list[ResultadoCheck]:
    rel_path = "docs/roadmap_ecommerce_local_simulado.md"
    resultado = [_exists(root, rel_path, "roadmap_local_existe", "Roadmap local simulado presente.")]
    if resultado[0].severidad != "OK":
        return resultado
    contenido = _read(root / rel_path)
    requeridos = ("/checkout", "/pedido/[id_pedido]", "/mi-cuenta", "simulado_local", "Stripe queda reservado")
    resultado.append(_contains(root, rel_path, requeridos, "roadmap_define_flujo_local", "Roadmap define flujo local simulado."))
    legado_documentado = all(marcador in contenido for marcador in ("/encargo", "/pedido-demo", "Legacy deprecado"))
    severidad = "WARNING" if legado_documentado else "BLOCKER"
    detalle = "Legacy visible documentado como deprecado." if legado_documentado else "Legacy no queda documentado como deprecado."
    resultado.append(ResultadoCheck(severidad, "legacy_visible_documentado", detalle, rel_path, "Mantener legacy controlado hasta retirada planificada."))
    return resultado


def _check_mapa_rutas(root: Path) -> list[ResultadoCheck]:
    rel_path = "docs/mapa_rutas_ecommerce_local.md"
    requeridos = (
        "/checkout",
        "/pedido/[id_pedido]",
        "/mi-cuenta",
        "LEGACY_DEPRECATED",
        "NOINDEX",
        "CTA principal",
        "scripts/check_ecommerce_local_simulado.py",
    )
    return [_contains(root, rel_path, requeridos, "mapa_rutas_local", "Mapa final de rutas ecommerce local presente.")]


def _check_frontend(root: Path) -> list[ResultadoCheck]:
    checks = [
        _exists(root, "frontend/app/checkout/page.tsx", "ruta_checkout_existe", "/checkout existe."),
        _exists(root, "frontend/app/encargo/page.tsx", "ruta_encargo_legacy_existe", "/encargo existe como legacy."),
        _exists(root, "frontend/app/pedido/[id_pedido]/page.tsx", "ruta_pedido_real_existe", "/pedido/[id_pedido] existe."),
        _exists(root, "frontend/app/mi-cuenta/page.tsx", "ruta_mi_cuenta_existe", "/mi-cuenta existe."),
        _contains(root, "frontend/app/checkout/page.tsx", ("FlujoCheckoutReal",), "checkout_real_frontend", "Checkout real conectado."),
        _contains(root, "frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx", ("confirmarPagoSimuladoPedido", "resolverEsPagoSimuladoLocal"), "recibo_pago_simulado", "Recibo real soporta pago local."),
    ]
    return checks


def _check_backend(root: Path) -> list[ResultadoCheck]:
    return [
        _contains(root, "backend/nucleo_herbal/infraestructura/pagos_simulados.py", ("PasarelaPagoSimuladaLocal", "simulado_local", "PuertoPasarelaPago"), "adaptador_pago_simulado", "Adaptador simulado por puerto existe."),
        _contains(root, "backend/configuracion_django/settings.py", ("BOTICA_PAYMENT_PROVIDER", "simulado_local"), "configuracion_proveedor_pago", "Proveedor de pago configurable."),
        _contains(root, "backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py", ("ConfirmarPagoSimuladoPedido", "ProcesarPostPagoPedido"), "caso_uso_confirmacion_simulada", "Confirmacion simulada reutiliza post-pago."),
        _contains(root, "backend/nucleo_herbal/presentacion/publica/urls_pedidos.py", ("confirmar-pago-simulado",), "endpoint_confirmacion_simulada", "Endpoint de confirmacion simulado existe."),
        _contains(root, "backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos.py", ("PedidoRealAdmin", "pago_simulado"), "backoffice_pedidos_reales", "Admin de pedidos reales disponible."),
    ]


def _check_proveedor_pago_entorno() -> list[ResultadoCheck]:
    proveedor = os.getenv("BOTICA_PAYMENT_PROVIDER", "simulado_local").strip().lower() or "simulado_local"
    if proveedor == "simulado_local":
        return [ResultadoCheck("OK", "proveedor_pago_entorno_local", "Entorno actual usa simulado_local o valor por defecto local.", "env:BOTICA_PAYMENT_PROVIDER", "Sin accion.")]
    if proveedor == "stripe":
        return [ResultadoCheck("WARNING", "proveedor_pago_entorno_local", "El gate se ejecuta con BOTICA_PAYMENT_PROVIDER=stripe; no es el modo local simulado.", "env:BOTICA_PAYMENT_PROVIDER", "Usar simulado_local para demo local; reservar stripe para fase futura.")]
    return [ResultadoCheck("BLOCKER", "proveedor_pago_entorno_local", f"Proveedor de pago no soportado en entorno: {proveedor}.", "env:BOTICA_PAYMENT_PROVIDER", "Usar simulado_local o stripe.")]


def _check_seo(root: Path) -> list[ResultadoCheck]:
    contrato = root / "docs/seo_contrato.json"
    if contrato.exists():
        contenido = _read(contrato)
        if all(m in contenido for m in ("/checkout", "/pedido/{id_pedido}", "transaccionales_noindex")):
            return [ResultadoCheck("OK", "noindex_transaccional", "Contrato SEO protege checkout y pedido.", _rel(contrato), "Sin accion.")]
    rutas = ("frontend/app/checkout/page.tsx", "frontend/app/pedido/[id_pedido]/page.tsx")
    encontrados = [rel for rel in rutas if (root / rel).exists() and "indexable: false" in _read(root / rel)]
    if len(encontrados) == len(rutas):
        return [ResultadoCheck("OK", "noindex_transaccional", "Metadata noindex presente en rutas transaccionales.", ", ".join(rutas), "Sin accion.")]
    return [ResultadoCheck("BLOCKER", "noindex_transaccional", "No se confirma noindex para checkout y pedido.", "docs/seo_contrato.json", "Restaurar contrato noindex transaccional.")]


def _check_ctas_pedido_demo(root: Path) -> list[ResultadoCheck]:
    base = root / "frontend"
    if not base.exists():
        return [ResultadoCheck("WARNING", "cta_pedido_demo_no_comprobable", "Frontend no existe; no se comprueban CTAs.", "frontend", "Ejecutar en repo completo.")]
    patrones = (r'href=["\']\/pedido-demo', r'router\.push\(["\']\/pedido-demo')
    coincidencias: list[str] = []
    for path in _archivos_publicos(base):
        texto = _read(path)
        if any(re.search(patron, texto) for patron in patrones):
            coincidencias.append(_rel(path))
    if coincidencias:
        detalle = "CTAs publicos hacia /pedido-demo: " + ", ".join(coincidencias[:5])
        return [ResultadoCheck("BLOCKER", "cta_publico_pedido_demo", detalle, "frontend", "Retirar CTAs principales hacia pedido demo.")]
    return [ResultadoCheck("OK", "cta_publico_pedido_demo", "No hay CTAs publicos evidentes hacia /pedido-demo.", "frontend", "Sin accion.")]


def _check_legacy_demo_guardrail(root: Path) -> list[ResultadoCheck]:
    resultados: list[ResultadoCheck] = []
    resultados.extend(_check_checkout_real_sin_demo(root))
    resultados.extend(_check_checkout_real_encargo_consulta_controlada(root))
    resultados.extend(_check_navegacion_sin_cuenta_demo(root))
    resultados.extend(_check_encargo_consulta_secundaria(root))
    return resultados


def _check_checkout_real_sin_demo(root: Path) -> list[ResultadoCheck]:
    rutas = (
        "frontend/app/checkout/page.tsx",
        "frontend/app/pedido/[id_pedido]/page.tsx",
        "frontend/app/mi-cuenta/page.tsx",
        "frontend/componentes/catalogo/checkout-real",
        "frontend/componentes/cuenta_cliente",
        "frontend/contenido/catalogo/checkoutReal.ts",
        "frontend/contenido/cuenta_cliente",
        "frontend/infraestructura/api/pedidos.ts",
        "frontend/infraestructura/api/cuentasCliente.ts",
    )
    prohibidos = ("PedidoDemo", "PayloadPedidoDemo", "CuentaDemo", "checkoutDemo", "pedidosDemo", "cuentasDemo")
    coincidencias: list[str] = []
    for path in _iter_paths(root, rutas):
        texto = _read(path)
        usados = [marcador for marcador in prohibidos if marcador in texto]
        if usados:
            coincidencias.append(f"{_rel(path)} ({', '.join(usados)})")
    if coincidencias:
        return [ResultadoCheck("BLOCKER", "checkout_real_sin_pedido_demo", "Modulos reales dependen de demo: " + "; ".join(coincidencias[:5]), "frontend", "Eliminar dependencia demo del flujo real.")]
    return [ResultadoCheck("OK", "checkout_real_sin_pedido_demo", "Modulos reales no dependen de PedidoDemo/CuentaDemo ni API demo.", "frontend", "Sin accion.")]


def _check_checkout_real_encargo_consulta_controlada(root: Path) -> list[ResultadoCheck]:
    rel_path = "frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx"
    path = root / rel_path
    if not path.exists():
        return [ResultadoCheck("WARNING", "checkout_real_encargo_consulta_no_verificable", "No se pudo verificar el uso de helpers de encargo en checkout real.", rel_path, "Comprobar en repo completo.")]
    contenido = _read(path)
    if "encargoConsulta" in contenido:
        return [ResultadoCheck("WARNING", "checkout_real_encargo_consulta_controlada", "Checkout real reutiliza helper de preseleccion de consulta; permitido solo como adaptador transitorio.", rel_path, "Extraer helper compartido si crece o se vuelve dependencia de negocio.")]
    return [ResultadoCheck("OK", "checkout_real_encargo_consulta_controlada", "Checkout real no importa helpers especificos de encargo.", rel_path, "Sin accion.")]


def _check_navegacion_sin_cuenta_demo(root: Path) -> list[ResultadoCheck]:
    rel_path = "frontend/contenido/shell/navegacionGlobal.ts"
    path = root / rel_path
    if not path.exists():
        return [ResultadoCheck("WARNING", "navegacion_principal_no_verificable", "No existe navegacion global.", rel_path, "Comprobar navegacion en repo completo.")]
    contenido = _read(path)
    bloque_principal = contenido.split("const ENLACES_BASE_FOOTER", 1)[0]
    if "cuenta-demo" in bloque_principal:
        return [ResultadoCheck("BLOCKER", "navegacion_principal_cuenta_demo", "cuenta-demo aparece en navegacion principal.", rel_path, "Retirar cuenta-demo de navegacion principal.")]
    return [ResultadoCheck("OK", "navegacion_principal_cuenta_demo", "cuenta-demo no aparece en navegacion principal.", rel_path, "Sin accion.")]


def _check_encargo_consulta_secundaria(root: Path) -> list[ResultadoCheck]:
    rel_path = "frontend/contenido/shell/navegacionGlobal.ts"
    path = root / rel_path
    if path.exists() and 'href: "/encargo"' in _read(path):
        return [ResultadoCheck("WARNING", "encargo_consulta_secundaria", "/encargo sigue enlazado como consulta secundaria.", rel_path, "Mantener solo como consulta hasta retirada planificada.")]
    return [ResultadoCheck("OK", "encargo_consulta_secundaria", "/encargo no aparece como flujo principal.", rel_path, "Sin accion.")]


def _iter_paths(root: Path, rutas: tuple[str, ...]) -> tuple[Path, ...]:
    paths: list[Path] = []
    for rel_path in rutas:
        path = root / rel_path
        if path.is_file():
            paths.append(path)
        elif path.is_dir():
            paths.extend(sorted(path.glob("**/*.[tj]sx")))
    return tuple(paths)


def _archivos_publicos(base: Path) -> tuple[Path, ...]:
    patrones = ("app/**/*.tsx", "componentes/**/*.tsx", "contenido/**/*.ts")
    excluidos = ("app/admin/", "app/api/", "componentes/admin/", "componentes/debug/")
    archivos: list[Path] = []
    for patron in patrones:
        for path in base.glob(patron):
            rel = path.relative_to(base).as_posix()
            if not any(rel.startswith(excluido) for excluido in excluidos):
                archivos.append(path)
    return tuple(archivos)


def _check_v2_r10(root: Path) -> list[ResultadoCheck]:
    rel_path = "docs/roadmap_ecommerce_real_v2.md"
    path = root / rel_path
    if not path.exists():
        return [ResultadoCheck("BLOCKER", "v2_r10_no_verificable", "No existe roadmap V2.", rel_path, "Restaurar documento V2.")]
    contenido = _read(path)
    bloqueado = "V2-R10" in contenido and "`BLOCKED`" in contenido
    no_go_live = "no desbloquea `V2-R10`" in contenido and "no activa Stripe ni pagos reales" in contenido
    if bloqueado and no_go_live:
        return [ResultadoCheck("OK", "v2_r10_sigue_bloqueado", "V2-R10 sigue bloqueado para go-live real.", rel_path, "Sin accion.")]
    return [ResultadoCheck("BLOCKER", "v2_r10_sigue_bloqueado", "V2-R10 no aparece claramente bloqueado frente a go-live real.", rel_path, "Reafirmar bloqueo externo y pagos reales inactivos.")]


def evaluar(root: Path = ROOT_DIR) -> tuple[ResultadoCheck, ...]:
    resultados: list[ResultadoCheck] = []
    resultados.extend(_check_roadmap(root))
    resultados.extend(_check_mapa_rutas(root))
    resultados.extend(_check_frontend(root))
    resultados.extend(_check_backend(root))
    resultados.extend(_check_proveedor_pago_entorno())
    resultados.extend(_check_seo(root))
    resultados.extend(_check_ctas_pedido_demo(root))
    resultados.extend(_check_legacy_demo_guardrail(root))
    resultados.extend(_check_v2_r10(root))
    return tuple(resultados)


def _exit_code(resultados: tuple[ResultadoCheck, ...], fail_on: str) -> int:
    if fail_on == "none":
        return 0
    if fail_on == "warning":
        return 1 if any(r.severidad in {"BLOCKER", "WARNING"} for r in resultados) else 0
    return 1 if any(r.severidad == "BLOCKER" for r in resultados) else 0


def _payload(resultados: tuple[ResultadoCheck, ...]) -> dict[str, object]:
    conteo = {sev: sum(1 for r in resultados if r.severidad == sev) for sev in SEVERIDADES}
    return {
        "gate": "ecommerce_local_simulado",
        "objetivo": "validacion local, no go-live externo",
        "conteo": conteo,
        "resultados": [asdict(r) for r in resultados],
    }


def _print_text(resultados: tuple[ResultadoCheck, ...]) -> None:
    print("== Gate local ecommerce simulado (solo lectura) ==")
    print("Objetivo: validar ecommerce local real con pasarela simulada.")
    print("Nota: este gate no declara go-live externo ni activa pagos reales.")
    for severidad in SEVERIDADES:
        subset = [r for r in resultados if r.severidad == severidad]
        if not subset:
            continue
        print(f"\n[{severidad}] {len(subset)} check(s)")
        for item in subset:
            print(f"- {item.codigo} :: {item.detalle}")
            print(f"  ruta: {item.ruta}")
            print(f"  accion: {item.accion_sugerida}")


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    resultados = evaluar(ROOT_DIR)
    if args.json:
        print(json.dumps(_payload(resultados), ensure_ascii=False, indent=2))
    else:
        _print_text(resultados)
    return _exit_code(resultados, args.fail_on)


if __name__ == "__main__":
    raise SystemExit(main())
