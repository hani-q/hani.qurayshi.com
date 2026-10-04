# AGENTS.md

This file provides guidance to coding agents (Claude Code, Codex, etc.) when working with code in this repository.

## Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build` (runs `prebuild` first to generate contributions data)
- **Preview:** `pnpm preview`
- **Generate GitHub contributions:** `GH_CONTRIBUTIONS_TOKEN=xxx node scripts/generate-contributions.mjs` (gracefully falls back to empty data if token is missing)

## Architecture

This is a personal resume/portfolio site built with **Astro 6**, **Tailwind CSS v4**, and no JavaScript framework — just Astro components with inline `<script>` and `<style>` blocks.

### Key files

- `src/data/resume.ts` — Single source of truth for all resume content (experience, skills, certifications, education, etc.). All display data lives here.
- `src/data/contributions.json` — Auto-generated at build time by `scripts/generate-contributions.mjs` via GitHub GraphQL API. Committed to repo; regenerated on each build.
- `src/components/themes/Monolith.astro` — The main (and only) theme component. This is a large single-file component containing all HTML, CSS, and JS for the resume page. It handles dark/light mode, print layout, bento grid, carousels, and animations.
- `src/pages/index.astro` — Entry point; just renders `Layout` + `Monolith`.
- `src/layouts/Layout.astro` — HTML shell with meta tags and font loading.
- `src/styles/global.css` — Tailwind v4 config (`@theme` block for fonts) plus base styles and print media queries.

### Styling

- Tailwind CSS v4 via Vite plugin (configured in `astro.config.mjs`)
- Custom fonts: Inter (body), Space Grotesk (display), JetBrains Mono (code), Dancing Script (decorative)
- Dark mode is default; light mode toggled via `[data-mode="light"]` attribute
- Monolith theme uses scoped CSS with `[data-theme="monolith"]` namespace prefix (`mn-` class convention)

### Design patterns

- Dark/light mode toggle with `data-mode` attribute on root element
- Print-friendly layout with `@media print` rules and `.no-print` utility class
- Bento grid layout for skills and stats sections
- Carousel components (hero taglines, RFC 1925 quotes) implemented with vanilla JS in `<script>` tags
