# CHECKLIST DE RELEASE — seguridad, privacidad y backup/restore (mínimo operativo)

## 1) Seguridad de configuración (bloqueante)
- `DEBUG=false`.
- `SECRET_KEY` definida y no trivial.
- `DATABASE_URL` PostgreSQL válida (sin SQLite en producción).
- `PUBLIC_SITE_URL`, `PAYMENT_SUCCESS_URL` y `PAYMENT_CANCEL_URL` en **HTTPS absoluto**.
- `EMAIL_BACKEND` de producción (no `locmem`, `console` ni `filebased`).
- `DEFAULT_FROM_EMAIL` con dominio real (no `.local`).
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` definidas.

## 2) PRIVACIDAD OPERATIVA (mínimo)
- No exponer secretos en logs.
- El visor técnico de logs solo devuelve contenido sanitizado.
- No habilitar debug log viewer en producción salvo incidente controlado y clave temporal robusta.

## 3) BACKUP / RESTORE (mínimo viable, PostgreSQL)

### Backup lógico manual previo a release
```bash
# Ejecutar en terminal segura (sin guardar el comando en historial compartido)
export DATABASE_URL='postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require'
pg_dump --no-owner --no-privileges --format=custom --file="backup_pre_release.dump" "$DATABASE_URL"
```

### Restore de validación en base temporal
```bash
createdb botica_restore_check
pg_restore --no-owner --no-privileges --clean --if-exists --dbname=botica_restore_check backup_pre_release.dump
```

### Criterio mínimo de backup válido
- El `pg_dump` termina con código `0`.
- El `pg_restore` en base temporal termina con código `0`.
- Se ejecuta `python manage.py check` contra la base restaurada.

## 4) CHECKLIST DE RELEASE (pre-flight)
1. `python scripts/check_release_gate.py`
2. `python scripts/check_release_readiness.py`
3. `python scripts/check_operational_reconciliation.py --fail-on none`
4. Backup lógico (`pg_dump`) antes del deploy.
5. Deploy.
6. Smoke post-deploy (`python scripts/check_deployed_stack.py` con URLs reales).

## 5) Alcance explícitamente fuera de este checklist
- No cubre SOC2/ISO, SIEM, MFA corporativo ni RBAC avanzado.
- No sustituye auditorías legales de privacidad/retención por país.
