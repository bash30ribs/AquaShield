import { useState, useEffect, useRef } from 'react';

/* ── Images ──────────────────────────────────────────────────────────── */
const IMG = {
  hero:        'https://images.unsplash.com/photo-1647441167595-2db0166db955?w=1920&h=1080&fit=crop&auto=format',
  navScreen:   'https://images.unsplash.com/photo-1757882585667-dffbeaaabb81?w=1400&h=900&fit=crop&auto=format',
  navalShip:   'https://images.unsplash.com/photo-1771331515085-e3eaa2f8b64d?w=800&h=600&fit=crop&auto=format',
  buoy:        'https://images.unsplash.com/photo-1534303891689-1fb2f8155c70?w=800&h=600&fit=crop&auto=format',
  deepOcean:   'https://images.unsplash.com/photo-1668110648714-1070e851f855?w=800&h=600&fit=crop&auto=format',
  aerialCoast: 'https://images.unsplash.com/photo-1783845028687-e68f846797b8?w=800&h=600&fit=crop&auto=format',
  lighthouse:  'https://images.unsplash.com/photo-1764746363615-fb6d995c07f7?w=800&h=600&fit=crop&auto=format',
  boatAtSea:   'https://images.unsplash.com/photo-1641900833685-2874c5ebd974?w=800&h=500&fit=crop&auto=format',
  underwaterRay:'https://images.unsplash.com/photo-1609079332148-ce057e967197?w=800&h=500&fit=crop&auto=format',
  coastalCity: 'https://images.unsplash.com/photo-1773238550140-3dbbaa82f361?w=800&h=500&fit=crop&auto=format',
};

/* ── Scroll-reveal hook ──────────────────────────────────────────────── */
function useReveal(variant: 'aq-reveal' | 'aq-reveal-left' | 'aq-reveal-right' | 'aq-reveal-scale' = 'aq-reveal') {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.classList.add('aq-revealed'); obs.disconnect(); }
      },
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, className: variant };
}

/* ── Staggered grid reveal ───────────────────────────────────────────── */
function useStaggerReveal(step = 80) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const itemStyle = (i: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.6s cubic-bezier(0.4,0,0.2,1) ${i * step}ms, transform 0.6s cubic-bezier(0.4,0,0.2,1) ${i * step}ms`,
  });

  return { ref, itemStyle };
}

/* ── Data ────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Intelligence', href: '#capabilities' },
  { label: 'Response', href: '#response' },
  { label: 'Marine', href: '#marine' },
  { label: 'Enterprise', href: '#enterprise' },
];

const CAPABILITIES = [
  {
    id: 'intel', tag: 'Sensor Network', name: 'Live Intel Feed',
    headline: 'Real-time ocean awareness, 24/7',
    body: 'A distributed network of 21 smart buoys streams live telemetry — wave height, temperature, salinity, vessel traffic, and chemical signatures — every 4 seconds.',
    img: IMG.buoy, accent: 'var(--ds-color-brand)',
  },
  {
    id: 'radar', tag: 'Marine Radar', name: 'Coastal Radar Map',
    headline: 'Full-spectrum vessel tracking',
    body: '360° phased-array radar overlaid on live GIS tiles. Tracks every vessel within 120 km, classifies by tonnage, and flags anomalous courses in real time.',
    img: IMG.navalShip, accent: 'var(--ds-color-violet)',
  },
  {
    id: 'evac', tag: 'Emergency Response', name: 'Evacuation Engine',
    headline: 'Optimal routes in under 2 seconds',
    body: 'Dynamic pathfinding calculates evacuation corridors using real-time flood modelling, road capacity, and population density. Updates every 30 seconds during an active event.',
    img: IMG.aerialCoast, accent: 'var(--ds-color-amber)',
  },
  {
    id: 'ai', tag: 'AI Systems', name: 'Threat Scanner',
    headline: 'AI forensics on every anomaly',
    body: 'Computer vision + spectral analysis on buoy feeds detects oil spills, algae blooms, illegal dumping, and unregistered vessels with 99.3% precision.',
    img: IMG.navScreen, accent: 'var(--ds-color-brand)',
  },
  {
    id: 'wildlife', tag: 'Marine Ecology', name: 'Wildlife Monitor',
    headline: 'Protecting what lives beneath',
    body: 'Passive hydrophone arrays and optical sensors track marine mammal migration, coral health, and protected-species zones — automatically alerting vessels.',
    img: IMG.deepOcean, accent: 'var(--ds-color-green)',
  },
  {
    id: 'sos', tag: 'Rescue Operations', name: 'Rescue SOS',
    headline: '90-second dispatch guarantee',
    body: 'AIS + EPIRB integration means AquaShield detects a distress signal, identifies the nearest asset, and dispatches within 90 seconds — automatically alerting the coast guard.',
    img: IMG.lighthouse, accent: 'var(--ds-color-coral)',
  },
];

const TECH_STACK = [
  { step: '01', name: 'Edge Sensors', desc: '21 smart buoys + shore radar + UAV feeds. Each node runs RISC-V processors with 72-hour battery backup and salt-resistant housing.', color: 'var(--ds-color-brand)' },
  { step: '02', name: 'Ocean Mesh', desc: 'LoRaWAN + 5G mesh fabric with <50ms end-to-end latency. Redundant satellite uplink maintains 99.97% uptime through adverse conditions.', color: 'var(--ds-color-violet)' },
  { step: '03', name: 'AI Core', desc: 'Edge-deployed transformer models classify threats in 38ms. Federated learning keeps updates private — no raw data leaves your zone.', color: 'var(--ds-color-green)' },
  { step: '04', name: 'Command HUD', desc: 'A unified dashboard streams all sensor data, active alerts, evacuation routes, and dispatch status in a single composable view.', color: 'var(--ds-color-amber)' },
];

const NEWS = [
  { date: 'Sep 20, 2026', category: 'Research', title: 'AquaShield AI detects illegal trawler 18 hours before manual patrol would have', img: IMG.boatAtSea, readTime: '5 min' },
  { date: 'Sep 14, 2026', category: 'Emergency Response', title: "How AquaShield's Evacuation Engine routed 47,000 residents during Cyclone Mira", img: IMG.coastalCity, readTime: '7 min' },
  { date: 'Sep 7, 2026', category: 'Marine Ecology', title: 'Hydrophone array identifies 3 new humpback whale migration corridors in Pacific data', img: IMG.underwaterRay, readTime: '4 min' },
];

const PARTNERS = ['US Coast Guard', 'NOAA', 'FEMA', 'US Navy', 'WWF Ocean', 'IMO', 'IUCN', 'MBARI', 'NATO Maritime', 'Greenpeace', 'Interpol Maritime', 'SeaWatch'];

const FOOTER_COLS = [
  { heading: 'Platform', links: ['Command HUD', 'Live Intel Feed', 'Radar Map', 'AI Scanner', 'Evacuation Engine', 'Rescue SOS'] },
  { heading: 'Intelligence', links: ['Threat Detection', 'Marine Wildlife', 'Flood Modelling', 'Vessel Tracking', 'Oil Spill AI', 'Alert System'] },
  { heading: 'Response', links: ['Rescue Dispatch', 'Evacuation Routes', 'SOS Integration', 'Coast Guard API', 'Protocols', 'Case Studies'] },
  { heading: 'Organisation', links: ['About', 'Research', 'Partner Agencies', 'Careers', 'Press', 'Contact'] },
];

/* ── Style helpers ───────────────────────────────────────────────────── */
const ds = (font: string) => (extra?: React.CSSProperties): React.CSSProperties => ({ fontFamily: font, ...extra });
const display = ds('var(--ds-font-display)');
const body    = ds('var(--ds-font-body)');
const mono    = ds('var(--ds-font-mono)');

/* ── Injected CSS ────────────────────────────────────────────────────── */
const CSS = `
  .aq-nav-links { display: flex; }
  .aq-nav-right { display: flex; }
  .aq-hamburger { display: none !important; }
  .aq-caps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: var(--ds-space-4); }
  .aq-tech-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: var(--ds-space-5); }
  .aq-news-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: var(--ds-space-6); }
  .aq-footer-grid { display: grid; grid-template-columns: 240px repeat(4,1fr); gap: var(--ds-space-10); }
  .aq-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); }
  .aq-split-grid { display: grid; grid-template-columns: 1fr 1fr; }
  .aq-resp-grid  { display: grid; grid-template-columns: 1fr 1fr; align-items: stretch; }

  .aq-marquee { display:flex; width:max-content; animation:aq-marquee 34s linear infinite; }
  .aq-marquee:hover { animation-play-state:paused; }

  .aq-card { cursor:pointer; transition: border-color var(--ds-transition-base), transform var(--ds-transition-base); }
  .aq-card:hover { border-color: var(--ds-border-default) !important; transform: translateY(-3px); }
  .aq-card:hover .aq-card-img { transform: scale(1.04); }
  .aq-card-img { transition: transform 600ms cubic-bezier(0.4,0,0.2,1); }

  .aq-nav-link { position:relative; }
  .aq-nav-link::after { content:''; position:absolute; bottom:-1px; left:0; right:0; height:1px; background:var(--ds-color-brand); transform:scaleX(0); transform-origin:left; transition:transform 200ms ease; }
  .aq-nav-link:hover { color: var(--ds-text-primary) !important; }
  .aq-nav-link:hover::after { transform:scaleX(1); }

  .aq-btn-primary { transition: opacity var(--ds-transition-fast), transform var(--ds-transition-fast); }
  .aq-btn-primary:hover { opacity:0.86; transform:translateY(-1px); }
  .aq-btn-ghost { transition: background var(--ds-transition-fast), border-color var(--ds-transition-fast); }
  .aq-btn-ghost:hover { background: rgba(255,255,255,0.05) !important; border-color: var(--ds-border-strong) !important; }

  .aq-tl { transition: border-color var(--ds-transition-base), transform var(--ds-transition-base); }
  .aq-tl:hover { border-color: var(--ds-border-default) !important; transform: translateY(-3px); }

  @media(max-width:1100px){
    .aq-caps-grid { grid-template-columns: repeat(2,1fr); }
    .aq-tech-grid { grid-template-columns: repeat(2,1fr); }
    .aq-footer-grid { grid-template-columns: 1fr 1fr 1fr; }
    .aq-split-grid { grid-template-columns: 1fr; }
    .aq-resp-grid  { grid-template-columns: 1fr; }
  }
  @media(max-width:900px){
    .aq-news-grid { grid-template-columns: 1fr; }
  }
  @media(max-width:768px){
    .aq-nav-links { display:none !important; }
    .aq-nav-right { display:none !important; }
    .aq-hamburger { display:flex !important; }
    .aq-caps-grid { grid-template-columns: 1fr; }
    .aq-stats-grid { grid-template-columns: 1fr 1fr; }
    .aq-footer-grid { grid-template-columns: 1fr 1fr; }
    .aq-hero-side { display:none !important; }
  }
  @media(max-width:480px){
    .aq-footer-grid { grid-template-columns: 1fr; }
  }
`;

/* ── Logo ────────────────────────────────────────────────────────────── */
function ShieldIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M11 2.5L19.5 6.5V12C19.5 16.5 11 20 11 20C11 20 2.5 16.5 2.5 12V6.5Z" stroke="var(--ds-color-brand)" strokeWidth="1.4"/>
      <path d="M6.5 12.5 Q8.75 10 11 12.5 Q13.25 15 15.5 12.5" stroke="var(--ds-color-brand)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Radar Scope ─────────────────────────────────────────────────────── */
function RadarScope({ size = 130 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'radial-gradient(circle, rgba(42,184,216,0.04) 0%, rgba(2,6,9,0.98) 75%)', border: '1px solid var(--ds-border-default)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      {[0.32, 0.58, 0.82].map((r, i) => (
        <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: `${r * 100}%`, height: `${r * 100}%`, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
      ))}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '48%', height: 1, marginTop: -0.5, transformOrigin: '0 50%', animation: 'aq-radar-sweep 3.5s linear infinite', background: 'linear-gradient(90deg, rgba(42,184,216,0.5), transparent)' }} />
      {[{ top: '26%', left: '60%' }, { top: '62%', left: '36%' }, { top: '72%', left: '66%' }].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...pos, width: 3, height: 3, borderRadius: '50%', background: 'var(--ds-color-brand)', opacity: 0.75 }} />
      ))}
    </div>
  );
}

/* ── Navbar ──────────────────────────────────────────────────────────── */
function Navbar({ scrolled, booted, menuOpen, setMenuOpen }: {
  scrolled: boolean; booted: boolean; menuOpen: boolean; setMenuOpen: (v: boolean) => void;
}) {
  return (
    <header style={{
      position: 'fixed', inset: '0 0 auto 0', zIndex: 200,
      height: 'var(--ds-nav-height)',
      background: scrolled ? 'rgba(2,6,9,0.96)' : 'rgba(2,6,9,0.65)',
      backdropFilter: 'blur(18px)',
      borderBottom: scrolled ? '1px solid var(--ds-border-subtle)' : '1px solid transparent',
      transition: 'background 350ms ease, border-color 350ms ease',
      animation: booted ? 'aq-nav-in 0.55s cubic-bezier(0.4,0,0.2,1) both' : 'none',
    }}>
      <div style={{ maxWidth: 'var(--ds-max-width)', margin: '0 auto', height: '100%', padding: '0 var(--ds-space-6)', display: 'flex', alignItems: 'center', gap: 'var(--ds-space-8)' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ds-bg-raised)' }}>
            <ShieldIcon />
          </div>
          <div>
            <div style={display({ fontWeight: 'var(--ds-weight-bold)', fontSize: 'var(--ds-text-lg)', letterSpacing: '-0.025em', color: 'var(--ds-text-primary)', lineHeight: 1 })}>AquaShield</div>
            <div style={mono({ fontSize: '0.58rem', color: 'var(--ds-text-muted)', letterSpacing: '0.1em' })}>SENTINEL PLATFORM</div>
          </div>
        </a>

        <nav className="aq-nav-links" style={{ flex: 1, alignItems: 'center', gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <a key={item.label} href={item.href} className="aq-nav-link"
              style={body({ fontSize: 'var(--ds-text-sm)', fontWeight: 'var(--ds-weight-medium)', color: 'var(--ds-text-secondary)', padding: '8px 13px', borderRadius: 'var(--ds-radius-md)' })}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="aq-nav-right" style={{ alignItems: 'center', gap: 'var(--ds-space-3)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--ds-bg-raised)', border: '1px solid var(--ds-border-subtle)', borderRadius: 'var(--ds-radius-full)', padding: '4px 12px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ds-color-green)', flexShrink: 0 }} />
            <span style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-secondary)', letterSpacing: '0.06em' })}>21/21 Buoys Online</span>
          </div>
          <a href="#enterprise" className="aq-btn-primary"
            style={body({ fontSize: 'var(--ds-text-sm)', fontWeight: 'var(--ds-weight-semibold)', color: 'var(--ds-bg-base)', background: 'var(--ds-color-brand)', padding: '7px 18px', borderRadius: 'var(--ds-radius-md)' })}>
            Deploy Now
          </a>
        </div>

        <button className="aq-hamburger" aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ds-text-primary)', padding: 8, marginLeft: 'auto', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {menuOpen
              ? <><line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>
              : <><line x1="2" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="2" y1="14" x2="18" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div style={{ background: 'rgba(2,6,9,0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--ds-border-subtle)', padding: 'var(--ds-space-5) var(--ds-space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-2)' }}>
          {NAV_ITEMS.map((item) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
              style={body({ fontSize: 'var(--ds-text-lg)', fontWeight: 'var(--ds-weight-medium)', color: 'var(--ds-text-secondary)', padding: 'var(--ds-space-3) var(--ds-space-4)', borderBottom: '1px solid var(--ds-border-subtle)' })}>
              {item.label}
            </a>
          ))}
          <a href="#enterprise" onClick={() => setMenuOpen(false)}
            style={body({ marginTop: 'var(--ds-space-3)', fontSize: 'var(--ds-text-base)', fontWeight: 'var(--ds-weight-semibold)', color: 'var(--ds-bg-base)', background: 'var(--ds-color-brand)', padding: 'var(--ds-space-3) var(--ds-space-4)', borderRadius: 'var(--ds-radius-md)', textAlign: 'center' as const })}>
            Deploy Now
          </a>
        </div>
      )}
    </header>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────── */
function Hero({ booted }: { booted: boolean }) {
  const fade = (delay: number): React.CSSProperties => ({
    opacity: booted ? 1 : 0,
    transform: booted ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
  });

  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: 640, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--ds-bg-base)' }}>
      <img src={IMG.hero} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', opacity: booted ? 0.38 : 0, transition: 'opacity 1.4s ease 200ms' }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(2,6,9,0.5) 0%, rgba(2,6,9,0.06) 40%, rgba(2,6,9,0.7) 78%, var(--ds-bg-base) 100%)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 70% 45% at 50% 55%, black 20%, transparent 100%)', pointerEvents: 'none' }} />

      {/* Buoy widget */}
      <div className="aq-hero-side" style={{ position: 'absolute', left: '5%', top: '32%', ...fade(900), pointerEvents: 'none' }}>
        <div style={{ background: 'var(--ds-bg-card)', border: '1px solid var(--ds-border-default)', borderRadius: 'var(--ds-radius-xl)', padding: 'var(--ds-space-5)', width: 194 }}>
          <div style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', letterSpacing: '0.1em', marginBottom: 'var(--ds-space-3)' })}>BUOY NETWORK</div>
          {[{ id: 'B-04', wave: '1.2 m', ok: true }, { id: 'B-07', wave: '1.8 m', ok: true }, { id: 'B-12', wave: '3.4 m', ok: false }].map((b) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--ds-border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: b.ok ? 'var(--ds-color-green)' : 'var(--ds-color-amber)', flexShrink: 0 }} />
                <span style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-secondary)' })}>{b.id}</span>
              </div>
              <span style={mono({ fontSize: 'var(--ds-text-xs)', color: b.ok ? 'var(--ds-text-muted)' : 'var(--ds-color-amber)' })}>{b.wave}</span>
            </div>
          ))}
          <div style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-color-green)', textAlign: 'right' as const, marginTop: 'var(--ds-space-2)' })}>21/21 online</div>
        </div>
      </div>

      {/* Radar widget */}
      <div className="aq-hero-side" style={{ position: 'absolute', right: '6%', top: '20%', ...fade(1100), pointerEvents: 'none' }}>
        <div style={{ background: 'var(--ds-bg-card)', border: '1px solid var(--ds-border-default)', borderRadius: 'var(--ds-radius-xl)', padding: 'var(--ds-space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--ds-space-3)' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ds-color-brand)', flexShrink: 0 }} />
            <span style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', letterSpacing: '0.1em' })}>ZONE 4 RADAR</span>
          </div>
          <RadarScope size={126} />
          <div style={{ marginTop: 'var(--ds-space-3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[['3', 'Vessels'], ['0', 'Threats']].map(([n, l]) => (
              <div key={l} style={{ background: 'var(--ds-bg-raised)', border: '1px solid var(--ds-border-subtle)', borderRadius: 'var(--ds-radius-md)', padding: '5px 8px', textAlign: 'center' as const }}>
                <div style={display({ fontSize: 'var(--ds-text-xl)', fontWeight: 'var(--ds-weight-bold)', color: 'var(--ds-text-primary)', lineHeight: 1 })}>{n}</div>
                <div style={mono({ fontSize: '0.6rem', color: 'var(--ds-text-muted)', letterSpacing: '0.06em' })}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copy */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' as const, padding: '0 var(--ds-space-6)', maxWidth: 820 }}>
        <div style={{ ...fade(300), marginBottom: 'var(--ds-space-5)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ds-bg-raised)', border: '1px solid var(--ds-border-default)', borderRadius: 'var(--ds-radius-full)', padding: '4px 14px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ds-color-brand)', flexShrink: 0 }} />
            <span style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-secondary)', letterSpacing: '0.08em' })}>AquaShield Sentinel · v4.2 · System Online</span>
          </span>
        </div>
        <h1 style={{ ...fade(420), fontFamily: 'var(--ds-font-display)', fontSize: 'clamp(2.8rem, 7.5vw, 6.5rem)', fontWeight: 'var(--ds-weight-extrabold)', lineHeight: 'var(--ds-leading-tight)', letterSpacing: '-0.05em', color: 'var(--ds-text-primary)', marginBottom: 'var(--ds-space-4)' }}>
          Coastal Intelligence.<br />Never Blinks.
        </h1>
        <p style={{ ...fade(560), fontFamily: 'var(--ds-font-body)', fontSize: 'clamp(var(--ds-text-base), 2vw, var(--ds-text-xl))', color: 'var(--ds-text-secondary)', lineHeight: 'var(--ds-leading-relaxed)', maxWidth: 560, margin: '0 auto var(--ds-space-10)' }}>
          21 smart buoys. 847 km² of real-time coverage. 38ms AI threat detection. AquaShield protects coastlines, lives, and marine ecosystems — without pause.
        </p>
        <div style={{ ...fade(700), display: 'flex', gap: 'var(--ds-space-4)', justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <a href="#enterprise" className="aq-btn-primary"
            style={body({ fontSize: 'var(--ds-text-base)', fontWeight: 'var(--ds-weight-semibold)', color: 'var(--ds-bg-base)', background: 'var(--ds-color-brand)', padding: 'var(--ds-space-3) var(--ds-space-8)', borderRadius: 'var(--ds-radius-md)' })}>
            Deploy in Your Zone
          </a>
          <a href="#platform" className="aq-btn-ghost"
            style={body({ fontSize: 'var(--ds-text-base)', fontWeight: 'var(--ds-weight-medium)', color: 'var(--ds-text-primary)', background: 'transparent', border: '1px solid var(--ds-border-default)', padding: 'var(--ds-space-3) var(--ds-space-8)', borderRadius: 'var(--ds-radius-md)' })}>
            View Platform ↓
          </a>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', opacity: booted ? 0.28 : 0, transition: 'opacity 1s ease 1.4s' }}>
        <div style={{ width: 18, height: 28, border: '1.5px solid var(--ds-border-strong)', borderRadius: 10, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 4 }}>
          <div style={{ width: 2, height: 5, background: 'var(--ds-text-secondary)', borderRadius: 2 }} />
        </div>
      </div>
    </section>
  );
}

/* ── Alert Ticker ────────────────────────────────────────────────────── */
function AlertTicker() {
  const items = [
    'BUOY B-12 — Wave height elevated 3.4m · Monitoring',
    'All 21 buoys nominal · Last sync 4s ago',
    'Tidal surge forecast +0.6m at 02:00 UTC · Zone 2',
    'Whale migration corridor active — vessel caution Zone 7',
    'AquaShield Sentinel v4.2.1 · No active threats',
    'Mesh uplink 99.97% · Satellite backup standby',
  ];
  const doubled = [...items, ...items];
  return (
    <div style={{ borderTop: '1px solid var(--ds-border-subtle)', borderBottom: '1px solid var(--ds-border-subtle)', background: 'var(--ds-bg-surface)', height: 36, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
      <div className="aq-marquee" style={{ alignItems: 'center' }}>
        {doubled.map((item, i) => (
          <span key={i} style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', padding: '0 var(--ds-space-10)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 'var(--ds-space-10)', letterSpacing: '0.03em' })}>
            {item}<span style={{ opacity: 0.25 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Stats Strip ──────────────────────────────────────────────────────── */
function StatsStrip() {
  const { ref, itemStyle } = useStaggerReveal(90);
  const items = [
    { value: '21/21', label: 'Buoys Online',      green: true  },
    { value: '847 km²', label: 'Coverage Area',   green: false },
    { value: '0',       label: 'Active Incidents', green: true  },
    { value: '38 ms',   label: 'AI Response Time', green: false },
  ];
  return (
    <div style={{ background: 'var(--ds-bg-surface)', borderBottom: '1px solid var(--ds-border-subtle)' }}>
      <div ref={ref} className="aq-stats-grid" style={{ maxWidth: 'var(--ds-max-width)', margin: '0 auto' }}>
        {items.map((s, i) => (
          <div key={i} style={{ ...itemStyle(i), padding: 'var(--ds-space-8)', borderRight: i < 3 ? '1px solid var(--ds-border-subtle)' : 'none' }}>
            <div style={display({ fontSize: 'var(--ds-text-4xl)', fontWeight: 'var(--ds-weight-extrabold)', letterSpacing: '-0.03em', color: s.green ? 'var(--ds-color-green)' : 'var(--ds-text-primary)', lineHeight: 1, marginBottom: 'var(--ds-space-1)' })}>
              {s.value}
            </div>
            <div style={body({ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-muted)', fontWeight: 'var(--ds-weight-medium)' })}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Platform Spotlight ───────────────────────────────────────────────── */
function PlatformSpotlight() {
  const h = useReveal();
  const l = useReveal('aq-reveal-left');
  const r = useReveal('aq-reveal-right');
  return (
    <section id="platform" style={{ background: 'var(--ds-bg-base)', padding: 'var(--ds-space-24) var(--ds-space-6)' }}>
      <div style={{ maxWidth: 'var(--ds-max-width)', margin: '0 auto' }}>
        <div ref={h.ref} className={h.className} style={{ marginBottom: 'var(--ds-space-10)' }}>
          <div style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-color-brand)', letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: 'var(--ds-space-3)' })}>The Platform</div>
          <h2 style={display({ fontSize: 'clamp(var(--ds-text-3xl), 4vw, var(--ds-text-5xl))', fontWeight: 'var(--ds-weight-bold)', letterSpacing: '-0.04em', lineHeight: 'var(--ds-leading-tight)', color: 'var(--ds-text-primary)', maxWidth: 600 })}>
            One command layer for the entire coastline.
          </h2>
        </div>

        <div className="aq-split-grid" style={{ border: '1px solid var(--ds-border-subtle)', borderRadius: 'var(--ds-radius-2xl)', overflow: 'hidden' }}>
          <div ref={l.ref} className={l.className} style={{ position: 'relative', minHeight: 480, background: 'var(--ds-bg-raised)', overflow: 'hidden' }}>
            <img src={IMG.navScreen} alt="AquaShield Command HUD" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, var(--ds-bg-raised) 100%)' }} />
            {[
              { top: 16, left: 16, borderTop: '1.5px solid rgba(42,184,216,0.4)', borderLeft: '1.5px solid rgba(42,184,216,0.4)' },
              { top: 16, right: 16, borderTop: '1.5px solid rgba(42,184,216,0.4)', borderRight: '1.5px solid rgba(42,184,216,0.4)' },
              { bottom: 16, left: 16, borderBottom: '1.5px solid rgba(42,184,216,0.4)', borderLeft: '1.5px solid rgba(42,184,216,0.4)' },
              { bottom: 16, right: 16, borderBottom: '1.5px solid rgba(42,184,216,0.4)', borderRight: '1.5px solid rgba(42,184,216,0.4)' },
            ].map((c, i) => <div key={i} aria-hidden style={{ position: 'absolute', width: 22, height: 22, ...c }} />)}
            <div style={{ position: 'absolute', top: 'var(--ds-space-4)', left: 'var(--ds-space-4)', background: 'rgba(2,6,9,0.8)', border: '1px solid var(--ds-border-default)', borderRadius: 'var(--ds-radius-sm)', padding: '3px 10px' }}>
              <span style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-secondary)', letterSpacing: '0.08em' })}>COMMAND HUD · LIVE</span>
            </div>
          </div>

          <div ref={r.ref} className={r.className} style={{ padding: 'var(--ds-space-14) var(--ds-space-12)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--ds-bg-surface)' }}>
            <h3 style={display({ fontSize: 'clamp(var(--ds-text-2xl), 3vw, var(--ds-text-4xl))', fontWeight: 'var(--ds-weight-extrabold)', letterSpacing: '-0.04em', lineHeight: 'var(--ds-leading-tight)', color: 'var(--ds-text-primary)', marginBottom: 'var(--ds-space-5)' })}>
              AquaShield<br />Sentinel
            </h3>
            <p style={body({ fontSize: 'var(--ds-text-lg)', color: 'var(--ds-text-secondary)', lineHeight: 'var(--ds-leading-relaxed)', marginBottom: 'var(--ds-space-8)' })}>
              Every sensor feed, active alert, evacuation route, vessel track, and AI inference in one composable dashboard. Built for operators who cannot afford blind spots.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--ds-space-2)', marginBottom: 'var(--ds-space-10)' }}>
              {['38ms AI Response', '21 Buoy Feeds', '847 km² Coverage', '99.97% Uptime', 'Offline-Capable'].map((tag) => (
                <span key={tag} style={{ ...mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)' }), background: 'var(--ds-bg-raised)', border: '1px solid var(--ds-border-subtle)', padding: '4px 11px', borderRadius: 'var(--ds-radius-full)' }}>
                  {tag}
                </span>
              ))}
            </div>
            <a href="#capabilities" style={body({ fontSize: 'var(--ds-text-sm)', fontWeight: 'var(--ds-weight-semibold)', color: 'var(--ds-color-brand)' })}>
              Explore capabilities →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Capabilities ─────────────────────────────────────────────────────── */
function Capabilities() {
  const h = useReveal();
  const { ref, itemStyle } = useStaggerReveal(70);
  return (
    <section id="capabilities" style={{ background: 'var(--ds-bg-surface)', borderTop: '1px solid var(--ds-border-subtle)', padding: 'var(--ds-space-24) var(--ds-space-6)' }}>
      <div style={{ maxWidth: 'var(--ds-max-width)', margin: '0 auto' }}>
        <div ref={h.ref} className={h.className} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--ds-space-12)', flexWrap: 'wrap' as const, gap: 'var(--ds-space-4)' }}>
          <div>
            <div style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-color-brand)', letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: 'var(--ds-space-3)' })}>Intelligence Capabilities</div>
            <h2 style={display({ fontSize: 'clamp(var(--ds-text-3xl), 4vw, var(--ds-text-5xl))', fontWeight: 'var(--ds-weight-bold)', letterSpacing: '-0.04em', lineHeight: 'var(--ds-leading-tight)', color: 'var(--ds-text-primary)' })}>
              Every layer of coastal defence.
            </h2>
          </div>
          <a href="#" style={body({ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-color-brand)', fontWeight: 'var(--ds-weight-medium)', whiteSpace: 'nowrap' })}>View full spec →</a>
        </div>

        <div ref={ref} className="aq-caps-grid">
          {CAPABILITIES.map((cap, i) => (
            <a key={cap.id} href={`#${cap.id}`} className="aq-card"
              style={{ ...itemStyle(i), display: 'flex', flexDirection: 'column', background: 'var(--ds-bg-card)', border: '1px solid var(--ds-border-subtle)', borderRadius: 'var(--ds-radius-xl)', overflow: 'hidden', color: 'inherit' }}>
              <div style={{ height: 176, overflow: 'hidden', background: 'var(--ds-bg-raised)', flexShrink: 0, position: 'relative' }}>
                <img src={cap.img} alt={cap.name} className="aq-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(2,6,9,0.5) 100%)' }} />
              </div>
              <div style={{ padding: 'var(--ds-space-5) var(--ds-space-6)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 'var(--ds-space-2)' })}>{cap.tag}</div>
                <h3 style={display({ fontSize: 'var(--ds-text-xl)', fontWeight: 'var(--ds-weight-bold)', letterSpacing: '-0.025em', color: 'var(--ds-text-primary)', lineHeight: 1.1, marginBottom: 'var(--ds-space-2)' })}>{cap.name}</h3>
                <p style={body({ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-secondary)', lineHeight: 'var(--ds-leading-relaxed)', flex: 1, marginBottom: 'var(--ds-space-4)' })}>{cap.body}</p>
                <div style={body({ fontSize: 'var(--ds-text-sm)', fontWeight: 'var(--ds-weight-medium)', color: cap.accent })}>{cap.headline}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Tech Stack ───────────────────────────────────────────────────────── */
function TechStack() {
  const h = useReveal();
  const { ref, itemStyle } = useStaggerReveal(100);
  return (
    <section style={{ background: 'var(--ds-bg-base)', borderTop: '1px solid var(--ds-border-subtle)', padding: 'var(--ds-space-24) var(--ds-space-6)' }}>
      <div style={{ maxWidth: 'var(--ds-max-width)', margin: '0 auto' }}>
        <div ref={h.ref} className={h.className} style={{ maxWidth: 560, marginBottom: 'var(--ds-space-14)' }}>
          <div style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-color-brand)', letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: 'var(--ds-space-4)' })}>Intelligence Architecture</div>
          <h2 style={display({ fontSize: 'clamp(var(--ds-text-3xl), 4vw, var(--ds-text-5xl))', fontWeight: 'var(--ds-weight-bold)', letterSpacing: '-0.04em', lineHeight: 'var(--ds-leading-tight)', color: 'var(--ds-text-primary)', marginBottom: 'var(--ds-space-4)' })}>
            Ocean sensor to command in 38ms.
          </h2>
          <p style={body({ fontSize: 'var(--ds-text-lg)', color: 'var(--ds-text-secondary)', lineHeight: 'var(--ds-leading-relaxed)' })}>
            Four layers purpose-built for extreme reliability in maritime environments.
          </p>
        </div>

        <div ref={ref} className="aq-tech-grid">
          {TECH_STACK.map((tech, i) => (
            <div key={tech.step} className="aq-tl"
              style={{ ...itemStyle(i), background: 'var(--ds-bg-surface)', border: '1px solid var(--ds-border-subtle)', borderRadius: 'var(--ds-radius-xl)', padding: 'var(--ds-space-8)', position: 'relative' }}>
              {i < TECH_STACK.length - 1 && (
                <div aria-hidden style={{ position: 'absolute', top: '50%', right: -10, transform: 'translateY(-50%)', color: 'var(--ds-text-muted)', zIndex: 2 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5h8M6 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
              <div style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', letterSpacing: '0.12em', marginBottom: 'var(--ds-space-5)' })}>LAYER {tech.step}</div>
              <div style={{ width: 6, height: 28, background: tech.color, borderRadius: 3, marginBottom: 'var(--ds-space-5)', opacity: 0.85 }} />
              <h3 style={display({ fontSize: 'var(--ds-text-xl)', fontWeight: 'var(--ds-weight-bold)', color: 'var(--ds-text-primary)', marginBottom: 'var(--ds-space-3)' })}>{tech.name}</h3>
              <p style={body({ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-secondary)', lineHeight: 'var(--ds-leading-relaxed)' })}>{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Response Section ─────────────────────────────────────────────────── */
function ResponseSection() {
  const l = useReveal('aq-reveal-left');
  const r = useReveal('aq-reveal-right');
  return (
    <section id="response" style={{ background: 'var(--ds-bg-surface)', borderTop: '1px solid var(--ds-border-subtle)', padding: 'var(--ds-space-24) var(--ds-space-6)' }}>
      <div style={{ maxWidth: 'var(--ds-max-width)', margin: '0 auto' }}>
        <div className="aq-resp-grid" style={{ border: '1px solid var(--ds-border-subtle)', borderRadius: 'var(--ds-radius-2xl)', overflow: 'hidden' }}>
          <div ref={l.ref} className={l.className} style={{ position: 'relative', minHeight: 420, background: 'var(--ds-bg-raised)', overflow: 'hidden' }}>
            <img src={IMG.lighthouse} alt="Lighthouse" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 40%, rgba(6,13,20,0.6) 100%)' }} />
            <div style={{ position: 'absolute', bottom: 'var(--ds-space-5)', left: 'var(--ds-space-5)', background: 'rgba(2,6,9,0.85)', border: '1px solid rgba(217,79,92,0.35)', borderRadius: 'var(--ds-radius-full)', display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ds-color-coral)', flexShrink: 0 }} />
              <span style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-color-coral)', letterSpacing: '0.06em', fontWeight: 'var(--ds-weight-semibold)' })}>SOS DETECTED · DISPATCH ACTIVE</span>
            </div>
          </div>

          <div ref={r.ref} className={r.className} style={{ background: 'var(--ds-bg-card)', padding: 'var(--ds-space-14) var(--ds-space-12)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: 'var(--ds-space-4)' })}>Emergency Response</div>
            <h2 style={display({ fontSize: 'clamp(var(--ds-text-2xl), 3.2vw, var(--ds-text-4xl))', fontWeight: 'var(--ds-weight-extrabold)', letterSpacing: '-0.04em', lineHeight: 'var(--ds-leading-tight)', color: 'var(--ds-text-primary)', marginBottom: 'var(--ds-space-5)' })}>
              90 seconds from signal<br />to dispatch.
            </h2>
            <p style={body({ fontSize: 'var(--ds-text-base)', color: 'var(--ds-text-secondary)', lineHeight: 'var(--ds-leading-relaxed)', marginBottom: 'var(--ds-space-8)' })}>
              From EPIRB detection to asset dispatch — every step automated, documented, and tracked in real time.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-2)', marginBottom: 'var(--ds-space-10)' }}>
              {[
                { t: '0s',  label: 'SOS / EPIRB signal detected',             color: 'var(--ds-color-coral)' },
                { t: '4s',  label: 'AI classifies severity + identifies vessel', color: 'var(--ds-color-amber)' },
                { t: '12s', label: 'Nearest asset identified · route calculated', color: 'var(--ds-color-brand)' },
                { t: '90s', label: 'Coast guard dispatched · tracking begins',   color: 'var(--ds-color-green)' },
              ].map((step) => (
                <div key={step.t} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-space-4)', padding: 'var(--ds-space-3) var(--ds-space-4)', background: 'var(--ds-bg-raised)', border: '1px solid var(--ds-border-subtle)', borderRadius: 'var(--ds-radius-md)' }}>
                  <span style={mono({ fontSize: 'var(--ds-text-xs)', color: step.color, fontWeight: 'var(--ds-weight-bold)', minWidth: 28 })}>{step.t}</span>
                  <div style={{ width: 1, height: 16, background: 'var(--ds-border-subtle)', flexShrink: 0 }} />
                  <span style={body({ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-secondary)' })}>{step.label}</span>
                </div>
              ))}
            </div>
            <a href="#enterprise" className="aq-btn-primary"
              style={body({ fontSize: 'var(--ds-text-sm)', fontWeight: 'var(--ds-weight-semibold)', color: 'var(--ds-bg-base)', background: 'var(--ds-color-brand)', padding: 'var(--ds-space-3) var(--ds-space-6)', borderRadius: 'var(--ds-radius-md)', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6 })}>
              Deploy Rescue Module →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── News Section ─────────────────────────────────────────────────────── */
function NewsSection() {
  const h = useReveal();
  const { ref, itemStyle } = useStaggerReveal(90);
  return (
    <section style={{ background: 'var(--ds-bg-base)', borderTop: '1px solid var(--ds-border-subtle)', padding: 'var(--ds-space-24) var(--ds-space-6)' }}>
      <div style={{ maxWidth: 'var(--ds-max-width)', margin: '0 auto' }}>
        <div ref={h.ref} className={h.className} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--ds-space-10)', flexWrap: 'wrap' as const, gap: 'var(--ds-space-4)' }}>
          <div>
            <div style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-color-brand)', letterSpacing: '0.14em', textTransform: 'uppercase' as const, marginBottom: 'var(--ds-space-3)' })}>Latest</div>
            <h2 style={display({ fontSize: 'clamp(var(--ds-text-3xl), 4vw, var(--ds-text-5xl))', fontWeight: 'var(--ds-weight-bold)', letterSpacing: '-0.04em', color: 'var(--ds-text-primary)' })}>
              Field Reports & Research
            </h2>
          </div>
          <a href="#" style={body({ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-color-brand)', fontWeight: 'var(--ds-weight-medium)', whiteSpace: 'nowrap' })}>View all reports →</a>
        </div>

        <div ref={ref} className="aq-news-grid">
          {NEWS.map((n, i) => (
            <a key={i} href="#" className="aq-card"
              style={{ ...itemStyle(i), display: 'flex', flexDirection: 'column', background: 'var(--ds-bg-surface)', border: '1px solid var(--ds-border-subtle)', borderRadius: 'var(--ds-radius-xl)', overflow: 'hidden', color: 'inherit' }}>
              <div style={{ height: 180, overflow: 'hidden', background: 'var(--ds-bg-raised)', flexShrink: 0 }}>
                <img src={n.img} alt={n.title} className="aq-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: 'var(--ds-space-6)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', gap: 'var(--ds-space-3)', alignItems: 'center', marginBottom: 'var(--ds-space-3)' }}>
                  <span style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-color-brand)', fontWeight: 'var(--ds-weight-semibold)', letterSpacing: '0.06em' })}>{n.category}</span>
                  <span style={{ color: 'var(--ds-border-default)' }}>·</span>
                  <span style={body({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)' })}>{n.date}</span>
                </div>
                <h3 style={body({ fontSize: 'var(--ds-text-base)', fontWeight: 'var(--ds-weight-semibold)', color: 'var(--ds-text-primary)', lineHeight: 'var(--ds-leading-snug)', flex: 1, marginBottom: 'var(--ds-space-4)' })}>{n.title}</h3>
                <span style={body({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)' })}>{n.readTime} read</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Partners ─────────────────────────────────────────────────────────── */
function Partners() {
  const doubled = [...PARTNERS, ...PARTNERS];
  return (
    <div style={{ borderTop: '1px solid var(--ds-border-subtle)', borderBottom: '1px solid var(--ds-border-subtle)', background: 'var(--ds-bg-surface)', padding: 'var(--ds-space-8) 0', overflow: 'hidden' }}>
      <div style={{ marginBottom: 'var(--ds-space-5)', paddingLeft: 'var(--ds-space-8)' }}>
        <span style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' as const })}>Trusted by maritime agencies worldwide</span>
      </div>
      <div className="aq-marquee">
        {doubled.map((name, i) => (
          <div key={i} style={display({ fontSize: 'var(--ds-text-base)', fontWeight: 'var(--ds-weight-medium)', color: 'var(--ds-text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 'var(--ds-space-10)', letterSpacing: '-0.01em', padding: '0 var(--ds-space-10)' })}>
            {name}
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ds-border-default)', display: 'inline-block', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Enterprise CTA ───────────────────────────────────────────────────── */
function EnterpriseCTA() {
  const c = useReveal();
  return (
    <section id="enterprise" style={{ background: 'var(--ds-bg-base)', padding: 'var(--ds-space-24) var(--ds-space-6)', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, background: 'radial-gradient(circle, rgba(42,184,216,0.04) 0%, transparent 62%)', pointerEvents: 'none' }} />
      <div ref={c.ref} className={c.className} style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' as const, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--ds-bg-raised)', border: '1px solid var(--ds-border-default)', borderRadius: 'var(--ds-radius-full)', padding: '4px 14px', marginBottom: 'var(--ds-space-8)' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ds-color-brand)', flexShrink: 0 }} />
          <span style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-secondary)', letterSpacing: '0.08em' })}>30-DAY PILOT · FREE</span>
        </div>
        <h2 style={display({ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', fontWeight: 'var(--ds-weight-extrabold)', letterSpacing: '-0.05em', lineHeight: 'var(--ds-leading-tight)', color: 'var(--ds-text-primary)', marginBottom: 'var(--ds-space-5)' })}>
          Deploy AquaShield.<br />Protect Your Coast.
        </h2>
        <p style={body({ fontSize: 'var(--ds-text-xl)', color: 'var(--ds-text-secondary)', lineHeight: 'var(--ds-leading-relaxed)', marginBottom: 'var(--ds-space-10)' })}>
          From a 21-buoy pilot to full national deployment. We scale to your zone, threat model, and agency's operational cadence.
        </p>
        <div style={{ display: 'flex', gap: 'var(--ds-space-4)', justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <a href="#" className="aq-btn-primary"
            style={body({ fontSize: 'var(--ds-text-base)', fontWeight: 'var(--ds-weight-semibold)', color: 'var(--ds-bg-base)', background: 'var(--ds-color-brand)', padding: 'var(--ds-space-4) var(--ds-space-10)', borderRadius: 'var(--ds-radius-md)', whiteSpace: 'nowrap' })}>
            Start 30-Day Pilot
          </a>
          <a href="#" className="aq-btn-ghost"
            style={body({ fontSize: 'var(--ds-text-base)', fontWeight: 'var(--ds-weight-medium)', color: 'var(--ds-text-primary)', background: 'transparent', border: '1px solid var(--ds-border-default)', padding: 'var(--ds-space-4) var(--ds-space-10)', borderRadius: 'var(--ds-radius-md)', whiteSpace: 'nowrap' })}>
            Talk to our team
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────── */
function Footer() {
  const c = useReveal();
  return (
    <footer style={{ background: 'var(--ds-bg-surface)', borderTop: '1px solid var(--ds-border-subtle)', padding: 'var(--ds-space-20) var(--ds-space-6) var(--ds-space-10)' }}>
      <div ref={c.ref} className={c.className} style={{ maxWidth: 'var(--ds-max-width)', margin: '0 auto' }}>
        <div className="aq-footer-grid" style={{ marginBottom: 'var(--ds-space-14)' }}>
          <div>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--ds-space-4)' }}>
              <div style={{ width: 30, height: 30, borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ds-bg-raised)' }}>
                <ShieldIcon size={18} />
              </div>
              <div>
                <div style={display({ fontWeight: 'var(--ds-weight-bold)', fontSize: 'var(--ds-text-base)', letterSpacing: '-0.02em', color: 'var(--ds-text-primary)', lineHeight: 1 })}>AquaShield</div>
                <div style={mono({ fontSize: '0.55rem', color: 'var(--ds-text-muted)', letterSpacing: '0.1em' })}>SENTINEL PLATFORM</div>
              </div>
            </a>
            <p style={body({ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-muted)', lineHeight: 'var(--ds-leading-relaxed)', marginBottom: 'var(--ds-space-5)' })}>
              Coastal AI intelligence protecting lives, ecosystems, and critical maritime infrastructure.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ds-color-green)', flexShrink: 0 }} />
              <span style={mono({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', letterSpacing: '0.05em' })}>ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <div style={body({ fontSize: 'var(--ds-text-xs)', fontWeight: 'var(--ds-weight-semibold)', color: 'var(--ds-text-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 'var(--ds-space-5)' })}>{col.heading}</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)' }}>
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#"
                      style={body({ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-muted)', transition: 'color var(--ds-transition-fast)' })}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ds-text-secondary)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ds-text-muted)'; }}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--ds-border-subtle)', paddingTop: 'var(--ds-space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 'var(--ds-space-4)' }}>
          <span style={body({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)' })}>
            © 2026 AquaShield Technologies. Protecting coastlines, ecosystems, and lives.
          </span>
          <div style={{ display: 'flex', gap: 'var(--ds-space-6)' }}>
            {['Privacy Policy', 'Terms of Use', 'Security', 'Accessibility'].map((item) => (
              <a key={item} href="#"
                style={body({ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', transition: 'color var(--ds-transition-fast)' })}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ds-text-secondary)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ds-text-muted)'; }}
              >{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Root ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [booted,   setBooted]   = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setBooted(true), 80);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ opacity: booted ? 1 : 0, transition: 'opacity 0.9s ease', background: 'var(--ds-bg-base)', minHeight: '100vh' }}>
        <Navbar scrolled={scrolled} booted={booted} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
        <main>
          <Hero booted={booted} />
          <AlertTicker />
          <StatsStrip />
          <PlatformSpotlight />
          <Capabilities />
          <TechStack />
          <ResponseSection />
          <NewsSection />
          <Partners />
          <EnterpriseCTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
