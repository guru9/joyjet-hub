# JOYJET HUB: FEATURE REGISTRY & OPERATION GUIDE

## 🛰️ Core Infrastructure
- **Persistent Node Registry**: All ghost nodes are saved to a server-side JSON database (`nodes_registry.json`). They remain visible in dashboards even after a node disconnects or a server restarts.
- **Bi-Directional Signaling**: Real-time communication using Socket.io for commands (Snapshot, Wipe, Ping) and WebRTC for low-latency screen streaming.
- **Case-Insensitive Normalization**: All node identifiers are universally converted to lowercase across the Hub, Server, and Ghost nodes. This prevents duplicate entries and ensures reliable command routing regardless of login casing.
- **Role-Based Access Control**:
  - `Admin`: Full control over all nodes, system-wide logs, and terminal commands.
  - `Viewer`: Selective access to specific "prefixed" nodes (e.g., `Alpha_Node01` is visible to viewer `Alpha`).
  - `Ghost`: Headless background service for telemetry and screen projection.

## ⚡ Active/Inactive Detection
- **Tactical Grid Vitals**: High-density 2x2 grid for at-a-glance monitoring of Identity, Energy, Uplink, and Telemetry timestamps.
- **`ghost_online` Broadcast**: Dashboard entries appear instantly when a node connects, even before its first heartbeat.
- **Handshaking**: Automated `PING` sent on node selection to "wake up" remote telemetry.
- **Visibility**: Nodes are color-coded (Green = Active/Secure, Red = Offline, Orange = Connecting) with distinct icons indicating their status.

## 🛠️ Security & UI Features
- **Premium Dark Theme**: Modern slate/blue UI with glassmorphism effects and optimized mobile layouts.
- **Secure PIN (Admin Only)**: Elevated security for system master access.
- **WebRTC Timeout Protection**: Prevents infinite loading; displays "Feed Unavailable" if a secure tunnel fails to establish within 15s.
- **Wipe Command**: Immediate session termination and memory purge for remote nodes.

## 📊 Telemetry & Data
- **Live Video Feed**: Low-latency screen streaming with recording indicators and recording capture tools.
- **Tactical Map**: Real-time GPS tracking on a dark-themed coordinate plane.
- **Log Console**: Color-coded system alerts and battery status history.
- **Snapshot Gallery**: Remote screen captures with metadata and timestamps.
- **Call Log Sync**: Synchronized phone metadata for forensic analysis.
