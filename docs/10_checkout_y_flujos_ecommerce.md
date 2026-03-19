# 10 — Checkout y flujos ecommerce demo

## 1. Propósito del documento
Definir la norma funcional oficial del flujo ecommerce demo de **La Botica de la Bruja Lore** para guiar implementación incremental de carrito, checkout, pedido demo, confirmación y trazabilidad operativa, sin confundir capacidades simuladas con capacidades reales no implementadas.

Este documento fija comportamiento de negocio y experiencia mínima creíble para fase demo, y sirve de base para prompts futuros de backend, frontend, email transaccional demo, cuenta de usuario e interfaz de administración.

## 2. Objetivos del ecommerce demo
1. Entregar un recorrido comercial completo de punta a punta (selección → carrito → checkout → pedido demo → confirmación).
2. Mantener una experiencia seria y confiable, alineada con identidad de marca, evitando una demo vacía o superficial.
3. Permitir compra demo tanto para usuario autenticado como para invitado, con reglas claras de datos requeridos.
4. Registrar pedido demo con trazabilidad suficiente para consulta posterior (usuario y backoffice).
5. Dejar explícita la frontera entre simulación funcional y operación real todavía fuera de alcance.
6. Preparar una base estable para evolución por ciclos sin reabrir fundamentos en cada implementación.

## 3. Principios rectores del flujo comercial demo
1. **Demo creíble, no engañosa**: se simula la experiencia de compra, no se simula infraestructura real inexistente.
2. **Completitud funcional mínima**: no basta un botón de compra; debe existir flujo completo con validaciones y cierre.
3. **Claridad operativa por encima de ornamento**: checkout corto, legible, serio y orientado a completar tarea.
4. **Separación editorial/comercial**: el checkout no absorbe narrativa extensa; la compra es una zona funcional.
5. **Coherencia semántica de catálogo**: unidades y tipos comerciales respetan reglas del dominio (granel, unidad, pack).
6. **Trazabilidad verificable**: todo pedido demo debe quedar identificable y consultable con estado explícito.
7. **Evolución controlada**: se congelan reglas nucleares y se dejan explícitos los aspectos evolutivos.

## 4. Alcance del ecommerce demo actual

### 4.1 En alcance (decisión consolidada)
- Carrito funcional con alta, edición, eliminación y recálculo de importes.
- Checkout demo con identificación y bifurcación entre usuario autenticado e invitado.
- Captura de datos mínimos de contacto y entrega para cerrar pedido demo.
- Revisión final previa a confirmación.
- Creación de pedido demo con identificador y estado inicial.
- Pantalla de confirmación posterior a compra demo.
- Emisión de email/recibo demo de confirmación.
- Capacidad futura explícita de historial de pedidos demo en cuenta de usuario.

### 4.2 Fuera de alcance en esta fase (decisión consolidada)
- Cobro real, conciliación de pagos o integración PSP real.
- Gestión de stock real o reserva de inventario.
- Logística real avanzada (transportistas, tracking real, incidencias operativas complejas).
- Fiscalidad completa por territorio y casuística legal exhaustiva.
- Motor avanzado antifraude.
- Automatizaciones complejas postventa (devoluciones reales, reembolsos reales, RMA completo).

## 5. Carrito y selección comercial

### 5.1 Rol del carrito
El carrito es la traducción operativa de la intención de compra demo. Debe mostrar de forma transparente qué se compra, en qué unidad comercial, en qué cantidad y por qué total.

### 5.2 Comportamiento mínimo obligatorio (decisión consolidada)
- Añadir producto desde catálogo comercial.
- Ajustar cantidad de líneas permitidas.
- Eliminar línea.
- Persistir la selección de manera suficiente para continuar al checkout.
- Mostrar subtotal, ajustes promocionales visibles y total estimado demo.
- Mantener coherencia de unidades:
  - Hierbas a granel: representación comercial v1 en tramos de 100 g.
  - Herramientas: unidad.
  - Packs/cestas: pack.

### 5.3 Datos mínimos por línea de carrito/pedido demo
Cada línea debe conservar al menos:
- `producto_id`.
- `tipo_producto` (granel, herramienta, pack).
- `nombre_comercial_snapshot`.
- `unidad_comercial_snapshot` (100 g, unidad, pack).
- `cantidad`.
- `precio_unitario_snapshot`.
- `descuento_aplicado_snapshot` (si aplica).
- `subtotal_linea_snapshot`.
- `referencia_editorial_relacionada` (opcional, no bloqueante para checkout).

Se usa enfoque *snapshot* para que el pedido demo conserve evidencia de lo mostrado al usuario en el momento de compra.

## 6. Checkout: identificación, invitado y usuario autenticado

### 6.1 Estructura funcional del checkout
El checkout demo se organiza en pasos lógicos cortos:
1. Identificación de modalidad (autenticado o invitado).
2. Datos de contacto y entrega.
3. Selección de envío demo y pago demo.
4. Revisión final.
5. Confirmación de pedido demo.

> **Propuesta operativa inicial razonada**: permitir versión de una sola página segmentada por bloques colapsables, manteniendo el mismo orden lógico y validación por bloque.

### 6.2 Identificación y acceso
#### Decisión consolidada
- Deben coexistir dos rutas: **continuar como invitado** y **continuar con cuenta**.
- La ruta invitado no puede depender de registro forzoso.

#### Propuesta operativa inicial razonada
- En la entrada del checkout, mostrar selector claro:
  - “Entrar con tu cuenta”.
  - “Continuar como invitado”.
- Para usuario no autenticado, permitir autenticación durante checkout sin perder carrito.

### 6.3 Usuario autenticado
#### Decisión consolidada
- Debe obtener ventaja real frente al invitado (no solo formalismo técnico).

#### Propuesta operativa inicial razonada
Ventajas mínimas en fase demo:
- Prefill de datos de contacto/entrega guardados.
- Menor fricción al confirmar.
- Asociación automática del pedido demo a su historial de cuenta.

### 6.4 Invitado
#### Decisión consolidada
- El invitado debe completar todos los datos imprescindibles para generar pedido demo y confirmación.

#### Campos/bloques imprescindibles para invitado
- Identificación personal mínima:
  - nombre
  - apellidos
- Contacto:
  - email
  - teléfono de contacto
- Entrega:
  - país
  - provincia/región
  - ciudad
  - código postal
  - dirección línea 1
  - dirección línea 2 (opcional)
  - instrucciones de entrega (opcional)
- Consentimientos operativos mínimos:
  - aceptación de términos de compra demo y aviso explícito de no cobro real
  - aceptación de política de privacidad aplicable

### 6.5 Revisión final antes de confirmar
Debe incluir:
- Resumen de líneas de carrito con unidades y cantidades.
- Subtotal, descuentos/promociones, envío demo y total demo final.
- Datos de contacto y entrega editables.
- Método de pago demo seleccionado.
- Mensaje explícito de entorno demo: no se realizará cobro real.

## 7. Pedido demo y estados asociados

### 7.1 Definición de pedido demo (decisión consolidada)
Un pedido demo es un registro transaccional interno que representa una intención de compra cerrada dentro del entorno de demostración, con trazabilidad funcional completa y sin efectos financieros reales.

### 7.2 Requisitos mínimos del pedido demo
- Identificador único legible (por ejemplo, prefijo `DEMO-`).
- Marca temporal de creación.
- Snapshot de líneas, importes y datos de contacto/entrega.
- Referencia a usuario autenticado o marca de invitado.
- Estado de flujo.
- Canal de creación (`web_demo`).

### 7.3 Estados de pedido demo
#### Decisión consolidada
- Debe existir estado explícito y visible para trazabilidad.

#### Propuesta operativa inicial razonada
Estados base recomendados para fase demo:
1. `creado_demo`.
2. `confirmado_demo`.
3. `preparacion_demo`.
4. `enviado_demo`.
5. `completado_demo`.
6. `cancelado_demo`.

No implican logística ni operación real; representan progresión narrativa-operativa de demostración para backoffice y cuenta.

## 8. Confirmación final y email/recibo demo

### 8.1 Confirmación en pantalla
Tras confirmar checkout, la aplicación debe mostrar una pantalla de cierre con:
- Número/identificador de pedido demo.
- Resumen breve de compra.
- Recordatorio explícito de que no hubo cobro real.
- Próximo paso esperado en contexto demo (p. ej., seguimiento en cuenta cuando esté activo).

### 8.2 Email/recibo demo
#### Decisión consolidada
- Debe emitirse confirmación/recibo demo tras creación del pedido.

#### Estructura mínima recomendada (propuesta operativa inicial)
- Asunto con identificador de pedido demo.
- Encabezado de confirmación.
- Resumen de líneas e importes.
- Datos de entrega/contacto registrados.
- Aviso visible de “entorno demo sin cobro real”.
- Pie con información de contacto del proyecto.

## 9. Promociones, packs, envíos y pagos simulados

### 9.1 Promociones y packs
#### Decisión consolidada
- Packs/cestas son línea comercial secundaria válida.
- Pueden mostrar lógica promocional visible sin desplazar el núcleo de catálogo herbal.

#### Propuesta operativa inicial razonada
- Permitir descuento simple por pack (porcentaje o importe fijo) representado de forma transparente en carrito y checkout.

### 9.2 Envío demo
#### Decisión consolidada
- Debe existir representación de gasto de envío simulado para credibilidad.

#### Propuesta operativa inicial razonada
- Regla base simple en fase demo:
  - tarifa estándar demo configurable,
  - envío gratis demo a partir de umbral configurable.

### 9.3 Pago demo
#### Decisión consolidada
- No hay cobro real en esta fase.

#### Propuesta operativa inicial razonada
- Exponer métodos de pago etiquetados explícitamente como simulados, por ejemplo:
  - “Tarjeta (simulado)”.
  - “Transferencia (simulado)”.
- Cualquier etiqueta o copy debe evitar ambigüedad sobre cobro real.

## 10. Conexión con cuenta de usuario, admin y capacidades futuras

### 10.1 Cuenta de usuario
- El flujo debe permitir que la cuenta entregue valor práctico: menor fricción y futuro historial de pedidos demo.
- Los pedidos demo de autenticados deben quedar asociados automáticamente.
- Para invitado, puede contemplarse evolución futura de vinculación posterior por email verificado, sin bloquear el cierre actual.

### 10.2 Historial de pedidos demo
- Capacidad prevista: listado de pedidos demo, detalle por pedido y estado.
- Debe apoyarse en los snapshots del pedido para mantener consistencia histórica.

### 10.3 Admin/backoffice
- El backoffice v1 debe poder consultar pedidos demo y actualizar estado dentro del ciclo demo.
- Debe quedar trazabilidad mínima de cambios de estado (actor + fecha/hora).

### 10.4 Capacidades futuras conectadas
Este flujo prepara base para:
- recordatorios de carrito abandonado demo,
- recomendaciones comerciales postpedido,
- comunicaciones transaccionales adicionales,
- transición gradual hacia operaciones reales cuando el ciclo lo habilite.

## 11. Límites explícitos de esta fase
Queda prohibido presentar como implementado o disponible:
- Pago real o cargo financiero efectivo.
- Stock vivo o promesa de disponibilidad en tiempo real.
- SLA logístico real o tracking real de operador.
- Cálculo fiscal completo multi-jurisdicción.
- Coberturas legales avanzadas no diseñadas aún.

Toda interfaz y comunicación debe mantener transparencia: experiencia completa de compra demo, sin afirmaciones engañosas de operación real.

## 12. Decisiones congeladas y aspectos evolutivos

### 12.1 Decisiones congeladas ahora
1. Existencia obligatoria de flujo ecommerce demo completo (carrito → checkout → pedido demo → confirmación).
2. Coexistencia obligatoria de usuario autenticado e invitado.
3. Registro obligatorio de pedido demo con identificador y estado.
4. Confirmación final obligatoria en pantalla + email/recibo demo.
5. Checkout funcional, claro y breve, sin sobrecarga narrativa.
6. Separación explícita entre capacidades demo y capacidades reales fuera de fase.
7. Coherencia con unidades comerciales por tipo de producto (100 g, unidad, pack).

### 12.2 Aspectos evolutivos permitidos
1. Orden visual exacto y microinteracciones del checkout.
2. Catálogo final de métodos de pago simulados.
3. Regla numérica concreta de envío demo (tarifa/umbral).
4. Granularidad futura del ciclo de estados de pedido demo.
5. Estrategia de migración de pedido invitado a cuenta registrada.
6. Plantilla final de email demo (copy, layout, tono), manteniendo bloques mínimos definidos.

Estos aspectos pueden evolucionar por ciclo sin romper la base, siempre que no contradigan las decisiones congeladas ni la verdad documental vigente.


## Actualización post-pago operativo v1.1
- El checkout real ya expone retornos `success` y `cancel` hacia `/pedido/[id_pedido]` con estado visible y siguiente acción recomendada.
- Cuando Stripe confirma `pagado`, el backend ejecuta un caso de uso post-pago desacoplado del webhook: persiste transición, envía email transaccional mínimo e incrementa trazabilidad operativa.
- El pedido real añade `requiere_revision_manual` y `email_post_pago_enviado` para conciliación mínima y seguimiento administrativo.
- El backoffice Next/Django ya puede listar pedidos reales y marcar el primer avance operativo `preparando` sin abrir todavía logística avanzada, fraude o devoluciones.
- Pendiente para el siguiente bloque: expedición real, tracking, incidencias, SLA operativos y automatización de estados posteriores.
