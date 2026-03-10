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
- CI automatizada de quality gate: **DONE** con workflow canónico `Quality Gate` en GitHub Actions (`push` + `pull_request`) para checks backend/frontend y validación operativa mínima.

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

## 10. Reencauce de control por ciclos (actualización de gobierno)
- Diagnóstico oficial: **C (deriva detectada)**.
- Causa de deriva: en frontend se implementaron capacidades valiosas (home comercial, catálogo/colecciones, cesta ritual local, flujo de encargo, marca y legales) que no corresponden al contrato congelado de `docs/ciclos/ciclo_03_ecommerce_demo.md` (carrito + checkout demo + pedido demo + confirmación + recibo/email).
- Decisión operativa: **no abrir nueva feature** hasta absorber documentalmente la deriva y dejar explícito el siguiente paso único del ciclo.
- Estado oficial tras reencauce:
  - Ciclo 1: **DONE**.
  - Ciclo 2: **DONE**.
  - Ciclo 3 (ecommerce demo completo): **EN_PROGRESO**, sin cierre válido todavía.
  - Microciclo de reencauce documental: **DONE** con trazabilidad en `docs/ciclos/ciclo_03_reencauce_control.md`.
- Regla activa de continuidad: todo incremento nuevo debe mapearse explícitamente a un prompt del roadmap oficial de Ciclo 3 o bloquearse por sobrealcance.

---

**Regla de lectura rápida del estado actual:**
- Ciclo 2 está técnicamente cerrado con evidencia de recorrido y quality gate mínimo operativo.
- No se detectan bloqueos externos que impidan declarar DONE dentro del contrato de este ciclo.
- El siguiente paso correcto es abrir Ciclo 3 respetando el alcance ya definido.

## 11. Actualización incremental de home (Ciclo 3 en progreso)
- Capacidad: **Home comercial + narrativa + UX ligera**.
- Estado: **EN_PROGRESO**.
- Evidencia implementada:
  - estructura de contenido mantenible centralizada en `frontend/contenido/home/contenidoHome.ts`;
  - secciones nuevas en home: hero refinado, Alquimia del Deseo, intenciones con selector, cómo elegir ritual, confianza comercial, FAQ accesible y CTA final;
  - mejoras UX: navegación por anclas, tabs de intenciones sin recarga y acordeón FAQ accesible.
- Tests añadidos para lógica de interacción de tabs/FAQ en `frontend/tests/home-interacciones.test.ts`.
- Nota operativa: la ampliación de contenido futuro debe hacerse sobre el módulo de contenido, evitando hardcodear bloques largos dentro de componentes de presentación.

## 12. Catálogo/colecciones navegables (Ciclo 3 en progreso)
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

## 13. Flujo ligero de encargo/consulta desde ficha (Ciclo 3 en progreso)
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

## 14. Actualización puntual — Shell comercial global (frontend)
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

## 15. Página editorial de marca / La Botica (Ciclo 3 en progreso)
- Capacidad: **Capa de marca sólida conectada al flujo comercial**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - nueva ruta pública `frontend/app/la-botica/page.tsx` con metadata SEO específica centralizada en contenido de marca;
  - composición en `frontend/componentes/marca/PaginaEditorialBotica.tsx` + estilos encapsulados;
  - contenido tipado y mantenible en `frontend/contenido/marca/contenidoMarca.ts`.
- Integración con shell global:
  - enlace de navegación principal y footer en `frontend/contenido/shell/navegacionGlobal.ts`.
- Tests añadidos:
  - `frontend/tests/marca-contenido.test.ts` valida bloques mínimos y CTA conectadas a catálogo/encargo;
  - `frontend/tests/shell-global.test.ts` actualizado para reflejar la nueva ruta editorial.
- Guía de ampliación controlada:
  1. Añadir o ajustar copy de marca exclusivamente en `contenidoMarca.ts`.
  2. Mantener composición declarativa en `PaginaEditorialBotica.tsx` evitando hardcodear texto largo en componentes de shell.
  3. Conservar CTA principales a `/colecciones` y `/encargo` para sostener continuidad narrativa → acción comercial.

## 16. Páginas legales/comerciales mínimas de confianza (Ciclo 3 en progreso)
- Capacidad: **Capa mínima de confianza operativa/legal en frontend**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - nuevas rutas públicas: `frontend/app/condiciones-encargo/page.tsx`, `frontend/app/envios-y-preparacion/page.tsx`, `frontend/app/privacidad/page.tsx`;
  - composición compartida en `frontend/componentes/legal/PaginaLegalComercial.tsx` con estilos encapsulados;
  - contenido tipado + metadata centralizada en `frontend/contenido/legal/paginasLegalesComerciales.ts`.
- Integración:
  - enlaces legales/comerciales incorporados al footer global mediante `frontend/contenido/shell/navegacionGlobal.ts`;
  - refuerzo contextual dentro de `/encargo` con accesos directos a condiciones, envíos y privacidad.
- Regla operativa para ampliar textos sin hardcodear:
  1. Ajustar títulos, introducción, secciones, CTA y metadata en `paginasLegalesComerciales.ts`.
  2. Mantener la presentación en `PaginaLegalComercial.tsx` sin duplicar contenido por página.
  3. Para notas dinámicas de contacto público usar `describirCanalPublico` con la configuración existente (`NEXT_PUBLIC_CONTACT_EMAIL` y `NEXT_PUBLIC_CONTACT_WHATSAPP`), preservando fallback honesto cuando no exista canal.
- Tests añadidos:
  - `frontend/tests/legal-comercial.test.ts` (estructura mínima, metadata, rutas y fallback de contacto);
  - `frontend/tests/shell-global.test.ts` actualizado para comprobar enlaces legales en footer.

## 17. Base transaccional demo de pedidos (Prompt 1 oficial Ciclo 3)
- Capacidad: **Núcleo dominio/aplicación para `PedidoDemo` y `LineaPedido`**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - agregado y reglas de dominio en `backend/nucleo_herbal/dominio/pedidos_demo.py`;
  - casos de uso mínimos en `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos_demo.py`;
  - DTOs transaccionales demo en `backend/nucleo_herbal/aplicacion/dto.py`.
- Reglas cerradas en este incremento:
  1. `PedidoDemo` requiere identificador, email, canal válido y al menos una línea.
  2. `LineaPedido` valida snapshot mínimo (producto, cantidad > 0, precio demo >= 0).
  3. Normalización de líneas repetidas con rechazo de snapshot inconsistente (nombre/precio distinto para mismo producto).
  4. Subtotal demo calculable por línea y por pedido en núcleo desacoplado de framework.
- Tests añadidos:
  - `tests/nucleo_herbal/test_entidades_pedidos_demo.py`;
  - `tests/nucleo_herbal/test_casos_de_uso_pedidos_demo.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance del **Prompt 1** (base dominio/aplicación transaccional demo);
  - queda pendiente Prompt 2 (persistencia/infraestructura), sin adelantar API/backoffice/checkout UI.

## 18. Persistencia e infraestructura de pedidos demo (Prompt 2 oficial Ciclo 3)
- Capacidad: **Persistencia mínima de `PedidoDemo` y `LineaPedido` con repositorio ORM y mapeo dominio↔persistencia**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - puerto de repositorio transaccional en `backend/nucleo_herbal/aplicacion/puertos/repositorios_pedidos_demo.py`;
  - modelos ORM y migración de esquema para pedido demo y líneas en `backend/nucleo_herbal/infraestructura/persistencia_django/models.py` y `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0003_pedidodemomodelo_lineapedidomodelo.py`;
  - mapeo de reconstrucción de agregado y snapshot de líneas en `backend/nucleo_herbal/infraestructura/persistencia_django/mapeadores.py`;
  - repositorio concreto en `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`.
- Operaciones mínimas cerradas en este incremento:
  1. guardar/actualizar agregado `PedidoDemo` con reemplazo consistente de líneas snapshot;
  2. obtener pedido demo por identificador con reconstrucción del agregado;
  3. actualizar estado demo y reconstruir agregado resultante.
- Integración mínima con aplicación:
  - nuevo caso de uso `RegistrarPedidoDemo` en `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos_demo.py` para orquestar construcción + persistencia sin acoplar dominio al ORM.
- Tests añadidos:
  - integración ORM en `tests/nucleo_herbal/infraestructura/test_repositorios_django.py` para guardado, reconstrucción, líneas, importes y estado/canal;
  - integración aplicación↔puerto en `tests/nucleo_herbal/test_casos_de_uso_pedidos_demo.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 2** (persistencia/infraestructura);
  - sigue pendiente Prompt 3 (API del flujo), sin adelantar endpoints ni UI checkout.

## 19. API del flujo de pedido demo (Prompt 3 oficial Ciclo 3)
- Capacidad: **Exposición API mínima para crear y consultar `PedidoDemo`**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - endpoints en `backend/nucleo_herbal/presentacion/publica/urls_pedidos_demo.py` y `backend/nucleo_herbal/presentacion/publica/views_pedidos_demo.py`;
  - serialización HTTP de pedido demo en `backend/nucleo_herbal/presentacion/publica/pedidos_demo_serializadores.py`;
  - cableado de casos de uso para pedidos demo en `backend/nucleo_herbal/presentacion/publica/dependencias.py`;
  - recuperación por identificador en aplicación mediante `ObtenerPedidoDemoPorId` en `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos_demo.py`.
- Operaciones mínimas cerradas en este incremento:
  1. crear pedido demo por API con validación de forma/tipos básicos;
  2. recuperar pedido demo por identificador;
  3. devolver contrato de respuesta mínimo (`id_pedido`, `estado`, `canal`, `email`, `resumen`, `lineas`).
- Tests añadidos:
  - `tests/nucleo_herbal/test_api_pedidos_demo.py` (creación válida, payload inválido, línea inválida, autenticado sin usuario, consulta existente e inexistente).
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 3** (API del flujo);
  - sigue pendiente Prompt 4 (backoffice mínimo), sin adelantar frontend checkout, confirmación/email ni pagos.

## 20. Backoffice mínimo de pedidos demo (Prompt 4 oficial Ciclo 3)
- Capacidad: **Backoffice/admin mínimo para consulta y gestión operativa básica de `PedidoDemo`**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - registro de `PedidoDemoModelo` en Django Admin con listado operativo en `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py`;
  - inline de `LineaPedidoModelo` en detalle de pedido demo para visualizar snapshot de líneas;
  - filtros mínimos de backoffice por estado/canal y búsqueda por id/email de pedido demo.
- Operaciones mínimas cerradas en este incremento:
  1. listar pedidos demo con campos operativos (`id_pedido`, `email_contacto`, `canal_compra`, `estado`, número de líneas, fecha);
  2. consultar detalle de pedido demo con lectura de líneas snapshot;
  3. actualizar estado de pedido demo desde admin (edición individual de `estado`).
- Tests añadidos:
  - `tests/nucleo_herbal/infraestructura/test_admin_django.py` ampliado con cobertura de registro de modelo, changelist de pedidos demo, búsqueda/filtro y edición de estado desde detalle.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 4** (backoffice mínimo de pedidos demo);
  - sigue pendiente Prompt 5 (frontend de carrito), sin adelantar checkout público, confirmación/email ni pagos reales.

## 21. Checkout público demo conectado a API (Prompt 5 oficial Ciclo 3)
- Capacidad: **Conexión mínima del flujo público `/encargo` con la API de `PedidoDemo` para envío real de pedido demo**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - helper de checkout demo para construir payload y validación mínima en `frontend/contenido/catalogo/checkoutDemo.ts`;
  - cliente API desacoplado para creación de pedido demo en `frontend/infraestructura/api/pedidosDemo.ts`;
  - integración UX de envío/resultado en `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx`, reutilizando preselección desde ficha/cesta.
- Operaciones mínimas cerradas en este incremento:
  1. transformar selección de producto/cesta en `lineas` del contrato `/api/v1/pedidos-demo/`;
  2. enviar pedido demo público con canal invitado o autenticado (demo) y tratar respuesta inmediata;
  3. mostrar estados mínimos de carga, error y éxito inmediato en UI sin invadir confirmación final/recibo.
- Tests añadidos:
  - `frontend/tests/checkout-demo.test.ts` (payload, validación, éxito API y error de API/red).
- Trazabilidad del roadmap:
  - este cambio cubre el alcance funcional solicitado para **checkout público demo mínimo conectado a API**;
  - sigue pendiente la fase de confirmación final/recibo/email demo del siguiente hito del ciclo.
