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
- **Estado**: `PARTIAL`.
- **Lectura actual**: existe base de inventario real por producto y validación de disponibilidad, pero falta cerrar semántica explícita por unidad base/comercial para granel.

### R02 — Producto vendible y cantidad comercial
- **Estado**: `PARTIAL`.
- **Lectura actual**: hay producto vendible y checkout real funcional; pendiente endurecer contrato formal de cantidad comercial por unidad en todo el flujo.

### R03 — Línea de pedido real con cantidad + unidad
- **Estado**: `PARTIAL`.
- **Lectura actual**: líneas de pedido real existen; pendiente cierre normativo completo cantidad+unidad para granel con trazabilidad homogénea.

### R04 — Checkout real compatible con granel
- **Estado**: `PARTIAL`.
- **Lectura actual**: checkout real en coexistencia ya implementado; pendiente endurecimiento específico de reglas granel extremo a extremo.

### R05 — Descuento post-pago según unidad base
- **Estado**: `PARTIAL`.
- **Lectura actual**: el descuento post-pago real existe e idempotente; pendiente cierre explícito contra unidad base comercial definitiva.

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
2. **Semántica incompleta de granel** (unidad/cantidad) con riesgo de inconsistencias en inventario, pedido y post-pago.
3. **Ausencia de ledger operativo completo** para auditoría detallada de inventario.
4. **Gap fiscal/legal** hasta cerrar R11-R12 (importe legal, documento fiscal trazable).
5. **Madurez operativa parcial** en tracking, conciliación e incident response.
6. **Riesgo de sobredeclarar DONE** por apoyarse en documentación sin validar evidencia en código/tests.

## 5. Decisiones abiertas
1. Definir contrato canónico de unidad base vs unidad comercial para granel y su impacto en inventario/pedido.
2. Elegir diseño mínimo del ledger (eventos, claves de idempotencia, origen movimiento, actor).
3. Definir alcance exacto de page/backoffice inventario Next para no duplicar admin Django.
4. Cerrar política operativa de restitución manual y su compatibilidad con cancelación/reembolso.
5. Fijar estrategia fiscal mínima legal (impuestos/moneda/redondeo) antes de factura/recibo descargable.
6. Fijar criterio de cierre R15 (checklist release readiness, backups, privacidad y seguridad aplicable).

## 6. Bitácora de ejecución
- **2026-03-24 — R00 (arranque):** estado `IN_PROGRESS`; lectura obligatoria de AGENTS + documentación troncal + inspección del repo.
- **2026-03-24 — R00 (verificación):** contraste de estado real usando `docs/17`, `docs/90`, estructura de carpetas y evidencia en rutas/casos de uso/tests.
- **2026-03-24 — R00 (cierre):** creación de roadmap vivo incremental R00-R15 y cierre `DONE` de R00 sin cambios de negocio.
