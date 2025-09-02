# BMad Orchestrator — Help

> All commands must start with * (asterisk)

## Core Commands

- `*help` — Show this guide
- `*chat-mode` — Start conversational mode for detailed assistance
- `*kb-mode` — Load full BMad knowledge base
- `*status` — Show current context, active agent, and progress
- `*exit` — Return to BMad or exit session

## Agent & Task Management

- `*agent [name]` — Transform into specialized agent (list if no name)
- `*task [name]` — Run specific task (list if no name; requires agent)
- `*checklist [name]` — Execute a checklist (list if no name; requires agent)

## Workflow Commands

- `*workflow [name]` — Start specific workflow (list if no name)
- `*workflow-guidance` — Get personalized help selecting the right workflow
- `*plan` — Create a detailed workflow plan before starting
- `*plan-status` — Show current workflow plan progress
- `*plan-update` — Update workflow plan status

## Other Commands

- `*yolo` — Toggle skip confirmations mode
- `*party-mode` — Group chat with all agents
- `*doc-out` — Output full document

> Tip: Each agent has unique tasks, templates, and checklists. Switch to an agent to access their capabilities.

---

## Available Specialist Agents

Type the number or use `*agent {id}`

### analyst — Business Analyst

- When to use: Market research, brainstorming, competitor analysis, project briefs, brownfield discovery
- Key deliverables: Project brief, research prompts, market/competitor docs

### pm — Product Manager

- When to use: PRDs, product strategy, feature prioritization, roadmap planning
- Key deliverables: PRD, epics, stories

### ux-expert — UX Expert

- When to use: UI/UX design, wireframes, prototypes, front-end specifications
- Key deliverables: Front-end spec, AI UI prompt

### architect — Architect

- When to use: System/solution design, API design, infrastructure planning
- Key deliverables: Architecture docs (frontend, backend, fullstack)

### dev — Full Stack Developer

- When to use: Implementation, debugging, refactoring, development best practices
- Key deliverables: Code changes, tests, fixes

### qa — Test Architect & Quality Advisor

- When to use: Quality gates, risk analysis, test strategy, traceability
- Key deliverables: QA gate decision, test designs, risk profile

### po — Product Owner

- When to use: Backlog management, story refinement, acceptance criteria, sprint planning
- Key deliverables: Validated artifacts, checklists, story validation

### sm — Scrum Master

- When to use: Story creation, epic management, agile guidance
- Key deliverables: Draft stories from PRD/architecture

### bmad-master — BMad Master Task Executor

- When to use: Run any task directly without persona switching
- Key deliverables: Any task/template/checklist outputs

---

## Available Workflows

Type the number or use `*workflow {id}`

- `greenfield-fullstack` — Greenfield Full-Stack Application Development
  - Purpose: Plan and build full-stack apps from concept to development with comprehensive artifacts

- `greenfield-service` — Greenfield Service/API Development
  - Purpose: Plan and build backend services/APIs from concept to development

- `greenfield-ui` — Greenfield UI/Frontend Development
  - Purpose: Plan and build frontend applications from concept to development

- `brownfield-fullstack` — Brownfield Full-Stack Enhancement
  - Purpose: Enhance/modernize existing full-stack apps with safe integration

- `brownfield-service` — Brownfield Service/API Enhancement
  - Purpose: Enhance existing backend services/APIs with integration strategy

- `brownfield-ui` — Brownfield UI/Frontend Enhancement
  - Purpose: Enhance existing frontend apps with design/system migrations