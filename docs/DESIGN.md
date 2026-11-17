# UrjaShakti design system

**Direction: "Solar Intelligence, Made Tangible."** Editorial energy-tech: warm ivory paper, ink type,
one sun. This file supersedes the root `DESIGN.md` (the earlier sky-blue homepage pass).

Tokens live in `src/styles/tokens.css`. Motion lives in `src/motion/kit.tsx`.

## Colour

| Role | Token | Value | Use |
|---|---|---|---|
| Page | `--bg` | `#f7f2e8` | default background |
| Surface | `--surface` | `#fffdf8` | forms, cards, tables |
| Sunken | `--surface-sunken` | `#efe8d9` | alternate bands, skeletons |
| Ink | `--text` / `--band-deep` | `#15171c` | text, deep bands, footer |
| Muted | `--text-muted` | `#5a5e66` | secondary text (5.9:1 on page) |
| Solar amber | `--accent` | `#f2a20c` | primary buttons, highlights, data series 1. Fills only |
| Amber ink | `--accent-ink` | `#8a5300` | amber as text on ivory (5.6:1) |
| Mineral teal | `--money` / `--data-2` | `#0f6b66` | savings, data series 2, subsidy band |
| Danger | `--danger` | `#b3261e` | validation and errors |

Rules: amber never carries small text on ivory; text on an amber fill is ink. Hex and rgba only.
`color-mix()`, `oklch()` and `lab()` are banned because html2canvas cannot parse them and the report
PDF would fail.

## Type

Schibsted Grotesk Variable (display, buttons, headings) and IBM Plex Sans (body, UI, every figure).
Both self-hosted, SIL OFL. Body 17px/1.6. H1 `clamp(42px, 6.2vw, 88px)` at 0.98 leading and -0.035em.
H2 `clamp(30px, 4vw, 56px)`. Headings are sentence case, left aligned, capped near 20ch.
Figures use `.us-figure` / `.us-nums`: tabular lining numerals, units at 0.56em on the same baseline.
`.us-mark` puts a sun-coloured stroke under one word per headline, never more.

## Space, grid, radius

4px base, 8px rhythm: 4 8 12 16 24 32 48 64 96 128. Container 1280px, gutter `clamp(20px, 5vw, 48px)`,
12-column grid on desktop. Section padding `clamp(72px, 9vw, 128px)`, tight `clamp(56px, 7vw, 96px)`.
Radius: 12 controls, 20 cards, 28 panels, pill for buttons and the nav.

## Material: glass is a control layer

Glass (`.us-glass`, 66-84% ivory, 18-24px blur, light edge, inner highlight) is used only on:

- the floating navigation capsule and the mobile menu
- the calculator's search and draw toolbars, which sit on the ink stage above the map
- the homepage example card, over the hero photograph
- the vendor modal backdrop

Never on report content, tables, form bodies, card grids or the Google Map. No blur on blur.
Fallbacks: `@supports` gives a solid panel without blur; `prefers-reduced-transparency` and
`prefers-contrast: more` give the same solid panel with a stronger border.

## Components

- **Buttons** `.us-btn` + `--primary` (amber, ink text), `--ink`, `--secondary`, `--on-deep`. 48px, 56px with
  `--lg`. Hover lifts 2px, press scales to 0.97, the arrow nudges 3px.
- **Fields** `.us-field` > label, input, then `.us-help` or `.us-error`. 52px controls, amber focus halo,
  error state on `aria-invalid`.
- **Chips** `.us-chip`, **callouts** `.us-callout`, **progress strip** `.us-steps` (Roof, Bill, Report).
- **Skeleton** `.us-skeleton`: shimmer, shown only while a real loading state is active.
- **Cards are not the default.** Lists are ruled columns or rows; cards are kept for the method bento,
  vendor records and report metrics.

## Motion

Framer Motion 11 + CSS. Transform, opacity and clip-path only.

| Token | Value | Use |
|---|---|---|
| `--dur-micro` / `DUR.micro` | 140-180ms | hover, press, focus |
| `--dur-medium` / `DUR.state` | 240-450ms | menus, modals, errors, value changes |
| `--dur-reveal` / `DUR.reveal` | 700ms (masks up to 1.4s) | editorial reveals |
| `--ease` / `EASE` | `cubic-bezier(0.22, 1, 0.36, 1)` | everything |
| `--ease-spring` / `SPRING` | overshoot curve / stiffness 420, damping 34 | tactile controls, nav pill, modal |

Kit (`src/motion/kit.tsx`):

- `Reveal` one element arriving (`up`, `fade`, `left`, `right`, `scale`)
- `Stagger` + `StaggerItem` a group arriving in sequence
- `SplitHeading` a headline rising word by word from a mask; words stay real text
- `MaskReveal` a picture window unclipping while the image settles
- `Parallax` localised, tied to the element's own passage; native scroll untouched
- `ScrollProgress` the 3px line on the homepage

Every wrapper takes `inView={false}` to play on mount instead of on scroll, and renders plain,
settled children under `prefers-reduced-motion`.

Signature moments: the hero's roof outline drawing itself over the photograph; the sticky journey
stage whose diagram changes with the step and whose rail fills with the scroll; the subsidy staircase;
the nav pill sliding between links; values in the calculator and bill rails re-entering when the real
number changes (the element is keyed on its value).

## Protected behaviour (do not break when restyling)

- **Report PDF.** Everything inside `.report-container` (`reportRef`) is captured by html2canvas.
  Inside it: on-mount motion only (`inView={false}`), no CSS `@keyframes`, no blur or blend modes,
  explicit background. Browser-only chrome goes in `.report-chrome`, outside the ref. The whole sheet
  is fitted onto one A4 page, so do not add long content inside it.
- **Notification** unmounts from the `animationend` of `.slide-out`. `.slide-in` and `.slide-out` must
  stay real CSS animations; reduced motion shortens them, never removes them.
- **Calculator.** Keep `addressInputRef`, `#search-btn`, `id="map"`, `.calculator-map`, the six result
  ids and every handler. Nothing may overlay, transform or filter the map.
- **Mobile menu** `#mobile-menu` stays mounted (it is the `aria-controls` target); it is shown with
  the `.show` class.
- Logic files were changed by replacing only their rendered markup; the code above each final
  `return (` is byte-identical to before.

## Per-page notes

| Route | Composition |
|---|---|
| `/` | Hero with picture window and glass example card; sticky three-step journey; method bento on ink; subsidy staircase on teal; report index; partners table; about; coverage; FAQ; amber closing band |
| `/login`, `/signup` | Ink editorial panel beside a solid form (`src/styles/auth.css`); form first on phones |
| `/home/*` | Calm hero, four ruled features, the journey as three linked rows |
| `/dashboard` | Profile from real data, logout, four links to existing screens, skeleton while loading |
| `/calculator` | Ink stage: glass toolbars above the map, guide below, sticky results rail |
| `/energy-estimation` | Solid form beside an ink rail of live readouts |
| `/report` | Ink summary header, panel selector, five numbered sections, policy, actions |
| `/vendor` | Three vendor records, animated product modal (sheet on phones) |

## Images

`public/images/*-1600.jpg` are 1600px web copies of the original photographs (the originals are
2-5 MB each and are no longer referenced). Every `<img>` carries width, height and real alt text;
below-the-fold images are lazy. Illustrations are inline SVG diagrams in marketing sections only,
never presented as map or report output.
