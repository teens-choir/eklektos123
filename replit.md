# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Includes the **Teenagers Choir** web app built with React + Vite + TypeScript + Tailwind CSS.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Teenagers Choir App (`artifacts/choir-app`)

- **Entry**: `src/App.tsx` — wraps app in `DeviceProvider`, registers all routes including `/device-select`
- **Auth flow**: Login → device-select (if no device stored) → dashboard; skip device-select on subsequent logins
- **Device context**: `src/lib/device.tsx` — `DeviceProvider` + `useDevice()`, persists choice in `localStorage` as `"choir-device"` (`"pc"|"tablet"|"mobile"`)
- **Device selection page**: `src/pages/DeviceSelect.tsx` — shown after first login; 3 large card options
- **Layouts** use `useDevice()`:
  - `AdminLayout`: PC = always-visible wide sidebar; Tablet = collapsible sidebar + top header; Mobile = top header + bottom nav bar (6 items)
  - `MemberLayout`: PC = top nav + max-w-7xl content; Tablet = top nav + max-w-5xl; Mobile = top header + bottom nav bar
  - Both layouts include a device switcher (PC/Tablet/Mobile icon buttons) that navigates back to `/device-select`
- **GitHub Pages**: `vite.config.github.ts` reads `BASE_PATH` env var (default `/`). GitHub Actions workflow at `.github/workflows/deploy.yml` passes `/${{ github.event.repository.name }}/` automatically. Built `dist/` includes `.nojekyll` and `404.html` for SPA routing.
- **Admin accounts**: eyuelg/choir2123, yegetaa/choir3212, fiker/choir6712, lidiya/choir6745 (all role=admin)
