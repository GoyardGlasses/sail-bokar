# SAIL Bokaro - Packaging & Deployment Guide

**SIH25208 SAIL Bokaro Steel Plant Logistics Optimization System**

---

## 📦 Overview

This guide covers packaging the SAIL Bokaro application for distribution across Windows, macOS, and Linux platforms.

### Architecture

```
┌─────────────────────────────────────────┐
│         Electron Main Process           │
│  (Manages backend, window, IPC)         │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────────┐
│   React UI   │  │ FastAPI Backend  │
│  (Renderer)  │  │  (Child Process) │
└──────────────┘  └──────────────────┘
```

---

## 🔧 Prerequisites

### Development

- Node.js 16+
- Python 3.10+
- Git

### Build Tools

**Windows:**
- Visual Studio Build Tools
- NSIS (for installer)

**macOS:**
- Xcode Command Line Tools
- `codesign` (for signing)

**Linux:**
- build-essential
- libfuse2 (for AppImage)

### Installation

```bash
# Install Node dependencies
cd frontend && npm install
cd ../electron && npm install

# Install Python dependencies
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
pip install pyinstaller
```

---

## 🏗️ Build Process

### Step 1: Build Frontend

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Step 2: Build Backend Binary

```bash
cd electron
node scripts/build-backend.js
# Output: backend/bundle/fastapi_backend (or .exe on Windows)
```

### Step 3: Package for Target Platform

**Windows:**
```bash
cd electron
npm run dist:win
# Output: release/installers/SAIL-Bokaro-Optimizer-Setup-1.0.0.exe
```

**macOS:**
```bash
cd electron
npm run dist:mac
# Output: release/installers/SAIL-Bokaro-Optimizer-1.0.0.dmg
```

**Linux:**
```bash
cd electron
npm run dist:linux
# Output: release/installers/SAIL-Bokaro-Optimizer-1.0.0.AppImage
#         release/installers/sail-bokaro-optimizer-1.0.0.deb
```

### All Platforms (Requires Cross-Compilation or Multiple Runners)

```bash
cd electron
npm run dist:all
```

---

## 📋 Build Configuration

### electron/package.json

Key build settings:

```json
{
  "build": {
    "appId": "com.sail.bokaro.optimizer",
    "productName": "SAIL Bokaro Optimizer",
    "files": [
      "main.js",
      "preload.js",
      "resources/**/*",
      "../frontend/dist/**/*",
      "../backend/bundle/**/*"
    ],
    "win": {
      "target": ["nsis", "portable"]
    },
    "mac": {
      "target": ["dmg", "zip"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

---

## 🔐 Code Signing

### Windows

1. Obtain a code signing certificate (.pfx)
2. Update `electron/package.json`:
   ```json
   "win": {
     "certificateFile": "path/to/certificate.pfx",
     "certificatePassword": "password"
   }
   ```
3. Build: `npm run dist:win`

### macOS

1. Obtain Apple Developer certificate
2. Set environment variables:
   ```bash
   export CSC_LINK=/path/to/certificate.p12
   export CSC_KEY_PASSWORD=password
   ```
3. Build: `npm run dist:mac`
4. Notarize (optional but recommended):
   ```bash
   xcrun notarytool submit dist/SAIL-Bokaro-Optimizer-1.0.0.dmg \
     --apple-id your-email@example.com \
     --password your-app-password \
     --team-id YOUR_TEAM_ID
   ```

### Linux

No code signing required for AppImage/deb.

---

## 📊 Build Artifacts

### Expected Sizes

| Platform | Format | Size | Notes |
|----------|--------|------|-------|
| Windows | .exe (NSIS) | ~350MB | Includes Python runtime |
| Windows | .exe (Portable) | ~350MB | No installation needed |
| macOS | .dmg | ~400MB | Intel + ARM64 universal |
| Linux | .AppImage | ~380MB | Portable, no dependencies |
| Linux | .deb | ~360MB | System package |

### Output Locations

```
release/
├── installers/
│   ├── SAIL-Bokaro-Optimizer-Setup-1.0.0.exe
│   ├── SAIL-Bokaro-Optimizer-1.0.0-portable.exe
│   ├── SAIL-Bokaro-Optimizer-1.0.0.dmg
│   ├── SAIL-Bokaro-Optimizer-1.0.0.AppImage
│   └── sail-bokaro-optimizer-1.0.0.deb
└── release_notes.txt
```

---

## 🚀 Installation

### Windows

**NSIS Installer:**
1. Download `SAIL-Bokaro-Optimizer-Setup-1.0.0.exe`
2. Run the installer
3. Follow on-screen prompts
4. Launch from Start Menu or Desktop shortcut

**Portable:**
1. Download `SAIL-Bokaro-Optimizer-1.0.0-portable.exe`
2. Run directly (no installation)

### macOS

1. Download `SAIL-Bokaro-Optimizer-1.0.0.dmg`
2. Open the DMG file
3. Drag app to Applications folder
4. Launch from Applications or Spotlight

### Linux

**AppImage:**
```bash
chmod +x SAIL-Bokaro-Optimizer-1.0.0.AppImage
./SAIL-Bokaro-Optimizer-1.0.0.AppImage
```

**Debian/Ubuntu:**
```bash
sudo dpkg -i sail-bokaro-optimizer-1.0.0.deb
sail-bokaro-optimizer  # Launch from terminal
```

---

## 🔄 Auto-Updates

### Configuration

Update check URL in `electron/main.js`:

```javascript
const UPDATE_CHECK_URL = 'https://api.github.com/repos/your-org/sail-bokaro/releases/latest'
```

### GitHub Releases

1. Create a release on GitHub
2. Upload installers as release assets
3. App automatically checks for updates on startup

### Custom Update Server

Provide a JSON endpoint:

```json
{
  "version": "1.0.1",
  "url": "https://your-server.com/releases/v1.0.1.exe",
  "releaseNotes": "Bug fixes and improvements",
  "releaseDate": "2025-11-22"
}
```

---

## 🧪 Testing

### Local Testing

```bash
# Test packaged app locally
cd electron
npm run pack
# Runs the app without creating installer
```

### Smoke Tests

1. **Launch app** - Verify window opens
2. **Backend health** - Check backend starts
3. **Dashboard** - Load dashboard page
4. **Optimize** - Run sample optimization
5. **Export** - Export results as JSON

### Automated Testing

```bash
npm run test:e2e
```

---

## 📋 System Requirements

### Windows

- OS: Windows 10 or later (x64)
- RAM: 4GB minimum, 8GB recommended
- Disk: 500MB free space
- .NET Framework 4.5+ (usually pre-installed)

### macOS

- OS: macOS 10.13 or later
- Architecture: Intel or Apple Silicon
- RAM: 4GB minimum, 8GB recommended
- Disk: 500MB free space

### Linux

- OS: Ubuntu 18.04+, Debian 10+, or equivalent
- Architecture: x64
- RAM: 4GB minimum, 8GB recommended
- Disk: 500MB free space
- Dependencies: libfuse2 (for AppImage)

---

## 🐛 Troubleshooting

### Backend won't start

1. Check logs: Open app → Admin → View Logs
2. Verify Python runtime: `python --version`
3. Check port 8000 is available: `netstat -an | grep 8000`

### App crashes on startup

1. Clear app cache:
   - Windows: `%APPDATA%\SAIL Bokaro Optimizer`
   - macOS: `~/Library/Application Support/SAIL Bokaro Optimizer`
   - Linux: `~/.config/SAIL Bokaro Optimizer`
2. Reinstall application

### Installer won't run

- Windows: Disable antivirus temporarily
- macOS: Allow app in Security & Privacy settings
- Linux: Check file permissions: `chmod +x *.AppImage`

---

## 📦 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Build & Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: npm install
      - run: npm run build
      - run: npm run dist:win
      - uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: release/installers/*.exe

  build-macos:
    runs-on: macos-latest
    steps:
      # Similar steps for macOS

  build-linux:
    runs-on: ubuntu-latest
    steps:
      # Similar steps for Linux
```

---

## 📝 Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Test on all platforms
- [ ] Build all installers
- [ ] Sign binaries (Windows/macOS)
- [ ] Create GitHub release
- [ ] Upload installers to release
- [ ] Update website/documentation
- [ ] Announce release

---

**Ready for production deployment!**

