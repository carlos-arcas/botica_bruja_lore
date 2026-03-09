# 90 — Estado de implementación del proyecto

## 1. Propósito del documento
Este documento es el tablero vivo de estado de **La Botica de la Bruja Lore**.

Su función es separar, sin ambigüedad:
- lo **definido documentalmente**,
- de lo **implementado funcionalmente**.

Se usa para gobernar avance real por ciclos, evitar declarar avances ficticios y mantener trazabilidad operativa entre capacidades, evidencia y estado.

## 2. Convención oficial de estados
Los estados oficiales de proyecto y capacidad son:

- **DEFINIDO**: la capacidad está especificada y alineada con arquitectura/dominio, pero no implementada.
- **PLANIFICADO**: la capacidad tiene ciclo objetivo y dependencia identificada para ejecución futura.
- **EN_PROGRESO**: existe implementación activa en curso dentro del ciclo actual.
- **DONE**: la capacidad está implementada y es verificable/navegable/demostrable, respeta arquitectura y pasa quality gate cuando aplica.
- **BLOQUEADO**: la capacidad no puede avanzar por dependencia, restricción o riesgo no resuelto.
- **DESCARTADO**: la capacidad se retira explícitamente del alcance con decisión trazable.

## 3. Principios de uso del documento
1. Este tablero **no reemplaza** visión, alcance, dominio ni arquitectura; los referencia.
2. No se marca **DONE funcional** sin implementación real verificable.
3. Lo documental puede estar cerrado sin que exista producto implementado.
4. Cada capacidad debe indicar ciclo asociado y evidencia concreta.
5. Este archivo se actualiza por cambios de estado, no como diario ni changelog narrativo.
6. En caso de duda, prevalece la fuente de verdad en `docs/`.

## 4. Estado global actual del proyecto
- Estado de definición estratégica/documental: **alto y consistente**.
- Estado de implementación funcional de producto: **Ciclos 1 y 2 implementados en alcance comprometido**.
- Backend (dominio/aplicación/infraestructura/presentación pública): **implementado para alcance Ciclo 1 + rituales conectados de Ciclo 2**.
- Frontend (home + herbal + rituales conectados): **implementado para recorrido navegable de Ciclo 2**.
- Backoffice/admin mínimo: **implementado para operación base herbal y ritual**.
- Checkout demo: **no implementado (fuera de alcance de Ciclo 1)**.
- Calendario ritual: **no implementado (ciclo posterior)**.
- Quality gate Ciclo 2 (mínimo operativo razonable): **ejecutado con evidencia reproducible en entorno actual**.

Resumen ejecutivo de estado real: existe un recorrido funcional y defendible para rituales conectados sin romper el enfoque herbal-first. Se validó flujo directo e inverso entre home, herbal y rituales, con separación editorial/comercial preservada y checks mínimos del ciclo en verde (backend Django + frontend lint/build).

## 5. Estado por capacidades
| Capacidad | Estado actual | Ciclo asociado | Evidencia / referencia | Notas operativas |
|---|---|---|---|---|
| Base documental del proyecto | DONE | Ciclo 0 | `docs/00_vision_proyecto.md`, `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md`, `docs/07_arquitectura_tecnica.md`, `docs/08_decisiones_tecnicas_no_negociables.md` | Base documental vigente y alineada. |
| Contrato operativo del agente (`AGENTS.md`) | DONE | Ciclo 0 | `AGENTS.md` | Contrato operativo activo y consistente. |
| Núcleo de dominio/aplicación herbal (`Planta`, `Producto`, `Intencion` + casos de uso) | DONE | Ciclo 1 | `backend/nucleo_herbal/dominio/entidades.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso.py`, `tests/nucleo_herbal/test_entidades.py`, `tests/nucleo_herbal/test_casos_de_uso.py` | Separación Planta/Producto aplicada y validada por tests unitarios. |
| Persistencia y repositorios mínimos | DONE | Ciclo 1 | `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`, `tests/nucleo_herbal/infraestructura/test_repositorios_django.py` | Implementado; validación automática condicionada a disponibilidad de Django en entorno. |
| Exposición pública mínima real (API herbal) | DONE | Ciclo 1 | `backend/nucleo_herbal/presentacion/publica/urls.py`, `backend/nucleo_herbal/presentacion/publica/views.py`, `tests/nucleo_herbal/test_exposicion_publica.py` | Contratos públicos implementados para listado, detalle, productos y relaciones por intención. |
| Backoffice mínimo útil | DONE | Ciclo 1 | `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py`, `tests/nucleo_herbal/infraestructura/test_admin_django.py` | Admin mínimo implementado para Intención/Planta/Producto. |
| Home orientadora conectada | DONE | Ciclo 1 | `frontend/app/page.tsx`, `frontend/componentes/home/` | Home conectada con preview herbal y entrada a exploración. |
| Listado herbal navegable | DONE | Ciclo 1 | `frontend/app/hierbas/page.tsx`, `frontend/componentes/herbal/ListadoHerbal.tsx` | Listado conectado al contrato público backend. |
| Ficha herbal conectada (editorial + comercial mínima) | DONE | Ciclo 1 | `frontend/app/hierbas/[slug]/page.tsx`, `frontend/componentes/herbal/detalle/` | Separación editorial/comercial visible en UI y consumo de API. |
| Dominio/aplicación ritual conectada (`Ritual` + casos de uso) | DONE | Ciclo 2 | `backend/nucleo_herbal/dominio/rituales.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso_rituales.py`, `tests/nucleo_herbal/test_entidades_rituales.py`, `tests/nucleo_herbal/test_casos_de_uso_rituales.py` | Intención como eje puente y relaciones ritual ↔ planta/producto implementadas y validadas. |
| Persistencia/repositorios ritual | DONE | Ciclo 2 | `backend/nucleo_herbal/infraestructura/persistencia_django/models.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`, `tests/nucleo_herbal/infraestructura/test_repositorios_django.py` | Persistencia mínima de rituales y cruces críticos operativa en Django. |
| Exposición pública ritual mínima real | DONE | Ciclo 2 | `backend/nucleo_herbal/presentacion/publica/urls_rituales.py`, `backend/nucleo_herbal/presentacion/publica/views.py`, `tests/nucleo_herbal/test_exposicion_publica.py` | Listado/ficha ritual y endpoints de relaciones publicados con contrato consistente. |
| Backoffice mínimo ritual | DONE | Ciclo 2 | `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py`, `tests/nucleo_herbal/infraestructura/test_admin_django.py` | Admin permite gestionar rituales y relaciones del ciclo sin ampliar alcance. |
| Listado ritual navegable | DONE | Ciclo 2 | `frontend/app/rituales/page.tsx`, `frontend/componentes/rituales/ListadoRituales.tsx` | Ruta pública funcional y conectada a backend real. |
| Ficha ritual conectada | DONE | Ciclo 2 | `frontend/app/rituales/[slug]/page.tsx`, `frontend/componentes/rituales/detalle/` | Ficha con bloques editoriales y resolución comercial mínima enlazando a herbal/producto. |
| Integración bidireccional herbal ↔ ritual | DONE | Ciclo 2 | `frontend/componentes/herbal/detalle/BloqueRitualesRelacionados.tsx`, `frontend/componentes/rituales/detalle/BloquePlantasRelacionadas.tsx`, `tests/nucleo_herbal/test_exposicion_publica.py` | Recorridos de ida y vuelta implementados sin romper prioridad herbal en navegación. |
| Quality gate mínimo operativo de ciclo | DONE | Ciclo 2 (cierre) | `python manage.py check`, `python manage.py test`, `pytest -q tests/nucleo_herbal/test_entidades.py tests/nucleo_herbal/test_casos_de_uso.py tests/nucleo_herbal/test_entidades_rituales.py tests/nucleo_herbal/test_casos_de_uso_rituales.py`, `npm run lint`, `npm run build` | Gate mínimo de cierre ejecutado en entorno local con resultados favorables. |
| Checkout demo | PLANIFICADO | Ciclo 3 | `docs/02_alcance_y_fases.md` | Sin cambios, fuera de alcance. |
| Login / invitado | PLANIFICADO | Ciclo 3–4 | `docs/02_alcance_y_fases.md` | Sin cambios, fuera de alcance. |
| Historial de pedidos demo | PLANIFICADO | Ciclo 4 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Sin cambios, fuera de alcance. |
| Favoritos | PLANIFICADO | Ciclo 4 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Sin cambios, fuera de alcance. |
| Recordatorios | PLANIFICADO | Ciclo 4–5 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Sin cambios, fuera de alcance. |
| Calendario ritual | PLANIFICADO | Ciclo 5 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Sin cambios, fuera de alcance. |

## 6. Último ciclo cerrado
- **Ciclo cerrado formalmente**: Ciclo 2 (rituales conectados).
- **Estado de Ciclo 2**: **DONE técnico** para su contrato de alcance.
- **Evidencia de cierre de Ciclo 2**:
  - recorrido directo validado: home → rituales → ficha ritual conectada → plantas/productos,
  - recorrido inverso validado: home → hierbas → ficha herbal → rituales relacionados,
  - separación editorial/comercial mantenida en backend y frontend,
  - backoffice mínimo ritual y exposición pública mínima ritual operativos,
  - quality gate mínimo ejecutado con checks backend/frontend en verde.

## 7. Ciclo actual
- **Ciclo actual operativo**: cierre técnico de Ciclo 2 completado.
- **Estado**: ciclo listo para transición a planificación/arranque de Ciclo 3, sin sobrealcance introducido en esta tarea de cierre.
- **Condición de salida aplicada**:
  1. validación del contrato funcional del ciclo (rituales conectados) completada,
  2. checks mínimos backend/frontend ejecutados en entorno actual,
  3. documentación de estado sincronizada con evidencia real.

## 8. Deuda y bloqueos conocidos
1. El comando genérico `pytest -q` no debe tomarse como gate único para tests Django con acceso a BD en este repositorio; el runner contractual para ese alcance es `python manage.py test`.
2. No se identificaron defectos bloqueantes de producto en rutas, wiring o contratos del alcance congelado de Ciclo 2.
3. Queda pendiente, como mejora futura (no bloqueante para cierre de Ciclo 2), formalizar una estrategia única de ejecución de tests para evitar ambigüedad entre `pytest` y test runner de Django.

## 9. Próximos movimientos recomendados
1. Abrir formalmente Ciclo 3 con alcance congelado de roadmap, sin adelantar checkout/login/calendario ritual.
2. Mantener el gate mínimo operativo ya ejecutado como baseline y endurecerlo progresivamente según `docs/13_testing_ci_y_quality_gate.md`.
3. Si se desea eliminar fricción de ejecución de tests, acordar y documentar en ciclo futuro un comando canónico de suite backend.

---

**Regla de lectura rápida del estado actual:**
- Ciclo 2 está técnicamente cerrado con evidencia de recorrido y quality gate mínimo operativo.
- No se detectan bloqueos externos que impidan declarar DONE dentro del contrato de este ciclo.
- El siguiente paso correcto es abrir Ciclo 3 respetando el alcance ya definido.

## 10. Actualización incremental de home (Ciclo 3 en progreso)
- Capacidad: **Home comercial + narrativa + UX ligera**.
- Estado: **EN_PROGRESO**.
- Evidencia implementada:
  - estructura de contenido mantenible centralizada en `frontend/contenido/home/contenidoHome.ts`;
  - secciones nuevas en home: hero refinado, Alquimia del Deseo, intenciones con selector, cómo elegir ritual, confianza comercial, FAQ accesible y CTA final;
  - mejoras UX: navegación por anclas, tabs de intenciones sin recarga y acordeón FAQ accesible.
- Tests añadidos para lógica de interacción de tabs/FAQ en `frontend/tests/home-interacciones.test.ts`.
- Nota operativa: la ampliación de contenido futuro debe hacerse sobre el módulo de contenido, evitando hardcodear bloques largos dentro de componentes de presentación.

## 11. Catálogo/colecciones navegables (Ciclo 3 en progreso)
- Capacidad: **Catálogo ritual navegable con filtros y ordenación**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - ruta pública `frontend/app/colecciones/page.tsx` como entrada de colecciones;
  - fuente de datos tipada en `frontend/contenido/catalogo/catalogo.ts`;
  - lógica pura de filtrado/ordenación en `frontend/contenido/catalogo/filtrosCatalogo.ts`;
  - UI de catálogo con controles y estado vacío en `frontend/componentes/catalogo/`;
  - enlace desde home al catálogo actualizado en `frontend/contenido/home/contenidoHome.ts`.
- Ampliación implementada (ficha por slug):
  - ruta dinámica `frontend/app/colecciones/[slug]/page.tsx` con `notFound()` para slugs inválidos;
  - componente de detalle en `frontend/componentes/catalogo/detalle/FichaProductoCatalogo.tsx`;
  - helpers puros de resolución y relacionados en `frontend/contenido/catalogo/detalleCatalogo.ts`;
  - navegación de tarjetas actualizada en `frontend/componentes/catalogo/TarjetaCatalogo.tsx` hacia `/colecciones/[slug]`.
- Tests añadidos para detalle de catálogo en `frontend/tests/catalogo-detalle.test.ts` (slug válido/inexistente, relacionados y fallback).
- Regla operativa para ampliar fichas y relacionados:
  1. Cada nuevo producto debe incluir `slug` único en `PRODUCTOS_CATALOGO`.
  2. La lógica de resolución de detalle y relacionados se mantiene en `detalleCatalogo.ts`, nunca dentro del componente de página.
  3. Los textos de guía ritual por intención se amplían en `obtenerGuiaRitual` para mantener presentación desacoplada de la capa de datos.
- Regla operativa para ampliar catálogo:
  1. Añadir productos en `PRODUCTOS_CATALOGO` siguiendo el tipo `ProductoCatalogo`.
  2. Si se incorpora una nueva intención/categoría, extender primero `OPCIONES_INTENCION` y/o `OPCIONES_CATEGORIA`.
  3. Mantener filtros/ordenación en helpers puros (`filtrosCatalogo.ts`), evitando hardcodear lógica en componentes de presentación.
- Regla operativa para buscador y URL compartible del catálogo:
  1. La normalización/tokenización y búsqueda textual viven en `frontend/contenido/catalogo/busquedaCatalogo.ts`.
  2. El estado compartible de catálogo (`q`, `in`, `cat`, `ord`) se serializa/deserializa en `frontend/contenido/catalogo/estadoCatalogoUrl.ts`.
  3. Para ampliar campos indexables, extender `construirIndiceBusqueda` sin mover lógica al componente `CatalogoColecciones`.
  4. Cualquier cambio en filtros/orden debe seguir resolviéndose en `resolverCatalogo` para mantener compatibilidad con tarjeta, cesta ritual y flujo `/encargo`.

## 12. Flujo ligero de encargo/consulta desde ficha (Ciclo 3 en progreso)
- Capacidad: **Conversión de ficha de colección a acción comercial sin checkout**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - ruta `frontend/app/encargo/page.tsx` para iniciar consultas ligeras con metadata propia;
  - CTA principal de ficha en `frontend/componentes/catalogo/detalle/FichaProductoCatalogo.tsx` enlazado a `/encargo?producto=<slug>`;
  - formulario y UX del flujo en `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx` + estilos encapsulados;
  - helpers puros en `frontend/contenido/catalogo/encargoConsulta.ts` para preselección, estado inicial, validación, resumen y fallback por slug inválido;
  - configuración pública de contacto y resolución de canal en `frontend/contenido/catalogo/canalContactoPublico.ts`.
- Cierre de flujo actual:
  - sin backend nuevo ni integraciones externas;
  - salida con resumen copiable de solicitud y CTA real solo si existe configuración pública legítima;
  - fallback seguro a "Copiar solicitud" cuando no hay email o WhatsApp público válido.
- Tests añadidos:
  - `frontend/tests/encargo-consulta.test.ts` cubre preselección por slug, slug inválido, entrada directa sin slug, validación y construcción de resumen.
  - `frontend/tests/encargo-canal-contacto.test.ts` cubre disponibilidad de canal, construcción de enlace y fallback sin configuración.
- Guía de ampliación controlada:
  1. Para preseleccionar desde cualquier ficha, usar query param `producto` con slug (`/encargo?producto=<slug>`).
  2. Nuevos campos del formulario deben iniciar en `construirEstadoInicialConsulta` y validarse en `validarSolicitudConsulta`.
  3. El texto final que viaja a canales externos se centraliza en `construirResumenConsulta`.
  4. La configuración pública vive en variables `NEXT_PUBLIC_CONTACT_EMAIL` y/o `NEXT_PUBLIC_CONTACT_WHATSAPP`; si no existen o son inválidas, no se expone canal.
  5. Si más adelante se conecta un canal real adicional, extender `canalContactoPublico.ts` sin duplicar la composición del mensaje ni mezclar reglas de validación en componentes grandes.

## 9. Actualización puntual — Shell comercial global (frontend)
- **Capacidad**: shell comercial global con cabecera, navegación unificada, acceso visible a cesta y footer editorial.
- **Estado**: DONE.
- **Ciclo asociado**: evolución ecommerce demo (frontend).
- **Evidencia técnica**:
  - `frontend/app/layout.tsx`
  - `frontend/componentes/shell/CabeceraComercial.tsx`
  - `frontend/componentes/shell/NavegacionPrincipal.tsx`
  - `frontend/componentes/shell/FooterComercial.tsx`
  - `frontend/contenido/shell/navegacionGlobal.ts`
  - `frontend/tests/shell-global.test.ts`
- **Notas**:
  - Ruta activa resuelta con helper tipado y `aria-current`.
  - Contador de cesta integrado en navegación global sin convertir el layout entero en componente cliente.
  - Responsive base resuelta sin dependencias nuevas ni rediseño masivo.

## 13. Página editorial de marca "La Botica" (Ciclo 3 en progreso)
- Capacidad: **Refuerzo de identidad de marca conectada al flujo comercial**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - nueva ruta pública `frontend/app/la-botica/page.tsx` con metadata propia;
  - composición en `frontend/componentes/marca/PaginaMarcaBotica.tsx` y estilos encapsulados en `frontend/componentes/marca/paginaMarcaBotica.module.css`;
  - fuente editorial tipada en `frontend/contenido/marca/contenidoMarcaBotica.ts` (hero, manifiesto, curaduría, principios, experiencia de encargo, notas de composición, FAQ y CTA);
  - integración en navegación global y footer desde `frontend/contenido/shell/navegacionGlobal.ts`.
- Tests añadidos:
  - `frontend/tests/marca-editorial.test.ts` valida bloques editoriales mínimos y CTAs de continuidad comercial;
  - `frontend/tests/shell-global.test.ts` actualizado para incluir la ruta `/la-botica` y su activación en navegación.
- Guía de ampliación controlada:
  1. Todo contenido de marca se extiende en `contenidoMarcaBotica.ts`, evitando hardcodeo largo en componentes de página.
  2. Mantener los enlaces de salida hacia `/colecciones` y `/encargo` como continuidad comercial obligatoria.
  3. Reusar shell global y patrones visuales existentes para conservar coherencia de experiencia.
