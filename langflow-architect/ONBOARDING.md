# Langflow Architect - Developer Onboarding Guide

Welcome to the Langflow Architect project! This guide is your starting point for understanding our project structure, development methodology, and current focus. Following these steps will get you up to speed quickly and ensure effective collaboration.

---

## Step 1: Understand Our Methodology (BMAD v4)

Our project follows the **BMAD v4 methodology**, which emphasizes clear documentation, traceability, and a structured development process. Before diving into the code, it is critical that you understand how we work.

**Action:** Read the following two documents to understand our recent project reorganization and our new structure.

1.  **[BMAD Reorganization Summary](./docs/BMAD-REORGANIZATION-SUMMARY.md)**: Explains *why* and *how* we restructured our project documentation.
2.  **[BMAD Organization Complete](./docs/BMAD-ORGANIZATION-COMPLETE.md)**: Details the *final state* of our documentation and the 10 core epics that define our product.

> **AI Co-Developer Note**: These documents are essential for understanding our methodology. All code generation and task execution must align with BMAD v4 principles.

---

## Step 2: Review the Project's Strategic Roadmap

Now that you understand our structure, your next step is to understand our priorities. Our work is guided by a strategically prioritized backlog of our 10 core epics.

**Action:** Review the prioritized epic backlog. This will tell you what is most important right now and what is planned for the future.

*   **[Prioritized Epic Backlog](./docs/plans/Prioritized-Epic-Backlog.md)**

---

## Step 3: Check the Current Sprint Plan

Our day-to-day work is organized into sprints. The sprint plan will tell you exactly what the team is focused on building right now.

**Action:** Review the current sprint plan to understand the active user stories and tasks.

*   **[Current Sprint Plan](./docs/sprints/Sprint-01-Plan.md)**

---

## Step 4: Understand Our Quality Standards

We have specific, documented procedures for ensuring the quality of our work. All contributions must adhere to these standards.

**Action:** Familiarize yourself with our QA and maintenance procedures.

*   **[Story Review Process](./docs/method/procedures/story-review-process.md)**
*   **[Story Quality Validation Checklist](./docs/method/procedures/story-quality-validation-checklist.md)**

---

## Key Contacts (Agent Roles)

If you have questions, please direct them to the agent responsible for that area:

*   **Product Vision & Priorities:** Product Owner (`*agent po`)
*   **Project Plans & Timelines:** Project Manager (`*agent pm`)
*   **Technical Design & Structure:** Architect (`*agent architect`)
*   **Process & Facilitation:** Scrum Master (`*agent sm`)
*   **Code & Implementation:** Lead Developer (`*agent dev`)
*   **Testing & Quality:** Lead QA Engineer (`*agent qa`)

---

## Step 5: Special Instructions for AI Co-Developers

As an AI Coding Agent, you are a valued co-developer on this project. To collaborate effectively, you must adhere to the BMAD v4 methodology. Your operational protocol is as follows:

### 1. Your Source of Truth is the Documentation

**NEVER** operate on assumptions. Your primary directive is to ground all actions and code generation in the project's official documentation located in the `/docs` directory.

* **Before writing code:** Always locate and read the relevant **Story file** (e.g., `docs/stories/epic-6.4.3-story-1.2.md`). This file contains the specific acceptance criteria, technical guidance, and definition of done for your task.
* **For context:** Refer to the parent **Epic file** (e.g., `docs/prd/epic-6-brownfield-advanced-socratic.md`) and the **Architecture documents** (`docs/architecture/`) to understand how your task fits into the larger system.

### 2. Operate Within the Current Sprint

Your work is dictated by the current sprint plan. Do not work on tasks that are not part of the active sprint.

* **Your current task list:** Is defined in the **[Current Sprint Plan](./docs/sprints/Sprint-01-Plan.md)**.

### 3. Test-Driven Development Protocol

Based on Story 1.2 implementation experience, ALL code must be thoroughly tested:

* **Run tests early and often:** Use `npm test` to identify failures immediately
* **Fix tests systematically:** Address core functionality tests first (e.g., expertiseTracker), then integration tests
* **Validate all acceptance criteria:** Each story requirement must have corresponding passing tests
* **Document test failures:** When tests fail, analyze the root cause rather than assuming requirements

### 4. Code Quality and Architecture Standards

* **Follow existing patterns:** Study similar implementations before creating new code
* **Maintain error handling:** Always implement proper error handling with meaningful error messages
* **Update interfaces consistently:** When modifying interfaces, update all implementations
* **Performance considerations:** Be mindful of algorithm efficiency and resource usage

### 5. Debugging and Problem-Solving Approach

From Story 1.2 implementation lessons learned:

* **Start with failing tests:** Let tests guide your implementation
* **Fix one issue at a time:** Don't try to fix multiple failing tests simultaneously
* **Understand the domain:** Learn the business logic before implementing technical solutions
* **Validate assumptions:** Use tests to verify your understanding of requirements

### 6. Communication and Collaboration

* **Use the Command Structure:** Interact with the orchestrator and other agents using the `*` command syntax (e.g., `*task`, `*agent`).
* **State Your Intent:** Before executing a task, clearly state which story and tasks you are working on.
* **Ask for Clarification:** If any part of a story's requirements is ambiguous, do not proceed. Announce the ambiguity and ask the **Architect** or **Product Owner** for clarification.
* **Report Progress:** Regularly update on test results and implementation status

### 7. Branch and Merge Protocol

* **Work on feature branches:** Create feature branches following the pattern `feature/story-X-Y-description`
* **Commit meaningful changes:** Use descriptive commit messages that reference the story
* **Test before merging:** Ensure all critical tests pass before requesting merge
* **Document merge readiness:** Create clear assessments of what works and what needs attention

### 8. Common Pitfalls to Avoid

Based on recent development experience:

* **Don't assume test infrastructure works:** Verify test setup and mocking before implementing
* **Don't hardcode domain logic:** Use configurable patterns that can evolve
* **Don't skip error cases:** Always implement proper error handling and edge case coverage
* **Don't ignore integration issues:** Test how components work together, not just in isolation

---

## Current Project Status

**Last Updated:** September 1, 2025

### Recently Completed Work

**Story 1.2 - Dynamic Questioning Engine Implementation** ✅ COMPLETED

* **Branch:** `feature/story-1-2-questioning-engine` (merged to dev)
* **Status:** All core functionality implemented and tested
* **Key Achievements:**
  * DynamicExpertiseTracker: 13/13 tests passing
  * Integration tests: 16/16 tests passing
  * Domain analysis with healthcare/finance mapping
  * Contextual question generation
  * Error handling and validation
* **Remaining:** 7 non-critical infrastructure test failures (React DOM interactions, fetch API mocking)

### Active Development Areas

Check the **[Current Sprint Plan](./docs/sprints/Sprint-01-Plan.md)** for the most up-to-date task assignments.

### Technology Stack

* **Frontend:** Next.js 15.5.0, React, TypeScript
* **Backend:** Node.js, TypeScript
* **Testing:** Jest 30.0.5, React Testing Library
* **AI Integration:** CopilotKit for adaptive questioning
* **Architecture:** Model Context Protocol (MCP) servers

---

Welcome to the team! We are excited to have you contribute to our adaptive questioning engine and broader Langflow architecture.
