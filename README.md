# 🛸 JOYJET HUB | Tactical Surveillance & Stealth Ecosystem

JOYJET is a high-performance, low-footprint monitoring solution built with React Native (Expo) and Node.js. It features intelligent data management, automated fail-safes for stealth, and real-time telemetry.

---

## ⚡ LATEST UPDATES (v4.2.0)

- **Android 15/16 Compatibility**: Fixed "Black Screen" and startup crashes by targeting **SDK 35**.
- **WebRTC Integration**: HD low-latency streaming ready with auto-configured permissions.
- **Automated Free Builds**: Added **GitHub Actions** workflow to bypass Expo/EAS quotas.
- **System Stability**: Added a 2.5s bridge initialization delay for reliable startup on modern Android devices.

---

## 🏗️ Technical Architecture

The JoyJet ecosystem follows a **Star Topology** with a centralized proxy server.

### **🔄 System Logical Flow**

1. **Ghost Entry**: App connects -> Reports `DeviceID` -> Enters **Idle Stealth Mode**.
2. **Admin Entry**: Logs in via `ADMIN_SECRET_KEY` -> Locks Hub if no other Admin is active.
3. **Viewer Entry**: Logs in with username prefix -> Restricted to associated Ghost nodes.

---

## 🛠️ Build & Deployment (FREE SOLUTION)

Since EAS quotas are limited, use the integrated **GitHub Actions** workflow to build your APK for free.

### **1. Cloud Build (GitHub Actions) - RECOMMENDED**

1. Push your code to your GitHub repository.
2. Go to the **Actions** tab on GitHub.
3. Select the **"Build Android APK"** workflow.
4. Once finished, download the `app-debug.apk` from the **Artifacts** section at the bottom.

### **2. Local Prebuild (Android Folder Generation)**

If you want to generate the native Android project locally:

```powershell
# Install all dependencies
npm install

# Generate the /android directory with latest configurations
npx expo prebuild -p android --clean
```

---

## 📡 Identity & Auth Matrix

| Role       | Name Format    | Key Required  | Access Level                          |
| :--------- | :------------- | :------------ | :------------------------------------ |
| **Admin**  | `admin`        | **GURU_8310** | Full control of all nodes & Wipe      |
| **Viewer** | `Alpha`        | No            | Monitors nodes starting with `Alpha_` |
| **Ghost**  | `Alpha_Node01` | No            | Stealthily relays HD data             |

---

## ⚙️ Technical Specifications

- **Transport**: Socket.io (WebSocket)
- **Buffer Size**: 100MB (`maxHttpBufferSize: 1e8`)
- **Format**: Base64 JPEG / WebRTC
- **Target SDK**: 35 (Android 15/16 compatible)
- **Backend**: Hosted on Render.com ([joyjet-server.onrender.com](https://joyjet-server.onrender.com))

---

## 📦 Project Structure

```text
joyjet-hub/ (Root)
├── .github/workflows/   # Free Cloud Build Config
├── android/             # Native Android Project (Generated via Prebuild)
├── src/
│   ├── screens/         # UI Screens (Login, Admin, Viewer, Ghost)
│   └── services/        # Socket & WebRTC Logic
├── App.js               # Main Controller & Bridge Init
├── app.json             # App Identity, Permissions & Plugins
└── withAndroidStrings.js # Native String Customization Plugin
```

---

_Status: Finalized for Build. Ready for APK Deployment._
