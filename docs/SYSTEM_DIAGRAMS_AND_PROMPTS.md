# AquaShield AI — System Diagrams & Generator Prompts

This document contains GitHub-renderable Mermaid diagrams alongside ready-to-use prompt templates for **Data Flow Diagrams (DFD)**, **System Flowcharts**, **UML Diagrams**, and **Block Diagrams**.

---

## 1. Data Flow Diagram (DFD)

### Visual Vector Diagram (SVG)
![Data Flow Diagram Level 1](diagrams/dfd_diagram.svg)
*Direct SVG File*: [`docs/diagrams/dfd_diagram.svg`](diagrams/dfd_diagram.svg)

### 1.1 Level 0: Context Level Diagram (GitHub Rendered)

```mermaid
graph TD
    Citizen[👤 Coastal Citizen / Beachgoer]
    Sensor[🌊 Ocean Buoys & Weather Stations]
    CoastGuard[🛡️ Indian Coast Guard / NDMA / 112]
    NGO[🐬 Marine Wildlife NGOs]

    System((🌊 AquaShield AI Core Platform))

    Citizen -->|Hazard Reports, Photo, GPS, SOS| System
    Sensor -->|Wave Height, Swell, Wind, Temp Telemetry| System
    System -->|Real-time Hazard Alerts, Safe Routes, Beach Status| Citizen
    System -->|Verified Emergency Incident Alerts & GPS| CoastGuard
    System -->|Stranded Marine Animal Rescue Tickets| NGO
```

### 1.2 Level 1: Subsystem Data Flow Diagram (GitHub Rendered)

```mermaid
graph TD
    subgraph External Entities
        E1[👤 Citizen / Volunteer]
        E2[🌊 Buoy IoT Sensors]
        E3[🛡️ Coast Guard / Police]
        E4[🐬 Marine NGOs]
    end

    subgraph Processes
        P1[1.0 Ingest Telemetry & Compute Hazard Index]
        P2[2.0 Ingest Citizen Observation & GPS]
        P3[3.0 Dual-Stream AI Forensic Verification]
        P4[4.0 Risk-Weighted Evacuation Routing]
        P5[5.0 Marine Rescue Dispatcher]
        P6[6.0 Offline SOS / SMS Dispatcher]
    end

    subgraph Data Stores
        D1[(D1: Telemetry & Coastal Hazards)]
        D2[(D2: Community Incident Reports)]
        D3[(D3: Marine Rescue Database)]
        D4[(D4: Road & Elevation Risk Graph)]
    end

    E2 -->|Raw Sensor Readings| P1
    P1 -->|Stored Hazard Index & Alerts| D1
    D1 -->|Active Zone Telemetry| E1

    E1 -->|Photo, GPS, Category| P2
    P2 -->|Raw Report & Image Stream| P3
    P3 -->|Forensic Scores, Verification Tag| D2
    D2 -->|Verified Incident Feed| E3

    E1 -->|Origin & Destination| P4
    D4 -->|Inundation-Weighted Graph| P4
    P4 -->|Safe Evacuation Corridor| E1

    E1 -->|Marine Sighting & Species| P5
    P5 -->|Rescue Case Details| D3
    D3 -->|Dispatch Notification| E4

    E1 -->|Zero-Data SOS Trigger| P6
    P6 -->|Preformatted SMS via sms: URI| E3
```

---

### 1.3 Ready-to-Use Prompt: Data Flow Diagram (DFD)

> **Copy and paste this prompt into ChatGPT, Claude, Eraser.io, or Lucidchart:**
>
> ```text
> Create a comprehensive Level 0 and Level 1 Data Flow Diagram (DFD) for "AquaShield AI", an AI-powered coastal disaster intelligence and marine safety platform.
> 
> System Context:
> - External Entities:
>   1. Coastal Citizens / Beachgoers / Volunteers
>   2. Oceanographic Buoy IoT Sensors & Meteorological Services (INCOIS, IMD)
>   3. Emergency Response Agencies (Indian Coast Guard, NDMA, Police 112)
>   4. Marine Wildlife Rescue NGOs
> 
> - Level 1 Processes:
>   - Process 1.0: Ocean Sensor Telemetry Ingestion & Hazard Calculation (computes wave/swell risk index).
>   - Process 2.0: Citizen Incident Observation Capture (collects photo, GPS, category).
>   - Process 3.0: Dual-Stream AI Forensic Verification (runs EfficientNet-B0 + Error Level Analysis to detect fake/tampered photos).
>   - Process 4.0: Risk-Weighted Evacuation Route Optimization (computes shortest path penalizing flood zones).
>   - Process 5.0: Marine Wildlife Rescue Dispatcher (coordinates species stranding alerts with NGOs).
>   - Process 6.0: Offline Emergency SOS & SMS Transmission (constructs zero-data SMS packets).
> 
> - Data Stores:
>   - D1: Ocean Telemetry & Coastal Hazard Store
>   - D2: Community Incident Reports & Forensic Verifications
>   - D3: Marine Wildlife Rescue Registry
>   - D4: Coastal Elevation & Road Inundation Graph
> 
> Please output standard Gane & Sarson or Yourdon DFD notation with clear directional data flow labels, processes, data stores, and external entities.
> ```

---

## 2. System Workflow Flowchart

### Visual Vector Diagram (SVG)
![System Workflow Flowchart](diagrams/flowchart_diagram.svg)
*Direct SVG File*: [`docs/diagrams/flowchart_diagram.svg`](diagrams/flowchart_diagram.svg)

### 2.1 End-to-End Decision Flowchart (GitHub Rendered)

```mermaid
flowchart TD
    Start([User Opens AquaShield Platform]) --> NetCheck{Is Internet Available?}

    NetCheck -- No --> OfflineMode[Load Service Worker sw.js Cache]
    OfflineMode --> OfflineChoices{User Action?}
    OfflineChoices -- View Safety Checklists --> ViewOfflineSOP[View Cached SOPs & Radar Baseline]
    OfflineChoices -- Emergency SOS --> TriggerSMS[Generate sms: URI with GPS Coordinates]
    TriggerSMS --> OpenNativeSMS[Open Phone SMS App to 112 / Coast Guard 1554]

    NetCheck -- Yes --> LoadOnline[Fetch Live Telemetry & Active Disaster Radar]
    LoadOnline --> MainAction{User Selects Feature}

    MainAction -- Check Beach Safety --> BeachSafety[Inspect Swell, Wave Height & Status Badge]
    MainAction -- Evacuation Route --> InputRoute[Input Origin & Destination Coordinates]
    MainAction -- Marine Life Rescue --> ReportMarine[Log Stranded Species, Injury & Location]
    MainAction -- Report Hazard Observation --> UploadHazard[Upload Incident Photo & GPS]

    InputRoute --> CalcRoute[Run Risk-Weighted A* Algorithm avoiding Inundation]
    CalcRoute --> DisplayRoute[Display Safe Evacuation Corridor on Leaflet GIS]

    ReportMarine --> SaveMarine[Store in DB & Trigger Rescue NGO Alert]

    UploadHazard --> RunForensics[Pass Image to AI Forensic Pipeline]
    RunForensics --> DualStream[Dual-Stream Neural Net: RGB + ELA EfficientNet-B0]
    DualStream --> CheckAuthenticity{Is Image Authentic?}

    CheckAuthenticity -- No (CGI / Tampered / Stock) --> FlagFake[Flag Report: is_fake = True]
    FlagFake --> RejectAlert[Reject Alert Broadcast & Notify User of Tampering]

    CheckAuthenticity -- Yes (Authentic Incident) --> FlagReal[Flag Report: ai_verified = True]
    FlagReal --> BroadcastAlert[Broadcast on Live GIS Map & Notify Emergency Dashboard]

    DisplayRoute --> End([Complete])
    SaveMarine --> End
    RejectAlert --> End
    BroadcastAlert --> End
    OpenNativeSMS --> End
```

---

### 2.2 Ready-to-Use Prompt: Flowchart

> **Copy and paste this prompt into ChatGPT, Claude, Eraser.io, or Whimsical:**
>
> ```text
> Create an end-to-end user and system logic flowchart for "AquaShield AI", a coastal disaster management and incident response system.
> 
> Flow Requirements:
> 1. Start: User opens the application.
> 2. Decision node: "Is Internet Available?".
>    - If NO (Offline Path):
>      - Service Worker activates local asset cache.
>      - User can view offline disaster survival checklists.
>      - If User triggers Emergency SOS: App generates a pre-populated SMS payload with GPS coordinates and opens the device's native SMS composer directed to Coast Guard (1554) or 112 without data.
>    - If YES (Online Path):
>      - Loads live ocean buoy telemetry (wave height, swell, wind).
>      - User chooses between:
>        A. Check Beach Safety (Juhu, Girgaon, Aksa) -> Displays green/yellow/red status.
>        B. Evacuation Navigation -> Runs safety-weighted A* algorithm avoiding flood zones.
>        C. Marine Wildlife Rescue -> Submits stranded animal ticket and notifies NGOs.
>        D. Report Hazard Observation -> User uploads photo and GPS.
> 3. Forensic Decision Gate for Hazard Photos:
>    - Image passes to Dual-Stream Neural Network (EfficientNet-B0 RGB + ELA) + Noise Entropy.
>    - Decision: "Is Image Authentic?".
>      - If NO: Mark as fake/tampered, reject public broadcast, display warning.
>      - If YES: Mark as verified, commit to database, display on live GIS map, and push alert to responders.
> 4. End State.
> 
> Format as a clean, professional flowchart using standard ISO flowchart symbols (terminators, process rectangles, decision diamonds, and labeled branches).
> ```

---

## 3. Unified Modeling Language (UML) Diagrams

### Visual Vector Diagram (SVG)
![UML Class Diagram](diagrams/uml_class_diagram.svg)
*Direct SVG File*: [`docs/diagrams/uml_class_diagram.svg`](diagrams/uml_class_diagram.svg)

### 3.1 UML Class Diagram (GitHub Rendered)

```mermaid
classDiagram
    class User {
        +int id
        +string email
        +string hashed_password
        +string full_name
        +string role
        +bool is_active
        +datetime created_at
    }

    class Disaster {
        +int id
        +string title
        +string type
        +string severity
        +string region
        +float latitude
        +float longitude
        +bool is_active
        +datetime timestamp
    }

    class CommunityReport {
        +int id
        +string title
        +string report_type
        +string description
        +float latitude
        +float longitude
        +string image_url
        +bool ai_verified
        +float ai_confidence
        +bool is_fake
        +string forensic_details
        +datetime created_at
    }

    class MarineRescue {
        +int id
        +string species
        +string beach_name
        +string injury_severity
        +string status
        +float latitude
        +float longitude
        +string ngo_assigned
        +datetime reported_at
    }

    class AIService {
        +get_torch_forensic_model()
        +compute_ela(image, quality)
        +detect_2d_artwork(image)
        +analyze_noise_entropy(image)
        +analyze_image_authenticity(image_bytes) Dict
    }

    class DualStreamForensicNet {
        +EfficientNet rgb_stream
        +EfficientNet ela_stream
        +Sequential classifier
        +forward(rgb, ela) Tensor
    }

    class RouteService {
        +calculate_safe_route(origin, destination) Dict
        +compute_inundation_risk(coordinates) float
    }

    class ChatService {
        +get_live_context() Dict
        +process_message(message, session_id) Dict
    }

    AIService --> DualStreamForensicNet : Uses
    CommunityReport --> AIService : Validated by
    User "1" --> "*" CommunityReport : Submits
    User "1" --> "*" MarineRescue : Reports
```

### 3.2 UML Sequence Diagram: Incident Submission & Verification (GitHub Rendered)

```mermaid
sequenceDiagram
    autonumber
    actor User as Citizen (Client)
    participant Router as ReportsRouter (/api/reports)
    participant AI as AIService
    participant Model as DualStreamForensicNet
    participant DB as SQLite / PostgreSQL (Async DB)
    participant Alert as Emergency Dispatch

    User->>Router: POST /api/reports (photo, category, lat, lng, description)
    activate Router
    Router->>AI: analyze_image_authenticity(image_bytes)
    activate AI

    AI->>AI: Compute Error Level Analysis (ELA)
    AI->>AI: Compute Frequency Noise Entropy
    AI->>Model: forward(rgb_tensor, ela_tensor)
    activate Model
    Model-->>AI: Classification Tensor [Authentic vs Manipulated]
    deactivate Model

    AI-->>Router: Forensic Verdict (confidence, is_fake, forensic_log)
    deactivate AI

    alt Image is Authentic (Real Hazard)
        Router->>DB: INSERT into community_reports (ai_verified=True, is_fake=False)
        DB-->>Router: Commit OK (Report ID #104)
        Router->>Alert: Broadcast Verified Hazard to Live Feed
        Router-->>User: 201 Created (Verified Hazard Published)
    else Image is Fake / Manipulated
        Router->>DB: INSERT into community_reports (ai_verified=False, is_fake=True)
        DB-->>Router: Commit OK (Flagged)
        Router-->>User: 422 / Warning (Synthetic Image Detected - Not Broadcasted)
    end
    deactivate Router
```

---

### 3.3 Ready-to-Use Prompt: UML Diagrams

> **Copy and paste this prompt into ChatGPT, Claude, PlantUML, or Visual Paradigm:**
>
> ```text
> Generate professional UML diagrams (Class Diagram and Sequence Diagram) for "AquaShield AI", a coastal emergency management platform.
> 
> 1. UML Class Diagram Details:
>    - Entities / Data Models:
>      - User (id, email, password, role, is_active, created_at)
>      - Disaster (id, title, type, severity, region, latitude, longitude, is_active)
>      - CommunityReport (id, title, report_type, latitude, longitude, image_url, ai_verified, ai_confidence, is_fake, forensic_details)
>      - MarineRescue (id, species, beach_name, injury_severity, status, ngo_assigned)
>    - Service Classes:
>      - AIService: contains analyze_image_authenticity(), compute_ela(), detect_2d_artwork(), analyze_noise_entropy().
>      - DualStreamForensicNet (inherits from PyTorch nn.Module): contains rgb_stream (EfficientNet-B0), ela_stream (EfficientNet-B0), classifier head, forward(rgb, ela).
>      - RouteService: contains calculate_safe_route(), compute_inundation_risk().
>      - ChatService: contains get_live_context(), process_message().
>    - Relationships: Show associations between User and CommunityReport, CommunityReport and AIService, and AIService and DualStreamForensicNet.
> 
> 2. UML Sequence Diagram Details:
>    - Actors/Lifelines: Citizen Client -> FastAPI ReportsRouter -> AIService -> DualStreamForensicNet -> Async Database -> Emergency Notification Dispatch.
>    - Action: User submits a multipart photo hazard report. Model runs dual-stream RGB + ELA inference. Branches on authentic vs fake result. Authentic commit triggers emergency broadcast; fake commit flags report and rejects alert.
> 
> Format in standard PlantUML syntax or high-resolution vector layout.
> ```

---

## 4. System Block Diagram

### Visual Vector Diagram (SVG)
![System Engineering Block Diagram](diagrams/system_block_diagram.svg)
*Direct SVG File*: [`docs/diagrams/system_block_diagram.svg`](diagrams/system_block_diagram.svg)

### 4.1 System Block Architecture (GitHub Rendered)

```mermaid
graph TB
    subgraph SENSOR_BLOCK [1. SENSORY & TELEMETRY INPUT BLOCK]
        B1[🌊 Oceanographic Moored Buoys]
        B2[📡 IMD / INCOIS Weather Telemetry]
        B3[🛰️ Mobile Device GPS Coordinates]
        B4[📷 Citizen Smartphone Camera]
    end

    subgraph CLIENT_BLOCK [2. CLIENT & PRESENTATION BLOCK]
        C1[💻 HTML5 / CSS3 Responsive Single Page App]
        C2[🗺️ Leaflet.js GIS & Fallback SVG Radar]
        C3[📊 Chart.js Sensor Telemetry Visualizer]
        C4[📱 Service Worker sw.js Offline PWA Engine]
        C5[🚨 Zero-Data sms: Emergency URI Gateway]
    end

    subgraph BACKEND_BLOCK [3. APPLICATION & BACKEND LOGIC BLOCK]
        K1[⚡ FastAPI ASGI High-Performance Server]
        K2[🛡️ Security Middleware: No-Sniff & CORS]
        K3[🛣️ Feature Routers: Disasters, Reports, Marine, Routes, SOS, Chat]
        K4[⚙️ Async SQLAlchemy 2.0 ORM Engine]
    end

    subgraph AI_BLOCK [4. AI & ALGORITHMIC INTELLIGENCE BLOCK]
        A1[🧠 PyTorch DualStreamForensicNet: EfficientNet-B0 RGB + ELA]
        A2[🔍 Error Level Analysis & Noise Entropy Engine]
        A3[🗺️ Elevation Risk-Weighted A* Route Optimizer]
        A4[💬 Context-Aware Disaster Protocol SOP Engine]
    end

    subgraph STORAGE_BLOCK [5. PERSISTENCE & INTEGRATION BLOCK]
        S1[(💾 SQLite / PostgreSQL Database)]
        S2[📁 Encrypted Image & Forensic Upload Store]
        S3[📞 Indian Coast Guard 1554 / NDMA 112 / SMS Network]
        S4[🐬 Regional Marine Wildlife NGO Dispatch Network]
    end

    SENSOR_BLOCK -->|Data Ingestion| CLIENT_BLOCK
    CLIENT_BLOCK -->|REST API Requests / FormData| BACKEND_BLOCK
    BACKEND_BLOCK -->|Inference Calls| AI_BLOCK
    AI_BLOCK -->|Verdicts & Routes| BACKEND_BLOCK
    BACKEND_BLOCK -->|Read / Write| STORAGE_BLOCK
    CLIENT_BLOCK -->|Direct SMS URI| S3
```

---

### 4.2 Ready-to-Use Prompt: Block Diagram

> **Copy and paste this prompt into ChatGPT, Claude, Eraser.io, or Draw.io:**
>
> ```text
> Create an engineering Block Diagram for "AquaShield AI", an AI-powered Coastal Disaster Intelligence and Marine Safety Platform.
> 
> Organize the diagram into 5 distinct, well-labeled functional hardware and software blocks:
> 
> 1. Sensory & Telemetry Ingestion Block:
>    - Oceanographic Buoy IoT Sensors (INCOIS, NDBC)
>    - Meteorological API feeds (IMD, OpenWeather)
>    - Device Hardware Sensors (GPS Geolocation, Camera Sensor)
> 
> 2. Client & Presentation Block (Offline-First Frontend):
>    - Water-Themed HTML5 / Vanilla CSS3 SPA Interface
>    - Leaflet GIS Mapping Engine & Offline SVG Radar Fallback
>    - Chart.js 4.4 Oceanographic Telemetry Visualizer
>    - Service Worker (sw.js) Cache & Web App Manifest
>    - Native `sms:` URI Emergency Gateway
> 
> 3. Application & Backend Logic Block:
>    - FastAPI ASGI High-Performance Application Server
>    - Security Headers Middleware & CORS Handlers
>    - RESTful Feature Routers (Disasters, Reports, Marine, Routes, SOS, Chat)
>    - Async SQLAlchemy 2.0 ORM Controller
> 
> 4. AI & Algorithmic Processing Block:
>    - PyTorch DualStreamForensicNet (RGB EfficientNet-B0 + ELA Stream)
>    - Error Level Analysis (ELA) and Noise Entropy Filter
>    - Risk-Weighted Evacuation Routing Engine (Dijkstra / A*)
>    - Emergency Protocol RAG & SOP Knowledge Engine
> 
> 5. Persistence & External Dispatch Block:
>    - SQLite / PostgreSQL Database
>    - Local File System Storage for Uploaded Incident Scans
>    - Emergency Dispatch Interconnect (Indian Coast Guard 1554, NDMA, 112 SMS)
>    - Marine Wildlife Conservation NGO Dispatch Network
> 
> Show directional data bus and communication arrows between blocks indicating protocols (HTTPS, REST, ORM queries, SMS URI).
> ```
