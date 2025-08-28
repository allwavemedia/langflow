# Phase 6.4 Implementation Plan — Domain Expertise & Compliance Intelligence

Status: INITIATED (workflow started)

Owner: Analyst (lead), Architect, Dev, QA, PM, UX Expert

Links: docs/stories/epic-6-phase-4-domain-expertise.md, docs/implementation-roadmap.md, `bmad-core/tasks/use-copilotkit-mcp.md`

## 1) Objectives and Scope

- Enable automatic domain detection and activation of specialized guidance
- Provide real-time compliance intelligence and validation
- Upgrade Socratic questioning to be domain- and expertise-aware
- Maintain zero ESLint warnings, strict typing, and performance budgets

Out of scope (for this phase): external vendor onboarding beyond first integration, multi-tenant RBAC.

## 2) Deliverables and Milestones

- D1 Domain taxonomy + detection heuristics/rules (keywords, patterns, embeddings-ready)
- D2 Domain KB activation mechanism + persistence across sessions
- D3 Compliance rulesets (HIPAA, GDPR, SOX, PCI-DSS, FDA) + validation engine
- D4 Adaptive Socratic question sets by domain and user expertise
- D5 Evaluation suite: accuracy, coverage, safety, regression tests
- D6 Observability: telemetry for detections, compliance checks, and user flows

Milestones

- M1 Research complete (taxonomy, regulations inventory) — Week 1
- M2 Design approved (architecture, data contracts, UX) — Week 2
- M3 Implementation alpha (domain detection + core compliance) — Week 3
- M4 Implementation beta (adaptive Socratic + observability) — Week 4
- M5 Test/Validation + sign-off — Week 5

## 3) Agent Assignments by Phase

- Research (Lead: Analyst) — Analyst, PM support
- Design (Lead: Architect) — Architect, Analyst, UX Expert
- Implementation (Lead: Dev) — Dev, Architect reviews, UX Expert
- Testing (Lead: QA) — QA, Analyst truth-set validation
- Validation (Lead: PM + QA) — PM sign-off, QA quality gates

## 4) Work Breakdown (with BMad commands)

Research

- Domain requirements + constraints: \*agent analyst → \*task requirements-analysis
- Domain landscape + patterns: \*agent analyst → \*task domain-research
- Advanced elicitation plan: \*agent analyst → \*task advanced-elicitation

Design

- Detection architecture + KB activation: \*agent architect → \*task create-architecture-design
- Compliance engine patterns: \*agent architect → \*task validate-technical-approach
- Integration plan (CopilotKit actions, state): \*agent architect → \*task design-integration-plan

Implementation

- Detection heuristics + activation wiring
- Compliance validation engine + rulesets
- Socratic prompt sets + user experience flows
- Code quality improvements

Commands

```bash
*agent dev
*task create-technical-component
*task implement-feature
*agent ux-expert
*task design-user-experience
*agent dev
*task code-quality-optimization
```

Testing

- Test strategy and evaluation suite
- Functional, regression, and performance testing
- Quality gates verification

Commands

```bash
*agent qa
*task create-test-strategy
*task validate-system-functionality
*task quality-gate-assessment
```

Validation

- Change & release readiness: \*agent pm → \*task project-coordination

## 5) Architecture Overview (high level)

- Conversation context analyzer (domain signal extraction)
- Domain KB activator (feature flags, profiles, persistence)
- Compliance engine (rulesets, mappers to workflow primitives)
- Socratic engine (prompt libraries per domain, expertise ladders)
- Observability (event logs, metrics, alerts)
- CopilotKit actions and state integration across the above

## 6) MCP Tooling Plan (see `bmad-core/tasks/use-copilotkit-mcp.md`)

- CopilotKit Vibe-Coding MCP — patterns, hooks, performance, troubleshooting
- Microsoft Docs MCP — regulatory references and Azure integration guidance

Protocol

- Assessment → Request → Application → Validation

## 7) Acceptance Criteria and Metrics

- Domain detection accuracy ≥ 90% on eval set; false positive rate ≤ 5%
- Compliance coverage: ≥ 5 frameworks with passing validation suites
- UX satisfaction (adaptive questioning): ≥ 85% positive in test sessions
- Code quality: 0 ESLint warnings; TypeScript strict; perf budgets met
- Stability: < 3% error rate; P95 response < 2s streaming start

## 8) Risks and Mitigation

- API dependency or schema drift — add contract tests; versioned schemas
- Overfitting of detection rules — keep hybrid heuristics + embeddings-ready design
- Regulatory ambiguity — document assumptions; provide justifications and overrides
- UX complexity creep — progressive disclosure; usability tests each milestone

## 9) Dependencies

- Epic 6 Phase 3 complete (conversation context infra) — done
- CopilotKit integration baseline — done
- TypeScript strict config — in place

## 10) Quality Gates (checklists)

```bash
*checklist architect-checklist      # design sign-off
*checklist story-dod-checklist      # story completion
*checklist change-checklist         # release readiness
```

## 11) Timeline (indicative)

- Week 1: Research pack + truth set baseline
- Week 2: Architecture + integration designs
- Week 3: Detection + initial compliance engine
- Week 4: Adaptive Socratic + observability
- Week 5: Evaluation, QA, sign-off

## 12) Try Next

Start Research now

```bash
*agent analyst
*task requirements-analysis
*task domain-research
*task advanced-elicitation
```

In parallel, run quality hardening

```bash
*workflow brownfield-enhancement
```
