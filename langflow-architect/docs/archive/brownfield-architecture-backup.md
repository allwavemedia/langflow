# Langflow Architect Brownfield Architecture: Epic 6.4.3 Advanced Socratic Questioning

## Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Initial Architecture | Aug 29, 2025 | 1.0 | Brownfield architecture for Epic 6.4.3 Advanced Socratic Questioning | Architect Agent (Winston) |

## 1. Introduction

### Enhancement Overview

This document defines the technical architecture for implementing Epic 6.4.3 Advanced Socratic Questioning within the existing Langflow Architect application. The enhancement adds adaptive questioning capabilities that dynamically adjust to user domain expertise while preserving the existing 92% accurate domain detection system (Epic 6.4.1).

### Architecture Goals

**Primary Objectives**:
- Integrate adaptive Socratic questioning without disrupting operational domain detection
- Maintain existing performance metrics (<3s response time, currently 2.1s average)
- Preserve all 11 existing CopilotKit actions functionality
- Implement progressive disclosure based on user expertise tracking
- Ensure graceful degradation when external services are unavailable

**Integration Philosophy**: Composition-based extension pattern that adds sophisticated questioning capabilities while maintaining zero modification to existing domain detection logic.

## 2. Current Project Analysis

### Existing System State

**Project Status**: 70% complete Next.js/TypeScript application with proven CopilotKit integration
**Foundation**: Epic 6.4.1 COMPLETED - Dynamic Domain Intelligence achieving 92% accuracy with <3s response time
**Current Architecture**: Standalone web application with sophisticated domain detection using multi-source knowledge aggregation

### Technology Stack Analysis

**Frontend Framework**: Next.js 15.5.0 with Turbopack, React 19.1.0
**Language**: TypeScript 5 (strict mode enabled)
**AI Integration**: CopilotKit 1.10.2 (Core, UI, Runtime packages)
**State Management**: React Context (`DomainExpertiseProvider`)
**Styling**: Tailwind CSS 4
**Infrastructure**: Vercel deployment platform, Node.js 18+
**External APIs**: OpenAI GPT-5, MCP servers (Microsoft Docs, CopilotKit), Tavily/DuckDuckGo search

### Performance Baseline

**Current Metrics**:

- Domain detection response time: 2.1s average (<3s requirement)
- Domain detection accuracy: 92% across multiple domains
- CopilotKit actions: 11 operational actions with established response patterns
- Multi-source knowledge queries: Cached for optimal performance

## 3. Enhancement Scope

### Feature Addition Scope

**Core Enhancement**: Adaptive Socratic questioning system with progressive disclosure
**Integration Depth**: Deep integration with existing domain detection and CopilotKit framework
**User Experience**: Natural integration with existing workflow patterns
**Performance Impact**: <500ms additional latency, <20% memory increase

### Integration Points

**Primary Integration**: Extension of existing `DomainExpertiseProvider` React context
**API Integration**: New CopilotKit actions following established 3-action pattern
**UI Integration**: Component composition with existing domain detection interface
**Knowledge Integration**: Leverage existing `multiSourceKnowledge.ts` caching

### Risk Assessment

**Technical Risks**: Questioning system interference with domain detection performance
**Integration Risks**: Context extension affecting existing domain state management
**Deployment Risks**: Feature rollout impact on existing user workflows
**Mitigation Strategy**: Feature flags, composition patterns, regression testing

## 4. Tech Stack Alignment

### Existing Stack Preservation

**No Changes Required**:

- Next.js 15.5.0 build and deployment process
- React 19.1.0 component architecture
- TypeScript 5 strict mode compilation
- Vercel platform deployment
- External API integrations (OpenAI, MCP servers, search APIs)

### Enhancement Stack Extensions

**New Dependencies**: None required - all functionality built with existing CopilotKit and React capabilities
**Development Dependencies**: Potential Jest test utilities for questioning component testing
**Configuration Extensions**: Environment variables for feature flags and debugging

### Performance Alignment

**Response Time Budget**: 500ms additional latency allowance for questioning features
**Memory Budget**: 20% increase allowance for questioning state management
**Caching Strategy**: Leverage existing multi-source knowledge caching for question enrichment
**Monitoring Strategy**: Browser-based performance tracking with alert thresholds

## 5. Data Models and State Management

### Core Data Models

#### SocraticQuestioningContext

```typescript
interface SocraticQuestioningContext {
  isActive: boolean;
  currentQuestion: AdaptiveQuestion | null;
  expertiseLevel: ExpertiseLevel;
  conversationHistory: QuestionSession[];
  progressIndicators: ProgressMetrics;
}
```

#### AdaptiveQuestion

```typescript
interface AdaptiveQuestion {
  id: string;
  text: string;
  sophisticationLevel: 1 | 2 | 3 | 4 | 5;
  domainContext: string;
  generatedAt: Date;
  responseOptions?: string[];
  followUpStrategy: FollowUpStrategy;
}
```

#### QuestionSession

```typescript
interface QuestionSession {
  sessionId: string;
  domainContext: string;
  questions: AdaptiveQuestion[];
  userResponses: UserResponse[];
  expertiseLevelProgression: ExpertiseLevel[];
  performanceMetrics: SessionMetrics;
}
```

#### ExpertiseLevel

```typescript
type ExpertiseLevel = 'novice' | 'intermediate' | 'advanced' | 'expert';

interface ExpertiseIndicators {
  level: ExpertiseLevel;
  confidence: number; // 0-1
  domainSpecificIndicators: Record<string, number>;
  progressionTrend: 'increasing' | 'stable' | 'decreasing';
}
```

### State Management Strategy

**Context Extension Pattern**:

```typescript
// Extend existing DomainExpertiseProvider
interface EnhancedDomainContext extends DomainExpertiseContext {
  questioningState: SocraticQuestioningContext;
  questioningActions: {
    generateQuestion: (context: DomainContext) => Promise<AdaptiveQuestion>;
    trackExpertise: (response: UserResponse) => ExpertiseLevel;
    updateProgression: (session: QuestionSession) => void;
  };
}
```

**Composition Approach**: New questioning state managed alongside existing domain state without modification to existing domain detection logic.

## 6. Component Architecture

### New Component Hierarchy

```
Enhanced Domain Intelligence System
├── DomainExpertiseProvider (Extended)
│   ├── Existing Domain Detection Components (Unchanged)
│   └── Socratic Questioning Components (New)
│       ├── AdaptiveQuestionPanel
│       │   ├── QuestionDisplay
│       │   ├── ResponseHandler
│       │   └── ProgressIndicator
│       ├── ExpertiseTracker
│       └── QuestionGenerationEngine
```

### Component Interaction Diagram

```mermaid
graph TD
    A[DomainExpertiseProvider] --> B[Domain Detection System]
    A --> C[Socratic Questioning System]
    
    B --> D[domainDetectionSystem.ts]
    B --> E[multiSourceKnowledge.ts]
    B --> F[Existing Domain UI]
    
    C --> G[AdaptiveQuestionPanel]
    C --> H[QuestionGenerationEngine]
    C --> I[ExpertiseTracker]
    
    H --> E[multiSourceKnowledge.ts - Reuse Cache]
    G --> J[QuestionDisplay]
    G --> K[ResponseHandler]
    G --> L[ProgressIndicator]
    
    I --> M[Expertise Level Updates]
    M --> H[Question Sophistication Adjustment]
    
    style B fill:#90EE90
    style C fill:#FFE4B5
    style E fill:#87CEEB
```

### Component Specifications

#### AdaptiveQuestionPanel

**Purpose**: Primary UI component for questioning interface
**Props**: `domainContext`, `expertiseLevel`, `onResponse`
**State**: Current question, response input, progress display
**Integration**: Follows existing domain component styling patterns

#### QuestionGenerationEngine

**Purpose**: Core questioning logic leveraging existing domain detection
**Dependencies**: `domainDetectionSystem.getActiveDomainContext()`, `multiSourceKnowledge.queryMultipleSources()`
**Output**: Contextually relevant questions without hardcoded domain logic

#### ExpertiseTracker

**Purpose**: Progressive disclosure and expertise level management
**Input**: User responses, domain indicators, conversation history
**Output**: Updated expertise level and sophistication recommendations

## 7. Source Tree Integration

### New Directory Structure

```
app/src/
├── lib/
│   ├── domain/              # Existing domain detection (unchanged)
│   │   ├── domainDetectionSystem.ts
│   │   ├── multiSourceKnowledge.ts
│   │   └── types.ts
│   └── enhanced/            # New questioning system
│       ├── questioning/
│       │   ├── questionGenerator.ts
│       │   ├── expertiseTracker.ts
│       │   ├── questionTypes.ts
│       │   └── questioningEngine.ts
│       └── hooks/
│           ├── useAdaptiveQuestioning.ts
│           ├── useExpertiseTracking.ts
│           └── useQuestionGeneration.ts
├── components/
│   ├── domain/              # Existing domain components (unchanged)
│   └── questioning/         # New questioning components
│       ├── AdaptiveQuestionPanel.tsx
│       ├── QuestionDisplay.tsx
│       ├── ResponseHandler.tsx
│       ├── ProgressIndicator.tsx
│       └── ExpertiseTracker.tsx
└── providers/
    └── DomainExpertiseProvider.tsx  # Extended with questioning context
```

### Integration Strategy

**File Modification Approach**: Extend existing `DomainExpertiseProvider` using composition pattern
**Import Strategy**: New questioning modules import existing domain detection utilities
**Naming Convention**: Maintain existing camelCase for functions, PascalCase for components
**Code Organization**: Clear separation between existing and new functionality

### Source Tree Impact

**Modified Files**:

- `providers/DomainExpertiseProvider.tsx` (extended with questioning context)
- `app/page.tsx` (integration of questioning UI components)

**New Files**: All files in `lib/enhanced/` and `components/questioning/` directories

**Unchanged Files**: All existing domain detection logic, CopilotKit action definitions, existing UI components

## 8. Infrastructure Considerations

### Deployment Infrastructure

**Current Infrastructure**: Vercel platform deployment with Next.js 15.5.0 and Turbopack bundling

**Epic 6.4.3 Infrastructure Approach**:

- **Zero Additional Infrastructure Requirements** - All questioning capabilities deploy within existing Next.js application bundle
- **Feature Flag Strategy** - Environment variable-based feature flags for safe rollout without infrastructure changes
- **Existing Build Process** - Standard Next.js production build handles all questioning system components

### Configuration Management

**Environment Variables for Safe Rollout**:

```
NEXT_PUBLIC_ENABLE_SOCRATIC_QUESTIONING=false  # Feature flag for gradual rollout
NEXT_PUBLIC_QUESTIONING_DEBUG_MODE=false      # Debug mode for development/testing
NEXT_PUBLIC_QUESTIONING_PERFORMANCE_LOG=false # Performance monitoring toggle
```

**API Key Management**: All existing API keys (OpenAI, Tavily, DuckDuckGo) remain unchanged - questioning system leverages existing external service connections

### Performance Monitoring Strategy

**Response Time Tracking**:

- Browser-based performance monitoring for questioning system response times
- Console logging for domain detection + questioning combined latency
- Alert thresholds: Warn if combined response time exceeds 2.5s, critical if exceeds 3s

**Memory Usage Monitoring**:

- Client-side memory tracking for questioning state management
- Baseline comparison against current domain detection memory footprint
- Target: <20% memory increase with questioning active

### Rollback and Safety Infrastructure

**Feature Flag Rollback**: Instant disable capability through environment variable change
**Graceful Degradation**: System continues full domain detection functionality with questioning disabled
**Performance Circuit Breaker**: Automatic questioning disable if response times exceed thresholds

## 9. Testing Strategy - Regression-First Approach

### Existing System Preservation Testing

**Priority 1: Domain Detection Regression Tests**

- Validate existing 92% domain detection accuracy remains unchanged
- Test all domain detection APIs (`domainDetectionSystem.analyzeUserContext`, `domainDetectionSystem.activateDomainExpertise`) return identical responses
- Performance regression testing: maintain 2.1s average response time baseline

**Priority 2: CopilotKit Action Preservation**

- Test all 11 existing CopilotKit actions maintain functionality
- Validate action response structures remain unchanged
- Ensure action performance baselines are preserved

**Priority 3: React Context State Management**

- Test existing `DomainExpertiseProvider` functionality remains intact
- Validate domain switching behavior continues normally
- Ensure UI state management patterns remain consistent

### New Feature Integration Testing

**Questioning System Component Tests**

- Unit tests for `AdaptiveQuestionPanel`, `QuestionResponseHandler`, `QuestionProgressIndicator`
- Integration tests for questioning state with existing domain context
- Performance tests for question generation (<500ms additional latency)

**End-to-End Workflow Testing**

- Complete user journey: domain detection → question generation → progressive disclosure
- Fallback scenario testing when MCP servers unavailable
- Memory usage validation (<20% increase from baseline)

### Testing Framework Integration

**Unit Testing**: Jest with React Testing Library for component testing
**Integration Testing**: Playwright E2E tests following existing patterns in `__tests__/` directory
**Performance Testing**: Custom performance monitoring with browser APIs
**Regression Testing**: Automated test suite validating existing functionality preservation

## 10. Security Integration

### Existing Security Measures Preservation

**Authentication**: No changes - existing Vercel deployment authentication patterns maintained
**Authorization**: No changes - client-side React application security model unchanged  
**Data Protection**: Enhanced privacy - questioning conversations remain client-side only, no additional data storage
**Security Tools**: Existing ESLint security rules and TypeScript strict mode compliance maintained

### Enhancement Security Requirements

**New Security Measures**: Input validation for user responses to questioning system, sanitization of generated questions
**Integration Points**: Secure extension of existing `DomainExpertiseProvider` context without exposing sensitive domain data
**Compliance Requirements**: Maintain existing data privacy standards, no additional compliance requirements

### Security Testing

**Existing Security Tests**: All current security measures continue unchanged
**New Security Test Requirements**: Input validation testing for questioning system, XSS prevention for generated question content
**Penetration Testing**: No additional requirements - questioning system operates within existing security boundary

## 11. Next Steps and Handoff

### Story Manager Handoff

**Epic 6.4.3 Implementation Guidance for Story Manager:**

You have comprehensive planning documentation ready for story implementation:

**Reference Documents**:

- PRD: `docs/brownfield-prd-epic-6.4.3.md` (5-story implementation sequence)
- Architecture: `docs/brownfield-architecture.md` (complete technical blueprint) 

**Key Integration Requirements**:

- Preserve existing 92% domain detection accuracy and <3s response time
- Use composition pattern extending `DomainExpertiseProvider` without modification
- New questioning modules in `app/src/lib/enhanced/` directory
- Maintain all 11 existing CopilotKit actions functionality

**Implementation Sequence**:

1. **Story 1.1**: System Discovery and Safe Integration Foundation
2. **Story 1.2**: Adaptive Question Generation Engine  
3. **Story 1.3**: Progressive Disclosure and Expertise Tracking
4. **Story 1.4**: User Interface Integration and Experience
5. **Story 1.5**: CopilotKit Action Enhancement and Performance Optimization

**First Story Focus**: Start with Story 1.1 for safe integration foundation before building questioning features.

### Developer Handoff

**Epic 6.4.3 Development Guidance:**

**Architecture Reference**: This document provides complete technical implementation blueprint including:

- Component interaction diagrams and data models
- Source tree integration strategy (`lib/enhanced/` directory structure)
- Performance constraints and compatibility requirements

**Integration Requirements**:

- Extend existing domain detection without modification to core `domainDetectionSystem.ts`
- Follow established TypeScript A- grade standards and ESLint configuration
- Use existing CopilotKit action patterns for questioning functionality
- Implement feature flags for safe rollout capability

**Key Technical Decisions**:

- Composition-based architecture extending `DomainExpertiseProvider`
- React Context state management for questioning state (no database changes)
- Leverage existing `multiSourceKnowledge.ts` caching for question enrichment
- Progressive disclosure UI following existing domain confidence display patterns

**Implementation Sequencing**:

1. Create questioning state management in `DomainExpertiseProvider` extension
2. Build question generation engine using existing domain detection context
3. Implement progressive disclosure and expertise tracking
4. Create questioning UI components following existing design patterns
5. Add CopilotKit actions for questioning capabilities

---

## Architecture Document Status: Complete

This comprehensive brownfield architecture document provides the technical foundation for safe implementation of Epic 6.4.3 Advanced Socratic Questioning while preserving the integrity and performance of the existing domain detection system. The composition-based approach ensures zero disruption to operational functionality while adding sophisticated questioning capabilities.

**Next Step**: Proceed to PO validation phase to review all planning documents before beginning story implementation.
| --------- | ---------- | ------- | -------------------------- |
| Runtime   | Node.js    | 18+     | Next.js requirement        |
| Framework | Next.js    | 15.5.0  | Latest with Turbopack      |
| UI Library| React      | 19.1.0  | Latest React 19           |
| AI Framework | CopilotKit | 1.10.2  | Core, UI, Runtime packages |
| Language  | TypeScript | 5       | Strict typing enabled      |
| Styling   | Tailwind   | 4       | Latest Tailwind CSS        |
| Build     | Turbopack  | Latest  | Next.js 15 bundler        |
| Testing   | Jest       | 30.0.5  | With React Testing Library |
| E2E Testing | Playwright | 1.55.0  | Browser automation        |

### Repository Structure Reality Check

- **Type**: Monorepo structure with web-bundles and langflow-architect separation
- **Package Manager**: npm (lockfile: package-lock.json)
- **Notable**: BMad methodology integration in `bmad-core/` directory

## Source Tree and Module Organization

### Project Structure (Actual)

```text
langflow-architect/
├── app/                          # Next.js application root
│   ├── src/
│   │   ├── app/                  # Next.js app router
│   │   │   ├── page.tsx          # Home component with CopilotKit actions
│   │   │   ├── api/copilotkit/   # CopilotKit API endpoint
│   │   │   └── demo/             # Demo applications
│   │   ├── components/           # React components
│   │   │   ├── domain/           # Domain expertise components (Epic 6.4.1)
│   │   │   └── CopilotProvider.tsx # CopilotKit setup
│   │   ├── lib/enhanced/         # Enhanced functionality modules
│   │   │   ├── domainDetectionSystem.ts # CRITICAL: 92% accuracy domain detection
│   │   │   ├── multiSourceKnowledge.ts  # CRITICAL: Knowledge aggregation pattern
│   │   │   ├── contextEngine.ts         # Conversation context analysis
│   │   │   ├── mcpManager.ts           # MCP server management
│   │   │   └── searchManager.ts        # Web search functionality
│   │   ├── features/             # Feature-specific modules
│   │   ├── services/             # External service integrations
│   │   └── types/                # TypeScript type definitions
│   ├── config/                   # Configuration files
│   │   └── mcp-servers.json      # MCP server configurations
│   ├── docs/                     # Application documentation
│   └── __tests__/                # Jest test suites
├── docs/                         # Project documentation
│   ├── stories/                  # Epic and story documentation
│   │   └── epic-6.4.3-advanced-socratic-questioning.md # TARGET ENHANCEMENT
│   ├── architecture/             # Architecture documentation
│   └── qa/                       # Quality assurance documentation
└── bmad-core/                    # BMad methodology framework
    ├── agents/                   # BMad agent definitions
    ├── workflows/                # BMad workflow templates
    └── tasks/                    # BMad task definitions
```

### Key Modules and Their Purpose

**Epic 6.4.1 Foundation (COMPLETE)**:
- **Domain Detection**: `app/src/lib/enhanced/domainDetectionSystem.ts` - DomainDiscoveryEngine class with 92% accuracy
- **Knowledge Integration**: `app/src/lib/enhanced/multiSourceKnowledge.ts` - MultiSourceKnowledge class for synthesis
- **React Context**: `app/src/components/domain/DomainExpertiseProvider.tsx` - Domain state management
- **Demo Interface**: `app/src/app/demo/domain-intelligence/page.tsx` - Working demo at `/demo/domain-intelligence`

**CopilotKit Integration (OPERATIONAL)**:
- **API Endpoint**: `app/src/app/api/copilotkit/route.ts` - 3 core actions implemented
- **Frontend Integration**: `app/src/app/page.tsx` - useCopilotAction and useCopilotReadable hooks
- **Provider Setup**: `app/src/components/CopilotProvider.tsx` - CopilotKit configuration

**Infrastructure Modules**:
- **MCP Management**: `app/src/lib/enhanced/mcpManager.ts` - Microsoft Docs and CopilotKit MCP servers
- **Search Management**: `app/src/lib/enhanced/searchManager.ts` - Tavily and DuckDuckGo integration
- **Context Engine**: `app/src/lib/enhanced/contextEngine.ts` - Conversation analysis

## Data Models and APIs

### Data Models

**Epic 6.4.1 - Domain Detection Models** (Reference: `domainDetectionSystem.ts`):

```typescript
interface DomainContext {
  domain: string;
  confidence: number;
  indicators: string[];
  timestamp: Date;
  source: 'conversation' | 'mcp' | 'web_search' | 'hybrid';
}

interface EnhancedDomainContext extends DomainContext {
  knowledge: DomainKnowledge;
  relatedDomains: string[];
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced';
  complianceFrameworks: string[];
}

interface ComponentRecommendation {
  componentId: string;
  name: string;
  category: string;
  relevanceScore: number;
  domainSpecificity: number;
  usageContext: string;
  integrationNotes?: string;
}
```

**Multi-Source Knowledge Models** (Reference: `multiSourceKnowledge.ts`):

```typescript
interface KnowledgeResult {
  content: SynthesizedKnowledge;
  sources: KnowledgeSource[];
  confidence: number;
  attribution?: string[];
  responseTimeMs?: number;
}
```

### API Specifications

**CopilotKit Actions** (Reference: `app/src/app/api/copilotkit/route.ts`):

1. **analyze_workflow_requirements** - Primary workflow analysis
2. **generate_workflow_questions** - Socratic question generation  
3. **generate_langflow_json** - Workflow JSON generation

**Domain Detection API** (Reference: `domainDetectionSystem.ts`):
- `domainDetectionSystem.analyzeUserContext(input, sessionId)` - Returns DomainContext
- `domainDetectionSystem.activateDomainExpertise(input, sessionId)` - Returns DomainActivationResult
- `domainDetectionSystem.enhanceWithWebSearch(context)` - Returns EnhancedDomainContext

## Technical Debt and Known Issues

### Critical Technical Debt

1. **CopilotKit Action Limitations**: Current questioning is basic - Epic 6.4.3 needs adaptive sophistication
2. **Missing Epic 5 Integration**: References to "Epic 5 questioning patterns" need discovery - may not exist
3. **Performance Optimization**: Domain detection is 2.1s average but Epic 6.4.3 must maintain <3s total
4. **Question State Management**: No existing progressive questioning state - needs implementation

### Workarounds and Gotchas

- **Domain Detection Integration**: Must use composition pattern, not modification of existing system
- **CopilotKit Action Pattern**: Follow existing 3-action pattern for consistency (analyze → questions → generate)
- **React Context Extension**: `DomainExpertiseProvider` must be extended, not replaced
- **MCP Server Dependencies**: Graceful degradation required when MCP servers unavailable
- **Web Search Caching**: Leverage existing `multiSourceKnowledge` caching for performance

### Missing Components for Epic 6.4.3

1. **Socratic Question Engine**: No existing adaptive questioning beyond basic CopilotKit actions
2. **Progressive Disclosure Logic**: No expertise level progression system
3. **Question UI Components**: Need `AdaptiveQuestionPanel` and response handling
4. **Question-specific CopilotKit Actions**: Need questioning-focused actions beyond current 3

## Integration Points and External Dependencies

### External Services

| Service  | Purpose  | Integration Type | Key Files                      | Status |
| -------- | -------- | ---------------- | ------------------------------ | ------ |
| OpenAI GPT-5 | AI Engine | CopilotKit SDK | `CopilotProvider.tsx` | ✅ Operational |
| Microsoft Docs MCP | Enterprise Knowledge | MCP Server | `mcpManager.ts`, `mcp-servers.json` | ✅ Operational |
| CopilotKit MCP | Development Patterns | MCP Server | `mcpManager.ts`, `mcp-servers.json` | ✅ Operational |
| Tavily Search | Web Search | REST API | `searchManager.ts` | ✅ Operational |
| DuckDuckGo | Web Search Fallback | REST API | `searchManager.ts` | ✅ Operational |

### Internal Integration Points

**Domain Detection Integration** (Epic 6.4.1 ↔ Epic 6.4.3):
- `DomainExpertiseProvider` context provides current domain state
- `domainDetectionSystem.getActiveDomainContext()` for current domain
- `multiSourceKnowledge.queryMultipleSources()` for question enrichment
- Domain confidence scores (`context.confidence`) should inform question complexity

**CopilotKit Action Integration**:
- Existing pattern: 3 actions with specific parameter structures
- Must follow `useCopilotAction` hook pattern for consistency
- Action naming convention: `verb_noun` (e.g., `analyze_workflow_requirements`)
- Response streaming support required for real-time questioning

**React Component Integration**:
- Domain components in `app/src/components/domain/` follow established patterns
- Auto-detection hooks pattern from `DomainExpertiseProvider.tsx` (debounced analysis)
- UI integration via demo pattern at `/demo/domain-intelligence`

## Development and Deployment

### Local Development Setup

**ACTUAL working setup** (from project structure):

1. **Navigate to app directory**: `cd langflow-architect/app`
2. **Install dependencies**: `npm install` (uses package-lock.json)
3. **Environment setup**: Copy `.env.example` to `.env.local` and configure:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. **Start development**: `npm run dev` (uses Turbopack for fast builds)
5. **Access application**: http://localhost:3000
6. **Demo domain detection**: http://localhost:3000/demo/domain-intelligence

### Build and Deployment Process

- **Development**: `npm run dev` (Turbopack-enabled)
- **Build**: `npm run build` (Next.js production build)  
- **Test Suite**: `npm run test` (Jest), `npm run test:e2e` (Playwright)
- **Linting**: `npm run lint` (ESLint with Next.js config)
- **Deployment**: Vercel platform (Next.js optimized)

### Known Development Issues

- **MCP Server Connectivity**: Local development may have MCP server timeout issues - graceful degradation implemented
- **Search API Limits**: Tavily and DuckDuckGo have rate limits - caching mitigates this
- **TypeScript Strictness**: A- grade quality standard maintained - Epic 6.4.3 must maintain this

## Testing Reality

### Current Test Coverage

**Jest Tests**: 
- Component tests in `__tests__/components/`
- API route tests in `__tests__/api/`
- Utility function tests in `__tests__/utils/`
- Domain detection system tests present

**Playwright E2E Tests**:
- Basic navigation and interaction tests
- CopilotKit integration tests
- Domain intelligence demo tests

**Test Commands**:
```bash
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e      # Playwright tests
npm run test:all      # All tests
```

**Testing Patterns for Epic 6.4.3**:
- Follow existing test structure in `__tests__/`
- Domain detection integration tests already established
- CopilotKit action tests need extension for questioning actions
- Component tests required for new questioning UI components

## Epic 6.4.3 Impact Analysis - Based on Story Requirements

### Files That Will Need Modification

**Based on Epic 6.4.3 story requirements**:

1. **`app/src/lib/enhanced/domainDetectionSystem.ts`** - Extend with questioning integration
   - Add questioning triggers based on domain confidence
   - Integrate with new question generation engine
   - Maintain existing 92% accuracy and <3s response time

2. **`app/src/components/domain/DomainExpertiseProvider.tsx`** - Add questioning state
   - Extend context with questioning state management
   - Add progressive questioning session tracking
   - Maintain backward compatibility with existing usage

3. **`app/src/app/api/copilotkit/route.ts`** - Add questioning actions
   - New actions: `generate_adaptive_questions`, `track_expertise_progression`
   - Maintain existing 3-action pattern for consistency
   - Follow established parameter and response structures

4. **`app/src/app/page.tsx`** - Integrate questioning UI
   - Add questioning components to existing workflow
   - Integrate with existing CopilotKit actions
   - Maintain existing workflow analysis functionality

### New Files/Modules Needed

**Based on Epic 6.4.3 architecture notes**:

```text
app/src/lib/enhanced/
├── socraticQuestionEngine.ts     # Core questioning logic
├── expertiseTracking.ts          # User expertise level detection  
└── progressiveDisclosure.ts      # Question complexity management

app/src/components/domain/
├── AdaptiveQuestionPanel.tsx     # UI component for questions
├── QuestionResponseHandler.tsx   # User interaction handling
└── QuestionProgressIndicator.tsx # Progress and feedback UI

app/src/lib/copilotkit/
└── questioningActions.ts         # CopilotKit integration
```

### Integration Considerations

**Performance Requirements**:
- Must maintain existing domain detection <3s response time (currently 2.1s)
- Questioning should not degrade existing 92% domain detection accuracy
- Leverage existing `multiSourceKnowledge` caching for question generation

**Compatibility Requirements**:
- All 11 existing CopilotKit actions must remain functional
- Domain detection demo at `/demo/domain-intelligence` must continue working
- Existing `DomainExpertiseProvider` usage patterns must remain compatible

**Architecture Requirements**:
- Use composition pattern to extend domain detection, not modification
- Follow established CopilotKit action patterns (`useCopilotAction` hook)
- Maintain TypeScript A- grade quality standards
- Implement feature flags for safe rollout

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
# Development
npm run dev              # Start development server (Turbopack)
npm run build            # Production build
npm run start            # Start production server

# Testing
npm test                 # Run Jest tests
npm run test:e2e         # Run Playwright tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # ESLint checking
npm run lint:fix         # Auto-fix ESLint issues

# Epic 6.4.3 Specific
cd app && npm run dev    # Start for Epic 6.4.3 development
# Demo: http://localhost:3000/demo/domain-intelligence
```

### Debugging and Troubleshooting

**Domain Detection System**:
- **Debug Mode**: Set `DEBUG=domain:*` for verbose domain detection logging
- **Demo Interface**: Use `/demo/domain-intelligence` for testing domain detection
- **Cache Issues**: Clear browser cache if domain switching seems stuck

**CopilotKit Integration**:
- **API Logs**: Check browser network tab for `/api/copilotkit` requests
- **Action Debugging**: Use React DevTools to inspect CopilotKit provider state
- **Streaming Issues**: Verify WebSocket connections in browser dev tools

**MCP Server Issues**:
- **Connection Logs**: Check console for MCP server connection status
- **Fallback Mode**: System continues with conversation analysis if MCP fails
- **Configuration**: Verify `config/mcp-servers.json` settings

### Epic 6.4.3 Development Notes

**Safe Integration Pattern**:
1. Extend `DomainExpertiseProvider` with questioning state (don't replace)
2. Create new questioning modules in `lib/enhanced/` (don't modify existing)
3. Add new CopilotKit actions (don't modify existing 3 actions)
4. Use feature flags for safe rollout and easy rollback

**Performance Monitoring**:
- Monitor domain detection response time during questioning integration
- Track question generation performance separately from domain detection
- Ensure total response time (domain + questioning) stays <3s

**Quality Assurance**:
- Maintain TypeScript A- grade standards for all new code
- Add comprehensive tests for new questioning components
- Verify existing functionality with regression tests
- Document all new questioning patterns for future maintenance

---

**Document Status**: ✅ Ready for Epic 6.4.3 implementation
**Next Phase**: Use this architecture context for PRD creation and implementation planning
**BMad Workflow**: Proceed to PRD creation using brownfield-prd-tmpl template
