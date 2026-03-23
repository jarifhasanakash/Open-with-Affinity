# Edit in Affinity - Figma Plugin

A bridge between Figma and the Affinity v3. This plugin allows you to edit images from Figma directly in Affinity and automatically syncs the changes back to Figma when you save.

---

## ✨ Features
- **One-Click Edit**: Open any Figma image layer directly in Affinity.
- **Automatic Sync**: Save in Affinity, and the image in Figma updates instantly.
- **Cross-Platform**: Full support for both **Windows** and **macOS**.
- **Versatile**: Works with Affinity Photo, Designer, and Publisher (V1 & V2).

---

## 🛠️ Requirements
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Figma Desktop App** (Plugin development requires the desktop version)
- **Affinity Software** (v3) - [Download here](https://www.affinity.studio/download)

---

## 🚀 Installation & Setup

### 1. Set Up the Local Bridge
The plugin requires a small "bridge" server running on your computer to handle file operations that Figma's sandbox doesn't allow.

1.  **Open your Terminal** (Terminal on Mac, PowerShell or Command Prompt on Windows).
2.  **Navigate to the bridge directory** in this project:
    ```bash
    cd "path/to/folder/bridge"
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Start the server**:
    ```bash
    npm start
    ```
    *Keep this terminal window open while using the plugin.*

### 2. Install the Plugin in Figma
1.  Open the **Figma Desktop App**.
2.  Right-click anywhere or go to the main menu and select **Plugins > Development > Import plugin from manifest...**.
3.  Select the `manifest.json` file located in the `plugin` folder of this project.

---

## 🎨 How to Use
1.  **Select an image layer** (or a shape with an image fill) in Figma.
2.  Run the plugin: **Plugins > Development > Edit in Affinity**.
3.  Click the **"Edit in Affinity"** button.
4.  Your image will open automatically in Affinity.
5.  **Edit the image and Save (Ctrl+S / Cmd+S)**.
6.  The image in Figma will update immediately!

---

## 💻 Platform Notes

### 🪟 Windows
- The bridge searches common installation paths in `C:\Program Files\Affinity`.
- If you have an unconventional setup, ensure the Affinity executable is in your system PATH.

### 🍎 macOS
- The bridge looks for Affinity apps in your `/Applications` folder.
- Depending on your security settings, you may need to grant the Terminal "Full Disk Access" if the bridge cannot write to the temporary directory.

---

## ❓ Troubleshooting
- **"Bridge not connected"**: Ensure `npm start` is running in the terminal and you see the message "Bridge server running".
- **Affinity doesn't open**: 
    - Ensure Affinity is installed in the default location.
    - If it still won't open, the bridge will attempt to use your system's default image editor as a fallback.
- **Image doesn't update**: You must **Save** the file in Affinity. Do not use "Export," as that creates a new file instead of overwriting the temporary one the bridge is watching.
