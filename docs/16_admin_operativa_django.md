# 16 — Admin operativo (Django Admin)

## Ruta de administración
- URL: `/admin/`
- Requiere autenticación (`django.contrib.auth`).
- Solo usuarios `is_staff=True` (o `superuser`) pueden entrar al panel.

## Alta de superusuario
Desde la raíz del repo:

```bash
python manage.py createsuperuser
```

Se solicitará:
- username
- email
- password

## Puesta en marcha mínima

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Entrar en: `http://127.0.0.1:8000/admin/`.

## Modelos gestionables en admin

### Comercial
- **ProductoModelo**
  - Campos clave: `sku`, `slug`, `nombre`, `tipo_producto`, `categoria_comercial`, `seccion_publica`, `descripcion_corta`, `precio_visible`, `imagen_url`, `orden_publicacion`, `publicado`.

- **SeccionPublicaModelo**
  - Para gestionar categorías/secciones públicas con orden y estado de publicación.

### Editorial
- **RitualModelo**
  - Campos clave: `slug`, `nombre`, `contexto_breve`, `contenido`, `imagen_url`, `publicado`.
  - Relaciones: `intenciones`, `plantas_relacionadas`, `productos_relacionados`.

- **ArticuloEditorialModelo**
  - Campos clave: `slug`, `titulo`, `resumen`, `contenido`, `tema`, `hub`, `subhub`, `imagen_url`, `indexable`, `publicado`, `fecha_publicacion`, `seccion_publica`.

## Publicar / despublicar
- Productos, rituales y artículos tienen:
  - filtro por `publicado`
  - edición rápida desde listado
  - acciones masivas de publicar/despublicar

## Criterio de imágenes adoptado en este ciclo
Se mantiene **`imagen_url` (URL manual)** en lugar de `ImageField`:
- Coherente con estado actual del proyecto (catálogo y frontend ya consumen URL pública).
- Evita introducir almacenamiento de media y pipeline de ficheros en este ciclo.
- Compatible con Railway + PostgreSQL sin añadir infraestructura adicional.

## Nota producción (Railway)
- La persistencia se realiza en la base configurada en `DATABASE_URL`.
- En Railway debe apuntar a PostgreSQL.
- Flujo editorial principal: alta/edición desde `/admin/`, no edición manual SQL.
