# LangFlow Architect — Application Architecture

Status: In-development

## Purpose

This document provides a concise, app-focused architecture overview for the `langflow-architect` Next.js application and its supporting test and deployment tooling.

## Scope

Covers the `langflow-architect/app` frontend, the test harness (Jest/Playwright), local dev flow, CI/test strategy, and deployment artifacts in `docker/` and `deploy/`.

## Components

- Frontend (Next.js, TypeScript): located at `app/`. Contains UI, API clients, and integration tests.
- Tests:
  - Unit & integration tests: Jest configuration and tests under `app/__tests__` and `app/__tests__/integration`.
  - E2E: Playwright config in `app/playwright.config.ts` and e2e suites.
- CI & scripts: `scripts/`, `playwright.config.ts`, `jest.config.js`, and top-level `Makefile` targets used to run/install/test.
- Deployment: Dockerfiles under `docker/` and dev/production compose variants in `deploy/` and `docker/`.

## Data Flow

1. Browser -> Next.js frontend API client
2. Next.js -> Backend services (LangFlow runtime, auth, storage) via REST API
3. Tests run either against mocked services (unit) or an integration backend (CI/integration stage)

## Local Developer Quickstart (contract)

Inputs: repo clone, Node 18+, pnpm/npm, Docker (optional)
Outputs: running frontend at `http://localhost:3000`, local tests passing
Errors: missing env, missing dependencies, failing tests

Steps (high-level):
- Copy `.env.example` to `.env.local` and set required values
- make init
- make frontend
- make backend (if running an integration backend locally)
- Run tests: `make unit_tests` / `make playwright`

## CI & Test Strategy

- Fast unit tests run on every commit (Jest).
- Integration tests run on PRs against `dev` with a lightweight integration backend.
- Playwright e2e runs in CI or scheduled nightly; artifacts (screenshots, traces) are collected to `test-results/` on failure.
- After building container images in CI, run a smoke test (simple HTTP health check) against the container.

## Deployment

- CI builds images via Dockerfiles and optionally publishes them to a registry.
- `deploy/` and `docker/` contain example compose and Render manifests for straightforward deployments.
- Production must set env values through the CI/CD or platform secret store. No secrets should be in repository files.

## Observability & Debugging

- Expose a `/health` endpoint used by CI smoke tests and simple uptime checks.
- Collect test artifacts to `test-results/` and upload them in CI when tests fail.

## Security & Best Practices

- Do not commit secrets; use environment variables and the CI secret manager.
- Apply CSP/CORS policies for production builds (set via server or proxy like nginx in the container image).
- Validate inputs from backend calls and fail fast in tests if API contract changes.

## Acceptance Criteria (app-level)

- Frontend builds with `pnpm build` (or `npm run build`) and starts with `pnpm start`.
- `make unit_tests` returns green locally and in CI.
- Playwright tests run and produce artifacts; flaky tests are minimized via retries and stable data.
- A smoke test successfully validates a built container in CI.

## Next Actions

- Add a short contract-test suite for key frontend-backend endpoints.
- Add a `make quickstart` target that wraps environment setup and runs the frontend locally.


