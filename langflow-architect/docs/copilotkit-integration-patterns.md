# CopilotKit Integration Patterns

## Overview

This document defines standardized patterns for integrating CopilotKit functionality across the Langflow Architect project, ensuring consistent implementation of AI-powered features in Epic 5 and Epic 6.4.

## Core Integration Architecture

### CopilotKit Provider Setup

**Location**: `src/lib/copilotkit/providers/CopilotKitProvider.tsx`

```typescript
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";

export function LangflowCopilotProvider({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit 
      runtimeUrl="/api/copilotkit"
      agent="langflow-architect"
    >
      <CopilotSidebar>
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}
```

## Action Patterns

### 1. Epic 5 Foundation Actions

#### Context Understanding Action
**File**: `src/lib/copilotkit/actions/contextAnalysisAction.ts`

```typescript
import { CopilotAction } from "@copilotkit/react-core";

export const contextAnalysisAction: CopilotAction = {
  name: "analyze_conversation_context",
  description: "Analyze conversation context to understand domain, technology stack, and user expertise",
  parameters: {
    conversation: {
      type: "string",
      description: "Current conversation content"
    },
    previous_context: {
      type: "object", 
      description: "Previously established context",
      optional: true
    }
  },
  handler: async ({ conversation, previous_context }) => {
    const contextEngine = new ContextEngine();
    const analysis = await contextEngine.analyzeContext({
      conversation,
      previousContext: previous_context
    });
    
    return {
      domain: analysis.domain,
      expertise_level: analysis.expertiseLevel,
      technology_stack: analysis.technologyStack,
      confidence: analysis.confidence
    };
  }
};
```

#### MCP Server Management Action
**File**: `src/lib/copilotkit/actions/mcpManagementAction.ts`

```typescript
export const mcpManagementAction: CopilotAction = {
  name: "manage_mcp_servers",
  description: "Dynamically manage MCP server connections based on context",
  parameters: {
    domain: {
      type: "string",
      description: "Detected domain requiring specific MCP servers"
    },
    required_capabilities: {
      type: "array",
      items: { type: "string" },
      description: "List of required capabilities"
    }
  },
  handler: async ({ domain, required_capabilities }) => {
    const mcpManager = new MCPManager();
    const servers = await mcpManager.activateServersForDomain(domain, required_capabilities);
    
    return {
      activated_servers: servers.map(s => s.name),
      available_tools: servers.flatMap(s => s.tools),
      status: "activated"
    };
  }
};
```

### 2. Epic 6.4 Domain Expertise Actions

#### Domain Detection Action
**File**: `src/lib/copilotkit/actions/domainDetectionAction.ts`

```typescript
export const domainDetectionAction: CopilotAction = {
  name: "detect_domain_expertise",
  description: "Automatically detect user's domain and activate appropriate expertise",
  parameters: {
    user_input: {
      type: "string",
      description: "User's input to analyze for domain indicators"
    },
    conversation_history: {
      type: "array",
      items: { type: "object" },
      description: "Previous conversation messages for context"
    }
  },
  handler: async ({ user_input, conversation_history }) => {
    const domainEngine = new DomainExpertiseEngine();
    const detection = await domainEngine.detectDomain({
      currentInput: user_input,
      history: conversation_history
    });
    
    // Activate domain-specific knowledge
    await domainEngine.activateDomainExpertise(detection.domain);
    
    return {
      detected_domain: detection.domain,
      confidence: detection.confidence,
      activated_expertise: detection.expertiseAreas,
      compliance_requirements: detection.complianceRequirements
    };
  }
};
```

#### Compliance Intelligence Action
**File**: `src/lib/copilotkit/actions/complianceIntelligenceAction.ts`

```typescript
export const complianceIntelligenceAction: CopilotAction = {
  name: "validate_compliance",
  description: "Validate workflow against regulatory requirements",
  parameters: {
    workflow_config: {
      type: "object",
      description: "Current workflow configuration"
    },
    domain: {
      type: "string",
      description: "Industry domain (healthcare, finance, etc.)"
    },
    regulations: {
      type: "array",
      items: { type: "string" },
      description: "Applicable regulations (HIPAA, GDPR, SOX, etc.)"
    }
  },
  handler: async ({ workflow_config, domain, regulations }) => {
    const complianceEngine = new ComplianceIntelligenceEngine();
    const validation = await complianceEngine.validateCompliance({
      workflow: workflow_config,
      domain,
      regulations
    });
    
    return {
      compliance_status: validation.status,
      violations: validation.violations,
      recommendations: validation.recommendations,
      required_modifications: validation.requiredModifications
    };
  }
};
```

#### Adaptive Questioning Action  
**File**: `src/lib/copilotkit/actions/adaptiveQuestioningAction.ts`

```typescript
export const adaptiveQuestioningAction: CopilotAction = {
  name: "generate_adaptive_questions",
  description: "Generate contextually appropriate questions based on user expertise and domain",
  parameters: {
    current_context: {
      type: "object",
      description: "Current conversation and domain context"
    },
    user_expertise: {
      type: "string",
      enum: ["beginner", "intermediate", "expert"],
      description: "User's detected expertise level"
    },
    domain: {
      type: "string",
      description: "Detected domain for specialized questioning"
    }
  },
  handler: async ({ current_context, user_expertise, domain }) => {
    const questioningEngine = new AdaptiveSocraticEngine();
    const questions = await questioningEngine.generateQuestions({
      context: current_context,
      expertise: user_expertise,
      domain,
      progressiveDisclosure: true
    });
    
    return {
      questions: questions.map(q => ({
        question: q.text,
        rationale: q.rationale,
        expertise_level: q.targetLevel,
        follow_up_options: q.followUpOptions
      })),
      conversation_flow: questions.flowStrategy,
      next_focus_areas: questions.nextFocusAreas
    };
  }
};
```

## Hook Patterns

### 1. Context Management Hooks

#### Domain Context Hook
**File**: `src/lib/copilotkit/hooks/useDomainContext.ts`

```typescript
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useState, useEffect } from "react";

export function useDomainContext() {
  const [domainContext, setDomainContext] = useState<DomainContext | null>(null);
  
  // Make domain context readable by CopilotKit
  useCopilotReadable({
    description: "Current domain context and expertise level",
    value: domainContext
  });

  // Action for updating domain context
  useCopilotAction({
    name: "update_domain_context",
    description: "Update the current domain context",
    parameters: {
      domain: { type: "string" },
      expertise_level: { type: "string" },
      compliance_requirements: { type: "array", items: { type: "string" } }
    },
    handler: async ({ domain, expertise_level, compliance_requirements }) => {
      const newContext = {
        domain,
        expertiseLevel: expertise_level,
        complianceRequirements: compliance_requirements,
        timestamp: new Date().toISOString()
      };
      setDomainContext(newContext);
      return newContext;
    }
  });

  return {
    domainContext,
    updateDomainContext: setDomainContext,
    isReady: domainContext !== null
  };
}
```

#### Enhanced Search Hook
**File**: `src/lib/copilotkit/hooks/useEnhancedSearch.ts`

```typescript
export function useEnhancedSearch() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { domainContext } = useDomainContext();

  useCopilotAction({
    name: "search_langflow_documentation",
    description: "Search Langflow documentation with domain-aware filtering",
    parameters: {
      query: { type: "string" },
      domain_filter: { type: "string", optional: true },
      result_limit: { type: "number", optional: true, default: 10 }
    },
    handler: async ({ query, domain_filter, result_limit = 10 }) => {
      const searchEngine = new EnhancedSearchEngine();
      const results = await searchEngine.search({
        query,
        domainFilter: domain_filter || domainContext?.domain,
        limit: result_limit,
        includeCompliance: true
      });
      
      setSearchResults(results);
      return results.map(r => ({
        title: r.title,
        content: r.content,
        relevance: r.relevance,
        domain_relevance: r.domainRelevance,
        compliance_notes: r.complianceNotes
      }));
    }
  });

  return {
    searchResults,
    search: (query: string) => {
      // Trigger search through CopilotKit action
    }
  };
}
```

### 2. Workflow Enhancement Hooks

#### Workflow Analysis Hook
**File**: `src/lib/copilotkit/hooks/useWorkflowAnalysis.ts`

```typescript
export function useWorkflowAnalysis() {
  const [analysis, setAnalysis] = useState<WorkflowAnalysis | null>(null);
  
  useCopilotAction({
    name: "enhanced_workflow_analysis",
    description: "Analyze workflow with domain expertise and compliance validation",
    parameters: {
      workflow_json: { type: "object" },
      target_domain: { type: "string", optional: true },
      compliance_check: { type: "boolean", default: true }
    },
    handler: async ({ workflow_json, target_domain, compliance_check }) => {
      const analyzer = new WorkflowAnalysisEngine();
      const result = await analyzer.analyzeWorkflow({
        workflow: workflow_json,
        domain: target_domain,
        includeCompliance: compliance_check,
        expertiseLevel: "adaptive"
      });
      
      setAnalysis(result);
      return {
        optimization_suggestions: result.optimizations,
        compliance_status: result.compliance,
        domain_specific_recommendations: result.domainRecommendations,
        risk_assessment: result.risks
      };
    }
  });

  return {
    analysis,
    analyzeWorkflow: (workflow: any) => {
      // Trigger analysis through CopilotKit action
    }
  };
}
```

## Provider Integration Patterns

### App-Level Provider Setup
**File**: `src/app/layout.tsx`

```typescript
import { LangflowCopilotProvider } from "@/lib/copilotkit/providers/CopilotKitProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LangflowCopilotProvider>
          {children}
        </LangflowCopilotProvider>
      </body>
    </html>
  );
}
```

### Component-Level Integration
**File**: `src/components/features/domain-detection/DomainDetector.tsx`

```typescript
import { useDomainContext } from "@/lib/copilotkit/hooks/useDomainContext";
import { useCopilotAction } from "@copilotkit/react-core";

export function DomainDetector() {
  const { domainContext, isReady } = useDomainContext();

  useCopilotAction({
    name: "display_domain_detection",
    description: "Show current domain detection status to user",
    parameters: {},
    handler: async () => {
      return {
        current_domain: domainContext?.domain || "none",
        detection_confidence: domainContext?.confidence || 0,
        active_expertise: domainContext?.expertiseAreas || []
      };
    }
  });

  return (
    <div className="domain-detector">
      {isReady && (
        <div>
          <h3>Detected Domain: {domainContext.domain}</h3>
          <p>Confidence: {domainContext.confidence}%</p>
        </div>
      )}
    </div>
  );
}
```

## API Route Patterns

### CopilotKit Runtime API
**File**: `src/app/api/copilotkit/route.ts`

```typescript
import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";
import { NextRequest } from "next/server";

// Import all actions
import { contextAnalysisAction } from "@/lib/copilotkit/actions/contextAnalysisAction";
import { domainDetectionAction } from "@/lib/copilotkit/actions/domainDetectionAction";
import { complianceIntelligenceAction } from "@/lib/copilotkit/actions/complianceIntelligenceAction";
import { adaptiveQuestioningAction } from "@/lib/copilotkit/actions/adaptiveQuestioningAction";

const copilotKit = new CopilotRuntime({
  actions: [
    contextAnalysisAction,
    domainDetectionAction, 
    complianceIntelligenceAction,
    adaptiveQuestioningAction
  ]
});

export async function POST(req: NextRequest) {
  const { handleRequest } = copilotKit;
  return handleRequest(req, new OpenAIAdapter());
}
```

## Error Handling Patterns

### Action Error Handling
```typescript
export const safeActionWrapper = (action: CopilotAction): CopilotAction => ({
  ...action,
  handler: async (params) => {
    try {
      return await action.handler(params);
    } catch (error) {
      console.error(`Error in action ${action.name}:`, error);
      return {
        error: true,
        message: "An error occurred while processing your request",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      };
    }
  }
});
```

### Hook Error Handling
```typescript
export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  
  const handleError = useCallback((error: Error, context: string) => {
    console.error(`Error in ${context}:`, error);
    setError(`Error in ${context}: ${error.message}`);
    
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);
  
  return { error, handleError, clearError: () => setError(null) };
}
```

## Testing Patterns

### Action Testing
**File**: `src/lib/copilotkit/actions/__tests__/domainDetectionAction.test.ts`

```typescript
import { domainDetectionAction } from "../domainDetectionAction";

describe("Domain Detection Action", () => {
  test("detects healthcare domain correctly", async () => {
    const result = await domainDetectionAction.handler({
      user_input: "I need to create a HIPAA-compliant patient data workflow",
      conversation_history: []
    });
    
    expect(result.detected_domain).toBe("healthcare");
    expect(result.compliance_requirements).toContain("HIPAA");
  });
});
```

### Hook Testing
**File**: `src/lib/copilotkit/hooks/__tests__/useDomainContext.test.tsx`

```typescript
import { renderHook } from "@testing-library/react";
import { useDomainContext } from "../useDomainContext";

describe("useDomainContext", () => {
  test("provides domain context management", () => {
    const { result } = renderHook(() => useDomainContext());
    
    expect(result.current.domainContext).toBeNull();
    expect(result.current.isReady).toBe(false);
  });
});
```

## Performance Optimization

### Lazy Loading Actions
```typescript
// Dynamically import actions based on domain
const loadDomainActions = async (domain: string) => {
  switch (domain) {
    case "healthcare":
      return import("@/lib/copilotkit/actions/healthcare");
    case "finance":
      return import("@/lib/copilotkit/actions/finance");
    default:
      return import("@/lib/copilotkit/actions/general");
  }
};
```

### Action Caching
```typescript
const actionCache = new Map<string, any>();

export const cachedAction = (cacheKey: string, action: CopilotAction): CopilotAction => ({
  ...action,
  handler: async (params) => {
    const key = `${cacheKey}_${JSON.stringify(params)}`;
    
    if (actionCache.has(key)) {
      return actionCache.get(key);
    }
    
    const result = await action.handler(params);
    actionCache.set(key, result);
    return result;
  }
});
```

## Security Considerations

### Input Validation
```typescript
import { z } from "zod";

const domainDetectionSchema = z.object({
  user_input: z.string().max(10000),
  conversation_history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).max(100)
});

export const secureAction = (schema: z.ZodSchema, action: CopilotAction): CopilotAction => ({
  ...action,
  handler: async (params) => {
    const validated = schema.parse(params);
    return action.handler(validated);
  }
});
```

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-08-27 | 1.0 | Initial CopilotKit integration patterns | Development Team |