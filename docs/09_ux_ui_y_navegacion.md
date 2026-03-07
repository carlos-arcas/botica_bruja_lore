# 09 — UX, UI y navegación pública

## 1. Propósito del documento
Establecer la arquitectura de información y el marco oficial de experiencia pública de **La Botica de la Bruja Lore** para las próximas fases de implementación.

Este documento fija:
- estructura de navegación pública,
- lógica principal de descubrimiento,
- jerarquías de contenido comercial/editorial,
- criterios UX para home, listados y fichas,
- límites entre decisiones congeladas y aspectos evolutivos.

No reemplaza documentos de arquitectura técnica, dominio, catálogo o checkout profundo. Su objetivo es evitar derivas hacia una tienda genérica, una narrativa confusa o una experiencia esotérica sin claridad operativa.

## 2. Objetivos de UX del proyecto
1. **Garantizar utilidad comercial real en contexto demo**: una persona debe poder encontrar, comprender y seleccionar productos sin fricción innecesaria.
2. **Sostener la identidad editorial del proyecto**: la experiencia debe reflejar conocimiento herbal, ritual y capa simbólica curada, sin perder foco funcional.
3. **Habilitar doble entrada de uso**:
   - navegación directa por catálogo (usuario con objetivo claro),
   - navegación guiada por intención/ritual/contenido (usuario exploratorio).
4. **Mantener progresión natural → místico** para ampliar alcance sin excluir a usuarios agnósticos.
5. **Preservar separación editorial/comercial en la interfaz** de forma explícita y comprensible.
6. **Preparar base escalable para frontend, SEO y móvil** sin sobredefinir detalle visual de alta fidelidad.

## 3. Principios rectores de navegación y arquitectura de información
### 3.1 Decisiones consolidadas
- La home funciona como **portada narrativa navegable**, no como listado frío de productos.
- El eje principal de entrada comercial son las **hierbas a granel**.
- `Ritual` es entidad navegable conectada al catálogo, no categoría de producto.
- Las **intenciones** son eje fuerte de descubrimiento.
- Las **correspondencias** son capa secundaria, opcional y no intrusiva.
- Debe mantenerse separación visible entre plano editorial/conocimiento y plano comercial/compra.
- La experiencia global debe ser portfolio-first, business-ready, con transición natural ↔ místico.

### 3.2 Criterios operativos de UX
- **Primero claridad, luego atmósfera**: ningún recurso narrativo/visual puede degradar comprensión, escaneo o acción.
- **Navegación multi-ruta**: no depender solo del “catálogo clásico”.
- **Descubrimiento con intención explícita**: la intención no se trata como tag decorativo.
- **Densidad controlada**: evitar sobrecarga visual y terminológica en primeras pantallas.
- **Consistencia semántica**: tipo de producto, categoría comercial, intención, correspondencia y ritual se muestran como ejes distintos.

## 4. Perfiles de entrada y recorridos principales de usuario
### 4.1 Compra directa herbal
- Usuario: sabe qué hierba o formato busca.
- Entrada típica: buscador, menú de catálogo, acceso directo a “Hierbas a granel”.
- Necesidad UX: velocidad, filtros útiles, ficha clara y disponibilidad visible.

### 4.2 Descubrimiento guiado por intención
- Usuario: parte de una necesidad simbólica/práctica (“calma”, “limpieza”, “enfoque”, etc.).
- Entrada típica: bloque de intenciones en home, navegación por intención, enlaces contextuales desde fichas.
- Necesidad UX: traducción de intención a opciones concretas sin ambigüedad.

### 4.3 Exploración ritual conectada
- Usuario: busca experiencia ritual (no solo producto unitario).
- Entrada típica: menú de rituales, tarjetas de ritual en home, enlaces desde fichas de hierba/producto.
- Necesidad UX: separar “ritual como práctica” de “producto como recurso”, mostrando relación clara entre ambos.

### 4.4 Compra de regalo/packs
- Usuario: prioriza decisión rápida y presentación curada.
- Entrada típica: sección Packs y regalos, módulos destacados en home y sugerencias contextuales.
- Necesidad UX: curación compacta, señal de ocasión/uso, facilidad de comparación.

## 5. Arquitectura de información pública
La arquitectura pública base se organiza en cinco macrobloques:

1. **Catálogo herbal (principal comercial)**
   - Hierbas a granel.
   - Otros tipos de producto complementarios aprobados por catálogo.
2. **Descubrimiento por intención (principal transversal)**
   - Hub de intenciones.
   - Páginas de intención con cruces a hierbas, rituales y packs.
3. **Rituales y prácticas (editorial conectado)**
   - Listado de rituales.
   - Fichas rituales con recursos asociados.
4. **Guía botánica y conocimiento (editorial base)**
   - Planta/conocimiento, glosario y contenidos educativos.
5. **Packs y regalos (comercial curado)**
   - Selección empaquetada para decisión rápida.

Regla estructural: los cinco bloques conviven en navegación pública, pero con prioridad funcional explícita en hierbas + intención.

## 6. Navegación global y jerarquía de secciones
### 6.1 Propuesta operativa inicial de menú principal
> **Estado**: propuesta operativa inicial razonada (evolutiva), alineada con decisiones ya consolidadas.

Orden recomendado de primer nivel:
1. Hierbas a granel
2. Intenciones
3. Rituales
4. Guía botánica
5. Packs y regalos

Entradas de utilidad en cabecera:
- Buscador global (acceso visible en desktop y móvil).
- Accesos funcionales de ecommerce demo (favoritos/carrito demo) sin robar protagonismo a navegación principal.

### 6.2 Jerarquía visual de navegación
#### Peso primario
- Hierbas a granel.
- Intenciones.

#### Peso secundario alto
- Rituales.
- Guía botánica.

#### Peso secundario táctico
- Packs y regalos.
- Capa de correspondencias (principalmente contextual, no eje de menú primario).

### 6.3 Reglas de legibilidad y control de complejidad
- Máximo de opciones primarias simultáneas en cabecera dentro de rango escaneable.
- Evitar menús mega-desplegables con taxonomías excesivas en fase inicial.
- Priorizar etiquetas semánticamente claras sobre nombres excesivamente poéticos.

## 7. Home como portada narrativa navegable
### 7.1 Función de la home
La home debe comportarse como **portada editorial-comercial navegable**: orienta, inspira y habilita entrada rápida a acciones clave.

### 7.2 Estructura base de home
1. **Hero principal**
   - Mensaje de propuesta de valor.
   - CTA dual mínimo:
     - entrada a hierbas,
     - entrada a descubrimiento por intención.
2. **Bloque de tarjetas grandes de secciones**
   - Hierbas a granel.
   - Intenciones.
   - Rituales.
   - Guía botánica.
   - Packs y regalos.
3. **Bloques posteriores de apoyo**
   - Destacados comerciales curados.
   - Piezas editoriales breves de contexto.
   - Conexiones cruzadas (ej. hierba ↔ ritual, intención ↔ selección).

### 7.3 Balance editorial vs comercial en home
- El primer impacto combina identidad + orientación funcional.
- El flujo inicial no puede enterrarse bajo storytelling largo.
- La narrativa acompaña la navegación; no sustituye jerarquía ni llamadas a la acción.

### 7.4 Papel de Bruja Lore en home
- Presencia fuerte como guía narrativa/visual de marca.
- Uso orientador (señalizar rutas o contextos), no meramente decorativo.
- Nunca bloquear legibilidad de título, CTA o estructura de tarjetas.

## 8. Descubrimiento: catálogo, intención, ritual y guía
### 8.1 Descubrimiento por catálogo
- Entrada directa a listados por tipo y taxonomía comercial.
- Filtros orientados a decisión rápida.
- Cruces sugeridos a intención y ritual cuando aporten contexto real.

### 8.2 Descubrimiento por intención
- Hub de intenciones como mecanismo explícito de navegación.
- Cada intención debe enlazar a:
  - hierbas relevantes,
  - rituales relacionados,
  - packs si aplica.
- Mantener lenguaje comprensible y no ambiguo para usuarios nuevos.

### 8.3 Descubrimiento por ritual
- Listado de rituales con resumen de propósito y contexto.
- Desde cada ritual: recursos sugeridos, plantas y productos asociados.
- Evitar presentar ritual como sustituto del catálogo comercial.

### 8.4 Descubrimiento por guía botánica
- Entrada editorial para aprendizaje y confianza.
- Conexión progresiva hacia catálogo cuando exista relación útil.
- Soporte a SEO evergreen sin mezclar semántica comercial/editorial.

### 8.5 Buscador, filtros y enlaces internos
#### Buscador (decisión consolidada de rol)
- Debe existir como acceso transversal de alta visibilidad.
- Debe devolver resultados mixtos con clasificación clara (producto, planta, ritual, guía).

#### Filtros (propuesta operativa inicial)
- Priorizar filtros de alto valor para decisión temprana.
- Evitar exceso de facetas en primera iteración.
- Permitir combinación gradual de criterios sin UX críptica.

#### Enlaces entre fichas (decisión consolidada de principio)
- Las fichas deben incorporar enlaces cruzados curados entre entidades relacionadas.
- El enlazado interno debe mejorar navegación y contexto, no generar bucles confusos.

## 9. Jerarquía UX de listados y fichas principales
### 9.1 Listado de hierbas (prioridad alta)
Jerarquía informativa recomendada:
1. Nombre comercial claro.
2. Tipo/formato y datos comerciales esenciales.
3. Señales de intención principal.
4. Acceso a detalle y relación editorial (planta/ritual) como apoyo.

### 9.2 Ficha de hierba (prioridad alta)
Jerarquía informativa recomendada:
1. Bloque principal de decisión (qué es, para quién, formato, datos comerciales demo).
2. Contexto editorial útil (origen, uso tradicional responsable, notas de curación).
3. Enlaces a intención y ritual relacionados.
4. Correspondencias en bloque secundario/colapsable cuando aplique.

### 9.3 Listado de rituales (prioridad media-alta)
Jerarquía informativa recomendada:
1. Nombre y propósito del ritual.
2. Nivel de contexto/ocasión.
3. Recursos vinculados (plantas/productos sugeridos).
4. Acceso a ficha ritual detallada.

### 9.4 Ficha de ritual (prioridad media-alta)
Jerarquía informativa recomendada:
1. Objetivo y marco del ritual.
2. Pasos/contexto editorial curado.
3. Recursos asociados con enlace directo a catálogo.
4. Capa simbólica/correspondencias como ampliación opcional.

### 9.5 Packs y regalos (prioridad táctica)
Jerarquía informativa recomendada:
1. Propósito del pack y situación de uso/regalo.
2. Contenido y valor percibido.
3. Enlace a detalle comercial.
4. Conexiones a intención/ritual si enriquecen decisión.

## 10. Uso de ilustración, personajes y capa narrativa dentro de UX
### 10.1 Bruja Lore como guía
#### Decisión consolidada
- Bruja Lore es guía visual/narrativa relevante en experiencia pública.
- Presencia más intensa en home, guías, rituales y calendario editorial.
- Presencia sutil en fichas de producto.
- Presencia mínima o casi ausente en carrito, checkout y admin.

### 10.2 Regla de subordinación funcional
- Ilustración, ambientación y capa narrativa deben reforzar orientación, tono y memorabilidad.
- Si existe conflicto entre atmósfera y usabilidad, prevalece usabilidad.

### 10.3 Capa simbólica/correspondencias
#### Decisión consolidada
- Es capa secundaria de profundidad.
- Debe ser visible para quien la busca, prescindible para quien no la necesita.

#### Propuesta operativa inicial
- Presentación en bloques de “ampliar contexto” o secciones secundarias en fichas.
- Evitar ubicar correspondencias por encima de información de decisión comercial esencial.

## 11. Implicaciones para frontend, admin, SEO y responsive
### 11.1 Frontend público
- Implementar navegación basada en IA definida aquí, no solo en árbol de categorías.
- Diseñar componentes de entrada múltiple (catálogo, intención, ritual, guía, regalo).
- Garantizar jerarquía visual consistente entre páginas de listado y detalle.

### 11.2 Admin (backoffice)
- El modelo editorial/comercial separado debe reflejarse en flujos de gestión.
- Debe existir soporte de curación para intenciones, relaciones rituales y enlaces cruzados.
- Evitar que el backoffice fuerce una UX pública reducida a taxonomía comercial plana.

### 11.3 SEO
- Rutas estables por tipo de página (catálogo, intención, ritual, guía).
- Enlazado interno deliberado entre planos editorial/comercial sin mezcla semántica errónea.
- Home y hubs de intención como activos de descubrimiento orgánico.

### 11.4 Navegación móvil/responsive
- Cabecera simplificada con acceso inmediato a menú y buscador.
- Priorizar acceso a Hierbas, Intenciones y Rituales en primer nivel móvil.
- Reducir carga narrativa inicial para preservar escaneo y acción en pantallas pequeñas.

## 12. Decisiones congeladas y aspectos evolutivos
### 12.1 Congelado en esta fase
1. Home como portada narrativa navegable.
2. Prioridad funcional de Hierbas a granel + Descubrimiento por Intención.
3. Rituales como entidad conectada, no categoría de producto.
4. Separación visible editorial/conocimiento vs comercial/compra.
5. Capa de correspondencias como secundaria y opcional.
6. Presencia de Bruja Lore como guía, subordinada a claridad y utilidad.
7. Navegación pública multi-ruta (compra directa, descubrimiento, ritual, guía, regalos).

### 12.2 Evolutivo sin romper la base
1. Taxonomía fina de submenús y etiquetas exactas de navegación.
2. Densidad final de bloques en home por iteraciones de validación.
3. Profundidad del buscador (sugerencias, ranking, sinónimos) en ciclos de implementación.
4. Estrategia final de filtros por tipo de entidad según datos reales.
5. Nivel de protagonismo visual de piezas narrativas por tests UX y rendimiento.
6. Microcopy final de CTA y ayudas contextuales.

## 13. Criterio de uso de este documento en prompts futuros
- Todo prompt de frontend/navegación debe declarar qué secciones de este documento implementa.
- No se permite proponer pantallas que contradigan jerarquía de rutas o peso de ejes definida aquí.
- Las decisiones marcadas como “propuesta operativa inicial” pueden refinarse con evidencia, sin romper los principios congelados.
- Este documento guía arquitectura de experiencia; no sustituye reglas de dominio, arquitectura técnica ni quality gate.
