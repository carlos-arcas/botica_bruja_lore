# 11 — Backoffice y flujo editorial

## 1. Propósito del documento
Definir la norma oficial de administración interna de **La Botica de la Bruja Lore** para el Ciclo 0, fijando el alcance funcional del backoffice v1 y las reglas operativas de edición, publicación, curación semántica y gestión demo.

Este documento establece **qué debe poder gestionar una persona no técnica desde backoffice** y cómo deben separarse los planos editorial, comercial y operativo, sin convertir este texto en especificación de código Django Admin ni en manual pantalla por pantalla.

## 2. Objetivos del backoffice y flujo editorial
El backoffice v1 persigue los siguientes objetivos:

1. **Operatividad real sin código**
   - Permitir que la gestión diaria del proyecto (contenido, catálogo, relaciones y pedidos demo) no dependa de editar código ni tocar base de datos.

2. **Separación explícita de planos**
   - Sostener la separación entre:
     - gestión editorial/conocimiento;
     - gestión comercial/catálogo;
     - gestión operativa demo.

3. **Curación por encima de CRUD plano**
   - Priorizar la construcción y mantenimiento de relaciones útiles entre entidades, especialmente en la línea herbal.

4. **Control de publicación y calidad narrativa**
   - Formalizar estados editoriales mínimos (borrador/publicado y ciclo de revisión operativo) para evitar contenido inconsistente en el escaparate.

5. **Base estable para evolución por ciclos**
   - Entregar un marco suficientemente firme para implementar Django Admin customizado en v1 y ampliar después sin romper decisiones congeladas.

## 3. Principios rectores de administración interna
1. **Django Admin customizado como solución v1 (decisión consolidada)**
   - El backoffice v1 se implementa sobre Django Admin muy customizado.
   - No se construye panel custom desde cero salvo necesidad demostrada en ciclos posteriores.

2. **Usabilidad prioritaria para perfil no técnico (decisión consolidada)**
   - El admin debe ser comprensible, navegable y operativo para una persona no técnica con formación básica del negocio.

3. **Separación editorial/comercial/operativa (decisión consolidada)**
   - No mezclar en una misma operación interna decisiones de contenido, merchandising y gestión de pedidos demo sin contexto claro.

4. **Curación semántica y coherencia de catálogo (decisión consolidada)**
   - El valor del proyecto depende de relaciones bien mantenidas (plantas, intenciones, correspondencias, rituales, productos, packs), no solo de altas/bajas.

5. **Hacer fácil lo frecuente y controlado lo delicado (decisión consolidada)**
   - Operaciones recurrentes: rápidas, guiadas y seguras.
   - Operaciones sensibles (publicación, cambios de estado, taxonomías clave): con validación y fricción intencional razonable.

6. **Trazabilidad operativa mínima (decisión consolidada)**
   - Deben poder auditarse cambios relevantes de estado editorial y estado de pedido demo a nivel de backoffice.

## 4. Áreas de gestión del backoffice
El backoffice se organiza en tres áreas funcionales:

### 4.1 Gestión editorial y conocimiento
Alcance:
- `Planta` (ficha editorial y relaciones de conocimiento).
- `Ritual` (guía contextual y relación con catálogo).
- `Sinergia`.
- `Correspondencia`.
- `ReglaCalendario` (separada de `Ritual`).
- `Intención` (como eje de descubrimiento).
- `Glosario/Concepto` cuando se active formalmente.

Objetivo:
- Mantener contenido riguroso, navegable y relacional sin claims sanitarios impropios.

### 4.2 Gestión comercial y catálogo
Alcance:
- `Producto`.
- `Pack`.
- `Marca`.
- Taxonomías/categorías comerciales.
- SEO comercial de fichas y listados, cuando aplique.

Objetivo:
- Mantener un catálogo comprable, coherente con la identidad del proyecto y conectado con el plano editorial.

### 4.3 Gestión operativa demo
Alcance:
- `PedidoDemo`.
- `LíneaPedido`.
- `Usuario` (mínimo operativo para trazabilidad del flujo demo).

Objetivo:
- Dar visibilidad y control razonable al ciclo de pedido demo sin simular una operación enterprise completa.

## 5. Entidades y acciones mínimas de administración
Las entidades siguientes deben ser administrables en v1 con acciones mínimas explícitas.

### 5.1 Editorial/conocimiento

#### Planta
Acciones mínimas:
- Crear, editar, duplicar base y archivar/despublicar.
- Gestionar estado editorial.
- Vincular a intenciones, correspondencias, rituales y productos relacionados.
- Editar metadatos de navegación y SEO editorial.

#### Ritual
Acciones mínimas:
- Crear, editar, publicar/despublicar y archivar.
- Vincular plantas, productos y packs relacionados.
- Gestionar intención principal/secundaria de descubrimiento.
- Editar campos SEO y extracto editorial.

#### Sinergia
Acciones mínimas:
- Crear, editar y retirar de publicación.
- Definir componentes relacionados (plantas/productos) y su racional editorial.

#### Intención
Acciones mínimas:
- Crear, editar, ordenar prioridad de aparición y activar/desactivar.
- Asociar entidades relacionadas (plantas, rituales, packs, productos).

#### Correspondencia
Acciones mínimas:
- Crear, editar y activar/desactivar.
- Asociar con plantas e intenciones de forma controlada.

#### ReglaCalendario
Acciones mínimas:
- Crear, editar y activar/desactivar.
- Relacionar con rituales y/o contenidos permitidos sin fusionar modelo con `Ritual`.

#### Glosario/Concepto (cuando se habilite)
Acciones mínimas:
- Alta, edición, publicación/despublicación y vinculación contextual.

### 5.2 Comercial/catálogo

#### Producto
Acciones mínimas:
- Crear, editar, activar/desactivar comercialmente.
- Clasificar por taxonomía comercial.
- Relacionar con plantas, rituales, sinergias e intenciones.
- Editar campos SEO y slugs navegables.

#### Pack
Acciones mínimas:
- Crear, editar, publicar/despublicar.
- Definir composición de productos.
- Vincular intención, rituales y contexto editorial de regalo.
- Editar SEO específico del pack.

#### Marca
Acciones mínimas:
- Alta/edición/activación.
- Relación con productos y control de consistencia nominal.

#### Taxonomías/categorías comerciales
Acciones mínimas:
- Alta/edición/desactivación.
- Definición de jerarquía y orden de navegación.
- Control de duplicados semánticos y términos ambiguos.

### 5.3 Operativa demo

#### PedidoDemo
Acciones mínimas:
- Consulta de detalle completo.
- Actualización de estado demo.
- Registro de notas internas de gestión.
- Trazabilidad básica de cambios de estado.

#### LíneaPedido
Acciones mínimas:
- Consulta por pedido.
- Validación visual de composición del pedido demo.

#### Usuario
Acciones mínimas:
- Consulta de perfil operativo mínimo.
- Relación con historial de pedidos demo.

## 6. Flujo editorial y estados de publicación
El flujo editorial v1 se define para `Planta`, `Ritual`, `Pack` y contenidos editoriales equivalentes cuando existan.

### 6.1 Estados mínimos (decisión consolidada)
- `borrador`
- `publicado`
- `archivado` (o despublicado operativo)

### 6.2 Revisión operativa (propuesta inicial razonada)
Sin introducir un sistema enterprise de aprobaciones en v1:
- Se recomienda un paso de revisión interna antes de pasar de `borrador` a `publicado`.
- La revisión puede ejecutarse por rol con mayor permiso (p. ej., administrador) o por checklist editorial visible.

### 6.3 Reglas de transición
- `borrador -> publicado`: requiere campos mínimos completos y relaciones críticas resueltas.
- `publicado -> borrador/archivado`: permitido cuando se detectan incoherencias o se retira contenido.
- No se debe exponer contenido parcialmente conectado (sin intención, sin taxonomía o sin contexto mínimo).

### 6.4 Criterios mínimos de publicabilidad
Antes de publicar una ficha deben estar validados como mínimo:
- título/naming consistente;
- slug y metadatos básicos de navegación;
- extracto o descripción breve;
- relación mínima con su ecosistema (intención, taxonomía o entidad puente según tipo);
- SEO básico editable.

## 7. Gestión de relaciones y curación semántica
Este proyecto exige que el admin facilite relaciones complejas sin fricción excesiva.

### 7.1 Relaciones prioritarias que deben ser cómodas
- `Planta <-> Producto`
- `Planta <-> Intención`
- `Planta <-> Correspondencia`
- `Ritual <-> Planta`
- `Ritual <-> Producto`
- `Ritual <-> Pack`
- Relaciones de `Sinergia`
- `ReglaCalendario <-> Ritual` (sin colapsar entidades)

### 7.2 Criterios operativos de curación
- Evitar relaciones duplicadas, circulares o sin valor editorial/comercial.
- Forzar nomenclatura consistente para taxonomías e intenciones.
- Priorizar relaciones con impacto de descubrimiento y compra contextual.
- La línea herbal (hierbas a granel) se considera zona de máxima curación en v1.

### 7.3 Soportes recomendados en admin (propuesta inicial razonada)
- Selectores con búsqueda para relaciones M2M voluminosas.
- Inlines cuando mejoren comprensión de composición (p. ej., packs y líneas de pedido).
- Ayudas contextuales de campo para reducir errores semánticos.
- Validaciones de integridad relacional antes de publicar.

## 8. Gestión operativa de pedidos demo y usuarios

### 8.1 Alcance de pedidos demo en backoffice
Debe poder hacerse, como mínimo:
- listado filtrable de pedidos demo;
- consulta de detalle con líneas;
- actualización manual de estado demo;
- notas internas de seguimiento;
- trazabilidad básica de cuándo/cómo cambió el estado.

### 8.2 Estados demo orientativos (propuesta inicial razonada)
Para visibilidad operativa sin sobrecomplejidad:
- `pendiente`
- `en_preparacion`
- `completado_demo`
- `cancelado_demo`

### 8.3 Usuarios en fase actual
- Gestión centrada en soporte operativo del pedido demo y trazabilidad.
- Se evita en v1 diseñar un sistema avanzado de CRM o automatización.

## 9. Requisitos de usabilidad del admin para perfil no técnico
“Usable para persona no técnica” implica, como mínimo:

1. **Arquitectura de navegación interna clara**
   - Agrupación por áreas (editorial, comercial, operativa).

2. **Listados útiles por defecto**
   - Columnas legibles, filtros frecuentes y orden coherente.

3. **Búsqueda efectiva**
   - Búsqueda por nombre, slug, estado y campos clave de negocio.

4. **Edición asistida**
   - Textos de ayuda en campos sensibles (SEO, intención, correspondencias, publicación).

5. **Acciones seguras**
   - Confirmaciones en operaciones delicadas (publicar, archivar, cambios de estado de pedido).

6. **Previsualización operativa**
   - Acceso rápido a vista previa o enlace público cuando exista para validar resultado editorial/comercial.

7. **Validaciones comprensibles**
   - Mensajes de error orientados a acción, no técnicos.

## 10. Implicaciones para SEO, navegación y coherencia del catálogo
El backoffice debe permitir editar y mantener de forma consistente:
- slug por entidad publicable;
- metatítulo y metadescripción;
- extracto/resumen navegable;
- jerarquía taxonómica y orden de aparición;
- estado de publicación;
- relaciones de descubrimiento (intenciones/correspondencias/relacionados).

Condiciones operativas:
- No publicar fichas sin mínimos SEO/navegación.
- No romper coherencia de naming entre editorial y comercial.
- Evitar inflación de taxonomías que degrade descubrimiento.

## 11. Decisiones congeladas y aspectos evolutivos

### 11.1 Decisiones congeladas
1. Backoffice v1 sobre **Django Admin muy customizado**.
2. Objetivo de uso real por persona no técnica.
3. Separación de planos: editorial/conocimiento, comercial/catálogo y operativa demo.
4. `Planta` y `Producto` se gestionan como entidades separadas.
5. `ReglaCalendario` se mantiene separada de `Ritual`.
6. Flujo editorial mínimo con `borrador/publicado/archivado`.
7. Gestión explícita de SEO, relaciones y pedidos demo desde admin.

### 11.2 Aspectos evolutivos permitidos sin romper la base
1. Refinar roles más allá de mínimos iniciales.
2. Añadir automatizaciones de validación/editorial.
3. Mejorar previews y herramientas de curación relacional.
4. Profundizar analítica operativa de pedidos demo.
5. Incorporar `Glosario/Concepto` cuando entre en alcance formal.

### 11.3 Roles mínimos en esta fase (propuesta inicial razonada)
- `administrador`: control global de publicación, taxonomías críticas y estados demo.
- `editor`: creación/edición de contenido y catálogo dentro de límites definidos, sin operaciones críticas globales.

Estos roles son suficientes para v1 y podrán desglosarse por capacidad en ciclos posteriores si aparece necesidad real.
