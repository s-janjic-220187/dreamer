# Simple test script to verify startup manager functionality
Set-Location "G:\dreamer"
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green

# Test the Node.js startup manager
Write-Host "Testing startup manager..." -ForegroundColor Cyan
& node scripts/startup-manager.js --status

Write-Host "`nStartup scripts are ready!" -ForegroundColor Green
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  pnpm start         - Start all services (check for existing)" -ForegroundColor White
Write-Host "  pnpm restart       - Restart all services" -ForegroundColor White  
Write-Host "  pnpm start:status  - Check service status" -ForegroundColor White
Write-Host "  pnpm start:force   - Force start (kill existing)" -ForegroundColor White