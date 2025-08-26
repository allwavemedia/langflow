// Context Understanding Engine - Phase 1 Foundation
// Enhanced for Phase 2 with documentation grounding and schema compliance

interface ContextAnalysis {
  domainAnalysis: {
    domain: string;
    confidence: number;
  };
  technologyStack: {
    platform: string;
    compliance: string[];
  };
  specializations: string[];
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
      enableWebSearch: false, // Will be enabled in Phase 2
      prioritizeOfficialDocs: true,
      ...options
    };
  }

  async query(queryOptions: ContextQuery): Promise<ContextAnalysis> {
    const { query, maxResults = 5, domain } = queryOptions;
    
    // Basic domain analysis - will be enhanced in Phase 2
    const domainAnalysis = this.analyzeDomain(query);
    const technologyStack = this.analyzeTechnologyStack(query);
    const specializations = this.extractSpecializations(query);

    const analysis: ContextAnalysis = {
      domainAnalysis,
      technologyStack,
      specializations
    };

    return analysis;
  }

  private analyzeDomain(query: string): { domain: string; confidence: number } {
    const domains = {
      healthcare: ['medical', 'health', 'patient', 'hospital', 'clinical', 'hipaa'],
      finance: ['financial', 'bank', 'payment', 'trading', 'investment', 'compliance'],
      ecommerce: ['shop', 'cart', 'order', 'product', 'customer', 'inventory'],
      education: ['student', 'course', 'learning', 'academic', 'school', 'university'],
      automation: ['workflow', 'process', 'automate', 'pipeline', 'batch', 'schedule']
    };

    const lowerQuery = query.toLowerCase();
    let bestDomain = 'general';
    let bestScore = 0;

    for (const [domain, keywords] of Object.entries(domains)) {
      const matches = keywords.filter(keyword => lowerQuery.includes(keyword));
      const score = matches.length / keywords.length;
      
      if (score > bestScore) {
        bestScore = score;
        bestDomain = domain;
      }
    }

    return {
      domain: bestDomain,
      confidence: bestScore > 0 ? Math.min(bestScore * 2, 1) : 0.1
    };
  }

  private analyzeTechnologyStack(query: string): { platform: string; compliance: string[] } {
    const platforms = {
      azure: ['azure', 'microsoft', 'ad', 'graph', 'office365', 'm365'],
      aws: ['aws', 'amazon', 's3', 'lambda', 'dynamodb', 'cloudformation'],
      gcp: ['google', 'gcp', 'firebase', 'bigquery', 'cloud', 'vertex'],
      kubernetes: ['k8s', 'kubernetes', 'docker', 'container', 'helm', 'istio']
    };

    const compliance = {
      hipaa: ['medical', 'health', 'patient', 'phi'],
      gdpr: ['privacy', 'data protection', 'eu', 'consent'],
      sox: ['financial', 'audit', 'controls', 'sox'],
      pci: ['payment', 'card', 'pci', 'transaction']
    };

    const lowerQuery = query.toLowerCase();
    let detectedPlatform = 'general';
    let detectedCompliance: string[] = [];

    // Detect platform
    for (const [platform, keywords] of Object.entries(platforms)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        detectedPlatform = platform;
        break;
      }
    }

    // Detect compliance requirements
    for (const [complianceType, keywords] of Object.entries(compliance)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        detectedCompliance.push(complianceType.toUpperCase());
      }
    }

    return {
      platform: detectedPlatform,
      compliance: detectedCompliance
    };
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

  generateContextualQuestions(analysis: ContextAnalysis): string[] {
    const questions: string[] = [];
    
    // Domain-specific questions
    switch (analysis.domainAnalysis.domain) {
      case 'healthcare':
        questions.push(
          'What patient data protection measures do you need?',
          'How will you ensure HIPAA compliance?'
        );
        break;
      case 'finance':
        questions.push(
          'What financial regulations apply to your use case?',
          'Do you need audit trails for transactions?'
        );
        break;
      case 'ecommerce':
        questions.push(
          'How will you handle customer data and orders?',
          'What payment processing integrations do you need?'
        );
        break;
      default:
        questions.push(
          'What are your primary business requirements?',
          'What compliance considerations do you have?'
        );
    }

    // Technology-specific questions
    if (analysis.technologyStack.platform !== 'general') {
      questions.push(`How will you deploy on ${analysis.technologyStack.platform}?`);
    }

    return questions.slice(0, 3); // Limit to 3 contextual questions
  }

  getContext(conversationId: string): ContextAnalysis | null {
    return this.contexts.get(conversationId) || null;
  }

  updateContext(conversationId: string, userInput: string, type: string): ContextAnalysis {
    const existingContext = this.contexts.get(conversationId);
    const newAnalysis = this.analyzeDomain(userInput);
    
    if (existingContext) {
      // Merge existing context with new analysis
      const updatedContext: ContextAnalysis = {
        domainAnalysis: {
          domain: newAnalysis.confidence > existingContext.domainAnalysis.confidence ? 
                  newAnalysis.domain : existingContext.domainAnalysis.domain,
          confidence: Math.max(newAnalysis.confidence, existingContext.domainAnalysis.confidence)
        },
        technologyStack: existingContext.technologyStack,
        specializations: [...new Set([...existingContext.specializations, ...this.extractSpecializations(userInput)])]
      };
      
      this.contexts.set(conversationId, updatedContext);
      return updatedContext;
    } else {
      // Create new context
      const analysis: ContextAnalysis = {
        domainAnalysis: newAnalysis,
        technologyStack: this.analyzeTechnologyStack(userInput),
        specializations: this.extractSpecializations(userInput)
      };
      
      this.contexts.set(conversationId, analysis);
      return analysis;
    }
  }
}

export const contextEngine = new ContextEngine();