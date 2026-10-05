# AGENTS.md

This file provides guidance to coding agents (Claude Code, Codex, etc.) when working with code in this repository.

## Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build` (runs `prebuild` first to generate contributions data)
- **Preview:** `pnpm preview`
- **Regenerate the HQ logo/favicons:** `node scripts/gen-hq-logo.mjs` (geometry in `scripts/hq-logo.mjs`, output `src/data/hq-logo.json`)
- **Refresh pinned X posts:** `node scripts/fetch-posts.mjs`
- **Generate GitHub contributions:** `GH_CONTRIBUTIONS_TOKEN=xxx node scripts/generate-contributions.mjs` (without a token it keeps the existing file; locally `GH_CONTRIBUTIONS_TOKEN=$(gh auth token)` works)

## Architecture

This is a personal resume/portfolio site built with **Astro 6**, **Tailwind CSS v4**, and no JavaScript framework — just Astro components with inline `<script>` and `<style>` blocks.

### Key files

- `src/data/resume.ts` — Single source of truth for all resume content (experience, skills, certifications, education, etc.). All display data lives here.
- `src/data/contributions.json` — Auto-generated at build time by `scripts/generate-contributions.mjs` via GitHub GraphQL API. Gitignored; generated on each build (the deploy workflow supplies `GH_CONTRIBUTIONS_TOKEN`).
- `src/data/derive.ts` — Display-ready views derived from `resume.ts` (skill categories, parsed certifications, roles grouped by company, stats) plus `companySites`: each employer's website and its screenshot.
- `src/assets/logos/*.svg` (Simple Icons, imported `?raw` and drawn in `currentColor`) and `public/logos/stanford.png` — certification issuer logos, mapped by issuer name in `Simplefolio.astro`
- ArkaType's product (FlowSense.AI) and open-source work (qstack) are the `products` and `openSource` arrays in `Simplefolio.astro`; both reuse the browser dialog. The GitHub contributions heatmap in Open source reads `contributions.json`
- The website shows `capabilities` (claim + evidence cards, defined in `Simplefolio.astro`) instead of tool lists; the printed résumé still lists `skillCategories` from `derive.ts` so ATS keywords stay
- Posts section renders pinned X posts natively. List post IDs in `src/data/pinned-posts.json`; `scripts/fetch-posts.mjs` (run in `prebuild`, or by hand) saves them to `src/data/posts.json` and images to `public/posts/` via X's public single-post endpoint, keeping the saved copy if X is unreachable. X's timeline widget is not used: it is rate-limited (429) for everyone
- The HQ mark starts large to the left of the hero text (`.sf-hero-mark` placeholder) and flies into the top bar (`.sf-topbar-slot`), while the hero name fades out and the bar name (`.sf-topbar-name`) fades in; the mark moves over the first 45% of a screen of scrolling; script interpolates between the two placeholders' rects
- The HQ mark and the favicon cycle through 8 palettes every 5s: logo colours are CSS variables `--hq-h/q/hd/qd` on `.sf-brand`; each palette has a dark and a darkened light set; favicons are per-palette data: URIs swapped on `link[rel=icon]`
- `public/sites/*.jpg` — Full-page screenshots (1440px wide, capped at 4200px tall) of each employer's site; Wayback Machine captures for sites that are gone or rebranded. Re-capture by hand when a site changes.
- `src/components/themes/Simplefolio.astro` — The only theme component: a single file with all HTML, CSS, and JS for the resume page. Layout is based on cobiwave/simplefolio, styled as dark diffused glass with a light toggle, print layout, scroll reveal, and tilt cards.
- `src/pages/index.astro` — Entry point; just renders `Layout` + `Simplefolio`.
- `src/layouts/Layout.astro` — HTML shell with meta tags and font loading.
- `src/styles/global.css` — Tailwind v4 config (`@theme` block for fonts) plus base styles and print media queries.

### Styling

- Tailwind CSS v4 via Vite plugin (configured in `astro.config.mjs`)
- Simplefolio loads Montserrat itself; `global.css` still defines Inter, Space Grotesk, JetBrains Mono, and Dancing Script
- Dark mode is default; light mode is `data-mode="light"` on the theme root, persisted in localStorage (`sf-mode`)
- Theme CSS is scoped under `[data-theme="simplefolio"]` with the `sf-` class prefix

### Design patterns

- Dark/light mode toggle with `data-mode` attribute on the theme root
- Glass surfaces share one rule (`.sf-panel`, `.sf-thumbnail`, `.sf-mode`) driven by `--sf-glass*` tokens over a fixed ambient glow layer
- Printing (the printer button, or "View Resume") outputs only `.sf-cv`: a hidden, plain single-column ATS résumé rendered from the same data; the PDF file name comes from `data-cv-title`
- Each experience card is a browser window showing the company's site; clicking it opens one shared `<dialog>` (site on the left, full experience on the right, arrow keys step between companies) with a view transition from the card
- The top bar's section label (the 76px bar shows mark | name | current section; the label rolls up/in on change), logo docking, palette cycling, tilt-with-glare and the browser dialog are vanilla JS in `<script is:inline>`
