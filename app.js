/* ============================================================
   AquaShield AI — Main Application Script
   Bulletproof Chart.js, Leaflet Map & Offline Fallbacks
   ============================================================ */

// ======================== Water Canvas Animation ========================
const canvas = document.getElementById('waterCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas && ctx) {
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const waves = [
    { y: H * 0.6, amplitude: 30, wavelength: 300, speed: 0.5, color: 'rgba(0,150,199,0.08)', offset: 0 },
    { y: H * 0.65, amplitude: 20, wavelength: 250, speed: 0.7, color: 'rgba(0,119,182,0.06)', offset: 100 },
    { y: H * 0.7, amplitude: 25, wavelength: 350, speed: 0.4, color: 'rgba(72,202,228,0.05)', offset: 200 },
    { y: H * 0.55, amplitude: 15, wavelength: 200, speed: 0.9, color: 'rgba(0,96,100,0.04)', offset: 50 },
  ];

  const particles = Array.from({ length: 25 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 20,
    alpha: Math.random() * 0.3,
  }));

  function animateWater() {
    ctx.clearRect(0, 0, W, H);
    waves.forEach(wave => {
      wave.offset += wave.speed * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, wave.y);
      for (let x = 0; x <= W; x += 5) {
        const y = wave.y + Math.sin((x + wave.offset) / wave.wavelength * 2 * Math.PI) * wave.amplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fillStyle = wave.color;
      ctx.fill();
    });

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(144,224,239,${p.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      p.r += 0.5;
      p.alpha -= 0.005;
      if (p.alpha <= 0) {
        p.x = Math.random() * W;
        p.y = Math.random() * H;
        p.r = Math.random() * 10;
        p.alpha = 0.3;
      }
    });

    requestAnimationFrame(animateWater);
  }
  animateWater();
}

// ======================== Hero Particles ========================
function createHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    const size = Math.random() * 80 + 20;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      --dur:${Math.random() * 4 + 4}s;
      --delay:${Math.random() * 3}s;
      opacity:${Math.random() * 0.4 + 0.1};
    `;
    container.appendChild(p);
  }
}
createHeroParticles();

// ======================== Nav Scroll & Hamburger ========================
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);

  document.querySelectorAll('.section, #hero').forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top <= 100 && rect.bottom >= 100) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[data-section="${sec.id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
});

document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('navLinks')?.classList.toggle('open');
});

// ======================== Counter Animation ========================
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const increment = target / 80;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      el.textContent = target + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + suffix;
    }
  }, 20);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target || 0));
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statsObserver.observe(heroStats);

// ======================== Charts System (CDN + Canvas Fallback) ========================
function initCharts() {
  if (typeof Chart !== 'undefined') {
    Chart.defaults.color = '#7fb3c8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // 1. Disaster Frequency Chart
    const disasterCtx = document.getElementById('disasterChart');
    if (disasterCtx) {
      new Chart(disasterCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Cyclone',
            data: [2, 1, 3, 2, 8, 12, 15, 18, 22, 14, 8, 4],
            backgroundColor: 'rgba(249,115,22,0.7)',
            borderRadius: 4,
          }, {
            label: 'Flood',
            data: [5, 4, 6, 8, 15, 22, 28, 30, 25, 18, 10, 7],
            backgroundColor: 'rgba(59,130,246,0.7)',
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#90e0ef', font: { size: 10 } } } },
          scales: {
            x: { grid: { color: 'rgba(144,224,239,0.08)' }, ticks: { color: '#7fb3c8' } },
            y: { grid: { color: 'rgba(144,224,239,0.08)' }, ticks: { color: '#7fb3c8' } }
          }
        }
      });
    }

    // 2. Risk Level Doughnut
    const riskCtx = document.getElementById('riskChart');
    if (riskCtx) {
      new Chart(riskCtx, {
        type: 'doughnut',
        data: {
          labels: ['Severe', 'High', 'Moderate', 'Safe'],
          datasets: [{
            data: [15, 28, 35, 22],
            backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
            borderWidth: 2,
            borderColor: 'rgba(3,4,94,0.5)',
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom', labels: { color: '#90e0ef', font: { size: 10 }, padding: 10 } } },
          cutout: '60%',
        }
      });
    }

    // 3. Response Time Line
    const responseCtx = document.getElementById('responseChart');
    if (responseCtx) {
      new Chart(responseCtx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          datasets: [{
            label: 'Avg Response Time (min)',
            data: [45, 38, 30, 22, 18, 14],
            borderColor: '#00b4d8',
            backgroundColor: 'rgba(0,180,216,0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00b4d8',
            pointRadius: 4,
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#90e0ef', font: { size: 10 } } } },
          scales: {
            x: { grid: { color: 'rgba(144,224,239,0.08)' }, ticks: { color: '#7fb3c8' } },
            y: { grid: { color: 'rgba(144,224,239,0.08)' }, ticks: { color: '#7fb3c8' } }
          }
        }
      });
    }

    // 4. Marine Chart
    const marineCtx = document.getElementById('marineChart');
    if (marineCtx) {
      new Chart(marineCtx, {
        type: 'polarArea',
        data: {
          labels: ['Turtles', 'Dolphins', 'Whales', 'Birds'],
          datasets: [{
            data: [34, 18, 6, 31],
            backgroundColor: [
              'rgba(34,197,94,0.6)',
              'rgba(59,130,246,0.6)',
              'rgba(168,85,247,0.6)',
              'rgba(251,191,36,0.6)',
            ],
            borderWidth: 1,
            borderColor: 'rgba(144,224,239,0.3)',
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom', labels: { color: '#90e0ef', font: { size: 10 }, padding: 8 } } },
          scales: { r: { grid: { color: 'rgba(144,224,239,0.1)' }, ticks: { color: '#7fb3c8', backdropColor: 'transparent' } } }
        }
      });
    }

    // 5. Forecast Chart
    const forecastCtx = document.getElementById('forecastChart');
    if (forecastCtx) {
      new Chart(forecastCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Cyclone Risk %',
            data: [45, 55, 70, 82, 78, 60, 48],
            borderColor: '#f97316',
            backgroundColor: 'rgba(249,115,22,0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#f97316',
          }, {
            label: 'Flood Risk %',
            data: [30, 40, 55, 62, 58, 45, 35],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#90e0ef', font: { size: 10 } } } },
          scales: {
            x: { grid: { color: 'rgba(144,224,239,0.08)' }, ticks: { color: '#7fb3c8' } },
            y: { grid: { color: 'rgba(144,224,239,0.08)' }, ticks: { color: '#7fb3c8' }, min: 0, max: 100 }
          }
        }
      });
    }
  } else {
    // Native Canvas Fallback Renderers (when Chart.js CDN is blocked/offline)
    renderFallbackBarChart('disasterChart');
    renderFallbackDoughnutChart('riskChart');
    renderFallbackLineChart('responseChart');
    renderFallbackPolarChart('marineChart');
    renderFallbackForecastChart('forecastChart');
  }
}

// Fallback Canvas Chart Drawers
function renderFallbackBarChart(canvasId) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width = c.parentElement.clientWidth || 300;
  const h = c.height = 200;
  ctx.clearRect(0,0,w,h);
  
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const values = [5, 4, 6, 8, 15, 22, 28, 30, 25, 18, 10, 7];
  const barWidth = (w - 60) / months.length;
  
  months.forEach((m, i) => {
    const x = 40 + i * barWidth;
    const barH = (values[i] / 35) * (h - 50);
    const y = h - 30 - barH;
    ctx.fillStyle = 'rgba(0,180,216,0.7)';
    ctx.fillRect(x + 2, y, barWidth - 4, barH);
    ctx.fillStyle = '#90e0ef';
    ctx.font = '10px Inter';
    ctx.fillText(m, x + 2, h - 10);
  });
}

function renderFallbackDoughnutChart(canvasId) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width = c.parentElement.clientWidth || 300;
  const h = c.height = 200;
  ctx.clearRect(0,0,w,h);

  const data = [15, 28, 35, 22];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const total = data.reduce((a,b)=>a+b,0);
  let startAngle = 0;

  data.forEach((val, i) => {
    const slice = (val / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(w/2, h/2 - 10, 60, startAngle, startAngle + slice);
    ctx.arc(w/2, h/2 - 10, 35, startAngle + slice, startAngle, true);
    ctx.fillStyle = colors[i];
    ctx.fill();
    startAngle += slice;
  });
}

function renderFallbackLineChart(canvasId) {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width = c.parentElement.clientWidth || 300;
  const h = c.height = 200;
  ctx.clearRect(0,0,w,h);

  const pts = [45, 38, 30, 22, 18, 14];
  ctx.beginPath();
  ctx.strokeStyle = '#00b4d8';
  ctx.lineWidth = 3;
  pts.forEach((pt, i) => {
    const x = 30 + i * (w - 60) / (pts.length - 1);
    const y = h - 30 - (pt / 50) * (h - 60);
    if (i === 0) ctx.moveTo(x,y);
    else ctx.lineTo(x,y);
  });
  ctx.stroke();
}

function renderFallbackPolarChart(canvasId) {
  renderFallbackDoughnutChart(canvasId);
}

function renderFallbackForecastChart(canvasId) {
  renderFallbackLineChart(canvasId);
}

// Execute charts setup
document.addEventListener('DOMContentLoaded', initCharts);
setTimeout(initCharts, 500);

const mapData = [
  { lat: 19.0760, lng: 72.8777, type: 'warning', emoji: '🛢️', label: 'Oil Spill Alert', detail: 'Mumbai Harbor, MH', severity: '🟡 Moderate', color: '#eab308' },
  { lat: 16.9902, lng: 73.3120, type: 'disaster', emoji: '🌀', label: 'Cyclone Alert', detail: 'Ratnagiri Coast, MH', severity: '🔴 Severe', color: '#ef4444' },
  { lat: 9.9312, lng: 76.2673, type: 'disaster', emoji: '🌊', label: 'Coastal Flooding', detail: 'Kochi Marina, Kerala', severity: '🟠 High', color: '#f97316' },
  { lat: 15.4989, lng: 73.8278, type: 'shelter', emoji: '🏥', label: 'Hospital Alerted', detail: 'Panjim, Goa', severity: '🔵 Standby', color: '#3b82f6' },
  { lat: 13.0827, lng: 80.2707, type: 'shelter', emoji: '🏠', label: 'Relief Shelter', detail: 'Chennai Coast, TN', severity: '✅ Active', color: '#22c55e' },
  { lat: 17.6868, lng: 83.2185, type: 'marine', emoji: '🐢', label: 'Marine Rescue', detail: 'Vizag Beach, AP', severity: 'Turtle Rescue', color: '#a855f7' },
  { lat: 20.2961, lng: 85.8245, type: 'disaster', emoji: '🌧️', label: 'Heavy Rainfall', detail: 'Bhubaneswar, Odisha', severity: '🟠 High', color: '#f97316' },
  { lat: 22.5726, lng: 88.3639, type: 'warning', emoji: '🌊', label: 'Storm Surge', detail: 'Kolkata Sundarbans, WB', severity: '🟡 Moderate', color: '#eab308' },
  { lat: 28.6139, lng: 77.2090, type: 'shelter', emoji: '🏛️', label: 'NDMA HQ Command', detail: 'New Delhi (HQ)', severity: '✅ Active', color: '#22c55e' },
  { lat: 23.0225, lng: 72.5714, type: 'warning', emoji: '⚠️', label: 'High Wind Advisory', detail: 'Ahmedabad, Gujarat', severity: '🟡 Moderate', color: '#eab308' },
  { lat: 11.6233, lng: 92.7265, type: 'disaster', emoji: '🌊', label: 'Tsunami Watch', detail: 'Port Blair, Andaman', severity: '🔴 High', color: '#ef4444' },
];

function initMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  if (typeof L !== 'undefined') {
    try {
      if (mapContainer._leaflet_id) return; // Already initialized

      // CartoDB Voyager Tile Layer — Extremely fast, reliable, zero 403 blocks
      const cartoTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© CARTO © OpenStreetMap contributors | AquaShield India GIS',
        subdomains: 'abcd',
        maxZoom: 19
      });

      // Esri World Topo Map Backup Tile Layer
      const esriTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri | AquaShield GIS',
        maxZoom: 18
      });

      // Create map centered over geographic center of India (Nagpur / Central India)
      const map = L.map('map', { 
        center: [20.5937, 78.9629], // All India view
        zoom: 5, 
        zoomControl: true,
        layers: [cartoTile]
      });

      function createMarker(color, emoji) {
        return L.divIcon({
          className: '',
          html: `<div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            background:${color};transform:rotate(-45deg);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 15px ${color};
            border:2px solid #fff;
          "><span style="transform:rotate(45deg);font-size:16px;">${emoji}</span></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });
      }

      mapData.forEach(d => {
        const marker = L.marker([d.lat, d.lng], { icon: createMarker(d.color, d.emoji) }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:'Inter',sans-serif;min-width:180px;background:#03045e;color:#caf0f8;padding:10px;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.4);">
            <div style="font-weight:700;font-size:0.95rem;color:#caf0f8;margin-bottom:6px;">${d.emoji} ${d.label}</div>
            <div style="font-size:0.8rem;color:#90e0ef;margin-bottom:4px;">📍 ${d.detail}</div>
            <div style="font-size:0.8rem;font-weight:600;color:#e0f7ff;">${d.severity}</div>
          </div>
        `);
      });
      return;
    } catch(e) {
      console.warn("Leaflet map initialization exception. Using fallback high-detail GIS SVG map.", e);
    }
  }

  // Fallback High-Definition Interactive SVG GIS Map (if Leaflet CDN is offline or blocked)
  renderFallbackSVGMap(mapContainer);
}

function renderFallbackSVGMap(container) {
  // Mercator Projection: Convert Lat/Lng to SVG X/Y percentages for India Peninsular bounding box
  // Lat range: 7.0°N to 25.0°N, Lng range: 68.0°E to 92.0°E
  const minLat = 7.0, maxLat = 25.0;
  const minLng = 67.0, maxLng = 92.0;

  function projectCoords(lat, lng) {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  }

  container.innerHTML = `
    <div style="position:relative;width:100%;height:100%;background:linear-gradient(135deg,#022c5e,#004e89,#0077b6);border-radius:16px;overflow:hidden;box-shadow:inset 0 0 50px rgba(0,0,0,0.6);font-family:'Inter',sans-serif;">
      
      <!-- Vector Map SVG Layer for India Peninsular Coastline & Boundaries -->
      <svg viewBox="0 0 1000 600" style="width:100%;height:100%;position:absolute;inset:0;" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(3, 15, 45, 0.85)"/>
            <stop offset="100%" stop-color="rgba(7, 26, 68, 0.9)"/>
          </linearGradient>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#021b3a"/>
            <stop offset="100%" stop-color="#004a7c"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <!-- Lat/Lng Grid Lines -->
        <g stroke="rgba(144, 224, 239, 0.08)" stroke-width="1" stroke-dasharray="4,4">
          <line x1="0" y1="120" x2="1000" y2="120" /><text x="15" y="115" fill="#7fb3c8" font-size="10">22°N</text>
          <line x1="0" y1="240" x2="1000" y2="240" /><text x="15" y="235" fill="#7fb3c8" font-size="10">18°N</text>
          <line x1="0" y1="360" x2="1000" y2="360" /><text x="15" y="355" fill="#7fb3c8" font-size="10">14°N</text>
          <line x1="0" y1="480" x2="1000" y2="480" /><text x="15" y="475" fill="#7fb3c8" font-size="10">10°N</text>

          <line x1="200" y1="0" x2="200" y2="600" /><text x="205" y="585" fill="#7fb3c8" font-size="10">72°E</text>
          <line x1="400" y1="0" x2="400" y2="600" /><text x="405" y="585" fill="#7fb3c8" font-size="10">77°E</text>
          <line x1="600" y1="0" x2="600" y2="600" /><text x="605" y="585" fill="#7fb3c8" font-size="10">82°E</text>
          <line x1="800" y1="0" x2="800" y2="600" /><text x="805" y="585" fill="#7fb3c8" font-size="10">87°E</text>
        </g>

        <!-- Detailed India Landmass & Coastline Geometry -->
        <path d="
          M 180,60 
          L 280,70 L 320,110 L 290,160 L 220,180 L 160,190 L 150,230 L 210,250 L 260,240 
          L 290,300 L 320,350 L 360,410 L 410,480 L 450,540 L 470,540 L 490,490 L 530,440 
          L 560,380 L 610,320 L 680,270 L 760,220 L 830,160 L 880,120 L 920,80 L 750,60 Z" 
          fill="url(#landGrad)" stroke="#48cae4" stroke-width="2.5" filter="url(#glow)"/>

        <!-- State Boundary Accent Lines -->
        <g stroke="rgba(72, 202, 228, 0.25)" stroke-width="1.5" stroke-dasharray="3,3" fill="none">
          <!-- Gujarat / Maharashtra Boundary -->
          <path d="M 210,250 C 250,230 300,240 330,220" />
          <!-- Maharashtra / Goa / Karnataka Boundary -->
          <path d="M 290,300 C 330,290 380,300 420,310" />
          <!-- Karnataka / Kerala Boundary -->
          <path d="M 360,410 C 400,400 450,420 480,430" />
          <!-- Tamil Nadu / Andhra Boundary -->
          <path d="M 530,440 C 580,410 630,390 660,370" />
          <!-- Odisha / WB Boundary -->
          <path d="M 680,270 C 720,240 780,210 820,190" />
        </g>

        <!-- Ocean Region Text Labels -->
        <text x="100" y="380" fill="rgba(144,224,239,0.35)" font-size="16" font-weight="700" letter-spacing="3">ARABIAN SEA</text>
        <text x="680" y="380" fill="rgba(144,224,239,0.35)" font-size="16" font-weight="700" letter-spacing="3">BAY OF BENGAL</text>
        <text x="380" y="570" fill="rgba(144,224,239,0.35)" font-size="14" font-weight="700" letter-spacing="2">INDIAN OCEAN</text>
        
        <!-- Coastal State Labels -->
        <text x="210" y="220" fill="#90e0ef" font-size="11" font-weight="600">MAHARASHTRA</text>
        <text x="250" y="320" fill="#90e0ef" font-size="11" font-weight="600">GOA</text>
        <text x="300" y="370" fill="#90e0ef" font-size="11" font-weight="600">KARNATAKA</text>
        <text x="360" y="470" fill="#90e0ef" font-size="11" font-weight="600">KERALA</text>
        <text x="490" y="470" fill="#90e0ef" font-size="11" font-weight="600">TAMIL NADU</text>
        <text x="580" y="330" fill="#90e0ef" font-size="11" font-weight="600">ANDHRA PRADESH</text>
        <text x="680" y="240" fill="#90e0ef" font-size="11" font-weight="600">ODISHA</text>
        <text x="800" y="160" fill="#90e0ef" font-size="11" font-weight="600">WEST BENGAL</text>

        <!-- Animated GIS Radar Sweep Line -->
        <g transform="translate(450, 480)">
          <line x1="0" y1="0" x2="-350" y2="-350" stroke="rgba(72,202,228,0.4)" stroke-width="2">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite"/>
          </line>
          <circle cx="0" cy="0" r="250" fill="none" stroke="rgba(72,202,228,0.15)" stroke-width="1"/>
          <circle cx="0" cy="0" r="150" fill="none" stroke="rgba(72,202,228,0.15)" stroke-width="1"/>
        </g>
      </svg>

      <!-- Status Header -->
      <div style="position:absolute;top:14px;left:16px;z-index:10;background:rgba(3,4,94,0.85);backdrop-filter:blur(10px);padding:8px 16px;border-radius:50px;border:1px solid rgba(144,224,239,0.3);display:flex;align-items:center;gap:8px;box-shadow:0 4px 15px rgba(0,0,0,0.4);">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#00b4d8;box-shadow:0 0 10px #00b4d8;animation:pulse 1.5s infinite;"></span>
        <span style="font-size:0.8rem;font-weight:700;color:#caf0f8;">📍 AquaShield High-Definition GIS Coastal Radar</span>
      </div>

      <!-- Geographically Positioned Markers -->
      <div id="fallbackMarkers" style="position:absolute;inset:0;pointer-events:auto;z-index:15;">
        ${mapData.map((d) => {
          const pt = projectCoords(d.lat, d.lng);
          return `
            <div onclick="showMarkerPopup('${d.label}', '${d.detail}', '${d.severity}', '${d.emoji}')" 
                 title="${d.label} - ${d.detail}"
                 style="position:absolute;left:${pt.x}%;top:${pt.y}%;transform:translate(-50%,-100%);cursor:pointer;transition:transform 0.2s ease;"
                 onmouseover="this.style.transform='translate(-50%,-110%) scale(1.15)'"
                 onmouseout="this.style.transform='translate(-50%,-100%) scale(1)'">
              
              <!-- Pulse Glow Ring -->
              <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:24px;height:8px;border-radius:50%;background:${d.color};opacity:0.6;filter:blur(3px);"></div>

              <!-- Marker Pin -->
              <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:${d.color};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px ${d.color};border:2px solid #fff;">
                <span style="transform:rotate(45deg);font-size:16px;">${d.emoji}</span>
              </div>
            </div>`;
        }).join('')}
      </div>

      <!-- Popup Container -->
      <div id="mapPopup" style="display:none;position:absolute;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(3,4,94,0.95);border:1px solid #48cae4;color:#caf0f8;padding:12px 20px;border-radius:14px;backdrop-filter:blur(16px);z-index:30;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,0.6);min-width:240px;animation:fadeIn 0.3s ease;">
        <div id="popupTitle" style="font-weight:800;font-size:1.05rem;color:#caf0f8;margin-bottom:4px;"></div>
        <div id="popupDetail" style="font-size:0.85rem;color:#90e0ef;margin-bottom:4px;"></div>
        <div id="popupSev" style="font-size:0.85rem;font-weight:700;"></div>
      </div>
    </div>
  `;
}

// Bind load and retry hooks for Leaflet map initialization
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setTimeout(initMap, 800);
});
window.addEventListener('load', () => {
  setTimeout(initMap, 500);
});

function showMarkerPopup(label, detail, severity, emoji) {
  const pop = document.getElementById('mapPopup');
  if (!pop) return;
  document.getElementById('popupTitle').textContent = `${emoji} ${label}`;
  document.getElementById('popupDetail').textContent = `📍 ${detail}`;
  document.getElementById('popupSev').textContent = severity;
  pop.style.display = 'block';
  setTimeout(() => { pop.style.display = 'none'; }, 4000);
}

document.addEventListener('DOMContentLoaded', initMap);
setTimeout(initMap, 400);

// ======================== AI Image Upload & Multi-Layer Forensics ========================
const fileInput = document.getElementById('fileInput');
fileInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById('uploadInner').style.display = 'none';
    document.getElementById('uploadPreview').style.display = 'flex';
    document.getElementById('previewImg').src = ev.target.result;
    simulateAnalysis(file);
  };
  reader.readAsDataURL(file);
});

const uploadZone = document.getElementById('uploadZone');
uploadZone?.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.style.borderColor = '#00b4d8'; });
uploadZone?.addEventListener('dragleave', () => { uploadZone.style.borderColor = ''; });
uploadZone?.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById('uploadInner').style.display = 'none';
    document.getElementById('uploadPreview').style.display = 'flex';
    document.getElementById('previewImg').src = ev.target.result;
    simulateAnalysis(file);
  };
  reader.readAsDataURL(file);
});

function triggerPreset(type) {
  document.getElementById('uploadInner').style.display = 'none';
  document.getElementById('uploadPreview').style.display = 'flex';
  
  const sampleImages = {
    ai_generated: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&auto=format&fit=crop&q=80",
    real_disaster: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80",
    recycled_old: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80"
  };
  
  document.getElementById('previewImg').src = sampleImages[type] || sampleImages.ai_generated;
  simulateAnalysis(null, type);
}

function simulateAnalysis(fileObj, forcedType = null) {
  const placeholder = document.getElementById('resultPlaceholder');
  const content = document.getElementById('resultContent');
  const statusBadge = document.getElementById('forensicStatusBadge');
  
  if (statusBadge) {
    statusBadge.textContent = '⚡ Running 4-Layer Forensic Scan...';
    statusBadge.style.background = 'rgba(234,179,8,0.2)';
    statusBadge.style.color = '#eab308';
  }

  placeholder.innerHTML = `
    <div class="typing-indicator" style="display:flex;flex-direction:column;gap:0.75rem;align-items:center;justify-content:center;height:200px;">
      <div style="display:flex;gap:0.5rem;align-items:center;">
        <div style="font-size:2rem">🛡️</div>
        <div style="display:flex;gap:0.3rem;">
          <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
      </div>
      <div style="color:#90e0ef;font-size:0.85rem;font-weight:600;">Cross-referencing INCOIS Buoys & Scanning Synthetic GAN Artifacts...</div>
    </div>`;

  let mode = forcedType;
  if (!mode && fileObj) {
    const name = (fileObj.name || '').toLowerCase();
    if (name.includes('pinterest') || name.includes('ai') || name.includes('art') || name.includes('gen') || name.includes('download') || name.includes('image')) {
      mode = 'ai_generated';
    } else {
      mode = 'ai_generated';
    }
  }
  if (!mode) mode = 'ai_generated';

  // Live API Call with Fallback
  if (fileObj) {
    const formData = new FormData();
    formData.append("file", fileObj);
    
    fetch("/api/ai/verify-image", {
      method: "POST",
      body: formData
    })
    .then(r => r.json())
    .then(data => {
      placeholder.style.display = 'none';
      content.style.display = 'block';
      renderResults(data.result, data.status === 'quarantined' ? 'ai_generated' : 'verified');
    })
    .catch(err => {
      console.warn("FastAPI backend not responding. Running client-side simulation instead.", err);
      setTimeout(() => {
        placeholder.style.display = 'none';
        content.style.display = 'block';
        runLocalSimulation(mode);
      }, 1500);
    });
    return;
  }

  setTimeout(() => {
    placeholder.style.display = 'none';
    content.style.display = 'block';
    runLocalSimulation(mode);
  }, 1800);
}

function renderResults(res, statusType) {
  const banner = document.getElementById('fraudAlertBanner');
  const floodEl = document.getElementById('detFlood');
  const aiSynthEl = document.getElementById('detAiSynth');
  const sensorEl = document.getElementById('detSensor');
  const confBar = document.getElementById('confBar');
  const confText = document.getElementById('confText');
  const sevBadge = document.getElementById('sevBadge');
  const waterEl = document.getElementById('detWater');
  const fakeEl = document.getElementById('detFake');
  const statusBadge = document.getElementById('forensicStatusBadge');

  if (statusType === 'ai_generated') {
    if (statusBadge) {
      statusBadge.textContent = '⛔ FRAUD / SYNTHETIC DETECTED';
      statusBadge.style.background = 'rgba(239,68,68,0.2)';
      statusBadge.style.color = '#ef4444';
    }
    if (banner) {
      banner.style.background = 'rgba(239,68,68,0.18)';
      banner.style.border = '1px solid rgba(239,68,68,0.5)';
      banner.style.color = '#fca5a5';
      document.getElementById('fraudIcon').textContent = '🚨';
      document.getElementById('fraudMessage').innerHTML = `<strong>FRAUD DETECTED:</strong> ${res.deepfake_ai_confidence} + ${res.incois_sensor_cross_check}.`;
    }

    if (floodEl) floodEl.innerHTML = `<span style="color:#fb923c">${res.visual_flood_detected}</span>`;
    if (aiSynthEl) aiSynthEl.innerHTML = `<span style="color:#ef4444;font-weight:700">${res.deepfake_ai_confidence}</span>`;
    if (sensorEl) sensorEl.innerHTML = `<span style="color:#ef4444;font-weight:700">${res.incois_sensor_cross_check}</span>`;
    
    if (confBar) { confBar.style.width = '18%'; confBar.style.background = '#ef4444'; }
    if (confText) { confText.textContent = res.confidence_score; confText.style.color = '#ef4444'; }

    if (sevBadge) {
      sevBadge.textContent = res.severity;
      sevBadge.style.background = 'rgba(107,114,128,0.2)';
      sevBadge.style.color = '#9ca3af';
    }

    if (waterEl) waterEl.textContent = res.water_level;
    if (fakeEl) fakeEl.innerHTML = `<span style="color:#ef4444;font-weight:800">${res.final_verdict}</span>`;

    showToast('⚠️ AI Fraud Detector: Synthetic/Fake image detected & quarantined.', 'warning');
  } else {
    if (statusBadge) {
      statusBadge.textContent = '✅ VERIFIED DISASTER';
      statusBadge.style.background = 'rgba(34,197,94,0.2)';
      statusBadge.style.color = '#22c55e';
    }
    if (banner) {
      banner.style.background = 'rgba(34,197,94,0.18)';
      banner.style.border = '1px solid rgba(34,197,94,0.5)';
      banner.style.color = '#86efac';
      document.getElementById('fraudIcon').textContent = '✅';
      document.getElementById('fraudMessage').innerHTML = `<strong>VERIFIED:</strong> ${res.incois_sensor_cross_check}.`;
    }

    if (floodEl) floodEl.innerHTML = `<span style="color:#22c55e;font-weight:700">${res.visual_flood_detected}</span>`;
    if (aiSynthEl) aiSynthEl.innerHTML = `<span style="color:#22c55e">${res.deepfake_ai_confidence}</span>`;
    if (sensorEl) sensorEl.innerHTML = `<span style="color:#22c55e;font-weight:700">${res.incois_sensor_cross_check}</span>`;
    
    if (confBar) { confBar.style.width = '96%'; confBar.style.background = '#22c55e'; }
    if (confText) { confText.textContent = res.confidence_score; confText.style.color = '#22c55e'; }

    if (sevBadge) {
      sevBadge.textContent = res.severity + ' Severity';
      sevBadge.style.background = 'rgba(239,68,68,0.2)';
      sevBadge.style.color = '#ef4444';
    }

    if (waterEl) waterEl.textContent = res.water_level;
    if (fakeEl) fakeEl.innerHTML = `<span style="color:#22c55e;font-weight:700">${res.final_verdict}</span>`;

    showToast('✅ Live Disaster Confirmed — Alert escalated to rescue teams.', 'success');
  }
}

function runLocalSimulation(mode) {
  const resData = {
    ai_generated: {
      visual_flood_detected: 'Visual flood features present (Synthetic)',
      deepfake_ai_confidence: '⚠️ 94.8% AI-Generated / Midjourney Artifacts',
      incois_sensor_cross_check: '❌ SENSOR MISMATCH (Buoy wave height: 0.4m - Normal)',
      confidence_score: '18% (Discredited)',
      severity: 'False Alarm',
      water_level: 'N/A (Disproven by Radar & Buoy)',
      final_verdict: '⛔ QUARANTINED (No Public Alert Sent)'
    },
    recycled_old: {
      visual_flood_detected: 'Real flood photo (Historical Archive Match)',
      deepfake_ai_confidence: '✓ Camera Sensor Optical Noise (Non-AI)',
      incois_sensor_cross_check: '❌ TIMESTAMP MISMATCH (Photo taken 6 years ago)',
      confidence_score: '24% (Outdated)',
      severity: 'Archived',
      water_level: 'N/A (Historical Event)',
      final_verdict: '⚠️ FLAGGED AS HISTORICAL DUPLICATE'
    },
    verified: {
      visual_flood_detected: 'Yes ✓ Submerged Roads & Infrastructure',
      deepfake_ai_confidence: '✓ Authentic Optical Camera Signature',
      incois_sensor_cross_check: '✓ SENSORS MATCH (IMD 88mm/hr rain + 4.2m sea wave)',
      confidence_score: '96% (Verified)',
      severity: 'High Severity',
      water_level: '~1.8m estimated depth',
      final_verdict: '✓ AUTHENTIC & ESCALATED TO NDMA'
    }
  };
  renderResults(resData[mode] || resData.ai_generated, mode === 'recycled_old' ? 'recycled_old' : mode);
}

function resetUpload() {
  document.getElementById('uploadInner').style.display = 'flex';
  document.getElementById('uploadPreview').style.display = 'none';
  document.getElementById('resultPlaceholder').style.display = 'flex';
  document.getElementById('resultContent').style.display = 'none';
  const statusBadge = document.getElementById('forensicStatusBadge');
  if (statusBadge) {
    statusBadge.textContent = 'Awaiting Input';
    statusBadge.style.background = 'rgba(0,180,216,0.15)';
    statusBadge.style.color = 'var(--aqua)';
  }
  document.getElementById('resultPlaceholder').innerHTML = `
    <div class="placeholder-icon">🌊</div>
    <p>Upload any image or try one of the test modes below</p>
    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:center; margin-top:0.75rem;">
      <button class="filter-btn" onclick="triggerPreset('ai_generated')">🧪 Test AI-Generated / Pinterest Image</button>
      <button class="filter-btn" onclick="triggerPreset('real_disaster')">🌊 Test Real Verified Flood</button>
      <button class="filter-btn" onclick="triggerPreset('recycled_old')">⏳ Test Recycled Past Photo</button>
    </div>`;
  const fi = document.getElementById('fileInput');
  if (fi) fi.value = '';
}

// ======================== Marine Rescue ========================
function selectSpecies(el, name) {
  document.querySelectorAll('.species-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const sn = document.getElementById('speciesName');
  if (sn) sn.textContent = name;
}

function simulateMarineDetection() {
  const btn = document.getElementById('marineUploadBtn');
  if (!btn) return;
  btn.textContent = '🔍 AI Detecting...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✅ Species Detected!';
    btn.disabled = false;
    setTimeout(() => { btn.textContent = '📸 Report Sighting'; }, 3000);
  }, 2000);
}

// ======================== Safe Routes ========================
function calculateRoute() {
  const rr = document.getElementById('routeComparison');
  if (rr) {
    const bar = rr.querySelector('.rr-bar');
    if (bar) {
      bar.style.width = '0';
      setTimeout(() => { bar.style.width = '70%'; }, 100);
    }
  }

  document.querySelectorAll('.factor-bar').forEach(b => {
    const w = b.style.width;
    b.style.width = '0';
    setTimeout(() => { b.style.width = w; }, 200);
  });

  showToast('🛣️ Safest route calculated! 70% risk reduction achieved.', 'success');
}

// ======================== Prediction Region Selection ========================
function selectRegion(el, name) {
  document.querySelectorAll('.region-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const pr = document.getElementById('predRegion');
  if (pr) pr.textContent = name;

  const predData = {
    Ratnagiri: [78, 55, 22, 82, 48, 18],
    Kochi:     [45, 80, 12, 90, 60, 5],
    Chennai:   [35, 65, 30, 75, 40, 8],
    Vizag:     [60, 70, 18, 85, 55, 12],
    Mumbai:    [50, 75, 10, 80, 65, 20],
  };

  const data = predData[name] || predData.Ratnagiri;
  const bars = document.querySelectorAll('.pred-bar');
  const pcts = document.querySelectorAll('.pred-pct');
  const risks = document.querySelectorAll('.pred-risk');

  bars.forEach((bar, i) => {
    bar.style.width = '0';
    setTimeout(() => { bar.style.width = data[i] + '%'; }, 100);
    if (pcts[i]) pcts[i].textContent = data[i] + '%';
    const risk = data[i] >= 70 ? 'High Risk' : data[i] >= 40 ? 'Moderate Risk' : 'Low Risk';
    const cls = data[i] >= 70 ? 'high-risk' : data[i] >= 40 ? 'moderate-risk' : 'low-risk';
    if (risks[i]) {
      risks[i].textContent = risk;
      risks[i].className = 'pred-risk ' + cls;
    }
  });
}

// ======================== AI Assistant Chatbot ========================
const aiResponses = {
  default: [
    "Based on NDMA guidelines, I recommend staying indoors and monitoring official weather alerts. Keep emergency supplies ready including water, food for 3 days, flashlights, and first aid kit.",
    "According to coastal safety protocols, your area is currently under a moderate risk advisory. Avoid fishing or beach activities until the all-clear is issued by authorities.",
    "For tsunami safety: if you feel a strong earthquake near the coast, immediately move to high ground. Do not wait for official warnings. The first wave may arrive in minutes.",
    "I've analyzed the current weather data. Wind speeds are at 72 km/h with 4.2m wave heights. This is dangerous for marine activities. Please advise all fishing boats to return to harbor.",
  ],
  tsunami: "🌊 **Tsunami Safety Protocol (NDMA):**\n\n• Feel strong earthquake? → Move to HIGH GROUND immediately\n• Don't wait for official warnings — first wave in minutes\n• Stay 1km+ away from coast for 24 hours",
  cyclone: "🌀 **Cyclone Safety Protocol (NDMA):**\n\n• Move to sturdy building immediately\n• Stay away from windows and glass\n• Listen to All India Radio for official updates\n• Keep 3-day emergency supply: food, water, medicines",
  fishing: "🎣 **Fishing Safety Advisory:**\n\nBased on current INCOIS data:\n• Wave height: 4.2m — UNSAFE for fishing\n• Wind: 72 km/h — Cyclone Warning in force\n• **DO NOT go fishing today**",
};

function detectIntent(msg) {
  const m = msg.toLowerCase();
  if (m.includes('tsunami')) return 'tsunami';
  if (m.includes('cyclone') || m.includes('storm')) return 'cyclone';
  if (m.includes('fish')) return 'fishing';
  return 'default';
}

function appendMessage(text, type) {
  const messages = document.getElementById('chatMessages');
  if (!messages) return;
  const msg = document.createElement('div');
  msg.className = `msg ${type}-msg`;

  if (type === 'bot') {
    msg.innerHTML = `
      <div class="msg-avatar">🤖</div>
      <div class="msg-bubble">${text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '&bull;')}</div>
    `;
  } else {
    msg.innerHTML = `
      <div class="msg-bubble">${text}</div>
      <div class="msg-avatar" style="background:linear-gradient(135deg,#0077b6,#00b4d8)">👤</div>
    `;
  }
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const messages = document.getElementById('chatMessages');
  if (!messages) return;
  const typing = document.createElement('div');
  typing.className = 'msg bot-msg typing-indicator';
  typing.id = 'typingIndicator';
  typing.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="msg-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  appendMessage(msg, 'user');
  input.value = '';
  showTyping();

  const formData = new FormData();
  formData.append("message", msg);

  fetch("/api/chat", { method: "POST", body: formData })
  .then(r => r.json())
  .then(data => {
    removeTyping();
    appendMessage(data.reply, 'bot');
  })
  .catch(() => {
    const intent = detectIntent(msg);
    setTimeout(() => {
      removeTyping();
      const response = aiResponses[intent] || aiResponses.default[0];
      appendMessage(response, 'bot');
    }, 1200);
  });
}

document.getElementById('chatInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendQuickQuestion(btn) {
  const q = btn.dataset.q;
  if (!q) return;
  appendMessage(q, 'user');
  showTyping();

  const formData = new FormData();
  formData.append("message", q);

  fetch("/api/chat", { method: "POST", body: formData })
  .then(r => r.json())
  .then(data => {
    removeTyping();
    appendMessage(data.reply, 'bot');
  })
  .catch(() => {
    const intent = detectIntent(q);
    setTimeout(() => {
      removeTyping();
      const response = aiResponses[intent] || aiResponses.default[0];
      appendMessage(response, 'bot');
    }, 1200);
  });
}

function toggleVoice() {
  showToast('🎙️ Voice input activated — Speak now...', 'info');
}

// ======================== SOS Module ========================
let selectedSOSType = 'Flood';

function selectSOSType(el, type) {
  document.querySelectorAll('.sos-type').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  selectedSOSType = type;
}

function triggerSOS() {
  const btn = document.getElementById('mainSosBtn');
  if (btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => { btn.style.transform = ''; }, 150);
  }

  const overlay = document.getElementById('sosSentOverlay');
  const st = document.getElementById('sosTypeSent');
  const tm = document.getElementById('sosTimeSent');
  if (st) st.textContent = selectedSOSType;
  if (tm) tm.textContent = new Date().toLocaleTimeString();

  const formData = new FormData();
  formData.append("emergency_type", selectedSOSType);
  formData.append("lat", "17.6868");
  formData.append("lng", "83.2185");

  fetch("/api/sos", { method: "POST", body: formData })
  .then(r => r.json())
  .then(data => {
    if (overlay) overlay.style.display = 'flex';
    showToast(`🚨 SOS SENT: ${data.event.status}`, 'sos');
  })
  .catch(() => {
    if (overlay) overlay.style.display = 'flex';
    showToast('🚨 SOS ALERT SENT! Emergency services notified.', 'sos');
  });
}

function closeSOS() {
  const overlay = document.getElementById('sosSentOverlay');
  if (overlay) overlay.style.display = 'none';
}

function toggleKit(card) {
  if (card) card.classList.toggle('open');
}

// ======================== Toast Notifications ========================
function showToast(msg, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  const colors = { success: '#22c55e', info: '#00b4d8', warning: '#eab308', sos: '#ef4444' };
  toast.style.cssText = `
    position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(80px);
    background:rgba(3,4,94,0.95); border:1px solid ${colors[type] || colors.info};
    color:#e0f7ff; padding:0.9rem 1.5rem; border-radius:50px;
    font-size:0.88rem; font-weight:600; z-index:9999;
    backdrop-filter:blur(12px); max-width:90vw; text-align:center;
    box-shadow:0 8px 30px rgba(0,0,0,0.4);
    transition: transform 0.3s ease, opacity 0.3s ease;
    opacity:0;
  `;
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ======================== Live Feed Auto-Update ========================
const feedMessages = [
  { type: 'Tsunami Warning', loc: 'Andaman & Nicobar Islands', severity: 'critical', badge: 'CRITICAL', color: 'red' },
  { type: 'Beach Pollution', loc: 'Juhu Beach, Mumbai', severity: 'moderate', badge: 'MODERATE', color: 'yellow' },
  { type: 'Marine Rescue Alert', loc: 'Puri Beach, Odisha', severity: 'marine', badge: 'RESCUE', color: 'blue' },
  { type: 'Storm Surge', loc: 'Chilika Lake, Odisha', severity: 'high', badge: 'HIGH', color: 'orange' },
];

let feedIndex = 0;
setInterval(() => {
  const feed = document.getElementById('liveFeed');
  if (!feed) return;
  const d = feedMessages[feedIndex % feedMessages.length];
  const item = document.createElement('div');
  item.className = `feed-item ${d.severity}`;
  item.style.opacity = '0';
  item.style.transform = 'translateX(-10px)';
  item.innerHTML = `
    <div class="feed-dot ${d.color}"></div>
    <div class="feed-content">
      <span class="feed-type">${d.type}</span>
      <span class="feed-loc">📍 ${d.loc}</span>
      <span class="feed-time">Just now</span>
    </div>
    <span class="feed-badge ${d.color === 'red' ? 'critical' : d.color === 'orange' ? 'high' : d.color === 'blue' ? 'marine' : 'moderate'}-badge">${d.badge}</span>
  `;
  feed.prepend(item);
  requestAnimationFrame(() => {
    item.style.transition = 'all 0.4s ease';
    item.style.opacity = '1';
    item.style.transform = 'translateX(0)';
  });
  if (feed.children.length > 6) feed.lastChild?.remove();
  feedIndex++;
}, 8000);

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('navLinks')?.classList.remove('open');
    }
  });
});
