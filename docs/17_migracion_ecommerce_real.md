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

### 4.3 Campos faltantes para ecommerce real v1
- `direccion_entrega`
- `moneda`
- `cliente.es_invitado`
- `id_externo_pago` (reservado, todavía sin PSP)
- `fecha_creacion` con semántica de pedido real

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
- PSP/Stripe real;
- cobro real;
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
