# Ciclo 05 — Calendario ritual y capa editorial diferencial

## 1. Propósito
Abrir oficialmente el Ciclo 5 con foco único y trazabilidad, como evolución inmediata tras el cierre oficial del Ciclo 4.

## 2. Objetivo oficial del ciclo
Implementar la base funcional del **calendario ritual** conectada al dominio existente (`Ritual` + `ReglaCalendario`) para mejorar descubrimiento editorial con utilidad temporal real, sin romper el recorrido comercial demo ya cerrado.

## 3. Foco único del ciclo
Capacidades mínimas de calendario editorial con frontera clara:
1. reglas de calendario desacopladas de `Ritual` (sin fusionar entidades);
2. casos de uso de consulta temporal/editorial reutilizables por API/UI;
3. exposición incremental sin tocar checkout ni cuenta demo.

## 4. Roadmap mínimo oficial de prompts
| Prompt | Foco | Dependencia | Entregable esperado |
|---|---|---|---|
| 1 | Dominio/aplicación de calendario ritual | Ciclo 4 cerrado | Entidad/VO de `ReglaCalendario` + casos de uso mínimos con tests unitarios. |
| 2 | Persistencia + API mínima de calendario | Prompt 1 | Adaptadores de persistencia y endpoint público básico de consulta. |
| 3 | Integración frontend editorial mínima + gate de ciclo | Prompt 2 | Bloque/entrada navegable de calendario ritual con no-regresión validada. |

## 5. Prompt 1 oficial del Ciclo 5
**Prompt 1 — Base de dominio/aplicación de calendario ritual:** implementar `ReglaCalendario` y casos de uso mínimos de consulta temporal conectados a `Ritual`, con tests unitarios y sin tocar checkout/cuenta/demo auth.

## 6. Restricciones de continuidad
- No reabrir alcances cerrados de Ciclos 3 y 4.
- No introducir pagos/logística real ni cambios de contrato en `PedidoDemo`/`CuentaDemo`.
- Cualquier ampliación editorial fuera del calendario queda fuera de este ciclo.
