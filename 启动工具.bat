@echo off
chcp 65001 >nul 2>nul
cd /d "%~dp0"
set "APP_EXE=%~dp0台本一键出视频\台本一键出视频.exe"
if not exist "%APP_EXE%" (
    echo [错误] 未找到程序文件: "%APP_EXE%"
    pause
    exit /b 1
)
echo 正在启动台本一键出视频...
set "DEBUG=false"
set "FLASK_DEBUG=0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$name=[IO.Path]::GetFileName($env:APP_EXE); Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq $name } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>nul
start "" "%APP_EXE%"
