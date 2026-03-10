# Ciclo 03 — Reencauce de control por ciclos

## 1. Propósito
Restablecer gobierno estricto por ciclos para el estado actual del proyecto, dejando trazabilidad explícita entre lo implementado recientemente y el contrato oficial de Ciclo 3.

## 2. Diagnóstico consolidado
Clasificación: **C (deriva)**.

Se confirma deriva porque el contrato oficial de Ciclo 3 define como foco obligatorio el cierre del flujo ecommerce demo (carrito → checkout demo → pedido demo → confirmación → recibo/email), mientras que el trabajo reciente se concentró en capacidades comerciales/editoriales frontend sin completar el circuito transaccional demo.

## 3. Evidencia de desalineación
- Contrato de ciclo: `docs/ciclos/ciclo_03_ecommerce_demo.md`.
- Secuencia oficial: `docs/ciclos/ciclo_03_roadmap_prompts.md`.
- Estado operativo acumulado fuera del foco transaccional: `docs/90_estado_implementacion.md` (home comercial, catálogo/colecciones, encargo, shell, marca, legales y cesta ritual local).

## 4. Decisión operativa
No se abre nueva feature.

Se ejecuta un **microciclo documental de reencauce** para:
1. declarar deriva de forma explícita;
2. fijar estado oficial de ciclos;
3. congelar el siguiente paso único y verificable.

## 5. Estado oficial tras reencauce
- Ciclo 1: **DONE**.
- Ciclo 2: **DONE**.
- Ciclo 3 (ecommerce demo completo): **EN_PROGRESO**.
- Reencauce documental del control por ciclos: **DONE**.

## 6. Siguiente paso único permitido (microciclo funcional)
Retomar el **Prompt 1 del roadmap oficial de Ciclo 3**: base de dominio/aplicación transaccional demo para `PedidoDemo`/`LineaPedido` y reglas núcleo de carrito/checkout, con tests de dominio/aplicación.

## 7. Criterio de bloqueo
Cualquier trabajo nuevo que no se pueda mapear explícitamente al roadmap oficial de Ciclo 3 queda bloqueado por sobrealcance hasta cierre del flujo ecommerce demo.
