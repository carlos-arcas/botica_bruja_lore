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
- **Estado final**: `DONE`.
- **Por qué va primero**: reduce riesgo operativo sistémico antes de ampliar postventa/fiscalidad/automatización.
- **Dependencias**: readiness actual, documentación de release, entorno operativo mínimo.
- **Fuera de alcance inmediato**: cambios funcionales de checkout/pagos/inventario.

### V2-R02 — Endurecimiento de conciliación: pasar checks críticos a bloqueantes donde proceda
- **Estado**: `DONE`.
- **Dependencias**: resultados de V2-R01 + señales reales de incidencias.
- **Nota**: endurecimiento por evidencia, no por endurecer “a ciegas”.

### V2-R03 — Devoluciones/postventa v2: marco mínimo de devolución manual
- **Estado**: `DONE`.
- **Dependencias**: conciliación más fiable y criterios operativos base.
- **Resultado real**: marco mínimo manual y auditable de devoluciones sobre pedido real, con elegibilidad base, transiciones controladas y operación en Django Admin sin automatizar reembolso ni restitución.

### V2-R04 — Restitución y reembolso coordinados: coherencia operativa
- **Estado**: `DONE`.
- **Dependencias**: V2-R03 y contratos claros de estados de pedido/pago/reembolso.
- **Resultado real**: coordinación mínima explícita entre devolución aceptada, estado de reembolso manual, estado de restitución manual y resolución operativa, visible y accionable desde Django Admin sin automatismos por defecto.

### V2-R05 — Fiscalidad avanzada v2 por producto y cálculo por línea
- **Estado**: `DONE`.
- **Dependencias**: postventa mínima estable + base operativa robusta.
- **Resultado real**: tipología fiscal explícita en producto (`iva_general`/`iva_reducido`) y cálculo fiscal por línea persistido en pedido real con coherencia checkout↔pedido↔Stripe↔documento.

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

### Entrada V2-R01
- **Estado final**: `DONE`.
- **Resumen de decisiones**:
  1. Reutilizar patrón existente de scripts operativos Python (`scripts/`) en lugar de introducir tooling externo.
  2. Implementar backup lógico y restore drill mínimo en un único entrypoint (`backup` / `restore-drill`) con configuración por entorno y logging no sensible.
  3. Establecer `--dry-run` como modo verificable explícito cuando no hay entorno seguro para restauración real.
  4. Endurecer release readiness para exigir trazas documentales del flujo automatizable de backup/restore.
- **Archivos tocados**:
  - `scripts/backup_restore_postgres.py`
  - `tests/scripts/test_backup_restore_postgres.py`
  - `scripts/check_release_readiness.py`
  - `docs/release_readiness_minima.md`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_real_v2.md`
- **Comandos ejecutados**:
  - `python manage.py test tests.scripts.test_backup_restore_postgres tests.scripts.test_check_release_readiness`
  - `python manage.py check`
  - `python scripts/check_release_readiness.py`
  - `python scripts/check_release_gate.py`
  - `python scripts/backup_restore_postgres.py backup --dry-run --backup-dir /tmp/botica_backups --database-url postgresql://user:secret@localhost:5432/botica`
  - `python scripts/backup_restore_postgres.py restore-drill --dry-run --restore-database-url postgresql://user:secret@localhost:5432/botica_restore --dump-file /tmp/botica_backups/restore_drill_sample.dump`
- **Evidencia**:
  - existe comando automatizable y repetible para backup lógico con convenciones operativas explícitas;
  - existe base verificable de restore drill con límites claros para runners sin DB temporal real;
  - documentación de release pasa de “solo comando manual” a flujo accionable con script reutilizable + fallback manual;
  - tests y checks operativos relevantes ejecutados en esta sesión.
- **Deuda residual**:
  1. Falta ejecutar restore drill real programado en entorno con base temporal dedicada y credenciales operativas (fuera de este runner).
  2. Scheduler y retención/rotación de backups siguen fuera de alcance (se mantienen para incrementos futuros).
- **Commit/PR**: registrado al cierre de esta ejecución.


### Entrada V2-R02
- **Estado final**: `DONE`.
- **Resumen de decisiones**:
  1. Se endurece la conciliación solo con reglas de bajo falso positivo: pago sin descuento/ incidencia, reembolso ejecutado incoherente, restitución sin ledger y contradicciones duras de expedición/reembolso-email.
  2. Se separan explícitamente severidades operativas (`BLOCKER`, `WARNING`, `INFO`, `SKIP`) y se mantiene compatibilidad del flag legacy `--fail-on error` como alias de `blocker`.
  3. El gate canónico deja de ejecutar conciliación informativa y pasa a bloquear únicamente por `BLOCKER` (`--fail-on blocker`), dejando warnings visibles sin romper release.
- **Archivos tocados**:
  - `scripts/check_operational_reconciliation.py`
  - `scripts/check_release_gate.py`
  - `tests/scripts/test_check_operational_reconciliation.py`
  - `tests/scripts/test_check_release_gate_reconciliation.py`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/release_readiness_minima.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_real_v2.md`
- **Comandos ejecutados**:
  - `python manage.py test tests.scripts.test_check_operational_reconciliation tests.scripts.test_check_release_gate_reconciliation tests.scripts.test_check_release_gate_snapshot`
  - `python manage.py test tests.scripts`
  - `python manage.py check`
  - `python scripts/check_operational_reconciliation.py --fail-on warning --json`
  - `python scripts/check_release_gate.py`
- **Evidencia**:
  - la salida JSON de conciliación ahora publica matriz de severidad reusable para automatización (`matriz_severidad`);
  - se añaden pruebas para reglas bloqueantes y warnings, además de integración del bloque H en gate;
  - el gate refleja explícitamente que conciliación es bloqueante solo por críticos (`BLOCKER`).
- **Deuda residual**:
  1. Ajustar severidades con métricas reales de incidencia por al menos un ciclo operativo completo para validar tasa de falsos positivos.
  2. Revisar en R03/R04 si nuevas transiciones de postventa requieren expandir la matriz sin degradar legibilidad.
- **Commit/PR**: registrado al cierre de esta ejecución.

### Entrada V2-R03
- **Estado final**: `DONE`.
- **Resumen de decisiones**:
  1. Se implementa una entidad dedicada `DevolucionPedidoModelo` vinculada a `PedidoRealModelo` para no sobrecargar el agregado de pedido con un CRM paralelo.
  2. La elegibilidad mínima de apertura se acota a pedidos reales `enviado|entregado` con `estado_pago=pagado` y sin cancelación operativa por incidencia de stock.
  3. Las transiciones de estado se endurecen con matriz explícita (`abierta`, `recibida`, `aceptada`, `rechazada`, `cerrada`) y rechazo de saltos inválidos.
  4. La superficie operativa elegida es Django Admin (coste mínimo/coherencia con operación actual) con listado, alta manual, acciones de transición y trazabilidad por actor.
  5. Se deja explícito el límite del incremento: sin automatización de reembolsos, sin restitución automática de inventario y sin emails automáticos de devolución.
- **Archivos tocados**:
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0035_devolucionpedidomodelo.py`
  - `tests/nucleo_herbal/infraestructura/test_devoluciones_postventa.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_real_v2.md`
- **Comandos ejecutados**:
  - `python manage.py makemigrations persistencia_django`
  - `python manage.py test tests.nucleo_herbal.infraestructura.test_devoluciones_postventa tests.nucleo_herbal.infraestructura.test_admin_django`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `python scripts/check_release_gate.py`
- **Evidencia**:
  - la devolución manual persiste ligada a pedido real con fecha de apertura, motivo, estado y actor;
  - la apertura rechaza pedidos no elegibles por estado/pago;
  - las transiciones inválidas son bloqueadas por validación de modelo y las válidas quedan operables desde admin;
  - logging operativo mínimo añadido para apertura/transición/rechazo en acciones de admin.
- **Deuda residual**:
  1. Coordinar en V2-R04 la política explícita de cuándo una devolución aceptada habilita reembolso manual y restitución manual sin automatizar por defecto.
  2. Evaluar si conviene exponer esta operativa en backoffice Next cuando el volumen de operación supere el flujo mínimo de Django Admin.
- **Commit/PR**: registrado al final de esta ejecución (hash y PR en el reporte de entrega).

### Entrada V2-R04
- **Estado final**: `DONE` (se inició en `IN_PROGRESS` al arrancar la ejecución).
- **Resumen de decisiones**:
  1. No se introduce un workflow nuevo: la coordinación se deriva de la devolución (`aceptada`) + marcas existentes del pedido (`estado_reembolso`, `inventario_restituido`).
  2. `DevolucionPedidoModelo` expone semántica operativa mínima y auditables (`reembolso_operativo`, `restitucion_operativa`, `esta_resuelta_operativamente`) sin duplicar flags persistidos.
  3. Django Admin de devoluciones muestra el resumen operativo (pendiente/resuelta/no_aplica) y permite lanzar reembolso/restitución manual cuando corresponde, reutilizando casos de uso ya existentes.
  4. Se añade logging estructurado en acciones coordinadas (ejecución y rechazo) con foco operativo.
- **Archivos tocados**:
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos.py`
  - `tests/nucleo_herbal/infraestructura/test_devoluciones_postventa.py`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/90_estado_implementacion.md`
- **Comandos ejecutados**:
  - `python manage.py test tests.nucleo_herbal.infraestructura.test_devoluciones_postventa tests.nucleo_herbal.infraestructura.test_admin_django tests.nucleo_herbal.infraestructura.test_repositorio_pedidos_real`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `python scripts/check_release_gate.py`
- **Evidencia**:
  - una devolución aceptada ya permite leer explícitamente si falta reembolso, falta restitución o si la devolución quedó resuelta operativamente;
  - acciones admin coordinadas reutilizan casos de uso manuales existentes y omiten devoluciones no elegibles;
  - tests cubren combinaciones obligatorias de estado (pendiente parcial / resuelta) y no regresión de operativa previa.
- **Deuda residual**:
  1. Los casos de uso de reembolso/restitución siguen acotados al contrato operativo actual de pedidos cancelados por incidencia; una evolución de política requerirá un bloque dedicado.
  2. No hay automatización de cierre de devolución al resolverse operativamente (se mantiene intencionalmente manual para V2).
- **Commit/PR**: registrado al final de esta ejecución (hash y PR en el reporte de entrega).


### Entrada V2-R05
- **Estado final**: `DONE`.
- **Resumen de decisiones**:
  1. Se mantiene el alcance fiscal de fase España/base sin abrir multi-país: catálogo cerrado de tipo fiscal por producto (`iva_general`, `iva_reducido`) con mapping determinista a porcentaje en dominio.
  2. El cálculo fiscal del pedido pasa a composición por línea (`importe_impuestos` por línea) + envío, preservando `Decimal` y `ROUND_HALF_UP` como estrategia única.
  3. Se persiste snapshot fiscal de línea en pedido real (`tipo_impositivo`, `importe_impuestos`) para trazabilidad documental y postventa sin recomputar contra catálogo mutable.
  4. Stripe deja de usar una única línea global de impuestos y pasa a impuestos por línea + envío, alineado con el total de pedido persistido.
- **Archivos tocados**:
  - `backend/nucleo_herbal/dominio/entidades.py`
  - `backend/nucleo_herbal/dominio/pedidos.py`
  - `backend/nucleo_herbal/aplicacion/puertos/repositorios_productos_checkout.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/dto.py`
  - `backend/nucleo_herbal/aplicacion/dto_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_rituales.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/mapeadores.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_productos_checkout.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0036_lineapedidorealmodelo_importe_impuestos_and_more.py`
  - `backend/nucleo_herbal/infraestructura/pagos_stripe.py`
  - `backend/nucleo_herbal/presentacion/publica/pedidos_serializadores.py`
  - `backend/nucleo_herbal/presentacion/publica/documento_pedido_html.py`
  - `backend/nucleo_herbal/presentacion/publica/serializadores.py`
  - `backend/nucleo_herbal/presentacion/backoffice_views/productos.py`
  - `backend/nucleo_herbal/presentacion/backoffice_views/productos_contrato.py`
  - `frontend/contenido/catalogo/catalogo.ts`
  - `frontend/contenido/catalogo/checkoutReal.ts`
  - `frontend/contenido/catalogo/fiscalidadCheckout.ts`
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/infraestructura/api/pedidos.ts`
  - `tests/nucleo_herbal/test_casos_de_uso_pedidos_real.py`
  - `tests/nucleo_herbal/test_pago_real.py`
  - `frontend/tests/checkout-real.test.ts`
  - `frontend/tests/checkout-real-ui.test.ts`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/90_estado_implementacion.md`
  - `docs/17_migracion_ecommerce_real.md`
- **Comandos ejecutados**:
  - `python manage.py makemigrations persistencia_django`
  - `python manage.py test tests.nucleo_herbal.test_casos_de_uso_pedidos_real tests.nucleo_herbal.test_api_pedidos_real tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.infraestructura.test_repositorio_pedidos_real`
  - `python manage.py check`
  - `python manage.py makemigrations --check --dry-run`
  - `npm --prefix frontend run lint`
  - `npm --prefix frontend run test:checkout-real`
  - `npm --prefix frontend run build`
  - `python scripts/check_release_gate.py`
- **Evidencia**:
  - tipo fiscal operable por producto en dominio, persistencia y backoffice;
  - línea de pedido real con snapshot de tipo y cuota fiscal;
  - serialización/documento/recibo muestran fiscalidad por línea coherente;
  - tests backend/frontend del bloque en verde + gate canónico en verde.
- **Deuda residual**:
  1. No se abre todavía multi-país ni OSS/IOSS (pendiente de incrementos futuros).
  2. El campo `tipo_impositivo` de cabecera se conserva por compatibilidad y representa la referencia fiscal global mínima de envío/caso base.
- **Commit/PR**: commit realizado en este branch; PR preparado con `make_pr` (sin identificador devuelto por la herramienta).
