# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

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
- **Auth**: express-session + bcryptjs (password hashing)
- **Frontend**: React + Vite + Tailwind CSS (choir-app artifact)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── choir-app/          # React+Vite frontend (Teenagers Choir)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Application: Teenagers Choir

A choir management platform for a teenagers' choir with dual-role authentication.

### Features
- **Dual-gate auth**: Admins vs Members (role-based login routing)
- **Admin accounts** (hardcoded, auto-seeded on startup):
  - `eyuelg` / `choir2123`
  - `yegetaa` / `choir3212`
  - `fiker` / `choir6712`
  - `lidiya` / `choir6745`
- **Member registration**: Self-service, role='member', voicePart='Normal'
- **Password change**: Both admins and members can change their own passwords

### Admin "Command Center" features
- Member list with voice part assignment (Soprano/Alto/Normal)
- Attendance grid — toggle Present/Absent for today's rehearsal
- Broadcast messages to all or specific voice groups
- Music stand manager — add/delete music links (PDFs/MP3s) by voice part
- Stats dashboard

### Member "Sanctuary" features
- Dynamic voice-part-based theme:
  - Soprano: Vivid Red (#FF3B30)
  - Alto: Purple (#8B5CF6)
  - Normal: Royal Gold (#D4AF37)
- Music rack (filtered by voice part)
- Instruction feed (messages from admins)
- SVG circular attendance gauge

### Database Schema (Drizzle ORM)
- `users` — id, username, password_hash, role, voice_part, created_at
- `attendance` — id, user_id, status, date, created_at, updated_at
- `messages` — id, content, target_voice_part, author_id, created_at
- `music` — id, title, url, file_type, target_voice_part, author_id, created_at

### API Routes (all under `/api`)
- `POST /auth/login` — login
- `POST /auth/register` — register new member
- `POST /auth/logout` — logout
- `GET /auth/me` — get current user
- `POST /auth/change-password` — change own password
- `GET /users` — list members (admin only)
- `PATCH /users/:id/voice-part` — update voice part (admin only)
- `GET /attendance` — today's attendance (admin only)
- `PATCH /attendance/:userId` — toggle attendance (admin only)
- `GET /attendance/my-stats` — member's own stats
- `GET /messages` — get messages (filtered by voice part for members)
- `POST /messages` — broadcast message (admin only)
- `DELETE /messages/:id` — delete message (admin only)
- `GET /music` — get music files (filtered by voice part for members)
- `POST /music` — add music link (admin only)
- `DELETE /music/:id` — delete music (admin only)
- `GET /admin/stats` — dashboard stats (admin only)
