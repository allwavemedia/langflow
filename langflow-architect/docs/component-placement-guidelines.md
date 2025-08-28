# Component Placement Guidelines

## Overview

This document provides standardized guidelines for component placement and directory structure conventions across the Langflow Architect project, ensuring consistency and maintainability.

## Directory Structure Conventions

### Core Application Structure
```
langflow-architect/
├── app/                           # Next.js application root
│   ├── src/
│   │   ├── lib/                  # Core library functions
│   │   │   ├── enhanced/         # Enhanced intelligence features
│   │   │   │   ├── contextEngine.ts      # Epic 5 - Context understanding
│   │   │   │   ├── mcpManager.ts         # Epic 5 - MCP server management
│   │   │   │   ├── searchIntegration.ts  # Epic 5 - Web search capabilities
│   │   │   │   └── domainExpertise.ts    # Epic 6.4 - Domain expertise
│   │   │   ├── copilotkit/       # CopilotKit integration patterns
│   │   │   │   ├── actions/      # CopilotKit actions
│   │   │   │   ├── hooks/        # CopilotKit React hooks
│   │   │   │   └── providers/    # CopilotKit providers
│   │   │   └── utils/            # Utility functions
│   │   ├── components/           # React components
│   │   │   ├── ui/              # Base UI components
│   │   │   ├── features/        # Feature-specific components
│   │   │   │   ├── domain-detection/    # Epic 6.4 components
│   │   │   │   ├── compliance/          # Epic 6.4 compliance components
│   │   │   │   └── socratic/           # Epic 6.4 questioning components
│   │   │   └── layout/          # Layout components
│   │   ├── app/                 # Next.js App Router pages
│   │   └── types/               # TypeScript type definitions
│   ├── public/                  # Static assets
│   └── config/                  # Configuration files
└── docs/                        # Documentation
    ├── architecture/            # Architecture documents
    ├── stories/                 # Epic and story documentation
    ├── qa/                     # Quality assurance reports
    └── plans/                  # Project plans
```

## Component Placement Rules

### 1. Enhanced Intelligence Components (Epic 5/6.4)

**Location**: `src/lib/enhanced/`

**Naming Convention**: 
- Use camelCase for file names
- Include feature scope in name (e.g., `domainExpertise.ts`, `contextEngine.ts`)
- Add `.types.ts` suffix for type definition files

**Examples**:
```typescript
// src/lib/enhanced/domainExpertise.ts
export class DomainExpertiseEngine {
  // Domain detection and expertise activation
}

// src/lib/enhanced/domainExpertise.types.ts
export interface DomainContext {
  domain: string;
  confidence: number;
  expertise: ExpertiseLevel;
}
```

### 2. CopilotKit Integration Components

**Location**: `src/lib/copilotkit/`

**Structure**:
- `actions/` - CopilotKit actions for specific features
- `hooks/` - React hooks for CopilotKit integration
- `providers/` - Context providers and wrappers

**Naming Convention**:
```typescript
// src/lib/copilotkit/actions/domainDetectionAction.ts
export const domainDetectionAction = {
  name: "detect_domain",
  description: "Detect user's domain expertise requirements",
  // ...
};

// src/lib/copilotkit/hooks/useDomainExpertise.ts
export function useDomainExpertise() {
  // Hook implementation
}
```

### 3. React Components

**Location**: `src/components/features/{feature-name}/`

**Organization**:
- Group by feature/epic
- Include index.ts for clean exports
- Co-locate types, styles, and tests

**Example Structure**:
```
src/components/features/domain-detection/
├── index.ts                    # Export barrel
├── DomainDetector.tsx         # Main component
├── DomainIndicator.tsx        # Sub-component
├── DomainDetector.types.ts    # Component types
├── DomainDetector.test.tsx    # Tests
└── DomainDetector.module.css  # Styles (if needed)
```

### 4. Type Definitions

**Location**: `src/types/`

**Organization**:
- Feature-specific type files
- Global types in `index.ts`
- Domain-specific types in subdirectories

**Examples**:
```typescript
// src/types/domain.ts
export interface DomainExpertise {
  domain: string;
  level: ExpertiseLevel;
  compliance: ComplianceRequirement[];
}

// src/types/epic6.ts
export * from './domain';
export * from './compliance';
export * from './socratic';
```

## Integration Patterns

### Epic 6.4 Specific Patterns

#### 1. Domain Detection Integration
```typescript
// Pattern: Context engine integration with domain detection
// Location: src/lib/enhanced/domainExpertise.ts

import { ContextEngine } from './contextEngine';

export class DomainExpertiseEngine {
  constructor(private contextEngine: ContextEngine) {}
  
  async detectDomain(conversation: ConversationContext): Promise<DomainContext> {
    // Leverage Epic 5 context understanding
    const context = await this.contextEngine.analyzeContext(conversation);
    return this.extractDomainExpertise(context);
  }
}
```

#### 2. CopilotKit Action Integration
```typescript
// Pattern: Domain-aware CopilotKit actions
// Location: src/lib/copilotkit/actions/

export const domainExpertiseAction = {
  name: "activate_domain_expertise",
  description: "Activate domain-specific expertise and compliance guidance",
  parameters: {
    domain: "string",
    compliance_requirements: "string[]",
    expertise_level: "beginner | intermediate | expert"
  }
};
```

## File Naming Conventions

### TypeScript Files
- **Components**: PascalCase (e.g., `DomainDetector.tsx`)
- **Utilities**: camelCase (e.g., `domainUtils.ts`)
- **Types**: camelCase with `.types.ts` suffix
- **Tests**: Match component name with `.test.tsx` or `.spec.ts`

### Documentation Files
- **Stories**: `epic-{number}-{description}.md`
- **Architecture**: `{feature}-architecture.md`
- **Guidelines**: `{topic}-guidelines.md`

## Quality Standards

### Import Organization
```typescript
// 1. Node modules
import React from 'react';
import { NextRequest } from 'next/server';

// 2. Internal lib imports
import { ContextEngine } from '@/lib/enhanced/contextEngine';
import { DomainExpertise } from '@/types/domain';

// 3. Component imports
import { DomainIndicator } from '@/components/features/domain-detection';

// 4. Relative imports
import './Component.css';
```

### Export Patterns
```typescript
// Prefer named exports
export { DomainDetector } from './DomainDetector';
export type { DomainContext } from './DomainDetector.types';

// Use default exports sparingly (only for main component)
export default DomainDetector;
```

## Integration with Existing Epic 5 Infrastructure

### Context Engine Integration
- **Location**: `src/lib/enhanced/contextEngine.ts` (existing)
- **Integration Point**: Domain expertise should extend context analysis
- **Pattern**: Composition over inheritance

### MCP Server Integration
- **Location**: `src/lib/enhanced/mcpManager.ts` (existing)
- **Integration Point**: Domain-specific MCP server activation
- **Pattern**: Dynamic server selection based on domain

### Search Integration
- **Location**: `src/lib/enhanced/searchIntegration.ts` (existing)
- **Integration Point**: Domain-aware search result filtering
- **Pattern**: Search enhancement with domain context

## Testing Patterns

### Component Testing
```typescript
// Location: src/components/features/domain-detection/DomainDetector.test.tsx
import { render, screen } from '@testing-library/react';
import { DomainDetector } from './DomainDetector';

describe('DomainDetector', () => {
  test('detects healthcare domain correctly', () => {
    // Test implementation
  });
});
```

### Integration Testing
```typescript
// Location: src/lib/enhanced/__tests__/domainExpertise.integration.test.ts
import { DomainExpertiseEngine } from '../domainExpertise';
import { ContextEngine } from '../contextEngine';

describe('Domain Expertise Integration', () => {
  test('integrates with context engine for domain detection', async () => {
    // Integration test implementation
  });
});
```

## Deployment Considerations

### Environment Configuration
- Store domain-specific configurations in environment variables
- Use feature flags for gradual rollout of domain expertise features
- Maintain backward compatibility with existing Epic 5 features

### Performance Optimization
- Lazy load domain-specific knowledge bases
- Cache domain detection results
- Optimize for fastest common domain detection patterns

## Documentation Requirements

### Component Documentation
- Include JSDoc comments for all public APIs
- Document integration patterns with Epic 5 components
- Provide usage examples for complex components

### Architecture Documentation
- Update architecture diagrams for Epic 6.4 additions
- Document data flow between Epic 5 and Epic 6.4 components
- Maintain integration pattern documentation

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-08-27 | 1.0 | Initial component placement guidelines | Development Team |