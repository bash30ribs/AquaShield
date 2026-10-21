# AquaShield Sentinel — Architectural & Production Standards
## The Complete Guide to Building It Right

This document codifies the engineering, design, accessibility, security, and deployment standards enforced across the AquaShield platform. Every decision must align with the green patterns, strictly avoid the red anti-patterns, and observe the architectural constraints.

---

### 01. Strategy — Before You Touch Anything
- **Primary User Persona**: Coastal residents, daily swimmers, beachgoers, local fishermen, and civil emergency volunteers in coastal sectors (e.g., Mumbai, Arabian Sea, Bay of Bengal).
- **Core Action**: Check live coastal swim & wave safety in 5 seconds, or submit a verified hazard observation in 30 seconds.
- **Brand Feeling**: *Reliable, Purposeful, Resilient*.
- **Distinction**: While generic municipal portals are cluttered and emergency defense hubs are intimidating, AquaShield provides traffic-light clarity (🟢 Safe, 🟡 Caution, 🔴 Hazard) with deep sensor telemetry available under the hood.

---

### 02. Design System — The Foundation
- All spacing, typography, colors, borders, and transitions derive from CSS custom properties defined in `:root`.
- Component names are standardized (`.aq-beach-card`, `.aq-btn-primary`, `.aq-status-badge`, `.aq-search-hero-box`, `.aq-action-card`).
- No arbitrary inline values or ad-hoc utility hacks.

---

### 03. Typography — Scale & Hierarchy
- **Defined 6-Step Scale**: `12px (0.75rem) / 14px (0.875rem) / 16px (1rem) / 20px (1.25rem) / 28px (1.75rem) / 40px (2.5rem) / 56px (3.5rem)`.
- **Typefaces**: Exactly 2 contrasting typefaces:
  - Display / Headings: `Outfit` (sans-serif)
  - Body & UI Controls: `Inter` (sans-serif)
  - Code / Telemetry Telemetry: `JetBrains Mono` (monospace, strictly for coordinates and technical metrics)
- **Single `<h1>`**: Exactly one `<h1>` per page (`<h1>Real-Time Coastal Safety for Every Citizen</h1>`).
- **Readability**: Body copy set between 15–18px, line-height 1.6, max 68 characters per line (`max-width: 68ch`).
- **No AI Chrome**: Zero tracked-out uppercase eyebrow badges above headings; zero single-word gradient accents in headlines.

---

### 04. Color — Domain-Specific Palette & Tokens
- **Semantic Palette (WCAG AA Compliant)**:
  - `--ds-bg-base`: `#07111e` (Obsidian Midnight Navy — deep structural foundation)
  - `--ds-bg-surface`: `#0c1827` (Card / panel container)
  - `--ds-bg-raised`: `#122238` (Interactive surfaces)
  - `--ds-color-brand`: `#f59e0b` (Distress Amber — single actionable brand accent)
  - `--ds-text-primary`: `#f8fafc` (Contrast ratio > 15:1 against base navy)
  - `--ds-text-secondary`: `#94a3b8` (Contrast ratio > 5.5:1, exceeding 4.5:1 threshold)
  - `--ds-status-safe`: `#10b981` (Emerald Green)
  - `--ds-status-hazard`: `#ef4444` (Coral Red)
- Interactive elements uniformly communicate actionability with `--ds-color-brand`.
- Never rely on color alone: every status pairs an icon, color dot, and clear text label.

---

### 05. Layout & Spacing — 8px Grid
- Spacing strictly follows multiples of 8: `8px, 16px, 24px, 32px, 40px, 48px, 64px, 80px, 96px`.
- Max content width constrained to `1200px`, centered with `24px` gutter padding.
- Natural left-aligned reading flow for text; centered alignment reserved for hero focal impact.

---

### 06. Content & Copy — Plain Language & Real Data
- Real coastal locations: *Juhu Beach*, *Girgaon Chowpatty*, *Marine Drive*, *Bandra Bandstand*, *Versova Beach*, *Aksa Beach*, *Colaba Point*, *Alibaug*.
- Action-oriented copy: "Check Safety & Swell", "Submit a Coastal Report", "Call 112".
- Zero boilerplate buzzwords (*"cutting-edge"*, *"world-class"*, *"paradigm-shifting"*).
- Zero fake metrics, fake reviews, or synthetic user counters.

---

### 07. Animation & Motion — Purposeful & Non-Intrusive
- Hero load sequence is the single orchestrated motion moment.
- No heavy scroll-driven warping, aggressive parallax, or repetitive section reveals.
- All interactive micro-animations (buttons, cards) operate between `140ms–240ms` with `active: scale(0.98)`.
- Full support for `@media (prefers-reduced-motion: reduce)` disabling non-essential transitions.

---

### 08. Components & States — 4 States for Every Element
- Every interactive element provides: `default`, `hover`, `active`, and `focus-visible`.
- Focus ring: `outline: 2px solid var(--ds-color-brand); outline-offset: 2px;`.
- Minimum tap target: `44×44px` for touchscreens.
- Form fields include permanent accessible labels, not disappearing placeholders alone.

---

### 09. SEO & Discoverability
- Real HTML pre-rendered on the server (zero blank JavaScript shell).
- Unique title (55 characters) and meta description (155 characters).
- OpenGraph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`).
- Structured JSON-LD schema markup (`EmergencyService` and `GovernmentService`).
- Dynamic `sitemap.xml` and `robots.txt` endpoints.

---

### 10. Performance & Core Web Vitals
- Explicit `width` and `height` on images to guarantee Zero Cumulative Layout Shift (CLS).
- High priority fetch for hero visual assets; `loading="lazy"` on below-the-fold media.
- Zero bulky icon library imports: lightweight inline SVGs.
- Pre-rendered beach cards for immediate First Contentful Paint (FCP).

---

### 11. Accessibility (WCAG 2.1 AA)
- 4.5:1 minimum contrast across all text elements.
- Semantic HTML tags: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<button>`, `<footer>`.
- 100% keyboard navigable without a mouse.
- Descriptive `alt` attributes on all contextual images.

---

### 12. Security
- Content Security Policy (CSP), `X-Content-Type-Options: nosniff`, and `X-Frame-Options: SAMEORIGIN` headers enforced.
- Server-side input sanitization across all incident report and authentication routers.
- Zero API keys or secrets exposed in client-side bundles.
- `.env`, dataset images, and local databases excluded via `.gitignore`.

---

### 13. Mobile First
- Responsive down to `320px` viewport width.
- 44px minimum tap targets with 8px+ touch margins.
- Horizontal scroll wrappers for wide data tables.
