# Preparacion staging ecommerce

## 1. Estado y objetivo
- **Estado**: guia preparatoria, no ejecutada.
- **Objetivo**: preparar el salto futuro desde ecommerce local simulado hacia un entorno staging externo y aislado.
- **Resultado esperado de staging**: validar despliegue, URLs HTTPS, PostgreSQL temporal, smoke post-deploy, backup/restore drill y operacion basica sin activar pagos reales.

Staging debe servir para encontrar problemas de integracion antes de produccion. No sustituye la auditoria local, no es produccion y no desbloquea go-live por si solo.

## 2. Local, staging y produccion
| Entorno | Uso | Datos | Pago | URLs | Criterio de salida |
| --- | --- | --- | --- | --- | --- |
| Local | Desarrollo y demo portfolio controlada | SQLite o PostgreSQL local, bootstrap local | `simulado_local` | `localhost` | Gate local y auditoria local sin `BLOCKER` |
| Staging | Validacion externa previa a release | PostgreSQL temporal/aislada, datos semilla o anonimizados | `simulado_local` inicialmente | HTTPS de backend y frontend staging | Smoke post-deploy, backup/restore drill y checks de readiness |
| Produccion | Venta real futura | PostgreSQL productivo, backups reales | Stripe solo en fase futura aprobada | Dominio real | `V2-R10` desbloqueado con evidencias externas |

## 3. Variables necesarias

### Backend
- `SECRET_KEY`: secreto largo y exclusivo de staging.
- `DEBUG=false`: staging debe comportarse como entorno desplegado.
- `ALLOWED_HOSTS`: dominio backend staging.
- `CSRF_TRUSTED_ORIGINS`: origen HTTPS de backend y, si aplica al flujo, frontend staging.
- `DATABASE_URL`: PostgreSQL staging aislado.
- `PUBLIC_SITE_URL`: URL HTTPS del frontend staging.
- `DEFAULT_FROM_EMAIL`: remitente realista de staging, no `.local`.
- `EMAIL_BACKEND`: backend SMTP o sink seguro de staging compatible con `DEBUG=false`.
- `LOG_LEVEL=INFO`: default operativo sin volcar datos sensibles.
- `BOTICA_PAYMENT_PROVIDER=simulado_local`: modo permitido inicialmente.
- `PAYMENT_SUCCESS_URL`: URL HTTPS de retorno al pedido en frontend staging.
- `PAYMENT_CANCEL_URL`: URL HTTPS de retorno al checkout en frontend staging.
- `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: no definir para staging inicial con `simulado_local`.

### Frontend
- `NEXT_PUBLIC_API_BASE_URL`: URL HTTPS del backend staging.
- `NEXT_PUBLIC_SITE_URL`: URL HTTPS del frontend staging si el build la requiere.
- `NEXT_PUBLIC_ANALITICA_LOCAL=false`: analitica local desactivada si se enseña fuera del equipo.
- `GOOGLE_SITE_VERIFICATION_TOKEN`: opcional; no bloquea staging si SEO externo no se valida ahi.

## 4. Servicios necesarios
- Servicio backend Django en entorno staging.
- Servicio frontend Next.js en entorno staging.
- Servicio PostgreSQL staging independiente de local y produccion.
- Base PostgreSQL temporal adicional para restore drill cuando se ejecute `BOTICA_RESTORE_DATABASE_URL`.
- SMTP/sink de correo de staging si se prueban notificaciones con `DEBUG=false`.
- Almacenamiento de backups fuera del repositorio mediante `BOTICA_BACKUP_DIR`.

No se debe reutilizar la base de produccion ni cargar datos personales reales sin anonimizar y sin aprobacion explicita.

## 5. Base temporal y backup/restore drill
La preparacion de staging requiere dos bases separadas:

1. **Base staging primaria**: recibe datos semilla o dataset anonimizado.
2. **Base temporal de restore**: destino exclusivo para ensayar restauracion.

Variables operativas:
- `DATABASE_URL`: base staging primaria.
- `BOTICA_BACKUP_DIR`: directorio externo al repo para dumps.
- `BOTICA_RESTORE_DATABASE_URL`: base temporal segura para restore drill.

Comandos existentes para fase futura:
```powershell
python scripts/backup_restore_postgres.py backup --dry-run
python scripts/backup_restore_postgres.py restore-drill --dry-run --dump-file <dump.sql>
```

El backup real y el restore real no se ejecutan desde esta guia. Solo deben ejecutarse cuando existan URLs/credenciales autorizadas y el destino sea temporal.

## 6. URLs necesarias
- `BACKEND_BASE_URL`: backend staging HTTPS para smoke desplegado.
- `FRONTEND_BASE_URL`: frontend staging HTTPS para smoke desplegado.
- `PUBLIC_SITE_URL`: URL publica del frontend staging usada por backend.
- `PAYMENT_SUCCESS_URL`: retorno de pago simulado al pedido.
- `PAYMENT_CANCEL_URL`: retorno al checkout.
- URL de admin Django staging: acceso restringido y con usuario operativo de prueba.

Las URLs deben ser reales, accesibles y no apuntar a `localhost` durante smoke post-deploy.

## 7. Modo de pago permitido en staging
- Modo inicial permitido: `BOTICA_PAYMENT_PROVIDER=simulado_local`.
- Stripe sandbox queda reservado para una fase futura explicita.
- Stripe real queda fuera de alcance.

Para una fase futura de Stripe sandbox haran falta, como minimo:
- cambio explicito a `BOTICA_PAYMENT_PROVIDER=stripe`;
- claves sandbox, nunca claves reales;
- webhook secret sandbox;
- URLs de retorno staging;
- prueba de webhook;
- rollback documentado a `simulado_local`.

## 8. Checks antes de desplegar
Checks locales razonables antes de crear staging:
```powershell
python scripts/check_ecommerce_local_simulado.py
python scripts/audit_ecommerce_local_simulado.py
python scripts/check_release_readiness.py
python scripts/check_release_gate.py
python manage.py check
git diff --check
```

Si se toca frontend para preparar staging:
```powershell
npm --prefix frontend run lint
npm --prefix frontend run build
```

Si se toca configuracion de deploy:
```powershell
python manage.py test tests.nucleo_herbal.test_deploy_guards
```

## 9. Checks despues de desplegar
Estos checks son futuros y requieren URLs reales de staging:
```powershell
python scripts/check_deployed_stack.py --backend-base-url <BACKEND_BASE_URL> --frontend-base-url <FRONTEND_BASE_URL>
python scripts/check_operational_reconciliation.py --fail-on blocker
python scripts/check_operational_alerts_v2.py --fail-on blocker
```

Smoke manual minimo:
1. abrir frontend staging;
2. verificar catalogo y ficha comprable;
3. crear pedido real desde `/checkout`;
4. iniciar y confirmar pago simulado;
5. abrir `/pedido/[id_pedido]`;
6. comprobar documento fiscal;
7. comprobar `/mi-cuenta`;
8. comprobar admin/backoffice con el pedido real.

Backup/restore:
1. ejecutar backup contra `DATABASE_URL` staging;
2. restaurar solo contra `BOTICA_RESTORE_DATABASE_URL`;
3. documentar resultado y tiempo;
4. eliminar o rotar dumps segun politica operativa.

## 10. Rollback
Rollback minimo de staging:
1. volver al ultimo despliegue estable;
2. mantener o restaurar `BOTICA_PAYMENT_PROVIDER=simulado_local`;
3. retirar cualquier variable Stripe accidental;
4. si la base staging queda corrupta, restaurar desde backup solo en staging;
5. rerun de `check_deployed_stack.py` y gate local cuando aplique;
6. registrar incidencia, causa y accion correctiva.

Rollback prohibido:
- restaurar sobre produccion;
- usar claves Stripe reales;
- reutilizar dumps con datos personales sin control;
- declarar `V2-R10` desbloqueado solo por haber recuperado staging.

## 11. Esto NO desbloquea V2-R10
Esta guia prepara precondiciones. `V2-R10` sigue bloqueado hasta que existan entorno desplegado, URLs reales, PostgreSQL seguro, backup/restore drill real contra base temporal, smoke post-deploy y validacion externa registrada.

## 12. Esto NO activa produccion
Staging no es produccion. No se debe presentar como venta real, no debe usar base productiva y no debe tener datos reales sin anonimizar.

## 13. Esto NO activa pago real
La fase staging inicial conserva `simulado_local`. Stripe sandbox requiere una fase futura explicita. Stripe real queda reservado para go-live posterior y no se activa desde esta preparacion.

## 14. Referencias
- Roadmap local: `docs/roadmap_ecommerce_local_simulado.md`.
- Readiness de release: `docs/release_readiness_minima.md`.
- Pagos local/Stripe futuro: `docs/pagos_modo_local_y_stripe.md`.
- V2-R10 bloqueado: `docs/roadmap_ecommerce_real_v2.md`.
