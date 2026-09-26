# AquaShield Sentinel Mobile (Flutter)

Cross-platform mobile application for **AquaShield Sentinel — Real-Time Maritime Incident Response, AI Threat Analysis & Emergency SOS Network**.

---

## 📱 Features Included

1. **Tactical Radar & GIS Map**:
   - High-contrast MapLibre / OpenStreetMap / Esri Canvas & Satellite tile layers (100% watermark-free, zero API key).
   - 21 Smart Telemetry Buoys with live wave swell, water temperature, wind speed, and battery monitoring.
   - AIS Marine Vessel tracking with live heading and speed.
   - Verified Field Incident markers with real-time popup cards.
2. **Emergency SOS & Distress Beacon**:
   - 5-second hold safety trigger.
   - High-precision GPS coordinates acquisition.
   - Offline-ready P2P mesh relay queue.
3. **Field Incident Reporter**:
   - Precision GPS geolocating.
   - Hazard classification (Pollution, Navigational Hazard, Tsunami, Distress).
   - Multi-level severity triaging (Low, Moderate, High, Critical).
4. **AI Threat Scanner**:
   - Computer vision spectral signature analysis.
   - Confidence ratings and tactical protocol recommendations.
5. **Maritime AI Copilot**:
   - Interactive terminal dispatch assistant with quick-action prompts.
6. **Evacuation Corridors**:
   - High-ground shelter directory with elevation and logistics metadata.

---

## 🚀 How to Run

### 1. Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (version 3.0.0 or higher)
- Android Studio / Xcode / VS Code with Flutter extension

### 2. Install Dependencies
```bash
cd mobile
flutter pub get
```

### 3. Run on Device or Emulator
```bash
# Ensure the AquaShield FastAPI backend is running on port 8000:
# (cd .. && python3 -m uvicorn app.main:app --port 8000)

# Run on Android Emulator:
flutter run

# Run on Chrome for Web Preview:
flutter run -d chrome
```

---

## 🎨 Theme & Design System
- **Background**: Obsidian Midnight Navy (`#07111E`)
- **Surface**: Midnight Slate (`#0C1929`)
- **Primary / Brand**: Distress Amber (`#F59E0B`)
- **Alert / SOS**: Crisis Red (`#EF4444`)
- **Telemetry Active**: Radar Emerald (`#10B981`)
