# 06 — Catálogo y taxonomías de La Botica de la Bruja Lore

## 1. Propósito del documento
Definir la arquitectura semántica oficial del catálogo para evitar ambigüedades entre ejes de clasificación, sostener una navegación coherente y habilitar implementación consistente en backend, frontend, admin y SEO.

Este documento fija cómo se organiza el catálogo comercial y cómo se conecta con el plano editorial sin mezclar responsabilidades. No define pantallas ni roadmap de ejecución.

## 2. Principios rectores de organización del catálogo
1. **Separación de ejes semánticos**: tipo de producto, categoría comercial, intención, correspondencia y ritual son ejes distintos y no intercambiables.
2. **Puerta herbal dominante**: la línea de hierbas a granel es la entrada principal y más clara del proyecto.
3. **Progresión natural → místico**: la navegación prioriza primero utilidad y claridad comercial, y después profundiza en capas simbólicas.
4. **Editorial y comercial separados pero conectados**: el plano de conocimiento no sustituye el catálogo de compra, y el catálogo no absorbe entidades editoriales.
5. **Taxonomía controlada**: se evita proliferación de categorías, naming inconsistente o facetas redundantes.
6. **Aplicabilidad operativa**: cada eje definido aquí debe poder mapearse a filtros, navegación, enlaces internos y gestión en backoffice.

## 3. Diferencia entre ejes semánticos del sistema
### 3.1 Tipo de producto
Clasifica **qué se vende** por naturaleza comercial y logística del artículo. Es un eje estructural base del catálogo.

### 3.2 Taxonomía/categoría comercial
Organiza **cómo se agrupan para comprar o explorar dentro de una línea comercial**. No reemplaza al tipo de producto; lo complementa para ordenar navegación y merchandising.

### 3.3 Intención
Clasifica **para qué propósito busca el usuario** (descubrimiento guiado por objetivo). Es un eje transversal, especialmente valioso para usuarios no expertos.

### 3.4 Correspondencia
Clasifica **asociaciones simbólicas y místicas** (p. ej., elementos de tradición esotérica). Es una capa secundaria de afinidad, útil para profundización, no para dominar la entrada principal.

### 3.5 Ritual (entidad navegable)
Representa **contenido relacional** que conecta productos, pasos, contexto y recomendaciones. No es categoría de producto y no debe modelarse como tal.

### 3.6 Colección o agrupación editorial/comercial
Agrupación curada y temporal o temática para storytelling comercial/editorial (por ejemplo, selección de temporada o curación de regalo). No sustituye taxonomías base.

## 4. Tipos de producto oficiales
Los tipos de producto congelados para el catálogo son:
1. **Hierbas a granel** (línea de entrada principal).
2. **Inciensos y sahumerios**.
3. **Herramientas rituales**.
4. **Tarot y oráculos**.
5. **Minerales y piedras**.
6. **Packs y cestas** (con orientación especialmente herbal en la línea de regalo).

Regla de estabilidad: estos tipos constituyen la estructura comercial base de la demo sólida actual y no deben reinterpretarse como intenciones ni como rituales.

## 5. Taxonomías comerciales y de navegación
### 5.1 Líneas principales del catálogo
El catálogo se organiza en seis líneas comerciales, alineadas con los tipos oficiales anteriores, con prioridad visual de entrada en **hierbas a granel**.

### 5.2 Separación estructural obligatoria
- **Catálogo herbal**: foco principal de entrada y descubrimiento funcional.
- **Herramientas esotéricas**: línea comercial separada, conectada por intención y ritual.
- **Tarot/oráculos**: línea comercial específica, no absorbida por herramientas genéricas.
- **Minerales**: línea comercial autónoma, conectable por intención/correspondencia.
- **Packs/regalos**: línea comercial de curación, con refuerzo herbal.
- **Contenido ritual**: capa navegable conectada al catálogo, fuera de la taxonomía de producto.

### 5.3 Criterio de diseño de taxonomías comerciales
- Pocas categorías raíz, semánticamente inequívocas.
- Subclasificación solo cuando haya impacto real en búsqueda, filtro o gestión.
- Naming estable, entendible para público general y mantenible en admin.
- Prohibido usar correspondencias o rituales como sustituto de categorías comerciales.

## 6. Intenciones como eje de descubrimiento
La intención es eje prioritario de descubrimiento junto al tipo/categoría comercial.

Reglas operativas:
1. Debe aparecer como filtro transversal y como puerta de exploración guiada.
2. Debe conectar productos de distintas líneas cuando comparten propósito de uso.
3. Debe sostener enlaces internos entre catálogo y contenido editorial.
4. Debe tener más peso visual que las correspondencias en experiencia principal.

Resultado esperado: usuario agnóstico o principiante puede descubrir catálogo por propósito sin depender de conocimiento esotérico previo.

## 7. Correspondencias como capa secundaria
Las correspondencias se mantienen como capa semántica válida pero subordinada.

Reglas operativas:
1. No dominan arquitectura de navegación principal.
2. Se usan para profundización, afinidad y enriquecimiento de ficha/contenido.
3. No reemplazan ni tipo de producto, ni categoría comercial, ni intención.
4. Su exposición visual debe ser de segundo plano frente a ejes comerciales y de intención.

Esto protege la experiencia para público amplio y conserva el valor místico sin convertir el catálogo en un sistema críptico.

## 8. Rituales como capa conectada, no como categoría de producto
`Ritual` es entidad navegable de contenido relacional y debe mantenerse fuera del árbol de categorías de producto.

Reglas operativas:
1. Un ritual puede vincular múltiples productos y una misma referencia comercial puede aparecer en varios rituales.
2. La navegación ritual debe reforzar descubrimiento y contexto, no redefinir estructura de catálogo.
3. El acceso a rituales puede ocurrir desde fichas, bloques editoriales e interlinking SEO, sin fusionarse con taxonomía comercial.
4. La separación `ReglaCalendario`/`Ritual` y la separación editorial/comercial se preservan sin excepciones.

## 9. Reglas de representación comercial por tipo de producto
Para la demo actual:
1. **Hierbas a granel**: representación estándar de 100 g en v1.
2. **Herramientas rituales**: representación por unidad.
3. **Packs y cestas**: representación como pack cerrado.
4. **Resto de tipos**: representación conforme a su naturaleza comercial, sin forzar unidad única global.
5. **Stock real**: no activo en esta fase; la representación comercial debe seguir siendo creíble y consistente.

### 9.1 Criterio de producto vendible local
En la fase ecommerce local simulado, un producto público solo puede tratarse como vendible si cumple contrato comercial completo:

1. `sku`, `slug` único y `nombre` no vacíos.
2. `precio_numerico` mayor que cero y `precio_visible` coherente.
3. `unidad_comercial` válida: `ud`, `g` o `ml`.
4. `incremento_minimo_venta` y `cantidad_minima_compra` positivos y compatibles.
5. `tipo_fiscal` válido: `iva_general` o `iva_reducido`.
6. `seccion_publica` pertenece a una sección pública abierta.
7. `publicado=True`.
8. inventario asociado con unidad compatible y stock suficiente para la cantidad mínima.
9. imagen o fallback visual disponible en frontend.
10. CTA público hacia cesta/checkout real; si no cumple stock o contrato, debe derivar a consulta personalizada o quedar bloqueado.

### 9.2 Criterio de sección publicable local
- `botica-natural` debe tener al menos 5 productos publicados propios.
- `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` deben tener al menos 3 productos publicados propios si están abiertas.
- Una sección abierta no debe rellenarse con fallback herbal ajeno.
- Si una sección no alcanza mínimo, debe mostrarse vacío honesto o quedar fuera de promoción principal hasta corregir datos.

Para corregir un producto incompleto, actualizar seed/importación/admin con SKU, precio, unidad, fiscalidad, sección, stock e inventario compatible antes de exponerlo como comprable.

## 10. Implicaciones para admin, frontend y SEO
### 10.1 Admin (backoffice)
- Gestión separada de: tipos de producto, categorías comerciales, intenciones, correspondencias y rituales.
- Validaciones para impedir que ritual/correspondencia se registren como categoría comercial.
- Taxonomías controladas (alta, baja y naming) para evitar deriva semántica.

### 10.2 Frontend
- Descubrimiento principal apoyado en tipo/categoría + intención.
- Correspondencias en segundo plano visual.
- Navegación editorial conectada al catálogo sin colapsar ejes.
- Transición natural → místico implementada por jerarquía de exposición semántica.

### 10.3 SEO y enlazado interno
- Arquitectura de URLs y landings alineada con taxonomía comercial e intención como ejes primarios.
- Ritual y contenido editorial como red de interlinking contextual.
- Correspondencias como enriquecimiento semántico secundario (no como árbol principal indexable del catálogo).
- Evitar canibalización entre páginas comerciales y páginas editoriales mediante propósito de búsqueda diferenciado.

## 11. Decisiones congeladas y aspectos evolutivos
### 11.1 Congelado en esta fase
1. Separación semántica entre tipo de producto, categoría comercial, intención, correspondencia y ritual.
2. Tipos de producto oficiales del catálogo.
3. Hierbas a granel como puerta principal de entrada.
4. Intención como eje fuerte de descubrimiento transversal.
5. Correspondencias como capa secundaria.
6. Ritual como entidad conectada, no como categoría de producto.
7. Separación estructural entre plano comercial y plano editorial.

### 11.2 Evolutivo sin romper la base
1. Refinamiento gradual de subcategorías comerciales por evidencia de uso.
2. Profundidad y vocabulario de intenciones y correspondencias.
3. Curación de colecciones editoriales/comerciales temporales.
4. Reglas de priorización visual por contexto de campaña o temporada.
5. Ampliación de enlaces internos entre catálogo, fichas y contenido ritual/editorial.

Criterio de evolución: todo ajuste futuro debe preservar las separaciones semánticas fijadas en este documento y la progresión natural → místico definida por la visión del producto.
