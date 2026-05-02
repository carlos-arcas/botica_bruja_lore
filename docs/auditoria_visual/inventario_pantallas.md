# Inventario visual de pantallas, rutas, enlaces y estados

## 1. Alcance y fuentes inspeccionadas
Este documento prepara una auditoria visual posterior con Playwright y navegador nativo de Codex. No ejecuta screenshots, no modifica estilos y no crea rutas nuevas.

Fuentes revisadas:
- `frontend/app/**/page.tsx`, `not-found.tsx`, `layout.tsx` y rutas `api/**/route.ts`.
- Navegacion publica: `frontend/contenido/shell/navegacionGlobal.ts`, `frontend/componentes/shell/*`.
- Navegacion admin: `frontend/infraestructura/configuracion/modulosAdmin.ts`, `frontend/componentes/admin/enlacesAdmin.ts`, `frontend/componentes/admin/NavegacionLateralAdmin.tsx`.
- Home y cards: `frontend/contenido/home/*`, componentes `home`, `catalogo`, `botica-natural`, `rituales`, `herbal`, `cuenta_cliente`, `catalogo/checkout-real` y `admin`.
- Referencia previa: `docs/mapa_rutas_ecommerce_local.md`.

Notas operativas:
- No hay `README.md` en esta worktree; se aplica `AGENTS.md` y documentacion viva.
- No se encontro un archivo de errores combinados con nombre evidente (`errores`, `errors`) en la raiz o `docs/`.
- Las rutas dinamicas usan placeholders representativos para snapshots: `[slug]`, `[id_pedido]`, `[projectId]` no se inventan; se sustituyen solo cuando exista seed/dato local.

## 2. Mapa de rutas visuales

### 2.1 Publicas y editoriales
| Ruta | Pantalla | Tipo | Auth | Layout | Entrada conocida | Acciones principales | Relacionadas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Home comercial/editorial | landing/dashboard publico | No | `app/layout.tsx` + shell comercial | marca, nav principal, cards home | explorar hierbas, rituales, secciones, enlaces internos por ancla | catalogo, guias, marca |
| `/la-botica` | Marca/propuesta editorial | pagina editorial | No | shell comercial | home, footer | explorar botica, consulta secundaria | home, colecciones |
| `/hierbas` | Hub herbal | listado editorial | No | shell comercial | nav Guias, footer, home | ver ficha herbal, explorar rituales/colecciones | `/hierbas/[slug]` |
| `/hierbas/[slug]` | Ficha herbal | detalle editorial | No | shell comercial | listado herbal, enlaces relacionados | volver a hierbas, ver rituales, colecciones | rituales, colecciones |
| `/rituales` | Hub rituales | listado editorial | No | shell comercial | nav Guias, home, footer | ver ficha ritual, explorar hierbas/guias | `/rituales/[slug]` |
| `/rituales/[slug]` | Ficha ritual | detalle editorial | No | shell comercial | listado ritual, enlaces relacionados | volver, entrar por hierbas, colecciones | hierbas, colecciones |
| `/guias` | Indice de guias | listado/filtros | No | shell comercial | nav Guias, footer | filtrar por tema/hub, abrir guia, abrir tema | `/guias/[slug]`, `/guias/temas/[slug]` |
| `/guias/[slug]` | Guia editorial | detalle editorial | No | shell comercial | indice de guias, enlaces internos | abrir subhub, enlaces contextuales, volver | `/guias`, temas |
| `/guias/temas/[slug]` | Tema editorial | subhub/listado | No | shell comercial | indice/guia | abrir guia, enlaces contextuales, volver | `/guias/[slug]` |
| `/tarot` | Tarot editorial | modulo interactivo | No | shell comercial | nav principal, secciones home | seleccionar arcano/tarjeta | calendario, guias |
| `/calendario-ritual` | Calendario ritual | herramienta editorial | No | shell comercial | nav principal, footer | cambiar fecha, anadir/quitar ritual, guardar/limpiar dia | rituales |
| `/agenda-mistica` | Agenda mistica | pagina editorial | No | shell comercial | cards home | lectura editorial | calendario, rituales |

### 2.2 Catalogo, cesta y compra local
| Ruta | Pantalla | Tipo | Auth | Layout | Entrada conocida | Acciones principales | Relacionadas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/botica-natural` | Botica natural | listado comercial | No | shell comercial | nav Tienda, cards home, footer | filtros, abrir ficha, sumar/restar, agregar carrito | `/botica-natural/[slug]`, cesta |
| `/botica-natural/[slug]` | Ficha producto botica | detalle comercial | No | shell comercial | listado, card, breadcrumb | comprar ahora, consulta, volver seccion | checkout, encargo |
| `/velas-e-incienso` | Velas e incienso | listado comercial | No | shell comercial | nav Tienda, home | abrir ficha, agregar carrito, estado vacio/error | `/velas-e-incienso/[slug]` |
| `/velas-e-incienso/[slug]` | Ficha vela/incienso | detalle comercial | No | shell comercial | listado | comprar, consultar, volver | checkout, encargo |
| `/minerales-y-energia` | Minerales y energia | listado comercial | No | shell comercial | nav Tienda, home | abrir ficha, agregar carrito, estado vacio/error | `/minerales-y-energia/[slug]` |
| `/minerales-y-energia/[slug]` | Ficha mineral | detalle comercial | No | shell comercial | listado | comprar, consultar, volver | checkout, encargo |
| `/herramientas-esotericas` | Herramientas esotericas | listado comercial | No | shell comercial | nav Tienda, home | abrir ficha, agregar carrito, estado vacio/error | `/herramientas-esotericas/[slug]` |
| `/herramientas-esotericas/[slug]` | Ficha herramienta | detalle comercial | No | shell comercial | listado | comprar, consultar, volver | checkout, encargo |
| `/colecciones` | Colecciones rituales | listado legacy/comercial | No | shell comercial | home, footer, fichas | buscar, filtrar, ordenar, abrir ficha | `/colecciones/[slug]` |
| `/colecciones/[slug]` | Ficha coleccion | detalle comercial historico | No | shell comercial | listado, enlaces relacionados | comprar, consultar, ver seleccion, volver | checkout, cesta, encargo |
| `/cesta` | Mi seleccion/carrito | cesta real | No | shell comercial | cabecera carrito, fichas, cards | finalizar compra, eliminar, ajustar cantidad, vaciar, consulta secundaria | checkout, botica |
| `/checkout` | Checkout real | formulario transaccional | Invitado o cuenta | shell comercial | nav, cesta, ficha producto | seleccionar direccion, tarifa envio, submit pedido | pedido, cuenta |
| `/pedido/[id_pedido]` | Pedido real/recibo | detalle transaccional | No publico; enlace directo | shell comercial | retorno checkout, cuenta | pagar, confirmar pago simulado, documento, cuenta, seguir comprando | cuenta, documento |

### 2.3 Cuenta, auth, legal y legacy
| Ruta | Pantalla | Tipo | Auth | Layout | Entrada conocida | Acciones principales | Relacionadas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/acceso` | Acceso cliente | formulario auth | No | shell comercial | cabecera Login | login/registro segun componente | mi-cuenta |
| `/login` | Login heredado | formulario auth | No | shell comercial | rutas antiguas | login cliente | mi-cuenta |
| `/registro` | Registro cliente | formulario auth | No | shell comercial | auth | crear cuenta | verificar email, mi-cuenta |
| `/recuperar-password` | Recuperar password | formulario auth | No | shell comercial | login | enviar enlace, guardar nueva password | acceso |
| `/verificar-email` | Verificar email | estado auth | Token | shell comercial | email/enlace | ir a cuenta, ir a acceso | mi-cuenta |
| `/mi-cuenta` | Mi cuenta | area privada/resumen | Cuenta real | shell comercial | cabecera, checkout | reenviar verificacion, pedidos, direcciones, logout | pedidos, direcciones |
| `/mi-cuenta/pedidos` | Mis pedidos | listado privado | Cuenta real | shell comercial | mi-cuenta | abrir pedido, documento fiscal | pedido |
| `/mi-cuenta/direcciones` | Direcciones | formulario/listado | Cuenta real | shell comercial | mi-cuenta, checkout | crear, editar, eliminar, predeterminar | checkout |
| `/condiciones-encargo` | Condiciones | legal/confianza | No | shell comercial | footer, checkout | CTA legal principal/secundario | privacidad, envios |
| `/envios-y-preparacion` | Envios | legal/confianza | No | shell comercial | footer, checkout | CTA legal principal/secundario | condiciones |
| `/devoluciones` | Devoluciones | legal/confianza | No | shell comercial | footer, checkout | CTA legal principal/secundario | contacto |
| `/privacidad` | Privacidad | legal/confianza | No | shell comercial | footer, checkout | CTA legal principal/secundario | contacto |
| `/contacto` | Contacto | legal/confianza | No | shell comercial | footer | CTA legal principal/secundario | encargo |
| `/encargo` | Consulta personalizada | legacy controlado/formulario | No | shell comercial | footer, consulta secundaria | preparar consulta, cuenta demo legacy, copiar resumen, canal contacto | pedido-demo |
| `/pedido-demo` | Pedido demo historico | legacy | No | shell comercial | legacy | ver/recuperar demo | cuenta-demo |
| `/pedido-demo/[id_pedido]` | Recibo demo | legacy detalle | No | shell comercial | encargo legacy | cuenta demo, otro encargo | encargo |
| `/cuenta-demo` | Cuenta demo | legacy auth/historial | No | shell comercial | legacy | login/registro demo, historial | pedido-demo |

### 2.4 Backoffice Next y debug
| Ruta | Pantalla | Tipo | Auth | Layout | Entrada conocida | Acciones principales | Relacionadas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/admin/login` | Login backoffice | formulario admin | No | layout admin login | acceso admin | submit login | admin |
| `/admin` | Dashboard admin | dashboard | Backoffice | `admin/(panel)/layout.tsx` | cabecera admin | abrir modulo | productos, pedidos |
| `/admin/productos` | Productos admin | CRUD/listado | Backoffice | panel admin | nav admin, dashboard | filtrar seccion, cargar plantas, crear/editar/publicar | importacion, imagenes |
| `/admin/inventario` | Inventario admin | listado/formulario | Backoffice | panel admin | nav admin | abrir detalle, ajuste manual | productos |
| `/admin/pedidos` | Pedidos admin | operacion/listado | Backoffice | panel admin | nav admin | filtrar estado, preparar, enviar, entregar | pedido real |
| `/admin/rituales` | Rituales admin | CRUD contextual | Backoffice | panel admin | nav admin | crear, editar, publicar, importar | editorial |
| `/admin/editorial` | Articulos admin | CRUD contextual | Backoffice | panel admin | nav admin | crear, editar, publicar, importar | guias |
| `/admin/importacion` | Importacion masiva | formulario/lote | Backoffice | panel admin | dashboard | validar lote, descargar plantillas, confirmar, cancelar | productos |
| `/admin/imagenes` | Imagenes | placeholder/config | Backoffice | panel admin | ruta directa | modulo pendiente | productos |
| `/admin/ajustes` | Ajustes | placeholder/config | Backoffice | panel admin | ruta directa | modulo pendiente | admin |
| `/debug/logs` | Logs locales | debug | Flag/debug | shell comercial | nav condicional Logs | desbloquear, refrescar, limpiar, copiar, bloquear | API debug |

### 2.5 API Next internas para trazabilidad
Estas rutas no se visitan como pantalla visual, pero deben constar para pruebas de flujo:
`/api/pedidos`, `/api/pedidos/envio-estandar`, `/api/pedidos/[id_pedido]`, `/api/pedidos/[id_pedido]/iniciar-pago`, `/api/pedidos/[id_pedido]/confirmar-pago-simulado`, `/api/pedidos/[id_pedido]/documento`, `/api/cuenta/[...ruta]`, `/api/auth/*`, `/api/backoffice/*`, `/api/debug/logs*`.

## 3. Inventario de enlaces y acciones
| Texto visible / patron | Zona o componente | Destino esperado | Tipo | Cubrir visual |
| --- | --- | --- | --- | --- |
| Marca `La Botica de la Bruja Lore` | `CabeceraComercial` | `/` | navegacion | Si |
| Inicio, Tienda, Guias, Tarot, Calendario, Mi seleccion, Checkout, Acceso, Mi cuenta | `NavegacionPrincipal` | rutas publicas principales | navegacion | Si |
| Botica, Velas e incienso, Minerales y energia, Herramientas esotericas | submenu Tienda | secciones comerciales | navegacion/popover hover-focus | Si |
| Compendio, Articulos, Glosario botanico, Propiedades, Rituales | submenu Guias | hubs editoriales | navegacion/popover hover-focus | Si |
| Carrito, Login/Mi cuenta, Acceso admin | `AccesosCabecera` | `/cesta`, auth/cuenta, `/admin` | navegacion | Si |
| Footer legal y comercial | `FooterComercial` | rutas catalogo, legal, encargo | navegacion | Si |
| Explorar hierbas / Descubrir rituales | `HeroPortada` | `/hierbas`, `/rituales` | navegacion CTA | Si |
| Anclas Alquimia, Intenciones, Como elegir, Confianza, FAQ | `NavegacionSecciones` | `#id` en home | ancla | Si |
| Abrir ficha / Ver ficha | cards catalogo, herbal, ritual | detalle dinamico | navegacion | Si |
| Comprar ahora | fichas producto | `/checkout?producto=slug` | navegacion transaccional | Si |
| Agregar al carrito | `BotonAgregarCarrito`, acciones card | localStorage/estado cliente | accion cliente | Si |
| Consulta personalizada / Pedir orientacion | fichas/cesta/empty states | `/encargo?...` | navegacion legacy secundaria | Si, warning |
| Finalizar compra | `VistaCestaRitual` | `/checkout?cesta=...` | navegacion transaccional | Si |
| Preparar pedido / Confirmar | `FlujoCheckoutReal` | submit form | submit | Si |
| Confirmar pago de prueba | `ReciboPedidoReal` | endpoint pago simulado | accion async | Si |
| Continuar pago | `ReciboPedidoReal` | `pedido.pago.url_pago` | externo/local pago | Si |
| Documento fiscal | recibo/cuenta | `/api/pedidos/[id]/documento` | descarga/html | Si |
| Reenviar verificacion, logout | `PanelCuentaCliente` | accion API/cuenta | accion async | Si |
| Crear/editar/eliminar direccion | `PanelDireccionesCuentaCliente` | submit/accion API | formulario | Si |
| Guardar, Editar, Publicar/Despublicar | admin CRUD | API backoffice | accion CRUD | Si |
| Importar, Plantilla CSV/XLSX, Inventario CSV/XLSX | admin contextual/importacion | abrir panel/descarga | panel/descarga | Si |
| Marcar preparando/enviado/entregado | `ModuloPedidosAdmin` | API backoffice pedidos | accion operativa | Si |
| Refrescar, limpiar, copiar logs | `DebugLogViewer` | API debug/clipboard | accion debug | Baja |

## 4. Inventario de estados visuales
| Pantalla/grupo | Vacio | Datos minimos | Muchos datos | Error | Carga | Formularios | Modal/popover/panel |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | no aplica; contenido estatico | secciones normales | cards completas | no previsto | no previsto | no | nav submenus hover/focus |
| Secciones comerciales | `No hay productos publicados` | 1-3 productos | grid con filtros | backend/catalogo no carga | server fetch fallback | filtros botica | acordeones filtros |
| Fichas producto | not-found por slug | producto con stock | productos relacionados | producto no encontrado | server fetch | selector unidades | no |
| Cesta | cesta vacia | linea comprable | multiples lineas | linea invalida/sin stock | no previsto | cantidad editable | no |
| Checkout | sin lineas o bloqueado | invitado con direccion | usuario con direccion guardada | stock/pedido/pago | envio/submit | formulario contacto/envio | selector direccion |
| Pedido real | pedido no cargado | pendiente/pagado | con tracking/documento | pedido no encontrado, pago fallido | cargando estado | confirmar pago | seguimiento ancla |
| Cuenta real | sin pedidos/direcciones | cuenta + pedido | pedidos/direcciones multiples | sesion expirada/API error | cargando cuenta | direcciones/password | no |
| Legal/confianza | no aplica | contenido normal | no aplica | no previsto | no previsto | no | no |
| Legacy encargo | seleccion vacia | consulta con producto | seleccion multiple | validacion/canal | envio | formulario consulta | resumen/copiar/canales |
| Admin dashboard | sin modulos visibles | modulos cards | muchos modulos | auth denegada | carga server/API | login | topbar admin |
| Admin productos | sin productos | productos por seccion | listado largo | plantas/API error | cargando plantas | CRUD producto | tabs seccion, panel importacion |
| Admin inventario | sin registros | detalle producto | listado largo | ajuste invalido/API | detalle cargando | ajuste manual | panel detalle |
| Admin pedidos | sin pedidos | pedido pagado | muchos pedidos/filtros | transicion invalida/API | no previsto | tracking/envio | filtros estado |
| Admin importacion | sin lote | lote staging | filas multiples | fila con errores | procesando | upload/validar | tabla staging |
| Debug logs | bloqueado | logs cargados | muchos logs | token/error API | refrescando | password debug | no |

Estados responsive a cubrir: `desktop` para todos; `tablet` y `mobile` al menos para shell publico, secciones comerciales, ficha, cesta, checkout, pedido, cuenta y admin pedidos/productos.

## 5. Lista inicial para Playwright
```yaml
visualAuditRoutes:
  - id: home
    path: /
    name: Home comercial editorial
    priority: alta
    states: [default, nav-submenu-open, mobile]
    viewports: [desktop, tablet, mobile]
  - id: botica-natural
    path: /botica-natural
    name: Seccion Botica Natural
    priority: alta
    states: [with-data, empty, error]
    viewports: [desktop, mobile]
  - id: producto-botica
    path: /botica-natural/[slug]
    name: Ficha producto botica
    priority: alta
    states: [with-stock, without-stock, not-found]
    viewports: [desktop, mobile]
  - id: velas-incienso
    path: /velas-e-incienso
    name: Seccion Velas e Incienso
    priority: media
    states: [with-data, empty]
    viewports: [desktop, mobile]
  - id: minerales
    path: /minerales-y-energia
    name: Seccion Minerales y Energia
    priority: media
    states: [with-data, empty]
    viewports: [desktop, mobile]
  - id: herramientas
    path: /herramientas-esotericas
    name: Seccion Herramientas Esotericas
    priority: media
    states: [with-data, empty]
    viewports: [desktop, mobile]
  - id: colecciones
    path: /colecciones
    name: Colecciones rituales
    priority: media
    states: [default, filtered-empty, filtered-results]
    viewports: [desktop, mobile]
  - id: cesta
    path: /cesta
    name: Cesta real
    priority: alta
    states: [empty, purchasable-lines, blocked-lines]
    viewports: [desktop, mobile]
  - id: checkout
    path: /checkout
    name: Checkout real
    priority: alta
    states: [empty, guest-form, account-address, stock-error, submitting]
    viewports: [desktop, mobile]
  - id: pedido-real
    path: /pedido/[id_pedido]
    name: Pedido real
    priority: alta
    states: [pending-payment, simulated-payment-action, paid, not-found]
    viewports: [desktop, mobile]
  - id: mi-cuenta
    path: /mi-cuenta
    name: Mi cuenta
    priority: alta
    states: [logged-out-redirect, with-orders, empty-orders, email-pending]
    viewports: [desktop, mobile]
  - id: direcciones
    path: /mi-cuenta/direcciones
    name: Direcciones cuenta
    priority: media
    states: [empty, with-address, editing, error]
    viewports: [desktop, mobile]
  - id: guias
    path: /guias
    name: Indice de guias
    priority: media
    states: [default, filtered]
    viewports: [desktop, mobile]
  - id: calendario
    path: /calendario-ritual
    name: Calendario ritual
    priority: media
    states: [loading, with-rituals, empty-date, error]
    viewports: [desktop, mobile]
  - id: tarot
    path: /tarot
    name: Tarot editorial
    priority: media
    states: [default, card-selected]
    viewports: [desktop, mobile]
  - id: encargo-legacy
    path: /encargo
    name: Consulta personalizada legacy
    priority: baja
    states: [default, with-product, validation-error]
    viewports: [desktop, mobile]
  - id: admin-dashboard
    path: /admin
    name: Dashboard backoffice
    priority: alta
    states: [authenticated, unauthenticated]
    viewports: [desktop]
  - id: admin-productos
    path: /admin/productos
    name: Productos admin
    priority: alta
    states: [with-data, empty, loading-plants, error, import-panel-open]
    viewports: [desktop]
  - id: admin-pedidos
    path: /admin/pedidos
    name: Pedidos admin
    priority: alta
    states: [all, filtered-paid, filtered-sent, transition-error]
    viewports: [desktop]
  - id: legal-envios
    path: /envios-y-preparacion
    name: Envios y preparacion
    priority: baja
    states: [default]
    viewports: [desktop, mobile]
```

## 6. Riesgos detectados para la auditoria visual
| Riesgo | Evidencia | Impacto | Recomendacion |
| --- | --- | --- | --- |
| Rutas enlazadas pero no siempre en navegacion principal | `/colecciones`, `/la-botica`, legales y legacy aparecen en home/footer/cards, no todas en header | Playwright debe tomar rutas de router + enlaces, no solo header | Usar este inventario y `docs/mapa_rutas_ecommerce_local.md` como seed |
| Rutas dinamicas requieren datos reales | `[slug]`, `[id_pedido]`, pedido/cuenta dependen de seed, pedido creado o sesion | Snapshots pueden fallar si no hay datos | Ejecutar bootstrap local y crear pedido antes de snapshots transaccionales |
| Estados visuales no representables por URL directa | popovers de nav, acordeones, tabs, calendario, formularios admin, pago simulado | Necesitan interaccion Playwright | Definir scripts de interaccion por estado |
| Legacy visible controlado | `/encargo`, `/pedido-demo`, `/cuenta-demo` existen | Puede confundirse con flujo principal | Mantener como prioridad baja y etiquetado legacy |
| Admin requiere autenticacion | `/admin/*` redirige o bloquea sin token | Snapshots vacios si no hay login | Preparar sesion admin local antes de auditoria |
| Backend local no levantado | secciones DB-backed y cuenta/pedido usan API | Estados de error apareceran en lugar de datos | Documentar si el snapshot busca error o datos |
| Assets referenciados pueden faltar | `rituales_hero.webp` se referencia desde secciones principales; revisar existencia antes de snapshots | Cards pueden mostrar fallback/404 visual | Añadir check de assets antes de auditoria |
| Textos con mojibake heredado | aparecen cadenas tipo `Ã³` en algunos ficheros | Riesgo visual de copy roto | Auditar copy visual en la siguiente fase |

## 7. Cobertura recomendada minima
1. Shell publico: desktop/mobile con submenus Tienda y Guias abiertos.
2. Secciones comerciales: con datos, vacias y error API.
3. Ficha producto: con stock, sin stock y not-found.
4. Cesta: vacia, comprable y bloqueada.
5. Checkout: invitado, cuenta con direccion, stock error y submit en progreso.
6. Pedido: pendiente, pago simulado, pagado, documento y no encontrado.
7. Cuenta: resumen, pedidos, direcciones y sesion no valida.
8. Backoffice: dashboard, productos, inventario, pedidos e importacion con auth.
9. Legacy: `/encargo`, `/pedido-demo`, `/cuenta-demo` solo para verificar aislamiento.
