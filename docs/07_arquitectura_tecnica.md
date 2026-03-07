# 07 — Arquitectura técnica

## 1. Propósito del documento
Definir la arquitectura técnica oficial de **La Botica de la Bruja Lore** para guiar implementación por ciclos con criterio **portfolio-first, business-ready**. Este documento fija decisiones técnicas base, límites entre capas y reglas de evolución para evitar deriva arquitectónica.

Su objetivo práctico es que backend, frontend, persistencia y backoffice avancen de forma coordinada sin romper:
- la separación editorial/comercial del dominio;
- la credibilidad de demo ecommerce sin cobro real;
- la capacidad de escalar hacia operación real.

## 2. Objetivos arquitectónicos
1. **Sostener Clean Architecture estricta** con dependencia dirigida hacia el dominio.
2. **Preservar independencia del dominio** respecto a frameworks (Django/Next.js).
3. **Garantizar separación técnica editorial/comercial**, no solo narrativa de producto.
4. **Construir una demo ecommerce creíble y navegable** sin activar pasarela de pago real.
5. **Diseñar PostgreSQL-first** desde el inicio para evitar deuda por prototipos SQLite-centrados.
6. **Permitir crecimiento por ciclos sin reescrituras estructurales**.
7. **Habilitar backoffice usable v1 con Django Admin customizado**.
8. **Mantener base lista para portfolio serio y evolución a negocio real**.

## 3. Stack aprobado
### 3.1 Backend
- **Django** como plataforma de backend y administración.
- Justificación:
  - productividad alta para entregar demo sólida por ciclos;
  - admin robusto para backoffice v1;
  - ecosistema maduro para autenticación, i18n, seguridad y operación.

### 3.2 Frontend
- **Next.js** como capa de presentación pública.
- Justificación:
  - soporte fuerte para SEO y renderizado híbrido;
  - experiencia de navegación cuidada para catálogo editorial-comercial;
  - facilidad de escalar desde demo a front comercial real.

### 3.3 Persistencia
- **PostgreSQL** como base de datos objetivo y referencia de diseño.
- **SQLite** únicamente para apoyo local/pruebas rápidas, sin influir en decisiones de modelado.

### 3.4 Backoffice
- **Django Admin customizado** como backoffice v1.
- Justificación:
  - acelera operación editorial/comercial desde fases tempranas;
  - reduce coste de construir panel ad hoc prematuro;
  - permite evolucionar reglas y gobernanza de contenido.

## 4. Principios no negociables de arquitectura
1. **Clean Architecture estricta**: dominio en el centro; frameworks en la periferia.
2. **Dependencias unidireccionales**: presentación/infraestructura dependen de aplicación y dominio; nunca al revés.
3. **Dominio puro**: entidades, reglas y casos de uso sin imports de Django/Next.js.
4. **Contratos explícitos** entre frontend y backend (DTOs/versionado de API).
5. **Separación editorial/comercial técnica**:
   - estructuras y casos de uso diferenciados;
   - puntos de integración definidos por aplicación.
6. **PostgreSQL-first real**:
   - tipos, restricciones e índices pensados para PostgreSQL;
   - evitar decisiones condicionadas por limitaciones de SQLite.
7. **Evolución incremental por ciclos**, sin atajos que rompan capas.
8. **Observabilidad operativa** con logging estructurado en fronteras de aplicación/infraestructura.
9. **i18n preparada para cambio dinámico** en capa de presentación y contenidos, sin acoplarla a lógica de dominio.

## 5. Capas del sistema

### 5.1 Dominio
**Responsabilidad**
- Modelar entidades, value objects, invariantes y reglas nucleares.
- Expresar explícitamente la separación `Planta` (editorial/conocimiento) y `Producto` (comercial/venta).

**No permitido**
- ORM models, serializadores HTTP, plantillas UI, queries específicas de framework.

### 5.2 Aplicación
**Responsabilidad**
- Orquestar casos de uso y flujos de negocio.
- Coordinar cruces entre plano editorial y plano comercial sin colapsarlos.
- Definir puertos (interfaces) de repositorios, servicios externos y políticas.

**No permitido**
- Dependencia directa de vistas Django o componentes Next.

### 5.3 Infraestructura
**Responsabilidad**
- Implementar adaptadores concretos: ORM Django, repositorios SQL, correo demo, cache, logging, etc.
- Resolver detalles técnicos de persistencia y servicios.

**No permitido**
- Contener reglas de negocio núcleo.

### 5.4 Presentación
**Responsabilidad**
- Exponer experiencia web pública (Next.js) y backoffice (Django Admin).
- Gestionar representación, interacción, i18n de interfaz y navegación.

**No permitido**
- Reimplementar reglas de negocio ya resueltas en dominio/aplicación.

## 6. Backend

### 6.1 Papel de Django
Django actúa como **host técnico** del backend, no como sustituto de la arquitectura. Su función es proveer:
- runtime web y enrutado API;
- integración con ORM en adaptadores de infraestructura;
- autenticación y permisos;
- administración v1;
- integración operativa (email demo, tareas, configuración por entorno).

### 6.2 Por qué evitar “monolito desordenado” usando Django
Usar Django no obliga a meter entidades, reglas, vistas y persistencia en un mismo bloque acoplado. Ese enfoque degradaría:
- mantenibilidad (cambios con efecto cascada);
- testabilidad (reglas sólo verificables con stack completo);
- escalabilidad por ciclos (cada ciclo rompe lo previo);
- claridad de límites editorial/comercial.

Se acepta backend “monorepo”, pero **no** monolito lógico desordenado: los módulos deben respetar capas y contratos.

### 6.3 Capacidades backend mínimas por arquitectura
- API para navegación pública y detalle de entidades del dominio.
- API para flujos demo ecommerce (carrito/pedido demo sin cobro real).
- Servicios de recomendación por reglas (evolutivo por ciclos).
- Integración con admin para operación de catálogo editorial/comercial.

## 7. Frontend

### 7.1 Papel de Next.js
Next.js es la **capa de experiencia pública** orientada a:
- navegación clara de catálogo y contenido editorial;
- transición UX natural → místico;
- SEO técnico y semántico;
- consumo de contratos API estables.

### 7.2 Reglas de integración frontend
- El frontend no accede directamente a base de datos.
- El frontend no replica reglas de negocio críticas del dominio.
- El frontend consume DTOs/versiones de API definidas por backend.
- Los estados visuales (carga/error/vacío) se tratan como parte del contrato UX.

### 7.3 SEO y navegabilidad como decisión arquitectónica
SEO no se delega “al final”: se soporta con renderizado adecuado, rutas estables, taxonomías coherentes y contenido editorial enlazado a oferta comercial sin mezclas semánticas erróneas.

## 8. Persistencia y estrategia PostgreSQL-first

### 8.1 PostgreSQL como referencia de diseño
Toda decisión de modelo y consulta debe considerar PostgreSQL como entorno real objetivo:
- restricciones e integridad referencial estricta;
- índices orientados a filtros/facetas y relaciones N:M;
- consultas para catálogo, rituales, sinergias y relaciones cruzadas;
- capacidad de escalar a carga real sin rediseño estructural.

### 8.2 Por qué SQLite no puede condicionar el diseño
SQLite es útil para arranque local rápido, pero no representa:
- capacidades avanzadas de concurrencia y bloqueo de PostgreSQL;
- comportamiento real en integridad/rendimiento de consultas complejas;
- necesidades de evolución business-ready.

Diseñar “para SQLite” empuja a atajos que luego generan deuda costosa al migrar.

### 8.3 Papel permitido de SQLite
- entorno local de bajo coste;
- pruebas rápidas o smoke tests;
- demos internas sin exigencia de paridad completa.

**Límite**: no validar decisiones arquitectónicas de dominio/persistencia basadas en restricciones de SQLite.

## 9. Entornos de ejecución
1. **Local desarrollo**: rápido para iteración, con posibilidad de SQLite o PostgreSQL local.
2. **Integración/QA**: preferencia PostgreSQL para validar contratos y consultas reales.
3. **Demo/staging portfolio**: comportamiento coherente, sin cobro real, datos curados.
4. **Producción futura (evolutivo)**: base compatible sin reescritura de capas.

Regla: la paridad arquitectónica se evalúa contra backend+frontend desacoplados y persistencia PostgreSQL-first.

## 10. Backoffice y gestión editorial/comercial

### 10.1 Rol del Django Admin v1
El admin cubre operación inicial para:
- gestión de catálogo comercial (`Producto`, packs, marcas, etc.);
- gestión editorial (plantas, rituales, sinergias, correspondencias, taxonomías);
- control de visibilidad/publicación;
- operación de pedidos demo y seguimiento básico.

### 10.2 Separación editorial/comercial como decisión técnica
La separación editorial/comercial exige:
- módulos de administración diferenciados por responsabilidad;
- permisos y flujos distintos cuando aplique;
- evitar formularios y modelos que fusionen semánticas incompatibles.

No es solo criterio de UX o branding: evita inconsistencias de datos, reduce ambigüedad de negocio y permite evolucionar cada plano a ritmos distintos.

## 11. Integración entre módulos y límites entre capas

### 11.1 Contrato backend-frontend
- API versionada y documentada (convención estable de DTOs).
- Errores de dominio traducidos a respuestas HTTP consistentes.
- Compatibilidad evolutiva para no romper el frontend en cada ciclo.

### 11.2 Flujo de dependencias
- Presentación (Next/Admin) → Aplicación → Dominio.
- Infraestructura implementa puertos definidos por Aplicación/Dominio.
- Dominio no conoce ORM, HTTP ni detalles de UI.

### 11.3 Relación frontend público, admin, dominio y persistencia
- **Frontend público**: consume API para experiencia de cliente.
- **Admin**: opera datos y reglas a través de casos de uso/aplicación.
- **Dominio**: preserva invariantes y semántica del negocio.
- **Persistencia**: materializa almacenamiento y consulta optimizada.

La integración correcta evita duplicidad de reglas entre front y admin y mantiene consistencia operativa.

## 12. Riesgos arquitectónicos a evitar
1. Acoplar dominio al ORM de Django.
2. Implementar reglas clave en vistas/controladores o componentes UI.
3. Mezclar editorial y comercial en tablas/casos de uso sin límites.
4. Tratar SQLite como referencia de diseño definitivo.
5. Crear APIs sin contrato estable ni versionado.
6. Introducir atajos por ciclo que rompan arquitectura base.
7. Sobrecargar admin con lógica de negocio embebida en formularios ad hoc.
8. Hacer frontend dependiente de estructuras internas de DB.

## 13. Prioridades arquitectónicas por ciclos

### Ciclo 0
- Congelar estructura de capas y contratos base.
- Establecer convenciones de módulos, DTOs y puertos.

### Ciclo 1
- Consolidar núcleo herbal navegable con separación `Planta`/`Producto` intacta.
- APIs y consultas preparadas para descubrimiento + compra contextual.

### Ciclo 2
- Integrar rituales/sinergias y relaciones cruzadas sin romper límites de dominio.

### Ciclo 3
- Completar demo ecommerce (carrito/pedido demo) sin pasarela real.
- Trazabilidad de flujo comercial demo y operación admin.

### Ciclo 4
- Cuenta de usuario con valor (favoritos, carrito guardado, historial demo, recordatorios, recomendaciones por reglas).

### Ciclo 5
- Calendario ritual y capa editorial diferencial con temporalidad desacoplada (`ReglaCalendario`).

### Ciclo 6
- Refinamiento portfolio/business-ready: robustez UX, performance, consistencia operativa y preparación para evolución real.

## 14. Implicaciones para implementación futura
1. Toda feature nueva debe declarar su ubicación de capa antes de codificar.
2. Ningún endpoint se implementa sin contrato de entrada/salida explícito.
3. Las migraciones y consultas se diseñan para PostgreSQL desde el primer ciclo.
4. El admin se customiza como operación v1, no como sustituto del dominio.
5. La demo ecommerce debe simular compra real sin activar cobro real.
6. La i18n se mantiene desacoplada de reglas de negocio para soportar cambio dinámico.
7. Las decisiones congeladas aquí se tratan como guardarraíl técnico para evitar deuda estructural.

---

Estado del documento: **aprobado como base técnica para implementación por ciclos**.
