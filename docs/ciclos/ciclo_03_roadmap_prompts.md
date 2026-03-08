# Ciclo 3 — Roadmap oficial de prompts de implementación

## 1. Propósito del documento
Este documento define la **secuencia oficial de prompts de implementación** para ejecutar el Ciclo 3 (ecommerce demo completo) de forma controlada, trazable y sin sobrealcance.

Su función es operacional:
- convertir el contrato de ciclo en unidades atómicas de ejecución,
- ordenar dependencias técnicas y funcionales,
- asegurar avance real por prompt (no tareas difusas),
- proteger arquitectura, calidad y coherencia de producto.

Este roadmap **no implementa** funcionalidades ni redacta prompts completos; establece el orden y el alcance de cada prompt.

## 2. Principios de secuenciación del Ciclo 3
1. **Prompts uno a uno**: no se ejecutan en paralelo si comparten núcleo transaccional.
2. **Primero base transaccional, después experiencia**: modelado y persistencia antes de cerrar checkout frontend.
3. **Incremento verificable por prompt**: cada entrega deja una pieza navegable o comprobable.
4. **Autenticado + invitado dentro del ciclo**: coexistencia obligatoria, sin abrir cuenta avanzada.
5. **Admin y recibo/email son parte del cierre**: no son extras cosméticos.
6. **Quality gate progresivo desde el primer prompt con código**: endurecimiento gradual, obligatoriedad constante.
7. **Sin sobrealcance**: fuera favoritos, recordatorios, calendario ritual, social, pago real, logística real compleja.

## 3. Número total de prompts y criterio de partición
Se fija una secuencia de **8 prompts**.

### Decisión consolidada
- El Ciclo 3 debe ejecutarse en prompts atómicos con orden explícito.
- El rango razonable es 8–10 prompts para evitar megatareas y fragmentación excesiva.

### Propuesta operativa inicial razonada (adoptada)
- Se adopta **8 prompts** porque cubren extremo a extremo sin solapes: dominio/aplicación, infraestructura, API, backoffice, frontend carrito, frontend checkout, confirmación+email, cierre de calidad.
- Menos de 8 aumenta riesgo de prompts gigantes y deuda de integración.
- Más de 10 introduce microfragmentación con overhead de coordinación sin valor proporcional.

## 4. Secuencia oficial de prompts del ciclo
1. **Prompt 1 — Base de dominio/aplicación transaccional demo**
2. **Prompt 2 — Persistencia e infraestructura de pedido demo**
3. **Prompt 3 — API del flujo carrito/checkout/pedido demo**
4. **Prompt 4 — Backoffice mínimo de pedidos demo**
5. **Prompt 5 — Frontend de carrito**
6. **Prompt 6 — Frontend de checkout demo (autenticado/invitado)**
7. **Prompt 7 — Confirmación final + email/recibo demo**
8. **Prompt 8 — Tests integrales y quality gate de cierre de ciclo**

## 5. Dependencias y entregables parciales por prompt
| Prompt | Tipo principal | Objetivo operativo | Dependencia previa | Entregable parcial verificable | Riesgo si se altera el orden |
|---|---|---|---|---|---|
| 1 | Base dominio/aplicación transaccional demo | Definir casos de uso, contratos y reglas de carrito/checkout/pedido demo (`PedidoDemo`/`LíneaPedido`, estados base, canal autenticado/invitado). | Ciclos 1 y 2 cerrados + contratos de arquitectura vigentes. | Núcleo de aplicación transaccional coherente y testeable en aislamiento. | Si se pospone, API y frontend se construyen sin contrato estable y se multiplican retrabajos. |
| 2 | Persistencia/infraestructura | Implementar repositorios y mapeos de persistencia del pedido demo y líneas, garantizando trazabilidad mínima. | Prompt 1. | Capa de infraestructura persistente operativa para pedido demo. | Si se invierte con API/frontend, se crean adaptadores frágiles y deuda técnica. |
| 3 | API/exposición del flujo | Exponer endpoints/servicios mínimos de carrito + checkout + creación de pedido demo. | Prompts 1–2. | Contrato API funcional para consumo frontend y validaciones básicas del flujo. | Si se adelanta antes de persistencia sólida, se rompe consistencia y semántica transaccional. |
| 4 | Backoffice mínimo | Habilitar operación mínima en admin para consulta/gestión básica de pedidos demo. | Prompts 1–3. | Vista operativa de pedidos demo en Django Admin customizado. | Si se deja al final, se pierde observabilidad operativa durante pruebas de integración. |
| 5 | Frontend carrito | Construir experiencia de carrito conectada al contrato API sin cerrar aún checkout completo. | Prompt 3 (y coherencia con 4 para soporte operativo). | Carrito navegable, editable y consistente con backend demo. | Si se adelanta sin API estable, aparece lógica duplicada y mocks permanentes. |
| 6 | Frontend checkout demo | Implementar checkout con bifurcación autenticado/invitado (sin cuenta avanzada), validaciones y continuidad del flujo. | Prompt 5 + API estable (3). | Checkout demo funcional en ambos modos, listo para confirmación. | Si se ejecuta antes de carrito/API consolidados, aumenta fricción UX y defectos de integración. |
| 7 | Confirmación + email/recibo demo | Cerrar post-checkout: confirmación inequívoca y emisión de recibo/email demo coherente. | Prompt 6 + soporte de pedido persistido (2–3). | Cierre de flujo e2e con evidencia de salida al usuario. | Si se difiere, el ciclo queda sin cierre comercial demostrable. |
| 8 | Tests y quality gate del ciclo | Consolidar pruebas críticas e2e del circuito demo y ejecutar gate acordado para declarar cierre técnico. | Prompts 1–7. | Evidencia de no regresión, cobertura crítica y gate en verde para Ciclo 3. | Si no cierra el ciclo, no existe criterio de DONE verificable. |

## 6. Criterios de paso entre prompts
Para pasar de un prompt al siguiente deben cumplirse simultáneamente:
1. **Entrega verificable del prompt actual** (funcional o técnica según corresponda).
2. **Contratos de capa estabilizados** (sin ambigüedad para el siguiente prompt).
3. **Tests mínimos del incremento en verde** desde el primer prompt con código.
4. **Sin regresión visible de capacidades cerradas de Ciclo 1 y 2**.
5. **Trazabilidad documental breve**: decisión tomada, límites respetados y pendientes explícitos.
6. **Sin introducir alcance prohibido** del ciclo.

### Checkpoints recomendados
- **Checkpoint A (tras Prompt 3)**: base transaccional + persistencia + API listas.
- **Checkpoint B (tras Prompt 6)**: experiencia usuario completa hasta confirmación pendiente de recibo.
- **Checkpoint C (tras Prompt 8)**: evidencia integral de cierre de ciclo.

## 7. Qué no entra en este roadmap
No deben existir prompts de Ciclo 3 para:
- favoritos,
- recordatorios,
- calendario ritual,
- funcionalidades sociales/comunidad,
- cuenta avanzada con valor completo,
- pago real/PSP,
- stock real o logística avanzada,
- expansión SEO/editorial no imprescindible para el flujo comercial demo.

Tampoco corresponde crear prompts de refactor masivo transversal no vinculado al cierre ecommerce demo.

## 8. Riesgos de secuencia a evitar
1. **Empezar por frontend de checkout sin base transaccional**: genera sobrecoste y contradicciones de dominio.
2. **Unir múltiples frentes en un solo prompt gigante**: baja trazabilidad y complica validación.
3. **Dejar admin y email para “después”**: impide demostrar operación y cierre real del flujo.
4. **Posponer calidad al final sin controles intermedios**: acumula defectos y retrabajo.
5. **Abrir alcance de Ciclo 4+ dentro de Ciclo 3**: diluye foco y compromete cierre.

## 9. Decisiones congeladas y aspectos evolutivos
### Decisiones congeladas
- Objetivo del ciclo: **ecommerce demo completo**.
- Flujo obligatorio: carrito → checkout demo (autenticado/invitado) → pedido demo → confirmación → recibo/email demo.
- Sin cobro real ni stock real.
- Backoffice mínimo de pedidos demo dentro de ciclo.
- Quality gate obligatorio para declarar DONE.

### Aspectos evolutivos controlados
- El nivel exacto de endurecimiento del quality gate puede graduarse por prompt, sin perder obligatoriedad.
- Se podrán ajustar detalles de granularidad interna de prompts solo si no rompen el marco de 8 prompts ni el orden de dependencias críticas.
- Cualquier ajuste debe mantener Clean Architecture, separación de capas y coherencia editorial-comercial del producto.
