# AGENTS.md

This file provides guidance to coding agents (Claude Code, Codex, etc.) when working with code in this repository.

## Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build` (runs `prebuild` first to generate contributions data)
- **Preview:** `pnpm preview`
- **Regenerate the HQ logo and icons:** `node scripts/gen-hq-logo.mjs` (geometry in `scripts/hq-logo.mjs`; writes `src/data/hq-logo.json`, `public/favicon.svg` (flat red H + yellow Q faces) and `public/app-icon.svg` (the 3D mark in red and yellow)). The PNG icons are browser renders: `favicon.ico` (16/32/48) from `favicon.svg`, `apple-touch-icon.png` (180), `icon-192.png` and `icon-512.png` from `app-icon.svg` (the last two are the `public/site.webmanifest` icons, used when the site is installed or saved to a desktop or home screen) (its blur filters need a browser). Re-render them when the mark changes and bump the `?v=` on the icon links in `Layout.astro` (icons are cached for a year)
- **Refresh pinned X posts:** `node scripts/fetch-posts.mjs`
- **Generate GitHub contributions:** `GH_CONTRIBUTIONS_TOKEN=xxx node scripts/generate-contributions.mjs` (without a token it keeps the existing file; locally `GH_CONTRIBUTIONS_TOKEN=$(gh auth token)` works)

## Architecture

This is a personal resume/portfolio site built with **Astro 6**, **Tailwind CSS v4**, and no JavaScript framework — just Astro components with inline `<script>` and `<style>` blocks.

### Key files

- `src/data/resume.ts` — Single source of truth for all resume content (experience, skills, certifications, education, etc.). All display data lives here.
- `src/data/contributions.json` — Auto-generated at build time by `scripts/generate-contributions.mjs` via GitHub GraphQL API. Gitignored; generated on each build (the deploy workflow supplies `GH_CONTRIBUTIONS_TOKEN`).
- Age: the chat states Hani's age, computed at build time from `HANI_BIRTH_DATE` (YYYY-MM-DD). The date is kept only in the git-ignored `.env` and the `HANI_BIRTH_DATE` repo secret, never in the public repo or the built site; unset means no age passage
- `src/data/ABOUT.md` — Hani's own notes for the hero chat (pronouns, availability, anything the résumé doesn't say). Each `- ` line becomes a searchable passage (labelled by its `## ` heading) and is given to the models first on every question; HTML comments are ignored, so unfilled slots stay commented out. Write true, complete sentences only
- `src/data/derive.ts` — Display-ready views derived from `resume.ts` (skill categories, parsed certifications, roles grouped by company, stats) plus `companySites`: each employer's website and its screenshot.
- `src/assets/logos/*.svg` (Simple Icons, imported `?raw` and drawn in `currentColor`) and `public/logos/stanford.png` — certification issuer logos, mapped by issuer name in `Simplefolio.astro`
- ArkaType's product (FlowSense.AI) and open-source work (qstack) are the `products` and `openSource` arrays in `src/data/projects.ts`; both reuse the browser dialog. The GitHub contributions heatmap in Open source reads `contributions.json`
- The website shows `capabilities` (claim + evidence cards, defined in `Simplefolio.astro`) instead of tool lists; the printed résumé still lists `skillCategories` from `derive.ts` so ATS keywords stay
- Posts section renders pinned X posts natively. List post IDs in `src/data/pinned-posts.json`; `scripts/fetch-posts.mjs` (run in `prebuild`, or by hand) saves them to `src/data/posts.json` and images to `public/posts/` via X's public single-post endpoint, keeping the saved copy if X is unreachable. X's timeline widget is not used: it is rate-limited (429) for everyone
- The HQ mark starts large to the left of the hero text (`.sf-hero-mark` placeholder) and flies into the top bar (`.sf-topbar-slot`), while the whole hero prompt (`.sf-hero-copy`) fades out and the bar name (`.sf-topbar-name`) fades in; the mark moves over the first 45% of a screen of scrolling, then near the end leaves the bar again and lands on the contact card's placeholder (`.sf-contact-mark`); script interpolates between the placeholders' rects. Where CSS scroll-driven animations exist (Safari 26+, Chrome) the path is sampled into ` sf-dock` on a `scroll(root)` timeline so the browser moves the mark in step with scrolling (iOS reports scrollY to script only every few frames); elsewhere the script sets the transform
- The HQ mark cycles through 8 palettes every 5s: logo colours are CSS variables `--hq-h/q/hd/qd` on `.sf-brand`; each palette has a dark and a darkened light set. The favicon stays a fixed red and yellow HQ
- The hero is a chat prompt (`src/components/AskChat.astro`, controller `src/scripts/chat/chat.ts`): a welcome prompt picked at random from `welcomes` in `Simplefolio.astro` streams in as the headline the way chat UIs render model output (sub-word tokens in irregular bursts, each fading in from a blur; `blank()` in chat.ts) (no fixed "Hi, my name is" hero), then every 5s while idle it streams in the next line, cycling a short safe-mode programming joke from JokeAPI (fetched in the browser), a tidbit from `tidbits` and an RFC 1925 truth (`truths`), both in `Simplefolio.astro`, and a big cursor blinks on the next line at headline size; what the visitor types shows on that line (with a ↵ key); only Enter or ↵ swaps it for a prompt box whose toolbar holds icon-only on/off model toggles (Qwen and Gemini logos from Simple Icons in `src/assets/logos/`), the engine, an info icon whose tooltip carries the privacy note, a status (download progress) and a send key; downloads show as a ring on the model button and a bar along the box's bottom edge; there is no real input box (a transparent input takes keystrokes, a prompt line mirrors them). Typing shrinks the headline (`.sf-hero--ask`); Enter turns the hero into a chat (`.sf-hero--chat`). Default engine is on-device semantic search: passage vectors are precomputed at build time by `src/pages/chat-index.json.ts` (all-MiniLM-L6-v2, passages from `src/data/chat-knowledge.ts`), and the browser worker (`embed.worker.ts`, ~23 MB model) embeds only the question. Toggles appear once typing starts: "Smarter answers" (WebGPU only) loads Qwen3 0.6B (~350 MB) via WebLLM in `llm.worker.ts`; "Gemini" appears only where Chrome's Prompt API (Gemini Nano) is available. After the first search answer the chat offers a stronger model once ("Use Gemini Nano" where Chrome has it, else "Load Qwen3 0.6B" where WebGPU runs it), flipping the same toggle. The headline the visitor saw counts as the assistant's opening turn, so "tell me" or "yes" follows on from it (and short follow-ups lean on the previous turn). Models answer only from retrieved passages; questions with no matching passage get a fixed "not in the résumé" reply
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
- Every panel and card (`.sf-panel`, `.sf-thumbnail`) shares one diffused-glass rule: square corners, `--sf-glass*` background with a top-left sheen, 26px blur, a top hairline highlight and a soft shadow, over a fixed ambient glow layer; `.sf-mode` buttons keep a plain frosted surface
- Printing (the printer button, or "View Resume") outputs only `.sf-cv`: a hidden, plain single-column ATS résumé rendered from the same data; the PDF file name comes from `data-cv-title`
- Each experience card is a browser window showing the company's site; clicking it opens one shared `<dialog>` (site on the left, full experience on the right, arrow keys step between companies) with a view transition from the card
- The top bar's section label (the 76px bar shows mark | name | current section; the label rolls up/in on change), logo docking, palette cycling, tilt-with-glare and the browser dialog are vanilla JS in `<script is:inline>`
