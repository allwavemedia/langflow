/**
 * Unified Context Engine - Phase 2
 * Combines context fusion with basic domain/technology understanding
 * and exposes a minimal API used by the route handlers.
 */

export interface ContextAnalysis {
  domain: string;
  confidence: number;
  technologies: string[];
  complexity: 'basic' | 'intermediate' | 'advanced';
  requiresCompliance: boolean;
  suggestedIntegrations: string[];
}

export interface ContextEngineConfig {
  enableDomainDetection: boolean;
  enableTechnologyDetection: boolean;
  knowledgeBasePath?: string;
}

export interface ContextSource {
  type: 'user' | 'docs' | 'search' | 'mcp';
  content: string;
  metadata?: Record<string, unknown>;
  timestamp?: number;
  confidence?: number;
}

export interface ContextFusionResult {
  sources: ContextSource[];
  fusedContext: string;
  metadata: {
    totalSources: number;
    docsWeight: number;
    searchWeight: number;
    userWeight: number;
  };
}

class ContextEngine {
  private sources: ContextSource[] = [];
  private config: ContextEngineConfig;
  private conversations: Map<string, ContextAnalysis> = new Map();

  constructor(config: ContextEngineConfig = { enableDomainDetection: true, enableTechnologyDetection: true }) {
    this.config = config;
  }

  // --- Context fusion inputs ---
  addUserContext(content: string, metadata?: Record<string, unknown>): void {
    this.sources.push({ type: 'user', content, metadata, timestamp: Date.now(), confidence: 1.0 });
  }

  addDocsContext(content: string, metadata?: Record<string, unknown>): void {
    this.sources.push({ type: 'docs', content, metadata, timestamp: Date.now(), confidence: 0.9 });
  }

  addSearchContext(content: string, metadata?: Record<string, unknown>): void {
    this.sources.push({ type: 'search', content, metadata, timestamp: Date.now(), confidence: 0.7 });
  }

  // --- Fusion ---
  fuseContext(): ContextFusionResult {
    const docsSources = this.sources.filter(s => s.type === 'docs');
    const searchSources = this.sources.filter(s => s.type === 'search');
    const userSources = this.sources.filter(s => s.type === 'user');

    const prioritizedSources = [...docsSources, ...userSources, ...searchSources];
    const fusedContent = prioritizedSources.map(s => s.content).join('\n\n');

    const total = this.sources.length || 1; // avoid NaN
    return {
      sources: this.sources,
      fusedContext: fusedContent,
      metadata: {
        totalSources: this.sources.length,
        docsWeight: docsSources.length / total,
        searchWeight: searchSources.length / total,
        userWeight: userSources.length / total,
      },
    };
  }

  reset(): void {
    this.sources = [];
  }

  // --- Basic understanding ---
  async analyzeContext(input: string): Promise<ContextAnalysis> {
    const lowerInput = input.toLowerCase();
    let domain = 'general';
    if (/(health|medical|hipaa)/.test(lowerInput)) domain = 'healthcare';
    else if (/(finance|bank|payment)/.test(lowerInput)) domain = 'finance';
    else if (/(office|microsoft|sharepoint)/.test(lowerInput)) domain = 'microsoft365';

    const technologies: string[] = [];
    if (lowerInput.includes('azure')) technologies.push('Azure');
    if (lowerInput.includes('aws')) technologies.push('AWS');
    if (lowerInput.includes('api')) technologies.push('REST API');
    if (lowerInput.includes('database')) technologies.push('Database');

    return {
      domain,
      confidence: 0.7,
      technologies,
      complexity: input.length > 200 ? 'advanced' : input.length > 100 ? 'intermediate' : 'basic',
      requiresCompliance: domain === 'healthcare' || domain === 'finance',
      suggestedIntegrations: this.getSuggestedIntegrations(domain),
    };
  }

  private getSuggestedIntegrations(domain: string): string[] {
    const integrations: Record<string, string[]> = {
      healthcare: ['FHIR API', 'HL7 Integration', 'Compliance Logger'],
      finance: ['Payment Gateway', 'Fraud Detection', 'Audit Trail'],
      microsoft365: ['SharePoint', 'Teams', 'Outlook'],
      general: ['Web API', 'Database', 'File Storage'],
    };
    return integrations[domain] || integrations.general;
  }

  // --- Minimal API expected by route handlers ---
  async query(params: { query: string; maxResults?: number }): Promise<{
    domainAnalysis: { domain: string; confidence: number };
    technologyStack: { platform: string[] | string; compliance: boolean };
    specializations: string[];
  }> {
    const analysis = await this.analyzeContext(params.query);
    return {
      domainAnalysis: { domain: analysis.domain, confidence: analysis.confidence },
      technologyStack: { platform: analysis.technologies, compliance: analysis.requiresCompliance },
      specializations: analysis.suggestedIntegrations,
    };
  }

  getContext(conversationId: string): ContextAnalysis | null {
    return this.conversations.get(conversationId) || null;
  }

  updateContext(conversationId: string, input: string, reason?: string): ContextAnalysis {
    const updated = this.conversations.get(conversationId);
    if (updated) {
      // naive merge: re-analyze and overwrite
      // in Phase 2 we will merge incrementally
    }
    const analysis: ContextAnalysis = {
      ...(this.conversations.get(conversationId) || {
        domain: 'general',
        confidence: 0.6,
        technologies: [],
        complexity: 'basic' as const,
        requiresCompliance: false,
        suggestedIntegrations: [],
      }),
    };
    // refresh using analyzeContext heuristics (capture reason for future auditing)
    void reason;
    // best-effort without awaiting to keep sync API; callers don't use return timing
    this.analyzeContext(input).then((fresh) => this.conversations.set(conversationId, fresh)).catch(() => {});
    return analysis;
  }

  generateContextualQuestions(context: {
    domainAnalysis: { domain: string; confidence: number };
    technologyStack: { platform: string[] | string; compliance: boolean };
    specializations: string[];
  }): string[] {
    // Simple contextual questions leveraging detected domain
    const domain = context.domainAnalysis.domain || 'your domain';
    const base = [
      `In ${domain}, what data sources are most relevant for this workflow?`,
      'Are there compliance or security constraints to consider?',
      'Which integrations are mandatory vs. optional?',
    ];
    // Add one specialization-driven question if available
    const spec = context.specializations?.[0];
    return spec ? [...base, `Should we include ${spec} as a first-class integration?`] : base;
  }
}

// Export singleton instance
export const contextEngine = new ContextEngine();
