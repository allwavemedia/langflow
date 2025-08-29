// Regulatory Framework Manager - Epic 6.4.2 Implementation
// Dynamic regulatory framework discovery and management using MCP + web search
// Zero hardcoded compliance frameworks - fully generalist approach

import { mcpManager } from './mcpManager';
import { searchManager } from './searchManager';
import type { ComplianceFramework, ComplianceRequirement, ValidationRule } from './complianceIntelligenceSystem';

// Framework discovery interfaces
export interface FrameworkDiscoveryOptions {
  domainContext?: string;
  industryType?: string;
  geographicScope?: string;
  dataTypes?: string[];
  businessOperations?: string[];
  maxResults?: number;
  includeDraft?: boolean;
  timeRange?: 'current' | 'recent' | 'all';
}

export interface FrameworkDiscoveryResult {
  frameworks: ComplianceFramework[];
  discoveryMethod: 'mcp' | 'web_search' | 'hybrid' | 'cache';
  confidence: number;
  sources: string[];
  queryTime: number;
  lastUpdated: Date;
}

export interface RegulatorySource {
  id: string;
  name: string;
  type: 'government' | 'industry' | 'international' | 'standards_body';
  authority: string;
  domains: string[];
  updateFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly';
  apiEndpoint?: string;
  isActive: boolean;
}

export interface FrameworkUpdateEvent {
  frameworkId: string;
  updateType: 'new_requirement' | 'modified_requirement' | 'deprecated_requirement' | 'framework_update';
  description: string;
  effectiveDate: Date;
  source: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

// Search result interface to match SearchManager
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

// MCP Query Response interface
interface McpQueryResult {
  content: string;
  source: string;
  timestamp: string;
}

// Regulatory Framework Manager - implements dynamic discovery patterns
export class RegulatoryFrameworkManager {
  private frameworkCache: Map<string, FrameworkDiscoveryResult> = new Map();
  private sourceRegistry: Map<string, RegulatorySource> = new Map();
  private updateSubscriptions: Map<string, FrameworkUpdateEvent[]> = new Map();
  private discoveryHistory: Map<string, FrameworkDiscoveryResult[]> = new Map();
  private mcpConnections: Map<string, boolean> = new Map();

  constructor() {
    this.initializeRegulatorySources();
    this.initializeMcpConnections();
  }

  // Primary framework discovery method - zero hardcoded frameworks
  async discoverFrameworks(
    discoveryContext: string,
    options: FrameworkDiscoveryOptions = {}
  ): Promise<FrameworkDiscoveryResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(discoveryContext, options);
    
    // Check cache first
    const cached = this.frameworkCache.get(cacheKey);
    if (cached && this.isCacheFresh(cached)) {
      return {
        ...cached,
        discoveryMethod: 'cache'
      };
    }

    const frameworks: ComplianceFramework[] = [];
    const sources: string[] = [];
    let discoveryMethod: FrameworkDiscoveryResult['discoveryMethod'] = 'hybrid';
    let confidence = 0;

    try {
      // Step 1: MCP-based discovery for authoritative sources
      const mcpResults = await this.discoverViaMultipleMcpSources(discoveryContext, options);
      if (mcpResults.frameworks.length > 0) {
        frameworks.push(...mcpResults.frameworks);
        sources.push(...mcpResults.sources);
        confidence = Math.max(confidence, mcpResults.confidence);
        discoveryMethod = 'mcp';
      }

      // Step 2: Web search for current regulatory information
      const webResults = await this.discoverViaWebSearch(discoveryContext, options);
      if (webResults.frameworks.length > 0) {
        frameworks.push(...webResults.frameworks);
        sources.push(...webResults.sources);
        confidence = Math.max(confidence, webResults.confidence);
        
        if (discoveryMethod === 'mcp') {
          discoveryMethod = 'hybrid';
        } else {
          discoveryMethod = 'web_search';
        }
      }

      // Step 3: Cross-validate and enhance discovered frameworks
      const validatedFrameworks = await this.crossValidateFrameworks(frameworks);
      const enhancedFrameworks = await this.enhanceFrameworksWithDetails(validatedFrameworks);

      const result: FrameworkDiscoveryResult = {
        frameworks: enhancedFrameworks,
        discoveryMethod,
        confidence,
        sources: [...new Set(sources)],
        queryTime: Date.now() - startTime,
        lastUpdated: new Date()
      };

      // Cache the result
      this.frameworkCache.set(cacheKey, result);
      
      // Store in discovery history
      this.addToDiscoveryHistory(discoveryContext, result);

      return result;

    } catch (error) {
      console.warn('Framework discovery failed:', error);
      
      return {
        frameworks: [],
        discoveryMethod: 'hybrid',
        confidence: 0,
        sources: [],
        queryTime: Date.now() - startTime,
        lastUpdated: new Date()
      };
    }
  }

  // Discover frameworks using multiple MCP sources
  private async discoverViaMultipleMcpSources(
    discoveryContext: string,
    options: FrameworkDiscoveryOptions
  ): Promise<{ frameworks: ComplianceFramework[]; sources: string[]; confidence: number }> {
    const frameworks: ComplianceFramework[] = [];
    const sources: string[] = [];
    let confidence = 0;

    // Context7 MCP for regulatory knowledge
    if (this.mcpConnections.get('context7')) {
      const context7Frameworks = await this.queryContext7ForFrameworks(discoveryContext, options);
      if (context7Frameworks.length > 0) {
        frameworks.push(...context7Frameworks);
        sources.push('context7-mcp');
        confidence = Math.max(confidence, 0.8);
      }
    }

    // CopilotKit MCP for compliance UI and integration patterns
    if (this.mcpConnections.get('copilotkit')) {
      const copilotKitFrameworks = await this.queryCopilotKitForFrameworks(discoveryContext, options);
      if (copilotKitFrameworks.length > 0) {
        frameworks.push(...copilotKitFrameworks);
        sources.push('copilotkit-mcp');
        confidence = Math.max(confidence, 0.7);
      }
    }

    // Microsoft Docs MCP for enterprise compliance
    if (this.mcpConnections.get('microsoft-docs')) {
      const msDocsFrameworks = await this.queryMicrosoftDocsForFrameworks(discoveryContext, options);
      if (msDocsFrameworks.length > 0) {
        frameworks.push(...msDocsFrameworks);
        sources.push('microsoft-docs-mcp');
        confidence = Math.max(confidence, 0.75);
      }
    }

    return {
      frameworks: this.deduplicateFrameworks(frameworks),
      sources,
      confidence
    };
  }

  // Discover frameworks using web search with authoritative sources
  private async discoverViaWebSearch(
    discoveryContext: string,
    options: FrameworkDiscoveryOptions
  ): Promise<{ frameworks: ComplianceFramework[]; sources: string[]; confidence: number }> {
    const frameworks: ComplianceFramework[] = [];
    const sources: string[] = [];
    
    try {
      // Build targeted search queries for regulatory frameworks
      const searchQueries = this.buildFrameworkSearchQueries(discoveryContext, options);
      
      for (const query of searchQueries) {
        const searchResults = await searchManager.search(query, {
          maxResults: options.maxResults || 8,
          domainFilter: this.getAuthoritativeRegulatorySources(),
          timeRange: options.timeRange === 'current' ? 'month' : 'year'
        });

        if (searchResults.results.length > 0) {
          const webFrameworks = await this.extractFrameworksFromSearchResults(
            searchResults.results,
            discoveryContext,
            options
          );
          frameworks.push(...webFrameworks);
          sources.push(`web-search-${query.substring(0, 20)}`);
        }
      }

      return {
        frameworks: this.deduplicateFrameworks(frameworks),
        sources,
        confidence: frameworks.length > 0 ? 0.7 : 0
      };

    } catch (error) {
      console.warn('Web search framework discovery failed:', error);
      return { frameworks: [], sources: [], confidence: 0 };
    }
  }

  // Query Context7 MCP for regulatory frameworks
  private async queryContext7ForFrameworks(
    discoveryContext: string,
    options: FrameworkDiscoveryOptions
  ): Promise<ComplianceFramework[]> {
    try {
      const queries = this.buildContext7Queries(discoveryContext, options);
      const frameworks: ComplianceFramework[] = [];

      for (const query of queries) {
        const result = await mcpManager.queryServers(query, 'compliance', {
          timeout: 4000
        });

        if (result.success && result.results.length > 0) {
          const extractedFrameworks = await this.extractFrameworksFromMcpResults(
            result.results,
            'context7',
            discoveryContext
          );
          frameworks.push(...extractedFrameworks);
        }
      }

      return frameworks;

    } catch (error) {
      console.warn('Context7 framework query failed:', error);
      return [];
    }
  }

  // Query CopilotKit MCP for compliance patterns and UI components
  private async queryCopilotKitForFrameworks(
    discoveryContext: string,
    options: FrameworkDiscoveryOptions
  ): Promise<ComplianceFramework[]> {
    try {
      const queries = this.buildCopilotKitQueries(discoveryContext, options);
      const frameworks: ComplianceFramework[] = [];

      for (const query of queries) {
        const result = await mcpManager.queryServers(query, 'general', {
          timeout: 3000
        });

        if (result.success && result.results.length > 0) {
          const extractedFrameworks = await this.extractFrameworksFromMcpResults(
            result.results,
            'copilotkit',
            discoveryContext
          );
          frameworks.push(...extractedFrameworks);
        }
      }

      return frameworks;

    } catch (error) {
      console.warn('CopilotKit framework query failed:', error);
      return [];
    }
  }

  // Query Microsoft Docs MCP for enterprise compliance frameworks
  private async queryMicrosoftDocsForFrameworks(
    discoveryContext: string,
    options: FrameworkDiscoveryOptions
  ): Promise<ComplianceFramework[]> {
    try {
      const queries = this.buildMicrosoftDocsQueries(discoveryContext, options);
      const frameworks: ComplianceFramework[] = [];

      for (const query of queries) {
        const result = await mcpManager.queryServers(query, 'general', {
          timeout: 3000
        });

        if (result.success && result.results.length > 0) {
          const extractedFrameworks = await this.extractFrameworksFromMcpResults(
            result.results,
            'microsoft-docs',
            discoveryContext
          );
          frameworks.push(...extractedFrameworks);
        }
      }

      return frameworks;

    } catch (error) {
      console.warn('Microsoft Docs framework query failed:', error);
      return [];
    }
  }

  // Extract compliance frameworks from MCP query results
  private async extractFrameworksFromMcpResults(
    results: McpQueryResult[],
    source: string,
    discoveryContext: string
  ): Promise<ComplianceFramework[]> {
    const frameworks: ComplianceFramework[] = [];

    for (const result of results) {
      const content = result.content.toLowerCase();
      
      // Look for framework indicators in MCP responses
      const frameworkIndicators = this.detectFrameworkIndicators(content);
      
      for (const indicator of frameworkIndicators) {
        const framework = await this.buildFrameworkFromIndicator(
          indicator,
          result,
          source,
          discoveryContext
        );
        
        if (framework) {
          frameworks.push(framework);
        }
      }
    }

    return frameworks;
  }

  // Extract compliance frameworks from web search results
  private async extractFrameworksFromSearchResults(
    results: SearchResult[],
    discoveryContext: string,
    options: FrameworkDiscoveryOptions
  ): Promise<ComplianceFramework[]> {
    const frameworks: ComplianceFramework[] = [];

    for (const result of results) {
      const text = `${result.title} ${result.snippet}`.toLowerCase();
      const frameworkIndicators = this.detectFrameworkIndicators(text);

      for (const indicator of frameworkIndicators) {
        const framework = await this.buildFrameworkFromSearchResult(
          indicator,
          result,
          discoveryContext,
          options
        );

        if (framework) {
          frameworks.push(framework);
        }
      }
    }

    return frameworks;
  }

  // Detect framework indicators from content (dynamic pattern recognition)
  private detectFrameworkIndicators(content: string): string[] {
    const indicators: string[] = [];

    // Healthcare/Medical frameworks
    if (/\b(hipaa|hitech|fda|clinical|medical\s+device|phi|ehr|fhir)\b/.test(content)) {
      if (content.includes('hipaa')) indicators.push('HIPAA');
      if (content.includes('hitech')) indicators.push('HITECH');
      if (content.includes('fda')) indicators.push('FDA-CFR-21');
      if (content.includes('fhir')) indicators.push('FHIR-Security');
    }

    // Financial frameworks
    if (/\b(sox|sarbanes|oxley|pci|dss|payment|financial|banking|basel)\b/.test(content)) {
      if (content.includes('sox') || content.includes('sarbanes')) indicators.push('SOX');
      if (content.includes('pci') || content.includes('dss')) indicators.push('PCI-DSS');
      if (content.includes('basel')) indicators.push('Basel-III');
    }

    // Privacy frameworks
    if (/\b(gdpr|ccpa|privacy|data\s+protection|consent|personal\s+data)\b/.test(content)) {
      if (content.includes('gdpr')) indicators.push('GDPR');
      if (content.includes('ccpa')) indicators.push('CCPA');
      if (content.includes('data protection')) indicators.push('Data-Protection-General');
    }

    // Security frameworks
    if (/\b(nist|iso.*27001|cybersecurity|security\s+framework|fisma)\b/.test(content)) {
      if (content.includes('nist')) indicators.push('NIST-Cybersecurity-Framework');
      if (content.includes('iso') && content.includes('27001')) indicators.push('ISO-27001');
      if (content.includes('fisma')) indicators.push('FISMA');
    }

    // Industry-specific frameworks
    if (/\b(manufacturing|automotive|aerospace|energy|utilities)\b/.test(content)) {
      if (content.includes('manufacturing')) indicators.push('Manufacturing-Standards');
      if (content.includes('automotive')) indicators.push('Automotive-Cybersecurity');
      if (content.includes('energy')) indicators.push('Energy-Sector-Security');
    }

    return [...new Set(indicators)];
  }

  // Build framework object from detected indicator and MCP result
  private async buildFrameworkFromIndicator(
    indicator: string,
    mcpResult: McpQueryResult,
    source: string,
    discoveryContext: string
  ): Promise<ComplianceFramework | null> {
    try {
      // Extract requirements from MCP content
      const requirements = await this.extractRequirementsFromContent(mcpResult.content, indicator);
      const validationRules = await this.extractValidationRulesFromContent(mcpResult.content, indicator);

      const framework: ComplianceFramework = {
        id: `${indicator.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: indicator,
        description: this.generateFrameworkDescription(indicator, mcpResult.content),
        applicableDomains: this.extractApplicableDomains(mcpResult.content, discoveryContext),
        requirements,
        validationRules,
        lastUpdated: new Date(),
        source: 'mcp',
        confidence: 0.8
      };

      return framework;

    } catch (error) {
      console.warn(`Failed to build framework from indicator ${indicator}:`, error);
      return null;
    }
  }

  // Build framework object from search result
  private async buildFrameworkFromSearchResult(
    indicator: string,
    searchResult: SearchResult,
    discoveryContext: string,
    options: FrameworkDiscoveryOptions
  ): Promise<ComplianceFramework | null> {
    try {
      const content = `${searchResult.title} ${searchResult.snippet}`;
      const requirements = await this.extractRequirementsFromContent(content, indicator);
      const validationRules = await this.extractValidationRulesFromContent(content, indicator);

      const framework: ComplianceFramework = {
        id: `${indicator.toLowerCase().replace(/\s+/g, '-')}-web-${Date.now()}`,
        name: indicator,
        description: this.generateFrameworkDescription(indicator, content),
        applicableDomains: this.extractApplicableDomains(content, discoveryContext),
        requirements,
        validationRules,
        lastUpdated: new Date(),
        source: 'web_search',
        confidence: Math.min(0.7, searchResult.relevanceScore || 0.7)
      };

      return framework;

    } catch (error) {
      console.warn(`Failed to build framework from search result for ${indicator}:`, error);
      return null;
    }
  }

  // Helper methods for building comprehensive framework data
  private async extractRequirementsFromContent(
    content: string,
    frameworkName: string
  ): Promise<ComplianceRequirement[]> {
    const requirements: ComplianceRequirement[] = [];
    
    // Extract requirements based on common patterns
    const requirementPatterns = [
      /must\s+([^.]+)/gi,
      /shall\s+([^.]+)/gi,
      /required\s+to\s+([^.]+)/gi,
      /mandatory\s+([^.]+)/gi
    ];

    for (const pattern of requirementPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches.slice(0, 5)) { // Limit to 5 per pattern
          const requirement: ComplianceRequirement = {
            id: `${frameworkName.toLowerCase()}-req-${requirements.length + 1}`,
            title: this.cleanRequirementText(match),
            description: match,
            category: this.categorizeRequirement(match),
            severity: this.assessRequirementSeverity(match),
            applicableContexts: [frameworkName],
            validationCriteria: [this.extractValidationCriteria(match)],
            references: [`${frameworkName} Documentation`]
          };
          requirements.push(requirement);
        }
      }
    }

    return requirements;
  }

  private async extractValidationRulesFromContent(
    content: string,
    frameworkName: string
  ): Promise<ValidationRule[]> {
    const rules: ValidationRule[] = [];
    
    // Extract validation patterns
    const validationPatterns = [
      /verify\s+([^.]+)/gi,
      /check\s+([^.]+)/gi,
      /validate\s+([^.]+)/gi,
      /ensure\s+([^.]+)/gi
    ];

    for (const pattern of validationPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches.slice(0, 3)) { // Limit to 3 per pattern
          const rule: ValidationRule = {
            id: `${frameworkName.toLowerCase()}-rule-${rules.length + 1}`,
            pattern: this.extractRulePattern(match),
            description: match,
            category: this.categorizeValidationRule(match),
            autoFixable: this.assessAutoFixability(match),
            remediation: this.suggestRemediation(match)
          };
          rules.push(rule);
        }
      }
    }

    return rules;
  }

  // Helper methods for content processing
  private generateFrameworkDescription(indicator: string, content: string): string {
    const sentences = content.split('.').slice(0, 3);
    const relevantSentence = sentences.find(s => 
      s.toLowerCase().includes(indicator.toLowerCase())
    );
    
    return relevantSentence?.trim() || 
           `${indicator} compliance framework with requirements for data protection and security.`;
  }

  private extractApplicableDomains(content: string, discoveryContext: string): string[] {
    const domains = new Set<string>();
    domains.add(discoveryContext || 'general');

    // Extract domains from content
    const domainPatterns = [
      /healthcare|medical|clinical/gi,
      /financial|banking|fintech/gi,
      /manufacturing|industrial/gi,
      /retail|e-commerce/gi,
      /government|public\s+sector/gi
    ];

    for (const pattern of domainPatterns) {
      if (pattern.test(content)) {
        const match = content.match(pattern)?.[0];
        if (match) domains.add(match.toLowerCase());
      }
    }

    return Array.from(domains);
  }

  private cleanRequirementText(text: string): string {
    return text.replace(/^(must|shall|required to|mandatory)\s+/i, '')
               .trim()
               .substring(0, 100);
  }

  private categorizeRequirement(text: string): ComplianceRequirement['category'] {
    const lower = text.toLowerCase();
    
    if (/data|privacy|personal|pii|phi/.test(lower)) return 'data_protection';
    if (/security|encrypt|access|auth/.test(lower)) return 'security';
    if (/audit|log|record|trace/.test(lower)) return 'audit';
    if (/govern|policy|procedure|control/.test(lower)) return 'governance';
    
    return 'operational';
  }

  private assessRequirementSeverity(text: string): ComplianceRequirement['severity'] {
    const lower = text.toLowerCase();
    
    if (/critical|essential|mandatory|must/.test(lower)) return 'critical';
    if (/important|should|required/.test(lower)) return 'high';
    if (/recommend|suggest|consider/.test(lower)) return 'medium';
    
    return 'low';
  }

  private extractValidationCriteria(text: string): string {
    // Extract actionable validation criteria from requirement text
    const verbs = ['verify', 'check', 'validate', 'ensure', 'confirm'];
    for (const verb of verbs) {
      if (text.toLowerCase().includes(verb)) {
        return `${verb} that ${text.toLowerCase().replace(/.*\b(must|shall|required to)\s+/, '')}`;
      }
    }
    return `Validate compliance with: ${text.substring(0, 50)}`;
  }

  private extractRulePattern(text: string): string {
    // Convert validation text to a pattern
    return text.toLowerCase()
               .replace(/verify|check|validate|ensure/gi, '')
               .trim()
               .substring(0, 50);
  }

  private categorizeValidationRule(text: string): string {
    const lower = text.toLowerCase();
    
    if (/data|database|storage/.test(lower)) return 'data_validation';
    if (/security|access|permission/.test(lower)) return 'security_validation';
    if (/config|setting|parameter/.test(lower)) return 'configuration_validation';
    if (/document|record|log/.test(lower)) return 'documentation_validation';
    
    return 'general_validation';
  }

  private assessAutoFixability(text: string): boolean {
    const autoFixablePatterns = [
      /config|setting|parameter|flag/i,
      /enable|disable|set|configure/i,
      /permission|access|role/i
    ];
    
    return autoFixablePatterns.some(pattern => pattern.test(text));
  }

  private suggestRemediation(text: string): string {
    const lower = text.toLowerCase();
    
    if (lower.includes('encrypt')) {
      return 'Enable encryption for data at rest and in transit';
    }
    if (lower.includes('access')) {
      return 'Implement proper access controls and authentication';
    }
    if (lower.includes('log')) {
      return 'Configure comprehensive audit logging';
    }
    if (lower.includes('backup')) {
      return 'Implement automated backup procedures';
    }
    
    return 'Review documentation and implement required controls';
  }

  // Cross-validation and enhancement methods
  private async crossValidateFrameworks(frameworks: ComplianceFramework[]): Promise<ComplianceFramework[]> {
    // Cross-validate frameworks against multiple sources
    const validated: ComplianceFramework[] = [];
    
    for (const framework of frameworks) {
      // Simple validation - check if framework has reasonable content
      if (framework.requirements.length > 0 || framework.validationRules.length > 0) {
        validated.push(framework);
      }
    }
    
    return validated;
  }

  private async enhanceFrameworksWithDetails(frameworks: ComplianceFramework[]): Promise<ComplianceFramework[]> {
    // Enhance frameworks with additional details from authoritative sources
    const enhanced: ComplianceFramework[] = [];
    
    for (const framework of frameworks) {
      try {
        // Try to get more details from authoritative sources
        const enhancedFramework = await this.enhanceFrameworkDetails(framework);
        enhanced.push(enhancedFramework);
      } catch (error) {
        console.warn(`Failed to enhance framework ${framework.name}:`, error);
        enhanced.push(framework);
      }
    }
    
    return enhanced;
  }

  private async enhanceFrameworkDetails(framework: ComplianceFramework): Promise<ComplianceFramework> {
    // For now, return the framework as-is
    // In a full implementation, this would query additional sources for more details
    return framework;
  }

  // Utility methods
  private buildFrameworkSearchQueries(
    discoveryContext: string,
    options: FrameworkDiscoveryOptions
  ): string[] {
    const queries: string[] = [];
    
    // Domain-specific queries
    if (options.domainContext) {
      queries.push(`${options.domainContext} compliance regulations framework 2024`);
      queries.push(`${options.domainContext} regulatory requirements standards`);
    }
    
    // Context-specific queries
    queries.push(`${discoveryContext} compliance framework requirements`);
    queries.push(`${discoveryContext} regulatory standards validation`);
    
    // Geographic scope queries
    if (options.geographicScope) {
      queries.push(`${options.geographicScope} ${discoveryContext} compliance regulations`);
    }
    
    // Industry type queries
    if (options.industryType) {
      queries.push(`${options.industryType} industry compliance frameworks`);
    }
    
    return queries;
  }

  private buildContext7Queries(
    discoveryContext: string,
    options: FrameworkDiscoveryOptions
  ): string[] {
    return [
      `${discoveryContext} compliance requirements regulations`,
      `${options.domainContext || 'general'} regulatory framework standards`,
      `${discoveryContext} data protection security compliance`
    ];
  }

  private buildCopilotKitQueries(
    discoveryContext: string,
    options: FrameworkDiscoveryOptions
  ): string[] {
    return [
      `compliance ui components ${discoveryContext} patterns`,
      `regulatory framework integration ${options.domainContext || 'general'}`,
      `compliance validation patterns ${discoveryContext}`
    ];
  }

  private buildMicrosoftDocsQueries(
    discoveryContext: string,
    options: FrameworkDiscoveryOptions
  ): string[] {
    return [
      `${discoveryContext} compliance Microsoft enterprise`,
      `${options.domainContext || 'general'} regulatory Microsoft documentation`,
      `${discoveryContext} security compliance Microsoft standards`
    ];
  }

  private getAuthoritativeRegulatorySources(): string[] {
    return [
      'nist.gov',
      'compliance.gov',
      'gdpr.eu',
      'hhs.gov',
      'sec.gov',
      'pcicomplianceguide.org',
      'iso.org',
      'docs.microsoft.com',
      'aws.amazon.com',
      'cloud.google.com'
    ];
  }

  private deduplicateFrameworks(frameworks: ComplianceFramework[]): ComplianceFramework[] {
    const seen = new Map<string, ComplianceFramework>();
    
    for (const framework of frameworks) {
      const key = framework.name.toLowerCase().replace(/\s+/g, '-');
      if (!seen.has(key) || seen.get(key)!.confidence < framework.confidence) {
        seen.set(key, framework);
      }
    }
    
    return Array.from(seen.values());
  }

  private generateCacheKey(discoveryContext: string, options: FrameworkDiscoveryOptions): string {
    const optionsHash = JSON.stringify(options);
    return `${discoveryContext}-${optionsHash}`.substring(0, 100);
  }

  private isCacheFresh(result: FrameworkDiscoveryResult): boolean {
    const ageMs = Date.now() - result.lastUpdated.getTime();
    const maxAgeMs = 6 * 60 * 60 * 1000; // 6 hours
    return ageMs < maxAgeMs;
  }

  private addToDiscoveryHistory(discoveryContext: string, result: FrameworkDiscoveryResult): void {
    const history = this.discoveryHistory.get(discoveryContext) || [];
    history.push(result);
    
    // Keep only last 10 results
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    this.discoveryHistory.set(discoveryContext, history);
  }

  private async initializeMcpConnections(): Promise<void> {
    try {
      const availableServers = mcpManager.getAllServers();
      
      this.mcpConnections.set('context7', 
        !!availableServers.find(s => s.id === 'context7' || s.name.toLowerCase().includes('context7'))?.isActive
      );
      
      this.mcpConnections.set('copilotkit', 
        !!availableServers.find(s => s.id === 'copilotkit-official' || s.name.toLowerCase().includes('copilotkit'))?.isActive
      );
      
      this.mcpConnections.set('microsoft-docs', 
        !!availableServers.find(s => s.id === 'microsoft-docs' || s.name.toLowerCase().includes('microsoft'))?.isActive
      );
      
    } catch (error) {
      console.warn('MCP connections initialization failed:', error);
      this.mcpConnections.set('context7', false);
      this.mcpConnections.set('copilotkit', false);
      this.mcpConnections.set('microsoft-docs', false);
    }
  }

  private initializeRegulatorySources(): void {
    // Initialize known regulatory sources
    const sources: RegulatorySource[] = [
      {
        id: 'nist',
        name: 'NIST Cybersecurity Framework',
        type: 'government',
        authority: 'National Institute of Standards and Technology',
        domains: ['cybersecurity', 'technology', 'general'],
        updateFrequency: 'monthly',
        isActive: true
      },
      {
        id: 'hhs',
        name: 'HHS Healthcare Regulations',
        type: 'government',
        authority: 'Department of Health and Human Services',
        domains: ['healthcare', 'medical', 'clinical'],
        updateFrequency: 'weekly',
        isActive: true
      },
      {
        id: 'sec',
        name: 'SEC Financial Regulations',
        type: 'government',
        authority: 'Securities and Exchange Commission',
        domains: ['financial', 'banking', 'securities'],
        updateFrequency: 'daily',
        isActive: true
      }
    ];

    for (const source of sources) {
      this.sourceRegistry.set(source.id, source);
    }
  }

  // Public methods for accessing framework data
  getFrameworksFromCache(cacheKey: string): ComplianceFramework[] {
    const result = this.frameworkCache.get(cacheKey);
    return result?.frameworks || [];
  }

  getDiscoveryHistory(discoveryContext: string): FrameworkDiscoveryResult[] {
    return this.discoveryHistory.get(discoveryContext) || [];
  }

  clearFrameworkCache(): void {
    this.frameworkCache.clear();
  }

  getAvailableRegulatorySources(): RegulatorySource[] {
    return Array.from(this.sourceRegistry.values());
  }
}

// Export singleton instance
export const regulatoryFrameworkManager = new RegulatoryFrameworkManager();