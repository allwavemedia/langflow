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

### Immediate Next Steps (Scrum Master Recommendations)

**For Sprint 01 Completion (Target: September 15, 2025):**

1. **Critical Bug Resolution (Days 1-3):**
   * Prioritize DynamicExpertiseTracker fixes (scoring algorithm, progression logic)
   * Resolve ContextEngine domain analysis issues
   * Fix SearchManager and LangflowSchemaRegistry validation
   * Address McpMarketplace DOM manipulation errors

2. **Integration Testing (Days 4-5):**
   * Validate component integration across questioning system
   * Test MCP server integration with enhanced settings page
   * Verify feature flag functionality and circuit breaker patterns

3. **Environment Standardization (Day 6):**
   * Implement proper network service mocking in tests
   * Standardize test environment setup across team
   * Resolve external service integration issues

4. **Sprint Retrospective & Planning (Day 7):**
   * Review sprint outcomes and lessons learned
   * Update sprint plan status to reflect actual progress
   * Plan Sprint 02 based on resolved issues and remaining Epic 6 work

**Process Improvements to Implement Immediately:**

* **Daily Stand-ups:** Begin daily 15-minute status updates starting tomorrow
* **Test Failure Triage:** Create process for immediate analysis of test failures
* **Status Synchronization:** Update sprint plan to match actual development progress
* **Documentation Automation:** Implement automated status updates from CI/CD

### Risk Assessment

**High Risk Issues:**

* 18 critical test failures could impact production deployment
* Sprint status discrepancy indicates process breakdown
* Integration issues may cascade to other components

**Mitigation Strategies:**

* Dedicated focus on critical fixes before new development
* Pair programming on complex integration issues
* Enhanced testing protocols for future development
* Regular status synchronization meetings

### Success Metrics for Sprint Completion

* **Test Health:** Achieve >95% test pass rate (currently 84.2%)
* **Integration Stability:** All component integrations functioning correctly
* **Sprint Planning Accuracy:** Sprint status reflects actual development progress
* **Documentation Quality:** Single source of truth maintained throughout sprint

---

## Step 4: Understand Our Quality Standards

We have specific, documented procedures for ensuring the quality of our work. All contributions must adhere to these standards.

**Action:** Familiarize yourself with our QA and maintenance procedures.

* **[Story Review Process](./docs/method/procedures/story-review-process.md)**
* **[Story Quality Validation Checklist](./docs/method/procedures/story-quality-validation-checklist.md)**

---

## Key Contacts (Agent Roles)

If you have questions, please direct them to the agent responsible for that area:

* **Product Vision & Priorities:** Product Owner (`*agent po`)
* **Project Plans & Timelines:** Project Manager (`*agent pm`)
* **Technical Design & Structure:** Architect (`*agent architect`)
* **Process & Facilitation:** Scrum Master (`*agent sm`)
* **Code & Implementation:** Lead Developer (`*agent dev`)
* **Testing & Quality:** Lead QA Engineer (`*agent qa`)

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

**Last Updated:** September 2, 2025

### Sprint Status Update

**Current Sprint:** Sprint 01 (Epic 6 - Advanced Socratic Engine)
**Sprint Dates:** September 2-15, 2025
**Sprint Goal:** Implement core adaptive question generation engine
**Actual Status:** ⚠️ **PARTIALLY COMPLETE** - Significant progress made but critical issues remain

**Sprint Status Discrepancy:** The official sprint plan shows "Not Started" status, but substantial development work has been completed. This highlights a need for better sprint tracking and status updates.

### Recently Completed Work

**Story 1.2 - Dynamic Questioning Engine Implementation** ✅ COMPLETED (with issues)

* **Branch:** `feature/story-1-2-questioning-engine` (merged to dev)
* **Status:** Core functionality implemented and merged, but requires critical fixes
* **Key Achievements:**
  * DynamicExpertiseTracker: Core logic implemented (5/5 tests passing in isolation)
  * Integration tests: 16/16 tests passing for component integration
  * Domain analysis with healthcare/finance mapping functional
  * Contextual question generation working
  * Error handling and validation implemented
* **Critical Issues Requiring Immediate Attention:**
  * 18 test failures in core functionality (15.8% failure rate)
  * DynamicExpertiseTracker scoring algorithm issues (0.568 vs 0.7 threshold)
  * ContextEngine domain analysis returning incorrect classifications
  * SearchManager error handling broken
  * Network service mocking failures in test environment
  * McpMarketplace component DOM manipulation errors
* **Impact:** System functional but not production-ready due to integration failures

**MCP Server Settings Page Enhancement** ✅ COMPLETED

* **Branch:** `feature/add-settings-page-20250902` (merged to dev)
* **Status:** Enhanced MCP server management interface with comprehensive configuration guidance
* **Key Achievements:**
  * Created comprehensive MCP server settings page (`/settings`)
  * Added server type categories: Documentation, GitHub, Filesystem, Database, API, Custom
  * Implemented transport type guidance (HTTP Stream vs SSE)
  * Added form validation and user-friendly error handling
  * Included educational content about MCP server capabilities
  * Verified compatibility with all CopilotKit-supported MCP server types
  * Updated MCP server configuration with corrected Microsoft Learn endpoint
  * Enhanced user experience with detailed server descriptions and tool counts
* **Impact:** Significantly improved MCP server management UX and reduced configuration complexity

**Story 1.1 - Foundation Component Availability** ✅ COMPLETED

* **PR:** #15 (merged to dev)
* **Status:** Complete implementation with all dependencies created
* **Key Achievements:**
  * TypeScript interface system for Advanced Socratic Questioning
  * Feature flag system with circuit breaker pattern
  * React hooks integration with safe composition pattern
  * Enhanced Domain Provider with zero modification to existing system
  * Comprehensive test suite (11/11 tests passing)
* **Architecture Achievement:** Successfully implemented composition pattern ensuring backward compatibility

### Active Development Areas

**🔴 CRITICAL PRIORITY (Blockers for Production):**

* **Story 1.2 Critical Test Failures:** Address 18 test failures in core functionality
  * Fix DynamicExpertiseTracker scoring algorithm (currently 0.568 vs 0.7 required)
  * Correct ContextEngine domain analysis logic ("patient" vs "healthcare" misclassification)
  * Repair SearchManager error handling
  * Resolve LangflowSchemaRegistry validation issues
  * Fix McpMarketplace component DOM manipulation errors
* **Integration Testing:** Validate component integration across the questioning system
* **Environment Setup:** Properly mock network dependencies and external services in tests

**🟡 HIGH PRIORITY (Quality & Stability):**

* **Sprint Status Synchronization:** Update Sprint 01 plan to reflect actual progress and current status
* **Test Infrastructure Fixes:** Address 7 non-critical infrastructure test failures (React DOM interactions, fetch API mocking)
* **Documentation Updates:** Keep project documentation current with development progress and issue resolution
* **MCP Server Integration Testing:** Validate enhanced MCP server settings with various server types and transport methods

**🟢 MEDIUM PRIORITY (Enhancements):**

* **Performance Optimization:** Review and optimize MCP server connection handling and response times
* **User Experience Enhancements:** Further improve MCP server configuration UX based on user feedback
* **Error Handling Improvements:** Enhance error messages and recovery mechanisms for production stability
* **Feature Flag Refinement:** Optimize circuit breaker patterns and performance monitoring

**🔵 LOW PRIORITY (Future Development):**

* **Additional MCP Server Types:** Consider support for emerging MCP server categories
* **Advanced Configuration Options:** Explore additional MCP server customization features
* **Multi-Cloud Integration:** Evaluate support for additional cloud provider MCP servers
* **Analytics Integration:** Consider adding usage analytics and performance metrics

### Development Process Improvements Needed

**Sprint Management:**

* Implement real-time sprint status updates to prevent status discrepancies
* Establish daily stand-up process for progress tracking
* Create sprint burndown charts and progress visualization

**Quality Assurance:**

* Implement automated test failure analysis and reporting
* Establish test environment standardization across team
* Create test failure triage and resolution workflow

**Documentation:**

* Maintain single source of truth for project status
* Automate status updates from CI/CD pipeline
* Create development dashboard for real-time project visibility

### Technology Stack

**Core Framework:**

* Next.js 15.5.0 with React 19 and TypeScript
* Turbopack for fast development builds
* Tailwind CSS for styling

**AI Integration:**

* CopilotKit for AI-powered questioning and MCP server management
* Model Context Protocol (MCP) servers with HTTP Stream and SSE transport
* Enhanced MCP server settings page with comprehensive configuration guidance
* Support for multiple MCP server types: Documentation, GitHub, Filesystem, Database, API, Custom

**Testing & Quality:**

* Jest 30.0.5 with React Testing Library
* 29/36 tests passing (7 non-critical infrastructure failures)
* GitHub Actions for CI/CD

**Development Methodology:**

* BMAD v4 methodology with structured sprint planning
* Feature branch workflow with PR reviews
* Comprehensive documentation and onboarding materials

---

Welcome to the team! We are excited to have you contribute to our adaptive questioning engine and broader Langflow architecture.
