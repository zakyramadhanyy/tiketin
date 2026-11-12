---
name: Antigravity Ticketing
description: Daytime-sky B2B landing for an event ticketing platform. Deep-to-pale blue gradients, drifting cloud banks, soft white surfaces, one vivid blue action, Plus Jakarta Sans.
colors:
  ink: "#0a1a33"
  ink-2: "#3d4f6b"
  ink-3: "#5a6b85"
  blue: "#1366f0"
  blue-ink: "#0c54d1"
  blue-soft: "#e8f1fe"
  blue-tint: "#f4f8fe"
  sky-deep: "#1a62cf"
  sky: "#2573dd"
  sky-mid: "#78baf3"
  sky-pale: "#d6ecfd"
  white: "#ffffff"
  line: "#e4ecf7"
  ok: "#067a52"
  ok-bg: "#e3f6ee"
  warn: "#a8420a"
  warn-bg: "#fff0e3"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.028em"
  headline:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "28px"
  section: "clamp(64px, 8vw, 104px)"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "{colors.blue-ink}"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.blue}"
    rounded: "{rounded.pill}"
    height: "46px"
  button-soft:
    backgroundColor: "{colors.blue-soft}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "28px"
  input:
    backgroundColor: "{colors.blue-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    height: "50px"
  chip:
    backgroundColor: "{colors.blue-soft}"
    textColor: "{colors.blue-ink}"
    rounded: "{rounded.pill}"
---

# Design System: Antigravity Ticketing

## Overview

A daytime sky. The page opens on a deep blue gradient that lifts toward white as the visitor scrolls, with cloud banks drifting at the edges and product UI floating on top. Surfaces are white, rounded, and separated by soft blue-tinted shadow rather than borders. The product demos (dashboard, e-ticket, gate scanner, price slider, lucky-draw wheel) are the imagery; there are no stock photos. Mood: calm, trustworthy, quick to operate.

## Colors

- **Action blue** (`#1366f0`): the only saturated action color; primary buttons, slider, active states.
- **Sky ramp** (`#1a62cf` → `#2573dd` → `#78baf3` → `#d6ecfd`): ground for the hero and the two sky panels (pricing, closing). White text sits only on `sky-deep` to `sky`; keep text out of the lighter stops.
- **Ink** (`#0a1a33`, `#3d4f6b`, `#5a6b85`): navy text on white, three steps.
- **Tints** (`blue-soft`, `blue-tint`): inner rows, inputs, chips. Text on `blue-soft` uses `blue-ink` (`#0c54d1`) to hold 4.5:1.
- **Status**: green for valid/entered, orange for pending/duplicate. Always paired with a text label.

## Typography

Plus Jakarta Sans only (400–800), loaded from Google Fonts. Display and headlines are 700 with tight tracking (-0.028 to -0.03em), balanced wrapping. Body is 400 at 1rem/1.6 with `text-wrap: pretty`. Small labels and chips are 700 at 0.6875–0.8125rem. Numerals in tables and prices use tabular figures.

## Layout

12-wide container at 1160px with a fluid 16–32px gutter. Sections breathe at `clamp(64px, 8vw, 104px)`. Bento grids vary column spans (4/2 then 2/4; 7/5 then 5/7) instead of equal tiles. Pricing and the closing CTA sit in rounded sky panels inset from the viewport edge. Breakpoints: 1080, 960, 640.

## Elevation & Depth

One soft, blue-tinted shadow for cards (`0 14px 36px -10px rgb(19 102 240 / .16)`) and a deeper one for floating objects (hero ticket, plans, sizer). No borders on cards. Inputs use an inset 1px line. The hero dashboard fades into the page with a bottom mask rather than a hard edge.

### Depth and motion layer (motion.css, motion.js)

Depth is real 3D (CSS `perspective`, `preserve-3d`, `translateZ`), never a drop-shadow trick, and always one gesture per object:

- **Hero scene**: the dashboard lies back (`rotateX` 15deg) and flattens as the page scrolls; the e-ticket and scan chip sit at `translateZ` 90px and 56px, so pointer movement shifts them against the dashboard.
- **Extruded objects**: wheel and closing tickets are stacked layers 3–5px apart, darker toward the back (`#0d4fc4 → #072d73` for the wheel, `#cfe0f8 → #9fc0ee` for tickets). Shades are derived from `blue` and `sky-pale`, not new brand colors.
- **3D bars**: each bar has a lighter top face and a darker side face (skew 45deg, depth 10px).
- **Icon tiles**: a soft gradient with a 2px edge and a lifted shadow; they tilt on hover.
- **Photo wall**: a tilted plane (`rotateX` 16deg, `rotateY` -14deg) with tiles at 0–24px depth.
- **Reveal**: elements rise 36px and fade in with an exponential ease-out, staggered 90ms by column; section headings also resolve from an 8px blur. Reveals use the `translate`, `scale` and `opacity` properties so they never fight the tilt, which owns `transform`.
- **Tilt**: cards tilt at most 3–4deg toward a mouse pointer. Not on touch, never on forms.
- **Gating**: everything above sits behind `.motion`, which `motion.js` sets unless `prefers-reduced-motion: reduce`. Without it the page is flat, static and complete.

### CMS console (cms.html)

`cms.html` is a redesign of the real Antigravity CMS superadmin portal (admin-ticketing-system.chameleon.co.id): eight hash-routed pages (Overview & KPI, Kelola Harga & Paket, Modul & Add-on, Status & Kendala Sistem, Log Audit Platform, Direktori Tenant, Antrean Mutasi, Scan QR). Data is copied from the live portal as read on 12 Nov 2026; the only invented rows are two sample tickets (TK-2026-0002/0003) so the 67% check-in rate stays consistent. Actions (verify or reject a payment, edit plans, toggle modules, tenant access, diagnostics, scan) mutate in-memory state and append to the audit log. Replace the `DATA` block with API calls for live data.

The CMS inherits the landing world and adds Operate-mode rules:

- **Frame**: a white 24px app frame floats on the sky wash (`#cfe4fa → #f3f7fd`); a white sidebar (280px, collapses to 76px with icon centers fixed at x=38px) sits beside a `blue-tint` canvas of white 16px cards.
- **Active state**: `blue-soft` fill, `blue-ink` text and a 4px blue edge marker. Only the page nav carries it; the current event is shown by weight alone.
- **Numbers**: tabular figures, 2.125rem/800 in a single joined KPI strip with 1px dividers. Deltas are green up / orange down, always with an arrow and text.
- **Charts**: two series only, blue (`#5b9bff → #1366f0`) and sky (`#c3e2fb → #78baf3`); the active column gets a `blue-tint` plate and a tooltip; the line chart opens with its latest tooltip shown.
- **Status chips**: Menunggu = warn, Disetujui = blue, Tiket terkirim = neutral, Check-in = ok. Category chips: Regular neutral, VIP blue, VVIP ink.
- **Motion**: sliding indicators for the period control and tabs, count-up numbers, bars that grow, a line that draws, popovers that scale in. Everything yields to `prefers-reduced-motion`.
- **Data**: all figures are demo data labelled "Data contoh". Replace the `DATA CONTOH` block in the script with API data.

## Shapes

Cards 24px, inner rows 12–16px, controls and chips are pills. QR tiles 12px.

## Components

- **Nav**: floating pill; transparent white-on-sky at top, white frosted bar after scrolling. Collapses to a menu panel under 960px.
- **Buttons**: primary (blue), light (white on sky), ghost (translucent on sky), soft (blue-soft). Min height 46px, 38px for small.
- **Cards**: white, 24px radius, no border. Inner content uses tinted rows, never a second card.
- **Plan cards**: the recommended plan lifts 10px with a white ring and shows a "Direkomendasikan" chip.
- **Interactive demos**: registration form → ticket with QR; gate scanner with valid/duplicate simulation and history; capacity slider; lucky-draw wheel. All use demo data labelled as such.

## Do's and Don'ts

- Do keep white text on `sky-deep`/`sky` only; clouds stay below text.
- Do label illustrative data ("data contoh", "tampilan contoh").
- Do use `blue-ink` for text on `blue-soft`.
- Don't add customer logos, testimonials, or metrics the product does not state.
- Don't put cards inside cards, or add kickers above headings.
- Don't use gradient text, hard offset shadows, or emoji as icons.
- Don't add motion beyond the layer above: one reveal style, one tilt, one scroll-driven hero, cloud drift, floating cards, and demo state changes.
- Don't tilt or reveal interactive forms; keep 3D objects out of the text column.
- Do honor `prefers-reduced-motion`, and keep `html { overflow-x: clip }` so staged elements never widen the mobile viewport.
