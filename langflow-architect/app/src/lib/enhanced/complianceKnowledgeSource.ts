// Compliance Knowledge Source - Epic 6.4.2 Implementation
// MCP + web search integration for dynamic regulatory knowledge acquisition
// Zero hardcoded compliance data - fully dynamic knowledge discovery

import { mcpManager } from './mcpManager';
import { searchManager } from './searchManager';
import type { ComplianceFramework, ComplianceRequirement } from './complianceIntelligenceSystem';

// Knowledge source interfaces
export interface ComplianceKnowledgeQuery {
  domain: string;
  regulatoryContext: string[];
  geographicScope?: string;
  industryType?: string;
  dataTypes?: string[];
  businessOperations?: string[];
  timeframe: 'current' | 'recent' | 'historical';
  sources: KnowledgeSourceType[];
}

export interface KnowledgeSourceType {
  type: 'mcp' | 'web_search' | 'regulatory_api' | 'documentation';
  priority: number;
  filters?: string[];
  timeout?: number;
}

export interface ComplianceKnowledgeResult {
  frameworks: DiscoveredFramework[];
  requirements: DiscoveredRequirement[];
  sources: KnowledgeSource[];
  confidence: number;
  coverage: number; // 0-1, how comprehensive the knowledge is
  freshness: Date;
  queryTime: number;
  gaps: KnowledgeGap[];
}

export interface DiscoveredFramework {
  id: string;
  name: string;
  description: string;
  authority: string;
  scope: FrameworkScope;
  version?: string;
  effectiveDate?: Date;
  lastUpdated: Date;
  source: KnowledgeSource;
  confidence: number;
  applicability: FrameworkApplicability;
  relationships: FrameworkRelationship[];
}

export interface DiscoveredRequirement {
  id: string;
  frameworkId: string;
  title: string;
  description: string;
  category: RequirementCategory;
  severity: RequirementSeverity;
  mandatory: boolean;
  applicableContexts: string[];
  validationCriteria: ValidationCriterion[];
  exemptions?: RequirementExemption[];
  implementationGuidance: ImplementationGuidance[];
  source: KnowledgeSource;
  confidence: number;
  lastVerified: Date;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'mcp_server' | 'government_site' | 'standards_body' | 'industry_org' | 'documentation';
  url?: string;
  authority: string;
  reliability: number; // 0-1
  updateFrequency: 'realtime' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  lastAccessed: Date;
  responseTime: number;
}

export interface FrameworkScope {
  geographic: string[];
  industries: string[];
  dataTypes: string[];
  organizationSizes: string[];
  businessFunctions: string[];
}

export interface FrameworkApplicability {
  score: number; // 0-1
  factors: ApplicabilityFactor[];
  exclusions: string[];
  prerequisites: string[];
}

export interface ApplicabilityFactor {
  factor: string;
  weight: number;
  present: boolean;
  confidence: number;
}

export interface FrameworkRelationship {
  relatedFrameworkId: string;
  relationshipType: 'supersedes' | 'complements' | 'conflicts' | 'references';
  description: string;
}

export interface RequirementCategory {
  primary: 'data_protection' | 'security' | 'audit' | 'governance' | 'operational' | 'technical';
  secondary?: string[];
}

export interface RequirementSeverity {
  level: 'critical' | 'high' | 'medium' | 'low';
  justification: string;
  factors: string[];
}

export interface ValidationCriterion {
  id: string;
  description: string;
  method: 'automated' | 'manual' | 'documentation' | 'process';
  frequency: 'continuous' | 'periodic' | 'event_based';
  evidence: string[];
}

export interface RequirementExemption {
  condition: string;
  scope: string;
  authority: string;
  documentation: string[];
}

export interface ImplementationGuidance {
  type: 'technical' | 'procedural' | 'documentation' | 'training';
  description: string;
  resources: string[];
  estimatedEffort: string;
  dependencies: string[];
}

export interface KnowledgeGap {
  area: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggestedSources: string[];
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

// Compliance Knowledge Source - implements dynamic knowledge acquisition
export class ComplianceKnowledgeSource {
  private knowledgeCache: Map<string, ComplianceKnowledgeResult> = new Map();
  private sourceRegistry: Map<string, KnowledgeSource> = new Map();
  private frameworkRelationships: Map<string, FrameworkRelationship[]> = new Map();
  private queryHistory: Map<string, ComplianceKnowledgeQuery[]> = new Map();
  private performanceMetrics: Map<string, number> = new Map();

  constructor() {
    this.initializeKnowledgeSources();
    this.initializePerformanceTracking();
  }

  // Primary knowledge acquisition method
  async acquireComplianceKnowledge(
    query: ComplianceKnowledgeQuery
  ): Promise<ComplianceKnowledgeResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(query);

    // Check cache first
    const cached = this.knowledgeCache.get(cacheKey);
    if (cached && this.isKnowledgeFresh(cached, query.timeframe)) {
      this.updatePerformanceMetrics('cache_hit');
      return cached;
    }

    this.updatePerformanceMetrics('cache_miss');

    const frameworks: DiscoveredFramework[] = [];
    const requirements: DiscoveredRequirement[] = [];
    const sources: KnowledgeSource[] = [];
    const gaps: KnowledgeGap[] = [];

    try {
      // Step 1: Query MCP servers for authoritative regulatory knowledge
      const mcpResults = await this.queryMcpServersForCompliance(query);
      frameworks.push(...mcpResults.frameworks);
      requirements.push(...mcpResults.requirements);
      sources.push(...mcpResults.sources);

      // Step 2: Query web sources for current regulatory information
      const webResults = await this.queryWebSourcesForCompliance(query);
      frameworks.push(...webResults.frameworks);
      requirements.push(...webResults.requirements);
      sources.push(...webResults.sources);

      // Step 3: Cross-validate and enrich discovered knowledge
      const validatedFrameworks = await this.crossValidateFrameworks(frameworks);
      const enrichedRequirements = await this.enrichRequirements(requirements, validatedFrameworks);

      // Step 4: Identify knowledge gaps
      const identifiedGaps = await this.identifyKnowledgeGaps(query, validatedFrameworks, enrichedRequirements);

      // Step 5: Calculate confidence and coverage metrics
      const confidence = this.calculateOverallConfidence(validatedFrameworks, enrichedRequirements);
      const coverage = this.calculateKnowledgeCoverage(query, validatedFrameworks, enrichedRequirements);

      const result: ComplianceKnowledgeResult = {
        frameworks: validatedFrameworks,
        requirements: enrichedRequirements,
        sources: [...new Set(sources)],
        confidence,
        coverage,
        freshness: new Date(),
        queryTime: Date.now() - startTime,
        gaps: identifiedGaps
      };

      // Cache the result
      this.knowledgeCache.set(cacheKey, result);
      
      // Store query in history
      this.addToQueryHistory(query);

      return result;

    } catch (error) {
      console.warn('Compliance knowledge acquisition failed:', error);
      
      return this.generateErrorKnowledgeResult(error, Date.now() - startTime);
    }
  }

  // Query MCP servers for compliance knowledge
  private async queryMcpServersForCompliance(
    query: ComplianceKnowledgeQuery
  ): Promise<{
    frameworks: DiscoveredFramework[];
    requirements: DiscoveredRequirement[];
    sources: KnowledgeSource[];
  }> {
    const frameworks: DiscoveredFramework[] = [];
    const requirements: DiscoveredRequirement[] = [];
    const sources: KnowledgeSource[] = [];

    // Context7 MCP for regulatory knowledge
    const context7Results = await this.queryContext7ForCompliance(query);
    if (context7Results) {
      frameworks.push(...context7Results.frameworks);
      requirements.push(...context7Results.requirements);
      sources.push(...context7Results.sources);
    }

    // CopilotKit MCP for compliance UI and patterns
    const copilotKitResults = await this.queryCopilotKitForCompliance(query);
    if (copilotKitResults) {
      frameworks.push(...copilotKitResults.frameworks);
      requirements.push(...copilotKitResults.requirements);
      sources.push(...copilotKitResults.sources);
    }

    // Microsoft Docs MCP for enterprise compliance
    const msDocsResults = await this.queryMicrosoftDocsForCompliance(query);
    if (msDocsResults) {
      frameworks.push(...msDocsResults.frameworks);
      requirements.push(...msDocsResults.requirements);
      sources.push(...msDocsResults.sources);
    }

    return { frameworks, requirements, sources };
  }

  // Query Context7 MCP for regulatory knowledge
  private async queryContext7ForCompliance(
    query: ComplianceKnowledgeQuery
  ): Promise<{
    frameworks: DiscoveredFramework[];
    requirements: DiscoveredRequirement[];
    sources: KnowledgeSource[];
  } | null> {
    try {
      const queries = this.buildContext7Queries(query);
      const frameworks: DiscoveredFramework[] = [];
      const requirements: DiscoveredRequirement[] = [];
      
      const context7Source: KnowledgeSource = {
        id: 'context7-mcp',
        name: 'Context7 Regulatory Knowledge',
        type: 'mcp_server',
        authority: 'Context7 MCP Server',
        reliability: 0.85,
        updateFrequency: 'daily',
        lastAccessed: new Date(),
        responseTime: 0
      };

      for (const searchQuery of queries) {
        const startTime = Date.now();
        
        const result = await mcpManager.queryServers(searchQuery, 'compliance', {
          timeout: 5000
        });

        context7Source.responseTime = Date.now() - startTime;

        if (result.success && result.results.length > 0) {
          const extracted = await this.extractKnowledgeFromMcpResults(
            result.results,
            context7Source,
            query
          );
          frameworks.push(...extracted.frameworks);
          requirements.push(...extracted.requirements);
        }
      }

      return {
        frameworks,
        requirements,
        sources: frameworks.length > 0 || requirements.length > 0 ? [context7Source] : []
      };

    } catch (error) {
      console.warn('Context7 compliance query failed:', error);
      return null;
    }
  }

  // Query CopilotKit MCP for compliance patterns
  private async queryCopilotKitForCompliance(
    query: ComplianceKnowledgeQuery
  ): Promise<{
    frameworks: DiscoveredFramework[];
    requirements: DiscoveredRequirement[];
    sources: KnowledgeSource[];
  } | null> {
    try {
      const queries = this.buildCopilotKitQueries(query);
      const frameworks: DiscoveredFramework[] = [];
      const requirements: DiscoveredRequirement[] = [];
      
      const copilotKitSource: KnowledgeSource = {
        id: 'copilotkit-mcp',
        name: 'CopilotKit Compliance Patterns',
        type: 'mcp_server',
        authority: 'CopilotKit MCP Server',
        reliability: 0.8,
        updateFrequency: 'weekly',
        lastAccessed: new Date(),
        responseTime: 0
      };

      for (const searchQuery of queries) {
        const startTime = Date.now();
        
        const result = await mcpManager.queryServers(searchQuery, 'general', {
          timeout: 4000
        });

        copilotKitSource.responseTime = Date.now() - startTime;

        if (result.success && result.results.length > 0) {
          const extracted = await this.extractKnowledgeFromMcpResults(
            result.results,
            copilotKitSource,
            query
          );
          frameworks.push(...extracted.frameworks);
          requirements.push(...extracted.requirements);
        }
      }

      return {
        frameworks,
        requirements,
        sources: frameworks.length > 0 || requirements.length > 0 ? [copilotKitSource] : []
      };

    } catch (error) {
      console.warn('CopilotKit compliance query failed:', error);
      return null;
    }
  }

  // Query Microsoft Docs MCP for enterprise compliance
  private async queryMicrosoftDocsForCompliance(
    query: ComplianceKnowledgeQuery
  ): Promise<{
    frameworks: DiscoveredFramework[];
    requirements: DiscoveredRequirement[];
    sources: KnowledgeSource[];
  } | null> {
    try {
      const queries = this.buildMicrosoftDocsQueries(query);
      const frameworks: DiscoveredFramework[] = [];
      const requirements: DiscoveredRequirement[] = [];
      
      const msDocsSource: KnowledgeSource = {
        id: 'microsoft-docs-mcp',
        name: 'Microsoft Documentation',
        type: 'mcp_server',
        authority: 'Microsoft Corporation',
        reliability: 0.9,
        updateFrequency: 'weekly',
        lastAccessed: new Date(),
        responseTime: 0
      };

      for (const searchQuery of queries) {
        const startTime = Date.now();
        
        const result = await mcpManager.queryServers(searchQuery, 'general', {
          timeout: 4000
        });

        msDocsSource.responseTime = Date.now() - startTime;

        if (result.success && result.results.length > 0) {
          const extracted = await this.extractKnowledgeFromMcpResults(
            result.results,
            msDocsSource,
            query
          );
          frameworks.push(...extracted.frameworks);
          requirements.push(...extracted.requirements);
        }
      }

      return {
        frameworks,
        requirements,
        sources: frameworks.length > 0 || requirements.length > 0 ? [msDocsSource] : []
      };

    } catch (error) {
      console.warn('Microsoft Docs compliance query failed:', error);
      return null;
    }
  }

  // Query web sources for compliance knowledge
  private async queryWebSourcesForCompliance(
    query: ComplianceKnowledgeQuery
  ): Promise<{
    frameworks: DiscoveredFramework[];
    requirements: DiscoveredRequirement[];
    sources: KnowledgeSource[];
  }> {
    const frameworks: DiscoveredFramework[] = [];
    const requirements: DiscoveredRequirement[] = [];
    const sources: KnowledgeSource[] = [];

    try {
      const searchQueries = this.buildWebSearchQueries(query);
      
      for (const searchQuery of searchQueries) {
        const startTime = Date.now();
        
        const searchResults = await searchManager.search(searchQuery, {
          maxResults: 8,
          domainFilter: this.getAuthoritativeComplianceSources(),
          timeRange: query.timeframe === 'current' ? 'month' : 'year'
        });

        if (searchResults.results.length > 0) {
          const extracted = await this.extractKnowledgeFromSearchResults(
            searchResults.results,
            query,
            Date.now() - startTime
          );
          frameworks.push(...extracted.frameworks);
          requirements.push(...extracted.requirements);
          sources.push(...extracted.sources);
        }
      }

      return { frameworks, requirements, sources };

    } catch (error) {
      console.warn('Web search compliance query failed:', error);
      return { frameworks: [], requirements: [], sources: [] };
    }
  }

  // Extract knowledge from MCP query results
  private async extractKnowledgeFromMcpResults(
    results: McpQueryResult[],
    source: KnowledgeSource,
    query: ComplianceKnowledgeQuery
  ): Promise<{
    frameworks: DiscoveredFramework[];
    requirements: DiscoveredRequirement[];
  }> {
    const frameworks: DiscoveredFramework[] = [];
    const requirements: DiscoveredRequirement[] = [];

    for (const result of results) {
      const content = result.content;
      
      // Extract framework information
      const extractedFrameworks = await this.extractFrameworksFromContent(content, source, query);
      frameworks.push(...extractedFrameworks);
      
      // Extract requirements information
      const extractedRequirements = await this.extractRequirementsFromContent(content, source, query);
      requirements.push(...extractedRequirements);
    }

    return { frameworks, requirements };
  }

  // Extract frameworks from content
  private async extractFrameworksFromContent(
    content: string,
    source: KnowledgeSource,
    query: ComplianceKnowledgeQuery
  ): Promise<DiscoveredFramework[]> {
    const frameworks: DiscoveredFramework[] = [];
    const lowerContent = content.toLowerCase();

    // Detect framework indicators
    const frameworkPatterns = [
      { pattern: /\b(gdpr|general data protection regulation)\b/gi, name: 'GDPR' },
      { pattern: /\b(hipaa|health insurance portability)\b/gi, name: 'HIPAA' },
      { pattern: /\b(sox|sarbanes.?oxley)\b/gi, name: 'SOX' },
      { pattern: /\b(pci.?dss|payment card industry)\b/gi, name: 'PCI-DSS' },
      { pattern: /\b(nist|national institute of standards)\b/gi, name: 'NIST Cybersecurity Framework' },
      { pattern: /\b(iso.?27001|information security management)\b/gi, name: 'ISO 27001' },
      { pattern: /\b(fda|food and drug administration)\b/gi, name: 'FDA Regulations' },
      { pattern: /\b(fisma|federal information security)\b/gi, name: 'FISMA' },
      { pattern: /\b(ccpa|california consumer privacy)\b/gi, name: 'CCPA' }
    ];

    for (const { pattern, name } of frameworkPatterns) {
      if (pattern.test(content)) {
        const framework = await this.buildFrameworkFromContent(
          name,
          content,
          source,
          query
        );
        if (framework) {
          frameworks.push(framework);
        }
      }
    }

    return frameworks;
  }

  // Build framework object from content
  private async buildFrameworkFromContent(
    name: string,
    content: string,
    source: KnowledgeSource,
    query: ComplianceKnowledgeQuery
  ): Promise<DiscoveredFramework | null> {
    try {
      const id = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      
      const framework: DiscoveredFramework = {
        id,
        name,
        description: this.extractDescription(content, name),
        authority: this.extractAuthority(content, name),
        scope: this.extractFrameworkScope(content, query),
        lastUpdated: new Date(),
        source,
        confidence: this.calculateFrameworkConfidence(content, name, source),
        applicability: await this.calculateFrameworkApplicability(content, query),
        relationships: []
      };

      // Extract version and effective date if available
      const version = this.extractVersion(content);
      if (version) framework.version = version;
      
      const effectiveDate = this.extractEffectiveDate(content);
      if (effectiveDate) framework.effectiveDate = effectiveDate;

      return framework;

    } catch (error) {
      console.warn(`Failed to build framework ${name} from content:`, error);
      return null;
    }
  }

  // Extract requirements from content
  private async extractRequirementsFromContent(
    content: string,
    source: KnowledgeSource,
    query: ComplianceKnowledgeQuery
  ): Promise<DiscoveredRequirement[]> {
    const requirements: DiscoveredRequirement[] = [];

    // Extract requirement patterns
    const requirementPatterns = [
      /must\s+([^.!?]+[.!?])/gi,
      /shall\s+([^.!?]+[.!?])/gi,
      /required\s+to\s+([^.!?]+[.!?])/gi,
      /mandatory\s+([^.!?]+[.!?])/gi,
      /obligation\s+to\s+([^.!?]+[.!?])/gi
    ];

    for (const pattern of requirementPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches.slice(0, 5)) { // Limit to 5 per pattern
          const requirement = await this.buildRequirementFromMatch(
            match,
            source,
            query,
            requirements.length
          );
          if (requirement) {
            requirements.push(requirement);
          }
        }
      }
    }

    return requirements;
  }

  // Build requirement object from matched text
  private async buildRequirementFromMatch(
    match: string,
    source: KnowledgeSource,
    query: ComplianceKnowledgeQuery,
    index: number
  ): Promise<DiscoveredRequirement | null> {
    try {
      const cleanText = match.trim();
      const id = `req-${source.id}-${index + 1}`;
      
      const requirement: DiscoveredRequirement = {
        id,
        frameworkId: `framework-${source.id}`,
        title: this.extractRequirementTitle(cleanText),
        description: cleanText,
        category: this.categorizeRequirement(cleanText),
        severity: this.assessRequirementSeverity(cleanText),
        mandatory: this.isMandatoryRequirement(cleanText),
        applicableContexts: this.extractApplicableContexts(cleanText, query),
        validationCriteria: await this.extractValidationCriteria(cleanText),
        implementationGuidance: await this.extractImplementationGuidance(cleanText),
        source,
        confidence: this.calculateRequirementConfidence(cleanText, source),
        lastVerified: new Date()
      };

      // Extract exemptions if available
      const exemptions = this.extractExemptions(cleanText);
      if (exemptions.length > 0) {
        requirement.exemptions = exemptions;
      }

      return requirement;

    } catch (error) {
      console.warn(`Failed to build requirement from match "${match}":`, error);
      return null;
    }
  }

  // Extract knowledge from web search results
  private async extractKnowledgeFromSearchResults(
    results: SearchResult[],
    query: ComplianceKnowledgeQuery,
    responseTime: number
  ): Promise<{
    frameworks: DiscoveredFramework[];
    requirements: DiscoveredRequirement[];
    sources: KnowledgeSource[];
  }> {
    const frameworks: DiscoveredFramework[] = [];
    const requirements: DiscoveredRequirement[] = [];
    const sources: KnowledgeSource[] = [];

    for (const result of results) {
      const source: KnowledgeSource = {
        id: `web-${result.domain}-${Date.now()}`,
        name: result.domain,
        type: this.classifyWebSourceType(result.domain),
        url: result.url,
        authority: this.determineWebSourceAuthority(result.domain),
        reliability: this.calculateWebSourceReliability(result.domain),
        updateFrequency: this.estimateUpdateFrequency(result.domain),
        lastAccessed: new Date(),
        responseTime
      };

      const content = `${result.title} ${result.snippet}`;
      
      // Extract frameworks and requirements
      const extractedFrameworks = await this.extractFrameworksFromContent(content, source, query);
      const extractedRequirements = await this.extractRequirementsFromContent(content, source, query);

      if (extractedFrameworks.length > 0 || extractedRequirements.length > 0) {
        frameworks.push(...extractedFrameworks);
        requirements.push(...extractedRequirements);
        sources.push(source);
      }
    }

    return { frameworks, requirements, sources };
  }

  // Helper methods for content extraction
  private extractDescription(content: string, frameworkName: string): string {
    const sentences = content.split('.').filter(s => 
      s.toLowerCase().includes(frameworkName.toLowerCase())
    );
    
    const relevantSentence = sentences.find(s => s.length > 20 && s.length < 200);
    return relevantSentence?.trim() || 
           `${frameworkName} is a compliance framework for regulatory requirements.`;
  }

  private extractAuthority(content: string, frameworkName: string): string {
    const authorityPatterns = [
      /issued by ([^.]+)/i,
      /published by ([^.]+)/i,
      /enforced by ([^.]+)/i,
      /regulated by ([^.]+)/i
    ];

    for (const pattern of authorityPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Default authorities for known frameworks
    const knownAuthorities: Record<string, string> = {
      'GDPR': 'European Union',
      'HIPAA': 'U.S. Department of Health and Human Services',
      'SOX': 'U.S. Securities and Exchange Commission',
      'PCI-DSS': 'PCI Security Standards Council',
      'NIST Cybersecurity Framework': 'National Institute of Standards and Technology',
      'ISO 27001': 'International Organization for Standardization',
      'FDA Regulations': 'U.S. Food and Drug Administration',
      'FISMA': 'U.S. Government',
      'CCPA': 'State of California'
    };

    return knownAuthorities[frameworkName] || 'Unknown Authority';
  }

  private extractFrameworkScope(content: string, query: ComplianceKnowledgeQuery): FrameworkScope {
    return {
      geographic: this.extractGeographicScope(content),
      industries: this.extractIndustryScope(content),
      dataTypes: this.extractDataTypeScope(content),
      organizationSizes: this.extractOrganizationSizeScope(content),
      businessFunctions: this.extractBusinessFunctionScope(content)
    };
  }

  private extractGeographicScope(content: string): string[] {
    const geographic: string[] = [];
    const geoPatterns = [
      /\b(european union|eu|europe)\b/gi,
      /\b(united states|usa|us|america)\b/gi,
      /\b(california|ca)\b/gi,
      /\b(global|worldwide|international)\b/gi,
      /\b(canada|uk|united kingdom|australia|japan)\b/gi
    ];

    for (const pattern of geoPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        geographic.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return [...new Set(geographic)];
  }

  private extractIndustryScope(content: string): string[] {
    const industries: string[] = [];
    const industryPatterns = [
      /\b(healthcare|medical|clinical|hospital)\b/gi,
      /\b(financial|banking|fintech|finance)\b/gi,
      /\b(manufacturing|industrial|automotive)\b/gi,
      /\b(retail|e-commerce|consumer)\b/gi,
      /\b(technology|software|it|tech)\b/gi,
      /\b(government|public sector|federal)\b/gi
    ];

    for (const pattern of industryPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        industries.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return [...new Set(industries)];
  }

  private extractDataTypeScope(content: string): string[] {
    const dataTypes: string[] = [];
    const dataPatterns = [
      /\b(personal data|pii|personal information)\b/gi,
      /\b(health data|phi|medical data)\b/gi,
      /\b(financial data|payment data|credit card)\b/gi,
      /\b(biometric data|genetic data)\b/gi,
      /\b(sensitive data|confidential data)\b/gi
    ];

    for (const pattern of dataPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        dataTypes.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return [...new Set(dataTypes)];
  }

  private extractOrganizationSizeScope(content: string): string[] {
    const sizes: string[] = [];
    const sizePatterns = [
      /\b(small business|sme|startup)\b/gi,
      /\b(medium enterprise|mid-size)\b/gi,
      /\b(large enterprise|corporation)\b/gi,
      /\b(multinational|global organization)\b/gi
    ];

    for (const pattern of sizePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        sizes.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return [...new Set(sizes)];
  }

  private extractBusinessFunctionScope(content: string): string[] {
    const functions: string[] = [];
    const functionPatterns = [
      /\b(data processing|data collection)\b/gi,
      /\b(payment processing|financial services)\b/gi,
      /\b(user authentication|access control)\b/gi,
      /\b(data storage|data transmission)\b/gi,
      /\b(audit|monitoring|compliance)\b/gi
    ];

    for (const pattern of functionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        functions.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return [...new Set(functions)];
  }

  private async calculateFrameworkApplicability(
    content: string,
    query: ComplianceKnowledgeQuery
  ): Promise<FrameworkApplicability> {
    const factors: ApplicabilityFactor[] = [];
    let score = 0;

    // Domain relevance
    const domainRelevant = content.toLowerCase().includes(query.domain.toLowerCase());
    factors.push({
      factor: 'domain_relevance',
      weight: 0.3,
      present: domainRelevant,
      confidence: 0.8
    });
    if (domainRelevant) score += 0.3;

    // Geographic relevance
    if (query.geographicScope) {
      const geoRelevant = content.toLowerCase().includes(query.geographicScope.toLowerCase());
      factors.push({
        factor: 'geographic_relevance',
        weight: 0.2,
        present: geoRelevant,
        confidence: 0.7
      });
      if (geoRelevant) score += 0.2;
    }

    // Industry relevance
    if (query.industryType) {
      const industryRelevant = content.toLowerCase().includes(query.industryType.toLowerCase());
      factors.push({
        factor: 'industry_relevance',
        weight: 0.25,
        present: industryRelevant,
        confidence: 0.75
      });
      if (industryRelevant) score += 0.25;
    }

    // Data type relevance
    if (query.dataTypes && query.dataTypes.length > 0) {
      const dataTypeRelevant = query.dataTypes.some(dataType =>
        content.toLowerCase().includes(dataType.toLowerCase())
      );
      factors.push({
        factor: 'data_type_relevance',
        weight: 0.25,
        present: dataTypeRelevant,
        confidence: 0.8
      });
      if (dataTypeRelevant) score += 0.25;
    }

    return {
      score: Math.min(1, score),
      factors,
      exclusions: [],
      prerequisites: []
    };
  }

  // Additional helper methods would continue here...
  // Following the same pattern as above for consistency

  // Query building methods
  private buildContext7Queries(query: ComplianceKnowledgeQuery): string[] {
    return [
      `${query.domain} compliance regulations ${query.regulatoryContext.join(' ')}`,
      `${query.industryType || 'general'} regulatory requirements framework`,
      `${query.geographicScope || 'international'} ${query.domain} compliance standards`
    ];
  }

  private buildCopilotKitQueries(query: ComplianceKnowledgeQuery): string[] {
    return [
      `compliance ui components ${query.domain} patterns`,
      `regulatory framework integration ${query.industryType || 'general'}`,
      `compliance validation patterns ${query.regulatoryContext.join(' ')}`
    ];
  }

  private buildMicrosoftDocsQueries(query: ComplianceKnowledgeQuery): string[] {
    return [
      `${query.domain} compliance Microsoft enterprise`,
      `${query.industryType || 'general'} regulatory Microsoft documentation`,
      `${query.regulatoryContext.join(' ')} security compliance Microsoft standards`
    ];
  }

  private buildWebSearchQueries(query: ComplianceKnowledgeQuery): string[] {
    const queries: string[] = [];
    
    queries.push(`${query.domain} compliance regulations 2024`);
    
    if (query.industryType) {
      queries.push(`${query.industryType} industry compliance frameworks`);
    }
    
    if (query.geographicScope) {
      queries.push(`${query.geographicScope} ${query.domain} regulatory requirements`);
    }
    
    for (const context of query.regulatoryContext) {
      queries.push(`${context} compliance framework requirements`);
    }
    
    return queries;
  }

  // Classification and assessment methods
  private calculateFrameworkConfidence(content: string, name: string, source: KnowledgeSource): number {
    let confidence = source.reliability * 0.4; // Base confidence from source reliability
    
    // Boost confidence if framework name appears multiple times
    const nameOccurrences = (content.toLowerCase().match(new RegExp(name.toLowerCase(), 'g')) || []).length;
    confidence += Math.min(0.3, nameOccurrences * 0.1);
    
    // Boost confidence if content includes authoritative terms
    const authoritativeTerms = ['regulation', 'standard', 'requirement', 'compliance', 'mandatory'];
    const authTermCount = authoritativeTerms.filter(term => 
      content.toLowerCase().includes(term)
    ).length;
    confidence += Math.min(0.3, authTermCount * 0.06);
    
    return Math.min(1, confidence);
  }

  private calculateRequirementConfidence(text: string, source: KnowledgeSource): number {
    let confidence = source.reliability * 0.5;
    
    // Higher confidence for mandatory language
    if (/\b(must|shall|required|mandatory)\b/i.test(text)) {
      confidence += 0.3;
    }
    
    // Lower confidence for vague language
    if (/\b(should|may|consider|recommend)\b/i.test(text)) {
      confidence -= 0.1;
    }
    
    return Math.max(0.1, Math.min(1, confidence));
  }

  private classifyWebSourceType(domain: string): KnowledgeSource['type'] {
    if (domain.endsWith('.gov') || domain.endsWith('.mil')) return 'government_site';
    if (domain.includes('iso.org') || domain.includes('nist.gov')) return 'standards_body';
    if (domain.includes('docs.') || domain.includes('documentation')) return 'documentation';
    return 'industry_org';
  }

  private determineWebSourceAuthority(domain: string): string {
    const authorities: Record<string, string> = {
      'nist.gov': 'NIST',
      'hhs.gov': 'U.S. Department of Health and Human Services',
      'sec.gov': 'U.S. Securities and Exchange Commission',
      'gdpr.eu': 'European Union',
      'iso.org': 'International Organization for Standardization',
      'pcicomplianceguide.org': 'PCI Security Standards Council',
      'docs.microsoft.com': 'Microsoft Corporation'
    };
    
    return authorities[domain] || domain;
  }

  private calculateWebSourceReliability(domain: string): number {
    const reliabilityScores: Record<string, number> = {
      'nist.gov': 0.95,
      'hhs.gov': 0.9,
      'sec.gov': 0.9,
      'gdpr.eu': 0.85,
      'iso.org': 0.9,
      'docs.microsoft.com': 0.8
    };
    
    if (domain.endsWith('.gov')) return 0.85;
    if (domain.endsWith('.org')) return 0.7;
    
    return reliabilityScores[domain] || 0.6;
  }

  private estimateUpdateFrequency(domain: string): KnowledgeSource['updateFrequency'] {
    if (domain.endsWith('.gov')) return 'monthly';
    if (domain.includes('docs.')) return 'weekly';
    return 'monthly';
  }

  // Content processing helper methods
  private extractRequirementTitle(text: string): string {
    // Extract first 60 characters as title, removing leading modal verbs
    return text.replace(/^(must|shall|required to|mandatory)\s+/i, '')
               .trim()
               .substring(0, 60)
               .replace(/[.!?]+$/, '');
  }

  private categorizeRequirement(text: string): RequirementCategory {
    const lower = text.toLowerCase();
    
    if (/data|privacy|personal|pii|phi/.test(lower)) {
      return { primary: 'data_protection', secondary: ['privacy'] };
    }
    if (/security|encrypt|access|auth|permission/.test(lower)) {
      return { primary: 'security', secondary: ['access_control'] };
    }
    if (/audit|log|record|trace|monitor/.test(lower)) {
      return { primary: 'audit', secondary: ['logging'] };
    }
    if (/govern|policy|procedure|control|manage/.test(lower)) {
      return { primary: 'governance', secondary: ['policy'] };
    }
    if (/implement|configure|install|deploy/.test(lower)) {
      return { primary: 'technical', secondary: ['implementation'] };
    }
    
    return { primary: 'operational' };
  }

  private assessRequirementSeverity(text: string): RequirementSeverity {
    const lower = text.toLowerCase();
    
    if (/critical|essential|vital|mandatory|must/.test(lower)) {
      return {
        level: 'critical',
        justification: 'Contains mandatory language',
        factors: ['mandatory_language']
      };
    }
    if (/important|shall|required/.test(lower)) {
      return {
        level: 'high',
        justification: 'Contains requirement language',
        factors: ['requirement_language']
      };
    }
    if (/should|recommend|advise/.test(lower)) {
      return {
        level: 'medium',
        justification: 'Contains recommendation language',
        factors: ['recommendation_language']
      };
    }
    
    return {
      level: 'low',
      justification: 'No strong requirement indicators',
      factors: ['weak_language']
    };
  }

  private isMandatoryRequirement(text: string): boolean {
    return /\b(must|shall|required|mandatory|obligatory)\b/i.test(text);
  }

  private extractApplicableContexts(text: string, query: ComplianceKnowledgeQuery): string[] {
    const contexts = [query.domain];
    
    if (query.industryType) contexts.push(query.industryType);
    if (query.geographicScope) contexts.push(query.geographicScope);
    
    return contexts;
  }

  private async extractValidationCriteria(text: string): Promise<ValidationCriterion[]> {
    const criteria: ValidationCriterion[] = [];
    
    // Simple validation criterion extraction
    if (text.includes('verify') || text.includes('check')) {
      criteria.push({
        id: `vc-${Date.now()}`,
        description: `Verify: ${text.substring(0, 100)}`,
        method: 'manual',
        frequency: 'periodic',
        evidence: ['documentation', 'audit_report']
      });
    }
    
    return criteria;
  }

  private async extractImplementationGuidance(text: string): Promise<ImplementationGuidance[]> {
    const guidance: ImplementationGuidance[] = [];
    
    // Simple implementation guidance extraction
    if (text.includes('implement') || text.includes('configure')) {
      guidance.push({
        type: 'technical',
        description: `Implementation: ${text.substring(0, 150)}`,
        resources: [],
        estimatedEffort: 'medium',
        dependencies: []
      });
    }
    
    return guidance;
  }

  private extractExemptions(text: string): RequirementExemption[] {
    const exemptions: RequirementExemption[] = [];
    
    // Look for exemption language
    if (text.includes('except') || text.includes('unless') || text.includes('exemption')) {
      exemptions.push({
        condition: 'Specific exemption conditions apply',
        scope: 'Limited scope',
        authority: 'Regulatory authority',
        documentation: ['Exemption documentation required']
      });
    }
    
    return exemptions;
  }

  private extractVersion(content: string): string | undefined {
    const versionPattern = /version\s+(\d+(?:\.\d+)*)/i;
    const match = content.match(versionPattern);
    return match ? match[1] : undefined;
  }

  private extractEffectiveDate(content: string): Date | undefined {
    const datePattern = /effective\s+(?:date\s+)?(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/i;
    const match = content.match(datePattern);
    return match ? new Date(match[1]) : undefined;
  }

  // Cross-validation and enrichment methods
  private async crossValidateFrameworks(frameworks: DiscoveredFramework[]): Promise<DiscoveredFramework[]> {
    // Simple deduplication and validation
    const uniqueFrameworks = new Map<string, DiscoveredFramework>();
    
    for (const framework of frameworks) {
      const key = framework.name.toLowerCase().replace(/\s+/g, '-');
      const existing = uniqueFrameworks.get(key);
      
      if (!existing || existing.confidence < framework.confidence) {
        uniqueFrameworks.set(key, framework);
      }
    }
    
    return Array.from(uniqueFrameworks.values());
  }

  private async enrichRequirements(
    requirements: DiscoveredRequirement[],
    frameworks: DiscoveredFramework[]
  ): Promise<DiscoveredRequirement[]> {
    // Link requirements to frameworks and enrich with additional context
    for (const requirement of requirements) {
      const relatedFramework = frameworks.find(f => 
        f.source.id === requirement.source.id ||
        requirement.description.toLowerCase().includes(f.name.toLowerCase())
      );
      
      if (relatedFramework) {
        requirement.frameworkId = relatedFramework.id;
      }
    }
    
    return requirements;
  }

  private async identifyKnowledgeGaps(
    query: ComplianceKnowledgeQuery,
    frameworks: DiscoveredFramework[],
    requirements: DiscoveredRequirement[]
  ): Promise<KnowledgeGap[]> {
    const gaps: KnowledgeGap[] = [];
    
    // Identify missing coverage areas
    if (frameworks.length === 0) {
      gaps.push({
        area: 'Framework Discovery',
        description: 'No compliance frameworks discovered for the specified domain',
        impact: 'high',
        suggestedSources: ['Government regulatory sites', 'Industry standards bodies']
      });
    }
    
    if (requirements.length === 0) {
      gaps.push({
        area: 'Requirement Details',
        description: 'No specific compliance requirements found',
        impact: 'medium',
        suggestedSources: ['Regulatory documentation', 'Compliance guides']
      });
    }
    
    return gaps;
  }

  // Metrics and scoring methods
  private calculateOverallConfidence(
    frameworks: DiscoveredFramework[],
    requirements: DiscoveredRequirement[]
  ): number {
    if (frameworks.length === 0 && requirements.length === 0) return 0;
    
    const frameworkConfidence = frameworks.length > 0 ? 
      frameworks.reduce((sum, f) => sum + f.confidence, 0) / frameworks.length : 0;
    
    const requirementConfidence = requirements.length > 0 ?
      requirements.reduce((sum, r) => sum + r.confidence, 0) / requirements.length : 0;
    
    const totalItems = frameworks.length + requirements.length;
    const weightedConfidence = 
      (frameworkConfidence * frameworks.length + requirementConfidence * requirements.length) / totalItems;
    
    return Math.round(weightedConfidence * 100) / 100;
  }

  private calculateKnowledgeCoverage(
    query: ComplianceKnowledgeQuery,
    frameworks: DiscoveredFramework[],
    requirements: DiscoveredRequirement[]
  ): number {
    // Simple coverage calculation based on expected vs discovered knowledge
    let expectedElements = 2; // At least some frameworks and requirements expected
    
    if (query.regulatoryContext.length > 0) expectedElements += query.regulatoryContext.length;
    if (query.dataTypes && query.dataTypes.length > 0) expectedElements += query.dataTypes.length;
    
    const discoveredElements = frameworks.length + Math.min(requirements.length, 10);
    
    return Math.min(1, discoveredElements / expectedElements);
  }

  // Cache and utility methods
  private generateCacheKey(query: ComplianceKnowledgeQuery): string {
    const queryStr = JSON.stringify({
      domain: query.domain,
      regulatoryContext: query.regulatoryContext.sort(),
      geographicScope: query.geographicScope,
      industryType: query.industryType,
      timeframe: query.timeframe
    });
    
    return queryStr.substring(0, 100);
  }

  private isKnowledgeFresh(result: ComplianceKnowledgeResult, timeframe: string): boolean {
    const ageMs = Date.now() - result.freshness.getTime();
    const maxAge = timeframe === 'current' ? 2 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 2 hours or 24 hours
    
    return ageMs < maxAge;
  }

  private addToQueryHistory(query: ComplianceKnowledgeQuery): void {
    const history = this.queryHistory.get(query.domain) || [];
    history.push(query);
    
    // Keep only last 50 queries
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.queryHistory.set(query.domain, history);
  }

  private updatePerformanceMetrics(metric: string): void {
    const current = this.performanceMetrics.get(metric) || 0;
    this.performanceMetrics.set(metric, current + 1);
  }

  private generateErrorKnowledgeResult(error: unknown, queryTime: number): ComplianceKnowledgeResult {
    return {
      frameworks: [],
      requirements: [],
      sources: [],
      confidence: 0,
      coverage: 0,
      freshness: new Date(),
      queryTime,
      gaps: [{
        area: 'Knowledge Acquisition',
        description: `Knowledge acquisition failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        impact: 'high',
        suggestedSources: ['Manual research required']
      }]
    };
  }

  private getAuthoritativeComplianceSources(): string[] {
    return [
      'nist.gov',
      'hhs.gov',
      'sec.gov',
      'gdpr.eu',
      'iso.org',
      'pcicomplianceguide.org',
      'docs.microsoft.com',
      'aws.amazon.com',
      'cloud.google.com',
      'compliance.gov'
    ];
  }

  private initializeKnowledgeSources(): void {
    // Initialize known authoritative sources
    const defaultSources: KnowledgeSource[] = [
      {
        id: 'nist-cybersecurity',
        name: 'NIST Cybersecurity Framework',
        type: 'government_site',
        url: 'https://nist.gov',
        authority: 'National Institute of Standards and Technology',
        reliability: 0.95,
        updateFrequency: 'monthly',
        lastAccessed: new Date(),
        responseTime: 0
      },
      {
        id: 'gdpr-official',
        name: 'GDPR Official Site',
        type: 'government_site',
        url: 'https://gdpr.eu',
        authority: 'European Union',
        reliability: 0.9,
        updateFrequency: 'weekly',
        lastAccessed: new Date(),
        responseTime: 0
      }
    ];

    for (const source of defaultSources) {
      this.sourceRegistry.set(source.id, source);
    }
  }

  private initializePerformanceTracking(): void {
    this.performanceMetrics.set('cache_hit', 0);
    this.performanceMetrics.set('cache_miss', 0);
    this.performanceMetrics.set('mcp_queries', 0);
    this.performanceMetrics.set('web_searches', 0);
  }

  // Public methods for accessing knowledge data
  getKnowledgeFromCache(cacheKey: string): ComplianceKnowledgeResult | undefined {
    return this.knowledgeCache.get(cacheKey);
  }

  getQueryHistory(domain: string): ComplianceKnowledgeQuery[] {
    return this.queryHistory.get(domain) || [];
  }

  clearKnowledgeCache(): void {
    this.knowledgeCache.clear();
  }

  getPerformanceMetrics(): Record<string, number> {
    return Object.fromEntries(this.performanceMetrics);
  }

  getRegisteredSources(): KnowledgeSource[] {
    return Array.from(this.sourceRegistry.values());
  }
}

// Export singleton instance
export const complianceKnowledgeSource = new ComplianceKnowledgeSource();