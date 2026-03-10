# Ciclo 4 — Roadmap oficial de prompts de implementación

## 1. Propósito
Definir la secuencia mínima y oficial de prompts para ejecutar el Ciclo 4 sin deriva y con trazabilidad de valor de cuenta.

## 2. Prompt 1 oficial del Ciclo 4
**Prompt 1 — Base de dominio/aplicación de cuenta con valor**:
implementar casos de uso y contratos de aplicación para autenticación de cuenta demo, consulta de perfil mínimo y listado de historial de `PedidoDemo` asociado, con tests de dominio/aplicación.

## 3. Secuencia mínima del ciclo
| Prompt | Foco | Dependencia | Entregable esperado |
|---|---|---|---|
| 1 | Dominio/aplicación cuenta | C3 cerrado | Casos de uso y contratos de cuenta + historial de pedidos demo con tests. |
| 2 | Infraestructura/persistencia cuenta | Prompt 1 | Modelos/repositorios/adaptadores persistentes para cuenta e historial. |
| 3 | API/backoffice mínimo de cuenta | Prompt 2 | Endpoints y soporte admin mínimo para operar cuenta demo. |
| 4 | Frontend + gate del ciclo | Prompt 3 | Área de usuario navegable con historial demo y validación de calidad del ciclo. |

## 4. Reglas de paso
Solo se avanza al prompt siguiente cuando el actual tenga evidencia verificable, tests en verde y sin regresión del flujo ecommerce demo cerrado en Ciclo 3.

## 5. Restricción de alcance
No se permite implementar capacidades de Ciclo 5+ dentro de este roadmap.
