@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
  node serve.js
) else (
  if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
    "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" serve.js
  ) else (
    echo 请安装 Node.js 18 或更新版本，然后重新双击本文件。
    pause
  )
)
