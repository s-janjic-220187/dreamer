# 🌙 Dream Analyzer - Smart Startup System

## ✅ **IMPLEMENTED FEATURES**

### 🔍 **Automatic Process Detection**
- **Port Conflict Detection**: Checks if API (3001) and Web (5175) are already running
- **Process Management**: Safely identifies and manages existing processes
- **Smart Restart**: Only restarts services that need restarting

### 📂 **Directory Management** 
- **Always stays in project root**: `G:\dreamer`
- **Context-aware scripts**: All scripts automatically navigate to correct directory
- **VS Code integration**: Tasks and terminals maintain proper working directory

### 🚀 **Multiple Startup Methods**

#### **Method 1: npm/pnpm Scripts (Recommended)**
```bash
pnpm start         # Smart start (checks existing processes)
pnpm restart       # Force restart all services  
pnpm start:status  # Check service status only
pnpm start:force   # Kill existing and start fresh
```

#### **Method 2: Direct Script Execution**
```bash
# Cross-platform (Node.js)
node scripts/startup-manager.js --status
node scripts/startup-manager.js --restart
node scripts/startup-manager.js --force

# Windows PowerShell
.\scripts\check-and-start.ps1 -Status
.\scripts\check-and-start.ps1 -Restart
.\scripts\check-and-start.ps1 -Force

# Windows Batch (Double-click)
scripts\start.bat
```

#### **Method 3: VS Code Integration**
- **Ctrl+Shift+P** → "Tasks: Run Task" → "🌙 Start Dream Analyzer"
- **Ctrl+Shift+P** → "Tasks: Run Task" → "🔄 Restart Services" 
- **Ctrl+Shift+P** → "Tasks: Run Task" → "📊 Check Services Status"

## 🎯 **How It Works**

### **Before Starting Any Service:**
1. ✅ **Check Current Directory** → Ensures we're in `G:\dreamer`
2. ✅ **Scan Ports** → Checks if API (3001) or Web (5175) are in use
3. ✅ **Identify Processes** → Finds which processes are using the ports
4. ✅ **Smart Decision** → Only starts services that aren't already running

### **Service Status Display:**
```
🌙 Dream Analyzer Startup Manager
Current Directory: G:\dreamer
----------------------------------------

📊 Current Services Status:
----------------------------------------
🟢 API Server: RUNNING on port 3001 (PID: 1234)
🟢 Web App: RUNNING on port 5175 (PID: 5678)
```

### **Conflict Resolution:**
- **If ports are free** → Starts services normally
- **If ports are occupied** → Shows status and asks for confirmation
- **Force mode** → Kills existing processes and starts fresh
- **Restart mode** → Gracefully stops and restarts all services

## 📁 **Files Created**

| File | Purpose | Platform |
|------|---------|----------|
| `scripts/startup-manager.js` | Main cross-platform startup logic | All |
| `scripts/check-and-start.ps1` | Windows PowerShell version | Windows |
| `scripts/start.bat` | Simple Windows batch wrapper | Windows |
| `dreamer.code-workspace` | VS Code workspace with tasks | VS Code |
| `scripts/README.md` | Detailed documentation | All |

## 🛠️ **Enhanced package.json Scripts**

```json
{
  "start": "node scripts/startup-manager.js",
  "start:force": "node scripts/startup-manager.js --force", 
  "start:status": "node scripts/startup-manager.js --status",
  "restart": "node scripts/startup-manager.js --restart",
  "dev": "node scripts/startup-manager.js"
}
```

## 🎉 **Benefits**

✅ **No More Port Conflicts**: Automatically detects and resolves port issues
✅ **Directory Safety**: Always works from correct project root
✅ **Process Management**: Clean startup/shutdown of services
✅ **Developer Friendly**: Multiple ways to start based on preference
✅ **Cross-Platform**: Works on Windows, macOS, and Linux
✅ **VS Code Integration**: Built-in tasks for common operations
✅ **Smart Defaults**: Sensible behavior that "just works"

## 🚦 **Usage Examples**

### **Daily Development Workflow**
```bash
# Morning startup (checks existing processes)
pnpm start

# Quick status check  
pnpm start:status

# Clean restart after changes
pnpm restart

# Emergency reset (kills everything and starts fresh)
pnpm start:force
```

### **Troubleshooting Mode**
```bash
# Check what's running
pnpm start:status

# Force kill and restart if something is stuck
pnpm start:force
```

### **VS Code Power User**
1. Open `dreamer.code-workspace`
2. **Ctrl+Shift+P** → "🌙 Start Dream Analyzer" 
3. All services start in correct directories with proper monitoring

## 🔧 **Technical Details**

- **Port Detection**: Uses `netstat` (Windows) / `lsof` (Unix) for process identification
- **Process Management**: Graceful termination with fallback to force kill
- **Directory Context**: All scripts use absolute paths and set working directory
- **Error Handling**: Comprehensive error reporting and recovery
- **Cross-Platform**: Node.js core with platform-specific optimizations

---

**🌙 Your Dream Analyzer now has intelligent startup management with zero configuration needed!**

Just run `pnpm start` and everything will work perfectly, remembering your position and avoiding conflicts! ✨