# 17 — Migración ecommerce demo → ecommerce real

> **Historico normalizado 2026-04-28**: este documento registra la migracion demo -> real y la etapa en la que Stripe quedo preparado por puerto/adaptador. La fase vigente local no usa Stripe como proveedor activo: `BOTICA_PAYMENT_PROVIDER=simulado_local` es el modo local y Stripe queda reservado para fase futura. Para estado actual manda `docs/90_estado_implementacion.md` y para la fase local manda `docs/roadmap_ecommerce_local_simulado.md`.

## 1. Propósito
Cerrar formalmente la etapa en la que `PedidoDemo` actuaba como único núcleo transaccional evolutivo y abrir un contrato canónico de ecommerce real sin romper el flujo demo existente ni ejecutar un reemplazo big bang.

## 2. Estado de esta decisión
- Estado documental: **DEFINIDO**.
- Estado técnico de transición: **EN_PROGRESO**.
- Estado del flujo demo actual: **DONE como legado controlado**.

## 3. Inventario accionable de anclas demo activas
### 3.1 Backend
| Ancla demo | Ubicación actual | Rol | Acción de migración |
|---|---|---|---|
| `PedidoDemo` | `backend/nucleo_herbal/dominio/pedidos_demo.py` | agregado raíz actual del checkout demo | congelar como legado controlado; no ampliar semántica real aquí |
| `LineaPedido` demo | `backend/nucleo_herbal/dominio/pedidos_demo.py` | snapshot de línea demo | mantener sólo para flujo legacy; el contrato real vive en `dominio/pedidos.py` |
| `PedidoDemoDTO`, `ResumenPedidoDemoDTO` | `backend/nucleo_herbal/aplicacion/dto.py` | DTOs del contrato demo | mantener compatibilidad temporal; no reutilizar como DTO real |
| `/api/v1/pedidos-demo/` | `backend/nucleo_herbal/presentacion/publica/urls_pedidos_demo.py` | endpoint público actual | mantener coexistencia; marcar como ruta legacy a deprecar |
| email demo | `backend/nucleo_herbal/aplicacion/casos_de_uso_email_demo.py` | confirmación simulada | conservar como pieza demo, sin reutilizar para email productivo |
| backoffice pedidos demo | `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py` y `models.py` | operación histórica demo | mantener visibilidad como histórico; no presentarlo como operación real |

### 3.2 Frontend
| Ancla demo | Ubicación actual | Rol | Acción de migración |
|---|---|---|---|
| `PayloadPedidoDemo` | `frontend/contenido/catalogo/checkoutDemo.ts` | contrato de envío actual | dejarlo aislado como legacy; introducir `PayloadPedido` en módulo real futuro |
| `checkoutDemo.ts` | `frontend/contenido/catalogo/checkoutDemo.ts` | reglas del checkout actual | congelar alcance demo y evitar nuevas extensiones reales |
| cliente API demo | `frontend/infraestructura/api/pedidosDemo.ts` | cliente HTTP del flujo actual | mantener operativo; futura coexistencia con `pedidos.ts` real |
| `/pedido-demo/[id_pedido]` | `frontend/app/pedido-demo/[id_pedido]/page.tsx` | recibo legacy | mantener accesible para pedidos demo existentes |
| `/pedido-demo` | `frontend/app/pedido-demo/page.tsx` | entrada/estado del recibo demo | mantener sin ampliar |
| cuenta demo | `frontend/app/cuenta-demo/page.tsx`, `frontend/componentes/cuenta_demo/` | continuidad post-checkout legacy | encapsular como capa demo, separada de futura cuenta real |
| copy “sin cobro real / pedido demo / cuenta demo” | `frontend/componentes/catalogo/encargo/`, `frontend/componentes/cuenta_demo/` | honestidad del entorno actual | conservar mientras el flujo sea demo; no reciclar este copy en el checkout real |

## 4. Contrato canónico real definido en este bloque
El núcleo real deja de llamarse demo y pasa a declararse con estos elementos canónicos:
- `Pedido`
- `LineaPedido`
- `PayloadPedido`
- `DetallePedido`
- `CanalCheckout`
- `EstadoPedido`
- `DireccionEntrega`
- `ClientePedido`

### 4.1 Campos reutilizables desde demo
- `id_pedido`
- `email_contacto` / `email` → consolidado dentro de `ClientePedido.email`
- `id_usuario` → renombrado a `id_cliente`
- `lineas[].id_producto`
- `lineas[].slug_producto`
- `lineas[].nombre_producto`
- `lineas[].cantidad`
- `precio_unitario_demo` → renombrado a `precio_unitario`

### 4.2 Campos que deben renombrarse
| Demo | Real canónico |
|---|---|
| `canal_compra` / `canal` | `canal_checkout` |
| `email_contacto` / `email` | `cliente.email` |
| `id_usuario` | `cliente.id_cliente` |
| `precio_unitario_demo` | `precio_unitario` |
| `subtotal_demo` | `subtotal` |

### 4.3 Campos mínimos activos para ecommerce real v1 con pago
- `direccion_entrega`
- `moneda`
- `cliente.es_invitado`
- `estado_pago`
- `proveedor_pago`
- `id_externo_pago`
- `url_pago`
- `fecha_creacion` y `fecha_pago_confirmado`

### 4.4 Estados mínimos reales v1
1. `pendiente_pago`
2. `pagado`
3. `preparando`
4. `enviado`
5. `entregado`
6. `cancelado`

## 5. Estrategia de migración incremental sin big bang
La estrategia oficial es **coexistencia con capa anti-corrupción**.

### 5.1 Reglas de convivencia
1. `PedidoDemo` sigue operativo sólo como **legacy controlado**.
2. El contrato real nace en `backend/nucleo_herbal/dominio/pedidos.py`.
3. Cualquier lectura cruzada entre demo y real debe pasar por adaptadores explícitos.
4. Las rutas demo actuales no se rompen mientras no exista la nueva ruta real completa.
5. Queda prohibido añadir nuevas necesidades reales a `PedidoDemo` salvo correcciones de compatibilidad o integridad legacy.

### 5.2 Anti-corrupción aplicada
- Adaptador inicial: `backend/nucleo_herbal/aplicacion/anti_corrupcion_pedidos_demo.py`.
- Objetivo: traducir `PedidoDemo` → `DetallePedido` sin reetiquetar masivamente el sistema.
- Uso: reporting, transición documental, futura migración de backoffice y validación de compatibilidad.

### 5.3 Rutas y contratos a empezar a retirar
- `POST /api/v1/pedidos-demo/`
- `GET /api/v1/pedidos-demo/{id_pedido}/`
- `GET /api/v1/pedidos-demo/{id_pedido}/email-demo/`
- `frontend/contenido/catalogo/checkoutDemo.ts`
- `frontend/infraestructura/api/pedidosDemo.ts`
- `frontend/app/pedido-demo/[id_pedido]/page.tsx`

**Nota**: se retiran por sustitución gradual, no por borrado inmediato.

## 6. Frontera explícita de este bloque
### Incluido ahora
- contrato real canónico;
- inventario accionable de anclas demo;
- decisión formal de legado controlado;
- estrategia incremental con anti-corrupción.

### Fuera de alcance ahora
- devoluciones/reembolsos;
- fraude;
- fiscalidad completa;
- stock real;
- transportistas reales;
- emails transaccionales productivos definitivos.

## 7. Siguiente bloque obligatorio
El siguiente bloque debe implementar el **checkout real v1** sobre el nuevo contrato `Pedido`, con:
1. creación de `PayloadPedido` real desde frontend;
2. endpoint `/api/v1/pedidos/` coexistiendo con `/api/v1/pedidos-demo/`;
3. persistencia real inicial de `Pedido` y `DireccionEntrega`;
4. creación/autovinculación de cuenta real/invitado sin reutilizar `CuentaDemo`.


## 8. Implementación activa — checkout real v1
- Estado técnico: **DONE** para checkout real v1 inicial en coexistencia.
- Ruta canónica activa: `/api/v1/pedidos/`.
- Contrato HTTP real activo: `email_contacto`, `nombre_contacto`, `telefono_contacto`, `lineas`, `canal_checkout`, `direccion_entrega`, `notas_cliente`, `id_usuario` opcional y `moneda`.
- Persistencia real activa: agregado `Pedido` en `nucleo_pedido` + líneas en `nucleo_linea_pedido`.
- Estado inicial real: `pendiente_pago`.
- El flujo demo legado (`/api/v1/pedidos-demo/`, `/encargo`, `/pedido-demo/[id_pedido]`) permanece operativo como compatibilidad controlada.
- Siguiente bloque recomendado: integrar intento de pago real desacoplado (PSP + intención de pago + transición `pendiente_pago` → `pagado`) sin romper la persistencia y la dirección ya consolidadas.


## 9. Implementación activa — pago real v1
- Estado técnico: **DONE** para primera capa operativa de pago real.
- PSP real v1 preparado historicamente: **Stripe** mediante puerto desacoplado `PuertoPasarelaPago`; en la fase local vigente no es proveedor activo.
- Rutas nuevas activas: `POST /api/v1/pedidos/{id_pedido}/iniciar-pago/` y `POST /api/v1/pedidos/webhooks/stripe/`.
- Persistencia activa: referencia externa `id_externo_pago`, `proveedor_pago`, `estado_pago`, `url_pago`, `fecha_pago_confirmado` y tabla de idempotencia de webhooks.
- Frontend activo: botón **Pagar ahora** en `/pedido/[id_pedido]` para redirigir al checkout hospedado del PSP.
- Coexistencia preservada: `PedidoDemo` y `/api/v1/pedidos-demo/` continúan como legacy controlado.
- Siguiente bloque recomendado: post-pago operativo v1.1 con cancelación explícita, email transaccional real, conciliación/manual review mínima y primer cierre administrativo del pedido pagado.


## Actualización post-pago operativo v1.1
- El checkout real ya expone retornos `success` y `cancel` hacia `/pedido/[id_pedido]` con estado visible y siguiente acción recomendada.
- Historico de proveedor real preparado: cuando Stripe confirma `pagado`, el backend ejecuta un caso de uso post-pago desacoplado del webhook. En la fase local vigente, la confirmacion activa entra por `simulado_local`.
- El pedido real añade `requiere_revision_manual` y `email_post_pago_enviado` para conciliación mínima y seguimiento administrativo.
- El backoffice Next/Django ya puede listar pedidos reales y marcar el primer avance operativo `preparando` sin abrir todavía logística avanzada, fraude o devoluciones.
- Pendiente para el siguiente bloque: expedición real, tracking, SLA operativos y automatización de estados posteriores.


## Actualización cuenta real v1
- Estado técnico: **DONE** para cuenta real v1 basada en sesión backend + hash seguro de Django.
- Contrato canónico activo: `CuentaCliente` separada de `CuentaDemo`, con email único, nombre visible, `activo`, `email_verificado`, timestamps y password hash persistido en `auth_user` + `nucleo_cuenta_cliente`.
- Rutas activas: `POST /api/v1/cuenta/registro/`, `POST /api/v1/cuenta/login/`, `POST /api/v1/cuenta/logout/`, `GET /api/v1/cuenta/sesion/`, `GET /api/v1/cuenta/pedidos/`, `GET /api/v1/cuenta/pedidos/{id_pedido}/`.
- Asociación operativa: si existe sesión autenticada real, `POST /api/v1/pedidos/` fuerza `canal_checkout=web_autenticado` y vincula el pedido al `usuario_id` real sin pasar por `CuentaDemo`.
- Frontend canónico activo: `/registro`, `/acceso`, `/mi-cuenta`, `/mi-cuenta/pedidos`.
- Legado preservado: `/cuenta-demo` y `/api/v1/cuentas-demo/` permanecen operativos como compatibilidad explícita y congelada.
- Siguiente bloque recomendado: identidad/cliente v1.1 (verificación de email, recuperación de contraseña, libreta de direcciones y consolidación de checkout autenticado UX-first).


## Actualización cuenta real v1.1 — libreta de direcciones
- Estado técnico: **DONE** para CRUD autenticado de direcciones de `CuentaCliente`.
- Contrato activo: dirección separada de pedido real, ligada explícitamente a cuenta y compatible con el shape futuro de `DireccionEntrega`.
- Rutas activas: `GET|POST /api/v1/cuenta/direcciones/`, `PUT|DELETE /api/v1/cuenta/direcciones/{id}/`, `POST /api/v1/cuenta/direcciones/{id}/predeterminada/`.
- Regla operativa: una sola predeterminada por cuenta; primera alta automática; reasignación determinista al borrar la predeterminada.
- Frontend activo: `/mi-cuenta/direcciones` desde la navegación de cuenta real.
- Integración activa en checkout real: `POST /api/v1/pedidos/` acepta exactamente una fuente de dirección (`direccion_entrega` manual o `id_direccion_guardada` autenticada), resuelve la libreta en backend y persiste snapshot limpio en `Pedido`.
- UX activa en `/checkout`: si la sesión real tiene direcciones, se preselecciona la predeterminada, se puede alternar entre direcciones guardadas y modo manual, y el invitado conserva el flujo manual sin contaminación.
- Regla histórica preservada: el pedido nunca queda enlazado en vivo a la libreta; editar o borrar después una dirección no muta pedidos ya creados.

## Actualización inventario real v1
- Estado técnico: **DONE** para base mínima de inventario real por producto vendible.
- Fuente de verdad activa: tabla dedicada `nucleo_inventario_producto` con unicidad 1:1 respecto a `Producto`.
- Semántica base activa: inventario en enteros con `unidad_base` canónica (`ud`, `g`, `ml`) validada en dominio y persistencia; migración compatible de existentes con default conservador `ud`.
- Capacidad activa backend:
  - agregado puro `InventarioProducto` desacoplado de Django;
  - casos de uso para crear inventario inicial, consultar stock actual, ajustar stock y listar inventario operativo;
  - validación explícita para impedir stock negativo, unidades inválidas, decimales ambiguos y duplicados por producto.
- Operación interna activa:
  - Django Admin ya permite listar, buscar y editar cantidad disponible/unidad base/umbral de bajo stock;
  - señal visible de `bajo_stock` preparada para operación mínima sin abrir todavía catálogo público.
- Enforcement transaccional mínimo activo:
  - `POST /api/v1/pedidos/` valida stock por línea antes de persistir `Pedido`;
  - si un producto no tiene inventario registrado, el pedido se rechaza como no disponible;
  - si la cantidad solicitada supera el disponible, el pedido se rechaza completo con contrato JSON estable (`codigo=stock_no_disponible` + detalle por línea);
  - el checkout real ya refleja este rechazo sin introducir todavía reservas ni decrementos automáticos.
- Actualización pública mínima activa:
  - la exposición pública mínima ya reutiliza la fuente real de inventario para `disponible` y `estado_disponibilidad`;
  - los endpoints de producto por planta, detalle público de producto y productos relacionados desde ritual informan disponibilidad honesta sin cantidades exactas;
  - Botica Natural y el checkout real consumen ese contrato como señal informativa previa, dejando explícito que no existe reserva temporal.
- Fuera de alcance preservado:
  - sin descuento automático por pedido o pago;
  - sin reservas transaccionales;
  - sin fechas de reposición, alertas al cliente ni logística avanzada.

- Prompt 08: **DONE** para exposición pública mínima de disponibilidad de stock conectada al inventario real en APIs públicas de producto, ficha Botica Natural, productos relacionados de ritual y aviso informativo en checkout real; sin reservas, decremento automático ni promesa de stock duro.

## Actualización inventario post-pago real v1.1
- Estado técnico: **DONE** para decremento efectivo de inventario al confirmar pago real.
- Punto de verdad activo: el descuento ocurre dentro del caso de uso post-pago desacoplado del webhook, nunca en checkout previo.
- Persistencia activa: `Pedido` añade `inventario_descontado` e `incidencia_stock_confirmacion` como marcas explícitas de auditoría mínima.
- Regla operativa activa:
  - si un proveedor de pago confirma `pagado` y hay stock suficiente, el sistema descuenta todas las líneas en una transacción atómica y marca el pedido como descontado una sola vez;
  - si el webhook se repite o el caso de uso se reejecuta, la idempotencia evita dobles descuentos;
  - si falta stock en ese momento, no se descuenta nada, no se permite stock negativo, el pedido queda `pagado` con incidencia operativa y `requiere_revision_manual=True`;
  - si la `unidad_comercial` de una línea no coincide con la `unidad_base` del inventario, no se descuenta inventario, se registra incidencia operativa auditable y el pedido queda en revisión manual;
  - en escenario de incidencia, se omite el email post-pago estándar para no fingir cierre operativo exitoso.
- Logging activo:
  - descuento correcto por pedido pagado;
  - reintento idempotente;
  - conflicto de stock al confirmar pago;
  - conflicto de unidad línea↔inventario al confirmar pago;
  - generación de incidencia operativa.
- Fuera de alcance preservado:
  - sin reservas previas;
  - sin compensaciones automáticas por cancelación o devolución;

## Actualización semántica comercial de producto (R02)
- Estado técnico: **DONE** para contrato comercial explícito en `Producto`.
- Contrato activo:
  - `unidad_comercial` en catálogo cerrado (`ud`, `g`, `ml`);
  - `incremento_minimo_venta` entero > 0;
  - `cantidad_minima_compra` entero > 0 y múltiplo del incremento.
- Coherencia activa con R01:
  - validación mínima de backoffice para impedir que un producto con inventario existente quede con `unidad_comercial` distinta de `unidad_base`.
- Compatibilidad:
  - migración no destructiva con defaults conservadores (`ud`, `1`, `1`) para productos existentes;
  - sin cambios todavía en línea de pedido real ni checkout granel completo (quedan en R03/R04).
  - sin multi-almacén, lotes, caducidades ni ledger completo de movimientos.

## Actualización operativa backoffice incidencias stock post-pago v1.2
- Estado técnico: **DONE** para operación mínima en Django Admin sobre pedidos pagados con incidencia de stock tras confirmación de pago.
- Persistencia activa: `Pedido` añade `incidencia_stock_revisada` y `fecha_revision_incidencia_stock` para distinguir entre “hubo incidencia” y “ya fue revisada operativamente” sin borrar la señal histórica `incidencia_stock_confirmacion`.
- Backoffice activo:
  - changelist de pedidos reales con filtros directos para incidencias de stock pendientes/revisadas;
  - visibilidad explícita de estado, estado de pago, descuento de inventario, incidencia, revisión manual y fecha operativa relevante;
  - acción administrativa mínima para marcar la incidencia como revisada desde Django Admin.
- Regla operativa activa:
  - revisar una incidencia no recompone inventario, no reembolsa, no cancela y no envía emails automáticos;
  - la revisión baja `requiere_revision_manual` y deja trazabilidad con fecha de revisión y logging estructurado de actor/operation_id.
- Fuera de alcance preservado:
  - sin workflow complejo de soporte;
  - sin automatismos de resolución de negocio;
  - sin panel administrativo adicional en Next para este caso.

## Actualización cancelación operativa manual por incidencia stock v1.3
- Estado técnico: **DONE** para salida mínima real de cancelación operativa manual de pedidos incidenciados tras pago.
- Persistencia activa: `Pedido` añade `cancelado_operativa_incidencia_stock`, `fecha_cancelacion_operativa` y `motivo_cancelacion_operativa` para auditar la decisión sin borrar el histórico de pago e incidencia.
- Regla operativa activa:
  - solo se permite cancelar cuando existe `incidencia_stock_confirmacion=True` y el pedido permanece en `estado=pagado`;
  - la cancelación cambia `estado` a `cancelado` y deja constancia explícita de motivo y fecha;
  - no hay reembolso automático, ni devolución automática de inventario, ni emails automáticos.
- Backoffice activo:
  - Django Admin incorpora acción `Cancelar operativamente por incidencia de stock`;
  - la vista de listado/detalle muestra de forma explícita la nueva trazabilidad de cancelación;
  - se registran logs estructurados tanto en cancelaciones correctas como en intentos rechazados por estado inválido o falta de incidencia.

## Actualización reembolso manual explícito v1.4
- Estado técnico: **DONE** para reembolso manual de pedidos reales cancelados operativamente por incidencia de stock.
- Condiciones activas del caso de uso:
  1. pedido en `estado=cancelado` con `cancelado_operativa_incidencia_stock=True`;
  2. `estado_pago=pagado`;
  3. referencia de pago externa válida (`id_externo_pago`);
  4. sin reembolso ejecutado previo (`estado_reembolso!=ejecutado`).
- Persistencia activa de auditoría mínima:
  - `estado_reembolso` (`no_iniciado` | `fallido` | `ejecutado`);
  - `fecha_reembolso`;
  - `id_externo_reembolso`;
  - `motivo_fallo_reembolso`.

## Actualización envío estándar v1 y total real de pedido
- Estado técnico: **DONE** para coste de envío mínimo honesto sin motor de tarifas.
- Contrato activo:
  - `Pedido` expone `metodo_envio` (v1: `envio_estandar`), `importe_envio` y `total`.
  - `total` se calcula de forma canónica como `subtotal + importe_envio`.
- Configuración activa:
  - tarifa fija desacoplada por entorno con `ENVIO_ESTANDAR_IMPORTE` (default local/test: `4.90`).
- Integración activa:
  - checkout y detalle de pedido muestran subtotal + envío + total;
  - la intención de pago real y el payload hacia Stripe usan el total real (incluyendo envío).
- Fuera de alcance preservado:
  - sin múltiples métodos de envío;
  - sin reglas por provincia/país;
  - sin impuestos/IVA;
  - sin envío gratis por umbral ni promociones.

## Actualización visibilidad cliente cancelación/reembolso v1.5
- Estado técnico: **DONE** para visibilidad cliente de cancelación operativa y reembolso en `detalle de pedido` y `mi cuenta`.
- Contrato backend consumido por frontend:
  - se añade `estado_cliente.cancelado_operativamente`;
  - se añade `estado_cliente.estado_reembolso` (`no_iniciado` | `fallido` | `ejecutado`);
  - se añade `estado_cliente.fecha_reembolso` cuando exista.
- Regla UX activa:
  1. copy sobrio y honesto;
  2. sin emails, soporte ni workflows extra;
  3. sin exponer detalle operativo interno adicional en la UI cliente.
- Backoffice activo: acción en Django Admin para ejecutar reembolso manual explícito y visualización del resultado real (éxito o fallo) sin maquillar estados.
- Límites preservados en este bloque: sin reembolso automático al cancelar, sin devolución automática de inventario y sin emails automáticos al cliente.

## Actualización inventario ledger mínimo v1.2 (R06)
- Estado técnico: **DONE** para trazabilidad mínima auditable de movimientos de inventario.
- Persistencia activa: nueva tabla `nucleo_movimiento_inventario` con cantidad entera, unidad base, tipo cerrado, referencia contextual, `operation_id` y fecha.
- Regla operativa activa:
  - el stock actual sigue viviendo en `nucleo_inventario_producto` como fuente de verdad operativa;
  - alta inicial, ajuste manual y descuento post-pago exitoso generan movimiento;
  - los reintentos idempotentes de confirmación de pago no duplican `descuento_pago`.
- Fuera de alcance preservado:
  - sin recálculo de stock desde ledger;
  - sin multi-almacén, lotes, caducidades ni panel analítico nuevo.

## Actualización backoffice inventario Next v1.3 (R07)
- Estado técnico: **DONE** para superficie propia de inventario en backoffice Next.
- Superficie operativa principal:
  - nueva ruta `frontend/app/admin/(panel)/inventario/page.tsx`;

## Actualización restitución manual de inventario v1.4 (R08)
- Estado técnico: **DONE** para restitución manual explícita e idempotente de inventario en pedidos cancelados operativamente.
- Operativa activa:
  - caso de uso dedicado en backoffice (`RestituirInventarioManualPedidoCancelado`) con validación de elegibilidad conservadora;
  - solo permite restituir cuando el pedido ya descontó inventario, está cancelado operativamente y no fue restituido antes;
  - incrementa stock actual por `cantidad_comercial` y registra `restitucion_manual` en ledger mínimo por línea;
  - reintentos idempotentes no duplican movimiento ni vuelven a incrementar stock.
- Superficie activa:
  - acción Django Admin en pedidos reales: **Restituir inventario manualmente (pedido cancelado)**.
- Fuera de alcance preservado:
  - sin automatización al cancelar o reembolsar;
  - sin reglas complejas de devoluciones;
  - sin cambios en checkout público, fiscalidad o logística.
  - navegación integrada con módulos existentes del panel admin (`Inventario` visible junto a productos/pedidos/rituales).
- API privada mínima usada por Next:
  - `GET /api/v1/backoffice/inventario/` (listado operativo);
  - `GET /api/v1/backoffice/inventario/<producto_id>/` (detalle + últimos movimientos);
  - `POST /api/v1/backoffice/inventario/<producto_id>/ajustar/` (ajuste manual con enteros);
  - contratos servidos desde `backend/nucleo_herbal/presentacion/backoffice_views/inventario.py`.
- Límites preservados:
  - backend sigue siendo fuente de verdad (dominio + persistencia + ledger);
  - Django Admin se mantiene como soporte/fallback;
  - sin cálculo de stock desde ledger, sin multi-almacén ni reporting avanzado en este incremento.

## Actualización emails transaccionales reales mínimos (R10)
- Estado técnico: **DONE** para capa mínima de correo transaccional real desacoplada de proveedor.
- Eventos operativos activos cubiertos:
  1. pedido pagado correctamente (`email_post_pago`);
  2. pedido enviado (`email_envio`);
  3. cancelación operativa por incidencia de stock (`email_cancelacion`);
  4. reembolso manual ejecutado (`email_reembolso`).
- Trazabilidad/idempotencia mínima activa:
  - flags ya existentes preservados (`email_post_pago_enviado`, `email_envio_enviado`);
  - flags nuevos mínimos añadidos para cierre R10 (`email_cancelacion_enviado`, `fecha_email_cancelacion`, `email_reembolso_enviado`, `fecha_email_reembolso`).
- Regla operativa activa:
  - el flujo demo legacy (`PedidoDemo`, `/api/v1/pedidos-demo/*`, `email-demo`) no se reutiliza ni se mezcla con la capa real;
  - si un envío de email falla, la transición de pedido se conserva y se registra fallo operativo para revisión.
- Fuera de alcance preservado:
  - sin newsletters/campañas;
  - sin CRM;
  - sin plantillas de marketing ni canales alternativos (SMS/WhatsApp).

## 25. Actualización V2-R05 — fiscalidad por producto y cálculo por línea
- Estado técnico: **DONE** para fiscalidad avanzada base de fase (España) sin abrir multi-país.
- Cambios relevantes sobre la migración real:
  - producto real añade `tipo_fiscal` operable en backoffice (`iva_general`/`iva_reducido`);
  - pedido real deja de depender de hipótesis de impuesto único y persiste snapshot fiscal por línea (`tipo_impositivo`, `importe_impuestos`);
  - el cobro Stripe replica esa aritmética por línea + envío para mantener coherencia pedido↔pago↔documento;
  - checkout/recibo/documento mantienen desglose consistente con la misma base de cálculo.

## 26. Actualización V2-R06 — documento fiscal v2 / factura más formal
- Estado técnico: **DONE** para formalización documental fiscal mínima en fase actual (sin abrir facturación enterprise).
- Resultado real:
  - documento descargable de pedido real evoluciona a formato fiscal HTML v2 con identificador trazable derivado del pedido;
  - incluye bloques de emisor y cliente con datos disponibles del sistema, detalle fiscal por línea (base, tipo, cuota, total línea) y totales consistentes (`subtotal`, `base imponible`, `envío`, `impuestos`, `total`);
  - mantiene coherencia end-to-end con la aritmética persistida en pedido/Stripe (sin recalcular por libre);
  - conserva acceso desde superficies existentes de cliente (detalle de pedido y mi cuenta), ajustando copy de enlace.
- Fuera de alcance explícito que se mantiene:
  1. series fiscales legales complejas;
  2. multi-país y reglas tributarias avanzadas;
  3. firma electrónica y envío automático por email.
