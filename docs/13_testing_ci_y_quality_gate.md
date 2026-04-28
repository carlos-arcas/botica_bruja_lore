# 13 — Estrategia de testing, CI y quality gate

## 1. Propósito del documento
Este documento define la estrategia oficial de calidad para `botica_bruja_lore` y aterriza operativamente las normas ya fijadas como no negociables en el repositorio. Su función es traducir principios de calidad en criterios ejecutables por ciclo, sin confundir diseño documental con implementación técnica real.

Define el marco de calidad y, además, documenta el workflow CI canónico que automatiza el gate mínimo defendible del repositorio.

## 2. Objetivos de testing y quality gate
La estrategia de testing y quality gate persigue objetivos concretos de producto y de ingeniería:

1. **Proteger la credibilidad del proyecto**: una demo portfolio-first y business-ready exige evidencia técnica, no solo intención.
2. **Evitar regresiones tempranas**: cada ciclo debe cerrar capacidades sin degradar lo ya validado.
3. **Preservar arquitectura**: el gate no valida solo “que funcione”, también que respete Clean Architecture y separación de capas.
4. **Asegurar mantenibilidad**: calidad medible para evitar deuda estructural acumulativa.
5. **Operar por ciclos sin autoengaño**: activar controles progresivamente sin relajar su carácter obligatorio.
6. **Unificar criterio de DONE técnico**: no hay cierre técnico sin evidencia verificable de pruebas y gate aplicable.

## 3. Principios rectores de calidad
Los siguientes principios gobiernan toda decisión de pruebas y gate:

- **Obligatoriedad normativa**: el quality gate es obligatorio en el proyecto; lo que se gradúa por ciclo es su despliegue operativo, no su vigencia.
- **Valor sobre volumen**: se exigen pruebas útiles para riesgo real; se descarta inflar métricas con tests triviales.
- **Arquitectura primero**: pasar pruebas funcionales no habilita romper fronteras de dominio, aplicación, infraestructura o presentación.
- **Riesgo proporcional**: la profundidad de pruebas escala según impacto de negocio, criticidad y complejidad.
- **Evidencia reproducible**: todo cierre técnico debe dejar trazabilidad verificable en revisión.
- **Evolución incremental**: cada ciclo endurece calidad sobre base estable; no se pospone todo al final.

## 4. Tipos de prueba del proyecto
El proyecto contempla estas familias de pruebas como marco objetivo:

1. **Pruebas unitarias**
   - Validan reglas de negocio y comportamiento aislado de unidades.
   - Son la base para proteger dominio y casos de uso de regresiones lógicas.

2. **Pruebas de integración**
   - Validan interacción entre componentes y capas (por ejemplo, aplicación ↔ infraestructura, API ↔ persistencia).
   - Deben confirmar contratos internos sin depender de flujos E2E completos.

3. **Pruebas end-to-end (E2E)**
   - Validan recorridos críticos reales de usuario sobre la experiencia integrada.
   - Se limitan a flujos de alto valor para no convertir la suite en un cuello de botella frágil.

4. **Pruebas smoke**
   - Verifican que los caminos esenciales del sistema estén operativos tras cambios.
   - Deben ser rápidas y enfocadas en no-rotura de capacidades nucleares.

5. **Pruebas contractuales (cuando aplique)**
   - Validan estabilidad de contratos entre frontend/backend o módulos con interfaces explícitas.
   - Se incorporan en cuanto existan integraciones que puedan romperse por desacople de equipos o ciclos.

## 5. Qué debe cubrir cada nivel de prueba
Cobertura esperada por nivel, orientada a arquitectura y riesgo:

- **Unitarias**
  - Entidades y value objects del dominio.
  - Casos de uso/aplicación con dependencias aisladas.
  - Validaciones, invariantes y reglas de decisión.

- **Integración**
  - Repositorios/adaptadores con persistencia realista para el entorno del ciclo.
  - Endpoints/controladores con serialización, validación y manejo de errores.
  - Integración entre componentes que crucen fronteras de capa.

- **E2E**
  - Recorridos de negocio críticos priorizados por ciclo.
  - Flujos de navegación clave en Next.js con backend Django operativo.
  - Casos de no-rotura tras cambios en capacidades ya entregadas.

- **Smoke**
  - Arranque básico, rutas y operaciones esenciales.
  - Confirmación rápida de integridad mínima tras merge o release interno.

- **Contractuales**
  - Esquemas/respuestas de API críticas.
  - Compatibilidad de interfaces entre productores y consumidores.

## 6. Definición de core y cobertura objetivo
Para este proyecto, **core** es el conjunto de componentes cuya rotura compromete valor de negocio, credibilidad de demo o coherencia arquitectónica. Incluye, como mínimo:

- Reglas de dominio críticas (separación Planta/Producto y lógica de negocio asociada).
- Casos de uso de alto impacto comercial/editorial definidos por ciclo.
- Contratos API y flujos de integración que sostienen capacidades demostrables.
- Piezas que materializan decisiones no negociables de arquitectura.

La cobertura mínima del core se fija en **>=85%** como norma del proyecto. Esta cifra no se interpreta como objetivo cosmético global; se aplica sobre código core realmente relevante.

Consecuencias operativas:

- No se acepta compensar baja cobertura en core con tests periféricos de bajo valor.
- Cobertura sin aserciones significativas no cumple el estándar.
- El umbral se exige con mayor rigor a medida que el producto funcional avance por ciclos.

## 7. Qué incluye el quality gate
El quality gate es un conjunto de controles técnicos que determinan si una capacidad puede considerarse técnicamente cerrada. Incluye, a nivel conceptual:

1. **Pruebas obligatorias según alcance del cambio**
   - Unitarias siempre en implementación de código.
   - Integración/E2E/smoke según criticidad y ciclo.

2. **Cobertura del core**
   - Verificación de cumplimiento del umbral >=85% en componentes core aplicables.

3. **Conformidad arquitectónica y estructural**
   - Respeto explícito de capas y fronteras de Clean Architecture.
   - Ausencia de acoplamientos indebidos dominio-framework.

4. **Complejidad y mantenibilidad**
   - Control de tamaño de archivo/función y complejidad ciclomática según norma del repositorio.
   - Rechazo de soluciones que introduzcan deuda evitable.

5. **Calidad estática cuando aplique**
   - Linting y chequeo de tipos en backend/frontend conforme madure la base de código.

6. **Seguridad de dependencias cuando aplique**
   - Revisión de vulnerabilidades relevantes para el alcance del ciclo.

El gate no es una checklist burocrática: su resultado debe responder si la capacidad está lista para sostener evolución real sin comprometer calidad.

## 8. Despliegue progresivo del quality gate por ciclos
La activación operativa del gate se define por madurez del proyecto:

### Ciclo 0 (documental cerrado)
- Estado esperado: estrategia de calidad definida, trazable y alineada con normas no negociables.
- Exigencia operativa: no se exige pipeline técnico completo por ausencia de producto funcional.
- Exigencia documental: criterios de prueba, cobertura y DONE técnico deben quedar explícitos (este documento).

### Ciclo 1 (primeras capacidades con código)
- Objetivo: gate mínimo operativo razonable, suficiente para impedir regresiones estructurales tempranas.
- Mínimos exigibles:
  - pruebas unitarias obligatorias en código nuevo/modificado,
  - primeras pruebas de integración en puntos críticos,
  - validación de no-rotura de recorridos base,
  - control inicial de arquitectura y complejidad,
  - evidencia de cobertura útil en core del alcance implementado.
- Criterio: priorizar calidad efectiva sin sobredimensionar suites frágiles.

### Ciclos 2–3 (expansión funcional controlada)
- Objetivo: ampliar profundidad de integración y consolidar estabilidad entre capacidades.
- Endurecimiento esperado:
  - mayor peso de integración entre backend/frontend,
  - primeros E2E en recorridos críticos de negocio,
  - mayor rigor de cobertura de core conforme crece el código,
  - formalización más robusta de validaciones estáticas.

### Ciclos 4–5 (consolidación de producto demostrable)
- Objetivo: sostener calidad de producto navegable y coherente bajo cambios frecuentes.
- Endurecimiento esperado:
  - smoke confiable por capacidad crítica,
  - E2E estables para recorridos clave,
  - controles de complejidad más estrictos,
  - revisión más sistemática de seguridad de dependencias.

### Ciclo 6 (nivel portfolio/business-ready defendible)
- Objetivo: calidad técnica consistente con una demo seria, mantenible y escalable.
- Exigencia esperada:
  - gate integral aplicado de forma consistente,
  - cobertura core sostenida y defendible,
  - evidencia de no-rotura transversal,
  - disciplina arquitectónica verificable en revisión técnica.

## 9. Criterio de DONE técnico
Una capacidad solo puede declararse DONE técnico cuando, para su ciclo, existe evidencia de:

1. **Implementación real** del alcance comprometido.
2. **Validación funcional** de comportamiento esperado.
3. **Cumplimiento arquitectónico** (capas, fronteras y decisiones no negociables).
4. **Pruebas exigidas** por tipo de cambio y nivel de criticidad.
5. **Quality gate aplicable aprobado** según madurez del ciclo.

No es DONE técnico si está solo pensado, documentado, parcialmente probado o validado de forma manual sin trazabilidad suficiente.

## 10. Antipatrones y errores a evitar
Se consideran desviaciones explícitas de esta estrategia:

- Inflar número de tests sin cobertura de riesgo real.
- Convertir “un test por función” en dogma ciego.
- Posponer toda la calidad a ciclos finales.
- Usar cobertura global para ocultar déficit en core.
- Romper arquitectura para pasar una verificación superficial.
- Declarar DONE con evidencia incompleta o no reproducible.
- Introducir controles desproporcionados al ciclo que frenen entrega sin aportar calidad real.

## 11. Uso del documento en prompts, revisiones y ciclos
Este documento es marco operativo para trabajo futuro y debe usarse de esta manera:

1. **En prompts de implementación**
   - Incluir siempre requisitos de prueba y gate acordes al ciclo.
   - Especificar tipo de evidencia esperada para considerar cierre técnico.

2. **En revisiones técnicas/PR**
   - Evaluar cumplimiento de controles aplicables, no solo funcionalidad visible.
   - Rechazar cierres que no acrediten calidad exigible del ciclo.

3. **En planificación por ciclos**
   - Declarar explícitamente qué parte del gate se activa en cada capacidad.
   - Ajustar endurecimiento progresivo sin rebajar normas de base.

4. **En gobierno del roadmap**
   - Usar este marco para evitar tanto laxitud como sobrecarga prematura.
   - Mantener trazabilidad entre estado real de implementación y exigencia de calidad activa.

## 12. Comando canónico de gate técnico demo/release (solo lectura)

Para auditoría técnica manual, operación diaria y futura automatización CI, el repositorio define un gate unificado **no mutante por defecto**:

```bash
python scripts/check_release_gate.py
```

Este comando orquesta en un solo flujo:

- **Readiness backend:** `python scripts/check_backend_readiness.py`.
- **Check estructural Django:** `python manage.py check`.
- **Tests backend críticos:** healthcheck, seed demo, guardrails de deploy/configuración (`tests.nucleo_herbal.test_deploy_guards`) y contratos públicos backend↔frontend de herbal/rituales (`tests.nucleo_herbal.test_contratos_api_publica_frontend`) más contratos demo/comerciales consumidos por frontend (`tests.nucleo_herbal.test_contratos_api_publica_demo_frontend`) para `PedidoDemo`, `email-demo` y el checkout demo legado (`/encargo`).
- **Snapshot de datos públicos en modo lectura:** reporte de conteos existentes de intenciones, plantas, productos y rituales (sin sembrar ni migrar).
- **Integridad operativa/documental del repositorio:** `python scripts/check_repo_operational_integrity.py` (markdown crítico, coherencia Procfile/manage.py/wsgi.py/railway.toml, `.env.railway.example` y alineación CI↔documentación).
- **Conciliación operativa endurecida (solo lectura):** `python scripts/check_operational_reconciliation.py --fail-on blocker` con matriz explícita BLOCKER/WARNING/INFO para detectar discrepancias pedido↔inventario↔reembolso↔expedición↔emails sin mutar datos; solo los BLOCKER rompen gate.
- **Release readiness mínimo (seguridad/privacidad/backups):** `python scripts/check_release_readiness.py` para validar checklist mínimo de pre-release y documentación de backup/restore.
- **Alertas operativas agregadas v2 (solo lectura):** `python scripts/check_operational_alerts_v2.py --fail-on blocker` para consolidar señales accionables (stock pendiente de revisión, reembolsos fallidos, devoluciones aceptadas no resueltas, blockers de conciliación y fallo de readiness) con salida texto/JSON reutilizable en ejecución manual o scheduler externo.
- **Reintentos operativos seguros v2 (solo dry-run):** `python scripts/retry_operational_tasks_v2.py --dry-run --json` para listar candidatos sin mutación y validar que el wiring de reintentos idempotentes (`post_pago`, `envio`, `cancelacion`, `reembolso`) sigue operativo sin ejecutar envíos reales.

- Estos contratos validan forma mínima estable de JSON (claves obligatorias, estructura de listas/objetos y campos realmente consumidos por frontend) tanto para herbal/rituales como para pedidos demo, cuentas demo y calendario ritual, reduciendo regresiones silenciosas que no rompen build pero sí el runtime.
- Además, endurecen explícitamente el contrato mínimo de error en APIs públicas consumidas por frontend: respuesta JSON con clave `detalle` (string), status HTTP coherente (400/401/404) y `Content-Type` JSON para evitar desvíos a HTML inesperado.
- En el gate, el naming canónico del circuito demo es **checkout demo legado (`/encargo`)** para el recorrido `/encargo` → `POST /api/v1/pedidos-demo/` → `/pedido-demo/[id_pedido]` → `email-demo`.
- **Validación frontend básica (si aplica):** `npm run lint`, `npm run test:checkout-demo`, `npm run test:cuenta-demo`, `npm run test:calendario-ritual` y `npm run build`.
- **Backup/restore operable (plan seguro):** `python scripts/backup_restore_postgres.py backup --dry-run`, backup real y restore drill real siguen formando parte del checklist pre-flight separado; no se ejecutan dentro del gate canónico porque dependen de `DATABASE_URL`, `BOTICA_BACKUP_DIR`, `BOTICA_RESTORE_DATABASE_URL` y, para `restore-drill`, de un dump explícito.

### 12.1 Matriz compacta de recorridos críticos

Esta matriz viva resume el cableado mínimo **ruta frontend ↔ endpoint/backend ↔ cobertura principal** usado en auditoría rápida y mantenimiento defensivo. No sustituye el detalle de cada suite ni el estado factual de `docs/90_estado_implementacion.md`.

| Recorrido crítico | Ruta frontend principal | Endpoint/backend principal | Cobertura principal |
|---|---|---|---|
| Secciones públicas comerciales | `/`, `/botica-natural`, `/velas-e-incienso`, `/minerales-y-energia`, `/herramientas-esotericas` | `GET /api/v1/herbal/secciones/<seccion>/productos/` | `frontend/tests/home-raiz-secciones.test.ts`, `frontend/tests/comercial-multiseccion-regresion.test.ts`, `tests/nucleo_herbal/test_exposicion_publica.py` |
| Hierbas y rituales públicos | `/hierbas`, `/hierbas/[slug]`, `/rituales`, `/rituales/[slug]` | `GET /api/v1/herbal/plantas/`, `GET /api/v1/herbal/plantas/<slug>/`, `GET /api/v1/rituales/`, `GET /api/v1/rituales/<slug>/` | `tests/nucleo_herbal/test_exposicion_publica.py`, `tests/nucleo_herbal/test_contratos_api_publica_frontend.py` |
| Checkout demo legado | `/encargo` | `POST /api/v1/pedidos-demo/` | `frontend/tests/checkout-demo.test.ts`, `frontend/tests/checkout-demo-ui.test.ts`, `tests/nucleo_herbal/test_api_pedidos_demo.py`, `tests/nucleo_herbal/test_contratos_api_publica_demo_frontend.py` |
| Recibo + email demo | `/pedido-demo/[id_pedido]` | `GET /api/v1/pedidos-demo/<id_pedido>/`, `GET /api/v1/pedidos-demo/<id_pedido>/email-demo/` | `frontend/tests/checkout-demo.test.ts`, `tests/nucleo_herbal/test_api_pedidos_demo.py`, `tests/nucleo_herbal/test_contratos_api_publica_demo_frontend.py` |
| Cuenta demo | `/cuenta-demo` | `POST /api/v1/cuentas-demo/registro/`, `POST /api/v1/cuentas-demo/autenticacion/`, `GET /api/v1/cuentas-demo/<id_usuario>/perfil/`, `GET /api/v1/cuentas-demo/<id_usuario>/historial-pedidos/` | `frontend/tests/cuenta-demo.test.ts`, `tests/nucleo_herbal/test_api_cuentas_demo.py`, `tests/nucleo_herbal/test_contratos_api_publica_demo_frontend.py` |
| Calendario ritual | `/calendario-ritual` | `GET /api/v1/calendario-ritual/?fecha=YYYY-MM-DD` | `frontend/tests/calendario-ritual.test.ts`, `tests/nucleo_herbal/test_exposicion_publica.py`, `tests/nucleo_herbal/test_contratos_api_publica_demo_frontend.py` |
| Backoffice mínimo staff | `/admin`, `/admin/login`, `/admin/(panel)/productos`, `/admin/(panel)/pedidos` | `GET /api/v1/backoffice/estado/`, `GET /api/v1/backoffice/productos/`, `GET /api/v1/backoffice/pedidos/` | `frontend/tests/backoffice-admin.test.ts`, `frontend/tests/backoffice-flujos.test.ts`, `tests/nucleo_herbal/test_api_backoffice.py` |

Regla de auditoría:

- El gate canónico **no debe ejecutar** `migrate` ni `seed_demo_publico` por defecto.
- Su objetivo es validar y auditar el estado existente, no modificarlo.
- El gate canónico **no ejecuta** reintentos operativos en modo real ni backup/restore; esos pasos quedan fuera como operativa pre-flight/post-deploy.

Criterio de severidad:

- **Bloqueante (ERROR):** readiness backend, `manage.py check`, tests backend críticos e integridad operativa/documental del repo.
- **Informativo (INFO):** snapshot de conteos en solo lectura.
- **Conciliación operativa:** bloque `H` pasa a bloqueante solo para severidad `BLOCKER` (`--fail-on blocker`); `WARNING` e `INFO` no bloquean pero quedan visibles en salida del gate.
- **Release readiness mínimo:** bloqueante si falla `check_release_readiness.py`.
- **Alertas operativas v2:** bloqueantes solo cuando `check_operational_alerts_v2.py --fail-on blocker` detecta severidad `BLOCKER`; si el entorno no aplica, el bloque puede reportar `SKIP`.
- **Retry operativo v2 (dry-run):** bloqueante solo si el script falla; la ejecución sigue siendo de solo lectura y puede reportar `SKIP` si el entorno no aplica.
- **Frontend presente y ejecutable:** lint/build cuentan como bloqueantes.
- **Frontend no aplicable por entorno:** se informa como `SKIP` con motivo explícito (por ejemplo, sin `frontend/package.json` o sin Node/npm).

### 12.2 Operación separada de bootstrap demo (mutante)

Para preparar un entorno demo/local/staging de forma explícita, existe una operación aparte:

```bash
python scripts/bootstrap_demo_release.py
```

Esta operación **sí muta estado** y está diseñada para bootstrap controlado:

- ejecuta `python manage.py migrate --noinput`,
- ejecuta `python manage.py seed_demo_publico` (primera vez),
- ejecuta una segunda siembra para validar idempotencia operativa (salvo `--skip-second-seed`),
- reporta conteos públicos finales.

Alcance y límites:

- El gate de solo lectura **no sustituye** suites completas de regresión, pruebas E2E ni validaciones de negocio profundas.
- El bootstrap demo **no sustituye** el gate canónico; cumple una función operativa distinta.
- Un `SKIP` de frontend por entorno debe tratarse como señal operativa visible, no como silencio.

## 13.1 Estado de higiene de dependencias frontend (Prompt 22)

Durante la revisión técnica focalizada de hardening frontend se confirmó que:

- El gate frontend vigente permanece en verde con `npm ci`, `npm run lint`, `npm run test:checkout-demo`, `npm run test:cuenta-demo` y `npm run build`.
- Persisten deprecaciones transitivas asociadas al stack ESLint/Next 14 actual (`inflight`, `glob`, `rimraf`, `@humanwhocodes/*`, `eslint@8.57.0`).
- En este entorno, `npm audit` no es concluyente por restricción de acceso al endpoint oficial (`403`), por lo que la evidencia de seguridad debe apoyarse adicionalmente en trazabilidad del árbol (`npm ls`) y verificación de gate.

Decisión operativa:

- **No forzar** migración mayor de framework/linter dentro de una ventana de corrección puntual.
- Tratar la limpieza completa de esas transitivas como trabajo planificado en una ventana mayor (upgrade coordinado de Next + ESLint), con validación completa de compatibilidad.
- Mantener trazabilidad explícita entre: warnings observados, cambios aplicados y deuda técnica remanente para auditoría.


## 13. Workflow CI canónico (GitHub Actions)

El repositorio dispone de un workflow canónico en `.github/workflows/quality_gate.yml` ejecutado en `push` y `pull_request`.

Alcance automatizado del workflow:

- **Job `release_gate` (canónico de auditoría)**
  - instala dependencias backend y frontend (Python + Node 20),
  - valida sintaxis TOML de `backend/railway.toml` y `frontend/railway.toml`,
  - ejecuta explícitamente el comando canónico:

```bash
python scripts/check_release_gate.py
```

  - con ello, CI valida en un único paso auditable: readiness backend, `manage.py check`, tests críticos backend, tests de scripts operativos (`tests.scripts`), integridad operativa/documental del repo, conciliación, `check_release_readiness.py`, alertas operativas v2, retry operativo en `dry-run` y lint/tests de checkout+cuenta+calendario/build frontend.

- **Job `bootstrap_demo_validation` (mutante aislado)**
  - ejecuta `python scripts/bootstrap_demo_release.py` en una base SQLite temporal aislada (`${{ runner.temp }}`),
  - fija explícitamente un entorno mínimo compatible con `DEBUG=false` para respetar validaciones de producción endurecidas (`PUBLIC_SITE_URL`, `PAYMENT_SUCCESS_URL`, `PAYMENT_CANCEL_URL`, `DEFAULT_FROM_EMAIL`, `EMAIL_BACKEND` SMTP real),
  - valida después los conteos públicos esperados (`2/2/2/1`) para intenciones, plantas, productos y rituales,
  - mantiene separación conceptual: es una validación técnica de bootstrap, no el gate canónico de release.

Límites explícitos de este workflow:

- El gate canónico de release sigue siendo `check_release_gate.py`.
- La validación de bootstrap en CI ocurre en entorno aislado de pruebas; **no** implica ejecución automática en Railway/producción.
- La CI no sustituye verificaciones y responsabilidades de configuración en Railway UI (variables, wiring entre servicios y validación post-deploy).

## 14. Smoke check manual post-deploy (stack desplegado real)

Para validar un entorno **ya desplegado** (Railway u otro) y cubrir fallos de wiring/UI/configuración que pueden no aparecer en CI, usar:

```bash
BACKEND_BASE_URL="https://TU-BACKEND.up.railway.app" FRONTEND_BASE_URL="https://TU-FRONTEND.up.railway.app" python scripts/check_deployed_stack.py
```

Notas operativas:

- Es una validación **solo lectura** (no muta datos).
- Requiere `BACKEND_BASE_URL` y `FRONTEND_BASE_URL`.
- Opcionalmente admite:
  - `EXPECT_NON_EMPTY_DATA=true` para exigir datos demo visibles en APIs públicas.
  - `HERBAL_SLUG` y `RITUAL_SLUG` para revisar rutas/endpoint de detalle.
- Endurecimiento operativo actual:
  - los errores de configuración (variables/URL inválida) devuelven exit code explícito `2`;
  - fallos bloqueantes de checks remotos devuelven exit code `1`;
  - la validación está cubierta por tests automáticos dedicados en `tests/scripts/test_check_deployed_stack.py`.
- Este comando **no reemplaza** el gate canónico (`check_release_gate.py`) ni se integra en CI por defecto, porque depende de URLs reales desplegadas.


## 15. Observabilidad mínima para diagnóstico en Railway

- Backend Django y scripts operativos emiten logs estructurados simples a `stdout` (capturados por Railway).
- `LOG_LEVEL` permite ajustar verbosidad por entorno sin cambiar código; default: `INFO`.
- Se añaden trazas explícitas para errores de readiness (`/healthz`) y fallos de bloques en checks/bootstraps.
- Esta mejora aumenta auditabilidad técnica post-deploy, pero **no sustituye** healthcheck, CI ni smoke checks manuales.

## 16. Gate local ecommerce simulado

Para validar la fase de ecommerce local real con pago simulado existe un gate especifico, estatico y de solo lectura:

```bash
python scripts/check_ecommerce_local_simulado.py
```

Tambien puede emitirse JSON para uso por tooling local:

```bash
python scripts/check_ecommerce_local_simulado.py --json
python scripts/check_ecommerce_local_simulado.py --fail-on warning
```

Este gate valida presencia y coherencia minima de:

- roadmap local simulado;
- rutas `/checkout`, `/pedido/[id_pedido]`, `/mi-cuenta` y legacy controlado `/encargo`;
- adaptador `simulado_local` por puerto y configuracion `BOTICA_PAYMENT_PROVIDER`;
- caso de uso y endpoint de confirmacion de pago simulado;
- checkout/recibo real en frontend;
- backoffice/admin de pedidos reales;
- noindex contractual para checkout y pedido;
- ausencia de CTAs publicos evidentes hacia `/pedido-demo`;
- bloqueo vigente de `V2-R10` para go-live real.

Severidades:

- **OK**: contrato presente y coherente.
- **WARNING**: senal no bloqueante que debe seguir visible, por ejemplo legacy existente pero documentado como deprecado.
- **BLOCKER**: falta un contrato minimo o aparece una contradiccion que invalida la fase local simulada.

El exit code es `0` si no hay `BLOCKER`; con `--fail-on warning`, cualquier `WARNING` tambien devuelve `1`.

Este gate **no** lanza servidores, no ejecuta Playwright, no comprueba Stripe real, no requiere URLs externas y no declara go-live externo.

## 17. Bootstrap local ecommerce simulado

Para preparar datos locales comprables existe un bootstrap mutante explicito:

```bash
python scripts/bootstrap_ecommerce_local_simulado.py
```

Antes de aplicar cambios puede ejecutarse en modo transaccional reversible:

```bash
python scripts/bootstrap_ecommerce_local_simulado.py --dry-run
python scripts/bootstrap_ecommerce_local_simulado.py --dry-run --json
```

El bootstrap garantiza datos minimos para validar el recorrido local:

- secciones publicas de producto: `botica-natural`, `velas-e-incienso`, `minerales-y-energia`, `herramientas-esotericas`;
- una intencion y una planta editorial local para el producto herbal;
- un producto publicado y comprable por cada seccion;
- SKU estable con prefijo `LOCAL-ECOM-`;
- precio numerico, precio visible, unidad comercial, tipo fiscal y minimo de compra validos;
- inventario compatible con la unidad comercial y suficiente para al menos una compra;
- cuenta cliente local opcional `cliente.local@botica.test` con direccion predeterminada.

El script es idempotente: usa `update_or_create` sobre slugs/SKUs/cuenta y no duplica inventario ni direcciones locales. Repetirlo actualiza el dataset minimo al contrato vigente.

No crea imagenes, pedidos, pagos, documentos fiscales, datos masivos, migraciones ni integraciones externas. Para resetear, puede vaciarse la base local o eliminar los registros con prefijo `LOCAL-ECOM-` y volver a ejecutar el bootstrap.

## 18. Regresion compra local simulada

El recorrido ecommerce local con pago simulado queda protegido por una regresion por capas, sin Playwright ni servidor externo:

```bash
python manage.py test tests.nucleo_herbal.test_regresion_compra_local_simulada
npm --prefix frontend run test:compra-local
```

Matriz de cobertura:

| Paso | Ruta/archivo | Test |
|---|---|---|
| Catalogo y ficha publicos | `/api/v1/herbal/secciones/botica-natural/productos/`, `/api/v1/herbal/productos/{slug}/` | `test_compra_invitado_llega_a_pedido_pagado_y_documento` |
| Cesta comprable | `frontend/contenido/catalogo/cestaReal.ts` | `recorrido frontend convierte cesta comprable en payload real sin contrato demo` |
| Checkout real invitado | `/api/v1/pedidos/`, `frontend/contenido/catalogo/checkoutReal.ts` | `test_compra_invitado_llega_a_pedido_pagado_y_documento`, `recorrido frontend convierte cesta comprable...` |
| Pago simulado | `/api/v1/pedidos/{id}/iniciar-pago/`, `/confirmar-pago-simulado/` | `test_compra_invitado_llega_a_pedido_pagado_y_documento`, `cliente frontend completa pedido real...` |
| Stock preventivo | `/api/v1/pedidos/{id}/iniciar-pago/` | `test_stock_insuficiente_bloquea_pago_sin_crear_intencion` |
| Documento fiscal | `/api/v1/pedidos/{id}/documento/` | `test_compra_invitado_llega_a_pedido_pagado_y_documento` |
| Cuenta real | `/api/v1/cuenta/direcciones/`, `/api/v1/cuenta/pedidos/` | `test_compra_usuario_real_con_direccion_guardada_aparece_en_cuenta` |
| No dependencia demo legacy | codigo frontend/API y ORM `PedidoDemoModelo` | tests backend/frontend de regresion compra local |
| CTAs principales | navegacion, cesta, ficha, checkout, recibo | `contrato estatico protege CTAs principales hacia checkout y cuenta real` |

Hueco aceptado: no hay E2E browser real en esta fase. Para cubrir interaccion visual completa haria falta servidor local, base sembrada y runner Playwright dedicado.

## 19. Rendimiento frontend ecommerce

La optimizacion frontend de ecommerce local se protege con checks de contrato y build, sin introducir tooling externo:

```bash
npm --prefix frontend run test:botica-natural
npm --prefix frontend run test:checkout-real
npm --prefix frontend run test:compra-local
npm --prefix frontend run lint
npm --prefix frontend run build
```

Contratos protegidos:

- la tarjeta publica de producto no debe convertirse de nuevo en Client Component completo;
- la interaccion de cantidad/carrito vive en un subcomponente cliente acotado;
- el checkout conserva validaciones, payload real, errores de stock y pago simulado;
- las rutas transaccionales siguen noindex y catalogo/fichas no pierden SEO.

No se miden Core Web Vitals en esta fase porque no hay servidor local instrumentado ni entorno browser estable. Queda como mejora futura incorporar medicion visual/E2E ligera cuando exista runner dedicado.
