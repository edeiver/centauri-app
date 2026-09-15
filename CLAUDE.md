# Centauri — Frontend (React Native / Expo)

## What this app is

Centauri is a **general personal expense tracking app** (budget, categories, income vs. expenses, month-over-month trends) that also uses AI to generate automatic insights about the user's spending. Detecting "ant expenses" (small, recurring purchases that quietly add up over a month — coffee, delivery fees, subscriptions) is **one insight type among several, not the app's central theme**. Don't focus all the copy or screens exclusively on that one feature.

This app is a portfolio project (for React Native / Front-End Developer interview processes), so it needs to look polished and demonstrate good practices, but its feature scope should stay within what the backend already supports (see below). Don't invent features that would require new backend work without asking first.

## Backend (DO NOT TOUCH — already built and working)

Repo: `centauri-ai-backend` (Express + PostgreSQL + JWT). This project is frontend-only — it consumes that backend, it does not modify or reimplement its logic.

Real endpoints:
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `POST /transactions` (create), `GET /transactions` (list) — both authenticated
- `GET /ai/insights` — authenticated; the backend caches insights for 6 hours and uses Gemini to generate them as structured JSON

If you need an endpoint or field that isn't in this list, ask before assuming the backend supports it.

## Design

I'll provide two `.zip` files with the screens exported from Stitch (dark theme and light theme). Use them as a pixel-accurate visual reference for layout: exact colors, typography, spacing, iconography.

Visual theme: phenomena of the universe (the Milky Way, nebulae, planetary systems, supernovas, star fields) — not just "observatory instruments."

Base palette (adjust to the exact values in the zips if they differ):
- Dark background: deep navy-black (`#0B0E14` approx.)
- Primary: icy white-blue, starlight-like (`#E2F1FF` approx.)
- Secondary: soft pink-magenta, nebula-like (`#F472B6` approx.)
- Tertiary: sky blue (`#38BDF8` approx.)
- Typography: Sora (headings/numbers) + Geist (body text)

Screens: Welcome, Login, Sign Up, Dashboard, Transactions, AI Coach, PIN Setup — each in both dark and light versions.

## Stack and conventions

- Latest Expo SDK compatible with what's already scaffolded in the repo (check `package.json` before assuming a version)
- React Navigation (native stack)
- Functional components + hooks, no classes
- Global state via Context API (follow the existing pattern in `AuthContext`/`ThemeContext` if already present in the repo)
- Folder structure: `src/components/`, `src/context/`, `src/navigation/`, `src/screens/`
- PascalCase filenames for components/screens

## Responsive layout

Screens must render without clipped or overflowing text across device widths (iPhone SE ~375px up to Pro Max). This has been a recurring bug source, so when building or touching a screen:
- Any row placing two text/label elements side by side (a field label + hint, a card title + badge, a chip + status text) needs `flexWrap: 'wrap'` on the row, plus `flexShrink: 1` (and `numberOfLines` where it should truncate instead of wrap) on the longer text — otherwise one element pushes the other off-screen on narrow devices.
- A `View` wrapping text has no width of its own; text only wraps when a `flex: 1` or `flexShrink: 1` ancestor actually constrains it. Don't assume a column layout is safe just because it looks fine on one simulator size.
- Before considering a screen done, sanity-check it on a narrow simulator (iPhone SE), not just the default (often larger) simulator.

## Working rules

- **Ask before**: deleting files, renaming folders, changing the existing navigation structure, or installing new dependencies not already in `package.json`.
- **Do not** modify anything outside this repo (especially not `centauri-ai-backend`).
- If anything in the design zip is unclear or missing a state (loading, error, empty), ask instead of inventing a pattern.
- Small, descriptive commits — one per screen or feature, not one giant commit at the end.

## To save tokens during sessions

- Don't read `node_modules/`, `.expo/`, `dist/`, `build/`, or `.lock` files unless explicitly asked to.
- Before reading a full file, check whether you already have enough context from the zip or from this file.
- To explore existing code broadly, prefer targeted searches (grep for a component/function name) over reading entire folders.
