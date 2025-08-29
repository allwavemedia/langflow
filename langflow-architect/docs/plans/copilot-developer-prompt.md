# GitHub Copilot Developer Agent Prompt: Systematic Story Validation Improvement

## BMad Framework Integration

**Always reference and utilize the BMad framework** throughout your development process:

### Core BMad Resources
- **Configuration**: `bmad-core/core-config.yaml` - Central BMad settings and MCP integration
- **Workflows**: `bmad-core/workflows/` - Specialized development workflows (brownfield-fullstack recommended)  
- **Agents**: `bmad-core/agents/` - Agent definitions for SM (Bob), PM (John), Architect, Dev, QA
- **Checklists**: `bmad-core/checklists/` - Quality validation frameworks and standards

### BMad Command Usage
When coordinating improvements, leverage BMad commands:
- `*agent [role]` - Transform into specialized agent (sm, pm, architect, dev, qa)
- `*workflow brownfield-fullstack` - Execute enhancement workflow for existing projects
- `*story-checklist` - Apply 5-category validation framework
- `*plan [objective]` - Generate strategic improvement plans

### BMad Methodology Benefits
- **Systematic Approach**: Structured workflows prevent ad-hoc fixes
- **Quality Assurance**: Built-in validation frameworks ensure standards
- **Agent Coordination**: Specialized roles optimize task execution
- **Scalable Process**: Framework adapts to project complexity

**Integration Requirement**: Reference BMad framework components, follow established workflows, and utilize agent specializations throughout all improvement activities.

---

## Development Context

You are assisting with the **Langflow Architect project**, a sophisticated AI-powered application that guides users through Langflow workflow creation. The project uses **BMad methodology** with specialized agents for different roles (Product Manager, Scrum Master, Architect, Developer, QA).

## Current Situation

A comprehensive **story validation assessment** was completed across 31 user stories in 7 epics, revealing quality inconsistencies that need systematic improvement. A **3-phase improvement plan** has been created to address these issues without disrupting active development.

### Key Findings
- **61% of stories** are ready for development
- **26% need minor revision** (reference quality, testing guidance)
- **13% require major updates** (Epic 2 superseded, Epic 6.4 lacks technical detail)

## Your Mission

Help implement the **Systematic Story Validation Improvement Plan** by:

1. **Analyzing the current state** of story quality issues
2. **Prioritizing next actions** based on development impact
3. **Coordinating improvements** across the 3-phase timeline
4. **Maintaining development momentum** while improving quality
5. **Following BMad methodology** by referencing and utilizing the BMad framework throughout

## Project Structure Context

```
langflow-architect/
├── docs/
│   ├── stories/                    # User stories needing improvement
│   │   ├── epic-1-standalone-foundation.md    # ✅ READY (Grade: A-)
│   │   ├── epic-2-enhanced-socratic.md        # ❌ CRITICAL (Grade: C - Superseded)
│   │   ├── epic-3-json-generation.md          # ✅ READY (Grade: A)
│   │   ├── epic-4-deployment-ux.md            # ✅ READY (Grade: A)
│   │   ├── epic-5-enhanced-agent-intelligence.md # ✅ COMPLETE (Grade: A+)
│   │   ├── epic-6-phase-4-domain-expertise.md # ⚠️ HIGH (Grade: B- - Needs detail)
│   │   └── 6.1.mcp-server-discovery-marketplace.md # ✅ IN PROGRESS (Grade: A)
│   ├── plans/
│   │   └── systematic-story-validation-improvement-plan.md # Main plan
│   ├── architecture/               # Reference architecture docs
│   └── prd/                       # Product requirements
└── bmad-core/                     # BMad methodology framework
    ├── agents/                    # Agent definitions (PM, SM, Architect, etc.)
    ├── tasks/                     # Executable workflow tasks
    └── templates/                 # Document templates
```

## Critical Issues Requiring Immediate Attention

### 🚨 PHASE 1: CRITICAL RESOLUTION (Week 1)

#### Priority 1A: Epic 2 Migration Strategy (CRITICAL)
**Problem**: Epic 2 stories reference outdated architecture patterns - they've been superseded by Epic 5's enhanced agent intelligence architecture.

**Required Actions**:
1. **Update Epic 2 Header**:
   - Add "SUPERSEDED BY EPIC 5" notice
   - Explain migration rationale
   - Reference Epic 5 as current architecture

2. **Story Reference Migration**:
   - Map Epic 2 concepts to Epic 5 equivalents:
     - Story 2.1 (Category Framework) → Story 5.1 (Context Understanding)
     - Story 2.2 (Question Generation) → Story 5.6 (Advanced Questions)
     - Story 2.3 (Real-Time Construction) → Enhanced Epic 3
     - etc.

3. **Create Migration Documentation**:
   - Document architectural evolution
   - Provide developer guidance for current patterns

#### Priority 1B: Epic 6.4 Technical Enhancement (HIGH)
**Problem**: Epic 6.4 stories lack sufficient technical detail to enable Phase 6.4 development.

**Required Actions**:
1. **Add Component Specifications**:
   - Specific file paths and locations
   - Integration with existing Epic 5 context engine
   - CopilotKit action integration patterns

2. **Environment Configuration**:
   - Required environment variables
   - Configuration file specifications
   - MCP server integration setup

3. **Testing Enhancement**:
   - Domain expertise test scenarios
   - Compliance validation test cases
   - Integration testing with Epic 5 components

## Technology Stack Context

- **Framework**: Next.js 15.5.0 + CopilotKit 1.10.2
- **AI Integration**: OpenAI GPT + CopilotKit actions
- **Architecture**: MCP (Model Context Protocol) integration
- **Testing**: Jest + React Testing Library + Playwright
- **Deployment**: Vercel-optimized

## Available BMad Resources

### Agents Available for Coordination
- **Bob (Scrum Master)**: Story validation, epic management (`*agent sm`)
- **John (Product Manager)**: Strategic planning, PRD creation (`*agent pm`)
- **Winston (Architect)**: Technical architecture guidance (`*agent architect`)
- **QA Agent**: Code review and quality validation (`*agent qa`)

### Key BMad Commands
- `*workflow brownfield-fullstack` - For coordinating enhancements
- `*agent [name]` - Transform into specialist agent
- `*task [task-name]` - Execute specific improvement tasks
- `*plan` - Create detailed implementation plans

## Decision Framework

When choosing what to do next, prioritize based on:

### 🔥 **Critical (Do First)**
- Issues that block Phase 6.4 development
- Epic 2 superseded references causing confusion
- Story 6.1 completion (Tasks 2-6 remaining)

### ⚠️ **High Priority**
- Stories graded B- or lower needing technical detail
- Reference quality standardization
- Testing guidance enhancement

### 📝 **Medium Priority**
- Cross-epic dependency documentation
- Technical implementation consistency
- Quality standard establishment

## Recommended Next Actions

Based on the current state and improvement plan, here are your options:

### Option 1: Complete Active Sprint (RECOMMENDED)
**Focus**: Finish Story 6.1 MCP Marketplace implementation
**Rationale**: 
- Foundation complete with 20 passing tests
- Tasks 2-6 are well-defined and ready
- Delivers immediate user value
- Provides infrastructure for Epic 6.4

**Action**: 
```bash
*agent dev
# Then work on Story 6.1 tasks: search, filters, preview, CopilotKit integration
```

### Option 2: Resolve Critical Story Issues
**Focus**: Fix Epic 2 superseded references and enhance Epic 6.4
**Rationale**:
- Eliminates major development blockers
- Prepares Epic 6.4 for implementation
- Addresses highest-impact validation failures

**Action**:
```bash
*agent pm
*task create-brownfield-epic  # For Epic 6.4 enhancement
```

### Option 3: Systematic Quality Improvement
**Focus**: Implement full 3-phase improvement plan
**Rationale**:
- Addresses all validation issues comprehensively
- Establishes sustainable quality patterns
- Long-term project health improvement

**Action**:
```bash
*workflow brownfield-fullstack
# Then follow systematic improvement plan phases
```

## Success Criteria

Your implementation should achieve:

### Phase 1 Success (Week 1)
- ✅ Epic 2 clearly marked as superseded with Epic 5 references
- ✅ Epic 6.4 stories achieve "READY" validation status
- ✅ Zero development blockers related to story quality

### Overall Project Success
- 🎯 **Validation Score**: Improve from B+ to A-
- 🎯 **Development Readiness**: 90%+ stories ready for implementation
- 🎯 **Process Sustainability**: Quality standards maintainable

## Quality Standards Reference

Use **Epic 5: Enhanced Agent Intelligence** as the gold standard for:
- Technical implementation detail
- Reference quality and effectiveness
- Testing guidance comprehensiveness
- Self-contained story structure

## Your Decision

Given this context, **what do you recommend as the next action?**

Consider:
1. **Current project momentum** (Story 6.1 in progress)
2. **Critical blocking issues** (Epic 2 superseded, Epic 6.4 lacking detail)
3. **Resource availability** and coordination with other agents
4. **Impact on upcoming Phase 6.4 implementation**

**Provide your recommendation with rationale, then coordinate with the appropriate BMad agent to execute the chosen approach.**

---

*This prompt provides complete context for the GitHub Copilot developer agent to make informed decisions about the systematic story validation improvement process while maintaining alignment with BMad methodology and project objectives.*
