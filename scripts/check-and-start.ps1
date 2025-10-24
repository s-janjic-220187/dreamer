# PowerShell Script to Check and Start Dream Analyzer Application
# This script checks if the application services are already running and manages them accordingly

param(
    [string]$Service = "all",
    [switch]$Force,
    [switch]$Restart,
    [switch]$Status
)

# Set the working directory to the project root
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "🌙 Dream Analyzer Startup Manager" -ForegroundColor Cyan
Write-Host "Current Directory: $ProjectRoot" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName "127.0.0.1" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    }
    catch {
        return $false
    }
}

# Function to get process using a port
function Get-ProcessOnPort {
    param([int]$Port)
    try {
        $netstat = netstat -ano | Select-String ":$Port " | Select-String "LISTENING"
        if ($netstat) {
            $pid = ($netstat -split '\s+')[-1]
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            return $process
        }
    }
    catch {
        return $null
    }
    return $null
}

# Function to stop process on port
function Stop-ProcessOnPort {
    param([int]$Port, [string]$ServiceName)
    $process = Get-ProcessOnPort -Port $Port
    if ($process) {
        Write-Host "🔄 Stopping $ServiceName (PID: $($process.Id))" -ForegroundColor Yellow
        try {
            Stop-Process -Id $process.Id -Force
            Start-Sleep -Seconds 2
            Write-Host "✅ $ServiceName stopped successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to stop $ServiceName" -ForegroundColor Red
        }
    }
}

# Define service configurations
$Services = @{
    "api" = @{
        Port        = 3001
        Name        = "API Server"
        StartScript = "pnpm dev:api"
        CheckUrl    = "http://localhost:3001/health"
    }
    "web" = @{
        Port        = 5175
        Name        = "Web App"
        StartScript = "pnpm dev:web"
        CheckUrl    = "http://localhost:5175"
    }
}

# Function to check service status
function Get-ServiceStatus {
    param([hashtable]$ServiceConfig, [string]$ServiceKey)
    
    $isRunning = Test-Port -Port $ServiceConfig.Port
    $process = Get-ProcessOnPort -Port $ServiceConfig.Port
    
    $status = @{
        IsRunning = $isRunning
        Process   = $process
        Port      = $ServiceConfig.Port
        Name      = $ServiceConfig.Name
    }
    
    return $status
}

# Function to display status
function Show-ServicesStatus {
    Write-Host "`n📊 Current Services Status:" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    foreach ($serviceKey in $Services.Keys) {
        $service = $Services[$serviceKey]
        $status = Get-ServiceStatus -ServiceConfig $service -ServiceKey $serviceKey
        
        $statusIcon = if ($status.IsRunning) { "🟢" } else { "🔴" }
        $statusText = if ($status.IsRunning) { "RUNNING" } else { "STOPPED" }
        $pidText = if ($status.Process) { " (PID: $($status.Process.Id))" } else { "" }
        
        Write-Host "$statusIcon $($status.Name): $statusText on port $($status.Port)$pidText" -ForegroundColor $(if ($status.IsRunning) { "Green" } else { "Red" })
    }
    Write-Host ""
}

# Show status if requested
if ($Status) {
    Show-ServicesStatus
    exit 0
}

# Handle restart option
if ($Restart) {
    Write-Host "🔄 Restarting services..." -ForegroundColor Yellow
    foreach ($serviceKey in $Services.Keys) {
        if ($Service -eq "all" -or $Service -eq $serviceKey) {
            $service = $Services[$serviceKey]
            Stop-ProcessOnPort -Port $service.Port -ServiceName $service.Name
        }
    }
    Start-Sleep -Seconds 3
    $Force = $true
}

# Check and start services
foreach ($serviceKey in $Services.Keys) {
    if ($Service -ne "all" -and $Service -ne $serviceKey) {
        continue
    }
    
    $service = $Services[$serviceKey]
    $status = Get-ServiceStatus -ServiceConfig $service -ServiceKey $serviceKey
    
    Write-Host "🔍 Checking $($service.Name)..." -ForegroundColor Cyan
    
    if ($status.IsRunning -and -not $Force) {
        Write-Host "✅ $($service.Name) is already running on port $($service.Port)" -ForegroundColor Green
        if ($status.Process) {
            Write-Host "   Process: $($status.Process.ProcessName) (PID: $($status.Process.Id))" -ForegroundColor Gray
        }
    }
    else {
        if ($status.IsRunning -and $Force) {
            Stop-ProcessOnPort -Port $service.Port -ServiceName $service.Name
            Start-Sleep -Seconds 2
        }
        
        Write-Host "🚀 Starting $($service.Name)..." -ForegroundColor Yellow
        
        # Start the service in a new window
        $startArgs = @{
            FilePath     = "powershell.exe"
            ArgumentList = @("-NoExit", "-Command", "cd '$ProjectRoot'; $($service.StartScript)")
            WindowStyle  = "Normal"
        }
        
        try {
            Start-Process @startArgs
            Write-Host "✅ $($service.Name) startup initiated" -ForegroundColor Green
            
            # Wait a moment and check if it started
            Start-Sleep -Seconds 5
            $newStatus = Get-ServiceStatus -ServiceConfig $service -ServiceKey $serviceKey
            if ($newStatus.IsRunning) {
                Write-Host "✅ $($service.Name) is now running on port $($service.Port)" -ForegroundColor Green
            }
            else {
                Write-Host "⚠️  $($service.Name) may still be starting up..." -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "❌ Failed to start $($service.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Final status check
Start-Sleep -Seconds 2
Show-ServicesStatus

Write-Host "🌙 Dream Analyzer startup process completed!" -ForegroundColor Cyan
Write-Host "Current working directory maintained: $ProjectRoot" -ForegroundColor Yellow