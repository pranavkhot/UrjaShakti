# The UrjaShakti design system

> **Superseded.** This describes the earlier sky-blue homepage pass. The current system
> (ivory, ink and solar amber, across every route) is documented in `docs/DESIGN.md`.

Everything here lives in one file: `src/styles/tokens.css`, which is imported by
`src/index.css`. Change a value there and it changes everywhere.

## Colour

A bright, daylight palette. Roughly 60% pale sky, 30% deep or coloured bands, 10% action blue.

| Role | Colour | Where it is used |
|---|---|---|
| Page | `#eaf4fd` pale sky blue | the default background of the site |
| Surface | white | cards, tables, the sections that need to sit forward |
| Deep band | `#0d2b40` deep slate | the full-width band of assumptions, and the footer |
| Text | `#0e2433` deep slate | all body text |
| Muted text | `#49677c` | secondary lines, captions, table headers |
| Action | `#0b74db` vivid sky blue | primary buttons, the closing band, bullets, step numbers |
| Money saved | `#157539` leaf green | rupee figures that represent a saving, and the subsidy band |
| Map marker | `#f5b81a` sun yellow | the map pin only. Never text, never a background |

Every page carries at least one full-width coloured band, so the page has rhythm rather than a
single pale scroll. On the homepage there are four: the deep slate assumptions band, the leaf
green subsidy band, the white panels band and the action blue closing band.

Sun yellow is deliberately fenced off. It is reserved for map markers so that a pin always reads
as a pin. It never carries text, because yellow cannot hold text at an accessible contrast.

### Contrast

Thirty text and background pairs are checked, including every colour as it appears on glass over
a dark map. All thirty pass 4.5:1 for body text. The check is reproducible: `.redesign/contrast.txt`
holds the current results.

## Glass

Glass is used only where something real sits behind it:

- the sticky navigation, with the page scrolling under it
- the result panel over the satellite map in the hero
- the mobile menu

Everything else is solid. The recipe is one class, `.us-glass`: frosted white at 78% with an 18px
backdrop blur, a thin light border, and dark text.

Two fallbacks are built in. Browsers that cannot blur get a solid `#f5fafe` panel, through
`@supports`. Anyone who has asked their system for less transparency gets the same solid panel,
through `prefers-reduced-transparency`. Both were checked by rendering the page with blur disabled.

One subtlety worth keeping: at 78% opacity a white panel over a dark satellite map composites to
about `#c7c7c7`. The ordinary muted, green and accent colours drop below 4.5:1 against that, so
`.us-glass` redefines them a few steps darker for anything inside it. That is why the panel's text
colours are slightly deeper than the same roles elsewhere, and why they hold up over the darkest
part of a map.

## Page chrome

**The navigation bar** is a complete bar from edge to edge, flush with the top: no floating pill,
no side margins, square ends. 72px tall on desktop, 64px on a phone. Its inner wrapper is the page
container, so the logo's left edge and the Sign up button's right edge sit exactly on the content
edges. Links are 17px with 32px between them; the button is 46px tall with 24px of side padding and
16px of space before it. The bar is glass at 90% with a 20px blur and a 1px bottom border, so no
page text is legible through it. Its shadow arrives after 8px of scroll, and it steps out of the
way when the reader scrolls down.

**One section shell.** Every section uses `padding-block: var(--section-y)`, which is
`clamp(72px, 9vw, 128px)`. Coloured bands use the same shell with a background; the closing call to
action uses the tighter `clamp(56px, 7vw, 96px)`. No section sets its own vertical padding, so the
rhythm never drifts. Headings carry `text-wrap: balance` and cap at about 20ch.

**The footer** uses the page container with a `1.6fr 1fr 1fr` grid filling it, so the last column
ends on the container's right edge. Every column heading, the brand included, is one style on one
top edge. Social icons sit in a row, 40px each, 12px apart. The divider lives inside the container
and the year comes from the date, never typed.

**The chat button** is pinned to the bottom-right corner at 24px and recoloured to the action blue
through Tidio's own API, so it never lands on footer text in its default blue.

## Type

Two families, self-hosted, both under the SIL Open Font License.

- **Schibsted Grotesk Variable** for headings and buttons.
- **IBM Plex Sans** for body text and every figure, at weights 400, 500, 600 and 700.

| Role | Desktop | Phone |
|---|---|---|
| Body | 18px, line height 1.6 | 18px |
| Lead | 20-22px | 18px |
| H1 | 40-76px, fluid | 40px |
| H2 | 28-56px, fluid | 28px |
| H3 | 22-28px | 22px |
| Small | 14px, never below 13px | 13px |

Headings are sentence case and tightly tracked.

**Figures** have two tiers and nothing between them: the stat tier at `clamp(40px, 5vw, 64px)` and
the inline tier at `clamp(28px, 2.4vw, 32px)`. One tier per row, never mixed. Units are always
0.56em on the same baseline, whether they lead (₹) or follow (%, kg, kW, m²), with a 15-16px muted
caption below.

Figures are set in IBM Plex Sans, not the display face, and this is deliberate. Both carry
`font-variant-numeric: tabular-nums lining-nums`, but in Schibsted Grotesk the tabular set gives the
comma and the full stop a whole digit of advance, so `₹30,000` reads as `₹30 , 000`. IBM Plex Sans
keeps its punctuation at half width in tabular mode. Measured, at 64px: Schibsted's tabular comma is
40.6px against a 40.6px digit; Plex's is 19.1px against a 38.4px digit.

## Layout

- Container 1240px, side padding from 20px to 48px.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Sections breathe from 72px to 144px top and bottom.
- Radius has one personality: 10px on controls, 18px on cards, 28px on large panels, pills on the
  nav and the primary nav button.
- Section layouts alternate deliberately: split hero, heading over a two-column grid, full-width
  band, split band, grid of cards, table beside copy. No two neighbouring sections share a shape.

## Controls

Buttons are 48px tall, 56px for the closing action, with 24px of side padding and 17px text.
Every interactive element is at least 44px in its smallest dimension. Focus is a 3px solid ring in
`#0a5caf`, offset by 2px, switching to white on dark bands.

## Motion

One system, one easing, one signature moment. It lives in `src/motion/useHomeMotion.ts` and runs on
the homepage only. Everything animates `transform`, `opacity` or `filter`, so nothing moves the
layout.

- **The page load**, about 1.4 seconds: the headline is split into lines, each inside its own mask,
  rising from below with a 0.07s stagger; then the supporting line, the buttons, the facts row, and
  the hero visual settling in from 0.96 scale.
- **Section headings** use the same masked line reveal, triggered once at `top 85%`.
- **Paragraphs, cards and table rows** fade up 24px with a 6px blur clearing, staggered 0.08s.
- **Figures count up** to their real value over 1.6s, formatted with `Intl.NumberFormat('en-IN')`
  and the decimals the final text already has. The final value is in the HTML, so no-JavaScript and
  reduced-motion readers see it immediately.
- **Parallax**: the hero visual drifts 10% slower than the scroll. Desktop only.
- **The signature moment**: in "how it works" the heading column sticks while the four steps scroll
  past, each lighting up as it is reached, with a counter in the column following along. CSS sticky
  rather than a ScrollTrigger pin, because a pin wraps the element in a spacer that fights the grid
  and clipped the heading. Nothing is dimmed: fading the inactive steps dropped their text below the
  contrast floor.
- **The bar** gains its shadow after 8px, hides on the way down and returns on the way up. A 3px
  progress line runs across the top, scrubbed to the scroll.
- **Buttons** lift 2px with the arrow nudging 4px, and press to 0.98. Links draw an underline in
  from the left.
- **Smooth scrolling** is Lenis, on this page only, never on the calculator or any page with a map.

Durations run 80ms for micro feedback, 150ms for closing, 250ms for opening, up to 400ms for panels.
Under `prefers-reduced-motion` the whole system is skipped: content is shown at once, Lenis never
starts, and nothing moves.

**Nothing is hidden waiting for a script.** An inline script in `index.html` puts a `js` class on
`<html>`; the hidden start states apply only under that class, GSAP sets them itself, and a 3-second
failsafe reveals everything if the module never arrives. Verified by scrolling slowly, jumping
straight to the bottom, resizing mid-scroll, at 390px, and under reduced motion: zero elements left
invisible and all eight counters at their real values in every case.

## Icons and images

Icons come from lucide, which the project already had, at one stroke weight, sized on the type
scale. There are no emoji anywhere on the homepage and no decorative illustration.

Photographs the design needs but the project does not have are placeholder slots, listed in
`IMAGES-TO-ADD.md`. Drop a real `.jpg` over the placeholder at the same path and it appears; the
markup already sets the aspect ratio and crop.
