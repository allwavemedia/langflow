# Phase 6.4 Research Worksheet — Template (Domain-Agnostic, Tool-Driven)

Purpose: Provide a neutral, capability-first template the agent uses to discover any domain via tools, then assemble flows and guardrails without hard-coding industries.

Guidance

- Treat examples as hints only. Always corroborate with tool-based retrieval (docs, APIs, schemas) and short Socratic checks.
- Prefer fetch → summarize → validate loops over assumptions. Record sources and confidence.
- If a Domain Pack is available, load it as data (not code) to enrich questions and controls.

## 1) Intent, Context, and Constraints

- User intent and outcome (as stated):
- Known systems/tech stack (e.g., M365, AWS, custom APIs):
- Data classes and sensitivity (PII/PHI/proprietary/none):
- Regulatory or policy constraints (if any):
- Non-functional targets (latency, cost, reliability):

Discovery (tool-driven)

- Fetch authoritative docs or schemas for named systems.
- Extract required entities, endpoints, and contracts.
- Summarize key constraints and unknowns; ask 2–3 clarifying questions.

## 2) Signals and Evidence (Domain Hints)

- Observed keywords/phrases (from user/context):
- Structural cues (file types, API fields, identifiers):
- Entities (orgs/standards/roles) mentioned:
- Negative signals (test/sandbox/demo indicators):

Validation (tool-driven)

- Search documentation/examples; confirm signals map to real constructs.
- Capture 2–3 canonical examples and counterexamples with sources.

## 3) Knowledge Activation Plan

- Candidate capabilities to enable (derived from evidence):
  - detection:
  - question packs (required/optional):
  - controls/policies (masking, gating, logging):
- Persistence scope (session/user/org) and TTL:
- Conflict resolution (if multiple capabilities/domains co-exist):

Note: If a Domain Pack is present, merge its questions/controls but keep tool corroboration mandatory.

## 4) Compliance and Safety (If Applicable)

- Applicable frameworks or policies (link to sources):
- High-risk conditions and required mitigations:
- Generation-time checks (what, how to enforce):
- Documentation artifacts to produce (if any):

## 5) Socratic Questioning Plan

- Onboarding questions (minimal set to unlock safe defaults):
- Deep-dive branches (condition → extra questions):
- Progressive disclosure steps (from coarse → fine):
- Stop conditions (confidence, mandatory answers met, no unresolved risks):

## 6) Evaluation Set (Capability-Oriented)

- Gold prompts (by capability) with expected detections/actions:
- Non-compliant scenarios with expected warnings/blocks:
- Ambiguity/edge tests (counterfactuals, low-signal cases):
- Success thresholds (accuracy, FP/FN, latency to first alert):

## 7) Sources and Attributions

- Links to docs/specs used:
- MCP/KB queries executed and summaries:
- Confidence per claim (0–1) and open questions:

## Commands

```bash
*agent analyst
*task domain-research
*task advanced-elicitation
```
