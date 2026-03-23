const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chokidar = require('chokidar');
const bodyParser = require('body-parser');
const os = require('os');

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const TEMP_DIR = path.join(os.tmpdir(), 'figma-affinity-bridge');

function clearTempDir() {
    if (fs.existsSync(TEMP_DIR)) {
        try {
            const files = fs.readdirSync(TEMP_DIR);
            for (const file of files) {
                fs.unlinkSync(path.join(TEMP_DIR, file));
            }
            console.log('Temporary bridge files cleared.');
        } catch (err) {
            console.error('Error clearing temp files:', err);
        }
    } else {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
}

// Clear on startup
clearTempDir();

// User mentioned v3.0.3, but standard paths are for V1 or V2.
// We'll search for common paths or use a default.
const AFFINITY_PATHS_WIN = [
    'C:\\Program Files\\Affinity\\Affinity\\Affinity.exe',
    'C:\\Program Files\\Affinity\\Photo 2\\Photo.exe',
    'C:\\Program Files\\Affinity\\Photo\\Photo.exe',
    'C:\\Program Files\\Affinity\\Designer 2\\Designer.exe',
    'C:\\Program Files\\Affinity\\Designer\\Designer.exe',
    'C:\\Program Files\\Affinity\\Publisher 2\\Publisher.exe',
    'C:\\Program Files\\Affinity\\Publisher\\Publisher.exe',
];

const AFFINITY_APPS_MAC = [
    'Affinity Photo 2',
    'Affinity Photo',
    'Affinity Designer 2',
    'Affinity Designer',
    'Affinity Publisher 2',
    'Affinity Publisher'
];

function findAffinity() {
    const isWin = process.platform === 'win32';
    const isMac = process.platform === 'darwin';

    if (isWin) {
        // 1. Check common fixed paths
        for (const p of AFFINITY_PATHS_WIN) {
            if (fs.existsSync(p)) return { path: p, type: 'win-path' };
        }

        // 2. Try to find via registry/where command
        try {
            const { execSync } = require('child_process');
            let pathResult = execSync('where Affinity.exe', { encoding: 'utf8' }).split('\n')[0].trim();
            if (pathResult && fs.existsSync(pathResult)) return { path: pathResult, type: 'win-path' };
        } catch (e) {}

        // 3. Search common subdirectories in Program Files
        const progFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
        const affinityDir = path.join(progFiles, 'Affinity');
        if (fs.existsSync(affinityDir)) {
            const apps = fs.readdirSync(affinityDir);
            for (const app of apps) {
                const exePaths = [
                    path.join(affinityDir, app, 'Affinity.exe'),
                    path.join(affinityDir, app, 'Photo.exe'),
                    path.join(affinityDir, app, 'Designer.exe'),
                    path.join(affinityDir, app, 'Publisher.exe')
                ];
                for (const exe of exePaths) {
                    if (fs.existsSync(exe)) return { path: exe, type: 'win-path' };
                }
            }
        }
    } else if (isMac) {
        for (const appName of AFFINITY_APPS_MAC) {
            const appPath = `/Applications/${appName}.app`;
            if (fs.existsSync(appPath)) {
                return { path: appName, type: 'mac-app' };
            }
        }
    }

    return null;
}

let activeWatcher = null;

wss.on('connection', (ws) => {
    console.log('Figma Plugin connected');

    ws.on('message', async (message) => {
        const data = JSON.parse(message);

        if (data.type === 'edit-image') {
            const { base64 } = data;
            // Sanitize filename: only allow alphanumeric, underscores, and dots. No path segments.
            const rawFileName = data.fileName || 'figma_edit.png';
            const safeFileName = path.basename(rawFileName).replace(/[^a-z0-9._-]/gi, '_');
            const filePath = path.join(TEMP_DIR, safeFileName);
            
            console.log(`Received image for editing: ${filePath}`);

            // Ensure we are only writing inside TEMP_DIR
            if (!filePath.startsWith(TEMP_DIR)) {
                console.error('Security alert: Attempted path traversal');
                return;
            }

            // Save the file
            const buffer = Buffer.from(base64, 'base64');
            fs.writeFileSync(filePath, buffer);

            // Open in Affinity
            const affinity = findAffinity();
            if (affinity) {
                if (affinity.type === 'win-path') {
                    console.log(`Opening in Affinity (Windows): ${affinity.path}`);
                    exec(`"${affinity.path}" "${filePath}"`);
                } else if (affinity.type === 'mac-app') {
                    console.log(`Opening in Affinity (macOS): ${affinity.path}`);
                    exec(`open -a "${affinity.path}" "${filePath}"`);
                }
            } else {
                console.warn('Affinity not found. Opening with default application.');
                const openPkg = require('open');
                if (typeof openPkg === 'function') {
                    await openPkg(filePath);
                } else if (openPkg && typeof openPkg.default === 'function') {
                    await openPkg.default(filePath);
                } else {
                    exec(`start "" "${filePath}"`);
                }
            }

            // Watch for changes
            if (activeWatcher) activeWatcher.close();
            
            activeWatcher = chokidar.watch(filePath).on('change', () => {
                console.log('File changed, sending update back to Figma');
                const updatedBuffer = fs.readFileSync(filePath);
                ws.send(JSON.stringify({
                    type: 'image-updated',
                    base64: updatedBuffer.toString('base64')
                }));
            });
        }
    });

    ws.on('close', () => {
        console.log('Figma Plugin disconnected');
        if (activeWatcher) activeWatcher.close();
    });
});

const PORT = 3456;
// Bind to 127.0.0.1 so the server is NOT accessible from the local network/internet.
server.listen(PORT, '127.0.0.1', () => {
    console.log(`Bridge server secured and running at http://127.0.0.1:${PORT}`);
    console.log(`Only local connections are allowed.`);
});
