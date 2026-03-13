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


## Acceso provisional seguro para admin (`karkas`)

El acceso visual desde el header debe seguir apuntando a `/admin/`.
Ese botón **no implementa seguridad** ni autenticación propia: la seguridad real sigue siendo la autenticación de Django Admin.

Comando provisional (idempotente):

```bash
ADMIN_USUARIO_PROVISIONAL=karkas ADMIN_PASSWORD_PROVISIONAL='<tu_password_segura>' python manage.py asegurar_admin_provisional
```

Comportamiento:
- crea el usuario si no existe;
- si ya existe, asegura `is_staff=True` e `is_superuser=True`;
- actualiza password desde entorno sin mostrarla en logs/salida.

Variables de entorno recomendadas:
- `ADMIN_USUARIO_PROVISIONAL` (valor esperado para este ciclo: `karkas`)
- `ADMIN_PASSWORD_PROVISIONAL`
- `CREAR_ADMIN_PROVISIONAL=true` (solo si se desea ejecución automática en predeploy)
