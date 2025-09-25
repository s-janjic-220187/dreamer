# Dream Analyzer - Development Automation

This directory contains automation scripts and VS Code configurations to streamline development workflows for the Dream Analyzer application.

## 🚀 Quick Start

### Using VS Code Tasks (Recommended)

1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Type**: `Tasks: Run Task`
3. **Select** one of the available tasks:

#### Available Tasks:
- **🚀 Start All Services** - Starts API server and Web development server
- **🌐 Start Web Only** - Starts only the web development server  
- **⚡ Start API Only** - Starts only the API server
- **📱 Start Mobile Only** - Starts only the mobile development server
- **🛑 Stop All Services** - Stops all running Node.js services
- **🔄 Restart All Services** - Stops and restarts all services
- **📊 Service Status** - Shows current status of all services
- **🧪 Run All Tests** - Runs unit tests across all applications
- **🎭 Run Playwright Tests** - Runs end-to-end tests
- **🗄️ Database: Generate Prisma Client** - Generates Prisma client
- **📤 Database: Push Schema** - Pushes database schema changes
- **🎨 Database: Open Studio** - Opens Prisma Studio
- **🏗️ Build All** - Builds all applications for production
- **🧹 Clean & Install** - Cleans and reinstalls dependencies
- **🔍 Lint All** - Runs linting across all code
- **🔧 Fix Lint Issues** - Automatically fixes linting issues

### Using Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+F5` | Start All Services |
| `Ctrl+Shift+F6` | Stop All Services |
| `Ctrl+Shift+F7` | Restart All Services |
| `Ctrl+Shift+F8` | Service Status |
| `Ctrl+Shift+T` | Run All Tests |
| `Ctrl+Shift+E` | Run Playwright Tests |

### Using PowerShell Script

```powershell
# Show help
.\manage.ps1 help

# Start all services
.\manage.ps1 start

# Check service status
.\manage.ps1 status

# Stop all services  
.\manage.ps1 stop

# Restart all services
.\manage.ps1 restart

# Run tests
.\manage.ps1 test
```

### Using Batch Script (Windows)

```cmd
# Show help
manage.bat help

# Start all services
manage.bat start

# Check service status
manage.bat status

# Stop all services
manage.bat stop

# Restart all services
manage.bat restart

# Run tests
manage.bat test
```

## 🏗️ Architecture

The automation system consists of several components:

### VS Code Configuration Files

- **`.vscode/tasks.json`** - Defines all automation tasks
- **`.vscode/launch.json`** - Debug configurations for API and Web
- **`.vscode/settings.json`** - Workspace settings and preferences
- **`.vscode/keybindings.json`** - Custom keyboard shortcuts

### Management Scripts

- **`manage.ps1`** - PowerShell script for cross-platform management
- **`manage.bat`** - Windows batch script for simple operations

## 🔧 Service Configuration

### Default Ports
- **API Server**: `http://localhost:3001`
- **Web Development**: `http://localhost:5173`
- **Prisma Studio**: `http://localhost:5555`

### Service Detection
The automation system monitors these processes:
- `node` - Node.js applications
- `tsx` - TypeScript execution
- `vite` - Vite development server

## 🧪 Testing Integration

### Automated Testing Workflow
1. **Unit Tests**: Runs via Vitest in each workspace
2. **Integration Tests**: Tests API endpoints and data flow
3. **E2E Tests**: Playwright tests covering full user workflows

### Playwright Configuration
- **Base URL**: Automatically configured based on running services
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Reports**: HTML reports generated in `playwright-report/`

## 🐛 Debugging

### Debug Configurations
- **Debug API Server**: Attaches debugger to API with TypeScript support
- **Debug Web App**: Debugs Vite development server
- **Debug Tests**: Runs tests with debugging enabled
- **Debug Full Stack**: Runs both API and Web in debug mode

### Debug Features
- Source map support
- Automatic restart on file changes
- Environment variable configuration
- Skip node internals for cleaner debugging

## 📊 Monitoring & Status

### Service Status Monitoring
The status checker provides:
- **Process Information**: Running Node.js processes with memory usage
- **Port Status**: Active/inactive status for each service port
- **Health Checks**: Basic connectivity verification

### Port Monitoring
- `3001` - API Server
- `5173` - Web Development (Default)
- `5174` - Web Development (Alternative)
- `5175` - Web Development (Playwright)

## 🔄 Development Workflow

### Recommended Workflow
1. **Start Services**: `Ctrl+Shift+F5` or `.\manage.ps1 start`
2. **Check Status**: `Ctrl+Shift+F8` or `.\manage.ps1 status`
3. **Run Tests**: `Ctrl+Shift+T` or `.\manage.ps1 test`
4. **Development**: Code with hot reload active
5. **Stop Services**: `Ctrl+Shift+F6` or `.\manage.ps1 stop`

### Build & Deploy
```bash
# Build all applications
pnpm build

# Or use task
Ctrl+Shift+P -> Tasks: Run Task -> 🏗️ Build All
```

## 🛠️ Customization

### Adding New Tasks
Edit `.vscode/tasks.json` to add new automation tasks:

```json
{
  "label": "My Custom Task",
  "type": "shell",
  "command": "pnpm",
  "args": ["my-command"],
  "group": "build"
}
```

### Adding Keyboard Shortcuts
Edit `.vscode/keybindings.json`:

```json
{
  "key": "ctrl+shift+f9",
  "command": "workbench.action.tasks.runTask",
  "args": "My Custom Task"
}
```

### Environment Variables
Configure in `.vscode/settings.json`:

```json
{
  "rest-client.environmentVariables": {
    "local": {
      "apiUrl": "http://localhost:3001",
      "webUrl": "http://localhost:5173"
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

#### Services Won't Start
- Check if ports are already in use: `netstat -an | findstr ":3001"`
- Stop conflicting processes: `.\manage.ps1 stop`
- Clear node_modules and reinstall: `pnpm clean && pnpm install`

#### Tasks Not Appearing
- Reload VS Code window: `Ctrl+Shift+P` -> `Developer: Reload Window`
- Check `.vscode/tasks.json` for syntax errors

#### Port Conflicts
- Check `playwright.config.ts` baseURL matches running web server port
- Update port configurations in relevant config files

#### PowerShell Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Debug Information
```powershell
# Check running processes
Get-Process | Where-Object {$_.ProcessName -match 'node|tsx|vite'}

# Check port usage
netstat -an | findstr ":3001 :5173"

# VS Code task debugging
# Open Output panel -> Tasks to see task execution logs
```

## 📝 Contributing

When adding new automation features:

1. **Add VS Code Task** in `.vscode/tasks.json`
2. **Add Script Function** in `manage.ps1`
3. **Add Batch Command** in `manage.bat` (if applicable)
4. **Update Documentation** in this README
5. **Test All Platforms** (Windows PowerShell, Command Prompt)

## 🔗 Related Documentation

- **Main README**: `../README.md` - Project overview
- **Architecture**: `../ARCHITECTURE.md` - System design
- **API Documentation**: Available at `http://localhost:3001/docs` when API is running
- **Playwright Reports**: `apps/web/playwright-report/index.html`