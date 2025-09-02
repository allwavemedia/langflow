# PRD: LangFlow Architect (BMAD v4)

status: in-development
owner: Product / Platform
reviewers: Frontend, QA, Platform

## 1. Summary
LangFlow Architect is the curated Next.js application and integration/test harness that demonstrates and validates LangFlow flows. It provides a developer-friendly UI, repeatable CI/test workflows, and deployable images/manifests for local and production usage.

## 2. Goals
- Reduce developer onboarding time to under 60 minutes.
- Provide deterministic unit, integration, and e2e test coverage for critical flows.
- Produce reproducible container images and smoke-tests for CI.

## 3. Success Metrics
- Onboarding: < 60 minutes to run locally from a fresh clone.
- Tests: CI passes for unit+integration+e2e on PRs to `dev`/`main`.
- Releases: CI-built images pass smoke tests in staging.

## 4. Target Users & Stakeholders
- Primary: Frontend & product engineers building LangFlow flows.
- Secondary: QA engineers, platform/DevOps.
- Stakeholders: Product manager, QA lead, Platform lead.

## 5. Assumptions
- Backend APIs (runtime/auth/storage) are available and versioned externally.
- CI runners support Docker builds for image-based smoke tests.

## 6. Non-Goals / Out-of-scope
- Changing backend API contracts.
- Heavy performance optimization or platform-wide refactors.

## 7. Requirements
### 7.1 Functional (MVP)
- F1: Next.js app (TypeScript) renders primary flows and editor components.
- F2: Local dev scripts and `Makefile` targets: `init`, `frontend`, `backend`, test targets.
- F3: Test suites: unit (Jest), integration, and Playwright e2e configured and runnable in CI.
- F4: Dockerfiles and example deploy manifests (Render/docker-compose) that build and run the app.
- F5: Documentation: README, PRD, and Architecture docs present and discoverable.

### 7.2 Non-functional
- N1: Secrets via env only; no secrets in repo.
- N2: Basic health endpoint for smoke tests.
- N3: CI artifact collection (screenshots, traces, test-results).

## 8. Epics & Top-level Stories
### Epic A  Developer Experience
- Story A1: `make init` sets up dependencies and local env.
- Story A2: Quickstart docs and `make quickstart` target.

### Epic B  Tests & CI
- Story B1: Unit tests run and coverage reported.
- Story B2: Integration tests against a lightweight integration harness in CI.
- Story B3: Playwright e2e run with artifacts saved on failure.

### Epic C  Deployment & Ops
- Story C1: CI builds Docker images and runs smoke health checks.
- Story C2: Provide Render/docker-compose manifests and docs for deployment.

## 9. Acceptance Criteria
- AC1: A developer can follow docs to run the frontend locally and see the app at `http://localhost:3000`.
- AC2: `make unit_tests` and CI unit runs succeed.
- AC3: Playwright e2e run in CI produces artifacts and the flakiness rate is reduced over time.
- AC4: CI builds a container image and a smoke test HTTP health check passes.

## 10. Milestones
- M1 (week 0-1): Quickstart + README + `make init`.
- M2 (week 1-3): CI + unit/integration tests green.
- M3 (week 3-6): E2E stabilization + production image smoke tests.

## 11. Risks & Mitigations
- R1: Backend contract drift  add contract tests and a mocked contract harness.
- R2: Flaky e2e tests  stabilize test data, add retries and CI runner stabilization.

## 12. Appendix / Artefacts
Key implementation files:
- `app/README.md`, `app/package.json`, `app/playwright.config.ts`, `app/jest.config.js`
- Deploy artifacts: `docker/`, `deploy/`
