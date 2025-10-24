# Dream Analyzer Startup Scripts

This directory contains scripts to manage the Dream Analyzer application services with automatic checking for running processes and directory management.

## Features

✅ **Port Conflict Detection**: Automatically checks if services are already running
✅ **Process Management**: Safely stops and starts services as needed
✅ **Directory Awareness**: Always maintains the correct working directory
✅ **Cross-Platform**: Works on Windows, macOS, and Linux
✅ **Service Status**: Real-time status monitoring of all services

## Quick Start

### Using npm/pnpm scripts (Recommended)

```bash
# Start all services (checks for existing processes)
pnpm start

# Force restart all services (kills existing and starts fresh)
pnpm restart

# Check service status without starting
pnpm start:status

# Force start (kills existing processes first)
pnpm start:force
```

### Using Scripts Directly

#### Windows (PowerShell)
```powershell
# Navigate to project root first
cd G:\dreamer

# Start all services
.\scripts\check-and-start.ps1

# Restart services
.\scripts\check-and-start.ps1 -Restart

# Check status only
.\scripts\check-and-start.ps1 -Status

# Force start (kill existing)
.\scripts\check-and-start.ps1 -Force
```

#### Windows (Batch File)
```batch
# Double-click or run from command prompt
scripts\start.bat
```

#### Cross-Platform (Node.js)
```bash
# Start all services
node scripts/startup-manager.js

# Check status
node scripts/startup-manager.js --status

# Restart services
node scripts/startup-manager.js --restart

# Force start
node scripts/startup-manager.js --force
```

## Service Configuration

The startup manager monitors these services:

| Service | Port | Health Check | Start Command |
|---------|------|--------------|---------------|
| API Server | 3001 | http://localhost:3001/health | `pnpm dev:api` |
| Web App | 5175 | http://localhost:5175 | `pnpm dev:web` |

## VS Code Integration

The workspace includes predefined tasks for easy service management:

- **Ctrl+Shift+P** → "Tasks: Run Task" → "🌙 Start Dream Analyzer"
- **Ctrl+Shift+P** → "Tasks: Run Task" → "🔄 Restart Services"
- **Ctrl+Shift+P** → "Tasks: Run Task" → "📊 Check Services Status"

## Directory Management

All scripts automatically:
- Set the working directory to the project root (`G:\dreamer`)
- Maintain this directory throughout execution
- Display the current directory for confirmation

## Troubleshooting

### Port Already in Use
The scripts automatically detect and handle port conflicts:
- Shows which process is using the port
- Offers to kill existing processes
- Starts fresh instances

### Services Won't Start
1. Check if all dependencies are installed: `pnpm install`
2. Verify Node.js version: `node --version` (requires >=18.0.0)
3. Check individual service logs in their respective terminal windows

### Permission Issues (Windows)
If PowerShell execution is restricted:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## File Descriptions

- **`check-and-start.ps1`**: PowerShell script with full Windows integration
- **`startup-manager.js`**: Cross-platform Node.js script 
- **`start.bat`**: Simple Windows batch file wrapper
- **`dreamer.code-workspace`**: VS Code workspace with integrated tasks

## Advanced Usage

### Start Individual Services
```bash
# API only
node scripts/startup-manager.js api

# Web only  
node scripts/startup-manager.js web
```

### PowerShell Advanced Options
```powershell
# Start specific service
.\scripts\check-and-start.ps1 -Service api

# Force restart specific service
.\scripts\check-and-start.ps1 -Service web -Force -Restart
```

## Environment Requirements

- **Node.js**: >=18.0.0
- **pnpm**: >=8.0.0 
- **PowerShell**: 5.1+ (Windows)
- **Terminal**: Any modern terminal (cross-platform)

The startup scripts ensure your Dream Analyzer development environment is always ready with zero conflicts! 🌙