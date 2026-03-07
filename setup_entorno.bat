@echo off
setlocal enableextensions

echo ================================================
echo [setup_entorno] Preparando entorno local...
echo ================================================

set "PY_CMD="
where py >nul 2>&1
if not errorlevel 1 set "PY_CMD=py -3"
if not defined PY_CMD (
    where python >nul 2>&1
    if not errorlevel 1 set "PY_CMD=python"
)

if not defined PY_CMD (
    echo [ERROR] No se encontro Python en PATH. Instala Python 3 y reintenta.
    exit /b 1
)

echo [INFO] Python detectado: %PY_CMD%

if not exist ".venv\Scripts\python.exe" (
    echo [INFO] Creando entorno virtual .venv...
    %PY_CMD% -m venv .venv
    if errorlevel 1 (
        echo [ERROR] No se pudo crear el entorno virtual.
        exit /b 1
    )
) else (
    echo [OK] Entorno virtual .venv ya existe.
)

echo [INFO] Actualizando pip en .venv...
call .venv\Scripts\python.exe -m pip install --upgrade pip
if errorlevel 1 (
    echo [ERROR] Fallo al actualizar pip.
    exit /b 1
)

set "REQ_FILE="
if exist requirements-dev.txt set "REQ_FILE=requirements-dev.txt"
if not defined REQ_FILE if exist requirements.txt set "REQ_FILE=requirements.txt"
if not defined REQ_FILE if exist backend\requirements-dev.txt set "REQ_FILE=backend\requirements-dev.txt"
if not defined REQ_FILE if exist backend\requirements.txt set "REQ_FILE=backend\requirements.txt"

if defined REQ_FILE (
    echo [INFO] Instalando dependencias Python desde %REQ_FILE%...
    call .venv\Scripts\python.exe -m pip install -r "%REQ_FILE%"
    if errorlevel 1 (
        echo [ERROR] Fallo al instalar dependencias Python.
        exit /b 1
    )
) else (
    echo [INFO] No se encontro requirements*.txt. Se omite instalacion Python.
)

set "NPM_DIR="
if exist package.json set "NPM_DIR=."
if not defined NPM_DIR if exist frontend\package.json set "NPM_DIR=frontend"

if defined NPM_DIR (
    echo [INFO] Instalando dependencias frontend en %NPM_DIR%...
    pushd "%NPM_DIR%"
    call npm install
    set "NPM_EXIT=%ERRORLEVEL%"
    popd
    if not "%NPM_EXIT%"=="0" (
        echo [ERROR] Fallo al instalar dependencias frontend.
        exit /b 1
    )
) else (
    echo [INFO] No se encontro package.json. Se omite instalacion frontend.
)

echo [OK] Entorno preparado correctamente.
exit /b 0
