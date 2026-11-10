<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Meeting Cost Pushback

## Stack

- Next.js App Router, React, and strict TypeScript
- Plain global CSS; no component or styling framework
- Node test runner via `tsx`
- ESLint with the Next.js recommended configuration

## Commands

Run from `/Users/kasey/CursorDemo`:

- `npm install` — install dependencies
- `npm run dev` — start at `http://localhost:3000`
- `npm test` — run focused unit tests
- `npm run lint` — lint the project
- `npm run typecheck` — type-check without emitting files
- `npm run build` — verify the production build

## House rules

- Keep the calculator client-side. Do not add accounts, APIs, persistence, analytics, or real compensation data.
- Keep calculation and copy logic pure and covered by focused tests.
- Preserve semantic HTML, keyboard operation, visible focus, live announcements, and mobile layouts down to 320 px.
- Follow `.cursor/rules/pm-hive-brand.mdc` for visual design and voice.
- Use Canadian spelling in product copy.
- Keep salary rates explicitly fictional and retain the disclaimer.
- Prefer native browser features and existing dependencies over new packages.
