@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js 22.17 ou superior e abra este arquivo novamente.
  pause
  exit /b 1
)
node -e "const [major,minor]=process.versions.node.split('.').map(Number);process.exit(major<22||(major===22&&minor<17)?1:0)"
if errorlevel 1 (
  echo Atualize o Node.js para 22.17 ou superior e tente novamente.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Instalando as dependencias do MONETA...
  call npm.cmd ci --no-fund --no-audit
  if errorlevel 1 (
    echo Nao foi possivel instalar. Confira a conexao com a internet.
    pause
    exit /b 1
  )
)
echo Iniciando o MONETA. Mantenha esta janela aberta enquanto usa o site.
call npm.cmd run dev -- --open
pause
