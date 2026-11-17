# Redesign progress

## Where things stand

Phase 3 complete, then a second pass over the homepage for page chrome, figures and motion. The
homepage is built and waiting for the owner's approval. No other page has been redesigned.

Backup of the untouched original: `C:\Users\Lenovo\Downloads\URJASHAKTI CALCULATOR UPDT copy-original`

Note: that folder disappeared part way through the second pass, along with the project's
`node_modules`. Nothing in the redesign touched either, and the cause is outside this project
(both sit under Downloads). The baseline has been rebuilt from `Downloads\URJASHAKTI_OG.zip`,
which predates this work: its `src/` is the pre-redesign code, verified by reading
`Welcome.tsx`, `App.css` and `package.json` out of the archive before restoring. `node_modules`
was reinstalled from `package.json`. If the folder vanishes again, that zip is the restore point.

## Brief (from the owner)

First pass:
- Pale sky-blue page, deep slate text, vivid sky blue for actions, leaf green for money-saved
  figures, sun yellow for map markers only.
- Bold colour: at least one full-width coloured band per page, accent in real areas not thin links.
- Glassmorphism only where something real sits behind it. Frosted white 78%, 18px blur, thin light
  border, dark text, solid fallback. Everything else solid.
- Check text contrast over the darkest map areas.
- No emoji, no decorative illustration. Placeholders for photos.
- Report bugs, do not fix them.

Second pass:
- Nav as a complete full-width bar flush with the top, 72px, inner wrapper = the page container,
  Sign up 46px with 24px side padding, 32px between links, glass at 90% with a 20px blur.
- One section padding value, `clamp(72px, 9vw, 128px)`. Fix the call-to-action band. Balance headings.
- Audit every figure: one size per row, tabular lining numerals, consistent unit size.
- Footer on the page container, one heading style and top edge, social icons in a row at 40px with
  12px gaps, divider inside the container, year from the date, chat bubble recoloured and offset.
- The expressive motion recipe in full, reduced motion respected, content visible without JavaScript.
- `layout_check.py` to 0 FAIL at 1440 and 390.

## Pages

| Route | Mode | State |
|---|---|---|
| `/` public homepage | Persuade | Built, awaiting approval |
| `/login` | Operate | Not started |
| `/signup` | Operate | Not started |
| `/home/*` signed-in home | Persuade | Not started. Still uses emoji icons |
| `/calculator` | Operate | Not started. The main glass case: panels and result card over the map |
| `/energy-estimation` | Operate | Not started |
| `/report` | Read | Not started |
| `/vendor` | Operate | Not started |
| `/dashboard` | Operate | Not started |

## What changed on the homepage

New files:
- `src/styles/tokens.css` — the whole design system
- `src/motion/useHomeMotion.ts` — the motion system, homepage only
- `DESIGN.md`, `BUGS-FOUND.md`, `IMAGES-TO-ADD.md`, `.redesign/references.md`
- `public/images/roof-satellite.jpg`, `public/images/report-screen.jpg` — placeholders

Rewritten, presentation only:
- `src/index.css`, `src/App.css`, `public/index.html`
- `Header`, `Welcome`, `Features`, `Services`, `About`, `CallToAction`, `Footer` (tsx + css)
- `TidioChatbot` — the widget's colour only; the chat itself is untouched

`src/App.tsx` gained the motion hook and the progress line on the homepage wrapper. Routes,
handlers, auth, data and link destinations are untouched.

Added dependencies: `@fontsource-variable/schibsted-grotesk`, `@fontsource/ibm-plex-sans`,
`gsap`, `@gsap/react`, `lenis`.

## Checks

- `layout_check.py`: 0 FAIL at 1440 and 390. One WARN at 390: once the footer stacks, the audit
  reads the social icon row as the footer's columns and notes it is narrower than the container.
  Expected on a phone.
- `guard.py`: 0 FAIL, 0 WARN. No behaviour changed.
- `clean.py`: 0 FAIL, 0 WARN. No emoji, no tool or AI marks.
- Contrast: 30 of 30 pairs pass 4.5:1, including every colour on glass over a dark map.
  Results in `.redesign/contrast.txt`.
- Motion resolution: slow scroll, fast jump to the bottom, resize mid-scroll, 390px, and reduced
  motion. Zero elements left invisible, all 8 counters at their real values, in every case.
- Console errors on `/`: 0 before, 0 after.
- Screenshots: `.redesign/screens/after/` at 1440 and 390, plus `state-pinned-steps.png`,
  `state-nav-over-deep.png`, `state-footer.png`, `state-phone-hero.png`, `state-phone-footer.png`,
  `glass-fallback.png`, `focus-ring.png`, `mobile-menu.png`.
- References captured for comparison: `.redesign/screens/ref-stripe/`, `ref-octopus/`, `ref-wise/`,
  measured in `.redesign/references.md`.

## Known weak spot

The hero visual and the report screenshot are still grey placeholders. All three reference sites
lead with a real, specific image, and until those two `.jpg` files are dropped in, that is the
clearest gap between this page and theirs. Described in `IMAGES-TO-ADD.md`.

## Next step

Wait for the owner's verdict on the homepage. On approval, Phase 4: the calculator page next,
since it is the most used screen and the one the glass system was designed for.
