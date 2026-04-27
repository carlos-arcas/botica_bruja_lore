# 10 — Checkout demo legado (`/encargo`) y flujos ecommerce demo

## 1. Propósito del documento
Definir la norma funcional oficial del flujo ecommerce demo de **La Botica de la Bruja Lore** para guiar implementación incremental de carrito, checkout, pedido demo, confirmación y trazabilidad operativa, sin confundir capacidades simuladas con capacidades reales no implementadas.

Este documento fija comportamiento de negocio y experiencia mínima creíble para fase demo, y sirve de base para prompts futuros de backend, frontend, email transaccional demo, cuenta de usuario e interfaz de administración.

Naming canónico vigente: **checkout demo legado (`/encargo`)** para la entrada pública que crea `PedidoDemo` y redirige al recibo `/pedido-demo/[id_pedido]`.

## 2. Objetivos del ecommerce demo
1. Entregar un recorrido comercial completo de punta a punta (selección → carrito → `/encargo` → pedido demo → confirmación).
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
- Checkout demo legado (`/encargo`) con identificación y bifurcación entre `invitado` y `cuenta-demo`.
- Captura en UI de `nombre`, `email`, `telefono`, `cantidad/formato`, `mensaje` y `consentimiento` para sostener el contexto comercial, el borrador local y el fallback manual.
- Conversión de la selección visible a un `PedidoDemo` mínimo con `lineas`, `email`, `canal` e `id_usuario` opcional.
- Revisión final previa a confirmación, con aviso explícito cuando existen líneas fuera del contrato final del pedido demo.
- Creación de pedido demo con identificador `PD-`, estado inicial y snapshot comercial reducido por línea.
- Pantalla de confirmación en `/pedido-demo/[id_pedido]` y consulta de email demo simulado.
- Historial de pedidos demo en `cuenta-demo` cuando existe vínculo por `id_usuario` y/o `email_contacto`.

### 4.2 Fuera de alcance en esta fase (decisión consolidada)
- Cobro real, conciliación de pagos o integración PSP real.
- Gestión de stock real o reserva de inventario.
- Captura y persistencia de datos postales de entrega dentro de `PedidoDemo`.
- Selectores de envío demo o pago demo persistidos en el contrato de `PedidoDemo`.
- Continuidad automática completa entre `cuenta-demo` y `/encargo` más allá de prefill de email, borrador local e `id_usuario`.
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
- Mostrar subtotal y total demo visibles de la selección, sin prometer descuentos ni recargos no persistidos.
- Mantener coherencia de unidades:
  - Hierbas a granel: representación comercial v1 en tramos de 100 g.
  - Herramientas: unidad.
  - Packs/cestas: pack.

### 5.3 Datos mínimos por línea de carrito/pedido demo
Cada línea persistida en `PedidoDemo` conserva hoy solo:
- `id_producto`.
- `slug_producto`.
- `nombre_producto`.
- `cantidad`.
- `precio_unitario_demo`.

El `subtotal_demo` se deriva en dominio/serialización y no se envía en el `POST` de creación. El contexto rico de la selección visible en `/encargo` (`formato`, `imagen_url`, `referencia_economica`, `notas_origen`) se usa para revisión comercial y fallback manual, pero no forma parte del snapshot persistido de `PedidoDemo`.

## 6. Checkout demo legado (`/encargo`): identificación, validación y cierre

### 6.1 Estructura funcional vigente
El flujo actual se resuelve así:
1. Entrada a `/encargo` desde ficha, cesta o acceso directo.
2. Resolución de canal: `invitado` o `autenticado` si existe `cuenta-demo` activa y el usuario la usa.
3. Validación dual:
   - capa de consulta/UI: `nombre`, `mensaje`, `consentimiento` y al menos un dato de contacto para construir el resumen comercial;
   - capa de checkout/pedido: líneas convertibles + `email` + `canal`, con `id_usuario` obligatorio cuando el canal es `autenticado`.
4. `POST /api/v1/pedidos-demo/` con payload mínimo y redirección estable al recibo.
5. Carga de detalle y `email-demo` en `/pedido-demo/[id_pedido]`.

### 6.2 Identificación y acceso
- El naming canónico del recorrido es **checkout demo legado (`/encargo`)**.
- Coexisten dos caminos: **continuar como invitado** y **usar cuenta demo**.
- Si el usuario entra en `cuenta-demo` desde `/encargo`, el flujo guarda borrador y retorno seguro a `/cuenta-demo?returnTo=%2Fencargo`.

### 6.3 Usuario autenticado
- Si hay `cuenta-demo` activa y el usuario no fuerza modo invitado, el flujo usa canal `autenticado`.
- La ventaja implementada hoy es mínima y verificable:
  - prefill de email desde la sesión demo;
  - inclusión de `id_usuario` en el payload de `PedidoDemo`;
  - continuidad mínima en historial/pedido reciente de `cuenta-demo`.
- Queda fuera del contrato vigente cualquier prefill de dirección, sesión compartida real o automatización completa de continuidad entre cuenta y checkout.

### 6.4 Invitado
- El modo invitado sigue siendo obligatorio y no depende de registro forzoso.
- Para crear `PedidoDemo`, la API exige actualmente `email`; el teléfono solo sirve como apoyo de contacto y para la capa manual de consulta/resumen.
- El formulario público exige además `nombre`, `mensaje` y `consentimiento` para sostener contexto comercial y trazabilidad del encargo.
- No existen hoy campos de entrega persistidos ni selector de dirección para el pedido demo.

### 6.5 Revisión final antes de confirmar
La revisión vigente debe dejar visibles:
- líneas convertibles del catálogo con cantidad y subtotal demo;
- advertencias sobre líneas fuera del contrato final del pedido demo;
- canal activo (`invitado` o `autenticado`);
- aviso explícito de entorno demo sin cobro real;
- fallback a consulta manual/canal real cuando la selección no puede convertirse en `PedidoDemo`.

## 7. Pedido demo y estados asociados

### 7.1 Definición de pedido demo (decisión consolidada)
Un pedido demo es un registro transaccional interno que representa una intención de compra cerrada dentro del entorno de demostración, con trazabilidad funcional completa y sin efectos financieros reales.

### 7.2 Requisitos mínimos del pedido demo
- Identificador único legible (prefijo actual `PD-`).
- Marca temporal de creación.
- Snapshot reducido de líneas e importes demo.
- `email_contacto`.
- `canal_compra` (`invitado` o `autenticado`).
- `id_usuario` opcional, obligatorio cuando el canal es `autenticado`.
- Estado visible del flujo.

### 7.3 Estados de pedido demo
- Debe existir estado explícito y visible para trazabilidad.
- Estados válidos vigentes en dominio:
  1. `creado`
  2. `confirmado`
  3. `cancelado_demo`
- El flujo público actual crea el pedido en `creado`; los demás estados quedan reservados para evolución controlada y soporte administrativo mínimo.

## 8. Confirmación final y email/recibo demo

### 8.1 Confirmación en pantalla
Tras confirmar checkout, la aplicación debe mostrar una pantalla de cierre con:
- Número/identificador de pedido demo.
- Estado, email y canal del pedido.
- Resumen breve de compra con líneas y subtotal demo.
- Recordatorio explícito de que no hubo cobro real.
- Próximo paso esperado en contexto demo (`cuenta-demo` cuando existe sesión compatible).

### 8.2 Email/recibo demo
- Debe existir consulta de email demo simulado en `/api/v1/pedidos-demo/{id_pedido}/email-demo/`.
- La estructura mínima vigente incluye:
  - asunto con identificador de pedido demo;
  - resumen de líneas e importes;
  - `email_destino` y canal usados en el pedido;
  - aviso visible de entorno demo y simulación sin envío real.
- El email demo actual no persiste datos de entrega ni representa logística real.

## 9. Promociones, packs, envíos y pagos simulados

### 9.1 Promociones y packs
#### Decisión consolidada
- Packs/cestas son línea comercial secundaria válida.
- Pueden entrar en el flujo si existen como producto público convertible a `PedidoDemo`.
- El contrato vigente de `PedidoDemo` no persiste descuentos ni snapshots promocionales específicos.

### 9.2 Envío demo
- El checkout demo legado no persiste hoy método ni importe de envío dentro de `PedidoDemo`.
- Las expectativas operativas de envío/preparación se encuadran fuera del pedido demo, mediante la superficie informativa `'/envios-y-preparacion'`.

### 9.3 Pago demo
- No hay cobro real en esta fase.
- El flujo vigente no persiste selector de método de pago demo.
- La garantía contractual actual es únicamente el aviso explícito de “sin cobro real” en `/encargo`, recibo y email demo.

## 10. Conexión con cuenta de usuario, admin y capacidades futuras

### 10.1 Cuenta de usuario
- El flujo ya permite valor práctico mínimo desde `cuenta-demo`: prefill de email, canal `autenticado`, pedido reciente e historial asociado.
- Los pedidos demo en canal `autenticado` deben incluir `id_usuario`; fuera de ese caso, la continuidad es parcial y controlada.
- Para invitado, puede contemplarse evolución futura de vinculación posterior por email verificado, sin bloquear el cierre actual.

### 10.2 Historial de pedidos demo
- Capacidad vigente: listado de pedidos demo, detalle por pedido y estado.
- Se apoya en el snapshot reducido del pedido y en el vínculo por `id_usuario` y/o `email_contacto`.

### 10.3 Admin/backoffice
- El backoffice v1 ya puede consultar pedidos demo y actualizar estado dentro del ciclo demo.
- Debe mantener trazabilidad mínima de cambios de estado (actor + fecha/hora).

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
1. Existencia obligatoria del flujo ecommerce demo legado (`/encargo` → `PedidoDemo` → confirmación/recibo).
2. Coexistencia obligatoria de usuario autenticado e invitado.
3. Registro obligatorio de pedido demo con identificador y estado.
4. Confirmación final obligatoria en pantalla + email/recibo demo.
5. Checkout funcional, claro y breve, sin sobrecarga narrativa.
6. Separación explícita entre capacidades demo y capacidades reales fuera de fase.
7. Snapshot persistido de `PedidoDemo` reducido a líneas convertibles + contacto/canal mínimos, sin datos de entrega ni pago simulado.

### 12.2 Aspectos evolutivos permitidos
1. Orden visual exacto y microinteracciones del checkout.
2. Integración más fuerte entre `cuenta-demo` y `/encargo`.
3. Simulación estructurada de envío demo y pago demo, si se decide reabrirla con evidencia.
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

## Actualización operación física y expedición v1.2
- El agregado `Pedido` ya cubre el ciclo operativo mínimo `pagado -> preparando -> enviado -> entregado` con fechas explícitas de preparación, envío y entrega.
- Datos de expedición activos en backend/API pública: `transportista`, `codigo_seguimiento`, `envio_sin_seguimiento`, `fecha_preparacion`, `fecha_envio`, `fecha_entrega`, `observaciones_operativas`, `email_envio_enviado`.
- Política operativa vigente: al marcar `enviado` el transportista es obligatorio; el tracking también lo es salvo que staff marque explícitamente `envio_sin_seguimiento=True`.
- El backoffice real ya lista pedidos por estado y permite marcar `preparando`, `enviado` y `entregado`, incluyendo captura manual de tracking, transportista y observaciones operativas.
- `/pedido/[id_pedido]` ya muestra estado operativo, tracking/transportista cuando existe y mensajes de seguimiento para no dejar al cliente a ciegas después del pago.
- El email transaccional mínimo de envío ya se dispara al pasar a `enviado`, con guardas razonables para evitar duplicados.
- Sigue fuera de alcance en esta fase: devoluciones complejas, fraude, stock duro, SLA avanzados, multi-almacén y logística enterprise.
