@echo off
setlocal enableextensions

echo ================================================
echo [update_repo] Actualizacion segura del repositorio
echo ================================================

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Este directorio no es un repositorio Git valido.
    exit /b 1
)

git diff --quiet
if errorlevel 1 (
    echo [ERROR] Hay cambios sin confirmar en el arbol de trabajo.
    echo [ERROR] Guarda o descarta tus cambios antes de actualizar.
    git status --short
    exit /b 1
)

git diff --cached --quiet
if errorlevel 1 (
    echo [ERROR] Hay cambios en staging sin confirmar.
    echo [ERROR] Confirma o limpia staging antes de actualizar.
    git status --short
    exit /b 1
)

echo [INFO] Obteniendo cambios remotos...
git fetch --prune
if errorlevel 1 (
    echo [ERROR] Fallo en git fetch.
    exit /b 1
)

echo [INFO] Aplicando actualizacion fast-forward only...
git pull --ff-only
if errorlevel 1 (
    echo [ERROR] No se pudo actualizar con fast-forward.
    echo [ERROR] Revisa divergencias y resuelvelas manualmente.
    exit /b 1
)

echo [OK] Repositorio actualizado correctamente.
exit /b 0
