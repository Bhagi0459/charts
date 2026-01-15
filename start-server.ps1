# Kill old serve processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start server in background (detached)
Start-Process powershell `
  -ArgumentList "serve -s dist -l 4173" `
  -WindowStyle Hidden
