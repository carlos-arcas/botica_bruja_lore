# Auditoria dependencias demo vs real

## 1. Objetivo
Auditar dependencias entre el flujo ecommerce real local y el legacy demo para evitar que nuevas capacidades vuelvan a depender de `/encargo`, `PedidoDemo`, `cuenta-demo` o helpers especificos de demo.

## 2. Criterio de severidad
- `OK`: dependencia alineada con Clean Architecture o legacy aislado.
- `WARNING`: acoplamiento transitorio aceptable, documentado y protegido para no crecer.
- `BLOCKER`: modulo real depende de contrato demo o ruta demo como parte del flujo principal.

## 3. Mapa de dependencias reales

### Checkout real
- Frontend:
  - `frontend/app/checkout/page.tsx`
  - `frontend/componentes/catalogo/checkout-real/*`
  - `frontend/contenido/catalogo/checkoutReal.ts`
  - `frontend/infraestructura/api/pedidos.ts`
- Backend:
  - `backend/nucleo_herbal/presentacion/publica/views_pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/views_pago_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/stock_preventivo_pedidos.py`
  - `backend/nucleo_herbal/dominio/pedidos.py`
- Estado: `WARNING`.
- Motivo: el checkout real ya no importa `checkoutDemo`, `PedidoDemo` ni API demo; sigue reutilizando `encargoConsulta` para resolver preseleccion heredada de cesta/consulta.

### Pedido real
- Backend:
  - dominio `Pedido` en `backend/nucleo_herbal/dominio/pedidos.py`
  - puertos/repositorios `repositorios_pedidos.py`
  - persistencia `models_pedidos.py` y `repositorios_pedidos.py`
  - presentacion `urls_pedidos.py`, `views_pedidos.py`, `views_pago_pedidos.py`
- Frontend:
  - `frontend/app/pedido/[id_pedido]/page.tsx`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/contenido/pedidos/*`
- Estado: `OK`.
- Motivo: usa `Pedido` real, pago por puerto y documento fiscal real local. La cadena no importa `PedidoDemo`.

### Cuenta real
- Backend:
  - dominio `cuentas_cliente.py`
  - casos de uso `casos_de_uso_cuentas_cliente.py`
  - repositorios `repositorios_cuentas_cliente.py`
  - presentacion `views_cuentas_cliente.py`
- Frontend:
  - `frontend/app/mi-cuenta/*`
  - `frontend/componentes/cuenta_cliente/*`
  - `frontend/infraestructura/api/cuentasCliente.ts`
- Estado: `OK`.
- Motivo: la cuenta real queda separada de `cuenta-demo` y no usa `cuentasDemo`.

### Pago simulado real
- Backend:
  - puerto `backend/nucleo_herbal/aplicacion/puertos/pasarela_pago.py`
  - adaptador `backend/nucleo_herbal/infraestructura/pagos_simulados.py`
  - wiring en `backend/nucleo_herbal/presentacion/publica/dependencias.py`
  - caso de uso `ConfirmarPagoSimuladoPedido`
- Estado: `OK`.
- Motivo: el proveedor `simulado_local` entra por puerto/adaptador y reutiliza post-pago real.

### Demo legacy
- Backend:
  - `pedidos_demo.py`, `cuentas_demo.py`
  - `casos_de_uso_pedidos_demo.py`, `casos_de_uso_cuentas_demo.py`
  - `views_pedidos_demo.py`, `views_cuentas_demo.py`
  - `admin_pedidos_demo.py`
- Frontend:
  - `frontend/app/encargo/page.tsx`
  - `frontend/app/pedido-demo/*`
  - `frontend/app/cuenta-demo/page.tsx`
  - `frontend/componentes/catalogo/encargo/*`
  - `frontend/componentes/cuenta_demo/*`
  - `frontend/infraestructura/api/pedidosDemo.ts`
  - `frontend/infraestructura/api/cuentasDemo.ts`
- Estado: `OK`.
- Motivo: legacy se conserva como superficie aislada y no gobierna el flujo principal.

## 4. Hallazgos

### BLOCKER corregido: tipo real importado desde `checkoutDemo`
- Estado anterior: `frontend/contenido/catalogo/checkoutReal.ts` importaba `LineaNoConvertiblePedido` desde `checkoutDemo`.
- Riesgo: el contrato real quedaba acoplado a un modulo de checkout demo.
- Correccion aplicada: el tipo se define ahora en `checkoutReal.ts` usando `ItemEncargoPreseleccionado["tipo_linea"]`.
- Guardrail: `scripts/check_ecommerce_local_simulado.py` bloquea imports `checkoutDemo`, `pedidosDemo`, `cuentasDemo`, `PedidoDemo`, `CuentaDemo` o `PayloadPedidoDemo` desde modulos reales.

### WARNING: helper de preseleccion `encargoConsulta` en checkout real
- Estado actual: `FlujoCheckoutReal` reutiliza `resolverContextoPreseleccionado` de `encargoConsulta`.
- Riesgo: el nombre y ubicacion del helper pertenecen al canal de consulta/encargo, aunque hoy resuelve preseleccion compartida.
- Decision: no se refactoriza en esta auditoria para evitar cambio funcional amplio.
- Tarea futura: extraer un helper compartido de preseleccion de cesta/checkout si esa dependencia crece.

### OK: backend real sin dependencia demo funcional
- Estado actual: los casos de uso de pedido, pago, post-pago, cuenta real y admin real no importan `PedidoDemo` ni `CuentaDemo`.
- Nota: `backend/nucleo_herbal/dominio/pedidos.py` conserva una etiqueta textual `legado_demo` para clasificacion/trazabilidad, no una dependencia de modulo.

## 5. Guardrail vigente
El gate `scripts/check_ecommerce_local_simulado.py` protege:
- rutas principales y existencia de checkout/pedido/cuenta real;
- CTAs publicos evidentes hacia `/pedido-demo`;
- `cuenta-demo` en navegacion principal;
- imports demo desde checkout, pedido, cuenta y APIs frontend reales;
- uso de `encargoConsulta` en checkout real como `WARNING` controlado;
- `V2-R10` bloqueado y pagos reales inactivos.

## 6. Riesgos pendientes
1. El helper `encargoConsulta` deberia renombrarse o extraerse cuando se planifique limpieza de preseleccion compartida.
2. Las rutas legacy siguen existiendo y deben mantenerse cubiertas por guardrails hasta su retirada progresiva.
3. El literal `legado_demo` en dominio real debe seguir siendo solo trazabilidad, no puerta para acoplar `PedidoDemo`.

## 7. Siguiente accion recomendada
Planificar una microfase de extraccion de preseleccion compartida:
`encargoConsulta` -> helper neutral de cesta/checkout, manteniendo `/encargo` como consumidor legacy secundario.
