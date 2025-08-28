# Epic Dependency Matrix and Handoff Criteria

## Overview
This document outlines the dependencies between epics in the Langflow Architect project, defining the logical progression, prerequisite requirements, and handoff criteria to ensure smooth transitions between development phases.

---

## 1. Epic Dependency Matrix

This matrix illustrates the primary sequential and parallel relationships between major epics.

| From Epic | To Epic | Dependency Type | Description |
|-----------|---------|-----------------|-------------|
| **Epic 1** | **Epic 3** | Sequential | Epic 1 establishes the foundational Next.js application and CopilotKit interface, which is a prerequisite for generating and exporting JSON in Epic 3. |
| **Epic 3** | **Epic 5** | Sequential | Epic 3 provides the core workflow generation. Epic 5 enhances this with advanced agent intelligence, building upon the generated structures. |
| **Epic 5** | **Epic 6.4**| Sequential | Epic 5 develops the advanced agent capabilities (e.g., context engine) that are specialized for domain expertise in Epic 6.4. |
| **Epic 2** | **Epic 5** | Superseded | Epic 2 is superseded by Epic 5. Its concepts and patterns have been migrated and enhanced in Epic 5. |
| **Story 6.1**| **All Epics**| Parallel | Story 6.1 (MCP Marketplace) can be developed in parallel but provides tooling that may be leveraged by other epics. |

---

## 2. Epic Progression Flow

The project follows a logical progression, building capabilities layer by layer:

1.  **Epic 1: Standalone Foundation**: Creates the core web application, chat UI, and basic session management. This is the foundational platform.
2.  **Epic 3: JSON Generation & Export**: Builds the primary capability of generating and exporting Langflow workflows. This is the core value proposition.
3.  **Epic 5: Enhanced Agent Intelligence**: Elevates the core capability by making the agent smarter, more context-aware, and capable of complex reasoning.
4.  **Epic 6.4: Domain Expertise**: Specializes the intelligent agent, enabling it to apply its capabilities to a specific, expert domain.

---

## 3. Epic Status Tracking & Handoff Checklists

This section provides checklists to validate the completion of an epic and ensure readiness for the next one.

### Handoff: Epic 1 → Epic 3

**Epic 1 Completion Criteria**:
- [ ] All user stories in Epic 1 are marked as "Done".
- [ ] The standalone Next.js application is deployed and stable.
- [ ] The CopilotKit chat interface is fully functional for basic interaction.
- [ ] Session management is working reliably.

**Epic 3 Readiness Checklist**:
- [ ] A stable `dev` branch containing the complete Epic 1 feature set is available.
- [ ] Access to the Langflow component schema is confirmed.
- [ ] The core action system from Story 1.3 is ready to be extended for JSON generation.

### Handoff: Epic 3 → Epic 5

**Epic 3 Completion Criteria**:
- [ ] All user stories in Epic 3 are marked as "Done".
- [ ] The system can generate valid Langflow JSON for a variety of workflow types.
- [ ] The real-time JSON preview is accurate and functional.
- [ ] The export system reliably produces all required artifacts (JSON, guides).

**Epic 5 Readiness Checklist**:
- [ ] The JSON generation engine is modular and can be influenced by new inputs (e.g., context from Epic 5).
- [ ] A library of existing workflow patterns is available for the agent to analyze and learn from.

### Handoff: Epic 5 → Epic 6.4

**Epic 5 Completion Criteria**:
- [ ] All user stories in Epic 5 are marked as "Done".
- [ ] The Context Engine is providing relevant, real-time information to the agent.
- [ ] The agent demonstrates enhanced reasoning and can handle ambiguous requests.
- [ ] The MCP server integration is stable and extensible.

**Epic 6.4 Readiness Checklist**:
- [ ] The domain for specialization is clearly defined.
- [ ] Subject Matter Experts (SMEs) for the target domain are available for consultation.
- [ ] The MCP patterns from Epic 5 are documented and ready to be used for creating domain-specific tools.
