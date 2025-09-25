# Dream Analyzer Application Management Script
param([string]$Action = "help")

function Show-Status {
    Write-Host "`n===============================================" -ForegroundColor Magenta
    Write-Host " SERVICE STATUS" -ForegroundColor Magenta  
    Write-Host "===============================================`n" -ForegroundColor Magenta
    
    $processes = Get-Process | Where-Object {$_.ProcessName -match 'node|tsx|vite'} 2>$null
    
    if ($processes) {
        Write-Host "Running Services:" -ForegroundColor Green
        $processes | Select-Object ProcessName, Id | Format-Table
    } else {
        Write-Host "No services running" -ForegroundColor Yellow
    }
    
    Write-Host "Port Status:" -ForegroundColor Cyan
    $connection3001 = netstat -an | findstr ":3001"
    $connection5173 = netstat -an | findstr ":5173"
    
    if ($connection3001) {
        Write-Host "  API Server (3001): ACTIVE" -ForegroundColor Green
    } else {
        Write-Host "  API Server (3001): INACTIVE" -ForegroundColor Red
    }
    
    if ($connection5173) {
        Write-Host "  Web Dev (5173): ACTIVE" -ForegroundColor Green  
    } else {
        Write-Host "  Web Dev (5173): INACTIVE" -ForegroundColor Red
    }
}

function Start-AllServices {
    Write-Host "`nStarting Dream Analyzer services..." -ForegroundColor Cyan
    $existing = Get-Process | Where-Object {$_.ProcessName -match 'node|tsx|vite'} 2>$null
    if ($existing) {
        Write-Host "Services already running!" -ForegroundColor Yellow
        Show-Status
        return
    }
    
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; pnpm dev" -WindowStyle Minimized
    Write-Host "Waiting for services to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Show-Status
}

function Stop-AllServices {
    Write-Host "`nStopping all services..." -ForegroundColor Yellow
    $processes = Get-Process | Where-Object {$_.ProcessName -match 'node|tsx|vite'} 2>$null
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Host "Services stopped!" -ForegroundColor Green
    } else {
        Write-Host "No services to stop." -ForegroundColor Cyan
    }
    Start-Sleep -Seconds 2
    Show-Status
}

function Restart-AllServices {
    Write-Host "`nRestarting all services..." -ForegroundColor Magenta
    Stop-AllServices
    Start-Sleep -Seconds 3
    Start-AllServices
}

function Show-Help {
    Write-Host "`n===============================================" -ForegroundColor Magenta
    Write-Host " DREAM ANALYZER MANAGEMENT" -ForegroundColor Magenta
    Write-Host "===============================================`n" -ForegroundColor Magenta
    
    Write-Host "Usage: .\manage.ps1 [action]`n" -ForegroundColor Cyan
    Write-Host "Available actions:" -ForegroundColor Cyan
    Write-Host "  start     - Start all services" -ForegroundColor Green
    Write-Host "  stop      - Stop all services" -ForegroundColor Red  
    Write-Host "  restart   - Restart all services" -ForegroundColor Yellow
    Write-Host "  status    - Show service status" -ForegroundColor Cyan
    Write-Host "  test      - Run tests" -ForegroundColor Blue
    Write-Host "  help      - Show this help" -ForegroundColor Magenta
    Write-Host "`nExamples:" -ForegroundColor Magenta
    Write-Host "  .\manage.ps1 start" -ForegroundColor White
    Write-Host "  .\manage.ps1 status" -ForegroundColor White
}

# Main execution
switch ($Action.ToLower()) {
    "start" { Start-AllServices }
    "stop" { Stop-AllServices }
    "restart" { Restart-AllServices }
    "status" { Show-Status }
    "test" { 
        Write-Host "`nRunning tests..." -ForegroundColor Blue
        pnpm test 
    }
    "help" { Show-Help }
    default { Show-Help }
}