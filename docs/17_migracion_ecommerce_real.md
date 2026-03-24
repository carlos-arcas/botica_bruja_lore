# 17 — Migración ecommerce demo → ecommerce real

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
- PSP real v1 activo: **Stripe** mediante puerto desacoplado `PuertoPasarelaPago`.
- Rutas nuevas activas: `POST /api/v1/pedidos/{id_pedido}/iniciar-pago/` y `POST /api/v1/pedidos/webhooks/stripe/`.
- Persistencia activa: referencia externa `id_externo_pago`, `proveedor_pago`, `estado_pago`, `url_pago`, `fecha_pago_confirmado` y tabla de idempotencia de webhooks.
- Frontend activo: botón **Pagar ahora** en `/pedido/[id_pedido]` para redirigir al checkout hospedado del PSP.
- Coexistencia preservada: `PedidoDemo` y `/api/v1/pedidos-demo/` continúan como legacy controlado.
- Siguiente bloque recomendado: post-pago operativo v1.1 con cancelación explícita, email transaccional real, conciliación/manual review mínima y primer cierre administrativo del pedido pagado.


## Actualización post-pago operativo v1.1
- El checkout real ya expone retornos `success` y `cancel` hacia `/pedido/[id_pedido]` con estado visible y siguiente acción recomendada.
- Cuando Stripe confirma `pagado`, el backend ejecuta un caso de uso post-pago desacoplado del webhook: persiste transición, envía email transaccional mínimo e incrementa trazabilidad operativa.
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
- Capacidad activa backend:
  - agregado puro `InventarioProducto` desacoplado de Django;
  - casos de uso para crear inventario inicial, consultar stock actual, ajustar stock y listar inventario operativo;
  - validación explícita para impedir stock negativo y duplicados por producto.
- Operación interna activa:
  - Django Admin ya permite listar, buscar y editar cantidad disponible/umbral de bajo stock;
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
  - si Stripe confirma `pagado` y hay stock suficiente, el sistema descuenta todas las líneas en una transacción atómica y marca el pedido como descontado una sola vez;
  - si el webhook se repite o el caso de uso se reejecuta, la idempotencia evita dobles descuentos;
  - si falta stock en ese momento, no se descuenta nada, no se permite stock negativo, el pedido queda `pagado` con incidencia operativa y `requiere_revision_manual=True`;
  - en escenario de incidencia, se omite el email post-pago estándar para no fingir cierre operativo exitoso.
- Logging activo:
  - descuento correcto por pedido pagado;
  - reintento idempotente;
  - conflicto de stock al confirmar pago;
  - generación de incidencia operativa.
- Fuera de alcance preservado:
  - sin reservas previas;
  - sin compensaciones automáticas por cancelación o devolución;
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
