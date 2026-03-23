# Edit in Affinity - Figma Plugin

This plugin allows you to edit images from Figma directly in Affinity Photo (or Designer) and automatically syncs the changes back to Figma when you save.

## Setup Instructions

### 1. Start the Local Bridge
The plugin needs a local bridge server to interact with your filesystem and open Affinity.

1. Open a terminal (Command Prompt, PowerShell, or Git Bash).
2. Navigate to the `bridge` folder:
   ```cmd
   cd "e:\Other\Antigravity\Open with Affinity\dev\bridge"
   ```
3. Start the server:
   ```cmd
   node index.js
   ```
   *Note: You should see "Bridge server running at http://localhost:3456". Keep this window open.*

### 2. Load the Plugin in Figma
1. Open the Figma Desktop App.
2. Go to **Plugins > Development > Import plugin from manifest...**.
3. Select the `manifest.json` file located in:
   `e:\Other\Antigravity\Open with Affinity\dev\plugin\manifest.json`

### 3. Usage
1. Select an image or a shape with an image fill in Figma.
2. Right-click and go to **Plugins > Development > Edit in Affinity**.
3. Click the **"Edit in Affinity"** button in the plugin window.
4. Affinity will open with your image.
5. **Edit the image and Save (Ctrl+S)** in Affinity.
6. The image in Figma will update automatically!

## Troubleshooting
- **Bridge not connecting**: Ensure you ran `node index.js` in the `bridge` folder.
- **Affinity doesn't open**: I've pre-configured common paths for Affinity Photo 1/2 and Designer 1/2. If it still doesn't open, ensure Affinity is installed in the default `C:\Program Files\Affinity` location.
- **Image doesn't update**: Make sure you "Save" the file in Affinity, not just "Export". The bridge watches for file changes on the temporary file created.
