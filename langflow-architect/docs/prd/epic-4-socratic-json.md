# Epic 4 — Socratic Engine & JSON Generation

status: proposed
owner: Product / AI Engine

## Summary
Define and stabilize the Socratic conversational loop and the artifact generation path (Langflow JSON + beginner guide).

## Goals
- Socratic question engine reliably refines user goals into concrete specs.
- Final JSON generation validates against Langflow schema.
- Generate easy-to-follow beginner guides alongside the JSON.

## Acceptance Criteria
- AC1: Socratic flow produces a complete spec ready for JSON generation.
- AC2: Generated JSON validates and imports into the platform.
- AC3: Beginner guide produced for each generated JSON.

## Top-level Stories
- Story D1: Implement Socratic prompt templates and question-selection logic.
- Story D2: JSON schema validation harness and import test.

## Related Story Files
- `docs/stories/epic-3-json-generation.md` — Langflow JSON Generation & Export stories (comprehensive JSON generation, validation, export capabilities)

## Related artifacts
- `analysis/`, `stories/`, `app/` tests
