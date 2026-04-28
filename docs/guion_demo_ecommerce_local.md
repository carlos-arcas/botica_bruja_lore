# Guion demo ecommerce local simulado

## 1. Objetivo
Este guion sirve para presentar **La Botica de la Bruja Lore** como ecommerce local real con pago simulado.

No es un guion de go-live. No declara produccion lista, no activa Stripe y no oculta que la pasarela es local simulada.

## 2. Preparacion antes de enseñar
| Preparacion | Comando o ruta | Resultado esperado | Recuperacion |
|---|---|---|---|
| Auditar estado final | `python scripts/audit_ecommerce_local_simulado.py` | `0 BLOCKER`; warnings solo de legacy controlado. | Si hay `BLOCKER`, corregir antes de presentar. |
| Validar gate local | `python scripts/check_ecommerce_local_simulado.py` | Gate sin `BLOCKER`. | Si falla por legacy, revisar que no se reintrodujo demo como flujo principal. |
| Preparar datos | `python scripts/bootstrap_ecommerce_local_simulado.py --dry-run` y luego sin `--dry-run` si procede | Productos comprables y stock local. | Si falta stock/producto, ejecutar bootstrap real y revisar admin. |
| Levantar backend | `python manage.py runserver 127.0.0.1:8000` | API local disponible. | Revisar `.env`, `BOTICA_PAYMENT_PROVIDER=simulado_local` y `manage.py check`. |
| Levantar frontend | `npm --prefix frontend run dev` | Frontend en `http://127.0.0.1:3000`. | Revisar `NEXT_PUBLIC_API_BASE_URL` y dependencias npm. |

## 3. Recorrido recomendado

| Paso | Ruta exacta | Dato necesario | Accion | Resultado esperado | Frase sugerida | Riesgo si falla | Como recuperarse |
|---|---|---|---|---|---|---|---|
| 1. Home | `/` | Frontend levantado | Abrir home y presentar marca. | Se ve una tienda editorial de botica, no una pantalla tecnica. | "Este es el escaparate: marca, contenido editorial y entrada al catalogo." | Home sin datos o CTA confuso. | Ir directamente a `/botica-natural` y anotar ajuste visual posterior. |
| 2. Seccion comercial | `/botica-natural` | Productos publicados con stock del bootstrap. | Abrir seccion y mostrar grid/filtros. | Productos visibles con precio, disponibilidad y CTA. | "El catalogo ya funciona como superficie vendible, no solo editorial." | Lista vacia o error API. | Ejecutar bootstrap, comprobar backend y refrescar. |
| 3. Ficha comprable | `/botica-natural/[slug]` | Slug de producto comprable; preferir SKU `LOCAL-ECOM-*`. | Abrir ficha desde tarjeta. | Ficha con descripcion, precio, unidad, disponibilidad y compra. | "La ficha separa contenido comercial, disponibilidad y accion de compra." | Producto sin stock o no encontrado. | Volver a `/botica-natural` y elegir otro producto; revisar stock en admin. |
| 4. Anadir a cesta | Ficha o tarjeta | Producto con `disponible_compra=true`. | Pulsar accion de cesta o comprar ahora. | Linea queda preparada para cesta/checkout. | "La compra normal va por cesta y checkout real." | Accion bloqueada por stock. | Usar otro producto o ajustar stock local. |
| 5. Revisar cesta | `/cesta` | Al menos una linea comprable. | Revisar cantidad, disponibilidad y CTA principal. | CTA "Finalizar compra" apunta a `/checkout`; lineas no comprables quedan bloqueadas. | "La cesta filtra lo comprable y evita enviar lineas fuera de contrato." | Cesta vacia o linea bloqueante. | Volver a catalogo, eliminar linea bloqueante o reducir cantidad. |
| 6. Checkout real | `/checkout` | Linea comprable; datos de contacto y direccion. | Completar formulario y crear pedido. | Se crea `Pedido` real y se navega al detalle. | "Este pedido ya es real dentro del sistema local: no usa `PedidoDemo`." | Error de validacion o stock preventivo. | Corregir campo, volver a cesta o elegir producto con stock suficiente. |
| 7. Pedido real | `/pedido/[id_pedido]` | `id_pedido` creado en checkout. | Abrir detalle y revisar lineas/totales. | Pedido pendiente de pago con contacto, direccion, totales y documento. | "El recibo es el detalle real del pedido, con trazabilidad y estados." | Pedido no carga. | Copiar el ID desde la URL o revisar backend/API. |
| 8. Iniciar pago | `/pedido/[id_pedido]` | Pedido pendiente de pago. | Pulsar accion de pago. | Se prepara intencion `simulado_local`. | "La unica simulacion es la pasarela; entra por el mismo puerto que un proveedor real." | Error de stock o proveedor. | Revisar stock, confirmar `BOTICA_PAYMENT_PROVIDER=simulado_local`. |
| 9. Confirmar pago simulado | `/pedido/[id_pedido]` | Intencion simulada preparada. | Pulsar "Confirmar pago de prueba". | Pedido pasa a pagado y ejecuta post-pago real. | "No hay cobro externo; se confirma localmente para probar post-pago, stock y operacion." | Confirmacion rechazada. | Verificar que no sea pedido Stripe/cancelado y que tenga intencion simulada. |
| 10. Documento fiscal | Enlace desde `/pedido/[id_pedido]` | Pedido existente. | Abrir documento fiscal HTML. | Documento con desglose y nota de alcance local. | "El documento es accesible y trazable, pero no lo presento como facturacion legal final." | Enlace no abre. | Volver al pedido, refrescar sesion o abrir desde cuenta. |
| 11. Cuenta real | `/mi-cuenta` o `/mi-cuenta/pedidos` | Compra autenticada para ver historial asociado; si fue invitado, usar enlace directo. | Mostrar datos, direcciones y pedidos reales. | Cuenta real visible, sin `cuenta-demo` como flujo principal. | "La continuidad cliente vive en cuenta real, no en la cuenta demo legacy." | Pedido invitado no aparece en cuenta. | Explicar invitado vs autenticado; repetir compra autenticada si hace falta. |
| 12. Backoffice | `/admin/` | Superusuario/staff local. | Abrir pedido real y revisar filtros/acciones. | Pedido real operable: preparar, enviar, entregar, incidencias y trazabilidad. | "La operacion interna se hace sobre `Pedido`, no sobre `PedidoDemo`." | Falta credencial staff o admin no disponible. | Crear superusuario local o mostrar codigo/admin en repositorio. |

## 4. Ruta secundaria permitida
`/encargo` puede mostrarse solo si alguien pregunta por productos fuera de catalogo o consulta artesanal. No debe aparecer como compra normal.

Frase sugerida:

"Este canal queda como consulta personalizada. La compra estándar ya vive en `/checkout`."

## 5. Que no decir en la demo
- "Esta en produccion."
- "Ya cobra con Stripe."
- "El pago real esta conectado."
- "Esto ya cumple legalmente para venta real."
- "El documento fiscal es una factura legal definitiva."
- "Los productos tienen propiedades medicas."
- "Cura", "trata", "garantiza resultados" o equivalentes sanitarios.
- "La demo legacy ya esta eliminada."

## 6. Que si destacar
- Clean Architecture y separacion dominio/aplicacion/infraestructura/presentacion.
- Separacion entre ecommerce real local y demo legacy.
- Pasarela de pago por puerto/adaptador: `simulado_local` ahora, Stripe reservado.
- Stock preventivo antes de iniciar/confirmar pago.
- Post-pago reutilizado: pago confirmado, inventario, incidencias y operacion.
- Cesta real limpia: solo lineas comprables llegan a checkout.
- Cuenta real `/mi-cuenta` como continuidad cliente.
- Documento fiscal HTML trazable con limites claros.
- Backoffice Django Admin para operar pedidos reales.
- SEO/noindex en rutas transaccionales y privadas.
- Guardrails automatizados: gate local, auditoria final y guardrail legacy.
- Plan de retirada progresiva para `/encargo`, `/pedido-demo`, `PedidoDemo` y `cuenta-demo`.

## 7. Cierre recomendado
Terminar con esta frase:

"La pieza esta lista para presentarse como ecommerce local real con pago simulado. El siguiente salto no es activar produccion por atajo: es staging, Stripe sandbox/real segun decision, smoke externo, backup/restore real y revision legal."

## 8. Decision rapida antes de mostrar
| Pregunta | Respuesta esperada |
|---|---|
| Auditoria final sin `BLOCKER`? | Si. |
| Gate local sin `BLOCKER`? | Si. |
| Producto comprable con stock? | Si. |
| Pago configurado como `simulado_local`? | Si. |
| Legacy fuera del flujo principal? | Si. |
| Limitaciones preparadas para explicar? | Si. |
