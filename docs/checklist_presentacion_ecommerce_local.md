# Checklist de presentacion ecommerce local simulado

## 1. Objetivo
Esta checklist sirve para decidir si **La Botica de la Bruja Lore** esta presentable como pieza portfolio/business-ready con ecommerce local real y pago simulado.

No certifica produccion real, no desbloquea `V2-R10`, no activa Stripe y no sustituye revision legal profesional.

## 2. Criterio de uso
Para cada bloque, marcar uno de estos estados:

- `OK`: se puede mostrar en demo.
- `REVISAR`: se puede mostrar si se explica la limitacion.
- `BLOQUEA PRESENTACION`: no conviene mostrarlo a terceros hasta corregirlo.

La evaluacion debe hacerse sobre entorno local preparado con `docs/operativa_ecommerce_local_simulado.md` y gate local sin `BLOCKER`.

## 3. Checklist final

| Area | Estado | Evidencia esperada | Como comprobarlo | Archivo/ruta relacionada | Nota de riesgo |
|---|---|---|---|---|---|
| Identidad/marca | OK / REVISAR / BLOQUEA PRESENTACION | La experiencia transmite botica herbal, artesanal, editorial y mistica sobria. | Revisar home, footer, fichas y copy visible. | `/`, `docs/00_vision_proyecto.md` | Bloquea si hay claims medicos, promesas milagrosas o tono tecnico visible. |
| Home | OK / REVISAR / BLOQUEA PRESENTACION | La primera pantalla orienta hacia catalogo/descubrimiento sin parecer demo tecnica. | Abrir home y seguir CTA principal. | `frontend/app/page.tsx` | Revisar si el CTA deriva a legacy o no carga datos. |
| Catalogo/secciones | OK / REVISAR / BLOQUEA PRESENTACION | Hay secciones navegables, productos publicados y disponibilidad visible. | Abrir secciones publicas y ejecutar bootstrap si falta data. | `/botica-natural`, API publica herbal | Bloquea si no hay ningun producto comprable. |
| Ficha producto | OK / REVISAR / BLOQUEA PRESENTACION | Muestra descripcion, precio, unidad, disponibilidad y accion de compra clara. | Entrar en un producto con stock. | `frontend/componentes/.../FichaProducto...` | Bloquea si compra normal apunta a `/encargo` o si no hay stock explicado. |
| Cesta | OK / REVISAR / BLOQUEA PRESENTACION | Solo lineas comprables avanzan a checkout; no comprables derivan a consulta. | Agregar producto, ajustar cantidad y probar linea bloqueante si existe. | `/cesta`, `frontend/contenido/catalogo/cestaReal.ts` | Bloquea si manda lineas invalidas a `/checkout`. |
| Checkout real | OK / REVISAR / BLOQUEA PRESENTACION | Crea `Pedido` real con datos de contacto, entrega, lineas y totales. | Completar `/checkout` como invitado o cuenta real. | `/checkout`, `FlujoCheckoutReal` | Bloquea si depende de `PedidoDemo` o no serializa contrato real. |
| Pago simulado | OK / REVISAR / BLOQUEA PRESENTACION | Inicia intencion `simulado_local` y permite confirmar pago local. | En `/pedido/[id]`, iniciar y confirmar pago de prueba. | `POST /api/v1/pedidos/{id}/confirmar-pago-simulado/` | Bloquea si intenta Stripe real o confirma pedido no simulado. |
| Pedido/recibo | OK / REVISAR / BLOQUEA PRESENTACION | Detalle muestra estado, pago, contacto, direccion, lineas, totales y acciones utiles. | Abrir `/pedido/[id_pedido]` despues del pago. | `/pedido/[id_pedido]`, `ReciboPedidoReal` | Revisar si queda lenguaje "demo", "legacy" o "V1" en flujo real. |
| Cuenta real | OK / REVISAR / BLOQUEA PRESENTACION | `/mi-cuenta` muestra datos, direcciones y pedidos reales con enlaces utiles. | Login/registro y revisar pedidos. | `/mi-cuenta`, `/mi-cuenta/pedidos` | Bloquea si la navegacion principal usa `cuenta-demo`. |
| Backoffice/admin | OK / REVISAR / BLOQUEA PRESENTACION | Pedido real pagado puede pasar por preparar, enviar y entregar con trazabilidad. | Entrar en admin y revisar filtros/acciones. | `/admin/`, `admin_pedidos.py` | Revisar credenciales locales y no operar `PedidoDemo` como flujo nuevo. |
| Stock | OK / REVISAR / BLOQUEA PRESENTACION | Stock visible antes de pago y validacion preventiva bloquea insuficiencia. | Probar producto sin stock o cantidad superior a disponible. | disponibilidad publica, `ValidarStockPreventivoPedido` | Bloquea si se puede pagar una cesta sin stock suficiente. |
| Documento fiscal | OK / REVISAR / BLOQUEA PRESENTACION | Documento HTML accesible desde pedido/cuenta con desglose y nota de alcance. | Abrir enlace de documento desde recibo. | documento pedido HTML/API | No prometer validez fiscal completa ni PDF legal final. |
| SEO/noindex | OK / REVISAR / BLOQUEA PRESENTACION | Checkout, pedido, cuenta, auth y legacy transaccional no indexan; catalogo mantiene SEO. | Revisar contrato SEO y tests/gate. | `docs/seo_contrato.json` | Bloquea si rutas privadas/transaccionales son indexables. |
| Legal/confianza | OK / REVISAR / BLOQUEA PRESENTACION | Footer y checkout enlazan condiciones, envios, devoluciones, privacidad y contacto. | Navegar footer y checkout. | paginas legales/comerciales | Revisar si el copy parece politica definitiva de produccion. |
| Accesibilidad basica | OK / REVISAR / BLOQUEA PRESENTACION | Labels, errores visibles, foco, botones bloqueados con explicacion y navegacion teclado. | Recorrer cesta/checkout con teclado. | cesta, checkout, pedido | Bloquea si no se puede completar checkout con teclado. |
| Rendimiento basico | OK / REVISAR / BLOQUEA PRESENTACION | Build pasa y rutas comerciales no cargan JS cliente innecesario evidente. | Ejecutar lint/build y revisar rutas principales. | frontend comercial | Revisar medicion Web Vitals pendiente; no bloquear si la demo es fluida. |
| Tests/gates | OK / REVISAR / BLOQUEA PRESENTACION | Gate local sin `BLOCKER`; regresiones principales ejecutables. | Ejecutar comandos de la seccion 6. | `scripts/check_ecommerce_local_simulado.py` | Warnings de legacy son aceptables si estan documentados. |
| Limites conocidos | OK / REVISAR / BLOQUEA PRESENTACION | La demo explica que es local, simulado en pago y no go-live real. | Revisar guion de presentacion. | esta checklist, operativa local | Bloquea si se presenta como produccion o cobro real conectado. |

## 4. Guion de demo recomendado
1. Abrir home y explicar posicionamiento: ecommerce editorial herbal/esoterico, portfolio-first y business-ready.
2. Entrar en una seccion de catalogo.
3. Abrir ficha de producto y mostrar contenido, precio, unidad y disponibilidad.
4. Agregar a cesta y mostrar separacion entre compra normal y consulta personalizada si aplica.
5. Entrar en `/checkout` y crear pedido real.
6. Abrir `/pedido/[id_pedido]`.
7. Iniciar pago y confirmar pago de prueba local.
8. Mostrar pedido pagado, lineas, totales y estado operativo.
9. Abrir `/mi-cuenta` y mostrar pedidos reales/direcciones si la compra fue autenticada.
10. Abrir admin/backoffice para revisar el pedido y sus acciones operativas.
11. Abrir documento fiscal HTML.
12. Explicar con claridad: Stripe esta reservado; esta demo no procesa cobros reales ni declara go-live.

## 5. Lo que NO se debe prometer
- Produccion real lista.
- Pago real conectado.
- Stripe activo.
- Cumplimiento legal final.
- Facturacion legal completa o numeracion fiscal definitiva.
- Claims medicos, curaciones, milagros o resultados garantizados.
- Stock/logistica enterprise, multi-almacen o reservas temporales completas.
- Backup/restore productivo probado.
- E2E browser completo si no se ha ejecutado.

## 6. Checks recomendados antes de mostrar
Ejecutar como minimo:

```powershell
.\.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py
git diff --check
```

Para una presentacion mas robusta:

```powershell
.\setup_entorno.bat --check
.\run_app.bat --check
.\.venv\Scripts\python.exe scripts/bootstrap_ecommerce_local_simulado.py --dry-run
.\.venv\Scripts\python.exe manage.py check
npm --prefix frontend run lint
npm --prefix frontend run build
npm --prefix frontend run test:compra-local
```

Si algun comando no se ejecuta, anotarlo como limitacion de la demo.

## 7. Siguiente salto real
Para pasar de portfolio/local a validacion externa real hacen falta, como minimo:

1. Staging controlado con variables separadas.
2. Stripe sandbox o proveedor real segun decision de negocio.
3. Smoke post-deploy con URLs reales.
4. Backup/restore real probado fuera del repo.
5. Revision legal profesional de condiciones, privacidad, fiscalidad y devoluciones.
6. Pruebas E2E reales sobre browser/servidores.
7. Auditoria de seguridad mas profunda.
8. Reapertura planificada de `V2-R10` solo cuando sus dependencias externas esten resueltas.

## 8. Decision final de presentacion
Usar esta tabla antes de cada demo:

| Fecha | Responsable | Gate local | Compra local probada | Limitaciones explicadas | Decision |
|---|---|---|---|---|---|
|  |  | OK / WARNING / BLOCKER | Si / No | Si / No | Mostrar / Revisar / No mostrar |
