# Juno Technical Documentation

This document provides a technical overview of the Juno application, including its architecture, technology stack, and build process.

## 🛠 Technology Stack

*   **Core**: [Electron](https://www.electronjs.org/) (v28)
*   **Frontend**: [React](https://react.dev/) (v18) + [Vite](https://vitejs.dev/)
*   **Styling**: [TailwindCSS](https://tailwindcss.com/)
*   **Database**: [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (Local persistent storage)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **State/Storage**: `electron-store` (User preferences)

## 🏗 Architecture

Juno follows the standard Electron multi-process architecture:

### 1. Main Process (`electron/main.js`)
*   **Window Management**: Handles the creation of the transparent, always-on-top `BrowserWindow`.
*   **IPC Handlers**: Listens for events from the renderer (`add-note`, `set-window-position`, `resize`).
*   **System Integration**: Manages the System Tray, Global Shortcuts (`Ctrl+Shift+N`), and Windows Notifications (`AppUserModelId`).
*   **Database Access**: Direct communication with the SQLite database file (`notes.db`).

### 2. Renderer Process (`src/`)
*   **UI Components**: React components for the Floating Ball, Notes Widget, and Pickers.
*   **Styles**: Glassmorphism and animations driven by Tailwind and Framer Motion.
*   **Bridge**: Uses `electron/preload.js` to communicate safely with the Main process via `window.electronAPI`.

### 3. Data Storage
*   **Notes**: Stored in a local SQLite database (`AppData/Roaming/juno/notes.db`).
    *   `notes` table: `id` (PK), `content`, `color`, `pinned`, `reminder_at`, `created_at`.
    *   `tasks` table: `id` (PK), `title`, `description`, `priority` (low/medium/high), `due_date`, `completed`, `reminder_at`.
*   **Preferences**: Stored in JSON (`AppData/Roaming/juno/config.json`) via `electron-store`.
    *   `windowX`, `windowY`: Last known screen position.
    *   `theme`: 'dark', 'light', 'midnight', 'nebula'.

## 📂 Project Structure

```bash
juno/
├── electron/               # Main process code
│   ├── main.js             # Entry point
│   ├── preload.js          # Context Bridge
│   ├── database.js         # SQLite wrappers
│   └── notifications.js    # Notification scheduler
├── src/                    # Renderer process (React)
│   ├── components/         # UI Components (FloatingBall, NotesWidget)
│   ├── hooks/              # Custom Hooks (useDragging, useNotes)
│   ├── styles/             # Global CSS & Tailwind
│   └── App.jsx             # Root component
├── release/                # Build output (Installers)
├── package.json            # Dependencies & Build Config
└── vite.config.js          # Vite configuration
```

## 📦 Build & Deployment

Juno uses `electron-builder` to package the application for Windows.

### Configuration (`package.json`)
*   **AppId**: `com.juno.app`
*   **Target**: NSIS (Standard Windows Installer)
*   **Icon**: `ball-icon.png` (Converted to ICO automatically)
*   **Files**: Whitelists `dist/`, `dist-electron/`, and assets.

### Commands
*   **Development**: `npm run dev` (Starts Vite server + Electron)
*   **Build Windows**: `npm run build:win` (Compiles React + Packages Electron)

## 🔧 Key Functionalities

### Transparent Window
The app uses a frameless, transparent BrowserWindow (`transparent: true`, `backgroundColor: '#00000000'`) to achieve the non-rectangular "Floating Ball" look. To avoid graphical glitches on Windows, we force a specific transparency configuration and handle mouse events carefully.

### Custom Dragging
Since the window is frameless, we implement a custom drag handler (`useDragging.js`) that calculates delta movements (`movementX`/`movementY`) and sends atomic `setBounds` updates to the Main process to prevent window size drift.

## 👨‍💻 Developer

*   **Email**: chrisfds2407@gmail.com
*   **GitHub**: [Christen24/Juno](https://github.com/Christen24/Juno.git)

## 🚀 Releasing on GitHub

To share your app with others, follow these steps:

1.  **Build the App**:
    *   Windows: `npm run build:win` -> Generates `Juno Setup 1.0.0.exe` in `release/1.0.0/`.
    *   Mac: `npm run build:mac` -> Generates `Juno-1.0.0.dmg` in `release/1.0.0/`.

2.  **Create a Release**:
    *   Go to your GitHub repository -> Click **Releases** (on the right) -> **Draft a new release**.
    *   **Tag version**: `v1.0.0` (ensure it matches `package.json`).
    *   **Release title**: `Juno v1.0.0 - Initial Release`.
    *   **Description**: List the new features (e.g., "Initial release with Quick Notes, File Manager, and Windows support").

3.  **Upload Assets**:
    *   Drag and drop the `.exe` (and `.dmg` if applicable) files from your local `release/` folder into the "Attach binaries..." box.
    *   Do **NOT** upload the `win-unpacked` folder, just the installer file.

4.  **Publish**:
    *   Click **Publish release**. Users can now download the app directly from GitHub!
