$ErrorActionPreference = 'Stop'
$siteDir = $PSScriptRoot
$pythonPath = (Get-Command python.exe).Source
if (!(Test-NetConnection 127.0.0.1 -Port 8787 -InformationLevel Quiet -WarningAction SilentlyContinue)) {
    $serverProcess = Start-Process -FilePath $pythonPath -ArgumentList @('-u', "$siteDir/server.py") -WindowStyle Hidden -PassThru -RedirectStandardOutput "$siteDir/server.stdout.log" -RedirectStandardError "$siteDir/server.stderr.log"
    $serverProcess.Id | Set-Content "$siteDir/server.pid"
}
Write-Output 'Local: http://127.0.0.1:8787'
