# Deuda residual ecommerce local simulado

## 1. Objetivo
Registrar el resultado del barrido de marcadores de deuda menor del ecommerce local simulado sin abrir refactors grandes ni retirar legacy.

Esta auditoria no declara produccion lista, no desbloquea `V2-R10`, no activa Stripe y no elimina `/encargo`, `/pedido-demo`, `PedidoDemo` ni `cuenta-demo`.

## 2. Marcadores auditados
Se buscaron los marcadores:

- `TODO`
- `FIXME`
- `HACK`
- `temporal`
- `demo`
- `legacy`
- `v1`
- `coexistencia`
- `pendiente`
- `simulado`

El resultado bruto es alto porque el repositorio conserva documentacion historica, tests legacy y nombres de modulos demo que siguen permitidos de forma controlada.

## 3. Clasificacion
| Categoria | Estado | Decision |
| --- | --- | --- |
| Documental valido | Permitido | Mantener referencias a fase local, pago simulado, V2 bloqueado, guiones, auditorias y docs historicas normalizadas. |
| Legacy permitido | Permitido controlado | Mantener `/encargo`, `/pedido-demo`, `cuenta-demo`, `PedidoDemo` y `CuentaDemo` solo como historico/consulta/test. |
| Deuda menor corregible | Corregida | Renombrar titulos duplicados de ELS-23 y ELS-24 en `docs/roadmap_ecommerce_local_simulado.md`. |
| Deuda mayor | Documentada | Extraer `encargoConsulta` de checkout real a helper neutral requiere microfase propia. |
| Blocker ecommerce local | No detectado | El gate local y la auditoria final no reportan `BLOCKER`. |

## 4. Deuda que queda
### Historico documental con lenguaje demo
- Alcance: `docs/05_modelo_de_dominio_y_entidades.md`, `docs/07_arquitectura_tecnica.md`, `docs/10_checkout_y_flujos_ecommerce.md` y otros documentos fundacionales.
- Motivo para no corregir ahora: son documentos historicos normalizados por `docs/90_estado_implementacion.md` y `docs/99_fuente_de_verdad.md`.
- Riesgo: un agente que no lea la precedencia documental podria interpretar la demo como flujo principal.
- Mitigacion: lectura rapida para agentes y roadmap local vigente.

### Legacy demo conservado
- Alcance: rutas, componentes, casos de uso, DTOs, modelos y tests relacionados con `PedidoDemo`, `CuentaDemo`, `/pedido-demo`, `/cuenta-demo` y `/encargo`.
- Motivo para no corregir ahora: el plan vigente exige retirada progresiva, no borrado inmediato.
- Riesgo: nueva capacidad mal encaminada hacia legacy.
- Mitigacion: `scripts/check_ecommerce_local_simulado.py` y `docs/plan_retirada_legacy_demo.md`.

### Preseleccion heredada en checkout real
- Alcance: `FlujoCheckoutReal` reutiliza `encargoConsulta` como helper transitorio.
- Motivo para no corregir ahora: requiere extraer un helper neutral compartido y ajustar tests; no es deuda menor documental.
- Riesgo: acoplamiento conceptual entre checkout real y consulta legacy.
- Mitigacion: warning del gate local y auditoria de dependencias demo/real.

### Estados `pendiente` y sufijos `v1`
- Alcance: estados de dominio, rutas API versionadas, comentarios historicos y nombres de flujo.
- Motivo para no corregir ahora: forman parte de contratos existentes o historico trazable.
- Riesgo: bajo si se mantiene la lectura de estado unico.
- Mitigacion: no renombrar contratos sin fase propia y tests de regresion.

## 5. Blockers
No se detectaron blockers nuevos para presentar el ecommerce local simulado como entorno local/portfolio. La salida productiva sigue bloqueada por `V2-R10`.

## 6. Siguiente limpieza recomendada
Crear una microfase para extraer la preseleccion compartida a un helper neutral consumido por checkout real y `/encargo`, manteniendo el guardrail anti-demo.
