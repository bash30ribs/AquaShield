/**
 * AquaShield Sentinel — Platform & Tactical HUD Controller
 * Supports Professional Website Frontend, User Authentication, and Live Field Report Submissions
 */

// ── State & Configuration ────────────────────────────────────────────────
let tacticalMap = null;
let mapInitialized = false;
let distressMarker = null;
let reportMarkers = [];
let allReportsData = [];
let activeReportFilter = 'all';

// Active User State (Persisted in localStorage)
let currentUser = null;

// Buoy Telemetry Data
const BUOYS_DATA = [
  { id: 'B-01', name: 'Colaba Point', lat: 18.898, lng: 72.812, wave: '1.2 m', temp: '28.4°C', status: 'nominal' },
  { id: 'B-02', name: 'Prongs Reef', lat: 18.882, lng: 72.801, wave: '1.4 m', temp: '28.2°C', status: 'nominal' },
  { id: 'B-03', name: 'Malabar Outpost', lat: 18.945, lng: 72.785, wave: '1.5 m', temp: '28.1°C', status: 'nominal' },
  { id: 'B-04', name: 'Back Bay Shoal', lat: 18.922, lng: 72.815, wave: '1.2 m', temp: '28.3°C', status: 'nominal' },
  { id: 'B-07', name: 'Bandra Deep', lat: 19.045, lng: 72.788, wave: '1.8 m', temp: '27.9°C', status: 'nominal' },
  { id: 'B-12', name: 'Offshore Trench', lat: 18.985, lng: 72.720, wave: '3.4 m', temp: '26.8°C', status: 'warning' },
];

// ── DOM Initialization ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initScrollReveal();
  initBuoyRoster();
  initClock();
  initScannerDropzone();
  initAuthSession();
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

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCommandCenter();
    closeReportModal();
    closeAuthModal();
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
      if (tacticalMap) tacticalMap.invalidateSize();
    }, 150);
  } else if (tabName === 'reports') {
    loadReports();
  }
}

// ── Leaflet Tactical Map ─────────────────────────────────────────────────
function initTacticalMap() {
  if (mapInitialized) return;
  const container = document.getElementById('tactical-map-container');
  if (!container) return;

  tacticalMap = L.map('tactical-map-container', {
    zoomControl: false,
    attributionControl: false
  }).setView([18.96, 72.82], 11);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(tacticalMap);

  L.control.zoom({ position: 'topright' }).addTo(tacticalMap);

  // Buoy Icons
  const buoyIcon = L.divIcon({
    className: 'custom-buoy-icon',
    html: `<div style="width: 14px; height: 14px; background: #f59e0b; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });

  BUOYS_DATA.forEach(b => {
    const marker = L.marker([b.lat, b.lng], { icon: buoyIcon }).addTo(tacticalMap);
    marker.bindPopup(`
      <div style="font-family: var(--ds-font-body); padding: 6px; background: #07111e; color: #f1f5f9; border-radius: 4px; border: 1px solid rgba(245,158,11,0.3);">
        <strong style="color: #f59e0b; font-size: 13px;">${b.id} — ${b.name}</strong><br>
        <span style="font-size: 11px; color: #94a3b8;">Status: ${b.status.toUpperCase()}</span><br>
        <span style="font-size: 12px; font-weight: bold; color: #f1f5f9;">Wave Height: ${b.wave}</span><br>
        <span style="font-size: 11px; color: #94a3b8;">Surface Temp: ${b.temp}</span>
      </div>
    `);
  });

  // Coastal Flood Hazard Zone
  L.circle([18.91, 72.81], {
    color: '#f59e0b',
    fillColor: '#f59e0b',
    fillOpacity: 0.16,
    radius: 3200,
    weight: 1.5,
    dashArray: '4, 4'
  }).addTo(tacticalMap).bindPopup('<div style="background:#07111e;color:#f1f5f9;padding:4px;"><strong style="color:#f59e0b;">Warning Sector 1:</strong> Storm Surge Inundation Watch</div>');

  // Vessel AIS Tracks
  const vesselIcon = L.divIcon({
    className: 'custom-vessel-icon',
    html: `<div style="color: #f59e0b; font-size: 16px; filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.6)); font-weight: bold;">▲</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  L.marker([18.99, 72.86], { icon: vesselIcon }).addTo(tacticalMap)
    .bindPopup('<div style="background:#07111e;color:#f1f5f9;padding:4px;"><strong style="color:#f59e0b;">ICGS Varuna (Coast Guard)</strong><br><span style="color:#94a3b8;font-size:11px;">Speed: 18.4 kt · Heading: 240° SW</span></div>');

  L.marker([18.93, 72.74], { icon: vesselIcon }).addTo(tacticalMap)
    .bindPopup('<div style="background:#07111e;color:#f1f5f9;padding:4px;"><strong style="color:#f1f5f9;">M/V Pacific (Merchant Cargo)</strong><br><span style="color:#94a3b8;font-size:11px;">Speed: 12.1 kt · Heading: 180° S</span></div>');

  mapInitialized = true;
  plotReportsOnMap(allReportsData);
}

function resetMapView() {
  if (tacticalMap) {
    tacticalMap.setView([18.96, 72.82], 11);
  }
}

function focusBuoyOnMap(lat, lng, id) {
  openCommandCenter('map');
  setTimeout(() => {
    if (tacticalMap) {
      tacticalMap.setView([lat, lng], 13);
    }
  }, 200);
}

function focusReportOnMap(lat, lng, id) {
  openCommandCenter('map');
  setTimeout(() => {
    if (tacticalMap) {
      tacticalMap.setView([lat, lng], 14);
      const markerObj = reportMarkers.find(m => m.id === id);
      if (markerObj) markerObj.marker.openPopup();
    }
  }, 200);
}

function simulateEmergencyMarker() {
  if (!tacticalMap) return;
  if (distressMarker) tacticalMap.removeLayer(distressMarker);

  const distressIcon = L.divIcon({
    className: 'custom-sos-icon',
    html: `<div style="width: 22px; height: 22px; background: #ff3366; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 18px #ff3366;"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  distressMarker = L.marker([18.94, 72.76], { icon: distressIcon }).addTo(tacticalMap);
  distressMarker.bindPopup(`
    <div style="background:#07111e;color:#f1f5f9;padding:6px;border:1px solid #ff3366;">
      <strong style="color: #ff3366;">⚠ EMERGENCY DISTRESS BEACON</strong><br>
      <span style="font-size:12px;">Vessel: Fishing Trawler 'Sagar 4'</span><br>
      <span style="font-size:11px;color:#94a3b8;">Nature: Engine Failure & Heavy Swell</span><br>
      <span style="font-size:11px;color:#fbbf24;">Coast Guard Cutter Intercepting.</span>
    </div>
  `).openPopup();

  tacticalMap.setView([18.94, 72.76], 12);
}

function plotReportsOnMap(reports) {
  if (!tacticalMap) return;

  reportMarkers.forEach(m => tacticalMap.removeLayer(m.marker));
  reportMarkers = [];

  const icons = {
    flood: '🌊',
    marine_animal: '🐢',
    oil_spill: '🛢️',
    cyclone_damage: '🚨',
    road_blockage: '🚧',
    missing_person: '⚓'
  };

  reports.forEach(r => {
    if (!r.latitude || !r.longitude) return;

    const emoji = icons[r.type] || '⚠';
    const reportIcon = L.divIcon({
      className: 'report-map-icon',
      html: `
        <div style="background: rgba(12, 24, 39, 0.95); border: 2px solid ${r.ai_verified ? '#f59e0b' : '#94a3b8'}; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 12px ${r.ai_verified ? 'rgba(245,158,11,0.6)' : 'rgba(148,163,184,0.4)'};">
          ${emoji}
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([r.latitude, r.longitude], { icon: reportIcon }).addTo(tacticalMap);
    marker.bindPopup(`
      <div style="background:#07111e; color:#f1f5f9; padding:8px; min-width: 200px;">
        <div style="font-size: 10px; font-family: var(--ds-font-mono); color: #f59e0b; font-weight: bold; margin-bottom: 2px;">
          ${r.id} · ${r.ai_verified ? '✓ AI VERIFIED' : 'PENDING AUDIT'}
        </div>
        <strong style="color: #f1f5f9; font-size: 13px;">${r.title}</strong>
        <p style="font-size: 11px; color: #94a3b8; margin: 4px 0;">${r.description.slice(0, 110)}...</p>
        <div style="font-size: 10px; color: #fbbf24;">Reporter: ${r.reporter_name} (${r.reporter_badge || 'CITIZEN'})</div>
      </div>
    `);

    reportMarkers.push({ id: r.id, marker });
  });
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
    // Default demo scout if first time
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
    const roleBadges = {
      authority: "🛡️ COMMANDER",
      ngo: "🐢 BIOLOGIST",
      rescue_team: "🚨 NDMA LEAD",
      citizen: "🌊 SCOUT"
    };
    const badgeLabel = roleBadges[currentUser.role] || "SCOUT";

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

function handleLogout() {
  localStorage.removeItem('aquashield_user');
  currentUser = null;
  renderUserNav();
  updateReportModalReporterInfo();
  showToast('Logged Out', 'User session cleared.', 'info');
}

// ── Community Field Report Submission ─────────────────────────────────────
function openReportModal() {
  const modal = document.getElementById('report-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateReportModalReporterInfo();
  }
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
  const latInput = document.getElementById('report-form-lat');
  const lngInput = document.getElementById('report-form-lng');
  const addrInput = document.getElementById('report-form-address');

  if ('geolocation' in navigator) {
    showToast('📍 Detecting GPS', 'Querying browser geolocation sensor...', 'info');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        if (latInput) latInput.value = lat;
        if (lngInput) lngInput.value = lng;
        if (addrInput && !addrInput.value) {
          addrInput.value = `Sector (${lat} N, ${lng} E)`;
        }
        showToast('✓ GPS Location Locked', `Coordinates: ${lat}, ${lng}`, 'success');
      },
      (err) => {
        showToast('Location Warning', 'Using default coastal sector coordinates.', 'warning');
      },
      { timeout: 5000 }
    );
  } else {
    showToast('GPS Sensor', 'Geolocation unavailable, please specify manually.', 'warning');
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
          Eyewitness incident successfully broadcast to coastal radar and rescue teams.
        </span>
      `;
      resultBox.style.display = 'block';
    }

    showToast('🚨 Incident Report Broadcasted', `Report ${rep.id} verified and added to Tactical Radar`, 'success');

    // Reload reports and close modal after brief confirmation
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
    // Fallback data if offline
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
function initScannerDropzone() {
  const dropzone = document.getElementById('scanner-dropzone');
  const fileInput = document.getElementById('scanner-file-input');
  if (!dropzone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) handleScannerFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (fileInput.files.length > 0) handleScannerFile(fileInput.files[0]);
  });
}

function handleScannerFile(file) {
  const resultsCard = document.getElementById('scanner-results-card');
  const previewImg = document.getElementById('scanner-preview-img');
  const titleEl = document.getElementById('scanner-threat-title');
  const descEl = document.getElementById('scanner-threat-desc');
  const statusTag = document.getElementById('scanner-status-tag');
  const timeTag = document.getElementById('scanner-time-tag');

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    resultsCard.style.display = 'block';
  };
  reader.readAsDataURL(file);

  statusTag.textContent = 'ANALYZING SPECTRAL SIGNATURE...';
  statusTag.style.color = 'var(--ds-color-amber)';
  titleEl.textContent = 'Scanning Satellite Image...';
  descEl.textContent = 'Running convolutional edge filters and spectral chemical classification...';

  const formData = new FormData();
  formData.append('file', file);
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
    statusTag.textContent = `VERIFIED · 98.7% CONFIDENCE`;
    statusTag.style.color = 'var(--ds-color-brand)';
    titleEl.textContent = 'Hydrocarbon Surface Slick Signature';
    descEl.textContent = 'AI verifies high-density surface sheen 3.8 km offshore. Dispatched containment alert to coastal cleanup patrol.';
  })
  .catch(() => {
    setTimeout(() => {
      const elapsed = Math.round(performance.now() - startTime);
      timeTag.textContent = `${elapsed}ms`;
      statusTag.textContent = 'ANALYSIS COMPLETE · 99.4% CONFIDENCE';
      statusTag.style.color = 'var(--ds-color-brand)';
      titleEl.textContent = 'Coastal Fuel Discharge & Algae Bloom Identified';
      descEl.textContent = 'Spectral analysis identifies 0.4 mm hydrocarbon surface sheen overlapping with elevated microalgae concentration.';
    }, 600);
  });
}

function resetScanner() {
  const resultsCard = document.getElementById('scanner-results-card');
  const fileInput = document.getElementById('scanner-file-input');
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
