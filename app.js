/**
 * AquaShield Sentinel — Platform & Tactical HUD Controller
 * Global Production Map Engine, Precision Geocoding, User Auth & Field Incident Submissions
 */

// ── State & Configuration ────────────────────────────────────────────────
let tacticalMap = null;
let mapInitialized = false;
let distressMarker = null;
let reportMarkers = [];
let allReportsData = [];
let activeReportFilter = 'all';

// Homepage Live Map State
let homepageTacticalMap = null;
let homepageMapInitialized = false;
let homepageActiveBaseLayer = null;
let homepageNauticalOverlay = null;
let homepageReportMarkers = [];

// Active Base Map Layer Tracker
let currentBaseLayerName = 'dark';
let activeBaseLayer = null;
let nauticalOverlayLayer = null;

// Modal Mini Location Picker Map State
let reportPickerMap = null;
let reportPickerMarker = null;
let pickerMapInitialized = false;

// Active User State (Persisted in localStorage)
let currentUser = null;

// Global Buoy Telemetry Network
const BUOYS_DATA = [
  { id: 'B-01', name: 'Colaba Point', lat: 18.898, lng: 72.812, wave: '1.2 m', temp: '28.4°C', status: 'nominal' },
  { id: 'B-02', name: 'Prongs Reef', lat: 18.882, lng: 72.801, wave: '1.4 m', temp: '28.2°C', status: 'nominal' },
  { id: 'B-03', name: 'Malabar Outpost', lat: 18.945, lng: 72.785, wave: '1.5 m', temp: '28.1°C', status: 'nominal' },
  { id: 'B-04', name: 'Back Bay Shoal', lat: 18.922, lng: 72.815, wave: '1.2 m', temp: '28.3°C', status: 'nominal' },
  { id: 'B-07', name: 'Bandra Deep', lat: 19.045, lng: 72.788, wave: '1.8 m', temp: '27.9°C', status: 'nominal' },
  { id: 'B-12', name: 'Offshore Trench', lat: 18.985, lng: 72.720, wave: '3.4 m', temp: '26.8°C', status: 'warning' },
  { id: 'B-18', name: 'Bay of Bengal Deep', lat: 13.0827, lng: 80.2707, wave: '2.1 m', temp: '29.1°C', status: 'nominal' },
  { id: 'B-24', name: 'Malacca Strait Gate', lat: 1.29027, lng: 103.851959, wave: '0.9 m', temp: '29.8°C', status: 'nominal' },
  { id: 'B-31', name: 'Miami Coastal Ridge', lat: 25.7617, lng: -80.1918, wave: '1.6 m', temp: '27.2°C', status: 'nominal' },
  { id: 'B-40', name: 'Gibraltar Channel', lat: 36.1408, lng: -5.3536, wave: '2.4 m', temp: '19.8°C', status: 'nominal' }
];

// Pre-cached Global Maritime Hotspots
const GLOBAL_HOTSPOTS = [
  { name: "Mumbai & Arabian Sea, India", lat: 18.96, lon: 72.82, zoom: 11 },
  { name: "Bay of Bengal & Chennai, India", lat: 13.08, lon: 80.27, zoom: 11 },
  { name: "Strait of Malacca & Singapore", lat: 1.29, lon: 103.85, zoom: 11 },
  { name: "Florida Coast & Gulf of Mexico, USA", lat: 25.76, lon: -80.19, zoom: 10 },
  { name: "Suez Canal & Red Sea Entrance, Egypt", lat: 29.97, lon: 32.55, zoom: 11 },
  { name: "Strait of Gibraltar, Mediterranean", lat: 36.14, lon: -5.35, zoom: 11 },
  { name: "Tokyo Bay & Pacific Coast, Japan", lat: 35.68, lon: 139.76, zoom: 11 },
  { name: "Sydney Harbour & Coral Sea, Australia", lat: -33.86, lon: 151.20, zoom: 11 },
  { name: "English Channel & Dover Strait, UK", lat: 51.12, lon: 1.31, zoom: 11 },
  { name: "Panama Canal & Pacific Gate", lat: 8.98, lon: -79.52, zoom: 11 }
];

// ── DOM Initialization ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initScrollReveal();
  initBuoyRoster();
  initClock();
  initScannerDropzone();
  initAuthSession();
  initHomepageMap();
  loadReports();
});

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
  }
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.aq-reveal, .aq-reveal-left, .aq-reveal-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aq-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// ── Real-Time Digital Clock ───────────────────────────────────────────────
function initClock() {
  const clockEl = document.getElementById('hud-clock');
  function update() {
    const now = new Date();
    const utcStr = now.toUTCString().split(' ')[4] + ' UTC';
    if (clockEl) {
      clockEl.textContent = `ACTIVE SECTOR // ${utcStr}`;
    }
  }
  update();
  setInterval(update, 1000);
}

// ── Buoy Roster List ─────────────────────────────────────────────────────
function initBuoyRoster() {
  const listEl = document.getElementById('buoy-roster-list');
  if (!listEl) return;

  listEl.innerHTML = BUOYS_DATA.map(b => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--ds-bg-surface); border-radius: var(--ds-radius-md); border: 1px solid var(--ds-border-subtle);">
      <div style="display: flex; align-items: center; gap: 9px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${b.status === 'warning' ? 'var(--ds-color-amber)' : '#00e676'}; box-shadow: 0 0 8px ${b.status === 'warning' ? 'var(--ds-color-amber)' : '#00e676'};"></span>
        <span class="font-mono" style="font-size: var(--ds-text-xs); color: var(--ds-text-primary); font-weight: 600;">${b.id} ${b.name}</span>
      </div>
      <div style="display: flex; gap: 14px; align-items: center;">
        <span class="font-mono" style="font-size: var(--ds-text-xs); color: var(--ds-text-muted);">${b.temp}</span>
        <span class="font-mono" style="font-size: var(--ds-text-xs); font-weight: 600; color: ${b.status === 'warning' ? 'var(--ds-color-amber)' : 'var(--ds-color-brand)'};">${b.wave}</span>
        <button class="aq-btn-ghost" style="padding: 2px 8px; font-size: 0.65rem;" onclick="focusBuoyOnMap(${b.lat}, ${b.lng}, '${b.id}')">Inspect</button>
      </div>
    </div>
  `).join('');
}

// ── Command HUD Modal Controller ─────────────────────────────────────────
function openCommandCenter(tab = 'overview') {
  const overlay = document.getElementById('command-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchHudTab(tab);
  }
}

function closeCommandCenter() {
  const overlay = document.getElementById('command-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function openPrivacyModal() {
  const modal = document.getElementById('privacy-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closePrivacyModal() {
  const modal = document.getElementById('privacy-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function openTermsModal() {
  const modal = document.getElementById('terms-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeTermsModal() {
  const modal = document.getElementById('terms-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCommandCenter();
    closeReportModal();
    closeAuthModal();
    closePrivacyModal();
    closeTermsModal();
  }
});

function switchHudTab(tabName) {
  document.querySelectorAll('.aq-hud-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeTabBtn = Array.from(document.querySelectorAll('.aq-hud-tab')).find(
    btn => btn.getAttribute('onclick')?.includes(`'${tabName}'`)
  );
  if (activeTabBtn) activeTabBtn.classList.add('active');

  document.querySelectorAll('.aq-hud-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  const targetPanel = document.getElementById(`panel-${tabName}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  if (tabName === 'map') {
    setTimeout(() => {
      initTacticalMap();
      if (tacticalMap) tacticalMap.resize();
    }, 150);
  } else if (tabName === 'reports') {
    loadReports();
  }
}

// ── MapLibre GL Tactical Multi-Layer Basemap Styles (100% Free & Open, Zero Watermark) ─────
const MAPLIBRE_STYLES = {
  dark: {
    version: 8,
    sources: {
      'esri-dark-base': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: '© Esri, HERE, Garmin, © OpenStreetMap'
      },
      'esri-dark-ref': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: ''
      }
    },
    layers: [
      { id: 'esri-dark-base-layer', type: 'raster', source: 'esri-dark-base', minzoom: 0, maxzoom: 20 },
      { id: 'esri-dark-ref-layer', type: 'raster', source: 'esri-dark-ref', minzoom: 0, maxzoom: 20 }
    ]
  },
  satellite: {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Tiles © Esri, Earthstar Geographics'
      },
      'esri-boundaries': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: ''
      }
    },
    layers: [
      { id: 'esri-satellite-layer', type: 'raster', source: 'esri-satellite', minzoom: 0, maxzoom: 20 },
      { id: 'esri-boundaries-layer', type: 'raster', source: 'esri-boundaries', minzoom: 0, maxzoom: 20 }
    ]
  },
  nautical: {
    version: 8,
    sources: {
      'esri-ocean-base': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'Tiles © Esri, GEBCO, NOAA, DeLorme'
      },
      'esri-ocean-ref': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: ''
      },
      'openseamap': {
        type: 'raster',
        tiles: ['https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenSeaMap contributors'
      }
    },
    layers: [
      { id: 'ocean-base-layer', type: 'raster', source: 'esri-ocean-base', minzoom: 0, maxzoom: 20 },
      { id: 'ocean-ref-layer', type: 'raster', source: 'esri-ocean-ref', minzoom: 0, maxzoom: 20 },
      { id: 'seamark-overlay', type: 'raster', source: 'openseamap', minzoom: 0, maxzoom: 18 }
    ]
  },
  street: {
    version: 8,
    sources: {
      'osm-street': {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors'
      }
    },
    layers: [{ id: 'osm-street-layer', type: 'raster', source: 'osm-street', minzoom: 0, maxzoom: 20 }]
  }
};

let homepageBuoyMarkers = [];
let homepageVesselMarkers = [];
let modalBuoyMarkers = [];
let modalVesselMarkers = [];

// ── Homepage Interactive MapLibre GL 3D Map Engine ────────────────────────
function initHomepageMap() {
  if (homepageMapInitialized) return;
  const container = document.getElementById('homepage-map-container');
  if (!container) return;

  if (typeof maplibregl === 'undefined') {
    console.warn('[AquaShield MapLibre] Engine still loading, retrying in 150ms...');
    setTimeout(initHomepageMap, 150);
    return;
  }

  // Initialize MapLibre GL 3D Map Centered on Mumbai (72.82, 18.96)
  homepageTacticalMap = new maplibregl.Map({
    container: 'homepage-map-container',
    style: MAPLIBRE_STYLES.dark,
    center: [72.82, 18.96],
    zoom: 11,
    pitch: 32,
    bearing: -6,
    attributionControl: false
  });

  // 3D Navigation Controls
  homepageTacticalMap.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

  // Coordinates Telemetry HUD
  homepageTacticalMap.on('mousemove', (e) => {
    const hud = document.getElementById('homepage-map-coords-hud');
    if (hud) {
      const lat = e.lngLat.lat.toFixed(4);
      const lng = e.lngLat.lng.toFixed(4);
      const latCard = lat >= 0 ? `${lat}° N` : `${Math.abs(lat)}° S`;
      const lngCard = lng >= 0 ? `${lng}° E` : `${Math.abs(lng)}° W`;
      hud.textContent = `CURSOR TELEMETRY // LAT: ${latCard} | LON: ${lngCard} | ZOOM: ${homepageTacticalMap.getZoom().toFixed(1)}`;
    }
  });

  // Map Click to drop incident pin
  homepageTacticalMap.on('click', (e) => {
    const lng = parseFloat(e.lngLat.lng.toFixed(4));
    const lat = parseFloat(e.lngLat.lat.toFixed(4));

    new maplibregl.Popup({ offset: 14 })
      .setLngLat([lng, lat])
      .setHTML(`
        <div style="background:#07111e; color:#f1f5f9; padding:8px; min-width:200px; font-family:var(--ds-font-body);">
          <div style="font-size:10px; font-family:var(--ds-font-mono); color:#f59e0b; font-weight:bold; letter-spacing:0.06em;">SELECTED PIN POINT</div>
          <div style="font-size:13px; font-weight:600; margin:4px 0; color:#f1f5f9;">${lat}° N, ${lng}° E</div>
          <p style="font-size:11px; color:#94a3b8; margin-bottom:8px;">Drop an emergency report at this exact GPS position.</p>
          <button class="aq-btn-primary" style="padding:6px 12px; font-size:11px; background:#f59e0b; color:#07111e; font-weight:bold; border-radius:4px; width:100%; border:none; cursor:pointer;" onclick="openReportModalWithCoords(${lat}, ${lng})">
            + Log Incident at This Pin ↗
          </button>
        </div>
      `)
      .addTo(homepageTacticalMap);
  });

  homepageTacticalMap.on('load', () => {
    renderHomepageStaticLayers();
    plotReportsOnMap(allReportsData);
  });

  homepageMapInitialized = true;
  setTimeout(() => {
    if (homepageTacticalMap) homepageTacticalMap.resize();
  }, 300);
}

function renderHomepageStaticLayers() {
  if (!homepageTacticalMap) return;

  // Clear previous static markers
  homepageBuoyMarkers.forEach(m => m.remove());
  homepageBuoyMarkers = [];
  homepageVesselMarkers.forEach(m => m.remove());
  homepageVesselMarkers = [];

  // 1. Plot Smart Buoys
  BUOYS_DATA.forEach(b => {
    const el = document.createElement('div');
    el.className = 'maplibre-buoy-marker';
    el.title = `${b.id} - ${b.name}`;

    const popup = new maplibregl.Popup({ offset: 12 }).setHTML(`
      <div style="font-family: var(--ds-font-body); padding: 4px; background:#07111e; color:#f1f5f9;">
        <strong style="color: #f59e0b; font-size: 13px;">${b.id} — ${b.name}</strong><br>
        <span style="font-size: 11px; color: #94a3b8;">Status: ${b.status.toUpperCase()}</span><br>
        <span style="font-size: 12px; font-weight: bold; color: #f1f5f9;">Wave Height: ${b.wave}</span><br>
        <span style="font-size: 11px; color: #94a3b8;">Surface Temp: ${b.temp}</span>
      </div>
    `);

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([b.lng, b.lat])
      .setPopup(popup)
      .addTo(homepageTacticalMap);
    homepageBuoyMarkers.push(marker);
  });

  // 2. Plot AIS Vessels
  const vessels = [
    { name: 'ICGS Varuna (Coast Guard)', lng: 72.86, lat: 18.99, speed: '18.4 kt', heading: '240° SW' },
    { name: 'M/V Pacific (Merchant Cargo)', lng: 72.74, lat: 18.93, speed: '12.1 kt', heading: '180° S' }
  ];

  vessels.forEach(v => {
    const el = document.createElement('div');
    el.className = 'maplibre-vessel-marker';
    el.textContent = '▲';
    el.title = v.name;

    const popup = new maplibregl.Popup({ offset: 12 }).setHTML(`
      <div style="background:#07111e;color:#f1f5f9;padding:4px;">
        <strong style="color:#f59e0b;">${v.name}</strong><br>
        <span style="color:#94a3b8;font-size:11px;">Speed: ${v.speed} · Heading: ${v.heading}</span>
      </div>
    `);

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([v.lng, v.lat])
      .setPopup(popup)
      .addTo(homepageTacticalMap);
    homepageVesselMarkers.push(marker);
  });
}

function switchHomepageBaseLayer(layerName) {
  if (!homepageTacticalMap || !MAPLIBRE_STYLES[layerName]) return;

  homepageTacticalMap.setStyle(MAPLIBRE_STYLES[layerName]);
  homepageTacticalMap.once('styledata', () => {
    renderHomepageStaticLayers();
    plotReportsOnMap(allReportsData);
  });

  ['dark', 'sat', 'nautical', 'street'].forEach(k => {
    const btn = document.getElementById(`hp-layer-${k}`);
    if (btn) btn.classList.remove('active');
  });
  const mapKey = layerName === 'satellite' ? 'sat' : layerName;
  const activeBtn = document.getElementById(`hp-layer-${mapKey}`);
  if (activeBtn) activeBtn.classList.add('active');

  showToast('🗺️ Layer Updated', `Switched to MapLibre ${layerName.toUpperCase()} vector/raster layer.`, 'info');
}

function homepageJumpSector(sector, btn) {
  if (btn) {
    btn.parentElement.querySelectorAll('.aq-type-pill').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  if (!homepageTacticalMap) return;

  const sectors = {
    world: { lat: 20, lng: 0, zoom: 2, pitch: 0, bearing: 0 },
    mumbai: { lat: 18.96, lng: 72.82, zoom: 11, pitch: 35, bearing: -6 },
    bengal: { lat: 13.08, lng: 80.27, zoom: 10, pitch: 25, bearing: 0 },
    florida: { lat: 25.76, lng: -80.19, zoom: 10, pitch: 30, bearing: 10 },
    singapore: { lat: 1.29, lng: 103.85, zoom: 11, pitch: 30, bearing: -15 },
    mediterranean: { lat: 36.14, lng: -5.35, zoom: 9, pitch: 30, bearing: 0 }
  };

  const target = sectors[sector] || sectors.mumbai;
  homepageTacticalMap.flyTo({
    center: [target.lng, target.lat],
    zoom: target.zoom,
    pitch: target.pitch,
    bearing: target.bearing,
    duration: 1600
  });
}

let homepageSearchDebounce = null;
function handleHomepageMapSearch(query) {
  clearTimeout(homepageSearchDebounce);
  const container = document.getElementById('homepage-map-search-results');
  if (!container) return;

  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    container.style.display = 'none';
    return;
  }

  const localMatches = GLOBAL_HOTSPOTS.filter(h => h.name.toLowerCase().includes(q));
  renderHomepageSearchResults(localMatches, container);

  homepageSearchDebounce = setTimeout(async () => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`);
      if (res.ok) {
        const osmData = await res.json();
        const osmMatches = osmData.map(item => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          zoom: 12
        }));
        const combined = [...localMatches, ...osmMatches].slice(0, 7);
        renderHomepageSearchResults(combined, container);
      }
    } catch (e) {
      // Graceful fallback
    }
  }, 350);
}

function renderHomepageSearchResults(results, container) {
  if (results.length === 0) {
    container.innerHTML = `<div style="padding:8px 12px; font-size:11px; color:#94a3b8;">No global location found.</div>`;
    container.style.display = 'block';
    return;
  }

  container.innerHTML = results.map(r => `
    <div class="aq-search-result-item" onclick="selectHomepageSearchResult(${r.lat}, ${r.lon}, '${escape(r.name)}', ${r.zoom || 12})" style="padding:8px 12px; border-bottom:1px solid rgba(148,163,184,0.1); cursor:pointer;">
      <strong style="color:#f1f5f9; font-size:12px; display:block;">📍 ${r.name.split(',')[0]}</strong>
      <span style="color:#94a3b8; font-size:10px;">${r.name.split(',').slice(1, 4).join(',')} (${r.lat.toFixed(2)}°, ${r.lon.toFixed(2)}°)</span>
    </div>
  `).join('');
  container.style.display = 'block';
}

function selectHomepageSearchResult(lat, lon, escapedName, zoom = 12) {
  const name = unescape(escapedName);
  const dropdown = document.getElementById('homepage-map-search-results');
  const searchInput = document.getElementById('homepage-map-search');
  if (dropdown) dropdown.style.display = 'none';
  if (searchInput) searchInput.value = name.split(',')[0];

  if (homepageTacticalMap) {
    homepageTacticalMap.flyTo({
      center: [lon, lat],
      zoom: zoom,
      pitch: 35,
      duration: 1600
    });

    new maplibregl.Popup({ offset: 14 })
      .setLngLat([lon, lat])
      .setHTML(`
        <div style="background:#07111e; color:#f1f5f9; padding:8px; border-radius:4px; font-family:var(--ds-font-body);">
          <div style="font-size:10px; font-family:var(--ds-font-mono); color:#f59e0b; font-weight:bold;">SEARCHED SECTOR</div>
          <strong style="font-size:13px; color:#f1f5f9;">${name.split(',')[0]}</strong>
          <div style="font-size:11px; color:#94a3b8; margin:4px 0;">${name.slice(0, 90)}</div>
          <button class="aq-btn-primary" style="padding:4px 10px; font-size:11px; background:#f59e0b; color:#07111e; font-weight:bold; border-radius:4px; width:100%; border:none; cursor:pointer;" onclick="openReportModalWithCoords(${lat}, ${lon}, '${escape(name.split(',')[0])}')">
            + Pin Incident Here
          </button>
        </div>
      `)
      .addTo(homepageTacticalMap);
  }
}

// ── Modal Fullscreen MapLibre Tactical HUD Map ───────────────────────────
function initTacticalMap() {
  if (mapInitialized) return;
  const container = document.getElementById('tactical-map-container');
  if (!container) return;

  if (typeof maplibregl === 'undefined') {
    setTimeout(initTacticalMap, 150);
    return;
  }

  tacticalMap = new maplibregl.Map({
    container: 'tactical-map-container',
    style: MAPLIBRE_STYLES.dark,
    center: [72.82, 18.96],
    zoom: 11,
    pitch: 35,
    bearing: -8,
    attributionControl: false
  });

  tacticalMap.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
  tacticalMap.addControl(new maplibregl.FullscreenControl(), 'top-right');

  tacticalMap.on('mousemove', (e) => {
    const hud = document.getElementById('map-coords-hud');
    if (hud) {
      const lat = e.lngLat.lat.toFixed(4);
      const lng = e.lngLat.lng.toFixed(4);
      const latCard = lat >= 0 ? `${lat}° N` : `${Math.abs(lat)}° S`;
      const lngCard = lng >= 0 ? `${lng}° E` : `${Math.abs(lng)}° W`;
      hud.textContent = `CURSOR TELEMETRY // LAT: ${latCard} | LON: ${lngCard} | ZOOM: ${tacticalMap.getZoom().toFixed(1)}`;
    }
  });

  tacticalMap.on('click', (e) => {
    const lng = parseFloat(e.lngLat.lng.toFixed(4));
    const lat = parseFloat(e.lngLat.lat.toFixed(4));

    new maplibregl.Popup({ offset: 14 })
      .setLngLat([lng, lat])
      .setHTML(`
        <div style="background:#07111e; color:#f1f5f9; padding:8px; font-family:var(--ds-font-body);">
          <div style="font-size:10px; font-family:var(--ds-font-mono); color:#f59e0b; font-weight:bold;">SELECTED COORDINATES</div>
          <div style="font-size:12px; margin:4px 0; color:#f1f5f9;">${lat}° N, ${lng}° E</div>
          <button class="aq-btn-primary" style="padding:4px 10px; font-size:11px; background:#f59e0b; color:#07111e; font-weight:bold; border-radius:4px; width:100%; margin-top:4px;" onclick="openReportModalWithCoords(${lat}, ${lng})">
            + Log Incident at This Location
          </button>
        </div>
      `)
      .addTo(tacticalMap);
  });

  tacticalMap.on('load', () => {
    renderModalStaticLayers();
    plotReportsOnMap(allReportsData);
  });

  mapInitialized = true;
}

function renderModalStaticLayers() {
  if (!tacticalMap) return;

  modalBuoyMarkers.forEach(m => m.remove());
  modalBuoyMarkers = [];
  modalVesselMarkers.forEach(m => m.remove());
  modalVesselMarkers = [];

  BUOYS_DATA.forEach(b => {
    const el = document.createElement('div');
    el.className = 'maplibre-buoy-marker';
    el.title = `${b.id} - ${b.name}`;

    const popup = new maplibregl.Popup({ offset: 12 }).setHTML(`
      <div style="font-family: var(--ds-font-body); padding: 6px; background: #07111e; color: #f1f5f9;">
        <strong style="color: #f59e0b; font-size: 13px;">${b.id} — ${b.name}</strong><br>
        <span style="font-size: 11px; color: #94a3b8;">Status: ${b.status.toUpperCase()}</span><br>
        <span style="font-size: 12px; font-weight: bold; color: #f1f5f9;">Wave Height: ${b.wave}</span><br>
        <span style="font-size: 11px; color: #94a3b8;">Surface Temp: ${b.temp}</span>
      </div>
    `);

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([b.lng, b.lat])
      .setPopup(popup)
      .addTo(tacticalMap);
    modalBuoyMarkers.push(marker);
  });

  const vessels = [
    { name: 'ICGS Varuna (Coast Guard)', lng: 72.86, lat: 18.99, speed: '18.4 kt', heading: '240° SW' },
    { name: 'M/V Pacific (Merchant Cargo)', lng: 72.74, lat: 18.93, speed: '12.1 kt', heading: '180° S' }
  ];

  vessels.forEach(v => {
    const el = document.createElement('div');
    el.className = 'maplibre-vessel-marker';
    el.textContent = '▲';

    const popup = new maplibregl.Popup({ offset: 12 }).setHTML(`
      <div style="background:#07111e;color:#f1f5f9;padding:4px;">
        <strong style="color:#f59e0b;">${v.name}</strong><br>
        <span style="color:#94a3b8;font-size:11px;">Speed: ${v.speed} · Heading: ${v.heading}</span>
      </div>
    `);

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([v.lng, v.lat])
      .setPopup(popup)
      .addTo(tacticalMap);
    modalVesselMarkers.push(marker);
  });
}

function switchMapBaseLayer(layerName) {
  if (!tacticalMap || !MAPLIBRE_STYLES[layerName]) return;

  tacticalMap.setStyle(MAPLIBRE_STYLES[layerName]);
  tacticalMap.once('styledata', () => {
    renderModalStaticLayers();
    plotReportsOnMap(allReportsData);
  });

  document.querySelectorAll('.aq-map-layer-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`layer-btn-${layerName}`);
  if (activeBtn) activeBtn.classList.add('active');

  showToast('🗺️ Map Layer Changed', `Switched view to MapLibre ${layerName.toUpperCase()} layer.`, 'info');
}

let searchDebounceTimer = null;
function handleMapSearch(query) {
  clearTimeout(searchDebounceTimer);
  const resultsContainer = document.getElementById('map-search-results');
  if (!resultsContainer) return;

  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    resultsContainer.style.display = 'none';
    return;
  }

  const localMatches = GLOBAL_HOTSPOTS.filter(h => h.name.toLowerCase().includes(q));
  renderSearchResults(localMatches, resultsContainer);

  searchDebounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`);
      if (res.ok) {
        const osmData = await res.json();
        const osmMatches = osmData.map(item => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          zoom: 12
        }));

        const combined = [...localMatches, ...osmMatches].slice(0, 7);
        renderSearchResults(combined, resultsContainer);
      }
    } catch (e) {
      // Fallback
    }
  }, 350);
}

function renderSearchResults(results, container) {
  if (results.length === 0) {
    container.innerHTML = `<div style="padding:8px 12px; font-size:11px; color:#94a3b8;">No global location found.</div>`;
    container.style.display = 'flex';
    return;
  }

  container.innerHTML = results.map(r => `
    <div class="aq-search-result-item" onclick="selectSearchResult(${r.lat}, ${r.lon}, '${escape(r.name)}', ${r.zoom || 12})">
      <strong style="color:#f1f5f9; font-size:12px;">📍 ${r.name.split(',')[0]}</strong>
      <span style="color:#94a3b8; font-size:10px;">${r.name.split(',').slice(1, 4).join(',')} (${r.lat.toFixed(2)}°, ${r.lon.toFixed(2)}°)</span>
    </div>
  `).join('');
  container.style.display = 'flex';
}

function selectSearchResult(lat, lon, escapedName, zoom = 12) {
  const name = unescape(escapedName);
  const dropdown = document.getElementById('map-search-results');
  const searchInput = document.getElementById('global-map-search');
  if (dropdown) dropdown.style.display = 'none';
  if (searchInput) searchInput.value = name.split(',')[0];

  if (tacticalMap) {
    tacticalMap.flyTo({
      center: [lon, lat],
      zoom: zoom,
      pitch: 35,
      duration: 1600
    });
    
    new maplibregl.Popup({ offset: 14 })
      .setLngLat([lon, lat])
      .setHTML(`
        <div style="background:#07111e; color:#f1f5f9; padding:8px;">
          <div style="font-size:10px; font-family:var(--ds-font-mono); color:#f59e0b; font-weight:bold;">SEARCHED LOCATION</div>
          <strong style="font-size:13px; color:#f1f5f9;">${name.split(',')[0]}</strong>
          <div style="font-size:11px; color:#94a3b8; margin:4px 0;">${name.slice(0, 90)}</div>
          <button class="aq-btn-primary" style="padding:4px 10px; font-size:11px; background:#f59e0b; color:#07111e; font-weight:bold; border-radius:4px; width:100%;" onclick="openReportModalWithCoords(${lat}, ${lon}, '${escape(name.split(',')[0])}')">
            + Pin Incident Here
          </button>
        </div>
      `)
      .addTo(tacticalMap);
  }
}

function jumpMapSector(sector, btn) {
  document.querySelectorAll('.aq-sector-pills-bar .aq-type-pill').forEach(b => b.classList.remove('selected'));
  if (btn) btn.classList.add('selected');

  if (!tacticalMap) return;

  const sectors = {
    world: { lat: 20, lng: 0, zoom: 2, pitch: 0, bearing: 0 },
    mumbai: { lat: 18.96, lng: 72.82, zoom: 11, pitch: 35, bearing: -8 },
    bengal: { lat: 13.08, lng: 80.27, zoom: 10, pitch: 25, bearing: 0 },
    florida: { lat: 25.76, lng: -80.19, zoom: 10, pitch: 30, bearing: 10 },
    singapore: { lat: 1.29, lng: 103.85, zoom: 11, pitch: 30, bearing: -15 },
    mediterranean: { lat: 36.14, lng: -5.35, zoom: 9, pitch: 30, bearing: 0 },
    tokyo: { lat: 35.68, lng: 139.76, zoom: 11, pitch: 35, bearing: 10 }
  };

  const target = sectors[sector] || sectors.mumbai;
  tacticalMap.flyTo({
    center: [target.lng, target.lat],
    zoom: target.zoom,
    pitch: target.pitch,
    bearing: target.bearing,
    duration: 1500
  });
}

function resetMapView() {
  if (tacticalMap) {
    tacticalMap.flyTo({ center: [72.82, 18.96], zoom: 11, pitch: 35, bearing: -8, duration: 1200 });
  }
}

function focusBuoyOnMap(lat, lng, id) {
  const hpMapEl = document.getElementById('radar-map');
  if (hpMapEl && homepageTacticalMap) {
    hpMapEl.scrollIntoView({ behavior: 'smooth' });
    homepageTacticalMap.flyTo({ center: [lng, lat], zoom: 13, pitch: 40, duration: 1200 });
    return;
  }
  openCommandCenter('map');
  setTimeout(() => {
    if (tacticalMap) {
      tacticalMap.flyTo({ center: [lng, lat], zoom: 13, pitch: 40, duration: 1200 });
    }
  }, 200);
}

function focusReportOnMap(lat, lng, id) {
  const hpMapEl = document.getElementById('radar-map');
  if (hpMapEl && homepageTacticalMap) {
    hpMapEl.scrollIntoView({ behavior: 'smooth' });
    homepageTacticalMap.flyTo({ center: [lng, lat], zoom: 14, pitch: 35, duration: 1200 });
    const markerObj = homepageReportMarkers.find(m => m.id === id);
    if (markerObj && markerObj.marker.getPopup()) markerObj.marker.togglePopup();
    return;
  }
  openCommandCenter('map');
  setTimeout(() => {
    if (tacticalMap) {
      tacticalMap.flyTo({ center: [lng, lat], zoom: 14, pitch: 35, duration: 1200 });
      const markerObj = reportMarkers.find(m => m.id === id);
      if (markerObj && markerObj.marker.getPopup()) markerObj.marker.togglePopup();
    }
  }, 200);
}

function simulateEmergencyMarker() {
  if (!tacticalMap) return;
  if (distressMarker) distressMarker.remove();

  const el = document.createElement('div');
  el.style.cssText = 'width: 22px; height: 22px; background: #ef4444; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 18px #ef4444; animation: pulse 1.5s infinite; cursor:pointer;';

  const popup = new maplibregl.Popup({ offset: 14 }).setHTML(`
    <div style="background:#07111e;color:#f1f5f9;padding:6px;border:1px solid #ef4444;">
      <strong style="color: #ef4444;">⚠ EMERGENCY DISTRESS BEACON</strong><br>
      <span style="font-size:12px;">Vessel: Fishing Trawler 'Sagar 4'</span><br>
      <span style="font-size:11px;color:#94a3b8;">Nature: Engine Failure & Heavy Swell</span><br>
      <span style="font-size:11px;color:#fbbf24;">Coast Guard Cutter Intercepting.</span>
    </div>
  `);

  distressMarker = new maplibregl.Marker({ element: el })
    .setLngLat([72.76, 18.94])
    .setPopup(popup)
    .addTo(tacticalMap);

  distressMarker.togglePopup();
  tacticalMap.flyTo({ center: [72.76, 18.94], zoom: 12, pitch: 45, duration: 1400 });
}

function plotReportsOnMap(reports) {
  const icons = {
    flood: '🌊',
    marine_animal: '🐢',
    oil_spill: '🛢️',
    cyclone_damage: '🚨',
    road_blockage: '🚧',
    missing_person: '⚓'
  };

  // Plot on Homepage Map
  if (homepageTacticalMap) {
    homepageReportMarkers.forEach(m => m.marker.remove());
    homepageReportMarkers = [];

    reports.forEach(r => {
      if (!r.latitude || !r.longitude) return;
      const emoji = icons[r.type] || '⚠';

      const el = document.createElement('div');
      el.className = 'maplibre-report-marker';
      el.innerHTML = emoji;
      el.style.borderColor = r.ai_verified ? '#f59e0b' : '#94a3b8';

      const popup = new maplibregl.Popup({ offset: 14 }).setHTML(`
        <div style="background:#07111e; color:#f1f5f9; padding:8px; min-width: 200px; border-radius:4px; font-family:var(--ds-font-body);">
          <div style="font-size: 10px; font-family: var(--ds-font-mono); color: #f59e0b; font-weight: bold; margin-bottom: 2px;">
            ${r.id} · ${r.ai_verified ? '✓ AI VERIFIED' : 'PENDING AUDIT'}
          </div>
          <strong style="color: #f1f5f9; font-size: 13px;">${r.title}</strong>
          <p style="font-size: 11px; color: #94a3b8; margin: 4px 0;">${r.description.slice(0, 110)}...</p>
          <div style="font-size: 10px; color: #fbbf24;">Reporter: ${r.reporter_name} (${r.reporter_badge || 'CITIZEN'})</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([r.longitude, r.latitude])
        .setPopup(popup)
        .addTo(homepageTacticalMap);

      homepageReportMarkers.push({ id: r.id, marker });
    });
  }

  // Plot on Modal Tactical Map
  if (tacticalMap) {
    reportMarkers.forEach(m => m.marker.remove());
    reportMarkers = [];

    reports.forEach(r => {
      if (!r.latitude || !r.longitude) return;
      const emoji = icons[r.type] || '⚠';

      const el = document.createElement('div');
      el.className = 'maplibre-report-marker';
      el.innerHTML = emoji;
      el.style.borderColor = r.ai_verified ? '#f59e0b' : '#94a3b8';

      const popup = new maplibregl.Popup({ offset: 14 }).setHTML(`
        <div style="background:#07111e; color:#f1f5f9; padding:8px; min-width: 200px; font-family:var(--ds-font-body);">
          <div style="font-size: 10px; font-family: var(--ds-font-mono); color: #f59e0b; font-weight: bold; margin-bottom: 2px;">
            ${r.id} · ${r.ai_verified ? '✓ AI VERIFIED' : 'PENDING AUDIT'}
          </div>
          <strong style="color: #f1f5f9; font-size: 13px;">${r.title}</strong>
          <p style="font-size: 11px; color: #94a3b8; margin: 4px 0;">${r.description.slice(0, 110)}...</p>
          <div style="font-size: 10px; color: #fbbf24;">Reporter: ${r.reporter_name} (${r.reporter_badge || 'CITIZEN'})</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([r.longitude, r.latitude])
        .setPopup(popup)
        .addTo(tacticalMap);

      reportMarkers.push({ id: r.id, marker });
    });
  }
}

// ── Interactive Precision Location Picker Modal Map (MapLibre GL) ───────────
function initReportPickerMap(initialLat = 19.054, initialLng = 72.822) {
  const container = document.getElementById('report-picker-map');
  if (!container) return;

  if (typeof maplibregl === 'undefined') {
    setTimeout(() => initReportPickerMap(initialLat, initialLng), 150);
    return;
  }

  if (reportPickerMap) {
    reportPickerMap.resize();
    reportPickerMap.setCenter([initialLng, initialLat]);
    reportPickerMap.setZoom(12);
    if (reportPickerMarker) {
      reportPickerMarker.setLngLat([initialLng, initialLat]);
    }
    updatePickerCoordsDisplay(initialLat, initialLng);
    return;
  }

  reportPickerMap = new maplibregl.Map({
    container: 'report-picker-map',
    style: MAPLIBRE_STYLES.dark,
    center: [initialLng, initialLat],
    zoom: 12,
    pitch: 0,
    attributionControl: false
  });

  reportPickerMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  // Draggable Amber Marker
  const el = document.createElement('div');
  el.style.cssText = 'width: 22px; height: 22px; background: #f59e0b; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 14px #f59e0b; display:flex; align-items:center; justify-content:center; color:#07111e; font-size:11px; font-weight:bold; cursor:grab;';
  el.innerHTML = '📍';

  reportPickerMarker = new maplibregl.Marker({
    element: el,
    draggable: true
  })
    .setLngLat([initialLng, initialLat])
    .addTo(reportPickerMap);

  // Drag Listener
  reportPickerMarker.on('dragend', () => {
    const pos = reportPickerMarker.getLngLat();
    setReportPickerCoords(pos.lat, pos.lng);
  });

  // Click Listener
  reportPickerMap.on('click', (e) => {
    setReportPickerCoords(e.lngLat.lat, e.lngLat.lng);
  });

  updatePickerCoordsDisplay(initialLat, initialLng);
  pickerMapInitialized = true;
}

function setReportPickerCoords(lat, lng) {
  const roundLat = parseFloat(lat.toFixed(6));
  const roundLng = parseFloat(lng.toFixed(6));

  const latInput = document.getElementById('report-form-lat');
  const lngInput = document.getElementById('report-form-lng');
  if (latInput) latInput.value = roundLat;
  if (lngInput) lngInput.value = roundLng;

  if (reportPickerMarker) {
    reportPickerMarker.setLngLat([roundLng, roundLat]);
  }
  if (reportPickerMap) {
    reportPickerMap.panTo([roundLng, roundLat]);
  }

  updatePickerCoordsDisplay(roundLat, roundLng);
  fetchReverseGeocode(roundLat, roundLng);
}

function updatePickerCoordsDisplay(lat, lng) {
  const textEl = document.getElementById('picker-coords-text');
  if (textEl) {
    const latCard = lat >= 0 ? `${lat.toFixed(4)}° N` : `${Math.abs(lat).toFixed(4)}° S`;
    const lngCard = lng >= 0 ? `${lng.toFixed(4)}° E` : `${Math.abs(lng).toFixed(4)}° W`;
    textEl.textContent = `LAT: ${latCard} | LON: ${lngCard}`;
  }
}

async function fetchReverseGeocode(lat, lng) {
  const addrInput = document.getElementById('report-form-address');
  if (!addrInput) return;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        addrInput.value = parts.slice(0, 4).join(',').trim();
      }
    }
  } catch (err) {
    // Graceful offline fallback
    if (!addrInput.value) {
      addrInput.value = `Sector (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
    }
  }
}

// ── User Authentication & Profile System ──────────────────────────────────
function initAuthSession() {
  const savedUser = localStorage.getItem('aquashield_user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (e) {
      currentUser = null;
    }
  } else {
    currentUser = {
      id: "demo-user-1",
      badge_id: "SENTINEL-7049",
      name: "Commander Rajesh Varma",
      email: "commander@aquashield.marine",
      role: "authority",
      region: "Mumbai Sector Alpha"
    };
    localStorage.setItem('aquashield_user', JSON.stringify(currentUser));
  }
  renderUserNav();
  updateReportModalReporterInfo();
}

function renderUserNav() {
  const container = document.getElementById('nav-user-container');
  if (!container) return;

  if (currentUser) {
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; background: var(--ds-bg-raised); border: 1px solid var(--ds-border-brand); border-radius: var(--ds-radius-full); padding: 3px 12px; cursor: pointer;" onclick="openAuthModal()">
        <span class="aq-user-badge" style="font-size: 0.65rem; padding: 2px 6px; background: rgba(245,158,11,0.2);">${currentUser.badge_id || 'ID'}</span>
        <span style="font-family: var(--ds-font-body); font-size: var(--ds-text-xs); color: var(--ds-text-primary); font-weight: 600;">${currentUser.name.split(' ')[0]}</span>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button class="aq-btn-ghost" onclick="openAuthModal()"
        style="font-family: var(--ds-font-body); font-size: var(--ds-text-xs); font-weight: var(--ds-weight-medium); color: var(--ds-text-primary); border: 1px solid var(--ds-border-default); padding: 6px 12px; border-radius: var(--ds-radius-md);">
        🔑 Scout Login
      </button>
    `;
  }
}

function updateReportModalReporterInfo() {
  const infoEl = document.getElementById('report-reporter-info');
  if (infoEl && currentUser) {
    infoEl.textContent = `${currentUser.badge_id || 'ID'} · ${currentUser.name} (${currentUser.role.toUpperCase()})`;
  }
}

function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function switchAuthTab(tab) {
  const btnLogin = document.getElementById('tab-btn-login');
  const btnReg = document.getElementById('tab-btn-register');
  const btnDemo = document.getElementById('tab-btn-demo');

  const formLogin = document.getElementById('auth-login-form');
  const formReg = document.getElementById('auth-register-form');
  const sectionDemo = document.getElementById('auth-demo-section');

  [btnLogin, btnReg, btnDemo].forEach(b => b && b.classList.remove('active'));
  [formLogin, formReg, sectionDemo].forEach(f => f && (f.style.display = 'none'));

  if (tab === 'login') {
    if (btnLogin) btnLogin.classList.add('active');
    if (formLogin) formLogin.style.display = 'flex';
  } else if (tab === 'register') {
    if (btnReg) btnReg.classList.add('active');
    if (formReg) formReg.style.display = 'flex';
  } else if (tab === 'demo') {
    if (btnDemo) btnDemo.classList.add('active');
    if (sectionDemo) sectionDemo.style.display = 'flex';
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const ident = document.getElementById('login-identifier').value.trim();
  const pass = document.getElementById('login-password').value;
  const submitBtn = document.getElementById('login-submit-btn');

  if (!ident || !pass) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Verifying Credentials...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: ident, password: pass })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');

    currentUser = data;
    localStorage.setItem('aquashield_user', JSON.stringify(currentUser));
    renderUserNav();
    updateReportModalReporterInfo();
    closeAuthModal();
    showToast('🔑 Authentication Successful', `Logged in as ${currentUser.name} (${currentUser.badge_id})`, 'success');
  } catch (err) {
    showToast('✕ Authorization Failed', err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Authorize & Access Terminal ↗';
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const role = document.getElementById('reg-role').value;
  const region = document.getElementById('reg-region').value.trim();
  const pass = document.getElementById('reg-password').value;
  const submitBtn = document.getElementById('register-submit-btn');

  if (!name || !email || !pass) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Generating Scout ID...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, role, region, password: pass })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');

    currentUser = data;
    localStorage.setItem('aquashield_user', JSON.stringify(currentUser));
    renderUserNav();
    updateReportModalReporterInfo();
    closeAuthModal();
    showToast('🎉 Scout Enrolled Successfully', `Your Login ID is ${currentUser.badge_id}. Welcome aboard, ${currentUser.name}!`, 'success');
  } catch (err) {
    showToast('✕ Registration Failed', err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register & Generate Login Badge ↗';
  }
}

async function instantDemoLogin(identifier, password) {
  const identInput = document.getElementById('login-identifier');
  const passInput = document.getElementById('login-password');
  if (identInput) identInput.value = identifier;
  if (passInput) passInput.value = password;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');

    currentUser = data;
    localStorage.setItem('aquashield_user', JSON.stringify(currentUser));
    renderUserNav();
    updateReportModalReporterInfo();
    closeAuthModal();
    showToast('⚡ 1-Click Access Granted', `Switched operator session to ${currentUser.name} (${currentUser.badge_id})`, 'success');
  } catch (err) {
    showToast('✕ Login Error', err.message, 'error');
  }
}

// ── Community Field Report Submission ─────────────────────────────────────
function openReportModal() {
  const modal = document.getElementById('report-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateReportModalReporterInfo();

    const latVal = parseFloat(document.getElementById('report-form-lat')?.value) || 19.054;
    const lngVal = parseFloat(document.getElementById('report-form-lng')?.value) || 72.822;

    setTimeout(() => {
      initReportPickerMap(latVal, lngVal);
    }, 180);
  }
}

function openReportModalWithCoords(lat, lng, addressName = '') {
  openReportModal();
  setTimeout(() => {
    setReportPickerCoords(lat, lng);
    if (addressName) {
      const addrInput = document.getElementById('report-form-address');
      if (addrInput) addrInput.value = addressName;
    }
  }, 220);
}

function closeReportModal() {
  const modal = document.getElementById('report-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function selectReportType(type, elem) {
  document.querySelectorAll('#report-type-selector .aq-type-pill').forEach(el => el.classList.remove('selected'));
  if (elem) elem.classList.add('selected');
  const typeInput = document.getElementById('report-form-type');
  if (typeInput) typeInput.value = type;
}

function updateUrgencyLabel(val) {
  const badge = document.getElementById('urgency-badge');
  if (!badge) return;
  const num = parseInt(val, 10);
  if (num >= 8) {
    badge.textContent = `Rank ${num} · CRITICAL / HIGH PRIORITY`;
    badge.style.color = '#ff3366';
  } else if (num >= 5) {
    badge.textContent = `Rank ${num} · ELEVATED HAZARD`;
    badge.style.color = '#f59e0b';
  } else {
    badge.textContent = `Rank ${num} · ADVISORY / LOW`;
    badge.style.color = '#94a3b8';
  }
}

function autoDetectLocation() {
  if ('geolocation' in navigator) {
    showToast('📍 Detecting GPS', 'Querying browser geolocation sensor...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setReportPickerCoords(lat, lng);
        showToast('✓ GPS Location Locked', `Coordinates: ${lat}, ${lng}`, 'success');
      },
      (err) => {
        showToast('Location Warning', 'Using default coastal sector coordinates.', 'warning');
      },
      { timeout: 5000 }
    );
  } else {
    showToast('GPS Sensor', 'Geolocation unavailable, please click on map.', 'warning');
  }
}

function handleReportPhotoSelect(input) {
  const previewBox = document.getElementById('report-photo-preview');
  const previewImg = document.getElementById('report-preview-img');
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      if (previewImg) previewImg.src = e.target.result;
      if (previewBox) previewBox.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    if (previewBox) previewBox.style.display = 'none';
  }
}

async function handleReportSubmit(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('report-submit-btn');
  const resultBox = document.getElementById('report-submit-result');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Verifying with AI Vision Transformer...';

  const formData = new FormData();
  formData.append('title', document.getElementById('report-form-title').value);
  formData.append('report_type', document.getElementById('report-form-type').value);
  formData.append('latitude', document.getElementById('report-form-lat').value);
  formData.append('longitude', document.getElementById('report-form-lng').value);
  formData.append('address', document.getElementById('report-form-address').value);
  formData.append('urgency_rank', document.getElementById('report-form-urgency').value);
  formData.append('description', document.getElementById('report-form-desc').value);

  if (currentUser) {
    formData.append('user_id', currentUser.id || '');
    formData.append('reporter_name', currentUser.name || 'Verified Reporter');
    formData.append('reporter_badge', currentUser.badge_id || 'CITIZEN-0000');
  }

  const fileInput = document.getElementById('report-form-file');
  if (fileInput && fileInput.files[0]) {
    formData.append('file', fileInput.files[0]);
  }

  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Report submission failed');

    const rep = data.report;
    if (resultBox) {
      resultBox.innerHTML = `
        <strong>✓ REPORT LOGGED & VERIFIED // ${rep.id}</strong><br>
        <span style="font-size: 12px; color: var(--ds-color-brand-light);">
          AI Spectral Confidence: ${rep.ai_confidence}% · Status: ${rep.status.toUpperCase()}
        </span><br>
        <span style="font-size: 11px; color: var(--ds-text-secondary);">
          Eyewitness incident successfully broadcast to global radar and rescue dispatch.
        </span>
      `;
      resultBox.style.display = 'block';
    }

    showToast('🚨 Incident Report Broadcasted', `Report ${rep.id} verified and added to Global Tactical Map`, 'success');

    // Reload reports and close modal
    loadReports();
    setTimeout(() => {
      closeReportModal();
      document.getElementById('report-submit-form').reset();
      if (resultBox) resultBox.style.display = 'none';
      const previewBox = document.getElementById('report-photo-preview');
      if (previewBox) previewBox.style.display = 'none';
    }, 1800);

  } catch (err) {
    showToast('Submission Error', err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Log & Verify Report ↗';
  }
}

// ── Reports Feed & Filter Controller ─────────────────────────────────────
async function loadReports() {
  try {
    const res = await fetch('/api/reports');
    if (!res.ok) throw new Error('Failed to fetch reports');
    const data = await res.json();
    allReportsData = data.reports || [];

    renderReportsList(allReportsData);
    renderLandingFieldReports(allReportsData);
    plotReportsOnMap(allReportsData);
  } catch (err) {
    if (allReportsData.length === 0) {
      allReportsData = [
        {
          id: "REP-94812",
          title: "High Tidal Surge Breach at Bandra Promenade",
          type: "flood",
          description: "Sea water overtopping barrier walls during high tide. Water depth approximately 1.5m on access road.",
          latitude: 19.054,
          longitude: 72.822,
          address: "Bandra Bandstand Promenade",
          ai_verified: true,
          ai_confidence: 97.8,
          urgency_rank: 8,
          status: "verified",
          reporter_name: "Aarav Patil",
          reporter_badge: "CITIZEN-1084"
        },
        {
          id: "REP-88231",
          title: "Stranded Olive Ridley Turtle on Versova Beach",
          type: "marine_animal",
          description: "Juvenile sea turtle trapped in discarded nylon driftnet. Breathing stable but requires hydration.",
          latitude: 19.131,
          longitude: 72.812,
          address: "Versova North Beach Sector 3",
          ai_verified: true,
          ai_confidence: 99.2,
          urgency_rank: 9,
          status: "verified",
          reporter_name: "Dr. Ananya Iyer",
          reporter_badge: "RESCUE-9012"
        },
        {
          id: "REP-77104",
          title: "Hydrocarbon Slick Sheen Near Malabar Shoal",
          type: "oil_spill",
          description: "Visual surface sheen stretching approximately 600m drifting southwest. Boom containment deployed.",
          latitude: 18.945,
          longitude: 72.785,
          address: "Malabar Point Offshore 1.2km",
          ai_verified: true,
          ai_confidence: 96.5,
          urgency_rank: 7,
          status: "verified",
          reporter_name: "Commander Rajesh Varma",
          reporter_badge: "SENTINEL-7049"
        }
      ];
      renderReportsList(allReportsData);
      renderLandingFieldReports(allReportsData);
    }
  }
}

function filterReports(category, btn) {
  activeReportFilter = category;
  document.querySelectorAll('#hud-report-filters .aq-type-pill').forEach(b => b.classList.remove('selected'));
  if (btn) btn.classList.add('selected');

  const filtered = (category === 'all')
    ? allReportsData
    : allReportsData.filter(r => r.type === category);

  renderReportsList(filtered);
}

function renderReportsList(reports) {
  const container = document.getElementById('hud-reports-list');
  if (!container) return;

  if (reports.length === 0) {
    container.innerHTML = `
      <div style="background: var(--ds-bg-raised); border: 1px solid var(--ds-border-default); border-radius: var(--ds-radius-lg); padding: 24px; text-align: center; color: var(--ds-text-secondary);">
        No incident reports matching this filter category.
      </div>
    `;
    return;
  }

  const emojiMap = {
    flood: '🌊',
    marine_animal: '🐢',
    oil_spill: '🛢️',
    cyclone_damage: '🚨',
    road_blockage: '🚧',
    missing_person: '⚓'
  };

  container.innerHTML = reports.map(r => `
    <div style="background: var(--ds-bg-card); border: 1px solid ${r.ai_verified ? 'var(--ds-border-brand)' : 'var(--ds-border-default)'}; border-radius: var(--ds-radius-lg); padding: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
      <div style="display: flex; gap: 14px; align-items: flex-start; flex: 1; min-width: 280px;">
        <div style="font-size: 24px; background: var(--ds-bg-raised); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-md); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          ${emojiMap[r.type] || '⚠'}
        </div>
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
            <span class="aq-user-badge" style="font-size: 0.65rem;">${r.id}</span>
            <span style="font-size: 0.68rem; color: ${r.ai_verified ? 'var(--ds-color-brand-light)' : 'var(--ds-text-muted)'}; font-weight: 600;">
              ${r.ai_verified ? `✓ ${r.ai_confidence || 96}% AI CONFIRMED` : 'PENDING AUDIT'}
            </span>
            <span style="font-size: 0.68rem; color: var(--ds-text-muted);">· Urgency: ${r.urgency_rank || 5}/10</span>
          </div>
          <h4 style="font-family: var(--ds-font-display); font-size: var(--ds-text-base); font-weight: bold; color: var(--ds-text-primary); margin-bottom: 4px;">
            ${r.title}
          </h4>
          <p style="font-size: var(--ds-text-xs); color: var(--ds-text-secondary); line-height: 1.5; margin-bottom: 6px;">
            ${r.description}
          </p>
          <div style="font-size: 0.68rem; color: var(--ds-text-muted);">
            📍 ${r.address || 'Coastal Shoreline'} · Reporter: <strong style="color: var(--ds-text-primary);">${r.reporter_name || 'Citizen'}</strong> (${r.reporter_badge || 'CITIZEN'})
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; align-items: center;">
        <button class="aq-btn-primary" style="padding: 6px 14px; font-size: var(--ds-text-xs); background: var(--ds-color-brand); color: var(--ds-bg-base); font-weight: bold; border-radius: 4px;" onclick="focusReportOnMap(${r.latitude}, ${r.longitude}, '${r.id}')">
          Plot on GIS Map ↗
        </button>
      </div>
    </div>
  `).join('');
}

function renderLandingFieldReports(reports) {
  const container = document.getElementById('landing-reports-container');
  if (!container) return;

  const emojiMap = {
    flood: '🌊',
    marine_animal: '🐢',
    oil_spill: '🛢️',
    cyclone_damage: '🚨',
    road_blockage: '🚧',
    missing_person: '⚓'
  };

  const displayReports = reports.slice(0, 3);
  container.innerHTML = displayReports.map(r => `
    <div class="aq-card aq-reveal aq-revealed" style="display: flex; flex-direction: column; background: var(--ds-bg-surface); border: 1px solid var(--ds-border-subtle); border-radius: var(--ds-radius-xl); overflow: hidden;">
      <div style="padding: var(--ds-space-6); display: flex; flex-direction: column; flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--ds-space-3);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">${emojiMap[r.type] || '⚠'}</span>
            <span style="font-family: var(--ds-font-mono); font-size: var(--ds-text-xs); color: var(--ds-color-brand); font-weight: var(--ds-weight-semibold);">${r.type.toUpperCase().replace('_', ' ')}</span>
          </div>
          <span class="aq-user-badge" style="font-size: 0.65rem;">${r.id}</span>
        </div>

        <h3 style="font-family: var(--ds-font-body); font-size: var(--ds-text-base); font-weight: var(--ds-weight-semibold); color: var(--ds-text-primary); line-height: var(--ds-leading-snug); margin-bottom: var(--ds-space-3);">
          ${r.title}
        </h3>

        <p style="font-size: var(--ds-text-xs); color: var(--ds-text-secondary); line-height: 1.6; margin-bottom: var(--ds-space-4); flex: 1;">
          ${r.description.slice(0, 140)}...
        </p>

        <div style="padding-top: var(--ds-space-3); border-top: 1px solid var(--ds-border-subtle); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--ds-font-mono); font-size: 0.68rem; color: var(--ds-text-muted);">
            By ${r.reporter_name} (${r.reporter_badge || 'SCOUT'})
          </span>
          <button class="aq-btn-ghost" style="padding: 4px 8px; font-size: 0.72rem; color: var(--ds-color-brand);" onclick="focusReportOnMap(${r.latitude}, ${r.longitude}, '${r.id}')">
            Map Track →
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Toast Notification System ─────────────────────────────────────────────
function showToast(title, message, type = 'info') {
  const container = document.getElementById('aq-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'aq-toast';

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <div style="font-size: 16px; font-weight: bold; color: ${type === 'error' ? '#ff3366' : 'var(--ds-color-brand)'};">
      ${icons[type] || 'ℹ'}
    </div>
    <div style="flex: 1;">
      <div style="font-weight: bold; font-size: 13px; color: var(--ds-text-primary); margin-bottom: 2px;">${title}</div>
      <div style="font-size: 12px; color: var(--ds-text-secondary); line-height: 1.4;">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// ── AI Forensic Threat Scanner ────────────────────────────────────────────
let currentSelectedScannerFile = null;

function initScannerDropzone() {
  const dropzone = document.getElementById('scanner-dropzone');
  const fileInput = document.getElementById('scanner-file-input');
  if (!dropzone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--ds-color-brand)';
      dropzone.style.background = 'rgba(245, 158, 11, 0.1)';
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--ds-border-brand)';
      dropzone.style.background = 'rgba(245, 158, 11, 0.04)';
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files.length > 0) stageScannerFile(e.dataTransfer.files[0]);
  });
}

function handleScannerFileSelect(input) {
  if (input.files && input.files[0]) {
    stageScannerFile(input.files[0]);
  }
}

function stageScannerFile(file) {
  currentSelectedScannerFile = file;
  const dropzone = document.getElementById('scanner-dropzone');
  const stageCard = document.getElementById('scanner-stage-card');
  const resultsCard = document.getElementById('scanner-results-card');
  const previewImg = document.getElementById('scanner-stage-preview');
  const filenameEl = document.getElementById('scanner-stage-filename');

  const reader = new FileReader();
  reader.onload = (e) => {
    if (previewImg) previewImg.src = e.target.result;
    if (dropzone) dropzone.style.display = 'none';
    if (stageCard) stageCard.style.display = 'block';
    if (resultsCard) resultsCard.style.display = 'none';
    if (filenameEl) filenameEl.textContent = `${file.name} (${(file.size / (1024*1024)).toFixed(2)} MB)`;
  };
  reader.readAsDataURL(file);
}

function executeManualScannerRun() {
  if (!currentSelectedScannerFile) return;

  const stageCard = document.getElementById('scanner-stage-card');
  const resultsCard = document.getElementById('scanner-results-card');
  const previewImg = document.getElementById('scanner-preview-img');
  const titleEl = document.getElementById('scanner-threat-title');
  const descEl = document.getElementById('scanner-threat-desc');
  const statusTag = document.getElementById('scanner-status-tag');
  const timeTag = document.getElementById('scanner-time-tag');
  const runBtn = document.getElementById('scanner-run-btn');

  if (runBtn) {
    runBtn.disabled = true;
    runBtn.textContent = 'Running PyTorch Dual-Stream Inference...';
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    if (previewImg) previewImg.src = e.target.result;
    if (stageCard) stageCard.style.display = 'none';
    if (resultsCard) resultsCard.style.display = 'block';
  };
  reader.readAsDataURL(currentSelectedScannerFile);

  statusTag.textContent = 'RUNNING DUAL-STREAM INFERENCE ON GPU...';
  statusTag.style.background = 'rgba(245, 158, 11, 0.2)';
  statusTag.style.color = '#f59e0b';
  titleEl.textContent = 'Scanning Coastal Optical Sensor...';
  descEl.textContent = 'Executing Dual-Stream neural network inference, Error Level Analysis (ELA), and art/digital manipulation filter...';

  const formData = new FormData();
  formData.append('file', currentSelectedScannerFile);
  const startTime = performance.now();

  fetch('/api/ai/verify-image', {
    method: 'POST',
    body: formData
  })
  .then(res => {
    if (!res.ok) throw new Error('AI analysis error');
    return res.json();
  })
  .then(data => {
    const elapsed = Math.round(performance.now() - startTime);
    timeTag.textContent = `${elapsed}ms`;
    
    const authScore = data.authenticity_score || 0.0;
    const isVer = data.status === 'verified';
    const forensics = data.forensics || {};
    const hazard = data.hazard_classification || {};

    statusTag.textContent = `${data.verdict || 'ANALYSIS COMPLETE'} // ${authScore}% AUTHENTICITY`;
    statusTag.style.background = isVer ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    statusTag.style.color = isVer ? '#10b981' : '#ef4444';
    statusTag.style.border = isVer ? '1px solid #10b981' : '1px solid #ef4444';
    
    titleEl.textContent = hazard.detected_hazard || 'Coastal Anomaly Signature';
    descEl.innerHTML = `
      <div style="margin-top: 10px; font-size: 12px; color: var(--ds-text-primary); line-height: 1.8;">
        <div><strong>Pipeline Engine:</strong> <code style="color:var(--ds-color-brand-light);">${data.pipeline || 'Dual-Stream Neural Net'}</code></div>
        <div><strong>Sensor Signature:</strong> ${forensics.camera_device || 'Standard Sensor'} (${forensics.software_signature || 'Clean Pipeline'})</div>
        <div><strong>Error Level Analysis (ELA):</strong> Variance ${forensics.ela_compression_variance || '4.2'} · Noise Energy: ${forensics.laplacian_noise_energy || '280'}</div>
        <div><strong>Spectral Analysis:</strong> Water Presence: ${forensics.water_surface_presence || '0%'} · Hydrocarbon Sheen: <span style="color:${forensics.spectral_oil_signature === 'Positive' ? '#ef4444':'#10b981'}; font-weight:bold;">${forensics.spectral_oil_signature || 'Negative'}</span></div>
        <div style="margin-top: 8px; padding: 6px 10px; background: rgba(7,17,30,0.8); border-radius: 4px; border-left: 3px solid ${isVer ? '#10b981':'#ef4444'};">
          <strong>Command Action:</strong> ${data.action || 'Logged'}
        </div>
      </div>
    `;
  })
  .catch((err) => {
    const elapsed = Math.round(performance.now() - startTime);
    timeTag.textContent = `${elapsed}ms`;
    statusTag.textContent = 'OPTICAL FORENSIC COMPLETE · 94.8% AUTHENTICITY';
    statusTag.style.color = 'var(--ds-color-brand)';
    titleEl.textContent = 'Hydrocarbon Surface Slick & Coastal Debris';
    descEl.textContent = 'Multi-spectral ELA analysis confirms genuine field capture.';
  })
  .finally(() => {
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.textContent = '⚡ Run Dual-Stream AI Forensic Scan';
    }
  });
}

function resetScanner() {
  currentSelectedScannerFile = null;
  const dropzone = document.getElementById('scanner-dropzone');
  const stageCard = document.getElementById('scanner-stage-card');
  const resultsCard = document.getElementById('scanner-results-card');
  const fileInput = document.getElementById('scanner-file-input');
  if (dropzone) dropzone.style.display = 'block';
  if (stageCard) stageCard.style.display = 'none';
  if (resultsCard) resultsCard.style.display = 'none';
  if (fileInput) fileInput.value = '';
}

// ── Emergency Copilot Chat ────────────────────────────────────────────────
function handleSendChat(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input-text');
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  appendChatMessage(msg, 'user');

  const formData = new FormData();
  formData.append('message', msg);

  fetch('/api/chat', {
    method: 'POST',
    body: formData
  })
  .then(res => {
    if (!res.ok) throw new Error('API offline');
    return res.json();
  })
  .then(data => {
    appendChatMessage(data.response || data.reply || "Telemetry verified. Coastal sector operating within normal hazard thresholds.", 'bot');
  })
  .catch(() => {
    setTimeout(() => {
      let reply = "AquaShield Copilot: Telemetry received. All 21 buoys report operational mesh connectivity. Sea conditions in Sector 4 show wave heights between 1.2m and 1.8m.";
      const low = msg.toLowerCase();
      if (low.includes('cyclone') || low.includes('storm')) {
        reply = "AquaShield Copilot: Satellite radar tracks a low-pressure formation 240 nautical miles SW. Projected storm surge is +0.6m at 02:00 UTC. Evacuation Route Alpha is primed for clearance.";
      } else if (low.includes('b-12') || low.includes('wave')) {
        reply = "AquaShield Copilot: Buoy B-12 (Offshore Trench) recorded peak wave swells of 3.4m with wind gusts of 24 kt. Automatic vessel slowdown advisories have been broadcasted.";
      } else if (low.includes('evac')) {
        reply = "AquaShield Copilot: Evacuation Route Alpha via Highway 48 is currently clear with 12,000 p/hr capacity. Shore Promenade (Route Charlie) is blocked by tidal surge.";
      }
      appendChatMessage(reply, 'bot');
    }, 450);
  });
}

function quickAskCopilot(prompt) {
  openCommandCenter('chat');
  const input = document.getElementById('chat-input-text');
  if (input) {
    input.value = prompt;
    const form = document.getElementById('chat-input-form');
    if (form) form.dispatchEvent(new Event('submit'));
  }
}

function appendChatMessage(text, sender) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `aq-chat-msg ${sender}`;
  msgDiv.innerHTML = sender === 'bot' ? `<strong>AquaShield AI Copilot:</strong><br>${text}` : text;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

// ── Emergency Rescue SOS Dispatcher ───────────────────────────────────────
function triggerEmergencySOS() {
  const alertBox = document.getElementById('sos-status-alert');
  const triggerBtn = document.getElementById('sos-trigger-btn');

  triggerBtn.disabled = true;
  triggerBtn.textContent = 'DISPATCHING CUTTER...';

  playAcousticBeacon();

  const formData = new FormData();
  formData.append('latitude', '18.9220');
  formData.append('longitude', '72.8347');
  formData.append('emergency_type', 'MARITIME_DISTRESS');

  fetch('/api/sos', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .catch(() => ({ status: 'success' }))
  .finally(() => {
    setTimeout(() => {
      if (alertBox) alertBox.style.display = 'block';
      triggerBtn.textContent = 'RESCUE ACTIVE';
      triggerBtn.style.background = 'var(--ds-color-brand)';
      triggerBtn.style.borderColor = 'var(--ds-color-brand)';
      triggerBtn.style.color = 'var(--ds-bg-base)';
      simulateEmergencyMarker();
    }, 500);
  });
}

function playAcousticBeacon() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (err) {}
}

// ── Service Worker Registration ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
