#!/usr/bin/env node

/**
 * Dream Analyzer Startup Manager
 * Cross-platform script to check and manage application services
 */

const { spawn, exec } = require('child_process');
const net = require('net');
const path = require('path');
const process = require('process');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

// Utility function for colored output
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Service configurations
const SERVICES = {
    api: {
        port: 3001,
        name: 'API Server',
        script: 'pnpm dev:api',
        healthCheck: 'http://localhost:3001/health'
    },
    web: {
        port: 5173,
        name: 'Web App',
        script: 'pnpm dev:web',
        healthCheck: 'http://localhost:5173'
    }
};

// Set working directory to project root
const PROJECT_ROOT = path.resolve(__dirname, '..');
process.chdir(PROJECT_ROOT);

log('🌙 Dream Analyzer Startup Manager', 'cyan');
log(`Current Directory: ${PROJECT_ROOT}`, 'yellow');
log('----------------------------------------', 'gray');

// Function to check if port is in use
function checkPort(port, timeout = 1000) {
    return new Promise((resolve) => {
        const socket = new net.Socket();

        const onError = () => {
            socket.destroy();
            resolve(false);
        };

        socket.setTimeout(timeout);
        socket.once('error', onError);
        socket.once('timeout', onError);

        socket.connect(port, '127.0.0.1', () => {
            socket.destroy();
            resolve(true);
        });
    });
}

// Function to find process using port (cross-platform)
function findProcessOnPort(port) {
    return new Promise((resolve) => {
        const command = process.platform === 'win32'
            ? `netstat -ano | findstr :${port}`
            : `lsof -ti:${port}`;

        exec(command, (error, stdout) => {
            if (error) {
                resolve(null);
                return;
            }

            if (process.platform === 'win32') {
                const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
                if (lines.length > 0) {
                    const parts = lines[0].trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    resolve({ pid: parseInt(pid) });
                } else {
                    resolve(null);
                }
            } else {
                const pid = stdout.trim();
                resolve(pid ? { pid: parseInt(pid) } : null);
            }
        });
    });
}

// Function to kill process by PID
function killProcess(pid) {
    return new Promise((resolve) => {
        const command = process.platform === 'win32'
            ? `taskkill /F /PID ${pid}`
            : `kill -9 ${pid}`;

        exec(command, (error) => {
            resolve(!error);
        });
    });
}

// Function to check service status
async function getServiceStatus(serviceKey) {
    const service = SERVICES[serviceKey];
    const isRunning = await checkPort(service.port);
    const processInfo = isRunning ? await findProcessOnPort(service.port) : null;

    return {
        key: serviceKey,
        name: service.name,
        port: service.port,
        isRunning,
        processInfo
    };
}

// Function to display all services status
async function showServicesStatus() {
    log('\n📊 Current Services Status:', 'cyan');
    log('----------------------------------------', 'gray');

    for (const serviceKey of Object.keys(SERVICES)) {
        const status = await getServiceStatus(serviceKey);
        const statusIcon = status.isRunning ? '🟢' : '🔴';
        const statusText = status.isRunning ? 'RUNNING' : 'STOPPED';
        const pidText = status.processInfo ? ` (PID: ${status.processInfo.pid})` : '';
        const color = status.isRunning ? 'green' : 'red';

        log(`${statusIcon} ${status.name}: ${statusText} on port ${status.port}${pidText}`, color);
    }
    log('');
}

// Function to start a service
function startService(serviceKey) {
    return new Promise((resolve, reject) => {
        const service = SERVICES[serviceKey];
        log(`🚀 Starting ${service.name}...`, 'yellow');

        const [command, ...args] = service.script.split(' ');

        const childProcess = spawn(command, args, {
            cwd: PROJECT_ROOT,
            stdio: 'inherit',
            detached: process.platform !== 'win32',
            shell: true
        });

        childProcess.on('error', (error) => {
            log(`❌ Failed to start ${service.name}: ${error.message}`, 'red');
            reject(error);
        });

        // Give it a moment to start
        setTimeout(async () => {
            const status = await getServiceStatus(serviceKey);
            if (status.isRunning) {
                log(`✅ ${service.name} is now running on port ${service.port}`, 'green');
                resolve(true);
            } else {
                log(`⚠️  ${service.name} may still be starting up...`, 'yellow');
                resolve(false);
            }
        }, 3000);
    });
}

// Function to stop a service
async function stopService(serviceKey) {
    const status = await getServiceStatus(serviceKey);
    if (status.isRunning && status.processInfo) {
        log(`🔄 Stopping ${status.name} (PID: ${status.processInfo.pid})`, 'yellow');
        const success = await killProcess(status.processInfo.pid);
        if (success) {
            log(`✅ ${status.name} stopped successfully`, 'green');
            // Wait for the port to be released
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            log(`❌ Failed to stop ${status.name}`, 'red');
        }
    }
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    const service = args.find(arg => !arg.startsWith('--')) || 'all';
    const options = {
        force: args.includes('--force'),
        restart: args.includes('--restart'),
        status: args.includes('--status')
    };

    // Show status if requested
    if (options.status) {
        await showServicesStatus();
        return;
    }

    // Handle restart option
    if (options.restart) {
        log('🔄 Restarting services...', 'yellow');
        for (const serviceKey of Object.keys(SERVICES)) {
            if (service === 'all' || service === serviceKey) {
                await stopService(serviceKey);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
        options.force = true;
    }

    // Check and start services
    for (const serviceKey of Object.keys(SERVICES)) {
        if (service !== 'all' && service !== serviceKey) {
            continue;
        }

        const serviceConfig = SERVICES[serviceKey];
        log(`🔍 Checking ${serviceConfig.name}...`, 'cyan');

        const status = await getServiceStatus(serviceKey);

        if (status.isRunning && !options.force) {
            log(`✅ ${serviceConfig.name} is already running on port ${serviceConfig.port}`, 'green');
            if (status.processInfo) {
                log(`   Process PID: ${status.processInfo.pid}`, 'gray');
            }
        } else {
            if (status.isRunning && options.force) {
                await stopService(serviceKey);
            }

            try {
                await startService(serviceKey);
            } catch (error) {
                log(`❌ Failed to start ${serviceConfig.name}`, 'red');
            }
        }
    }

    // Final status check
    setTimeout(async () => {
        await showServicesStatus();
        log('🌙 Dream Analyzer startup process completed!', 'cyan');
        log(`Current working directory maintained: ${PROJECT_ROOT}`, 'yellow');
    }, 2000);
}

// Handle script arguments
if (require.main === module) {
    main().catch(error => {
        log(`❌ Startup manager error: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { main, checkPort, getServiceStatus, showServicesStatus };