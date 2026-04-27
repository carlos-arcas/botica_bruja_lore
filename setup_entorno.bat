@echo off
setlocal enableextensions

echo ================================================
echo [setup_entorno] Preparando entorno local...
echo ================================================

set "CHECK_ONLY=0"
if /I "%~1"=="--check" set "CHECK_ONLY=1"
if /I "%~1"=="/check" set "CHECK_ONLY=1"

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

if "%CHECK_ONLY%"=="1" (
    if not exist ".venv\Scripts\python.exe" (
        echo [ERROR] No se encontro .venv\Scripts\python.exe. Ejecuta setup_entorno.bat para crear el entorno.
        exit /b 1
    )
    echo [OK] Entorno virtual .venv detectable.
    goto detect_requirements
)

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

:detect_requirements
set "REQ_FILE="
if exist requirements-dev.txt set "REQ_FILE=requirements-dev.txt"
if not defined REQ_FILE if exist requirements.txt set "REQ_FILE=requirements.txt"
if not defined REQ_FILE if exist backend\requirements-dev.txt set "REQ_FILE=backend\requirements-dev.txt"
if not defined REQ_FILE if exist backend\requirements.txt set "REQ_FILE=backend\requirements.txt"

if "%CHECK_ONLY%"=="1" (
    if defined REQ_FILE (
        echo [OK] Archivo de dependencias Python detectable: %REQ_FILE%.
    ) else (
        echo [INFO] No se encontro requirements*.txt. Se omite validacion Python adicional.
    )
    goto detect_frontend
)

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

:detect_frontend
set "NPM_DIR="
if exist package.json set "NPM_DIR=."
if not defined NPM_DIR if exist frontend\package.json set "NPM_DIR=frontend"

if "%CHECK_ONLY%"=="1" (
    if defined NPM_DIR (
        where npm >nul 2>&1
        if errorlevel 1 (
            echo [ERROR] Se detecto package.json en %NPM_DIR%, pero npm no esta disponible en PATH.
            exit /b 1
        )
        if not exist "%NPM_DIR%\node_modules" (
            echo [ERROR] No se encontro %NPM_DIR%\node_modules. Ejecuta setup_entorno.bat para instalar dependencias frontend.
            exit /b 1
        )
        echo [OK] Frontend detectable en %NPM_DIR% con npm y node_modules disponibles.
    ) else (
        echo [INFO] No se encontro package.json. Se omite validacion frontend.
    )
    echo [OK] Comprobacion de entorno completada sin instalar dependencias.
    exit /b 0
)

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
