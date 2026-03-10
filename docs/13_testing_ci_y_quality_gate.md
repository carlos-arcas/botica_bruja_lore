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
- **Tests backend críticos:** healthcheck y seed demo.
- **Snapshot de datos públicos en modo lectura:** reporte de conteos existentes de intenciones, plantas, productos y rituales (sin sembrar ni migrar).
- **Validación frontend básica (si aplica):** `npm run lint` y `npm run build`.

Regla de auditoría:

- El gate canónico **no debe ejecutar** `migrate` ni `seed_demo_publico` por defecto.
- Su objetivo es validar y auditar el estado existente, no modificarlo.

Criterio de severidad:

- **Bloqueante (ERROR):** readiness backend, `manage.py check` y tests backend críticos.
- **Informativo (INFO):** snapshot de conteos en solo lectura.
- **Frontend presente y ejecutable:** lint/build cuentan como bloqueantes.
- **Frontend no aplicable por entorno:** se informa como `SKIP` con motivo explícito (por ejemplo, sin `frontend/package.json` o sin Node/npm).

### 12.1 Operación separada de bootstrap demo (mutante)

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

  - con ello, CI valida en un único paso auditable: readiness backend, `manage.py check`, tests críticos backend y lint/build frontend.

- **Job `bootstrap_demo_validation` (mutante aislado)**
  - ejecuta `python scripts/bootstrap_demo_release.py` en una base SQLite temporal aislada (`${{ runner.temp }}`),
  - valida después los conteos públicos esperados (`2/2/2/1`) para intenciones, plantas, productos y rituales,
  - mantiene separación conceptual: es una validación técnica de bootstrap, no el gate canónico de release.

Límites explícitos de este workflow:

- El gate canónico de release sigue siendo `check_release_gate.py`.
- La validación de bootstrap en CI ocurre en entorno aislado de pruebas; **no** implica ejecución automática en Railway/producción.
- La CI no sustituye verificaciones y responsabilidades de configuración en Railway UI (variables, wiring entre servicios y validación post-deploy).
