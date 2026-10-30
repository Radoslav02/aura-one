# AURA One — immersive product site

React 19 + Vite 8 · GSAP 3.15 (ScrollTrigger, SplitText, Flip, DrawSVG, Draggable, ScrambleText, CustomEase) · Lenis · React Three Fiber + drei · React Router 7 · react-i18next · React Hook Form + Zod · EmailJS · Leaflet · Tailwind 4.

## Run
```bash
npm install
npm run dev      # http://localhost:5173  (Node 20.19+ or 22.12+ recommended)
npm run build && npm run preview
```
If `vite build` complains about a missing `@rolldown/binding-*` package, run `npm i -D @rolldown/binding-<platform>@<rolldown version>` (npm optional-deps bug).

## EmailJS
Copy `.env.example` to `.env` and fill `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`. Template variables: `from_name`, `from_email`, `phone`, `subject`, `message`, `lang`. Without keys the form simulates success (console warning).

## Add a language (e.g. Serbian Cyrillic)
1. Copy `src/locales/sr.json` → `src/locales/sr-Cyrl.json` and transliterate.
2. Register it in `src/i18n.js` (`LANGUAGES` + `RESOURCES`). Routes `/sr-Cyrl/...`, the switcher, `<html lang>` and SEO alternates follow automatically.

## Swap the product / brand
- Copy: `src/locales/*.json` (all text, meta, alts, validation).
- Colours: `src/data/colorways.js` (`COLORWAYS` drive the CSS variables + 3D materials; `SECTION` = per-section background colours) and tokens in `src/styles/index.css`.
- Assets: `src/data/assets.js` — all placeholder Unsplash/Pexels URLs in one place.
- 3D: `src/scenes/HeadphoneModel.jsx` is a procedural model. Drop a Draco GLB at `public/models/aura-one.glb` with nodes `Headband, SliderL/R, YokeL/R, CupL/R, CapL/R, GrilleL/R, DriverL/R, CushionL/R, Chip, Battery` and set `MODEL.USE_GLB = true`.

## Placeholder assets to replace
| Where | Source | File |
|---|---|---|
| Home › noise scene video | Pexels #3121459 (aerial city) | `VIDEOS.city` |
| Home › product film | Pexels #1409899 (ocean aerial) | `VIDEOS.film` |
| Gallery / product / team / studio / timeline images | Unsplash IDs | `IMAGES.*` |
| 3D headphones | procedural Three.js | `scenes/HeadphoneModel.jsx` |
| Fonts | Google Fonts Unbounded + Manrope (Latin-ext + Cyrillic) | `index.html` |

## Structure
`components/` (Cursor, Preloader, TransitionLayer, Header, Footer, MagneticButton, LanguageSwitcher, Marquee, Lightbox, Accordion, SplitHeading, RevealImage, Counter, Seo, Page) · `pages/` · `sections/{home,product,about,contact}/` · `scenes/` (Hero3D, ExplodedView, ConfiguratorScene, Bounce3D) · `hooks/` (useLenis, useMagnetic, useSplitReveal, useSectionColor, useLang, useMedia) · `context/` (Lenis, Theme, Transition) · `animations/gsap.js` (plugin registration + custom eases) · `locales/`.

## Visual QA scripts (optional)
`qa/pages.mjs <path> <name> [width] [height] [steps]` scrolls a page in headless Chrome (GPU-accelerated via puppeteer-core + the installed Google Chrome) and writes `qa/<name>-N.png`; `qa/menu.mjs` opens the mobile menu. Run the dev server first.

## Lighthouse (desktop preset, production preview, Oct 2026)
| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Home | 95 | 100 | 100 | 100 |
| Product | 93 | 100 | 100 | 100 |
| About | 95 | 100 | 100 | 100 |
| Contact | 97 | 100 | 100 | 100 |

Mobile preset (simulated slow 4G) lands around 60 on Home because of the 3D scenes and webfonts; `npm run build && npm run preview`, then `npx lighthouse http://localhost:4173/en --preset=desktop` to reproduce.
