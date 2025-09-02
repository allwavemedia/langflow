# Epic 2 — Tests & CI

status: proposed
owner: QA / CI

## Summary
Ensure fast, deterministic unit and integration tests, and reliable Playwright e2e suites with artifact collection and flakiness mitigation.

## Goals
- Unit tests run on every commit with coverage reporting.
- Integration tests validate frontend-backend contracts in CI.
- Playwright e2e runs produce artifacts (screenshots, traces) and have retry policies.

## Acceptance Criteria
- AC1: CI unit jobs succeed on commits and PRs.
- AC2: Integration tests run in PR pipeline and catch contract regressions.
- AC3: Playwright artifacts are stored in `test-results/` on failure.

## Top-level Stories
- Story B1: Add contract-test harness for frontend-backend API checks.
- Story B2: Configure Playwright in CI with retries and artifact upload.

## Related Story Files
- `docs/stories/epic-2-enhanced-socratic.md` — Enhanced Socratic Engine stories (superseded by Epic 5 but contains relevant testing patterns)

## Related artifacts
- `app/playwright.config.ts`, `app/jest.config.js`, `integration-test.mjs`
