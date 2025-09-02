# Epic 1 — Developer Experience

status: proposed
owner: Frontend / Developer Experience

## Summary
Make it fast and frictionless for developers to get from clone → running app and tests. Reduce onboarding time to under 60 minutes.

## Goals
- `make init` and `make quickstart` complete environment setup.
- Clear quickstart docs and example env files.
- Reproducible local dev run at `http://localhost:3000`.

## Acceptance Criteria
- AC1: A developer following the quickstart can run the app locally within 60 minutes.
- AC2: `make quickstart` (or equivalent) installs dependencies and starts the frontend.
- AC3: `.env.example` documents required env keys.

## Top-level Stories
- Story A1: Create `make quickstart` to bootstrap dev env (see `docs/prd/langflow-architect.md` Epic A).
- Story A2: Improve `app/README.md` and add a step-by-step quickstart.

## Related Story Files
- `docs/stories/epic-1-standalone-foundation.md` — Standalone application foundation stories (comprehensive Next.js setup, CopilotKit integration, session management)

## Related artifacts
- `docs/prd/langflow-architect.md` (PRD)
- `docs/README.md`, `app/README.md`
