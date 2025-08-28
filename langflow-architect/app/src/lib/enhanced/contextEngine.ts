// Context Understanding Engine - Enhanced for Phase 2
// Integrates domain analysis, technology stack detection, and contextual question generation.
//
// ARCHITECTURAL IMPROVEMENT NEEDED:
// Current implementation uses basic pattern matching for domain detection.
// Should be refactored to implement Dynamic Domain Intelligence as specified in:
// docs/dynamic-domain-intelligence-design.md
// 
// Key improvements needed:
// 1. Replace static domain keywords with MCP-based domain discovery
// 2. Implement real-time compliance intelligence using web search
// 3. Add contextual question generation based on discovered domain knowledge
// 4. Remove all hardcoded domain mappings in favor of dynamic learning

export interface ContextAnalysis {
  domainAnalysis: {
    domain: string;
    confidence: number;
  };
  technologyStack: {
    platform: string;
    compliance: string[];
  };
  specializations: string[];
  complexity?: 'basic' | 'intermediate' | 'advanced';
  requiresCompliance?: boolean;
  suggestedIntegrations?: string[];
}

interface ContextQuery {
  query: string;
  maxResults?: number;
  domain?: string;
}

interface ContextEngineOptions {
  enableDocumentationGrounding?: boolean;
  enableWebSearch?: boolean;
  prioritizeOfficialDocs?: boolean;
}

export class ContextEngine {
  private contexts: Map<string, ContextAnalysis> = new Map();
  private options: ContextEngineOptions;

  constructor(options: ContextEngineOptions = {}) {
    this.options = {
      enableDocumentationGrounding: true,
      enableWebSearch: false, 
      prioritizeOfficialDocs: true,
      ...options
    };
  }

  async query(queryOptions: ContextQuery): Promise<ContextAnalysis> {
    const { query } = queryOptions;
    
    const domainAnalysis = this.analyzeDomain(query);
    const technologyStack = this.analyzeTechnologyStack(query);
    const specializations = this.extractSpecializations(query);

    const analysis: ContextAnalysis = {
      domainAnalysis,
      technologyStack,
      specializations,
      complexity: query.length > 100 ? 'advanced' : 'basic',
      requiresCompliance: analysis.technologyStack.compliance.length > 0,
      suggestedIntegrations: this.getSuggestedIntegrations(domainAnalysis.domain)
    };

    return analysis;
  }

  private analyzeDomain(query: string): { domain: string; confidence: number } {
    // TODO: Replace with dynamic domain discovery using MCP and web search
    // Current implementation uses static keywords - needs architectural refactor
    
    // Extract potential domain indicators from user input
    const domainIndicators = this.extractDomainIndicators(query);
    
    // For now, use a general domain classification approach
    // This should be replaced with MCP-based domain discovery
    if (domainIndicators.length === 0) {
      return { domain: 'general', confidence: 0.1 };
    }
    
    // Temporary confidence based on number of domain indicators found
    const confidence = Math.min(domainIndicators.length * 0.3, 0.9);
    
    return {
      domain: domainIndicators[0] || 'general',
      confidence
    };
  }

  private extractDomainIndicators(query: string): string[] {
    // Extract potential domain-related terms without hardcoding specific domains
    // This is a temporary implementation that should be replaced with MCP queries
    const indicators: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Look for industry-specific terms, compliance mentions, technology references
    const patterns = [
      /\b(medical|health|patient|clinical|hospital)\b/g,
      /\b(financial|banking|trading|investment|payment)\b/g,
      /\b(retail|ecommerce|shop|customer|order)\b/g,
      /\b(education|student|academic|learning|course)\b/g,
      /\b(manufacturing|production|supply|inventory)\b/g,
      /\b(compliance|regulation|audit|security|privacy)\b/g
    ];
    
    patterns.forEach(pattern => {
      const matches = lowerQuery.match(pattern);
      if (matches) {
        indicators.push(...matches);
      }
    });
    
    return [...new Set(indicators)]; // Remove duplicates
  }

  private analyzeTechnologyStack(query: string): { platform: string; compliance: string[] } {
    // TODO: Replace with dynamic technology and compliance discovery
    // Current implementation should use MCP servers to discover current tech patterns
    
    const detectedTechnologies = this.extractTechnologyIndicators(query);
    const complianceIndicators = this.extractComplianceIndicators(query);
    
    return {
      platform: detectedTechnologies[0] || 'general',
      compliance: complianceIndicators
    };
  }

  private extractTechnologyIndicators(query: string): string[] {
    // Temporary implementation - should be replaced with MCP-based discovery
    const lowerQuery = query.toLowerCase();
    const techIndicators: string[] = [];
    
    const techPatterns = [
      { name: 'azure', patterns: ['azure', 'microsoft', 'ad', 'graph', 'office365', 'm365'] },
      { name: 'aws', patterns: ['aws', 'amazon', 's3', 'lambda', 'dynamodb'] },
      { name: 'gcp', patterns: ['google', 'gcp', 'firebase', 'bigquery'] },
      { name: 'kubernetes', patterns: ['k8s', 'kubernetes', 'docker', 'container'] }
    ];
    
    for (const tech of techPatterns) {
      if (tech.patterns.some(pattern => lowerQuery.includes(pattern))) {
        techIndicators.push(tech.name);
      }
    }
    
    return techIndicators;
  }

  private extractComplianceIndicators(query: string): string[] {
    // TODO: Replace with dynamic compliance framework discovery via MCP/web search
    // This should query current regulatory requirements rather than using static lists
    const lowerQuery = query.toLowerCase();
    const complianceIndicators: string[] = [];
    
    // Temporary pattern matching - needs to be replaced with intelligent discovery
    const compliancePatterns = [
      { framework: 'HIPAA', indicators: ['hipaa', 'medical', 'health', 'patient', 'phi'] },
      { framework: 'GDPR', indicators: ['gdpr', 'privacy', 'data protection', 'consent'] },
      { framework: 'SOX', indicators: ['sox', 'financial', 'audit', 'controls'] },
      { framework: 'PCI', indicators: ['pci', 'payment', 'card', 'transaction'] }
    ];
    
    for (const compliance of compliancePatterns) {
      if (compliance.indicators.some(indicator => lowerQuery.includes(indicator))) {
        complianceIndicators.push(compliance.framework);
      }
    }
    
    return complianceIndicators;
  }

  private extractSpecializations(query: string): string[] {
    const specializations = {
      'real-time': ['real-time', 'live', 'streaming', 'instant'],
      'batch-processing': ['batch', 'bulk', 'scheduled', 'periodic'],
      'api-integration': ['api', 'rest', 'graphql', 'webhook', 'integration'],
      'data-processing': ['data', 'etl', 'transform', 'parse', 'extract'],
      'machine-learning': ['ml', 'ai', 'model', 'prediction', 'classification']
    };

    const lowerQuery = query.toLowerCase();
    const detected: string[] = [];

    for (const [specialization, keywords] of Object.entries(specializations)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        detected.push(specialization);
      }
    }

    return detected;
  }
  
  private getSuggestedIntegrations(domain: string): string[] {
    // TODO: Replace with dynamic integration discovery using MCP and web search
    // Current implementation should query current best practices and available integrations
    
    // Temporary fallback - should be replaced with intelligent discovery
    return this.getGeneralIntegrationSuggestions();
  }

  private getGeneralIntegrationSuggestions(): string[] {
    // Provide general integration patterns that can be discovered dynamically
    return [
      'REST API Integration',
      'Database Connection',
      'File Storage Service',
      'Authentication Provider',
      'Monitoring & Logging',
      'Message Queue'
    ];
  }

  generateContextualQuestions(analysis: ContextAnalysis): string[] {
    // TODO: Replace with dynamic question generation using domain knowledge from MCP/web search
    // Current implementation should generate questions based on discovered domain patterns
    
    const questions: string[] = [];
    
    // Generate domain-agnostic questions that can be enhanced with discovered knowledge
    questions.push(
      'What are the core business requirements for your workflow?',
      'What data sources and systems need to be integrated?',
      'Are there any regulatory or compliance considerations?',
      'What is your preferred technology stack or platform?',
      'What are the expected volume and performance requirements?'
    );

    // Add technology-specific questions if detected
    if (analysis.technologyStack.platform !== 'general') {
      questions.push(`How do you plan to leverage ${analysis.technologyStack.platform} in your solution?`);
    }

    // Add compliance questions if indicators found
    if (analysis.technologyStack.compliance.length > 0) {
      questions.push(`How will you address ${analysis.technologyStack.compliance.join(' and ')} requirements?`);
    }

    return questions.slice(0, 3);
  }

  getContext(conversationId: string): ContextAnalysis | null {
    return this.contexts.get(conversationId) || null;
  }

  updateContext(conversationId: string, userInput: string, type: string): ContextAnalysis {
    const existingContext = this.contexts.get(conversationId);
    const newAnalysisResult = this.analyzeDomain(userInput);
    
    if (existingContext) {
      const updatedContext: ContextAnalysis = {
        domainAnalysis: {
          domain: newAnalysisResult.confidence > existingContext.domainAnalysis.confidence ? 
                  newAnalysisResult.domain : existingContext.domainAnalysis.domain,
          confidence: Math.max(newAnalysisResult.confidence, existingContext.domainAnalysis.confidence)
        },
        technologyStack: existingContext.technologyStack,
        specializations: [...new Set([...existingContext.specializations, ...this.extractSpecializations(userInput)])]
      };
      
      this.contexts.set(conversationId, updatedContext);
      return updatedContext;
    } else {
      const analysis: ContextAnalysis = {
        domainAnalysis: newAnalysisResult,
        technologyStack: this.analyzeTechnologyStack(userInput),
        specializations: this.extractSpecializations(userInput)
      };
      
      this.contexts.set(conversationId, analysis);
      return analysis;
    }
  }
}

export const contextEngine = new ContextEngine();

