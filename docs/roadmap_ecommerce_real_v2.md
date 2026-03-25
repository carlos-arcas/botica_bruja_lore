# Roadmap de madurez ecommerce real V2

## 0. Contexto heredado desde V1
- Este documento abre una nueva fase de madurez **V2** posterior al cierre incremental V1 (`docs/roadmap_cierre_ecommerce_real_incremental.md`).
- V1 se considera marco de cierre de transición demo→real y no debe reabrirse salvo bug real o incumplimiento verificable de contrato.
- V2 no reemplaza V1: lo toma como baseline operativo y organiza la madurez siguiente en operación, postventa, fiscalidad avanzada, observabilidad, automatización y cumplimiento.

### Estado del incremento activo al arranque
- `V2-R00`: **IN_PROGRESS**.
- Motivo: bootstrap documental del roadmap vivo V2 con auditoría de estado heredado y priorización ejecutable sin implementar negocio nuevo.

## 1. Principios y reglas de ejecución V2
1. Separación estricta entre **cerrado en V1** y **madurez incremental V2**.
2. No declarar `DONE` sin evidencia verificable (código, tests, checks, docs vivas).
3. No reabrir capacidades V1 ya cerradas salvo:
   - bug real confirmado,
   - deuda explícita arrastrada en este documento,
   - cambio regulatorio/operativo con trazabilidad.
4. Mantener Clean Architecture, separación editorial/comercial y contratos de dominio congelados (`Planta` ≠ `Producto`, `ReglaCalendario` ≠ `Ritual`).
5. V2 prioriza robustez operativa y gobernanza de ecommerce real **sin mezclar wishlist fuera de estado real del repo**.
6. Cada incremento V2 debe registrar: estado, objetivo, dependencias, fuera de alcance, evidencia mínima, deuda residual.

## 2. Estado base heredado

### 2.1 Capacidades cerradas en V1 (no reabrir salvo bug real)
Con base en `docs/17_migracion_ecommerce_real.md`, `docs/90_estado_implementacion.md` y el roadmap de cierre V1:
- Checkout real v1 en coexistencia con flujo demo legacy.
- Pago real v1 desacoplado (Stripe) con webhook e idempotencia.
- Inventario real v1 + descuento post-pago y ledger mínimo de movimientos.
- Semántica comercial de producto/línea para unitario y granel básico.
- Cuenta cliente real (registro/login/sesión), verificación email, recuperación password y libreta de direcciones.
- Envío estándar v1 con total real del pedido.

### 2.2 Deudas residuales razonables que pasan a V2
- Operación de backups automatizable y restore drill repetible.
- Endurecimiento de checks de conciliación (migrar parte informativa a bloqueante según evidencia operativa).
- Marco mínimo formal de devoluciones/postventa y coordinación con restitución/reembolso.
- Fiscalidad avanzada y evolución de documento fiscal/factura más formal.
- Observabilidad operativa y alertas accionables.
- Automatización de tareas operativas reintentables (sin perder control manual).
- Seguridad/ACL y checklist de go-live v2 ampliado.

### 2.3 Qué no debe reabrirse en V2 por defecto
- Rediseñar checkout real base, cuenta real base o migración demo→real ya cerrada.
- Reescribir contratos V1 ya estabilizados sin evidencia de fallo real.
- Mezclar cambios de negocio nuevos no exigidos por madurez operativa.

### 2.4 Auditoría verificable del estado heredado (evidencia repo)
Activos reutilizables para V2, verificados en árbol real del repositorio:
- Scripts de gate/readiness/operación: `scripts/check_release_gate.py`, `scripts/check_release_readiness.py`, `scripts/check_operational_reconciliation.py`, `scripts/check_repo_operational_integrity.py`, `scripts/check_backend_readiness.py`, `scripts/bootstrap_demo_release.py`.
- Contratos/rutas públicas reales y legacy coexistentes: `backend/nucleo_herbal/presentacion/publica/urls_pedidos.py`, `urls_pedidos_demo.py`, `views_pago_pedidos.py`, `views_pedidos.py`, `views_cuentas_cliente.py`.
- Cobertura de pruebas relevante para operación real: `tests/nucleo_herbal/test_api_pedidos_real.py`, `test_api_pago_real.py`, `test_operacion_pedidos_real.py`, `test_contrato_ecommerce_real.py`, `test_contratos_api_publica_demo_frontend.py`, `test_contratos_api_publica_frontend.py`, `test_deploy_guards.py`.

## 3. Líneas maestras de V2
Se adopta esta clasificación por trazabilidad con el estado real y deudas explícitas:
1. **Operación y resiliencia**: backup/restore, conciliación y disciplina operativa.
2. **Postventa y devoluciones**: marco mínimo manual, restitución/reembolso coordinados.
3. **Fiscalidad avanzada**: reglas y documento fiscal más formal.
4. **Observabilidad y automatización**: alertas operativas y jobs reintentables con control.
5. **Seguridad y release readiness ampliado**: ACL, endurecimiento y checklist de salida.

> Justificación: estas líneas reflejan huecos de madurez detectados tras V1, reutilizan scripts/checks ya existentes y evitan abrir features comerciales nuevas en este bootstrap.

## 4. Incrementos V2

### V2-R00 — Bootstrap del roadmap de madurez V2
- **Estado**: `DONE`.
- **Objetivo**: crear roadmap vivo V2, separar V1/V2 y dejar priorización ejecutable sustentada en estado real.
- **Dependencias**: `AGENTS.md`, docs troncales y auditoría de evidencias en repo.
- **Fuera de alcance**: implementación de nuevas features de negocio.
- **Resultado**:
  - roadmap V2 creado;
  - separación explícita de capacidades cerradas vs deuda heredada;
  - siguiente incremento priorizado con dependencias y exclusiones.

### V2-R01 — Operación real v2: backups automatizables y restore drill
- **Estado inicial**: `PLANNED` (**siguiente incremento correcto**).
- **Por qué va primero**: reduce riesgo operativo sistémico antes de ampliar postventa/fiscalidad/automatización.
- **Dependencias**: readiness actual, documentación de release, entorno operativo mínimo.
- **Fuera de alcance inmediato**: cambios funcionales de checkout/pagos/inventario.

### V2-R02 — Endurecimiento de conciliación: pasar checks críticos a bloqueantes donde proceda
- **Estado**: `PLANNED`.
- **Dependencias**: resultados de V2-R01 + señales reales de incidencias.
- **Nota**: endurecimiento por evidencia, no por endurecer “a ciegas”.

### V2-R03 — Devoluciones/postventa v2: marco mínimo de devolución manual
- **Estado**: `PLANNED`.
- **Dependencias**: conciliación más fiable y criterios operativos base.

### V2-R04 — Restitución y reembolso coordinados: coherencia operativa
- **Estado**: `PLANNED`.
- **Dependencias**: V2-R03 y contratos claros de estados de pedido/pago/reembolso.

### V2-R05 — Fiscalidad avanzada v2
- **Estado**: `PLANNED`.
- **Dependencias**: postventa mínima estable + base operativa robusta.

### V2-R06 — Documento fiscal v2 / factura más formal
- **Estado**: `PLANNED`.
- **Dependencias**: V2-R05.

### V2-R07 — Observabilidad y alertas operativas v2
- **Estado**: `PLANNED`.
- **Dependencias**: señales y eventos relevantes estabilizados en bloques anteriores.

### V2-R08 — Automatización de tareas operativas reintentables
- **Estado**: `PLANNED`.
- **Dependencias**: observabilidad base (V2-R07) + criterios de idempotencia operativa.

### V2-R09 — Seguridad y ACL v2
- **Estado**: `PLANNED`.
- **Dependencias**: mapa de operaciones v2 y roles reales.

### V2-R10 — Go-live checklist v2
- **Estado**: `PLANNED`.
- **Dependencias**: consolidación de R01–R09.

## 5. Riesgos transversales V2
1. Reabrir capacidades V1 cerradas sin bug real → deriva y retrabajo.
2. Endurecer controles sin observabilidad útil → falsos bloqueos operativos.
3. Automatizar demasiado pronto sin idempotencia/rollback claro.
4. Extender fiscalidad/documento fiscal sin base postventa consistente.
5. Mezclar roadmap de madurez con nuevas features comerciales fuera de alcance.

## 6. Decisiones abiertas V2
1. Qué checks de conciliación pasan a bloqueantes en R02 y con qué umbral de falsos positivos tolerable.
2. Modelo mínimo de devolución manual en R03 (campos, estados, actor responsable, SLA operativo).
3. Alcance fiscal exacto de R05 según jurisdicción objetivo (sin sobre-implementar).
4. Nivel mínimo obligatorio de alertas en R07 antes de automatizar en R08.
5. Matriz de roles/ACL mínima útil para R09 sin inflar complejidad de backoffice.

## 7. Bitácora de ejecución V2

### Entrada V2-R00
- **Estado final**: `DONE`.
- **Resumen de decisiones**:
  1. V2 se separa explícitamente de V1 como fase de madurez posterior.
  2. Se fija R01 como siguiente incremento correcto por resiliencia operativa.
  3. Se limita R00 a gobernanza documental sin cambios de negocio.
- **Archivos tocados**:
  - `docs/roadmap_ecommerce_real_v2.md` (nuevo).
- **Comandos ejecutados**:
  - lectura documental obligatoria: `cat AGENTS.md` y revisión de docs troncales (`docs/00`, `02`, `05`, `07`, `08`, `13`, `17`, `90`, roadmap cierre V1) con `sed -n`.
  - auditoría de estado repo: `rg --files docs | sort`, `rg --files scripts | sort`, `rg --files tests/nucleo_herbal | sort`, `rg --files backend/nucleo_herbal/presentacion/publica | sort`.
  - validación mínima: `test -f docs/roadmap_ecommerce_real_v2.md`, `git status --short`.
- **Evidencia**:
  - archivo V2 creado y estructurado;
  - auditoría sustentada en artefactos reales del repositorio;
  - sin implementación de features nuevas.
- **Deuda residual**:
  1. Ejecutar V2-R01 (backups + restore drill).
  2. Definir endurecimiento progresivo de conciliación en V2-R02.
- **Commit/PR**: ver registro al cierre de esta ejecución.
