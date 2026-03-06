# 📜 JOYJET CHANGE LOG

All notable changes to the Joyjet Surveillance System will be documented in this file.

---

## [1.2.1] - 2026-03-06
### Added
- **Local Tactical Feed Capture**: Instantly save live stream frames to `JOYJET_SCREENSHOTS` album.
- **Professional Evidence Management**: Separate albums for `DOWNLOADS` and `SCREENSHOTS`.
- **Timestamped Filenames**: Automatic `[TYPE]_[GHOSTNAME]_[TIMESTAMP].jpg` naming for traceability.
- **Admin Root Authority**: Explicit support for `admin_` prefixed Ghost nodes for root-level oversight.
- **Unlimited Admin Capacity**: Documentation of unlimited ghost binding for the Master Hub.

### Optimized
- **Tactical UI Throttling**: Added a 800ms state sync loop to prevent Admin Dashboard lag.
- **Capture Cooldown**: Implemented a 2-second delay between captures to prevent storage bottlenecks.
- **CI/CD Efficiency**: Configured GitHub Actions to ignore `.md` file changes.

### Fixed
- **Traceability**: Corrected filename mapping to ensure Ghost names are properly encoded in every screenshot.

---

## [1.1.0] - 2026-03-05
### Added
- **Remote Snapshot Downloads**: Save high-res remote captures to the local device.
- **Dual-Layer GPS**: Foreground and Background tracking via TaskManager.

### Fixed
- **Screen Projection**: Initialized silent background streaming for Ghost nodes.

---
*End of log. See [FEATURES.md](./FEATURES.md) for technical deep-dives.*
