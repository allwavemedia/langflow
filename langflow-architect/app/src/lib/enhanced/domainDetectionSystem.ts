// Domain Detection System - Epic 6.4.1 Implementation
// Dynamic domain intelligence with MCP integration and context-aware expertise activation

import { contextEngine } from './contextEngine';
import { mcpManager } from './mcpManager';
import { searchManager } from './searchManager';

// Define search result interface to match SearchManager
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: 'tavily' | 'duckduckgo';
  score: number;
  timestamp: Date;
  domain: string;
  metadata?: Record<string, unknown>;
  relevanceScore?: number;
}

// MCP Query Response interface to match mcpManager
interface McpQueryResult {
  content: string;
  source: string;
  timestamp: string;
}

// Core domain detection interfaces following Dynamic Domain Intelligence Design
export interface DomainContext {
  domain: string;
  confidence: number;
  indicators: string[];
  timestamp: Date;
  source: 'conversation' | 'mcp' | 'web_search' | 'hybrid';
  metadata?: Record<string, unknown>;
}

export interface DomainKnowledge {
  domain: string;
  concepts: string[];
  technologies: string[];
  bestPractices: string[];
  commonPatterns: string[];
  sources: string[];
  lastUpdated: Date;
}

export interface EnhancedDomainContext extends DomainContext {
  knowledge: DomainKnowledge;
  relatedDomains: string[];
  expertiseLevel?: 'beginner' | 'intermediate' | 'advanced';
  complianceFrameworks?: string[];
}

export interface ComponentRecommendation {
  componentType: string;
  name: string;
  description: string;
  relevanceScore: number;
  domainSpecific: boolean;
  usagePatterns: string[];
  source: 'langflow' | 'custom' | 'external';
}

export interface DomainActivationResult {
  success: boolean;
  domainContext: EnhancedDomainContext;
  recommendations: ComponentRecommendation[];
  persistenceKey: string;
  error?: string;
}

// Domain Discovery Engine implementing Dynamic Domain Intelligence patterns
export class DomainDiscoveryEngine {
  private activeContexts: Map<string, EnhancedDomainContext> = new Map();
  private knowledgeCache: Map<string, DomainKnowledge> = new Map();
  private mcpConnections: Map<string, boolean> = new Map();

  constructor() {
    this.initializeMcpConnections();
  }

  // Primary domain detection method - analyzes conversation context dynamically
  async analyzeUserContext(input: string, sessionId?: string): Promise<DomainContext> {
    // Step 1: Extract domain indicators from conversation context
    const indicators = this.extractDomainIndicators(input);
    
    // Step 2: Use context engine for initial domain analysis
    const contextAnalysis = await contextEngine.query({ query: input });
    
    // Step 3: Enhance with real-time knowledge if indicators found
    let domain = contextAnalysis.domainAnalysis.domain;
    let confidence = contextAnalysis.domainAnalysis.confidence;
    let source: DomainContext['source'] = 'conversation';

    if (indicators.length > 0) {
      // Try MCP enhancement first
      const mcpEnhancement = await this.tryMcpEnhancement(indicators);
      if (mcpEnhancement.domain !== 'general') {
        domain = mcpEnhancement.domain;
        confidence = Math.max(confidence, mcpEnhancement.confidence);
        source = 'mcp';
      }

      // Fallback to web search if confidence still low
      if (confidence < 0.7) {
        const webEnhancement = await this.tryWebEnhancement(indicators);
        if (webEnhancement.domain !== 'general') {
          domain = webEnhancement.domain;
          confidence = Math.max(confidence, webEnhancement.confidence);
          source = 'hybrid';
        }
      }
    }

    const domainContext: DomainContext = {
      domain,
      confidence,
      indicators,
      timestamp: new Date(),
      source,
      metadata: {
        sessionId,
        inputLength: input.length,
        processingTime: Date.now()
      }
    };

    // Persist for session if confidence is high enough
    if (sessionId && confidence > 0.6) {
      this.persistDomainContext(sessionId, domainContext);
    }

    return domainContext;
  }

  // Query MCP servers for domain-specific knowledge
  async queryDomainKnowledge(domainHints: string[]): Promise<DomainKnowledge> {
    const domain = domainHints[0] || 'general';
    
    // Check cache first
    const cached = this.knowledgeCache.get(domain);
    if (cached && this.isKnowledgeFresh(cached)) {
      return cached;
    }

    // Query available MCP servers for domain knowledge
    const knowledge: DomainKnowledge = {
      domain,
      concepts: [],
      technologies: [],
      bestPractices: [],
      commonPatterns: [],
      sources: [],
      lastUpdated: new Date()
    };

    try {
      // Try Microsoft Docs MCP for enterprise domains
      if (this.mcpConnections.get('microsoft-docs')) {
        const msKnowledge = await this.queryMicrosoftDocsMcp(domain);
        if (msKnowledge) {
          const extractedKnowledge = this.extractKnowledgeFromMcpResults(msKnowledge);
          knowledge.concepts.push(...extractedKnowledge.concepts);
          knowledge.technologies.push(...extractedKnowledge.technologies);
          knowledge.sources.push('microsoft-docs-mcp');
        }
      }

      // Try CopilotKit MCP for development patterns
      if (this.mcpConnections.get('copilotkit') && this.isDevelopmentDomain(domain)) {
        const ckKnowledge = await this.queryCopilotKitMcp(domain);
        if (ckKnowledge) {
          const extractedKnowledge = this.extractKnowledgeFromMcpResults(ckKnowledge);
          knowledge.bestPractices.push(...extractedKnowledge.bestPractices);
          knowledge.commonPatterns.push(...extractedKnowledge.patterns);
          knowledge.sources.push('copilotkit-mcp');
        }
      }

      // Cache the result
      this.knowledgeCache.set(domain, knowledge);
      
    } catch (error) {
      console.warn(`MCP query failed for domain ${domain}:`, error);
      // Fallback to basic knowledge structure
    }

    return knowledge;
  }

  // Use web search to validate and enhance domain understanding
  async enhanceWithWebSearch(domainContext: DomainContext): Promise<EnhancedDomainContext> {
    const baseKnowledge = await this.queryDomainKnowledge([domainContext.domain]);
    
    try {
      // Search for current domain best practices and patterns
      const searchQuery = `${domainContext.domain} best practices workflows integration patterns`;
      const searchResults = await searchManager.search(searchQuery, {
        maxResults: 5,
        domainFilter: ['github.com', 'docs.microsoft.com', 'stackoverflow.com'],
        timeRange: 'year'
      });

      // Extract knowledge from search results
      const webKnowledge = this.extractKnowledgeFromSearch(searchResults.results);
      
      // Merge with base knowledge
      const enhancedKnowledge: DomainKnowledge = {
        ...baseKnowledge,
        concepts: [...new Set([...baseKnowledge.concepts, ...(webKnowledge.concepts || [])])],
        technologies: [...new Set([...baseKnowledge.technologies, ...(webKnowledge.technologies || [])])],
        bestPractices: [...new Set([...baseKnowledge.bestPractices, ...(webKnowledge.bestPractices || [])])],
        sources: [...baseKnowledge.sources, 'web-search']
      };

      // Detect related domains
      const relatedDomains = this.detectRelatedDomains(enhancedKnowledge);

      const enhancedContext: EnhancedDomainContext = {
        ...domainContext,
        knowledge: enhancedKnowledge,
        relatedDomains,
        expertiseLevel: this.inferExpertiseLevel(domainContext.indicators),
        complianceFrameworks: this.detectComplianceFrameworks(enhancedKnowledge)
      };

      return enhancedContext;

    } catch (error) {
      console.warn(`Web search enhancement failed:`, error);
      
      // Return basic enhanced context without web data
      return {
        ...domainContext,
        knowledge: baseKnowledge,
        relatedDomains: [],
        expertiseLevel: 'intermediate'
      };
    }
  }

  // Generate specialized component recommendations based on domain
  async generateComponentRecommendations(domainContext: EnhancedDomainContext): Promise<ComponentRecommendation[]> {
    const recommendations: ComponentRecommendation[] = [];
    
    // Base recommendations from domain knowledge
    const baseComponents = this.getBaseComponentsForDomain(domainContext.domain);
    recommendations.push(...baseComponents);

    // Technology-specific recommendations
    for (const tech of domainContext.knowledge.technologies) {
      const techComponents = this.getComponentsForTechnology(tech);
      recommendations.push(...techComponents);
    }

    // Pattern-based recommendations
    for (const pattern of domainContext.knowledge.commonPatterns) {
      const patternComponents = this.getComponentsForPattern(pattern);
      recommendations.push(...patternComponents);
    }

    // Sort by relevance score and domain specificity
    return recommendations
      .sort((a, b) => {
        if (a.domainSpecific !== b.domainSpecific) {
          return a.domainSpecific ? -1 : 1;
        }
        return b.relevanceScore - a.relevanceScore;
      })
      .slice(0, 10); // Top 10 recommendations
  }

  // Activate domain expertise for a session
  async activateDomainExpertise(input: string, sessionId: string): Promise<DomainActivationResult> {
    try {
      // Step 1: Analyze domain context
      const domainContext = await this.analyzeUserContext(input, sessionId);
      
      // Step 2: Enhance with additional knowledge
      const enhancedContext = await this.enhanceWithWebSearch(domainContext);
      
      // Step 3: Generate component recommendations
      const recommendations = await this.generateComponentRecommendations(enhancedContext);
      
      // Step 4: Store in active contexts
      this.activeContexts.set(sessionId, enhancedContext);
      
      // Step 5: Generate persistence key for session continuity
      const persistenceKey = this.generatePersistenceKey(sessionId, enhancedContext.domain);
      
      return {
        success: true,
        domainContext: enhancedContext,
        recommendations,
        persistenceKey
      };

    } catch (error) {
      return {
        success: false,
        domainContext: {
          ...await this.analyzeUserContext(input, sessionId),
          knowledge: {
            domain: 'general',
            concepts: [],
            technologies: [],
            bestPractices: [],
            commonPatterns: [],
            sources: [],
            lastUpdated: new Date()
          },
          relatedDomains: []
        },
        recommendations: [],
        persistenceKey: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get active domain context for a session
  getActiveDomainContext(sessionId: string): EnhancedDomainContext | null {
    return this.activeContexts.get(sessionId) || null;
  }

  // Switch domains seamlessly without losing context
  async switchDomain(sessionId: string, newInput: string): Promise<DomainActivationResult> {
    const currentContext = this.activeContexts.get(sessionId);
    
    // Preserve conversation history when switching
    const activationResult = await this.activateDomainExpertise(newInput, sessionId);
    
    if (activationResult.success && currentContext) {
      // Merge previous context insights if relevant
      activationResult.domainContext.metadata = {
        ...activationResult.domainContext.metadata,
        previousDomain: currentContext.domain,
        domainSwitchTime: new Date().toISOString()
      };
    }
    
    return activationResult;
  }

  // Private helper methods
  private extractDomainIndicators(input: string): string[] {
    const indicators: string[] = [];
    const lowerInput = input.toLowerCase();
    
    // Dynamic pattern detection - no hardcoded domains
    const technicalTerms = this.extractTechnicalTerms(lowerInput);
    const industryTerms = this.extractIndustryTerms(lowerInput);
    const complianceTerms = this.extractComplianceTerms(lowerInput);
    
    indicators.push(...technicalTerms, ...industryTerms, ...complianceTerms);
    
    return [...new Set(indicators)]; // Remove duplicates
  }

  private extractTechnicalTerms(input: string): string[] {
    // Extract technology and framework mentions
    const techPatterns = [
      /\b(api|rest|graphql|webhook|database|sql|nosql)\b/g,
      /\b(react|vue|angular|node|python|java|docker)\b/g,
      /\b(aws|azure|gcp|kubernetes|microservice)\b/g
    ];
    
    const terms: string[] = [];
    for (const pattern of techPatterns) {
      const matches = input.match(pattern);
      if (matches) terms.push(...matches);
    }
    
    return terms;
  }

  private extractIndustryTerms(input: string): string[] {
    // Extract industry-specific terminology
    const industryPatterns = [
      /\b(healthcare|medical|patient|hipaa|clinical)\b/g,
      /\b(finance|banking|payment|trading|fintech)\b/g,
      /\b(manufacturing|supply\s+chain|inventory|production)\b/g,
      /\b(retail|e-commerce|customer|sales|marketing)\b/g
    ];
    
    const terms: string[] = [];
    for (const pattern of industryPatterns) {
      const matches = input.match(pattern);
      if (matches) terms.push(...matches);
    }
    
    return terms;
  }

  private extractComplianceTerms(input: string): string[] {
    // Extract compliance and regulatory mentions
    const compliancePatterns = [
      /\b(gdpr|privacy|data\s+protection|consent)\b/g,
      /\b(sox|sarbanes|oxley|audit|compliance)\b/g,
      /\b(pci|dss|payment|security|encryption)\b/g,
      /\b(fda|medical\s+device|clinical\s+trial)\b/g
    ];
    
    const terms: string[] = [];
    for (const pattern of compliancePatterns) {
      const matches = input.match(pattern);
      if (matches) terms.push(...matches);
    }
    
    return terms;
  }

  private async tryMcpEnhancement(indicators: string[]): Promise<{ domain: string; confidence: number }> {
    // Try to enhance domain detection using available MCP servers
    try {
      if (this.mcpConnections.get('microsoft-docs')) {
        const mcpResult = await mcpManager.queryServers(indicators.join(' '), 'general', {
          timeout: 3000
        });
        
        if (mcpResult.success && mcpResult.results.length > 0) {
          return {
            domain: this.extractDomainFromMcpResults(mcpResult.results) || 'general',
            confidence: mcpResult.results.length > 0 ? 0.7 : 0.5
          };
        }
      }
    } catch (error) {
      console.warn('MCP enhancement failed:', error);
    }
    
    return { domain: 'general', confidence: 0.1 };
  }

  private extractDomainFromMcpResults(results: McpQueryResult[]): string | null {
    // Analyze MCP results to extract domain information
    if (results.length === 0) return null;
    
    const content = results.map(r => r.content).join(' ').toLowerCase();
    
    // Look for domain indicators in MCP responses
    if (content.includes('healthcare') || content.includes('medical')) {
      return 'healthcare';
    }
    if (content.includes('finance') || content.includes('banking')) {
      return 'finance';
    }
    if (content.includes('manufacturing') || content.includes('supply')) {
      return 'manufacturing';
    }
    if (content.includes('retail') || content.includes('e-commerce')) {
      return 'retail';
    }
    if (content.includes('api') || content.includes('integration')) {
      return 'integration';
    }
    
    return null;
  }

  private extractKnowledgeFromMcpResults(results: McpQueryResult[]): {
    concepts: string[];
    technologies: string[];
    bestPractices: string[];
    patterns: string[];
  } {
    const knowledge = {
      concepts: [] as string[],
      technologies: [] as string[],
      bestPractices: [] as string[],
      patterns: [] as string[]
    };
    
    for (const result of results) {
      const content = result.content.toLowerCase();
      
      // Extract technologies mentioned
      const techMentions = content.match(/\b(react|vue|angular|node|python|java|docker|kubernetes|aws|azure|gcp|api|database)\b/g);
      if (techMentions) {
        knowledge.technologies.push(...techMentions);
      }
      
      // Extract concepts
      const conceptMentions = content.match(/\b(workflow|automation|integration|service|component|architecture|pattern)\b/g);
      if (conceptMentions) {
        knowledge.concepts.push(...conceptMentions);
      }
      
      // Extract best practices and patterns
      if (content.includes('best practice') || content.includes('recommendation') || content.includes('guideline')) {
        knowledge.bestPractices.push(result.content.substring(0, 200));
      }
      
      if (content.includes('pattern') || content.includes('example') || content.includes('template')) {
        knowledge.patterns.push(result.content.substring(0, 200));
      }
    }
    
    return knowledge;
  }

  private async tryWebEnhancement(indicators: string[]): Promise<{ domain: string; confidence: number }> {
    // Use web search to validate domain indicators
    try {
      const searchQuery = `${indicators.join(' ')} domain industry type`;
      const results = await searchManager.search(searchQuery, {
        maxResults: 3,
        timeRange: 'month'
      });
      
      if (results.results.length > 0) {
        // Analyze search results to infer domain
        const domains = this.inferDomainsFromSearchResults(results.results);
        if (domains.length > 0) {
          return {
            domain: domains[0],
            confidence: 0.7
          };
        }
      }
    } catch (error) {
      console.warn('Web enhancement failed:', error);
    }
    
    return { domain: 'general', confidence: 0.1 };
  }

  private inferDomainsFromSearchResults(results: SearchResult[]): string[] {
    // Analyze search result patterns to infer likely domains
    const domainCounts: Record<string, number> = {};
    
    for (const result of results) {
      const text = `${result.title} ${result.snippet}`.toLowerCase();
      
      if (text.includes('healthcare') || text.includes('medical')) {
        domainCounts['healthcare'] = (domainCounts['healthcare'] || 0) + 1;
      }
      if (text.includes('finance') || text.includes('banking')) {
        domainCounts['finance'] = (domainCounts['finance'] || 0) + 1;
      }
      if (text.includes('manufacturing') || text.includes('supply')) {
        domainCounts['manufacturing'] = (domainCounts['manufacturing'] || 0) + 1;
      }
      if (text.includes('retail') || text.includes('commerce')) {
        domainCounts['retail'] = (domainCounts['retail'] || 0) + 1;
      }
    }
    
    return Object.entries(domainCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([domain]) => domain);
  }

  private async initializeMcpConnections(): Promise<void> {
    // Initialize connections to available MCP servers
    try {
      const availableServers = mcpManager.getAllServers();
      
      const microsoftDocsServer = availableServers.find(s => 
        s.id === 'microsoft-docs' || s.name.toLowerCase().includes('microsoft')
      );
      this.mcpConnections.set('microsoft-docs', !!microsoftDocsServer?.isActive);
      
      const copilotKitServer = availableServers.find(s => 
        s.id === 'copilotkit-official' || s.name.toLowerCase().includes('copilotkit')
      );
      this.mcpConnections.set('copilotkit', !!copilotKitServer?.isActive);
      
    } catch (error) {
      console.warn('MCP initialization failed:', error);
      // Set all connections to false for graceful degradation
      this.mcpConnections.set('microsoft-docs', false);
      this.mcpConnections.set('copilotkit', false);
    }
  }

  private persistDomainContext(sessionId: string, context: DomainContext): void {
    // Store domain context for session persistence
    try {
      const persistenceData = {
        domain: context.domain,
        confidence: context.confidence,
        indicators: context.indicators,
        timestamp: context.timestamp.toISOString(),
        source: context.source
      };
      
      localStorage.setItem(`domain-context-${sessionId}`, JSON.stringify(persistenceData));
    } catch (error) {
      console.warn('Failed to persist domain context:', error);
    }
  }

  private generatePersistenceKey(sessionId: string, domain: string): string {
    return `${sessionId}-${domain}-${Date.now()}`;
  }

  private async queryMicrosoftDocsMcp(domain: string): Promise<McpQueryResult[] | null> {
    try {
      const result = await mcpManager.queryServers(`${domain} documentation guidelines`, 'general', {
        timeout: 3000
      });
      return result.success ? result.results : null;
    } catch (error) {
      console.warn('Microsoft Docs MCP query failed:', error);
      return null;
    }
  }

  private async queryCopilotKitMcp(domain: string): Promise<McpQueryResult[] | null> {
    try {
      const result = await mcpManager.queryServers(`${domain} development patterns best practices`, 'general', {
        timeout: 3000
      });
      return result.success ? result.results : null;
    } catch (error) {
      console.warn('CopilotKit MCP query failed:', error);
      return null;
    }
  }

  private isDevelopmentDomain(domain: string): boolean {
    const devDomains = ['development', 'software', 'api', 'integration', 'automation'];
    return devDomains.some(d => domain.includes(d));
  }

  private isKnowledgeFresh(knowledge: DomainKnowledge): boolean {
    const ageMs = Date.now() - knowledge.lastUpdated.getTime();
    const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours
    return ageMs < maxAgeMs;
  }

  private extractKnowledgeFromSearch(results: SearchResult[]): Partial<DomainKnowledge> {
    const knowledge: Partial<DomainKnowledge> = {
      concepts: [],
      technologies: [],
      bestPractices: []
    };
    
    for (const result of results) {
      const text = `${result.title} ${result.snippet}`.toLowerCase();
      
      // Extract technologies mentioned
      const techMentions = text.match(/\b(react|vue|angular|node|python|java|docker|kubernetes|aws|azure|gcp)\b/g);
      if (techMentions) {
        knowledge.technologies!.push(...techMentions);
      }
      
      // Extract concepts
      const conceptMentions = text.match(/\b(workflow|automation|integration|api|service|component)\b/g);
      if (conceptMentions) {
        knowledge.concepts!.push(...conceptMentions);
      }
      
      // Extract best practices
      if (text.includes('best practice') || text.includes('recommendation')) {
        knowledge.bestPractices!.push(result.snippet);
      }
    }
    
    return knowledge;
  }

  private detectRelatedDomains(knowledge: DomainKnowledge): string[] {
    // Analyze knowledge to detect related domains
    const related: string[] = [];
    
    const technologies = knowledge.technologies.join(' ').toLowerCase();
    const concepts = knowledge.concepts.join(' ').toLowerCase();
    
    if (technologies.includes('api') || concepts.includes('integration')) {
      related.push('integration');
    }
    if (technologies.includes('cloud') || technologies.includes('aws') || technologies.includes('azure')) {
      related.push('cloud');
    }
    if (concepts.includes('security') || concepts.includes('compliance')) {
      related.push('security');
    }
    
    return [...new Set(related)];
  }

  private inferExpertiseLevel(indicators: string[]): 'beginner' | 'intermediate' | 'advanced' {
    // Infer user expertise based on terminology used
    const advancedTerms = indicators.filter(term => 
      /\b(microservice|kubernetes|devops|architecture|distributed|scalability)\b/i.test(term)
    ).length;
    
    const intermediateTerms = indicators.filter(term =>
      /\b(api|database|framework|integration|authentication)\b/i.test(term)
    ).length;
    
    if (advancedTerms > 2) return 'advanced';
    if (intermediateTerms > 1) return 'intermediate';
    return 'beginner';
  }

  private detectComplianceFrameworks(knowledge: DomainKnowledge): string[] {
    const frameworks: string[] = [];
    const allText = [
      ...knowledge.concepts,
      ...knowledge.bestPractices,
      ...knowledge.technologies
    ].join(' ').toLowerCase();
    
    if (allText.includes('hipaa') || allText.includes('healthcare')) {
      frameworks.push('HIPAA');
    }
    if (allText.includes('gdpr') || allText.includes('privacy')) {
      frameworks.push('GDPR');
    }
    if (allText.includes('sox') || allText.includes('sarbanes')) {
      frameworks.push('SOX');
    }
    if (allText.includes('pci') || allText.includes('payment')) {
      frameworks.push('PCI-DSS');
    }
    if (allText.includes('fda') || allText.includes('medical device')) {
      frameworks.push('FDA');
    }
    
    return frameworks;
  }

  private getBaseComponentsForDomain(domain: string): ComponentRecommendation[] {
    // Generate base component recommendations for domain
    const recommendations: ComponentRecommendation[] = [];
    
    // This would integrate with langflow schema registry
    // For now, return generic recommendations based on domain
    if (domain.includes('api') || domain.includes('integration')) {
      recommendations.push({
        componentType: 'api_connector',
        name: 'HTTP Request',
        description: 'Make HTTP API calls with authentication',
        relevanceScore: 0.9,
        domainSpecific: true,
        usagePatterns: ['api-integration', 'external-service'],
        source: 'langflow'
      });
    }
    
    if (domain.includes('data') || domain.includes('database')) {
      recommendations.push({
        componentType: 'data_processor',
        name: 'Data Transformer',
        description: 'Transform and validate data structures',
        relevanceScore: 0.8,
        domainSpecific: true,
        usagePatterns: ['data-processing', 'validation'],
        source: 'langflow'
      });
    }
    
    return recommendations;
  }

  private getComponentsForTechnology(technology: string): ComponentRecommendation[] {
    // Get components specific to mentioned technologies
    const recommendations: ComponentRecommendation[] = [];
    
    if (technology.toLowerCase().includes('python')) {
      recommendations.push({
        componentType: 'code_executor',
        name: 'Python Code',
        description: 'Execute Python code snippets',
        relevanceScore: 0.85,
        domainSpecific: false,
        usagePatterns: ['scripting', 'data-analysis'],
        source: 'langflow'
      });
    }
    
    return recommendations;
  }

  private getComponentsForPattern(pattern: string): ComponentRecommendation[] {
    // Get components for common patterns
    const recommendations: ComponentRecommendation[] = [];
    
    if (pattern.toLowerCase().includes('authentication')) {
      recommendations.push({
        componentType: 'auth_handler',
        name: 'OAuth Authenticator',
        description: 'Handle OAuth authentication flows',
        relevanceScore: 0.9,
        domainSpecific: true,
        usagePatterns: ['security', 'user-auth'],
        source: 'langflow'
      });
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const domainDetectionSystem = new DomainDiscoveryEngine();
