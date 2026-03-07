# 15 — Glosario del proyecto

## 1. Propósito del documento
Este glosario fija el lenguaje ubicuo oficial de `botica_bruja_lore` para reducir ambigüedad semántica en documentación, prompts, diseño UX, modelado de dominio e implementación futura.

Su función operativa dentro del sistema documental es:
- definir términos nucleares con significado estable,
- separar conceptos cercanos que no son equivalentes,
- establecer reglas de uso recomendadas para naming y revisión técnica,
- congelar decisiones semánticas ya acordadas en el marco documental del Ciclo 0.

No sustituye a los documentos fuente de `docs/`; los complementa como referencia rápida de vocabulario.

## 2. Principios de uso del glosario
1. **Definición única por término**: un término oficial no debe usarse con significados distintos según área.
2. **Primero dominio, luego interfaz**: el naming de frontend, backend y backoffice debe respetar esta semántica, no redefinirla.
3. **Distinción explícita entre planos**: separar lenguaje editorial/conocimiento del lenguaje comercial/transaccional.
4. **Consistencia en prompts**: prompts futuros deben usar estos términos para evitar instrucciones ambiguas.
5. **Control de ambigüedad**: términos marcados como restringidos deben evitarse o contextualizarse siempre.
6. **Congelación semántica**: las decisiones marcadas como congeladas no se reabren sin actualización explícita de documentos fuente.

## 3. Términos núcleo de producto y negocio

### La Botica de la Bruja Lore
Ecommerce editorial especializado en hierbas a granel y universo herbal-esotérico, diseñado como experiencia portfolio-first con orientación business-ready.

### portfolio-first, business-ready
Enfoque de producto que prioriza una demo sólida, navegable y presentable como portfolio profesional, sin perder estructura ni decisiones aptas para evolución comercial real.

### demo sólida y creíble
Estado objetivo del producto en esta fase: experiencia funcional demostrable y coherente, sin activar compra real ni operación comercial completa.

### pedido demo
Representación transaccional simulada para validar flujos de ecommerce en entorno de demostración. No implica transacción económica real ni cumplimiento logístico real.

### línea de pedido
Elemento individual dentro de un pedido demo, asociado a un producto y su cantidad, usado para modelar y validar composición de carrito/checkout.

### usuario autenticado
Usuario que accede mediante credenciales al sistema con identidad persistente y permisos según rol.

### invitado
Usuario no autenticado que puede navegar y, según fase, operar flujos permitidos sin cuenta persistente.

### backoffice
Interfaz administrativa operable por negocio/editorial para gestionar catálogo, contenido y operación demo con lenguaje claro de negocio. No es un panel técnico críptico.

### flujo editorial
Proceso de creación, revisión, publicación y mantenimiento de contenido de conocimiento/comunicación del proyecto.

### borrador
Estado de contenido editable no visible públicamente, aún sujeto a revisión.

### publicado
Estado de contenido visible en canales públicos según reglas de presentación y SEO.

### archivado
Estado de contenido retirado de publicación activa pero conservado para trazabilidad y posible reuso.

### núcleo herbal navegable
Conjunto mínimo coherente de capacidades navegables (catálogo + contenido + flujos demo) que materializa valor demostrable del dominio herbal.

## 4. Términos núcleo de dominio y catálogo

### planta
Entidad de conocimiento botánico-herbal (propiedades descriptivas, contexto, relaciones editoriales). No es un ítem de venta por sí misma.

### producto
Entidad comercial vendible del catálogo (formato, precio, disponibilidad, atributos de compra). Puede referenciar plantas, pero no se confunde con ellas.

### taxonomía / categoría comercial
Sistema de clasificación orientado a navegación y venta del catálogo de productos. Organiza oferta comercial; no define naturaleza ontológica del dominio.

### ritual
Composición o práctica contextual de uso simbólico/editorial. Puede relacionarse con productos y correspondencias, pero no equivale a categoría comercial.

### pack
Agrupación comercial de varios productos presentada como unidad de oferta con propósito de compra.

### sinergia
Relación editorial/comercial entre elementos (plantas, productos o rituales) que se recomiendan juntos por coherencia de uso o intención.

### intención
Objetivo de uso declarado desde la perspectiva de la persona usuaria (p. ej., foco, descanso, limpieza simbólica), útil para descubrimiento y navegación temática.

### correspondencia
Vínculo simbólico-tradicional (elementos, asociaciones culturales o esotéricas) usado como capa interpretativa editorial; no sustituye la intención de uso.

### regla de calendario
Regla temporal reusable que determina cuándo aplica o se sugiere una acción/contenido en función de calendario. Es entidad separada de ritual.

### guía botánica
Contenido editorial estructurado sobre conocimiento herbal y contexto de uso responsable, sin claims médicos.

### ficha de planta
Vista/artefacto de contenido centrado en una planta como entidad de conocimiento.

### ficha de producto
Vista/artefacto comercial centrado en un producto comprable del catálogo.

## 5. Términos de UX, navegación y contenido

### hub de intención
Página o nodo de navegación que agrupa contenido y oferta relacionada con una intención concreta para facilitar descubrimiento orientado a objetivo.

### contenido editorial
Contenido con función informativa, contextual o educativa que aporta comprensión y criterio de uso dentro del universo de marca.

### SEO comercial
Optimización orientada a páginas transaccionales (categorías, fichas de producto, listados) para visibilidad con intención de compra.

### SEO editorial
Optimización orientada a contenidos de conocimiento (guías, artículos, fichas de planta) para captación informativa y autoridad temática.

### SEO relacional
Estrategia de enlazado y arquitectura semántica entre contenido editorial y comercial para mejorar descubrimiento, contexto y navegabilidad.

## 6. Términos de operación demo y calidad

### quality gate
Conjunto obligatorio de controles verificables (tests, linting, validaciones de arquitectura/calidad y criterios de aceptación) que una entrega debe superar.

### done
Estado de trabajo con implementación real y evidencia verificable de funcionamiento, calidad y cumplimiento arquitectónico. No equivale a “definido” ni a “documentado”.

## 7. Términos de marca y narrativa

### marca
Sistema de identidad y promesa de experiencia del proyecto (tono, estética, valores y coherencia comercial-editorial), más amplio que un personaje o recurso visual.

### Bruja Lore
Personaje/voz narrativa con función estructural de identidad, curaduría y coherencia del universo del producto. No es un adorno ni una mascota decorativa.

### programador
Actor técnico que implementa y mantiene el sistema. Es rol habilitador del producto, no protagonista narrativo de la marca.

## 8. Términos ambiguos o de uso restringido

### Términos a evitar sin contexto
- **“Artículo”**: ambiguo entre contenido editorial y producto; usar “contenido editorial” o “producto” según corresponda.
- **“Ficha”** (sin calificador): usar siempre “ficha de planta” o “ficha de producto”.
- **“Categoría”** (sin calificador): usar “categoría comercial” cuando aplique catálogo.
- **“Ritual de producto”**: combinación ambigua; separar plano ritual (editorial) del plano producto (comercial).
- **“Compra”** en fase demo: preferir “pedido demo” cuando no exista transacción real.
- **“Panel”** para backoffice: preferir “backoffice” salvo referencia técnica concreta de componente UI.

### Uso con cautela
- **“Natural”** y **“místico”**: términos de narrativa/tono; no usarlos como categorías de modelado de dominio.
- **“Curación”**: usar solo en sentido editorial (“curación de contenido”); evitar connotación sanitaria.

## 9. Decisiones semánticas congeladas

### Decisiones consolidadas (congeladas)
1. **planta ≠ producto**: separación obligatoria de entidades y de naming.
2. **ritual ≠ categoría de producto**: ritual pertenece al plano editorial/simbólico.
3. **intención ≠ correspondencia**: intención es objetivo de uso; correspondencia es marco simbólico.
4. **taxonomía comercial ≠ tipo de producto**: la taxonomía organiza navegación/venta, no redefine ontología.
5. **contenido editorial ≠ contenido decorativo**: todo contenido editorial debe aportar contexto útil verificable.
6. **demo sólida y creíble ≠ compra real**: operación actual es demostrativa, no transaccional real.
7. **done ≠ definido/documentado**: DONE exige evidencia de implementación y validación.
8. **backoffice ≠ panel técnico críptico**: lenguaje y flujo orientados a operación de negocio/editorial.
9. **Bruja Lore ≠ mascota decorativa**: rol narrativo estructural, no ornamento.
10. **programador ≠ protagonista de marca**: protagonismo narrativo recae en la propuesta de valor y la voz de marca.

### Propuesta operativa inicial (no congelada)
Para mantener consistencia diaria, se recomienda etiquetar términos en prompts y revisiones con prefijo de familia cuando haya riesgo de ambigüedad:
- `[NEGOCIO]`, `[DOMINIO]`, `[CATALOGO]`, `[UX]`, `[DEMO]`, `[MARCA]`.

Esta convención es sugerida para reducir errores de interpretación inter-área y puede ajustarse sin romper decisiones semánticas congeladas.
