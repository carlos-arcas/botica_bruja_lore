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
- Estado de implementación funcional de producto: **Ciclos 1, 2, 3, 4 y 5 implementados en alcance comprometido**.
- Backend (dominio/aplicación/infraestructura/presentación pública): **implementado hasta capacidades de cuenta demo con historial de pedidos (Ciclo 4)**.
- Frontend (home + herbal + rituales + flujo ecommerce demo + cuenta demo): **implementado y navegable hasta cierre de Ciclo 4**.
- Backoffice/admin mínimo: **implementado para operación base herbal/ritual + pedidos demo + cuenta demo**.
- Checkout demo y confirmación/recibo: **implementados (Ciclo 3)**.
- Cuenta demo con valor (registro/auth demo, perfil, historial): **implementada (Ciclo 4)**.
- Calendario ritual: **Prompts 1–3 implementados (dominio/aplicación + persistencia/API + frontend editorial mínimo con gate)**.
- Quality gate y CI canónica: **activos** con workflow `Quality Gate` en GitHub Actions (`push` + `pull_request`).

Resumen ejecutivo de estado real: existe recorrido funcional y defendible desde exploración editorial/comercial hasta checkout/pago reales, operación física mínima y ahora cuenta real v1 con área privada y pedidos asociados, manteniendo `CuentaDemo` como legado explícito y compatible.

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
| Cuenta real v1 (`CuentaCliente`) | DONE | Evolución ecommerce real | `backend/nucleo_herbal/dominio/cuentas_cliente.py`, `backend/nucleo_herbal/presentacion/publica/views_cuentas_cliente.py`, `frontend/app/mi-cuenta/page.tsx`, `frontend/componentes/cuenta_cliente/PanelCuentaCliente.tsx`, `tests/nucleo_herbal/test_api_cuentas_cliente.py` | Registro/login/logout reales con sesión backend, pedidos asociados y coexistencia explícita con `CuentaDemo` legacy. |
| Verificación de email cuenta real v1.1 | DONE | Evolución ecommerce real | `backend/nucleo_herbal/aplicacion/casos_de_uso_cuentas_cliente.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_cuentas_cliente.py`, `backend/nucleo_herbal/presentacion/publica/views_cuentas_cliente.py`, `frontend/app/verificar-email/page.tsx`, `frontend/componentes/cuenta_cliente/PanelCuentaCliente.tsx`, `tests/nucleo_herbal/test_casos_de_uso_verificacion_email_cuenta_cliente.py`, `tests/nucleo_herbal/test_api_cuentas_cliente.py` | Registro crea cuenta no verificada, genera/verifica token seguro, permite reenvío controlado y refleja el estado en UI de cuenta real. |
| Recuperación de contraseña cuenta real v1.1 | DONE | Evolución ecommerce real | `backend/nucleo_herbal/aplicacion/casos_de_uso_cuentas_cliente.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_cuentas_cliente.py`, `backend/nucleo_herbal/presentacion/publica/views_cuentas_cliente.py`, `frontend/app/recuperar-password/page.tsx`, `frontend/componentes/cuenta_cliente/FormularioRecuperacionPassword.tsx`, `frontend/infraestructura/api/cuentasCliente.ts`, `tests/nucleo_herbal/test_casos_de_uso_recuperacion_password_cuenta_cliente.py`, `tests/nucleo_herbal/test_api_cuentas_cliente.py`, `frontend/tests/cuenta-cliente-recuperacion.test.ts` | Flujo real por email con respuesta genérica, token seguro con expiración, invalidación tras uso y UI mínima para solicitud y reset sin reabrir alcance ajeno. |
| Calendario ritual | DONE | Ciclo 5 | `backend/nucleo_herbal/dominio/calendario_ritual.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso_calendario_ritual.py`, `backend/nucleo_herbal/presentacion/publica/views.py`, `frontend/app/calendario-ritual/page.tsx`, `frontend/infraestructura/api/calendarioRitual.ts`, `frontend/tests/calendario-ritual.test.ts`, `docs/ciclos/ciclo_05_calendario_editorial.md` | Prompts 1–3 oficiales cubiertos (dominio/aplicación + persistencia/API + frontend/gate mínimo). |

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
- **Ciclo operativo vigente**: Ciclo 5 (Prompts 1–3 ejecutados).
- **Estado**: **EN_PROGRESO**.
- **Condición de continuidad aplicada**:
  1. Prompts 1–3 de Ciclo 5 implementados con separación limpia de capas;
  2. Ciclos 3 y 4 permanecen cerrados sin reapertura de alcance;
  3. ciclo técnicamente cerrable sin adelantar capacidades de ciclo siguiente.

## 8. Deuda y bloqueos conocidos
1. No se detectan bloqueos técnicos/documentales para declarar Ciclo 5 cerrable tras Prompt 3.
2. La activación de nuevas capacidades debe entrar exclusivamente por roadmap oficial siguiente, evitando frentes paralelos.

## 8.1 Transición formal demo → real
- Capacidad: **Base arquitectónica de migración ecommerce real**.
- Estado: **EN_PROGRESO**.
- Evidencia implementada:
  - contrato canónico real en `backend/nucleo_herbal/dominio/pedidos.py`;
  - adaptador anti-corrupción inicial en `backend/nucleo_herbal/aplicacion/anti_corrupcion_pedidos_demo.py`;
  - decisión documental y mapa de migración en `docs/17_migracion_ecommerce_real.md`.
- Regla activa:
  1. `PedidoDemo` queda congelado como legado controlado.
  2. Toda nueva semántica transaccional real debe entrar por `Pedido`.
  3. La retirada de rutas demo será incremental y con coexistencia temporal.

## 8.2 Pago real v1 sobre Pedido
- Capacidad: **Pago real v1 desacoplado del dominio**.
- Estado: **DONE**.
- Evidencia implementada:
  - puerto `backend/nucleo_herbal/aplicacion/puertos/pasarela_pago.py`;
  - adaptador Stripe `backend/nucleo_herbal/infraestructura/pagos_stripe.py`;
  - caso de uso `backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py`;
  - rutas `POST /api/v1/pedidos/{id_pedido}/iniciar-pago/` y `POST /api/v1/pedidos/webhooks/stripe/`;
  - frontend de continuación en `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`.
- Regla activa:
  1. El dominio sigue desacoplado de Stripe.
  2. El flujo demo legacy no se toca para cobro real.
  3. El siguiente incremento debe cerrar post-pago operativo y gestión administrativa del pedido pagado.

## 8.3 Envío estándar v1 + total real del pedido
- Capacidad: **DONE**.
- Evidencia implementada:
  - `Pedido` incorpora `metodo_envio=envio_estandar`, `importe_envio` y `total=subtotal+importe_envio`;
  - resolución desacoplada de tarifa fija configurable vía `ENVIO_ESTANDAR_IMPORTE`;
  - checkout/serialización y recibo real muestran `subtotal`, `importe_envio` y `total`;
  - el inicio de pago real y Stripe usan el **total real** (incluyendo envío) como importe final.
- Regla activa:
  1. sigue existiendo un único método `envio_estandar`;
  2. no hay selector de métodos, reglas geográficas, impuestos ni promociones en este bloque.

## 9. Próximos movimientos recomendados
1. Ejecutar validación de cierre técnico de Ciclo 5 con `python scripts/check_release_gate.py` en cada incremento posterior.
2. Preservar trazabilidad estado↔roadmap para evitar reabrir capacidades ya cerradas de Ciclos 3 y 4.
3. No abrir nuevas capacidades sin contrato explícito del siguiente ciclo.
4. Checkout real v1 en coexistencia: DONE para contrato, ruta API, persistencia y frontend dedicado sin romper el flujo demo legado.
5. Pago real v1: DONE para intención Stripe desacoplada, webhook mínimo seguro, transición `pendiente_pago` → `pagado`, decremento real de inventario al confirmar pago e idempotencia reforzada.

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

## 22. Confirmación/recibo post-checkout demo (siguiente hito oficial)
- Capacidad: **Salida pública de confirmación/recibo demo recuperable por URL tras crear `PedidoDemo`**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - nueva ruta pública de recibo en `frontend/app/pedido-demo/[id_pedido]/page.tsx` y fallback de navegación rota en `frontend/app/pedido-demo/page.tsx`;
  - componente de confirmación con estados de carga/error/vacío/éxito en `frontend/componentes/catalogo/encargo/ReciboPedidoDemo.tsx`;
  - helper de transición post-checkout en `frontend/contenido/catalogo/postCheckoutDemo.ts`;
  - cliente API ampliado con consulta `GET /api/v1/pedidos-demo/{id_pedido}/` en `frontend/infraestructura/api/pedidosDemo.ts`;
  - redirección estable desde `/encargo` al recibo tras `POST` exitoso usando `id_pedido`.
- Operaciones mínimas cerradas en este incremento:
  1. resolver traspaso checkout → confirmación con URL recuperable por `id_pedido`;
  2. consultar pedido demo existente por API y mostrar resumen mínimo con líneas;
  3. cubrir estados UX de carga, error de consulta y navegación sin id válido;
  4. mostrar copy explícito de entorno demo sin cobro real y CTA de continuidad.
- Tests añadidos:
  - `frontend/tests/checkout-demo.test.ts` ampliado con pruebas de helper post-checkout y consulta de detalle de pedido demo.
- Trazabilidad del roadmap:
  - este cambio cubre la fase de **confirmación/recibo post-checkout** del hito oficial siguiente al checkout conectado a API;
  - queda pendiente la **emisión de email/recibo demo** si se exige de forma ejecutable en el siguiente incremento operativo de ciclo.


## 23. Emisión de email demo post-pedido (hito oficial siguiente)
- Capacidad: **Composición y consulta de email demo asociado a `PedidoDemo` sin integración externa de correo**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - caso de uso de composición/consulta en `backend/nucleo_herbal/aplicacion/casos_de_uso_email_demo.py`;
  - endpoint público mínimo `GET /api/v1/pedidos-demo/{id_pedido}/email-demo/` en `backend/nucleo_herbal/presentacion/publica/views_pedidos_demo.py` + `urls_pedidos_demo.py`;
  - serialización HTTP específica en `backend/nucleo_herbal/presentacion/publica/email_demo_serializadores.py`;
  - consumo frontend en `frontend/infraestructura/api/pedidosDemo.ts` y render mínimo en `frontend/componentes/catalogo/encargo/ReciboPedidoDemo.tsx`.
- Operaciones mínimas cerradas en este incremento:
  1. componer asunto/cuerpo de email demo desde el `PedidoDemo` persistido (id, estado, email, canal, líneas y subtotal);
  2. recuperar email demo por `id_pedido` con 404 cuando no existe pedido;
  3. mostrar en recibo post-checkout una vista mínima del email demo dejando explícito que es simulación sin envío real.
- Tests añadidos:
  - `tests/nucleo_herbal/test_casos_de_uso_pedidos_demo.py` ampliado para composición de email demo y pedido inexistente;
  - `tests/nucleo_herbal/test_api_pedidos_demo.py` ampliado para endpoint de email demo existente/inexistente;
  - `frontend/tests/checkout-demo.test.ts` ampliado con consumo del endpoint de email demo.
- Trazabilidad del roadmap:
  - este cambio cubre la parte de **emisión de email/recibo demo** pendiente tras confirmación en pantalla;
  - este cierre alimenta Prompt 8 con la base funcional completa, a la espera de consolidación integral de calidad/gate.


## 24. Tests integrales y quality gate de cierre (Prompt 8 oficial Ciclo 3)
- Capacidad: **Cierre técnico de calidad del flujo ecommerce demo (`/encargo` → `PedidoDemo` → `/pedido-demo/[id_pedido]` → email demo)**.
- Estado: **DONE**.
- Implementación activa:
  - prueba integral backend del recorrido completo crear pedido → consultar detalle → consultar email demo en `tests/nucleo_herbal/test_api_pedidos_demo.py`;
  - refuerzo de contrato frontend para secuencia post-checkout de endpoints (`POST pedido`, `GET detalle`, `GET email demo`) en `frontend/tests/checkout-demo.test.ts`;
  - endurecimiento del gate canónico para incluir test contractual de checkout demo en `scripts/check_release_gate.py`;
  - alineación documental del gate en `docs/13_testing_ci_y_quality_gate.md`.
- Evidencia reproducible de cierre:
  1. `python manage.py test tests.nucleo_herbal.test_api_pedidos_demo tests.nucleo_herbal.test_casos_de_uso_pedidos_demo tests.nucleo_herbal.infraestructura.test_admin_django`
  2. `npm --prefix frontend run test:checkout-demo`
  3. `python scripts/check_release_gate.py`
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 8** del roadmap de Ciclo 3 (tests integrales + quality gate).

## 25. Cierre oficial de Ciclo 3 tras Prompt 8
- Estado del ciclo: **DONE (cierre oficial declarado)**.
- Justificación:
  1. Prompts 1–8 están implementados y trazados en este documento (dominio, persistencia, API, backoffice, checkout, confirmación/recibo, email demo y quality gate).
  2. La evidencia reproducible de cierre de Prompt 8 está en verde y valida el circuito crítico e2e del ecommerce demo.
  3. No se introdujeron features comerciales nuevas ni cambios fuera del foco de cierre de calidad.
- Evidencia consolidada:
  - `python manage.py test tests.nucleo_herbal.test_api_pedidos_demo tests.nucleo_herbal.test_casos_de_uso_pedidos_demo tests.nucleo_herbal.infraestructura.test_admin_django`;
  - `npm --prefix frontend run test:checkout-demo`;
  - `python scripts/check_release_gate.py`.
- Nota de trazabilidad histórica:
  - las secciones iniciales de este documento conservan contexto heredado de cierre de Ciclo 2; para gobierno operativo del estado actual prevalece la secuencia consolidada de secciones 17–25 (Ciclo 3 oficial).

## 26. Apertura controlada de Ciclo 4 (gobernanza, histórico)
- Estado del ciclo: **PLANIFICADO**.
- Foco único habilitado: **Cuenta de usuario con valor real**, sin reabrir alcance de ecommerce demo ya cerrado.
- Documentación oficial de apertura:
  - `docs/ciclos/ciclo_04_cuenta_valor.md` (contrato de alcance de ciclo);
  - `docs/ciclos/ciclo_04_roadmap_prompts.md` (secuencia oficial de prompts del ciclo).
- Siguiente paso oficial permitido (histórico en ese momento):
  - ejecutar **Prompt 1 del Ciclo 4** definido en el roadmap, sin implementar todavía prompts siguientes ni abrir frentes paralelos.

## 27. Base dominio/aplicación de cuenta con valor (Prompt 1 oficial Ciclo 4)
- Capacidad: **Núcleo mínimo de cuenta demo útil (autenticación demo, perfil mínimo e historial de `PedidoDemo` asociado)**.
- Estado: **DONE**.
- Implementación activa:
  - agregado y validaciones mínimas de cuenta demo en `backend/nucleo_herbal/dominio/cuentas_demo.py`;
  - casos de uso de cuenta en `backend/nucleo_herbal/aplicacion/casos_de_uso_cuentas_demo.py`;
  - puertos de cuenta e historial en `backend/nucleo_herbal/aplicacion/puertos/repositorios_cuentas_demo.py` y `backend/nucleo_herbal/aplicacion/puertos/proveedores_historial_pedidos_demo.py`;
  - DTOs de cuenta/perfil en `backend/nucleo_herbal/aplicacion/dto.py`.
- Reglas cerradas en este incremento:
  1. cuenta demo válida requiere `id_usuario`, email válido, perfil con nombre visible y credencial demo mínima;
  2. autenticación demo valida credencial contra cuenta existente (sin sesión ni integración auth real);
  3. perfil mínimo recuperable por `id_usuario`;
  4. historial de cuenta se consulta por contrato de aplicación, asociando pedidos por `id_usuario` o por email de contacto de cuenta cuando aplique migración invitado→cuenta.
- Tests añadidos:
  - `tests/nucleo_herbal/test_entidades_cuentas_demo.py`;
  - `tests/nucleo_herbal/test_casos_de_uso_cuentas_demo.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 1 del Ciclo 4** (`docs/ciclos/ciclo_04_roadmap_prompts.md`);
  - este bloque quedó posteriormente completado por prompts 2–4 dentro del mismo Ciclo 4.

## 28. Persistencia e infraestructura de cuenta demo (Prompt 2 oficial Ciclo 4)
- Capacidad: **Persistencia mínima de cuenta demo y proveedor de historial de `PedidoDemo` asociado por vínculo de cuenta**.
- Estado: **DONE**.
- Implementación activa:
  - modelo ORM `CuentaDemoModelo` y migración en `backend/nucleo_herbal/infraestructura/persistencia_django/models.py` y `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0004_cuentademomodelo.py`;
  - mapeadores dominio↔persistencia de cuenta demo en `backend/nucleo_herbal/infraestructura/persistencia_django/mapeadores.py`;
  - adaptador de repositorio de cuenta demo en `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`;
  - adaptador proveedor de historial de pedidos demo vinculado por `id_usuario` o `email_contacto` en `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`.
- Reglas cerradas en este incremento:
  1. persistencia de cuenta demo con unicidad por email y claves mínimas de perfil/credencial para autenticación demo de Prompt 1;
  2. reconstrucción de entidad de dominio `CuentaDemo` sin acoplar dominio a Django ORM;
  3. consulta de historial combinada por `id_usuario` o `email_contacto` reutilizando `PedidoDemo` existente de Ciclo 3;
  4. no se abren API, UI, sesión real ni integración total con `auth` de Django.
- Tests añadidos:
  - cobertura de repositorio de cuenta demo y proveedor de historial en `tests/nucleo_herbal/infraestructura/test_repositorios_django.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 2 del Ciclo 4** (`docs/ciclos/ciclo_04_roadmap_prompts.md`);
  - este bloque habilita Prompt 3 (API/backoffice mínimo de cuenta) como siguiente paso oficial.



## 29. API/backoffice mínimo de cuenta demo (Prompt 3 oficial Ciclo 4)
- Capacidad: **API mínima de cuenta demo con valor (registro/autenticación demo, perfil e historial de `PedidoDemo`) + soporte admin mínimo**.
- Estado: **DONE**.
- Implementación activa:
  - endpoints públicos en `backend/nucleo_herbal/presentacion/publica/urls_cuentas_demo.py` y `backend/nucleo_herbal/presentacion/publica/views_cuentas_demo.py`;
  - serialización de contrato HTTP en `backend/nucleo_herbal/presentacion/publica/cuentas_demo_serializadores.py`;
  - cableado de casos de uso de cuenta en `backend/nucleo_herbal/presentacion/publica/dependencias.py`;
  - publicación de rutas en `backend/configuracion_django/urls.py`;
  - soporte admin de cuentas demo en `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py`.
- Reglas cerradas en este incremento:
  1. autenticación demo mínima sin sesión real, cookies ni tokens productivos;
  2. perfil mínimo consultable por `id_usuario`;
  3. historial de pedidos demo vinculado por `id_usuario` y/o `email_contacto`, reutilizando contratos de `PedidoDemo` de Ciclo 3 sin reabrirlos;
  4. validación de payload en capa API, preservando invariantes de dominio/aplicación en casos de uso existentes.
- Tests añadidos/actualizados:
  - `tests/nucleo_herbal/test_api_cuentas_demo.py`;
  - `tests/nucleo_herbal/infraestructura/test_admin_django.py`.
- Evidencia reproducible:
  1. `python manage.py test tests.nucleo_herbal.test_api_cuentas_demo tests.nucleo_herbal.test_casos_de_uso_cuentas_demo tests.nucleo_herbal.infraestructura.test_admin_django`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 3 del Ciclo 4** (`docs/ciclos/ciclo_04_roadmap_prompts.md`);
  - habilita el Prompt 4 (frontend + quality gate final del ciclo) como cierre técnico del ciclo.


## 30. Frontend de cuenta demo + cierre técnico/no-regresión (Prompt 4 oficial Ciclo 4)
- Capacidad: **Área de cuenta demo navegable en frontend consumiendo API de cuenta + refuerzo de gate técnico de ciclo**.
- Estado: **DONE**.
- Implementación activa:
  - nueva ruta `/cuenta-demo` con UI mínima de registro, autenticación, perfil e historial en `frontend/app/cuenta-demo/page.tsx` y `frontend/componentes/cuenta_demo/AreaCuentaDemo.tsx`;
  - cliente API desacoplado para `CuentaDemo` en `frontend/infraestructura/api/cuentasDemo.ts`;
  - persistencia local explícita de sesión demo (sin auth real) y validaciones de formulario en `frontend/contenido/cuenta_demo/estadoCuentaDemo.ts`;
  - enlace de acceso en shell principal para navegabilidad de cuenta demo en `frontend/contenido/shell/navegacionGlobal.ts`;
  - cobertura contractual frontend para cuenta demo en `frontend/tests/cuenta-demo.test.ts`;
  - gate canónico actualizado para ejecutar test de cuenta demo en `scripts/check_release_gate.py`;
  - documentación de gate alineada en `docs/13_testing_ci_y_quality_gate.md`.
- Reglas cerradas en este incremento:
  1. cuenta demo en frontend reutiliza contratos API cerrados en Prompt 3 sin abrir auth real, cookies ni JWT;
  2. continuidad demo resuelta con estado local + `localStorage` mínimo para restaurar `id_usuario`;
  3. UX mínima cubierta para carga, error, éxito de registro/autenticación, perfil e historial vacío/con pedidos;
  4. no-regresión del foco comercial de Ciclo 3 preservada, sin cambios de contrato en `PedidoDemo`.
- Evidencia reproducible:
  1. `npm --prefix frontend run test:cuenta-demo`;
  2. `npm --prefix frontend run test:shell`;
  3. `npm --prefix frontend run build`;
  4. `python scripts/check_release_gate.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 4 del Ciclo 4** (`docs/ciclos/ciclo_04_roadmap_prompts.md`);
  - con prompts 1–4 trazados y evidencia consolidada, el **Ciclo 4 queda oficialmente cerrado**; la continuidad permitida es apertura controlada de Ciclo 5.


## 31. Cierre oficial de Ciclo 4 y apertura controlada de Ciclo 5 (gobernanza)
- Diagnóstico oficial: **A (Ciclo 4 DONE cerrable sin bloqueos)**.
- Decisión de gobierno:
  1. se declara **Ciclo 4 oficialmente cerrado** con trazabilidad en `docs/ciclos/ciclo_04_cierre_oficial.md`;
  2. se habilita apertura documental de **Ciclo 5** con foco único en calendario ritual + capa editorial diferencial;
  3. no se implementa ningún prompt de Ciclo 5 dentro de esta actualización.
- Prompt 1 oficial permitido para el siguiente incremento:
  - implementar base de dominio/aplicación de `ReglaCalendario` y casos de uso mínimos de calendario ritual conectados a `Ritual`, con tests unitarios y sin tocar checkout/cuenta.


## 32. Ciclo 5 — Prompt 1 oficial (base dominio/aplicación de calendario ritual)
- Capacidad: **Base mínima de `ReglaCalendario` + consulta temporal/editorial conectada a `Ritual`**.
- Estado: **DONE (Prompt 1)**.
- Implementación activa:
  - entidad de dominio `ReglaCalendario` con invariantes y evaluación temporal (`aplica_en`) en `backend/nucleo_herbal/dominio/calendario_ritual.py`;
  - puerto de aplicación para reglas temporales en `backend/nucleo_herbal/aplicacion/puertos/repositorios_calendario_ritual.py`;
  - caso de uso `ConsultarCalendarioRitualPorFecha` y DTOs de respuesta en `backend/nucleo_herbal/aplicacion/casos_de_uso_calendario_ritual.py` y `backend/nucleo_herbal/aplicacion/dto.py`.
- Reglas cerradas en este incremento:
  1. `ReglaCalendario` permanece separada de `Ritual` (frontera de entidades preservada).
  2. Las reglas validan rango temporal, prioridad y datos mínimos obligatorios.
  3. La consulta temporal devuelve rituales aplicables por fecha con prioridad mínima por ritual cuando coinciden múltiples reglas.
  4. Se mantiene alcance de Prompt 1 sin abrir persistencia, API ni frontend de calendario.
- Tests añadidos:
  - `tests/nucleo_herbal/test_entidades_calendario_ritual.py`;
  - `tests/nucleo_herbal/test_casos_de_uso_calendario_ritual.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 1 del Ciclo 5** (`docs/ciclos/ciclo_05_calendario_editorial.md`);
  - queda pendiente Prompt 2 (persistencia/API mínima) y Prompt 3 (integración frontend + gate de ciclo).


## 33. Ciclo 5 — Prompt 2 oficial (persistencia + API mínima de calendario ritual)
- Capacidad: **Persistencia mínima de `ReglaCalendario` + endpoint público de consulta temporal por fecha**.
- Estado: **DONE (Prompt 2)**.
- Implementación activa:
  - modelo ORM `ReglaCalendarioModelo` con rango temporal, prioridad, activación y vínculo a `RitualModelo` en `backend/nucleo_herbal/infraestructura/persistencia_django/models.py`;
  - migración de infraestructura `0005_reglacalendariomodelo.py` con `CheckConstraint` de rango e índices de consulta temporal;
  - mapeadores dominio ↔ ORM de regla en `backend/nucleo_herbal/infraestructura/persistencia_django/mapeadores.py`;
  - repositorio concreto `RepositorioReglasCalendarioORM` para `listar_vigentes_en` (filtrando activas/publicadas por fecha) en `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`;
  - endpoint público mínimo `GET /api/v1/calendario-ritual/?fecha=YYYY-MM-DD` en `backend/nucleo_herbal/presentacion/publica/views.py`, `backend/nucleo_herbal/presentacion/publica/urls_calendario_ritual.py` y `backend/configuracion_django/urls.py`.
- Reglas cerradas en este incremento:
  1. Se preserva frontera `ReglaCalendario` separada de `Ritual` en dominio e infraestructura.
  2. La API valida presencia/formato de fecha y delega reglas temporales/invariantes al núcleo de aplicación.
  3. La consulta responde lista vacía cuando no hay coincidencias y prioriza la regla de menor prioridad por ritual según Prompt 1.
  4. No se implementa frontend ni backoffice editorial del calendario (reservado para Prompt 3).
- Tests añadidos/extendidos:
  - `tests/nucleo_herbal/infraestructura/test_repositorios_django.py` (persistencia + reconstrucción + filtrado);
  - `tests/nucleo_herbal/test_exposicion_publica.py` (API calendario: con resultado, sin resultado y fecha inválida).
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 2 del Ciclo 5** (`docs/ciclos/ciclo_05_calendario_editorial.md`);
  - queda pendiente Prompt 3 (integración frontend editorial mínima + gate de ciclo).

## 34. Ciclo 5 — Prompt 3 oficial (frontend editorial mínimo + gate de ciclo)
- Capacidad: **Superficie frontend mínima de calendario ritual por fecha + no-regresión técnica del ciclo**.
- Estado: **DONE (Prompt 3)**.
- Implementación activa:
  - ruta pública `frontend/app/calendario-ritual/page.tsx` con entrada editorial mínima y navegación coherente con shell existente;
  - cliente API desacoplado `frontend/infraestructura/api/calendarioRitual.ts` para consulta `GET /api/v1/calendario-ritual/?fecha=YYYY-MM-DD`, validación básica de fecha y mapeo hacia `Ritual`;
  - componente de consulta temporal `frontend/componentes/calendario_ritual/CalendarioRitualEditorial.tsx` cubriendo carga, error, estado vacío y listado con enlace a ficha ritual;
  - shell global actualizada con acceso navegable a calendario ritual en `frontend/contenido/shell/navegacionGlobal.ts`.
- No-regresión y gate:
  - tests frontend de contrato calendario en `frontend/tests/calendario-ritual.test.ts`;
  - ajuste de regresión shell por nueva ruta en `frontend/tests/shell-global.test.ts`;
  - gate canónico reforzado con `npm run test:calendario-ritual` en `scripts/check_release_gate.py`;
  - documentación de gate alineada en `docs/13_testing_ci_y_quality_gate.md`.
- Evidencia reproducible:
  1. `npm --prefix frontend run test:calendario-ritual`;
  2. `npm --prefix frontend run test:shell`;
  3. `npm --prefix frontend run build`;
  4. `python scripts/check_release_gate.py`.
- Trazabilidad del roadmap:
  - este cambio cubre el alcance oficial del **Prompt 3 del Ciclo 5** (`docs/ciclos/ciclo_05_calendario_editorial.md`);
  - con Prompts 1–3 trazados y evidencia de no-regresión, el **Ciclo 5 queda técnicamente cerrable** (sin abrir capacidades de ciclo siguiente).


## 35. Cierre oficial de Ciclo 5 y apertura controlada de Ciclo 6 (gobernanza)
- Diagnóstico oficial: **A (Ciclo 5 DONE cerrable sin bloqueos)**.
- Decisión de gobierno:
  1. se declara **Ciclo 5 oficialmente cerrado** con trazabilidad en `docs/ciclos/ciclo_05_cierre_oficial.md`;
  2. se habilita apertura documental de **Ciclo 6** con foco único en refinamiento portfolio/business-ready sin nuevas features de negocio;
  3. no se implementa ningún prompt de Ciclo 6 dentro de esta actualización.
- Prompt 1 oficial permitido para el siguiente incremento:
  - ejecutar una auditoría integral de consistencia funcional/documental y registrar backlog priorizado de brechas críticas (arquitectura, UX de confianza y trazabilidad) sin abrir nuevos flujos funcionales.

## 36. Ciclo 6 — Prompt 1 oficial (auditoría trazable + backlog priorizado)
- Capacidad: **Auditoría integral de consistencia entre documentación, estado real y recorridos críticos con backlog priorizado de brechas**.
- Estado: **DONE (Prompt 1)**.
- Evidencia de ejecución:
  - informe de auditoría y backlog en `docs/ciclos/ciclo_06_prompt_01_auditoria_backlog.md`;
  - contraste explícito de recorridos críticos (home, catálogo, ficha, cesta/checkout demo, recibo/email demo, cuenta demo, calendario ritual y admin mínimo);
  - identificación y priorización de brechas por criticidad/tipo sin implementar nuevas features.
- Decisión de gobierno:
  1. se mantiene foco exclusivo de auditoría para Prompt 1;
  2. las correcciones quedan diferidas al Prompt 2 oficial de Ciclo 6;
  3. no se reabren ciclos cerrados (3, 4, 5) fuera de inconsistencias objetivas documentadas.
- Siguiente paso permitido:
  - ejecutar Prompt 2 de Ciclo 6 con foco único en resolver brechas críticas documentadas (consistencia contractual/naming) y su evidencia de no-regresión.

## 37. Índice editorial navegable de `/guias` con segmentación mínima (Feature 31)
- Capacidad: **Evolución del hub `/guias` hacia índice editorial filtrable y escalable sin CMS**.
- Estado: **DONE (Feature 31)**.
- Implementación activa:
  - helpers dedicados de índice y filtros en `frontend/contenido/editorial/indiceGuias.ts`;
  - `frontend/app/guias/page.tsx` ahora resuelve filtros por query (`tema`, `hub`), resume resultados y maneja estado vacío limpio;
  - reutilización de la fuente editorial existente (`guiasEditoriales`) manteniendo exclusión de borradores/no indexables.
- Segmentación aplicada:
  1. por tema editorial (`hierbas`, `rituales`, `colecciones`);
  2. por hub relacionado (`hierbas`, `rituales`, `colecciones`, `la-botica`).
- Reglas preservadas:
  1. canonical y metadata SEO del hub sin ruptura (`/guias`);
  2. continuidad de subhubs (`/guias/temas/[slug]`) y detalle (`/guias/[slug]`);
  3. separación editorial/comercial sin abrir CMS/backoffice.
- Tests añadidos/extendidos:
  - `frontend/tests/editorial-seo.test.ts` cubre filtros por tema/hub, exclusión de no indexables, combinación vacía y conteos de opciones;
  - actualización de script `frontend/package.json` (`test:editorial-seo`) para compilar el nuevo helper `contenido/editorial/indiceGuias.ts`.

## 19. Página pública Tarot editorial (Feature 33)
- Capacidad: **Sección pública `/tarot` con exploración visual de arcanos mayores**.
- Estado: **EN_PROGRESO**.
- Implementación activa:
  - nueva ruta `frontend/app/tarot/page.tsx` con metadata SEO mínima;
  - contenido reusable tipado en `frontend/contenido/tarot/arcanosTarot.ts`;
  - componentes desacoplados para listado y detalle en `frontend/componentes/tarot/`;
  - integración de assets existentes (`/fondos/fondo_pergamino.webp` + dibujos de arcanos en `/fondos/*.webp`).
- Interacción cerrada en este incremento:
  1. listado de arcanos mayores en grid responsive;
  2. selección por tarjeta (botón) con panel de detalle inline;
  3. fallback explícito cuando un `slug` no existe.
- Integración con shell global:
  - nuevo enlace "Tarot" en navegación principal y footer desde `frontend/contenido/shell/navegacionGlobal.ts`.
- Tests añadidos/ajustados:
  - `frontend/tests/tarot-contenido.test.ts` (estructura + helpers + metadata);
  - `frontend/tests/shell-global.test.ts` (enlace global a `/tarot`).


## 19. Checkout real v1 en coexistencia
- Capacidad: **Checkout real v1 en coexistencia controlada con legado demo**.
- Estado: **DONE**.
- Implementación activa:
  - contrato canónico + validación en `backend/nucleo_herbal/dominio/pedidos.py` y `backend/nucleo_herbal/presentacion/publica/payload_pedidos.py`;
  - API real en `backend/nucleo_herbal/presentacion/publica/urls_pedidos.py` y `views_pedidos.py`;
  - persistencia real en `backend/nucleo_herbal/infraestructura/persistencia_django/models_pedidos.py` y `repositorios_pedidos.py`;
  - frontend real desacoplado del demo en `frontend/app/checkout/page.tsx`, `frontend/componentes/catalogo/checkout-real/` e `frontend/infraestructura/api/pedidos.ts`.
- Regla de convivencia activa:
  1. `/api/v1/pedidos-demo/` y `/encargo` siguen como legado controlado.
  2. `/api/v1/pedidos/` y `/checkout` son el camino canónico nuevo.
  3. No se introduce PSP todavía; el estado inicial sigue siendo `pendiente_pago`.
- Siguiente bloque recomendado: **intención de pago real + transición de estados de pago** sobre el agregado `Pedido`, manteniendo la coexistencia con el legado demo hasta cerrar migración comercial completa.


## Actualización post-pago operativo v1.1
- El checkout real ya expone retornos `success` y `cancel` hacia `/pedido/[id_pedido]` con estado visible y siguiente acción recomendada.
- Cuando Stripe confirma `pagado`, el backend ejecuta un caso de uso post-pago desacoplado del webhook: persiste transición, envía email transaccional mínimo e incrementa trazabilidad operativa.
- El pedido real añade `requiere_revision_manual` y `email_post_pago_enviado` para conciliación mínima y seguimiento administrativo.
- El backoffice Next/Django ya puede listar pedidos reales y marcar el primer avance operativo `preparando` sin abrir todavía logística avanzada, fraude o devoluciones.
- Pendiente para el siguiente bloque: expedición real, tracking, incidencias, SLA operativos y automatización de estados posteriores.

## Actualización operación física y expedición v1.2
- Capacidad: **Operación física mínima post-pago con expedición y entrega**.
- Estado: **DONE**.
- Implementación activa:
  - backend real con transición `pagado -> preparando -> enviado -> entregado` y persistencia de expedición/tracking;
  - backoffice Next/Django con filtros por estado y acciones operativas para preparar, enviar y entregar;
  - email transaccional mínimo de envío y logging estructurado para hitos operativos;
  - visibilidad pública en `/pedido/[id_pedido]` del estado, tracking y mensaje de seguimiento.
- Decisión operativa explícita:
  1. `transportista` es obligatorio al marcar `enviado`;
  2. `codigo_seguimiento` también lo es salvo `envio_sin_seguimiento=True`;
  3. no se permiten saltos directos a `enviado` o `entregado` fuera de la secuencia controlada.
- Pendiente para el siguiente bloque: incidencias operativas y postventa básica (cancelación operativa acotada, reintentos logísticos y trazabilidad de incidencias) sin abrir todavía devoluciones complejas ni logística enterprise.


## 8.3 Cuenta real v1 y legado demo controlado
- Capacidad: **Cuenta real v1 usable para cliente final**.
- Estado: **DONE**.
- Evidencia implementada:
  - dominio y puertos: `backend/nucleo_herbal/dominio/cuentas_cliente.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso_cuentas_cliente.py`;
  - persistencia y auth segura: `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_cuentas_cliente.py`, migración `0018_cuenta_cliente_real_v1.py`;
  - API pública real: `backend/nucleo_herbal/presentacion/publica/views_cuentas_cliente.py`;
  - frontend canónico: `/registro`, `/acceso`, `/mi-cuenta`, `/mi-cuenta/pedidos`;
  - tests: `tests/nucleo_herbal/test_api_cuentas_cliente.py`, `tests/nucleo_herbal/test_entidades_cuentas_cliente.py`, `tests/nucleo_herbal/test_documentacion_cuenta_real_v1.py`.
- Regla activa:
  1. `CuentaDemo` queda congelada como compatibilidad demo, no como base del producto final.
  2. Todo pedido real autenticado se vincula automáticamente al usuario real.
  3. El siguiente incremento debe cerrar identidad/cliente v1.1: verificación email, recuperación de contraseña y direcciones.


## 8.4 Cuenta real v1.1 — libreta de direcciones
- Capacidad: **DONE** para libreta de direcciones autenticada de `CuentaCliente`.
- Evidencia implementada:
  - dominio/aplicación: `backend/nucleo_herbal/dominio/cuentas_cliente.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso_direcciones_cuenta_cliente.py`;
  - persistencia dedicada: `DireccionCuentaClienteModelo` + migración `0021_direcciones_cuenta_cliente.py`;
  - API pública real: `GET|POST /api/v1/cuenta/direcciones/`, `PUT|DELETE /api/v1/cuenta/direcciones/{id}/`, `POST /api/v1/cuenta/direcciones/{id}/predeterminada/`;
  - frontend canónico: `/mi-cuenta/direcciones`;
  - tests: `backend/nucleo_herbal/presentacion/tests/test_cuenta_cliente_direcciones.py` + `frontend/tests/cuenta-cliente-direcciones.test.ts`.
- Regla activa:
  1. una cuenta mantiene como máximo una dirección predeterminada activa;
  2. la primera dirección creada queda predeterminada automáticamente;
  3. si se elimina la predeterminada y quedan alternativas, se reasigna de forma determinista;
  4. la libreta queda alineada con el contrato futuro de `DireccionEntrega` y ya se integra en checkout real mediante snapshot histórico, sin referencia viva al pedido.

## 38. Inventario real v1 para productos vendibles
- Capacidad: **Base mínima de inventario real operable y persistida**.
- Estado: **DONE**.
- Evidencia implementada:
  - dominio/aplicación: `backend/nucleo_herbal/dominio/inventario.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso_inventario.py`, `backend/nucleo_herbal/aplicacion/dto_inventario.py`;
  - persistencia dedicada: `backend/nucleo_herbal/infraestructura/persistencia_django/models_inventario.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_inventario.py`, migración `0022_inventarioproductomodelo.py`;
  - backoffice/admin mínimo: `backend/nucleo_herbal/infraestructura/persistencia_django/admin_inventario.py`;
  - tests: `tests/nucleo_herbal/test_entidades_inventario.py`, `tests/nucleo_herbal/test_casos_de_uso_inventario.py`, `tests/nucleo_herbal/infraestructura/test_repositorios_django.py`, `tests/nucleo_herbal/infraestructura/test_admin_django.py`.
- Contrato operativo activo:
  1. un producto vendible puede tener como máximo un inventario asociado;
  2. la cantidad disponible nunca puede quedar en negativo;
  3. el ajuste manual de stock ya es operable en backend/admin;
  4. `bajo_stock` queda disponible como señal operativa mínima por umbral opcional;
  5. el checkout real valida stock antes de persistir `Pedido` y rechaza completo cualquier línea sin inventario o con cantidad insuficiente;
  6. el rechazo de stock sale con contrato JSON estable (`codigo=stock_no_disponible` + detalle por línea) y ya se refleja en el frontend de checkout real.
- Fuera de alcance preservado:
  - el catálogo público sigue sin exponer badges de stock;
  - no existe reserva, decremento automático, multi-almacén ni movimientos complejos.
- Quality gate ejecutado para este incremento:
  1. `pytest -q tests/nucleo_herbal/test_entidades_inventario.py tests/nucleo_herbal/test_casos_de_uso_inventario.py`;
  2. `python -m unittest tests.nucleo_herbal.infraestructura.test_repositorios_django tests.nucleo_herbal.infraestructura.test_admin_django`;
  3. `python manage.py check`;
  4. `python scripts/check_release_gate.py` **falló** por deuda preexistente de frontend en páginas con `useSearchParams()` sin `Suspense` (`/mi-cuenta`, `/mi-cuenta/pedidos`, `/recuperar-password`, `/verificar-email`).

- Prompt 08: **DONE** para exposición pública mínima de disponibilidad de stock conectada al inventario real en APIs públicas de producto, ficha Botica Natural, productos relacionados de ritual y aviso informativo en checkout real; sin reservas, decremento automático ni promesa de stock duro.

- Prompt 09: **DONE** para decremento efectivo de inventario al confirmar pago real con transacción atómica, protección idempotente ante reintentos/webhooks duplicados, incidencia operativa explícita si ya no hay stock suficiente y sin introducir reservas ni compensaciones automáticas.

- Prompt 10: **DONE** para soporte mínimo de backoffice en Django Admin sobre pedidos pagados con incidencia de stock post-pago: listado filtrable por incidencia, detalle operativo del pedido, marca explícita `incidencia_stock_revisada` con `fecha_revision_incidencia_stock` y acción manual honesta de revisión sin borrar la incidencia histórica ni automatizar reembolsos, cancelaciones o compensaciones.

- Prompt 12: **DONE** para cancelación operativa manual explícita de pedidos pagados con incidencia de stock, con acción de Django Admin restringida a estados coherentes y trazabilidad auditada (`cancelado_operativa_incidencia_stock`, `fecha_cancelacion_operativa`, `motivo_cancelacion_operativa`) sin automatizar reembolsos ni devolución de inventario.

- Prompt 13: **DONE** para reembolso manual explícito de pedidos cancelados por incidencia de stock, con acción de Django Admin, trazabilidad auditable (`estado_reembolso`, `fecha_reembolso`, `id_externo_reembolso`, `motivo_fallo_reembolso`), idempotencia para evitar dobles ejecuciones y registro de fallo PSP sin corromper el estado del pedido ni activar devoluciones de inventario o emails automáticos.

## 39. Visibilidad cliente de cancelación y reembolso (Prompt 14)
- Capacidad: **Estado visible de cancelación operativa y reembolso en pedido y mi cuenta**.
- Estado: **DONE**.
- Evidencia implementada:
  - backend expone `estado_cliente` en serialización de pedido real con `cancelado_operativamente`, `estado_reembolso` y `fecha_reembolso`;
  - frontend usa mapper único `resolverEstadoVisiblePedidoCliente` para evitar condicionales duplicados;
  - `/pedido/[id_pedido]` muestra copy sobrio de cancelación y reembolso (incluido fallback de revisión manual cuando el reembolso falla);
  - `/mi-cuenta/pedidos` refleja el resumen visible del estado de cancelación/reembolso sin abrir workflows nuevos.
- Fuera de alcance preservado:
  1. sin emails automáticos nuevos;
  2. sin formularios de soporte;
  3. sin cambios de inventario ni nuevos flujos financieros.
