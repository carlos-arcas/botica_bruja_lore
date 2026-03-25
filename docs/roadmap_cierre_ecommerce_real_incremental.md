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
- **Estado**: `DONE`.
- **Lectura actual**: el inventario mantiene la fuente de verdad operativa en `nucleo_inventario_producto` y ahora queda acompañado por ledger auditable mínimo en `nucleo_movimiento_inventario`.

**Cierre de R06 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. Mantener `InventarioProducto` como fuente operativa de stock y añadir `MovimientoInventario` como traza de auditoría, sin recalcular stock histórico desde movimientos.
  2. Cerrar catálogo mínimo de tipos de movimiento: `alta_inicial`, `ajuste_manual`, `descuento_pago`, `restitucion_manual` (reservado para R08).
  3. Registrar movimientos en tres operaciones reales: alta inicial de inventario, ajuste manual y descuento post-pago exitoso.
  4. Reutilizar idempotencia existente del post-pago y reforzar ledger con unicidad condicional por `(inventario, tipo_movimiento, operation_id)` para no duplicar `descuento_pago` en reintentos.
- **Archivos tocados**:
  - `backend/nucleo_herbal/dominio/inventario_movimientos.py`
  - `backend/nucleo_herbal/aplicacion/puertos/repositorios_movimientos_inventario.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_inventario.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_post_pago_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models_inventario.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/mapeadores_inventario.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_inventario.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin_inventario.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models.py`
  - `backend/nucleo_herbal/presentacion/publica/dependencias.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0031_movimientoinventariomodelo.py`
  - `tests/nucleo_herbal/test_casos_de_uso_inventario.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/tests/test_post_pago_inventario.py`
  - `tests/nucleo_herbal/infraestructura/test_repositorios_django.py`
  - `tests/nucleo_herbal/infraestructura/test_admin_django.py`
- **Comandos ejecutados**:
  - `python manage.py makemigrations persistencia_django`
  - `python manage.py test tests.nucleo_herbal.test_casos_de_uso_inventario backend.nucleo_herbal.infraestructura.persistencia_django.tests.test_post_pago_inventario tests.nucleo_herbal.infraestructura.test_repositorios_django tests.nucleo_herbal.infraestructura.test_admin_django tests.nucleo_herbal.test_pago_real`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `python scripts/check_backend_readiness.py`
- **Evidencia**:
  - nueva tabla de ledger con constraints de cantidad no cero, unidad/tipo válidos e índices operativos;
  - alta inicial y ajuste manual generan movimiento en capa de aplicación;
  - descuento post-pago exitoso genera `descuento_pago` y no deja trazas espurias cuando hay incidencia;
  - reintentos idempotentes de webhook no duplican descuento ni movimiento.
- **Deuda residual**:
  1. `restitucion_manual` queda tipado y persistible, pero su operación explícita se mantiene para R08.
  2. El ajuste manual automático por edición directa en admin no se prueba de forma end-to-end (se cubre visibilidad del inline y trazas desde casos de uso/repositorios).
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R07 — Page propia de inventario en backoffice Next
- **Estado**: `DONE`.
- **Lectura actual**: el backoffice Next ya incorpora página propia de inventario (`/admin/inventario`) para operación diaria mínima (listado, detalle, ajuste manual y ledger visible) con backend como fuente de verdad y Django Admin preservado como soporte/fallback.

**Cierre de R07 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. Reutilizar patrón de backoffice existente (`/api/v1/backoffice/*` + BFF proxy Next + sesión staff) sin crear micro-backoffice paralelo.
  2. Exponer API privada mínima de inventario con cuatro operaciones: listado, detalle, ajuste manual y consulta de últimos movimientos.
  3. Mantener invariantes R01-R06 en backend (enteros, unidad base canónica y rechazo de stock negativo) y registrar ajustes vía ledger `ajuste_manual`.
  4. Mantener Django Admin de inventario como superficie de soporte y consolidar Next como superficie operativa principal para este bloque.
- **Archivos tocados**:
  - `backend/nucleo_herbal/presentacion/backoffice_views/inventario.py`
  - `backend/nucleo_herbal/presentacion/backoffice_views/__init__.py`
  - `backend/nucleo_herbal/presentacion/backoffice_urls.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_inventario.py`
  - `backend/nucleo_herbal/aplicacion/dto_inventario.py`
  - `backend/nucleo_herbal/aplicacion/puertos/repositorios_movimientos_inventario.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_inventario.py`
  - `backend/nucleo_herbal/presentacion/tests/test_backoffice_inventario.py`
  - `tests/nucleo_herbal/test_casos_de_uso_inventario.py`
  - `tests/nucleo_herbal/infraestructura/test_repositorios_django.py`
  - `frontend/app/admin/(panel)/inventario/page.tsx`
  - `frontend/componentes/admin/ModuloInventarioAdmin.tsx`
  - `frontend/infraestructura/api/backoffice.ts`
  - `frontend/infraestructura/configuracion/modulosAdmin.ts`
  - `frontend/tests/backoffice-inventario-ui.test.ts`
  - `docs/90_estado_implementacion.md`
  - `docs/17_migracion_ecommerce_real.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
- **Comandos ejecutados**:
  - `python manage.py test backend.nucleo_herbal.presentacion.tests.test_backoffice_inventario tests.nucleo_herbal.test_casos_de_uso_inventario tests.nucleo_herbal.infraestructura.test_repositorios_django`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `python scripts/check_backend_readiness.py`
  - `npm --prefix frontend run clean:tmp-tests && (cd frontend && npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/backoffice-inventario-ui.test.ts infraestructura/api/backoffice.ts infraestructura/configuracion/modulosAdmin.ts componentes/admin/enlacesAdmin.ts && node .tmp-tests/tests/backoffice-inventario-ui.test.js)`
  - `npm --prefix frontend run test:backoffice-rituales-nav`
  - `npm --prefix frontend run test:backoffice-flujos`
  - `npm --prefix frontend run lint`
  - `npm --prefix frontend run build`
- **Evidencia**:
  - nueva ruta Next de backoffice `/admin/inventario` integrada en navegación existente;
  - listado operativo muestra producto, unidad base, stock, umbral, estado bajo stock y fecha de actualización;
  - ajuste manual real desde Next consume endpoint privado, respeta validaciones de dominio y actualiza ledger;
  - detalle de inventario muestra ledger mínimo (tipo, cantidad, unidad, fecha) sin dashboard analítico.
- **Deuda residual**:
  1. R08 sigue pendiente para flujo explícito de `restitucion_manual`.
  2. El ledger visible de R07 no incluye filtros avanzados ni paginación (fuera de alcance).
  3. No se abre aún multi-almacén, lotes/caducidad ni reporting avanzado.
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R08 — Restitución manual de inventario
- **Estado**: `DONE`.
- **Lectura actual**: existe operación explícita de restitución manual de inventario con elegibilidad conservadora, idempotencia, ajuste de stock y ledger `restitucion_manual` auditable desde Django Admin de pedidos.

**Cierre de R08 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. Reutilizar la superficie operativa ya existente (Django Admin de `PedidoReal`) para evitar duplicar UX entre Admin y Next backoffice en este bloque.
  2. Introducir trazabilidad explícita en `Pedido` para la operación (`inventario_restituido`, `fecha_restitucion_inventario`) y resolver idempotencia de negocio sin heurísticas sobre el ledger.
  3. Política de elegibilidad conservadora y explícita:
     - pedido con `inventario_descontado=True`;
     - pedido en `estado=cancelado` y `cancelado_operativa_incidencia_stock=True`;
     - sin restitución previa (`inventario_restituido=False`);
     - rechazo explícito para cualquier estado no elegible o sin descuento previo.
  4. Restitución transaccional por líneas:
     - suma `cantidad_comercial` en `InventarioProducto` validando unidad (`unidad_comercial == unidad_base`);
     - registra movimiento `restitucion_manual` por línea con `operation_id` determinista para no duplicar trazas ante reintentos.
  5. Sin automatismos nuevos: no se activa restitución automática al cancelar/reembolsar, no se tocan emails ni checkout público.
- **Archivos tocados**:
  - `backend/nucleo_herbal/dominio/pedidos.py`
  - `backend/nucleo_herbal/aplicacion/dto_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_backoffice_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0032_pedidorealmodelo_fecha_restitucion_inventario_and_more.py`
  - `tests/nucleo_herbal/test_operacion_pedidos_real.py`
  - `tests/nucleo_herbal/infraestructura/test_repositorio_pedidos_real.py`
  - `tests/nucleo_herbal/infraestructura/test_repositorios_django.py`
  - `tests/nucleo_herbal/infraestructura/test_admin_django.py`
  - `docs/90_estado_implementacion.md`
  - `docs/17_migracion_ecommerce_real.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
- **Comandos ejecutados**:
  - `python manage.py makemigrations persistencia_django`
  - `python manage.py test tests.nucleo_herbal.test_operacion_pedidos_real tests.nucleo_herbal.infraestructura.test_repositorio_pedidos_real tests.nucleo_herbal.infraestructura.test_repositorios_django tests.nucleo_herbal.infraestructura.test_admin_django backend.nucleo_herbal.infraestructura.persistencia_django.tests.test_post_pago_inventario tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.test_api_pago_real`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `python scripts/check_backend_readiness.py`
- **Evidencia**:
  - nueva acción admin `restituir_inventario_manual`;
  - stock operativo incrementado con cantidad comercial por línea en pedidos elegibles;
  - ledger guarda `restitucion_manual` con referencia al pedido y sin duplicados por `operation_id`;
  - rechazos auditables en intentos inválidos e idempotencia en reintento.
- **Deuda residual**:
  1. No existe todavía una acción equivalente en backoffice Next de pedidos (se mantiene Admin como superficie operativa única en R08).
  2. No se automatiza restitución en cancelación/reembolso (se mantiene manual por diseño en este incremento).
  3. No se añade reporting avanzado ni flujos de devoluciones complejas.
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R09 — Disponibilidad pública real para producto a granel
- **Estado**: `DONE`.
- **Lectura actual**: la disponibilidad pública de producto/ritual ahora conserva una única fuente de verdad (inventario real + semántica comercial de `Producto`) y el frontend público muestra estado + unidad + incremento mínimo sin prometer reserva.

**Cierre de R09 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. Reutilizar la fuente existente `resolver_disponibilidad_publica` en backend (sin segunda capa paralela), reforzando solo contratos y cobertura de tests.
  2. Mantener contrato público mínimo consistente en herbal y rituales: `disponible`, `estado_disponibilidad`, `unidad_comercial`, `incremento_minimo_venta`, `cantidad_minima_compra`.
  3. Extender la normalización frontend de rituales para no perder semántica comercial al mapear productos relacionados.
  4. Reforzar UI pública sin rediseño global: el bloque de disponibilidad ahora muestra unidad comercial (cuando no es `ud`) e incremento mínimo cuando aplica.
  5. Mantener copy sobrio y explícito sobre no-reserva: el frontend informa; backend valida stock y reglas al crear pedido.
- **Archivos tocados**:
  - `backend/nucleo_herbal/presentacion/tests/test_publico_producto_detalle.py`
  - `tests/nucleo_herbal/test_exposicion_publica.py`
  - `frontend/infraestructura/api/rituales.ts`
  - `frontend/componentes/catalogo/disponibilidad/EstadoDisponibilidadProducto.tsx`
  - `frontend/componentes/rituales/detalle/BloqueResolucionComercialRitual.tsx`
  - `frontend/tests/rituales-disponibilidad-contrato.test.ts`
  - `frontend/tests/botica-natural.test.ts`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/90_estado_implementacion.md`
- **Comandos ejecutados**:
  - `python manage.py test backend.nucleo_herbal.presentacion.tests.test_publico_producto_detalle tests.nucleo_herbal.test_exposicion_publica`
  - `npm --prefix frontend run test:botica-natural`
  - `npm --prefix frontend run test:rituales-disponibilidad`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `python scripts/check_backend_readiness.py`
  - `npm --prefix frontend run lint`
  - `npm --prefix frontend run build`
- **Evidencia**:
  - tests backend cubren casos explícitos de disponibilidad con inventario ausente y stock cero, además de serialización de unidad/incremento en detalle público y productos relacionados de ritual;
  - frontend ritual ya consume y conserva `unidad_comercial`/`incremento_minimo_venta`/`cantidad_minima_compra` desde API real;
  - superficies públicas de ficha y relaciones muestran estado de disponibilidad más semántica comercial útil para granel;
  - `makemigrations --check --dry-run` confirma sin deuda de migraciones.
- **Deuda residual**:
  1. El frontend todavía no introduce selector público completo de gramos/ml (deliberadamente fuera de alcance de R09).
  2. La garantía definitiva de stock sigue estando sólo en validación backend de checkout (diseño esperado).
  3. No se abre stock duro público ni reserva temporal.
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R10 — Emails transaccionales reales mínimos
- **Estado**: `DONE`.
- **Lectura actual**: la capa mínima de emails transaccionales reales queda cerrada para los cuatro eventos operativos estabilizados (pagado, enviado, cancelación operativa por incidencia de stock y reembolso manual ejecutado) sin mezclarla con el flujo demo legacy.

**Cierre de R10 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. Reutilizar el puerto y adaptador de notificación existentes (`NotificadorPostPagoPedido` + `NotificadorEmailPostPago`) para evitar un segundo sistema de correo paralelo.
  2. Mantener la composición de copy en infraestructura (`notificaciones_email.py`) y fuera de views, con contenido sobrio y orientado al estado real del pedido.
  3. Extender trazabilidad mínima con banderas persistentes por evento sensible a duplicado/reintento (`email_cancelacion_enviado`, `email_reembolso_enviado` + fechas).
  4. Acoplar envío de correo a casos de uso operativos reales (post-pago ya existente, `MarcarPedidoEnviado`, `CancelarPedidoOperativoPorIncidenciaStock`, `ReembolsarPedidoCanceladoPorIncidenciaStock`) con manejo explícito de error sin corromper el pedido.
  5. Preservar separación demo vs real: no se toca `casos_de_uso_email_demo.py` ni rutas `/api/v1/pedidos-demo/*`.
- **Archivos tocados**:
  - `backend/nucleo_herbal/aplicacion/puertos/notificador_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_backoffice_pedidos.py`
  - `backend/nucleo_herbal/dominio/pedidos.py`
  - `backend/nucleo_herbal/infraestructura/notificaciones_email.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0033_pedidorealmodelo_email_cancelacion_enviado_and_more.py`
  - `tests/nucleo_herbal/test_operacion_pedidos_real.py`
  - `tests/nucleo_herbal/test_notificaciones_email_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/tests/test_post_pago_inventario.py`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
- **Comandos ejecutados**:
  - `python manage.py makemigrations persistencia_django`
  - `python manage.py test tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.test_operacion_pedidos_real tests.nucleo_herbal.test_api_pago_real tests.nucleo_herbal.test_notificaciones_email_pedidos backend.nucleo_herbal.infraestructura.persistencia_django.tests.test_post_pago_inventario`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `python scripts/check_backend_readiness.py`
- **Evidencia**:
  - eventos reales cubiertos con envío en adaptador único y copy mínimo no marketing;
  - idempotencia de envío reforzada en cancelación/reembolso con flags persistentes y validación de no duplicación en tests;
  - errores de envío tratados como no bloqueantes para consistencia de estado de pedido;
  - migración aplicada solo para flags mínimos nuevos (sin artefactos prohibidos).
- **Deuda residual**:
  1. No existe mail-log enterprise (deliberado fuera de alcance); se conserva trazabilidad mínima por bandera+fecha.
  2. No se añade plantilla HTML ni branding avanzado de correo (fuera de alcance de R10).
  3. No se abren campañas/newsletter/CRM ni nuevos canales de comunicación.
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R11 — Fiscalidad base e importe legalmente coherente
- **Estado**: `DONE`.
- **Lectura actual**: el pedido real ahora calcula y expone base imponible, tipo impositivo, importe de impuestos y total final con redondeo monetario canónico en dominio; checkout, detalle y pago usan el mismo total fiscal coherente.

**Cierre de R11 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. Se mantiene la política fiscal mínima explícita ya activa en R11 (IVA general fijo 21%) y se evita abrir motor fiscal avanzado.
  2. Se endurece la coherencia de cobro real: Stripe convierte importes a céntimos con helper único y redondeo `ROUND_HALF_UP` (sin división float en normalización/consulta de estado).
  3. Se elimina cálculo fiscal ad-hoc en checkout real y se centraliza un helper de desglose visible (`subtotal`, `envío`, `base imponible`, `impuestos`, `total`) para reducir contradicciones de UI.
  4. Se refuerza cobertura con tests backend/frontend de redondeo y visualización del desglose.
- **Archivos tocados**:
  - `backend/nucleo_herbal/infraestructura/pagos_stripe.py`
  - `tests/nucleo_herbal/test_pago_real.py`
  - `frontend/contenido/catalogo/checkoutReal.ts`
  - `frontend/contenido/catalogo/fiscalidadCheckout.ts`
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/tests/checkout-real.test.ts`
  - `frontend/tests/checkout-real-ui.test.ts`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
- **Comandos ejecutados**:
  - `python manage.py test tests.nucleo_herbal.test_contrato_ecommerce_real tests.nucleo_herbal.test_casos_de_uso_pedidos_real tests.nucleo_herbal.test_api_pedidos_real tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.test_api_pago_real`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `python scripts/check_backend_readiness.py`
  - `npm --prefix frontend run test:checkout-real`
  - `npm --prefix frontend run lint`
  - `npm --prefix frontend run build`
- **Evidencia**:
  - pasarela Stripe genera `unit_amount` y normaliza `amount_total` mediante helpers deterministas de céntimos/Decimal;
  - checkout real muestra subtotal, envío, base imponible, impuestos y total con cálculo centralizado;
  - suite backend/frontend del bloque en verde y sin migraciones pendientes.
- **Deuda residual**:
  1. Política fiscal única (IVA 21%) sigue deliberadamente limitada a esta fase.
  2. Quedan fuera OSS/IOSS, multi-país, exenciones específicas y promoción fiscal.
  3. R12 mantiene pendiente el documento fiscal descargable legalmente trazable.
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R12 — Factura o recibo descargable y trazable
- **Estado**: `DONE`.
- **Lectura actual**: pedido real expone documento HTML descargable y trazable generado en runtime desde datos canónicos del pedido (sin binarios versionados en repo).

**Cierre de R12 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. Priorizar **HTML descargable/imprimible** frente a PDF dinámico para cumplir restricciones del repo (sin binarios), mantener simplicidad operativa y evitar dependencias frágiles de renderizado.
  2. Reutilizar el **pedido real como única fuente de verdad** (DTO + serialización existente), sin abrir un segundo modelo documental ni recalcular importes por fuera del dominio/aplicación.
  3. Añadir endpoint mínimo dedicado de documento (`/api/v1/pedidos/{id_pedido}/documento/`) con descarga `attachment` y trazabilidad operativa mínima por log estructurado.
  4. Exponer acceso al documento desde superficies existentes y naturales: detalle de pedido real (`/pedido/[id_pedido]`) y listado de pedidos en cuenta (`/mi-cuenta/pedidos`).
- **Archivos tocados**:
  - `backend/nucleo_herbal/presentacion/publica/documento_pedido_html.py`
  - `backend/nucleo_herbal/presentacion/publica/views_pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/urls_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/dto_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/pedidos_serializadores.py`
  - `tests/nucleo_herbal/test_api_pedidos_real.py`
  - `frontend/app/api/pedidos/[id_pedido]/documento/route.ts`
  - `frontend/infraestructura/api/pedidos.ts`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/componentes/cuenta_cliente/PanelCuentaCliente.tsx`
  - `frontend/tests/checkout-real-ui.test.ts`
  - `frontend/tests/pedido-real-operacion-ui.test.ts`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/90_estado_implementacion.md`
- **Comandos ejecutados**:
  - `python manage.py test tests.nucleo_herbal.test_api_pedidos_real`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `npm --prefix frontend run test:checkout-real`
  - `npm --prefix frontend run lint`
  - `npm --prefix frontend run build`
  - `python scripts/check_release_gate.py`
- **Evidencia**:
  - ruta de documento descargable operativa y visible en build de Next (`/api/pedidos/[id_pedido]/documento`);
  - respuesta HTML con `Content-Disposition` attachment y contenido mínimo (líneas, subtotal, envío, impuestos, total, estado y estado cliente cancelación/reembolso);
  - tests backend cubren contrato del documento, coherencia de importes, visibilidad de cancelación/reembolso y 404;
  - tests frontend validan visibilidad del enlace de descarga en recibo real y en listado de pedidos de cuenta.
- **Deuda residual**:
  1. El documento es recibo mínimo operativo; no cubre facturación legal enterprise ni series fiscales complejas.
  2. El endpoint mantiene el mismo esquema de acceso que el detalle público de pedido real; endurecimiento adicional de ACL queda para hardening posterior.
  3. No se añade envío por email de adjunto ni firma electrónica (fuera de alcance).
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R13 — Endurecimiento de expedición y tracking visible
- **Estado**: `DONE`.
- **Lectura actual**: la expedición real mantiene secuencia operativa mínima estable y ahora cliente/backoffice/documento consumen un criterio de tracking visible coherente (con tracking, sin tracking público o pendiente real) sin abrir integraciones avanzadas.

**Cierre de R13 (resultado real de esta ejecución)**
- **Estado final**: `DONE`.
- **Decisiones clave**:
  1. No se rehace la base logística existente: se conserva el agregado `Pedido` con estados `preparando → enviado → entregado` y validación de `transportista` + (`codigo_seguimiento` o `envio_sin_seguimiento`).
  2. El gap real cerrado fue de visibilidad/coherencia cliente: el detalle de pedido y “Mi cuenta” no daban un mensaje explícito cuando había envío sin tracking público o tracking aún no informado.
  3. Se centraliza un resolver de tracking visible en frontend (`resolverTrackingVisibleCliente`) para reutilizar copy y evitar contradicciones entre superficies de cliente.
  4. El documento descargable pasa a reflejar estado de expedición/tracking para alinear operación interna con lo que ve cliente.
- **Archivos tocados**:
  - `frontend/contenido/pedidos/trackingVisible.ts`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/componentes/cuenta_cliente/PanelCuentaCliente.tsx`
  - `frontend/infraestructura/api/cuentasCliente.ts`
  - `frontend/tests/pedido-real-operacion-ui.test.ts`
  - `frontend/tests/tracking-visible.test.ts`
  - `backend/nucleo_herbal/presentacion/publica/documento_pedido_html.py`
  - `tests/nucleo_herbal/test_api_pedidos_real.py`
- **Comandos ejecutados**:
  - `python manage.py test tests.nucleo_herbal.test_api_pedidos_real tests.nucleo_herbal.test_api_backoffice tests.nucleo_herbal.test_operacion_pedidos_real`
  - `cd frontend && npm run test:checkout-real`
  - `cd frontend && npm run test:cuenta-cliente`
  - `cd frontend && npm run clean:tmp-tests && tsc --module commonjs --target es2020 --skipLibCheck --outDir .tmp-tests tests/tracking-visible.test.ts contenido/pedidos/trackingVisible.ts && node .tmp-tests/tests/tracking-visible.test.js`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `npm --prefix frontend run lint`
  - `npm --prefix frontend run build`
  - `python scripts/check_release_gate.py`
- **Evidencia**:
  - frontend cliente ya comunica tres estados de tracking visibles: disponible, envío sin tracking público y tracking no informado/pendiente según estado de pedido;
  - documento HTML descargable incorpora bloque de expedición coherente con estado real del pedido;
  - pruebas backend cubren serialización documental de tracking y envío sin tracking público;
  - pruebas frontend cubren helper de tracking visible y no rompen checkout/cuenta existentes.
- **Deuda residual**:
  1. Sigue fuera de alcance integración automática con APIs de transportistas y actualización de hitos en tiempo real.
  2. No se abre multi-envío por pedido ni SLA logístico enterprise.
  3. El test textual de UI (`pedido-real-operacion-ui`) se mantiene como smoke test estructural; cobertura E2E visual queda para hardening posterior.
- **Commit/PR**: registrado al final de esta ejecución (ver sección 6 y bitácora).

### R14 — Observabilidad, conciliación y hardening operacional
- **Estado**: `PARTIAL`.
- **Lectura actual**: existen logging/checks y quality gate canónico, pero falta cierre integral de observabilidad/conciliación de operación real.

### R15 — Seguridad, privacidad, backups y release readiness
- **Estado**: `PLANNED`.
- **Lectura actual**: hay base de calidad y controles, pendiente hardening final de seguridad/privacidad/backups para readiness de release real.

## 4. Riesgos transversales
1. **Deriva de alcance** por coexistencia de flujo demo y real sin tablero único estricto.
2. **Semántica comercial de granel aún incompleta** (unidad/cantidad por línea de pedido), aunque la unidad base de inventario ya quedó cerrada en R01.
3. **Riesgo de deriva del ledger** si operaciones futuras de inventario no registran movimiento en el catálogo cerrado.
4. **Gap fiscal/legal residual** limitado a facturación enterprise/multi-país; recibo trazable mínimo ya cerrado en R12.
5. **Madurez operativa parcial** en tracking, conciliación e incident response.
6. **Riesgo de sobredeclarar DONE** por apoyarse en documentación sin validar evidencia en código/tests.

## 5. Decisiones abiertas
1. Cerrar contrato canónico de unidad comercial por línea de pedido y su acoplamiento controlado con la unidad base ya definida.
2. Extender R08 con caso de uso de `restitucion_manual` conectado al ledger ya introducido.
3. Definir alcance exacto de page/backoffice inventario Next para no duplicar admin Django.
4. Cerrar política operativa de restitución manual y su compatibilidad con cancelación/reembolso.
5. Definir si el endurecimiento de acceso al documento de pedido se tratará en R14 o R15.
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

- **2026-03-24 — R06 (arranque):** estado movido de `PLANNED` a `IN_PROGRESS` antes de implementar ledger mínimo.
- **2026-03-24 — R06 (cierre):** ledger mínimo de inventario implementado y trazado para alta inicial, ajuste manual y descuento post-pago con idempotencia y visibilidad en Django Admin.
- **2026-03-24 — R07 (arranque):** estado movido de `PARTIAL` a `IN_PROGRESS` antes de implementar page propia de inventario en backoffice Next.
- **2026-03-24 — R07 (cierre):** page propia de inventario en backoffice Next cerrada con listado operativo, ajuste manual y ledger mínimo visible sobre API privada staff.
- **2026-03-24 — R08 (arranque):** estado movido de `PLANNED` a `IN_PROGRESS` antes de implementar restitución manual de inventario.
- **2026-03-24 — R08 (cierre):** restitución manual de inventario cerrada con elegibilidad explícita, acción operativa en Django Admin, ajuste de stock, ledger `restitucion_manual`, idempotencia y tests backend relevantes en verde.
- **2026-03-25 — R09 (arranque):** estado movido de `DONE` a `IN_PROGRESS` para auditar brecha real de disponibilidad pública unitario/granel y ajustar contrato/UI sin duplicar fuentes.
- **2026-03-25 — R09 (cierre):** disponibilidad pública cerrada como `DONE` con contrato consistente herbal/rituales (estado + unidad + incremento + mínimo), UI pública sobria en ficha/relaciones y tests backend/frontend relevantes en verde.
- **2026-03-25 — R10 (arranque):** estado movido de `PARTIAL` a `IN_PROGRESS` antes de auditar e implementar capa mínima real de emails transaccionales.
- **2026-03-25 — R10 (cierre):** emails transaccionales reales mínimos cerrados como `DONE` para pagado, enviado, cancelación operativa y reembolso manual ejecutado, con idempotencia mínima por flags persistentes y tests backend relevantes en verde.
- **2026-03-25 — R11 (arranque):** estado movido de `PLANNED` a `IN_PROGRESS` antes de tocar aritmética real de pedido/pago/serialización.
- **2026-03-25 — R11 (cierre):** fiscalidad base mínima cerrada como `DONE` con política explícita de IVA 21%, desglose fiscal en pedido/checkout/recibo, pago alineado al total fiscal y pruebas backend/frontend relevantes en verde.
- **2026-03-25 — R11 (reapertura técnica):** estado movido temporalmente de `DONE` a `IN_PROGRESS` para hardening de redondeo en pasarela Stripe y consolidación de desglose visible en checkout.
- **2026-03-25 — R11 (cierre hardening):** R11 vuelve a `DONE` con conversión a céntimos/Decimal sin floats en pasarela, helper fiscal visible reutilizable en frontend y tests de regresión backend/frontend en verde.
- **2026-03-25 — R12 (arranque):** estado movido de `PLANNED` a `IN_PROGRESS` antes de implementar documento descargable trazable.
- **2026-03-25 — R12 (cierre):** recibo HTML descargable/imprimible implementado desde pedido real canónico, acceso visible en detalle y mi cuenta, tests backend/frontend en verde y gate canónico superado.
- **2026-03-25 — R13 (arranque):** estado movido de `PARTIAL` a `IN_PROGRESS` para auditar brecha real de tracking visible entre backoffice, detalle cliente, mi cuenta y documento descargable.
- **2026-03-25 — R13 (cierre):** tracking visible endurecido como `DONE` con resolver frontend reutilizable, copy honesta para envío sin tracking público, documento descargable alineado con expedición y tests backend/frontend relevantes en verde.
