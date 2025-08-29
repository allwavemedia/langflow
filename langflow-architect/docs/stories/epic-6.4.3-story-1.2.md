# Story 1.2: Adaptive Question Generation Engine

<!-- Source: Brownfield PRD + Architecture Document -->
<!-- Context: Build upon Story 1.1 foundation to implement dynamic question generation -->

## Status: Ready for Implementation

## Story

As a **Langflow workflow designer**,  
I want **dynamic question generation based on my detected domain and current conversation context**,  
so that **I receive relevant questions that help me discover optimal patterns without hardcoded limitations**.

## Context Source

- **Source Document**: Brownfield PRD (docs/brownfield-prd-epic-6.4.3.md) + Architecture Document (docs/brownfield-architecture.md)
- **Enhancement Type**: Core questioning engine implementation building on Story 1.1 foundation
- **Existing System Impact**: Leverages existing domain detection and knowledge systems without modification
- **Dependencies**: Story 1.1 (System Discovery and Safe Integration Foundation) must be complete

## Acceptance Criteria

### Primary Objectives

1. **Dynamic Generation**: Questions generated based on domain context from existing `domainDetectionSystem.getActiveDomainContext()` without hardcoded domain patterns

2. **Knowledge Integration**: Question enrichment using existing `multiSourceKnowledge.queryMultipleSources()` for current best practices and patterns

3. **Context Awareness**: Questions reference conversation history, detected domain confidence, and current workflow state

4. **Zero Hardcoding**: No domain-specific questioning logic hardcoded - all questions derived from dynamic domain knowledge

### Integration Verification Criteria

**IV1**: **Domain Detection Preservation**

- Existing domain detection accuracy remains >90% (currently 92%) with question generation active
- Domain detection APIs continue to return identical responses 
- No interference with existing domain switching functionality

**IV2**: **Knowledge System Compatibility**

- Multi-source knowledge queries for question generation don't interfere with existing domain detection queries
- Existing knowledge caching system performance preserved
- MCP server connections remain stable during question generation

**IV3**: **Performance Maintenance**

- Question generation completes within 500ms additional latency beyond current domain detection timing
- Combined domain detection + question generation stays under 3s requirement
- Memory usage increase <10% from baseline with question generation active

## Dev Technical Guidance

### Existing System Context

**Foundation from Story 1.1**:

- Enhanced directory structure in `app/src/lib/enhanced/questioning/`
- Core TypeScript interfaces (`SocraticQuestioningContext`, `AdaptiveQuestion`, etc.)
- Extended `DomainExpertiseProvider` with composition pattern
- Feature flags for safe activation/deactivation

**Integration Points** (from brownfield-architecture.md):

- **Domain Detection**: `domainDetectionSystem.getActiveDomainContext()` for current domain state
- **Knowledge System**: `multiSourceKnowledge.queryMultipleSources()` for question enrichment
- **Context Provider**: Extended `DomainExpertiseProvider` for questioning state management
- **Performance Baseline**: Must maintain 2.1s average response time

### Implementation Approach

**Question Generation Architecture**:

```typescript
// Core question generation engine
interface QuestionGenerationEngine {
  generateAdaptiveQuestion(
    domainContext: DomainContext,
    conversationHistory: QuestionSession[],
    expertiseLevel: ExpertiseLevel
  ): Promise<AdaptiveQuestion>;
  
  enrichQuestionWithKnowledge(
    baseQuestion: string,
    domainContext: string
  ): Promise<EnrichedQuestion>;
  
  validateQuestionRelevance(
    question: AdaptiveQuestion,
    currentContext: DomainContext
  ): boolean;
}
```

**Integration with Existing Systems**:

```typescript
// Leverage existing domain detection without modification
const currentDomain = await domainDetectionSystem.getActiveDomainContext();

// Use existing knowledge system for question enrichment
const contextualKnowledge = await multiSourceKnowledge.queryMultipleSources({
  query: `${currentDomain} best practices and common patterns`,
  includeWebSearch: true,
  includeMCPServers: true
});
```

**File Structure for Story 1.2**:

```
app/src/lib/enhanced/questioning/
├── questionGenerator.ts         # Core question generation logic
├── questioningEngine.ts         # Main engine coordinating generation
├── contextualEnrichment.ts      # Knowledge integration for questions
└── questionValidation.ts        # Question relevance and quality checks

app/src/lib/enhanced/hooks/
├── useQuestionGeneration.ts     # React hook for question generation
└── useContextualQuestions.ts    # Hook for context-aware questioning
```

### Technical Constraints

**Hard Constraints from Story 1.1**:

- **Zero Modification**: No changes to existing `domainDetectionSystem.ts` or `multiSourceKnowledge.ts`
- **Performance Requirement**: Question generation must complete within 500ms additional latency
- **Feature Flag Control**: All functionality must be controllable via `NEXT_PUBLIC_ENABLE_SOCRATIC_QUESTIONING`
- **Composition Pattern**: Use only the enhanced context established in Story 1.1

**Question Generation Constraints**:

- **No Hardcoded Domains**: All questions must be dynamically generated from domain context
- **Knowledge Integration**: Must reuse existing MCP servers and search API connections
- **Graceful Degradation**: Must work with conversation context when external services unavailable
- **Caching Compatibility**: Must leverage existing `multiSourceKnowledge` caching without interference

### Implementation Dependencies

**Required from Story 1.1**:

- Enhanced `DomainExpertiseProvider` with questioning state management
- Core TypeScript interfaces (`AdaptiveQuestion`, `SocraticQuestioningContext`, etc.)
- Feature flag infrastructure for safe activation
- Performance monitoring utilities established

**External Dependencies** (existing systems):

- Domain detection system for current domain context
- Multi-source knowledge system for question enrichment
- OpenAI GPT-5 API for question generation (existing connection)
- MCP servers for domain-specific knowledge (existing connections)

## Tasks / Subtasks

### Task 1: Core Question Generation Engine

- [ ] **Implement QuestionGenerator**
  - [ ] Create `app/src/lib/enhanced/questioning/questionGenerator.ts`
  - [ ] Implement dynamic question generation based on domain context
  - [ ] Integrate with existing OpenAI GPT-5 API connection
  - [ ] Add sophistication level control (1-5 scale)

- [ ] **Build Contextual Enrichment System**
  - [ ] Create `app/src/lib/enhanced/questioning/contextualEnrichment.ts`
  - [ ] Integrate with existing `multiSourceKnowledge.queryMultipleSources()`
  - [ ] Implement question enrichment with domain-specific knowledge
  - [ ] Add fallback questioning when external services unavailable

### Task 2: Domain Integration and Context Awareness

- [ ] **Integrate with Domain Detection System**
  - [ ] Access current domain context via `domainDetectionSystem.getActiveDomainContext()`
  - [ ] Generate questions relevant to detected domain without hardcoding
  - [ ] Maintain domain detection performance and accuracy
  - [ ] Add domain confidence consideration in question generation

- [ ] **Implement Conversation Context Integration**
  - [ ] Track conversation history in questioning state
  - [ ] Reference previous questions and responses in new question generation
  - [ ] Implement context window management for performance
  - [ ] Add conversation thread awareness

### Task 3: Question Engine Coordination

- [ ] **Build Main Questioning Engine**
  - [ ] Create `app/src/lib/enhanced/questioning/questioningEngine.ts`
  - [ ] Coordinate question generation, enrichment, and validation
  - [ ] Implement performance optimization with caching
  - [ ] Add error handling and graceful degradation

- [ ] **Implement Question Validation**
  - [ ] Create `app/src/lib/enhanced/questioning/questionValidation.ts`
  - [ ] Validate question relevance to current domain context
  - [ ] Check question quality and appropriateness
  - [ ] Implement filtering for inappropriate or irrelevant questions

### Task 4: React Integration and Hooks

- [ ] **Create Question Generation Hook**
  - [ ] Implement `app/src/lib/enhanced/hooks/useQuestionGeneration.ts`
  - [ ] Integrate with enhanced `DomainExpertiseProvider` context
  - [ ] Add loading states and error handling
  - [ ] Implement performance monitoring for hook usage

- [ ] **Build Contextual Questions Hook**
  - [ ] Create `app/src/lib/enhanced/hooks/useContextualQuestions.ts`
  - [ ] Provide React components with contextual question access
  - [ ] Implement automatic question regeneration on domain changes
  - [ ] Add hook-level caching for performance optimization

### Task 5: Performance Optimization and Testing

- [ ] **Implement Performance Optimization**
  - [ ] Add question generation caching to prevent redundant API calls
  - [ ] Implement lazy loading for question generation modules
  - [ ] Optimize knowledge integration to reuse existing cache
  - [ ] Add performance monitoring specific to question generation

- [ ] **Integration Testing and Verification**
  - [ ] Test question generation with all existing domain types
  - [ ] Verify existing domain detection accuracy maintained (>90%)
  - [ ] Validate performance requirements (<500ms additional latency)
  - [ ] Test graceful degradation when external services unavailable

## Risk Assessment

### Implementation Risks

**Primary Risk**: Question generation interfering with existing domain detection performance  
**Mitigation**: Separate question generation into async processes, use existing knowledge cache  
**Verification**: Continuous performance monitoring during development with automated alerts

**Secondary Risk**: API rate limiting affecting both domain detection and question generation  
**Mitigation**: Implement intelligent request batching, prioritize domain detection requests  
**Verification**: Load testing with concurrent domain detection and question generation

**Knowledge Integration Risk**: Question enrichment queries overwhelming existing MCP servers  
**Mitigation**: Implement request throttling, reuse existing knowledge cache when possible  
**Verification**: Monitor MCP server response times and success rates

### Rollback Plan

**Immediate Rollback**:

1. Set `NEXT_PUBLIC_ENABLE_SOCRATIC_QUESTIONING=false` to disable all question generation
2. Enhanced context gracefully degrades to domain detection only
3. All existing functionality continues without question generation

**Partial Rollback**:

1. Disable specific question generation features via granular feature flags
2. Fall back to conversation-based questioning without external knowledge integration
3. Maintain basic questioning while addressing performance issues

### Safety Checks

- [ ] Question generation can be completely disabled without affecting domain detection
- [ ] Existing `multiSourceKnowledge` caching performance maintained
- [ ] Domain detection accuracy verified before and after question generation implementation
- [ ] Performance thresholds monitored with automatic fallback to conversation-only mode

## Story Output

**File Location**: `docs/stories/epic-6.4.3-story-1.2.md`  
**Dependencies**: Story 1.1 (System Discovery and Safe Integration Foundation) COMPLETE  
**Integration Readiness**: Builds upon Story 1.1 foundation, prepares for Story 1.3 (Progressive Disclosure)  
**Performance Impact**: <500ms additional latency, <10% memory increase

---

## Success Criteria

This brownfield story is successful when:

1. **Dynamic Question Generation Active**: Questions generated based on current domain context without hardcoded patterns
2. **Knowledge Integration Working**: Questions enriched using existing `multiSourceKnowledge` system without performance degradation
3. **Performance Requirements Met**: Question generation completes within 500ms additional latency beyond domain detection
4. **Domain Detection Preserved**: Existing 92% accuracy maintained with question generation active
5. **Graceful Degradation Verified**: System works with conversation context when external services unavailable

**Next Story**: With Story 1.2 complete, Story 1.3 (Progressive Disclosure and Expertise Tracking) can build sophisticated user adaptation on this question generation foundation.
