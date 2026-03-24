# Roadmap incremental de cierre ecommerce real

## 0. Contexto base
- Este roadmap vivo aterriza la transición **demo sólida y creíble → ecommerce real operable** sin romper la identidad editorial-comercial definida en visión.
- El estado de partida debe trazarse contra dos fuentes activas del repositorio:
  1. `docs/17_migracion_ecommerce_real.md` (decisiones y secuencia de migración real).
  2. `docs/90_estado_implementacion.md` (estado implementado vs planificado por capacidad).
- El objetivo de este archivo es gobernar incrementos **R00-R15** con estado verificable (`PLANNED`, `IN_PROGRESS`, `PARTIAL`, `DONE`, `BLOCKED`) y evidencia concreta.
- Restricción transversal: no confundir documentación con implementación; `DONE` exige evidencia técnica verificable.

## 1. Reglas de ejecución para Codex
1. Leer y respetar `AGENTS.md` y documentación troncal antes de proponer cambios.
2. Mantener Clean Architecture estricta y separación de capas dominio/aplicación/infraestructura/presentación.
3. No abrir alcance fuera del incremento activo.
4. No declarar `DONE` sin evidencia en código/tests/docs trazables.
5. No tocar binarios/compilados prohibidos (`*.mo`, `*.pyc`, `*.sqlite3`, `*.db`, imágenes generadas, zips, pdfs binarios).
6. Preservar anclas de dominio congeladas (`Planta` y `Producto` separadas; plano editorial separado del plano comercial).
7. Mantener trazabilidad de cada incremento: objetivo, decisiones, archivos, comandos, evidencia, deuda residual, commit/PR.

## 2. Estado base verificado
### 2.1 Fotografía técnica verificada en repo
- Stack real presente: backend Django (`backend/`, `manage.py`) y frontend Next.js (`frontend/app`, `frontend/componentes`).
- El repositorio contiene dominio y casos de uso para pedidos reales, pago, inventario y cuenta cliente (`backend/nucleo_herbal/aplicacion`, `backend/nucleo_herbal/dominio`).
- Existen rutas públicas y contratos para checkout/pago real (`backend/nucleo_herbal/presentacion/publica/urls_pedidos.py`).
- Existe frontend dedicado para checkout real y recibo (`frontend/app/checkout/page.tsx`, `frontend/componentes/catalogo/checkout-real/`).
- Existe cuenta cliente real + direcciones (`frontend/app/mi-cuenta/`, `backend/nucleo_herbal/presentacion/publica/urls_cuentas_cliente.py`).
- Existe cobertura de tests orientados a ecommerce real (por ejemplo `tests/nucleo_herbal/test_api_pedidos_real.py`, `tests/nucleo_herbal/test_pago_real.py`, `backend/nucleo_herbal/presentacion/tests/test_pedidos_checkout_real_direcciones.py`).

### 2.2 Estado funcional de ecommerce real (honesto)
- **Implementado con evidencia**: base de pedido real, checkout real en coexistencia con legado demo, pago real v1 desacoplado, inventario real v1 y descuento post-pago, envío estándar v1, cuenta cliente real con verificación/recuperación y libreta de direcciones.
- **No cerrado aún como ecommerce real completo**: ledger robusto de inventario, endurecimiento completo de expedición/tracking, fiscalidad legal completa, factura/recibo legal formal, hardening operacional final.
- **Riesgo de deriva activo**: coexisten trazas demo y real; hay que seguir cerrando la migración incremental sin big bang.

## 3. Incrementos
### R00 — Bootstrap del roadmap vivo
- **Estado inicial al arrancar R00**: `IN_PROGRESS`.
- **Objetivo**: crear/actualizar este roadmap vivo y dejar fotografía base verificable del estado ecommerce real actual sin implementar negocio nuevo.
- **Contexto**: la migración demo→real está activa y requiere tablero incremental único para ejecutar cierre técnico sin deriva.
- **Dependencias**:
  - `AGENTS.md`.
  - `docs/00`, `docs/02`, `docs/05`, `docs/07`, `docs/08`, `docs/13`, `docs/17`, `docs/90`.
  - inspección del árbol real (`backend/`, `frontend/`, `tests/`, `docs/`).
- **Fuera de alcance**:
  - implementar nuevas features de checkout/pago/inventario/fiscalidad/UI.
  - refactors funcionales o de arquitectura.
  - cambios en binarios/compilados.
- **Criterios de aceptación de R00**:
  1. Existe `docs/roadmap_cierre_ecommerce_real_incremental.md` con estructura completa R00-R15.
  2. Se documenta estado base verificado con evidencia de repo (no memoria).
  3. R00 refleja estado inicial `IN_PROGRESS` y estado final real con bitácora y evidencia.
  4. No se implementan features de negocio nuevas.

**Cierre de R00 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. Usar `docs/17` + `docs/90` como eje de verdad operativa para el cierre ecommerce real.
  2. Mantener secuencia R00-R15 y marcar estado por evidencia real (`DONE`, `PARTIAL`, `PLANNED`).
  3. No tocar código de negocio; solo gobernanza documental incremental.
- **Archivos tocados**:
  - `docs/roadmap_cierre_ecommerce_real_incremental.md` (nuevo).
- **Comandos ejecutados**:
  - descubrimiento de instrucciones, lectura documental troncal, inspección de estructura y verificación puntual de evidencias en código.
- **Evidencia**:
  - archivo roadmap creado con secciones obligatorias;
  - evidencias de rutas/casos de uso/tests existentes contrastadas en repo;
  - diff sin cambios de binarios/compilados.
- **Deuda residual**:
  1. Consolidar definición exacta de unidad comercial y semántica de inventario para cierre de granel.
  2. Cerrar ledger mínimo de inventario y operación de restitución/ajustes auditables.
  3. Completar bloques fiscales/legales y observabilidad operacional de cierre.
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).
- **Siguiente incremento correcto**: **R01 — Semántica de inventario por unidad de medida**.

### R01 — Semántica de inventario por unidad de medida
- **Estado**: `DONE`.
- **Lectura actual**: el inventario real ahora persiste y valida unidad base canónica (`ud`, `g`, `ml`) con stock entero obligatorio y valor por defecto conservador `ud` para compatibilidad de registros existentes.

**Cierre de R01 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. La unidad base vive en `InventarioProducto` (dominio + persistencia) y no en `Producto`, para mantener el producto comercial desacoplado de la granularidad operativa de stock en este bloque.
  2. Se establece catálogo cerrado de unidad base (`ud`, `g`, `ml`) con validación en dominio y `CheckConstraint` en ORM.
  3. Se mantiene modelo de stock en enteros estrictos (sin floats) para cantidad disponible, umbral y ajustes.
  4. Para inventarios existentes, el default de migración es `ud` por ser el valor conservador y compatible con el estado real previo.
- **Archivos tocados**:
  - `backend/nucleo_herbal/dominio/inventario.py`
  - `backend/nucleo_herbal/aplicacion/dto_inventario.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_inventario.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models_inventario.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/mapeadores_inventario.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin_inventario.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0028_inventarioproductomodelo_unidad_base_and_more.py`
  - `tests/nucleo_herbal/test_entidades_inventario.py`
  - `tests/nucleo_herbal/test_casos_de_uso_inventario.py`
  - `tests/nucleo_herbal/infraestructura/test_repositorios_django.py`
  - `tests/nucleo_herbal/infraestructura/test_admin_django.py`
- **Comandos ejecutados**:
  - `python manage.py makemigrations persistencia_django`
  - `python manage.py test tests.nucleo_herbal.test_entidades_inventario tests.nucleo_herbal.test_casos_de_uso_inventario tests.nucleo_herbal.infraestructura.test_repositorios_django tests.nucleo_herbal.infraestructura.test_admin_django`
  - `python manage.py test tests.nucleo_herbal.test_api_pedidos_real tests.nucleo_herbal.test_api_pago_real`
  - `python manage.py check`
  - `python scripts/check_backend_readiness.py`
- **Evidencia**:
  - nueva columna persistente `unidad_base` con choices y constraint en inventario;
  - validaciones de dominio para unidad válida y enteros estrictos;
  - admin mínimo muestra/edita unidad base sin rediseño de UX;
  - tests backend de dominio, repositorio, admin y API en verde.
- **Deuda residual**:
  1. R02/R03 deben cerrar la semántica de unidad comercial por línea de pedido (aún no implementada).
  2. R06 sigue pendiente para ledger de movimientos de inventario.
  3. No se introduce aún UX pública de granel ni selector de checkout.
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R02 — Producto vendible y cantidad comercial
- **Estado**: `DONE`.
- **Lectura actual**: el producto vendible ahora expone contrato comercial explícito (`unidad_comercial`, `incremento_minimo_venta`, `cantidad_minima_compra`) con defaults conservadores y validación de integridad.

**Cierre de R02 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. La semántica comercial vive en `Producto` (dominio + ORM + DTO/serialización) para evitar un modelo paralelo y mantener una frontera única de producto vendible.
  2. Se fija catálogo cerrado de unidad comercial (`ud`, `g`, `ml`) y cantidades enteras estrictas, con reglas `> 0` para incremento/mínimo y compatibilidad por múltiplo.
  3. Se añade validación mínima de coherencia R01↔R02 en backoffice: si existe inventario persistido para el producto, `unidad_comercial` debe coincidir con `unidad_base`.
  4. Se mantienen defaults seguros para registros existentes (`ud`, `1`, `1`) mediante migración no destructiva.
- **Archivos tocados**:
  - `backend/nucleo_herbal/dominio/entidades.py`
  - `backend/nucleo_herbal/aplicacion/dto.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_rituales.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/mapeadores.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0029_productomodelo_cantidad_minima_compra_and_more.py`
  - `backend/nucleo_herbal/presentacion/publica/serializadores.py`
  - `backend/nucleo_herbal/presentacion/backoffice_views/productos.py`
  - `backend/nucleo_herbal/presentacion/backoffice_views/productos_contrato.py`
  - `tests/nucleo_herbal/test_entidades.py`
  - `tests/nucleo_herbal/test_contratos_api_publica_frontend.py`
  - `tests/nucleo_herbal/infraestructura/test_repositorios_django.py`
  - `backend/nucleo_herbal/presentacion/tests/test_backoffice_contenido.py`
- **Comandos ejecutados**:
  - `python manage.py makemigrations persistencia_django`
  - `python manage.py test tests.nucleo_herbal.test_entidades tests.nucleo_herbal.test_contratos_api_publica_frontend tests.nucleo_herbal.infraestructura.test_repositorios_django backend.nucleo_herbal.presentacion.tests.test_backoffice_contenido`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `python scripts/check_backend_readiness.py`
- **Evidencia**:
  - persistencia de semántica comercial en producto con constraints y migración compatible;
  - exposición pública/DTO/backoffice del contrato comercial sin introducir checkout granel ni cambiar línea real de pedido;
  - validaciones negativas cubiertas en dominio y backoffice (unidad inválida, incremento inválido, mínimo inválido, incompatibilidad);
  - pruebas backend relevantes en verde para dominio/repositorio/contratos/admin-backoffice tocado.
- **Deuda residual**:
  1. R03 debe trasladar el contrato de cantidad+unidad a línea de pedido real sin romper coexistencia demo.
  2. R04 debe cerrar UX/checkout granel extremo a extremo con reglas comerciales ya definidas.
  3. R06 sigue pendiente para ledger trazable de inventario.
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R03 — Línea de pedido real con cantidad + unidad
- **Estado**: `DONE`.
- **Lectura actual**: la línea real ya persiste y expone cantidad+unidad comercial (`cantidad_comercial`, `unidad_comercial`) con compatibilidad transitoria del payload legado (`cantidad`) y validación mínima contra unidad base de inventario.

**Cierre de R03 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. El agregado de pedido real migra a semántica explícita de línea (`cantidad_comercial` + `unidad_comercial`) manteniendo propiedad `cantidad` en dominio y serialización de respuesta para no romper consumidores actuales.
  2. La compatibilidad transitoria se resuelve aceptando en API tanto `cantidad_comercial` como el campo legacy `cantidad` (prioridad al nuevo cuando existe), sin abrir todavía UX pública de granel.
  3. La coherencia mínima línea↔operación se valida en checkout real contra `InventarioProducto.unidad_base`, preservando catálogo cerrado (`ud`, `g`, `ml`) y enteros estrictos.
  4. La persistencia añade columnas explícitas en línea de pedido real con migración compatible e hidratación histórica (`cantidad_comercial <- cantidad`, `unidad_comercial='ud'` por default conservador).
- **Archivos tocados**:
  - `backend/nucleo_herbal/dominio/pedidos.py`
  - `backend/nucleo_herbal/aplicacion/dto_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/payload_pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/pedidos_serializadores.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0030_lineapedidorealmodelo_cantidad_comercial_and_more.py`
  - `backend/nucleo_herbal/infraestructura/pagos_stripe.py`
  - `backend/nucleo_herbal/infraestructura/notificaciones_email.py`
  - `tests/nucleo_herbal/test_api_pedidos_real.py`
  - `tests/nucleo_herbal/test_casos_de_uso_pedidos_real.py`
  - `tests/nucleo_herbal/infraestructura/test_repositorio_pedidos_real.py`
  - `tests/nucleo_herbal/test_pago_real.py`
  - `tests/nucleo_herbal/test_operacion_pedidos_real.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/tests/test_post_pago_inventario.py`
- **Comandos ejecutados**:
  - `python manage.py makemigrations persistencia_django`
  - `python manage.py test tests.nucleo_herbal.test_api_pedidos_real tests.nucleo_herbal.test_api_pago_real tests.nucleo_herbal.test_casos_de_uso_pedidos_real tests.nucleo_herbal.infraestructura.test_repositorio_pedidos_real backend.nucleo_herbal.infraestructura.persistencia_django.tests.test_post_pago_inventario tests.nucleo_herbal.test_pago_real`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `python scripts/check_backend_readiness.py`
- **Evidencia**:
  - payload real acepta contrato nuevo y legacy;
  - respuesta y DTO exponen unidad+cantidad comercial por línea;
  - persistencia guarda ambos campos de línea con migración compatible para históricos;
  - tests de API, casos de uso, repositorio, pago y post-pago en verde.
- **Deuda residual**:
  1. R04 debe conectar UX/checkout granel explícito en frontend sin depender de fallback legacy.
  2. R05 sigue pendiente para endurecer descuento post-pago por semántica definitiva de unidad.
  3. Falta endurecer validación línea↔producto comercial (incrementos/mínimos) cuando se active flujo granel explícito.
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R04 — Checkout real compatible con granel
- **Estado**: `DONE`.
- **Lectura actual**: checkout real ya construye payload explícito por línea con `cantidad_comercial` + `unidad_comercial`, valida semántica comercial en frontend y backend (unidad, incremento y mínimo) y mantiene compatibilidad del flujo unitario sin abrir alcance adicional.

**Cierre de R04 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. El frontend converge al shape de R03 (`cantidad_comercial`, `unidad_comercial`) y deja de depender del alias legacy `cantidad` en construcción de payload real.
  2. La UX de checkout real mantiene sobriedad y añade semántica comercial visible por producto (unidad, incremento y mínimo) con validación local estricta de enteros (sin floats).
  3. La validación final de negocio se endurece en aplicación backend con un puerto mínimo dedicado a semántica comercial de producto (`unidad_comercial`, `incremento_minimo_venta`, `cantidad_minima_compra`) para no acoplar checkout a mapeos de catálogo público.
  4. Se mantiene coexistencia con flujo demo y compatibilidad transitoria de backend para payload legacy, pero el cliente real prioriza explícitamente el contrato nuevo.
- **Archivos tocados**:
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/puertos/repositorios_productos_checkout.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_productos_checkout.py`
  - `backend/nucleo_herbal/presentacion/publica/dependencias.py`
  - `tests/nucleo_herbal/test_casos_de_uso_pedidos_real.py`
  - `tests/nucleo_herbal/test_api_pedidos_real.py`
  - `frontend/contenido/catalogo/checkoutReal.ts`
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/contenido/catalogo/catalogo.ts`
  - `frontend/infraestructura/api/herbal.ts`
  - `frontend/infraestructura/api/pedidos.ts`
  - `frontend/tests/checkout-real.test.ts`
  - `frontend/tests/checkout-real-ui.test.ts`
- **Comandos ejecutados**:
  - `python manage.py test tests.nucleo_herbal.test_casos_de_uso_pedidos_real tests.nucleo_herbal.test_api_pedidos_real backend.nucleo_herbal.presentacion.tests.test_pedidos_checkout_real_direcciones`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `python scripts/check_backend_readiness.py`
  - `npm --prefix frontend run test:checkout-real`
  - `npm --prefix frontend run lint`
  - `npm --prefix frontend run build`
- **Evidencia**:
  - frontend valida cantidad comercial entera >0 y reglas de incremento/mínimo, mostrando mensajes explícitos;
  - backend rechaza creación de pedido si la línea no respeta unidad, incremento o mínimo del producto;
  - tests backend/frontend de checkout real actualizados y en verde con casos unitario y granel;
  - `check`, `makemigrations --check --dry-run`, lint y build en verde.
- **Deuda residual**:
  1. Mantener y planificar retirada gradual del alias legacy `cantidad` cuando todos los consumidores migren al shape nuevo.
  2. R05/R06 siguen pendientes para endurecimiento post-pago por unidad base definitiva y ledger mínimo de movimientos.
  3. Queda fuera de alcance en este bloque la fiscalidad, promociones, métodos de envío múltiples y logística avanzada.
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R05 — Descuento post-pago según unidad base
- **Estado**: `DONE`.
- **Lectura actual**: el descuento post-pago confirma compatibilidad explícita `cantidad_comercial` + `unidad_comercial` contra `unidad_base` de inventario, mantiene atomicidad e idempotencia y genera incidencia auditable sin tocar inventario ante falta de stock o conflicto de unidad.

**Cierre de R05 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. Endurecer el caso de uso post-pago existente sin rediseñarlo: se conserva la misma frontera transaccional e idempotente.
  2. El descuento de inventario usa explícitamente `linea.cantidad_comercial` (sin alias legacy) y nunca floats.
  3. Se añade validación operativa de compatibilidad de unidad por línea (`linea.unidad_comercial == inventario.unidad_base`) dentro del flujo post-pago antes de cualquier descuento.
  4. Cualquier incidencia (stock insuficiente, inventario ausente o unidad incompatible) corta el descuento completo: `inventario_descontado=False`, `incidencia_stock_confirmacion=True`, `requiere_revision_manual=True`.
- **Archivos tocados**:
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_post_pago_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/tests/test_post_pago_inventario.py`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/90_estado_implementacion.md`
  - `docs/17_migracion_ecommerce_real.md`
- **Comandos ejecutados**:
  - `python manage.py test backend.nucleo_herbal.infraestructura.persistencia_django.tests.test_post_pago_inventario`
  - `python manage.py test tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.test_api_pago_real`
  - `python manage.py check`
  - `python scripts/check_backend_readiness.py`
- **Evidencia**:
  - nuevo rechazo auditable por unidad incompatible con código `unidad_incompatible_confirmacion_pago`;
  - descuento post-pago explícito por `cantidad_comercial` para unitario y granel;
  - test nuevo de granel (`g`) y test de incompatibilidad de unidad sin descuento parcial;
  - idempotencia y no doble descuento mantenidos sobre webhook duplicado/reintento.
- **Deuda residual**:
  1. R06 sigue pendiente para ledger trazable de movimientos de inventario.
  2. La incidencia de unidad se registra en observaciones operativas y payload de logs; no existe aún un campo persistente específico por tipo de incidencia.
  3. No se introducen reservas previas ni devoluciones automáticas (fuera de alcance de R05).
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R06 — Ledger mínimo de movimientos de inventario
- **Estado**: `PLANNED`.
- **Lectura actual**: hoy hay marcas e incidencias mínimas, pero no ledger operativo completo de movimientos trazables.

### R07 — Page propia de inventario en backoffice Next
- **Estado**: `PARTIAL`.
- **Lectura actual**: existe operación/admin e interfaces de soporte, pero la página propia de inventario dedicada en backoffice Next debe consolidarse como capacidad cerrada.

### R08 — Restitución manual de inventario
- **Estado**: `PLANNED`.
- **Lectura actual**: existen cancelación/reembolso manuales por incidencia; restitución explícita de inventario aún no cerrada como flujo formal.

### R09 — Disponibilidad pública real para producto a granel
- **Estado**: `DONE`.
- **Lectura actual**: la disponibilidad pública mínima conectada a inventario real está documentada como implementada y visible en contratos públicos.

### R10 — Emails transaccionales reales mínimos
- **Estado**: `PARTIAL`.
- **Lectura actual**: hay piezas de notificación y estados de cuenta, pero la capa mínima de emails transaccionales reales de cierre ecommerce aún no está cerrada de forma integral.

### R11 — Fiscalidad base e importe legalmente coherente
- **Estado**: `PLANNED`.
- **Lectura actual**: existe total real con envío estándar; falta fiscalidad base legal completa.

### R12 — Factura o recibo descargable y trazable
- **Estado**: `PLANNED`.
- **Lectura actual**: existe recibo/pantalla de pedido real; falta cierre formal de documento descargable trazable con requisitos legales.

### R13 — Endurecimiento de expedición y tracking visible
- **Estado**: `PARTIAL`.
- **Lectura actual**: hay bloques operativos de expedición/incidencias, pero tracking visible y endurecimiento completo siguen abiertos.

### R14 — Observabilidad, conciliación y hardening operacional
- **Estado**: `PARTIAL`.
- **Lectura actual**: existen logging/checks y quality gate canónico, pero falta cierre integral de observabilidad/conciliación de operación real.

### R15 — Seguridad, privacidad, backups y release readiness
- **Estado**: `PLANNED`.
- **Lectura actual**: hay base de calidad y controles, pendiente hardening final de seguridad/privacidad/backups para readiness de release real.

## 4. Riesgos transversales
1. **Deriva de alcance** por coexistencia de flujo demo y real sin tablero único estricto.
2. **Semántica comercial de granel aún incompleta** (unidad/cantidad por línea de pedido), aunque la unidad base de inventario ya quedó cerrada en R01.
3. **Ausencia de ledger operativo completo** para auditoría detallada de inventario.
4. **Gap fiscal/legal** hasta cerrar R11-R12 (importe legal, documento fiscal trazable).
5. **Madurez operativa parcial** en tracking, conciliación e incident response.
6. **Riesgo de sobredeclarar DONE** por apoyarse en documentación sin validar evidencia en código/tests.

## 5. Decisiones abiertas
1. Cerrar contrato canónico de unidad comercial por línea de pedido y su acoplamiento controlado con la unidad base ya definida.
2. Elegir diseño mínimo del ledger (eventos, claves de idempotencia, origen movimiento, actor).
3. Definir alcance exacto de page/backoffice inventario Next para no duplicar admin Django.
4. Cerrar política operativa de restitución manual y su compatibilidad con cancelación/reembolso.
5. Fijar estrategia fiscal mínima legal (impuestos/moneda/redondeo) antes de factura/recibo descargable.
6. Fijar criterio de cierre R15 (checklist release readiness, backups, privacidad y seguridad aplicable).

## 6. Bitácora de ejecución
- **2026-03-24 — R00 (arranque):** estado `IN_PROGRESS`; lectura obligatoria de AGENTS + documentación troncal + inspección del repo.
- **2026-03-24 — R00 (verificación):** contraste de estado real usando `docs/17`, `docs/90`, estructura de carpetas y evidencia en rutas/casos de uso/tests.
- **2026-03-24 — R00 (cierre):** creación de roadmap vivo incremental R00-R15 y cierre `DONE` de R00 sin cambios de negocio.
- **2026-03-24 — R01 (arranque):** estado movido de `PARTIAL` a `IN_PROGRESS` antes de tocar código.
- **2026-03-24 — R01 (cierre):** unidad base explícita de inventario (`ud`, `g`, `ml`) implementada con validación dominio+ORM, migración compatible y pruebas backend relevantes en verde.
- **2026-03-24 — R02 (arranque):** estado movido de `PARTIAL` a `IN_PROGRESS` antes de implementar semántica comercial de producto vendible.
- **2026-03-24 — R02 (cierre):** contrato comercial de producto (`unidad_comercial`, `incremento_minimo_venta`, `cantidad_minima_compra`) implementado con defaults compatibles, validaciones de integridad/coherencia con inventario y pruebas backend relevantes en verde.
- **2026-03-24 — R03 (arranque):** estado movido de `PARTIAL` a `IN_PROGRESS` antes de tocar código transaccional de línea real.
- **2026-03-24 — R03 (cierre):** línea de pedido real migrada a `cantidad_comercial` + `unidad_comercial`, persistencia/migración compatible con históricos, payload legacy preservado (`cantidad`) y pruebas backend críticas en verde.
- **2026-03-24 — R04 (arranque):** estado movido de `PARTIAL` a `IN_PROGRESS` antes de tocar checkout real y validaciones comerciales.
- **2026-03-24 — R04 (cierre):** checkout real actualizado al payload nuevo (`cantidad_comercial` + `unidad_comercial`), validación frontend+backend de incremento/mínimo/unidad cerrada y pruebas de checkout real backend/frontend en verde.
- **2026-03-24 — R05 (arranque):** estado movido de `PARTIAL` a `IN_PROGRESS` antes de endurecer descuento post-pago por unidad base.
- **2026-03-24 — R05 (cierre):** descuento post-pago ajustado a `cantidad_comercial` + compatibilidad explícita de `unidad_comercial` vs `unidad_base`, con incidencia auditable y sin descuento parcial ante conflicto de stock/unidad.
