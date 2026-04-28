# Mapa de rutas ecommerce local simulado

## 1. Objetivo
Clasificar las rutas visibles e internas del ecommerce local simulado para evitar mezclar flujo real, pago simulado y demo legacy.

Este mapa no crea rutas nuevas, no borra legacy, no activa Stripe y no desbloquea `V2-R10`.

## 2. Leyenda
- **Estado**:
  - `ACTIVA`: ruta vigente del producto local.
  - `LEGACY_DEPRECATED`: ruta conservada por compatibilidad, no para nuevas capacidades.
  - `RESERVADA`: ruta o proveedor preparado para fase futura.
  - `INTERNA`: ruta tecnica, API, proxy o backoffice.
- **Indexacion**:
  - `INDEXABLE`: puede entrar en sitemap/canonical.
  - `NOINDEX`: excluida de indexacion y sitemap.
  - `NO_APLICA`: API/backoffice tecnico.
- **CTA principal**: indica si puede ser destino de una llamada a compra o navegacion principal publica.

## 3. Rutas publicas indexables
| Ruta | Proposito | Estado | Indexacion | Flujo | Tests/gate | CTA principal |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | Home comercial/editorial. | `ACTIVA` | `INDEXABLE` | Catalogo/editorial | `test:seo:contrato`, `test:shell`, contrato SEO | Si |
| `/hierbas` | Hub editorial herbal. | `ACTIVA` | `INDEXABLE` | Editorial/catalogo | `test:seo:contrato` | Si, editorial |
| `/hierbas/[slug]` | Ficha editorial de planta publicada. | `ACTIVA` | `INDEXABLE` si publicada | Editorial/catalogo | `test:seo:contrato`, fichas SEO | Si, editorial |
| `/rituales` | Hub editorial de rituales. | `ACTIVA` | `INDEXABLE` | Editorial | `test:seo:contrato` | Si, editorial |
| `/rituales/[slug]` | Ficha editorial de ritual publicado. | `ACTIVA` | `INDEXABLE` si publicado | Editorial | `test:seo:contrato` | Si, editorial |
| `/colecciones` | Hub comercial historico/indexable. | `ACTIVA` | `INDEXABLE` | Catalogo | `test:seo:contrato` | Si |
| `/colecciones/[slug]` | Ficha producto/catalogo por coleccion. | `ACTIVA` | `INDEXABLE` si producto valido | Catalogo | `test:seo:contrato` | Si, si comprable |
| `/guias` | Hub de guias editoriales. | `ACTIVA` | `INDEXABLE` | Editorial | `test:seo:contrato` | Si, editorial |
| `/guias/[slug]` | Guia editorial publicada. | `ACTIVA` | `INDEXABLE` si publicada | Editorial | `test:seo:contrato` | Si, editorial |
| `/guias/temas/[slug]` | Subhub editorial con masa minima. | `ACTIVA` | `INDEXABLE` si cumple contrato | Editorial | `test:seo:contrato` | Si, editorial |
| `/la-botica` | Pagina de marca/confianza. | `ACTIVA` | `INDEXABLE` | Marca | `test:seo:contrato`, `test:shell` | Si |
| `/envios-y-preparacion` | Informacion de preparacion/envios. | `ACTIVA` | `INDEXABLE` | Confianza | `test:seo:contrato`, `test:legal` | No compra |

## 4. Rutas comerciales publicas activas no transaccionales
| Ruta | Proposito | Estado | Indexacion | Flujo | Tests/gate | CTA principal |
| --- | --- | --- | --- | --- | --- | --- |
| `/botica-natural` | Seccion comercial de productos naturales. | `ACTIVA` | Pendiente de estrategia SEO especifica | Catalogo real | `test:botica-natural`, gate local indirecto | Si |
| `/botica-natural/[slug]` | Ficha de producto vendible. | `ACTIVA` | Pendiente de estrategia SEO especifica | Catalogo real | tests de ficha/catalogo | Si, si comprable |
| `/velas-e-incienso` | Seccion comercial. | `ACTIVA` | Pendiente de estrategia SEO especifica | Catalogo real | tests de secciones/catalogo | Si |
| `/minerales-y-energia` | Seccion comercial. | `ACTIVA` | Pendiente de estrategia SEO especifica | Catalogo real | tests de secciones/catalogo | Si |
| `/herramientas-esotericas` | Seccion comercial. | `ACTIVA` | Pendiente de estrategia SEO especifica | Catalogo real | tests de secciones/catalogo | Si |
| `/calendario-ritual` | Calendario editorial/ritual. | `ACTIVA` | Pendiente de contrato SEO especifico | Editorial | tests calendario si aplica | No compra |
| `/agenda-mistica` | Superficie editorial/ritual. | `ACTIVA` | Pendiente de contrato SEO especifico | Editorial | tests calendario/ritual si aplica | No compra |
| `/tarot` | Superficie editorial de tarot. | `ACTIVA` | Pendiente de contrato SEO especifico | Editorial | `test:tarot`, `test:shell` | No compra |

## 5. Publicas no indexables de confianza
| Ruta | Proposito | Estado | Indexacion | Flujo | Tests/gate | CTA principal |
| --- | --- | --- | --- | --- | --- | --- |
| `/privacidad` | Informacion de privacidad. | `ACTIVA` | `NOINDEX` | Legal/confianza | `test:seo:contrato`, `test:legal` | No |
| `/condiciones-encargo` | Condiciones de compra/encargo historicas. | `ACTIVA` | `NOINDEX` | Legal/confianza | `test:seo:contrato`, `test:legal` | No |
| `/devoluciones` | Politica comercial de devoluciones. | `ACTIVA` | `NOINDEX` | Legal/confianza | `test:seo:contrato`, `test:legal` | No |
| `/contacto` | Contacto comercial. | `ACTIVA` | `NOINDEX` | Confianza | `test:seo:contrato`, `test:legal` | No |

## 6. Transaccionales del flujo real
| Ruta | Proposito | Estado | Indexacion | Flujo | Tests/gate | CTA principal |
| --- | --- | --- | --- | --- | --- | --- |
| `/cesta` | Revision de lineas comprables y consulta secundaria. | `ACTIVA` | `NOINDEX` | Cesta real | `test:cesta`, `test:seo:contrato` | Si, desde seleccion |
| `/checkout` | Checkout real local sobre `Pedido`. | `ACTIVA` | `NOINDEX` | Compra real local | gate local, `test:checkout-real`, `test:seo:contrato` | Si |
| `/pedido/[id_pedido]` | Recibo/detalle de pedido real, pago simulado y documento. | `ACTIVA` | `NOINDEX` | Pedido real local | gate local, `test:compra-local`, `test:seo:contrato` | No como CTA publico; si como retorno |

## 7. Cuenta, auth y privadas
| Ruta | Proposito | Estado | Indexacion | Flujo | Tests/gate | CTA principal |
| --- | --- | --- | --- | --- | --- | --- |
| `/mi-cuenta` | Area privada de cuenta real. | `ACTIVA` | `NOINDEX` | Cuenta real | gate local, `test:cuenta-cliente`, `test:seo:contrato` | Si, cuenta |
| `/mi-cuenta/pedidos` | Historial privado de pedidos reales. | `ACTIVA` | `NOINDEX` | Cuenta real | `test:cuenta-cliente`, `test:seo:contrato` | No publico |
| `/mi-cuenta/direcciones` | Direcciones guardadas. | `ACTIVA` | `NOINDEX` | Cuenta real | `test:cuenta-cliente`, `test:seo:contrato` | No publico |
| `/acceso` | Acceso de cliente. | `ACTIVA` | `NOINDEX` | Auth real | `test:seo:contrato` | Si, cuenta |
| `/registro` | Registro de cliente. | `ACTIVA` | `NOINDEX` | Auth real | `test:seo:contrato` | Si, cuenta |
| `/recuperar-password` | Recuperacion de credenciales. | `ACTIVA` | `NOINDEX` | Auth real | `test:seo:contrato` | No publico |
| `/verificar-email` | Verificacion de email. | `ACTIVA` | `NOINDEX` | Auth real | `test:seo:contrato` | No publico |
| `/login` | Acceso heredado/backoffice. | `INTERNA` | `NOINDEX` | Auth interna | `test:seo:contrato` | No |

## 8. Backoffice/admin
| Ruta | Proposito | Estado | Indexacion | Flujo | Tests/gate | CTA principal |
| --- | --- | --- | --- | --- | --- | --- |
| `/admin` | Panel operativo Next/backoffice. | `INTERNA` | `NOINDEX` | Backoffice | `test:seo:contrato`, tests backoffice | No publico |
| `/admin/login` | Login de backoffice. | `INTERNA` | `NOINDEX` | Backoffice | `test:seo:contrato`, tests admin | No publico |
| `/admin/*` | Modulos de productos, pedidos, inventario, editorial e importacion. | `INTERNA` | `NOINDEX` | Backoffice | tests backoffice/admin | No publico |
| Django `/admin/` backend | Admin Django. | `INTERNA` | `NO_APLICA` | Backoffice | tests admin Django | No publico |

## 9. Legacy deprecadas
| Ruta | Proposito | Estado | Indexacion | Flujo | Tests/gate | CTA principal |
| --- | --- | --- | --- | --- | --- | --- |
| `/encargo` | Consulta personalizada/manual. | `LEGACY_DEPRECATED` | `NOINDEX` | Legacy consulta | gate local warning, `test:shell`, `test:seo:contrato` | No, salvo consulta secundaria |
| `/pedido-demo` | Recibo/listado tecnico demo historico. | `LEGACY_DEPRECATED` | `NOINDEX` | Demo legacy | gate local bloquea CTA publico, `test:seo:contrato` | No |
| `/pedido-demo/[id_pedido]` | Detalle de pedido demo historico. | `LEGACY_DEPRECATED` | `NOINDEX` | Demo legacy | `test:seo:contrato`, tests legacy | No |
| `/cuenta-demo` | Cuenta demo historica. | `LEGACY_DEPRECATED` | `NOINDEX` | Demo legacy | gate local bloquea navegacion principal, `test:seo:contrato` | No |

## 10. API frontend Next
| Ruta | Proposito | Estado | Indexacion | Flujo | Tests/gate | CTA principal |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/pedidos` | Proxy/endpoint frontend para crear pedido real. | `INTERNA` | `NO_APLICA` | Pedido real | `test:checkout-real`, `test:compra-local` | No |
| `/api/pedidos/envio-estandar` | Coste de envio local. | `INTERNA` | `NO_APLICA` | Checkout real | tests de checkout | No |
| `/api/pedidos/[id_pedido]` | Consulta pedido real. | `INTERNA` | `NO_APLICA` | Pedido real | tests de pedido/checkout | No |
| `/api/pedidos/[id_pedido]/iniciar-pago` | Inicia intencion de pago. | `INTERNA` | `NO_APLICA` | Pago por puerto | `test:compra-local` | No |
| `/api/pedidos/[id_pedido]/confirmar-pago-simulado` | Confirma pago local simulado. | `INTERNA` | `NO_APLICA` | Pago simulado | `test:compra-local`, gate local backend | No |
| `/api/pedidos/[id_pedido]/documento` | Proxy documento fiscal HTML. | `INTERNA` | `NO_APLICA` | Pedido real | tests de pedido/documento | No |
| `/api/cuenta/[...ruta]` | Proxy cuenta real. | `INTERNA` | `NO_APLICA` | Cuenta real | `test:cuenta-cliente` | No |
| `/api/auth/*` | CSRF, login, status y auth demo compatible. | `INTERNA` | `NO_APLICA` | Auth | tests cuenta/auth | No |
| `/api/backoffice/*` | Auth y proxy backoffice. | `INTERNA` | `NO_APLICA` | Backoffice | tests backoffice | No |
| `/api/debug/logs*` | Logs locales condicionados por flag. | `INTERNA` | `NO_APLICA` | Debug local | tests debug logs | No |

## 11. API backend publica
| Ruta | Proposito | Estado | Indexacion | Flujo | Tests/gate | CTA principal |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/v1/herbal/*` | Plantas, productos, secciones y editorial publico. | `ACTIVA` | `NO_APLICA` | Catalogo/editorial | tests exposicion publica/catalogo | No |
| `/api/v1/rituales/*` | Rituales publicos y relaciones. | `ACTIVA` | `NO_APLICA` | Editorial | tests rituales | No |
| `/api/v1/calendario-ritual/` | Calendario ritual. | `ACTIVA` | `NO_APLICA` | Editorial | tests calendario | No |
| `/api/v1/pedidos/` | Crear/detallar pedido real. | `ACTIVA` | `NO_APLICA` | Pedido real | tests pedidos reales | No |
| `/api/v1/pedidos/[id]/iniciar-pago/` | Iniciar pago por puerto. | `ACTIVA` | `NO_APLICA` | Pago simulado/local | tests pago real/simulado | No |
| `/api/v1/pedidos/[id]/confirmar-pago-simulado/` | Confirmar pago simulado local. | `ACTIVA` | `NO_APLICA` | Pago simulado | gate local, tests pago simulado | No |
| `/api/v1/pedidos/[id]/documento/` | Documento fiscal HTML. | `ACTIVA` | `NO_APLICA` | Pedido real | tests documento/pedido | No |
| `/api/v1/pedidos/webhooks/stripe/` | Webhook Stripe futuro/reservado. | `RESERVADA` | `NO_APLICA` | Stripe futuro | tests webhook Stripe existentes | No |
| `/api/v1/cuenta/*` | Cuenta real, direcciones y pedidos. | `ACTIVA` | `NO_APLICA` | Cuenta real | tests cuenta cliente | No |
| `/api/v1/pedidos-demo/*` | Pedido demo historico. | `LEGACY_DEPRECATED` | `NO_APLICA` | Demo legacy | tests legacy | No |
| `/api/v1/cuentas-demo/*` | Cuenta demo historica. | `LEGACY_DEPRECATED` | `NO_APLICA` | Demo legacy | tests legacy | No |
| `/api/v1/backoffice/*` | Backoffice operativo. | `INTERNA` | `NO_APLICA` | Backoffice | tests backoffice | No |
| `/api/backoffice/auth/*` | Auth backoffice backend. | `INTERNA` | `NO_APLICA` | Backoffice | tests auth/admin | No |
| `/api/debug/*` | Debug logs locales. | `INTERNA` | `NO_APLICA` | Debug local | tests debug | No |
| `/robots.txt`, `/sitemap.xml`, `/healthz` | SEO/operacion tecnica. | `ACTIVA` | `NO_APLICA` | Infra publica | tests SEO/readiness | No |

## 12. Reglas finales de navegacion
1. El CTA principal de compra debe terminar en `/checkout`.
2. `/cesta` puede ser paso principal antes de checkout.
3. `/pedido/[id_pedido]` solo se usa como retorno/detalle, no como ruta publica indexable.
4. `/mi-cuenta` es la unica cuenta visible principal.
5. `/encargo` solo puede aparecer como consulta personalizada/secundaria.
6. `/pedido-demo`, `/pedido-demo/[id_pedido]` y `/cuenta-demo` no pueden ser CTA principal.
7. Stripe permanece reservado y no cambia rutas activas locales.

## 13. Guardrails vigentes
- `scripts/check_ecommerce_local_simulado.py`: valida `/checkout`, `/pedido/[id_pedido]`, `/mi-cuenta`, rutas legacy, noindex, CTAs anti `/pedido-demo` y navegacion sin `cuenta-demo`.
- `docs/seo_contrato.json` + `npm --prefix frontend run test:seo:contrato`: protegen noindex/canonical.
- `npm --prefix frontend run test:shell`: protege navegacion principal y footer.
- `docs/plan_retirada_legacy_demo.md`: gobierna retirada futura sin borrar rutas ahora.
