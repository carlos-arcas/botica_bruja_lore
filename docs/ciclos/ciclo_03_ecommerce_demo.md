# Ciclo 03 — Ecommerce demo completo

## 1. Propósito del documento
Definir el contrato oficial de alcance del **Ciclo 3** para cerrar un flujo ecommerce demo de punta a punta, coherente con los ciclos previos y con la estrategia portfolio-first, business-ready del proyecto. Este documento fija qué se implementa en este ciclo, qué queda explícitamente fuera y cómo se verifica el cierre real sin confundir planificación con funcionalidad ya entregada.

## 2. Objetivo oficial del Ciclo 3
Cerrar la transición de catálogo navegable a **experiencia de compra demo completa y creíble**, manteniendo la separación editorial/comercial y sin introducir capacidades de operación real todavía fuera de fase.

Al finalizar el ciclo, el producto debe permitir que una persona:
- seleccione productos del catálogo existente,
- gestione su carrito,
- complete checkout demo como autenticado o invitado,
- genere un `PedidoDemo` con trazabilidad,
- reciba confirmación final y recibo/email demo.

> **Decisión consolidada**: Ciclo 3 no equivale a “activar botón comprar”; equivale a cerrar el circuito comercial demo completo con evidencia verificable.

## 3. Entregable visible mínimo
Una ruta de compra demo funcional, navegable y defendible en entorno de demo, compuesta por:
- carrito funcional,
- checkout demo claro y breve,
- creación de pedido demo persistido,
- confirmación final visible,
- emisión de recibo/email demo,
- soporte mínimo en backoffice para consultar y sostener pedidos demo.

Este entregable debe integrarse sin romper la puerta principal herbal ni la navegación editorial-comercial ya consolidada en Ciclos 1 y 2.

## 4. Alcance obligatorio del ciclo

### 4.1 Alcance funcional obligatorio (decisión consolidada)
1. **Carrito funcional**
   - Alta, edición y eliminación de líneas.
   - Reglas mínimas de cantidades y recálculo de subtotales/totales demo.
   - Persistencia suficiente para continuar al checkout.

2. **Entrada a checkout demo**
   - Inicio de checkout desde carrito.
   - Bifurcación explícita entre compra como autenticado y compra como invitado.

3. **Checkout demo operativo**
   - Captura de datos mínimos de contacto y entrega requeridos para cerrar pedido demo.
   - Paso de revisión final antes de confirmar.
   - Tono UX transaccional: claro, sobrio y sin sobrecarga narrativa.

4. **Pedido demo con trazabilidad**
   - Creación de `PedidoDemo` y sus `LíneaPedido` con snapshot comercial mínimo.
   - Asociación de canal de compra (autenticado/invitado).
   - Estados básicos de pedido demo para operación mínima.

5. **Confirmación y comunicación demo**
   - Pantalla de confirmación final post-checkout.
   - Emisión de email/recibo demo coherente con el estado del pedido demo.

6. **Backoffice mínimo de pedidos demo**
   - Capacidad operativa mínima para consultar pedidos demo y su estado.
   - Soporte de trazabilidad básica para validación interna de la demo.

7. **Integración con catálogo vigente**
   - Uso de productos/categorías/unidades comerciales ya definidos.
   - Sin abrir remodelado de catálogo fuera de necesidades estrictas del flujo de compra demo.

### 4.2 Propuesta operativa inicial razonada (a consolidar en implementación)
Para mantener el ciclo abordable y defendible, se propone como base inicial:
- checkout de baja profundidad (pasos cortos o una sola vista segmentada por bloques),
- estados base de `PedidoDemo`: `creado`, `confirmado`, `cancelado_demo`,
- mínimo de ventaja para autenticado: prefill y asociación automática del pedido,
- mínimo de invitado: cierre completo sin registro forzado.

Estas propuestas son operativas y no alteran decisiones de dominio ya congeladas.

## 5. Fuera de alcance del ciclo
Queda explícitamente fuera de Ciclo 3:
- cobro real, integración PSP real y conciliación de pagos,
- stock real, reservas de inventario y logística real avanzada,
- fiscalidad completa por territorio y automatizaciones complejas postventa,
- evolución de cuenta de usuario con valor completo (favoritos, recordatorios, personalización profunda),
- calendario ritual como feature principal,
- capa social/comunitaria,
- correspondencias profundas como eje de experiencia,
- expansión SEO/editorial no necesaria para sostener el flujo comercial demo.

> **Decisión consolidada**: no se simula operación real inexistente; se implementa una compra demo creíble y transparente.

## 6. Dependencias y prerequisitos
El Ciclo 3 depende de capacidades ya cerradas en ciclos anteriores:
1. **Ciclo 1**: núcleo herbal navegable (home, listado/ficha herbal, base comercial mínima).
2. **Ciclo 2**: rituales conectados y navegación bidireccional herbal ↔ ritual.
3. **Base técnica vigente**: backend público mínimo, backoffice mínimo, contratos arquitectónicos y dominio documental activos.
4. **Anclas de dominio**: separación `Planta`/`Producto`, distinción editorial/comercial y uso de `PedidoDemo`/`LíneaPedido` como núcleo transaccional demo.

Sin estos prerequisitos no existe cierre defendible de flujo ecommerce demo completo.

## 7. Criterios de aceptación funcional
Se considera cumplido el ciclo únicamente si se verifica de forma integral:
1. Desde catálogo vigente se puede añadir producto al carrito y ajustar líneas de compra demo.
2. Desde carrito se accede a checkout demo sin pérdida de selección.
3. Checkout permite bifurcar entre autenticado e invitado sin forzar registro.
4. El invitado puede completar datos mínimos obligatorios y finalizar pedido demo.
5. El autenticado completa con menor fricción y el pedido queda asociado a su cuenta.
6. Confirmar checkout genera `PedidoDemo` persistido con sus `LíneaPedido` y estado inicial válido.
7. El usuario ve confirmación final inequívoca de pedido demo cerrado.
8. Se emite recibo/email demo coherente con la confirmación.
9. Backoffice mínimo permite consultar pedidos demo y su estado operativo básico.
10. La experiencia comercial nueva no rompe navegación ni coherencia de los flujos de Ciclo 1 y Ciclo 2.

## 8. Criterios de aceptación técnicos mínimos
1. Respeto explícito de Clean Architecture y fronteras dominio/aplicación/infraestructura/presentación.
2. Dominio desacoplado de framework y sin mezclar reglas transaccionales en capa de presentación.
3. Cobertura de tests suficiente para flujo crítico carrito → checkout demo → pedido demo → confirmación.
4. Quality gate aplicable en verde para declarar cierre del ciclo.
5. Trazabilidad técnica verificable de `PedidoDemo` y `LíneaPedido` (persistencia, estados, snapshots mínimos).
6. Logging estructurado en puntos transaccionales relevantes (inicio checkout, confirmación, creación pedido demo, error de validación).
7. i18n compatible con evolución dinámica futura, sin atajos que bloqueen cambio de idioma real.
8. Sin incorporación de artefactos compilados/binarios prohibidos.

## 9. Riesgos y desviaciones a evitar
1. **Reducir ciclo a UI superficial**: un botón de compra sin circuito completo no cumple objetivo.
2. **Sobrealcance de cuenta de usuario**: abrir valor avanzado en este ciclo diluye foco y compromete cierre.
3. **Abrir calendario ritual/capa social**: desvía el ciclo de su objetivo comercial demo.
4. **Fingir operación real inexistente**: rompe credibilidad y contradice principio de demo honesta.
5. **Checkout barroco o narrativo en exceso**: reduce conversión demo y contradice criterio UX transaccional.
6. **Debilitar administración mínima**: sin backoffice básico no hay sostenibilidad operativa de demo.
7. **Cerrar sin evidencia de calidad**: done sin tests/gate/trazabilidad equivale a ciclo no cerrado.
8. **Fragmentar experiencia en “dos productos”**: el ecommerce demo debe prolongar el sistema existente, no partirlo.

## 10. Evidencias de cierre del ciclo
Para declarar Ciclo 3 como cerrado deben existir, como mínimo:
1. Evidencia funcional de recorrido end-to-end en entorno de demo (catálogo → carrito → checkout → confirmación).
2. Evidencia de coexistencia autenticado/invitado operativa.
3. Evidencia de persistencia y trazabilidad de `PedidoDemo`/`LíneaPedido`.
4. Evidencia de emisión de recibo/email demo.
5. Evidencia de operación mínima en backoffice para pedidos demo.
6. Evidencia de no regresión de capacidades cerradas en Ciclo 1 y 2.
7. Evidencia de tests exigidos y quality gate aplicable aprobado.
8. Estado documental de ciclo actualizado a **done** solo tras validar todos los puntos anteriores.

## 11. Qué debe ocurrir al cerrar el ciclo
1. Actualizar `docs/90_estado_implementacion.md` con estado real de capacidades de ecommerce demo y evidencias de cierre.
2. Generar y aprobar `docs/ciclos/ciclo_03_roadmap_prompts.md` alineado con este contrato (sin reabrir alcance).
3. Recalibrar `docs/14_roadmap.md` para reflejar siguiente foco de evolución (cuenta de usuario con valor y/o capacidades posteriores), manteniendo secuencia por ciclos.
4. Mantener congelado el alcance de Ciclo 3 como referencia histórica y criterio de no regresión en ciclos siguientes.
