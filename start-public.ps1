$ErrorActionPreference = 'Stop'
& "$PSScriptRoot/start-local.ps1"
$tunnelTool = Join-Path (Split-Path $PSScriptRoot) 'tools/cloudflared.exe'
if (!(Test-Path -LiteralPath $tunnelTool)) {
    $tunnelCommand = Get-Command cloudflared.exe -ErrorAction SilentlyContinue
    if (!$tunnelCommand) { throw 'Install official Cloudflare cloudflared and add it to PATH, or place it in ../tools/cloudflared.exe' }
    $tunnelTool = $tunnelCommand.Source
}
$tunnelProcess = Start-Process -FilePath $tunnelTool -ArgumentList @('tunnel', '--url', 'http://127.0.0.1:8787', '--protocol', 'http2', '--no-autoupdate') -WindowStyle Hidden -PassThru -RedirectStandardOutput "$PSScriptRoot/tunnel.stdout.log" -RedirectStandardError "$PSScriptRoot/tunnel.stderr.log"
$tunnelProcess.Id | Set-Content "$PSScriptRoot/tunnel.pid"
Write-Output "Public URL is printed in $PSScriptRoot/tunnel.stderr.log"
