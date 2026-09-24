# 🌊 AquaShield AI

> **AI-Powered Coastal Disaster Intelligence and Marine Safety Platform**
> 
> *"Protecting Coastal Communities using AI, Computer Vision, Machine Learning, and Large Language Models."*

---

## 📌 Overview

**AquaShield AI** is an intelligent coastal disaster management and marine safety platform designed specifically for coastal regions. The platform integrates Artificial Intelligence, Computer Vision, Geographic Information Systems (GIS), Machine Learning, Large Language Models (LLMs), and real-time weather sensors to provide predictive disaster intelligence, emergency response, marine animal rescue support, and verified citizen reporting.

Unlike traditional alert-only warning systems, **AquaShield AI**:
- 🛡️ **Verifies disaster reports** using multi-layer forensic AI (YOLOv11 + EfficientNet + Vision Transformers) to filter fake CGI/AI-generated images.
- 🛣️ **Calculates safe evacuation routes** using a Modified A* + Dijkstra risk-weighted graph algorithm.
- 📱 **Operates offline & via SMS** when cellular data or Wi-Fi networks fail during major cyclones or tsunamis.
- 🐬 **Coordinates marine animal rescue** with automated NGO dispatching.
- 💬 **Provides an AI Emergency Assistant** trained on NDMA and INCOIS disaster response SOPs.

---

## ⚡ Key Features

### 1. 🚨 Live Disaster Intelligence Dashboard
- Real-time monitoring of coastal weather conditions (wind speed, wave height, temperature, visibility, pressure).
- Interactive Chart.js analytics for disaster frequency trends, risk level distributions, and response time metrics.
- Live feed auto-updates for active alerts across coastal zones.

### 2. 🗺️ Interactive GIS Map
- Leaflet-powered GIS map visualizing active disaster zones, hospitals, relief shelters, and marine rescue locations.
- Includes a native SVG fallback radar for offline operation.

### 3. 🤖 Multi-Layer AI Image Verification & Fraud Prevention
- Upload disaster photos for instantaneous 4-layer forensic scanning.
- Cross-references visual depth features against live INCOIS buoy ocean sensor data.
- Detects synthetic AI/Midjourney textures, Pinterest stock imagery, and recycled historical disaster photos to prevent false panic.

### 4. 🛣️ AI Safe Evacuation Route Recommendation
- Evaluates shortest vs. safest evacuation routes.
- Calculates elevation safety and risk reduction percentages to guide citizens away from flooded highways.

### 5. 🐬 Marine Animal Rescue Module
- Species detection and reporting for injured marine life (turtles, dolphins, whales, sea birds).
- Automated routing to assigned marine conservation NGOs with ETA tracking.

### 6. 📱 Emergency Offline PWA & SMS Gateway
- **Service Worker (`sw.js`)**: Caches all critical frontend assets for offline operation during network collapse.
- **SMS Emergency SOS (`sms:` URI)**: Tap to send instant SMS emergency alerts containing exact GPS coordinates (`lat`, `lng`), Google Maps link, and emergency type to NDMA, Coast Guard, Police, and Ambulance helplines without internet.

### 7. 💬 AI Emergency Assistant (RAG Chatbot)
- Interactive disaster response guide providing immediate SOP instructions for cyclones, tsunamis, high tides, and emergency first aid.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3 (Glassmorphism), Vanilla JS (ES6+) |
| **Mapping & GIS** | Leaflet.js, OpenStreetMap, SVG Radar Engine |
| **Charts & Visualization** | Chart.js 4.4, Native Canvas Fallback Renderers |
| **Backend Framework** | Python 3.13, FastAPI, Uvicorn |
| **Database & ORM** | Async SQLAlchemy, SQLite / PostgreSQL |
| **Offline & PWA** | Service Worker, Web App Manifest, Geolocation API |
| **Emergency Messaging** | Native `sms:` URI Gateway, FastAPI Emergency Router |

---

## 🚀 Quick Start Guide

### 1-Click Launch (Windows)
Double-click **`START_AQUASHIELD.bat`** in the project directory. This script will:
1. Check and install Python dependencies.
2. Start the FastAPI backend server on `http://127.0.0.1:8000`.
3. Open the live platform in your default web browser.

### Manual Setup

```bash
# 1. Clone the repository
git clone https://github.com/kolatkvarun6-lab/capstone-project.git
cd capstone-project

# 2. Install dependencies
pip install fastapi uvicorn pydantic python-multipart sqlalchemy aiosqlite

# 3. Start the FastAPI server
python run_app.py
# or
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Open your browser and navigate to `http://127.0.0.1:8000`.

---

## 📂 Project Structure

```
google_antigravity/
├── index.html               # Main Single-Page Application (SPA) frontend
├── style.css                # Water-themed ocean glassmorphism design system
├── app.js                   # Main application logic & fallback rendering engines
├── sw.js                    # Service Worker for offline PWA caching & background sync
├── manifest.json            # Web App Manifest for mobile installation
├── run_app.py               # 1-Click Python launcher & browser opener
├── START_AQUASHIELD.bat     # Windows batch script for 1-click startup
│
└── backend/
    └── app/
        ├── main.py          # FastAPI application entry point
        ├── config.py        # Configuration & CORS settings
        ├── database.py      # Async SQLAlchemy DB engine
        │
        ├── models/          # SQLAlchemy ORM models (User, Disaster, Report, Marine)
        ├── schemas/         # Pydantic validation schemas
        ├── services/        # AI forensic, route calculation & chat services
        └── routers/         # API routers (disasters, reports, marine, routes, sos, chat, sms)
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
