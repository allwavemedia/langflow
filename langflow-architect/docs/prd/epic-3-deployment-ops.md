# Epic 3 — Deployment & Ops

status: proposed
owner: Platform / DevOps

## Summary
Produce reproducible container images, example deploy manifests (Render/docker-compose), and CI smoke tests validating container health.

## Goals
- Build and publish reproducible images in CI.
- Provide docker-compose and Render manifests for simple deployments.
- Smoke tests run against built images in CI.

## Acceptance Criteria
- AC1: CI builds an image and smoke tests (HTTP health check) pass.
- AC2: Deploy manifests documented and tested locally via `docker-compose`.

## Top-level Stories
- Story C1: Add smoke test step in CI after image build.
- Story C2: Maintain `deploy/` and `docker/` manifests documented in `docs/`.

## Related Story Files
- `docs/stories/epic-4-deployment-ux.md` — User Experience & Production Deployment stories (comprehensive deployment pipeline, onboarding, documentation)

## Related artifacts
- `docker/`, `deploy/`, `Makefile`
