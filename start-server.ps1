# Kill existing serve processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Start static server
serve -s dist -l 4173