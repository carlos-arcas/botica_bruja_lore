# 05 — Modelo de dominio y entidades: La Botica de la Bruja Lore

## 1. Propósito del documento
Este documento define el **modelo de dominio oficial** de La Botica de la Bruja Lore para alinear decisiones funcionales y de diseño de datos entre backend, frontend, backoffice y navegación editorial/comercial.

Su objetivo es **congelar el núcleo de modelado** que debe permanecer estable durante los ciclos de implementación, evitando refactors destructivos y preservando coherencia con la visión portfolio-first, business-ready y con la progresión natural → místico.

Este documento distingue explícitamente:
- lo que se fija como base estable de dominio;
- lo que se deja como evolución controlada por ciclos;
- lo que no debe modelarse todavía como hecho implementado.

## 2. Principios de modelado del dominio
1. **Separación editorial/comercial obligatoria**
   - El plano de conocimiento (plantas, rituales, sinergias, correspondencias, intenciones) y el plano de compra (productos, pedidos demo, líneas, favoritos, carrito guardado) deben coexistir conectados, pero no fusionados.

2. **Producto ≠ conocimiento base**
   - `Planta` representa conocimiento reusable y transversal.
   - `Producto` representa una oferta concreta comprable y versionable por marca/formato/presentación.

3. **Relación curada por encima de automatismo opaco**
   - Sinergias y relaciones rituales se modelan como enlaces editoriales curados y explicados, no como inferencia automática sin trazabilidad.

4. **Dominio preparado para crecimiento por ciclos**
   - El núcleo debe soportar implementación incremental (Ciclos 1→6) sin romper contratos de entidad.

5. **Narrativa utilitaria**
   - Toda entidad editorial debe justificar utilidad real en descubrimiento, orientación o decisión de compra.

6. **Compliance comunicativo integrado al dominio**
   - El dominio debe facilitar contenido no sanitario, sin promesas médicas ni milagrosas, como regla de negocio transversal.

7. **i18n y SEO como capacidades del modelo, no accesorios**
   - Entidades con exposición pública deben soportar naming, slug, extractos y variantes de contenido preparados para localización y posicionamiento.

## 3. Entidades núcleo

### 3.1 Planta
**Propósito**
- Ser la ficha base de conocimiento herbal (editorial y taxonómica), independiente de la oferta comercial puntual.

**Responsabilidad**
- Consolidar identidad botánica/editorial de una hierba y actuar como nodo de relación con rituales, sinergias, intenciones y correspondencias.

**Atributos clave sugeridos**
- Identificador estable de dominio.
- Nombre principal (uso común) y variantes nominales.
- Slug canónico público.
- Resumen editorial corto y descripción extendida.
- Perfil sensorial/simbólico (no médico).
- Estado de publicación y trazabilidad editorial.

**Relaciones principales**
- 1:N con `Producto` (una planta puede tener múltiples productos actuales/futuros).
- N:M con `Ritual` (planta base de ritual).
- N:M con `Sinergia` (participante de combinaciones curadas).
- N:M con `Intención`.
- N:M con `Correspondencia` (capa lateral mística).
- N:M con `Taxonomía`.

**Reglas de negocio asociadas**
- No debe contener precio ni condiciones comerciales.
- Debe poder existir sin productos activos (conocimiento primero).
- Contenido sujeto a control de lenguaje no sanitario.

**Riesgos de mal modelado**
- Colapsarla con `Producto` impediría reutilización editorial, comparación entre marcas y evolución multiformato.
- Sobrecargarla con atributos de venta rompe separación de responsabilidades.

**Prioridad aproximada**
- Alta desde Ciclo 1 (núcleo herbal navegable).

### 3.2 Producto
**Propósito**
- Representar el ítem comprable en la demo ecommerce, con identidad comercial explícita.

**Responsabilidad**
- Encapsular condiciones de oferta, presentación, pertenencia a tipo de producto y vinculación opcional a conocimiento base.

**Atributos clave sugeridos**
- Identificador de dominio y SKU interno demo (si aplica).
- Nombre comercial y slug público.
- Descripción corta orientada a compra.
- Tipo de producto (hierba granel, incienso/sahumerio, herramienta ritual, tarot/oráculo, mineral/piedra, pack/cesta).
- `seccion_publica` para navegación/composición comercial (por ejemplo, `botica-natural`, `velas-e-incienso`, `minerales-y-energia`, `herramientas-esotericas`).
- Marca referenciada.
- Estado de disponibilidad demo/publicación.
- Precio de referencia demo y metadatos de presentación.

**Relaciones principales**
- N:1 con `Marca`.
- N:1 opcional con `Planta` (obligatoria para hierbas a granel; no obligatoria para otros tipos).
- N:M con `Ritual` (producto recomendado para un ritual).
- N:M con `Sinergia`.
- N:M con `Intención`.
- N:M con `Taxonomía`.
- 1:N con `LíneaPedido`.
- N:M con `Usuario` a través de `Favorito`.

**Reglas de negocio asociadas**
- Debe poder existir producto no herbal sin vínculo a planta.
- No requiere stock real ni pago real en esta fase.
- Debe permitir activación/desactivación para demo sin eliminar historial.
- `tipo_producto` y `seccion_publica` no son sinónimos: el primero clasifica la familia comercial de dominio y la segunda nombra la superficie pública. Para herramientas, la convención canónica vigente es `tipo_producto="herramientas-rituales"` + `seccion_publica="herramientas-esotericas"`.

**Riesgos de mal modelado**
- Forzar que todo producto derive de planta bloquea categorías no herbales.
- Usar categorías solo visuales sin taxonomía de dominio degrada filtros y SEO.

**Prioridad aproximada**
- Alta desde Ciclo 1 y crítica en Ciclo 3.

### 3.3 Ritual
**Propósito**
- Formalizar prácticas rituales como entidad navegable y conectable al catálogo.

**Responsabilidad**
- Actuar como puente de descubrimiento guiado entre intención, contexto editorial y selección de elementos (plantas, productos, herramientas, packs).

**Atributos clave sugeridos**
- Identificador y slug canónico.
- Título editorial y propósito del ritual.
- Nivel de complejidad/entrada (iniciación, intermedio, etc.).
- Descripción paso a paso en clave editorial utilitaria.
- Estado de publicación.

**Relaciones principales**
- N:M con `Planta` (base herbal).
- N:M con `Producto` (elementos concretos recomendados).
- N:M con `Pack` (ruta rápida de compra guiada).
- N:M con `Intención`.
- N:M con `Correspondencia`.
- 1:N con `ReglaCalendario`.

**Reglas de negocio asociadas**
- Debe admitir relación simultánea con plantas base y productos concretos.
- Debe permanecer libre de afirmaciones sanitarias o promesas milagrosas.

**Riesgos de mal modelado**
- Modelarlo como simple artículo de contenido impediría navegación transaccional guiada.
- Acoplarlo solo a productos reduciría profundidad editorial.

**Prioridad aproximada**
- Media-alta en Ciclo 2; alta en Ciclo 5 por calendario.

### 3.4 Sinergia
**Propósito**
- Representar combinaciones curadas y explicadas entre elementos del dominio.

**Responsabilidad**
- Capturar el “por qué juntos” de plantas/productos/rituales con lógica editorial verificable.

**Atributos clave sugeridos**
- Título y slug.
- Descripción explicativa breve y desarrollada.
- Tipo de sinergia (herbal, ritual, mixta).
- Estado de curación/publicación.

**Relaciones principales**
- N:M con `Planta`.
- N:M con `Producto`.
- N:M opcional con `Ritual`.
- N:M con `Intención`.

**Reglas de negocio asociadas**
- Deben ser manuales y curadas, no autogeneradas.
- Deben incluir justificación editorial para evitar combinaciones arbitrarias.

**Riesgos de mal modelado**
- Reducirla a etiqueta sin explicación destruiría su valor diferencial.

**Prioridad aproximada**
- Media en Ciclo 2; alta para diferenciación en Ciclos 5-6.

### 3.5 PedidoDemo
**Propósito**
- Modelar la simulación de checkout de extremo a extremo sin compra real.

**Responsabilidad**
- Registrar el estado de un pedido demostrable, su composición y trazabilidad de confirmación.

**Atributos clave sugeridos**
- Identificador legible de pedido demo.
- Estado de pedido demo (creado, confirmado, cancelado demo).
- Email de contacto/confirmación.
- Marca temporal de creación/confirmación.
- Metadatos de canal (invitado o usuario autenticado).

**Relaciones principales**
- 1:N con `LíneaPedido`.
- N:1 opcional con `Usuario`.

**Reglas de negocio asociadas**
- No debe disparar procesos de pago real ni stock real.
- Debe permitir emisión de confirmación por email en entorno demo.

**Riesgos de mal modelado**
- Reutilizar estructuras de venta real sin flags demo puede inducir ambigüedad operacional futura.

**Prioridad aproximada**
- Alta en Ciclo 3.

## 4. Entidades de soporte

### 4.1 Marca
- **Propósito**: identificar procedencia comercial y diferenciar variantes de producto.
- **Responsabilidad**: concentrar atributos de identidad de marca y su vigencia en catálogo demo.
- **Relaciones**: 1:N con `Producto`.
- **Riesgo**: embutir marca como texto libre en producto rompe consistencia y filtros.
- **Prioridad**: alta desde Ciclo 1.

### 4.2 Pack
- **Propósito**: agrupar productos con intención de regalo o uso guiado.
- **Responsabilidad**: ofrecer composición curada y narrativa de selección rápida.
- **Relaciones**: N:M con `Producto`, N:M con `Ritual`, N:M con `Intención`.
- **Riesgo**: modelarlo como simple categoría impediría composición explícita.
- **Prioridad**: media en Ciclo 2, alta en Ciclo 3.

### 4.3 Correspondencia
- **Propósito**: materializar la capa mística secundaria (elementos simbólicos).
- **Responsabilidad**: habilitar navegación lateral para público interesado sin contaminar la ruta principal agnóstica.
- **Relaciones**: N:M con `Planta`, `Ritual`, `Producto` e `Intención` según aplicabilidad.
- **Riesgo**: mezclarla como atributo obligatorio del núcleo principal dificultaría onboarding funcional.
- **Prioridad**: media en Ciclos 2-5.

### 4.4 Intención
- **Propósito**: unificar el “para qué” transversal de navegación y recomendación.
- **Responsabilidad**: permitir rutas por objetivo de usuario (p. ej., calma, limpieza simbólica, enfoque).
- **Relaciones**: N:M con `Planta`, `Producto`, `Ritual`, `Sinergia`, `Pack`.
- **Riesgo**: usar etiquetas libres sin gobernanza semántica rompe UX y SEO.
- **Prioridad**: alta desde Ciclo 1.

### 4.5 ReglaCalendario
- **Propósito**: modelar ventanas temporales de activación/relevancia ritual.
- **Responsabilidad**: desacoplar temporalidad de la definición estática de ritual.
- **Relaciones**: N:1 con `Ritual`.
- **Riesgo**: incluir fechas dentro de `Ritual` bloquearía múltiples ventanas por ritual.
- **Prioridad**: media en Ciclo 5.

### 4.6 Usuario
- **Propósito**: representar identidad de cuenta para personalización y continuidad.
- **Responsabilidad**: habilitar favoritos, carrito guardado, historial demo, recordatorios y recomendaciones por reglas.
- **Relaciones**: 1:N con `PedidoDemo`, N:M con `Producto` vía `Favorito`, 1:N con `Recordatorio`.
- **Riesgo**: diseñar usuario sin casos de valor reales produciría complejidad sin utilidad.
- **Prioridad**: alta en Ciclo 4.

### 4.7 LíneaPedido
- **Propósito**: detallar composición de cada pedido demo.
- **Responsabilidad**: conservar snapshot mínimo de la selección comercial en el momento de confirmación.
- **Relaciones**: N:1 con `PedidoDemo`, N:1 con `Producto`.
- **Riesgo**: no capturar snapshot dificultaría trazabilidad de demo histórica.
- **Prioridad**: alta en Ciclo 3.

### 4.8 Favorito
- **Propósito**: registrar afinidad explícita usuario-producto (y potencialmente usuario-ritual/planta en evolución).
- **Responsabilidad**: sostener recorridos de regreso y recomendaciones por reglas.
- **Relaciones**: N:1 con `Usuario`, N:1 con `Producto` (v1).
- **Riesgo**: modelarlo solo como preferencia de sesión perdería continuidad de cuenta.
- **Prioridad**: alta en Ciclo 4.

### 4.9 Recordatorio
- **Propósito**: gestionar avisos vinculados a rituales, intenciones o hitos temporales.
- **Responsabilidad**: aportar valor recurrente a la cuenta de usuario.
- **Relaciones**: N:1 con `Usuario`, N:1 opcional con `Ritual` o `Intención`.
- **Riesgo**: no separarlo de notificaciones genéricas dificulta evolución de reglas.
- **Prioridad**: media-alta en Ciclos 4-5.

### 4.10 Taxonomía (categoría/faceta)
- **Propósito**: estructurar clasificación navegable y facetable de dominio.
- **Responsabilidad**: soportar menús, filtros, colecciones SEO y consistencia de descubrimiento.
- **Relaciones**: N:M con `Planta`, `Producto`, `Ritual` e `Intención` según necesidad.
- **Riesgo**: taxonomías duplicadas por canal (admin/front) generan incoherencia.
- **Prioridad**: alta desde Ciclo 0-1.

### 4.11 Concepto/Glosario
- **Propósito**: estabilizar definiciones editoriales clave del universo herbal-místico.
- **Responsabilidad**: reducir ambigüedad terminológica y mejorar consistencia narrativa.
- **Relaciones**: referencias cruzadas opcionales con `Planta`, `Ritual` y `Correspondencia`.
- **Riesgo**: crear glosario enciclopédico sin conexión a navegación aporta poco valor.
- **Prioridad**: media y evolutiva (Ciclos 2-5).

## 5. Relaciones entre entidades

### 5.1 Relación estructural crítica: Planta ↔ Producto
No deben colapsarse porque resuelven problemas distintos:
- `Planta` responde a **conocimiento base reusable** (qué es, cómo se entiende en el universo editorial).
- `Producto` responde a **oferta comprable concreta** (cómo se vende en formato y marca específicos).

Esta separación permite:
- múltiples productos para una misma planta sin duplicar conocimiento;
- mantener fichas editoriales aunque no exista oferta activa;
- soportar categorías no herbales que no dependen de planta;
- escalar catálogo por marca/formato/packs sin destruir semántica de dominio.

### 5.2 Red de relación ritual
`Ritual` debe conectar simultáneamente con:
- plantas base (fundamento herbal);
- productos concretos (acción de compra);
- herramientas y artículos no herbales (ejecución práctica);
- packs (atajo comercial guiado);
- correspondencias (capa simbólica secundaria).

Esta red evita una experiencia fragmentada entre contenido y catálogo.

### 5.3 Relación entre sinergias, intenciones y correspondencias
- `Sinergia` expresa combinaciones curadas justificadas.
- `Intención` organiza la navegación por propósito.
- `Correspondencia` aporta profundidad mística opcional.

Las tres capas deben cooperar sin sustituirse entre sí.

## 6. Reglas de negocio clave
1. **No medical claims**: ninguna entidad pública puede contener promesas médicas o milagrosas.
2. **Demo no transaccional real**: `PedidoDemo` simula compra sin stock ni pago real.
3. **Curación obligatoria en sinergias**: toda sinergia requiere explicación editorial mínima.
4. **Vinculación condicional de planta**: obligatoria en hierbas a granel, opcional en otros tipos de producto.
5. **Trazabilidad editorial**: contenidos con estado de publicación y control de vigencia.
6. **No mezclar temporalidad en ritual base**: la agenda se expresa mediante `ReglaCalendario`.
7. **Cuenta con valor tangible**: funcionalidades de usuario solo si mejoran recorrido (favoritos, carrito guardado, historial demo, recordatorios, recomendaciones por reglas).

## 7. Taxonomías, intenciones y correspondencias
La arquitectura semántica de navegación se apoya en tres piezas:

1. **Taxonomías** (estructura primaria)
   - Organizan categorías, familias y facetas para menú, filtros y colecciones.

2. **Intenciones** (estructura de propósito)
   - Permiten entrada por necesidad percibida del usuario, habilitando compra guiada y descubrimiento útil.

3. **Correspondencias** (estructura simbólica secundaria)
   - Habilitan una capa mística navegable, opcional y no intrusiva para público agnóstico.

Criterio de equilibrio:
- taxonomía e intención sostienen el flujo principal;
- correspondencia amplifica profundidad sin dominar la experiencia base.

## 8. Calendario ritual y temporalidad
`ReglaCalendario` modela la temporalidad como entidad separada para permitir:
- múltiples ventanas por ritual (estacionales, lunares, hitos concretos);
- activación/desactivación de relevancia temporal sin editar la esencia del ritual;
- recomendación contextual futura por fecha/intención.

Se fija como decisión de dominio que el ritual **no** queda “quemado” con una única fecha incrustada.

## 9. Cuenta de usuario y capacidades asociadas
La cuenta no se introduce como formalidad técnica, sino como capa de valor:
- **Favoritos**: continuidad entre sesiones y preparación de selección.
- **Carrito guardado**: recuperación de intención de compra demo.
- **Historial de pedidos demo**: trazabilidad de recorrido comercial.
- **Recordatorios**: continuidad ritual/temporal.
- **Recomendaciones por reglas**: sugerencias basadas en intenciones, historial y afinidades explícitas.

En v1 de cuenta, priorizar capacidades con impacto visible inmediato, evitando expansión social/comunitaria sin valor probado.

## 10. Separación editorial vs comercial

### 10.1 Plano editorial/conocimiento
Incluye: `Planta`, `Ritual`, `Sinergia`, `Correspondencia`, `Intención`, `Concepto/Glosario`, parte de `Taxonomía`.

Su función principal es explicar, orientar y conectar sentido de uso.

### 10.2 Plano comercial/compra
Incluye: `Producto`, `Marca`, `Pack`, `PedidoDemo`, `LíneaPedido`, `Favorito`, parte de `Usuario`.

Su función principal es habilitar selección y recorrido de compra demo.

### 10.3 Razón estratégica de la separación
- Evita que el conocimiento quede subordinado al inventario del momento.
- Evita que la compra sea un listado plano sin contexto diferencial.
- Permite UX progresiva natural → místico sin perder claridad para usuario funcional.
- Mejora mantenibilidad al separar cambios editoriales de cambios comerciales.

## 11. Riesgos de modelado a evitar
1. Fusionar `Planta` y `Producto` en una sola entidad.
2. Modelar `Ritual` como contenido aislado sin relaciones transaccionales.
3. Tratar `Sinergia` como etiqueta sin explicación curada.
4. Incrustar calendario dentro de ritual sin entidad temporal independiente.
5. Crear taxonomías inconsistentes entre backoffice y experiencia pública.
6. Sobrecargar la capa mística en el flujo principal y degradar usabilidad.
7. Introducir cuenta de usuario sin casos de uso tangibles.
8. Diseñar el dominio alrededor de infraestructura en lugar de capacidades de producto.

## 12. Prioridad de implementación por entidades

### Núcleo v1 temprano (Ciclo 0-1)
- `Taxonomía`, `Intención`, `Planta`, `Marca`, `Producto`.

### Expansión de relación guiada (Ciclo 2)
- `Ritual`, `Sinergia`, `Pack` (conexión mínima), `Correspondencia` inicial.

### Cierre ecommerce demo (Ciclo 3)
- `PedidoDemo`, `LíneaPedido`, reglas de invitado/autenticado para checkout demo.

### Capa de cuenta con valor (Ciclo 4)
- `Usuario` (capas de valor), `Favorito`, carrito guardado (capacidad ligada a usuario), historial demo.

### Diferencial editorial avanzado (Ciclo 5)
- `ReglaCalendario`, `Recordatorio`, expansión de `Correspondencia`, `Concepto/Glosario` útil.

### Consolidación y refinamiento (Ciclo 6)
- endurecimiento semántico, calidad de enlaces cruzados y coherencia global de navegación.

## 13. Implicaciones para backend, admin, frontend y SEO

### Backend (dominio y API futura)
- Contratos de entidad deben respetar separación editorial/comercial.
- Relaciones N:M clave deben diseñarse para consulta por intención, ritual, planta y producto sin ambigüedad semántica.
- Estados de publicación y vigencia deben ser explícitos en entidades públicas.

### Backoffice/Admin
- Flujos de edición deben diferenciar curación editorial de gestión comercial.
- Debe existir control claro de taxonomías/intenciones para evitar deriva terminológica.
- Sinergias y correspondencias requieren campos de explicación, no solo asociaciones.

### Frontend/Navegación
- El modelo habilita recorridos duales: entrada directa de compra y entrada guiada por intención/ritual.
- Debe preservarse la progresión natural → místico como pauta de arquitectura de información.
- La capa de correspondencias debe ser visible pero opcional en flujo principal.

### SEO
- `slug` canónico y semántica de taxonomía/intención son activos estructurales.
- La separación planta/producto permite páginas de conocimiento evergreen y páginas comerciales actualizables.
- Relaciones curadas (rituales/sinergias) habilitan enlazado interno de alto valor semántico.

### Decisiones a congelar pronto (anti-refactor costoso)
1. Separación irreversible `Planta` vs `Producto`.
2. Estructura de relaciones de `Ritual` con plantas/productos/packs/herramientas.
3. Entidad `ReglaCalendario` separada de `Ritual`.
4. Gobernanza de `Taxonomía` e `Intención` como ejes de navegación.
5. Distinción explícita entre plano editorial y plano comercial.

### Aspectos evolutivos no bloqueantes (abiertos controlados)
- Profundidad de `Concepto/Glosario`.
- Cobertura y granularidad de `Correspondencia`.
- Nivel de sofisticación de recomendaciones por reglas.
- Extensión de `Favorito` más allá de producto (p. ej., ritual/planta) en ciclos posteriores.
