// Contextual Enrichment - Epic 6.4.3 Story 1.2 Knowledge Integration Component
// Enriches questions with domain-specific knowledge using existing multiSourceKnowledge system

import { AdaptiveQuestion, QuestionType } from './questionTypes';
import { DomainContext, EnhancedDomainContext } from '../domainDetectionSystem';
import { QuestioningFeatureFlagsConfig } from '../featureFlags';

// Interface for external multiSourceKnowledge system
export interface MultiSourceKnowledgeSystem {
  queryMultipleSources(params: {
    query: string;
    includeWebSearch: boolean;
    includeMCPServers: boolean;
    maxResults: number;
  }): Promise<{
    results: Array<{
      content: string;
      source: string;
      score: number;
    }>;
  }>;
}

export interface QuestionEnrichmentRequest {
  baseQuestion: AdaptiveQuestion;
  domainContext: DomainContext | null;
  enhancedContext?: EnhancedDomainContext;
  includeExamples: boolean;
  includeBestPractices: boolean;
  includeAlternatives: boolean;
  maxEnrichmentTimeMs: number;
}

export interface QuestionEnrichmentResult {
  enrichedQuestion: AdaptiveQuestion;
  knowledgeUsed: EnrichmentKnowledge;
  enrichmentConfidence: number;
  processingTimeMs: number;
  fallbackUsed: boolean;
  sources: string[];
}

export interface EnrichmentKnowledge {
  domainSpecificExamples: string[];
  relevantBestPractices: string[];
  alternativeApproaches: string[];
  contextualHints: string[];
  performanceConsiderations: string[];
  securityGuidelines: string[];
}

export interface ContextualEnrichmentEngine {
  enrichQuestion(request: QuestionEnrichmentRequest): Promise<QuestionEnrichmentResult>;
  validateEnrichmentQuality(result: QuestionEnrichmentResult): boolean;
  getCachedEnrichment(questionId: string): QuestionEnrichmentResult | null;
  clearEnrichmentCache(): void;
}

/**
 * Contextual Question Enrichment Implementation
 * Integrates with existing multiSourceKnowledge system to enhance questions
 */
export class DynamicContextualEnrichment implements ContextualEnrichmentEngine {
  private readonly featureFlags: QuestioningFeatureFlagsConfig;
  private enrichmentCache: Map<string, QuestionEnrichmentResult>;
  private multiSourceKnowledge: MultiSourceKnowledgeSystem | null;
  private lastCacheCleanup: number;

  constructor(featureFlags: QuestioningFeatureFlagsConfig, multiSourceKnowledge?: MultiSourceKnowledgeSystem) {
    this.featureFlags = featureFlags;
    this.multiSourceKnowledge = multiSourceKnowledge || null;
    this.enrichmentCache = new Map();
    this.lastCacheCleanup = Date.now();
  }

  /**
   * Enrich question with domain-specific knowledge
   */
  async enrichQuestion(request: QuestionEnrichmentRequest): Promise<QuestionEnrichmentResult> {
    const startTime = Date.now();
    
    // Check feature flags
    if (!this.featureFlags.enableQuestionGeneration) {
      return this.createFallbackEnrichment(request, startTime);
    }

    // Check cache first
    const cacheKey = this.generateEnrichmentCacheKey(request);
    const cached = this.getCachedEnrichment(cacheKey);
    if (cached) {
      return {
        ...cached,
        processingTimeMs: Date.now() - startTime
      };
    }

    try {
      // Gather contextual knowledge
      const knowledge = await this.gatherContextualKnowledge(request);
      
      // Apply enrichment to question
      const enrichedQuestion = await this.applyEnrichmentToQuestion(request.baseQuestion, knowledge);
      
      const result: QuestionEnrichmentResult = {
        enrichedQuestion,
        knowledgeUsed: knowledge,
        enrichmentConfidence: this.calculateEnrichmentConfidence(knowledge, request),
        processingTimeMs: Date.now() - startTime,
        fallbackUsed: false,
        sources: this.extractKnowledgeSources(knowledge)
      };

      // Cache successful enrichment
      this.cacheEnrichment(cacheKey, result);
      
      return result;
      
    } catch (error) {
      console.warn('Question enrichment failed, using fallback:', error);
      return this.createFallbackEnrichment(request, startTime);
    }
  }

  /**
   * Validate quality of enrichment result
   */
  validateEnrichmentQuality(result: QuestionEnrichmentResult): boolean {
    // Basic quality checks
    if (result.enrichmentConfidence < 0.3) return false;
    if (result.processingTimeMs > 1000) return false; // Too slow
    if (result.knowledgeUsed.domainSpecificExamples.length === 0 && 
        result.knowledgeUsed.relevantBestPractices.length === 0) return false;
    
    return true;
  }

  /**
   * Get cached enrichment result
   */
  getCachedEnrichment(questionId: string): QuestionEnrichmentResult | null {
    return this.enrichmentCache.get(questionId) || null;
  }

  /**
   * Clear enrichment cache
   */
  clearEnrichmentCache(): void {
    this.enrichmentCache.clear();
    this.lastCacheCleanup = Date.now();
  }

  /**
   * Gather contextual knowledge from multiple sources
   */
  private async gatherContextualKnowledge(request: QuestionEnrichmentRequest): Promise<EnrichmentKnowledge> {
    const knowledge: EnrichmentKnowledge = {
      domainSpecificExamples: [],
      relevantBestPractices: [],
      alternativeApproaches: [],
      contextualHints: [],
      performanceConsiderations: [],
      securityGuidelines: []
    };

    const domain = request.domainContext?.domain || 'general';
    const questionType = request.baseQuestion.type;

    // Use existing multiSourceKnowledge system if available
    if (this.multiSourceKnowledge) {
      try {
        await this.enrichFromMultiSourceKnowledge(knowledge, domain, questionType, request);
      } catch (error) {
        console.warn('multiSourceKnowledge enrichment failed:', error);
      }
    }

    // Fallback to domain-specific template knowledge
    this.enrichFromTemplateKnowledge(knowledge, domain, questionType, request);

    return knowledge;
  }

  /**
   * Enrich knowledge using existing multiSourceKnowledge system
   */
  private async enrichFromMultiSourceKnowledge(
    knowledge: EnrichmentKnowledge,
    domain: string,
    questionType: QuestionType,
    request: QuestionEnrichmentRequest
  ): Promise<void> {
    
    const queries = this.buildKnowledgeQueries(domain, questionType, request);
    
    for (const query of queries) {
      try {
        const response = await this.multiSourceKnowledge!.queryMultipleSources({
          query: query.text,
          includeWebSearch: true,
          includeMCPServers: true,
          maxResults: 3
        });

        this.processKnowledgeResponse(knowledge, response, query.category);
        
      } catch (error) {
        console.warn(`Knowledge query failed for ${query.category}:`, error);
      }
    }
  }

  /**
   * Build knowledge queries for different categories
   */
  private buildKnowledgeQueries(
    domain: string,
    questionType: QuestionType,
    request: QuestionEnrichmentRequest
  ): Array<{text: string; category: keyof EnrichmentKnowledge}> {
    
    const queries: Array<{text: string; category: keyof EnrichmentKnowledge}> = [];

    if (request.includeExamples) {
      queries.push({
        text: `${domain} ${questionType} examples patterns implementations`,
        category: 'domainSpecificExamples'
      });
    }

    if (request.includeBestPractices) {
      queries.push({
        text: `${domain} best practices ${questionType} recommendations`,
        category: 'relevantBestPractices'
      });
    }

    if (request.includeAlternatives) {
      queries.push({
        text: `${domain} alternative approaches ${questionType} options`,
        category: 'alternativeApproaches'
      });
    }

    // Always include performance and security for relevant question types
    if (['performance-oriented', 'integration-focused'].includes(questionType)) {
      queries.push({
        text: `${domain} performance optimization considerations`,
        category: 'performanceConsiderations'
      });
    }

    if (['security-focused', 'integration-focused'].includes(questionType)) {
      queries.push({
        text: `${domain} security guidelines best practices`,
        category: 'securityGuidelines'
      });
    }

    return queries;
  }

  /**
   * Process knowledge response and categorize information
   */
  private processKnowledgeResponse(
    knowledge: EnrichmentKnowledge,
    response: { results: Array<{ content: string; source: string; score: number }> },
    category: keyof EnrichmentKnowledge
  ): void {
    
    if (!response || !response.results) return;

    const relevantInfo = this.extractRelevantInformation(response.results, category);
    
    // Add to appropriate category
    const existingItems = knowledge[category] as string[];
    existingItems.push(...relevantInfo.slice(0, 3)); // Limit to 3 items per category
  }

  /**
   * Extract relevant information from knowledge response
   */
  private extractRelevantInformation(
    results: Array<{ content: string; source: string; score: number }>, 
    category: keyof EnrichmentKnowledge
  ): string[] {
    const information: string[] = [];
    
    for (const result of results.slice(0, 2)) { // Process top 2 results
      if (result.content) {
        const extracted = this.extractByCategory(result.content, category);
        if (extracted) information.push(extracted);
      }
    }
    
    return information.filter(Boolean);
  }

  /**
   * Extract specific information based on category
   */
  private extractByCategory(content: string, category: keyof EnrichmentKnowledge): string | null {
    const lowerContent = content.toLowerCase();
    
    switch (category) {
      case 'domainSpecificExamples':
        if (lowerContent.includes('example') || lowerContent.includes('implementation')) {
          return this.extractSentenceContaining(content, ['example', 'implementation', 'use case']);
        }
        break;
        
      case 'relevantBestPractices':
        if (lowerContent.includes('best practice') || lowerContent.includes('recommendation')) {
          return this.extractSentenceContaining(content, ['best practice', 'recommendation', 'should']);
        }
        break;
        
      case 'alternativeApproaches':
        if (lowerContent.includes('alternative') || lowerContent.includes('option')) {
          return this.extractSentenceContaining(content, ['alternative', 'option', 'approach', 'method']);
        }
        break;
        
      case 'performanceConsiderations':
        if (lowerContent.includes('performance') || lowerContent.includes('optimization')) {
          return this.extractSentenceContaining(content, ['performance', 'optimization', 'efficiency', 'speed']);
        }
        break;
        
      case 'securityGuidelines':
        if (lowerContent.includes('security') || lowerContent.includes('secure')) {
          return this.extractSentenceContaining(content, ['security', 'secure', 'protection', 'vulnerability']);
        }
        break;
        
      default:
        return null;
    }
    
    return null;
  }

  /**
   * Extract sentence containing specific keywords
   */
  private extractSentenceContaining(content: string, keywords: string[]): string | null {
    const sentences = content.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (keywords.some(keyword => lowerSentence.includes(keyword))) {
        return sentence.trim();
      }
    }
    
    return null;
  }

  /**
   * Enrich with template-based knowledge when external sources unavailable
   */
  private enrichFromTemplateKnowledge(
    knowledge: EnrichmentKnowledge,
    domain: string,
    questionType: QuestionType,
    request: QuestionEnrichmentRequest
  ): void {
    
    const templateKnowledge = this.getTemplateKnowledge(domain, questionType);
    
    if (request.includeExamples && knowledge.domainSpecificExamples.length === 0) {
      knowledge.domainSpecificExamples.push(...templateKnowledge.examples);
    }
    
    if (request.includeBestPractices && knowledge.relevantBestPractices.length === 0) {
      knowledge.relevantBestPractices.push(...templateKnowledge.bestPractices);
    }
    
    if (request.includeAlternatives && knowledge.alternativeApproaches.length === 0) {
      knowledge.alternativeApproaches.push(...templateKnowledge.alternatives);
    }

    // Add contextual hints
    knowledge.contextualHints.push(...templateKnowledge.hints);
  }

  /**
   * Get template-based knowledge for domain and question type
   */
  private getTemplateKnowledge(domain: string, questionType: QuestionType): {
    examples: string[];
    bestPractices: string[];
    alternatives: string[];
    hints: string[];
  } {
    
    const baseKnowledge = {
      examples: [
        `Consider how other ${domain} projects approach this challenge`,
        `Look at popular ${domain} libraries and frameworks for patterns`
      ],
      bestPractices: [
        `Follow established ${domain} conventions and standards`,
        `Consider maintainability and scalability in your ${domain} solution`
      ],
      alternatives: [
        `Evaluate different ${domain} architectures for this use case`,
        `Consider both traditional and modern ${domain} approaches`
      ],
      hints: [
        `Think about how this fits into your overall ${domain} strategy`,
        `Consider the trade-offs specific to ${domain} implementations`
      ]
    };

    // Customize based on question type
    switch (questionType) {
      case 'performance-oriented':
        baseKnowledge.hints.push(`Focus on ${domain} performance benchmarks and optimization techniques`);
        break;
      case 'security-focused':
        baseKnowledge.hints.push(`Consider ${domain} security best practices and common vulnerabilities`);
        break;
      case 'integration-focused':
        baseKnowledge.hints.push(`Think about ${domain} integration patterns and API design`);
        break;
    }

    return baseKnowledge;
  }

  /**
   * Apply enrichment knowledge to enhance the question
   */
  private async applyEnrichmentToQuestion(
    baseQuestion: AdaptiveQuestion,
    knowledge: EnrichmentKnowledge
  ): Promise<AdaptiveQuestion> {
    
    const enrichedQuestion: AdaptiveQuestion = {
      ...baseQuestion,
      context: this.enhanceQuestionContext(baseQuestion.context, knowledge),
      followUpTriggers: this.enhanceFollowUpTriggers(baseQuestion.followUpTriggers, knowledge),
      alternativeFormulations: this.generateEnrichedAlternatives(baseQuestion, knowledge),
      tags: this.enhanceQuestionTags(baseQuestion.tags, knowledge)
    };

    // Update confidence based on enrichment quality
    enrichedQuestion.confidence = Math.min(
      baseQuestion.confidence + this.calculateEnrichmentBoost(knowledge),
      1.0
    );

    return enrichedQuestion;
  }

  /**
   * Enhance question context with gathered knowledge
   */
  private enhanceQuestionContext(originalContext: string, knowledge: EnrichmentKnowledge): string {
    const enhancements: string[] = [];
    
    if (knowledge.domainSpecificExamples.length > 0) {
      enhancements.push(`Examples: ${knowledge.domainSpecificExamples[0]}`);
    }
    
    if (knowledge.relevantBestPractices.length > 0) {
      enhancements.push(`Best practice: ${knowledge.relevantBestPractices[0]}`);
    }
    
    if (knowledge.contextualHints.length > 0) {
      enhancements.push(`Context: ${knowledge.contextualHints[0]}`);
    }

    return enhancements.length > 0 
      ? `${originalContext}\n\n${enhancements.join('\n')}`
      : originalContext;
  }

  /**
   * Enhance follow-up triggers with knowledge-derived keywords
   */
  private enhanceFollowUpTriggers(originalTriggers: string[], knowledge: EnrichmentKnowledge): string[] {
    const enhancedTriggers = [...originalTriggers];
    
    // Add triggers from examples
    if (knowledge.domainSpecificExamples.length > 0) {
      enhancedTriggers.push('examples', 'implementation');
    }
    
    // Add triggers from best practices
    if (knowledge.relevantBestPractices.length > 0) {
      enhancedTriggers.push('best practices', 'recommendations');
    }
    
    // Add triggers from alternatives
    if (knowledge.alternativeApproaches.length > 0) {
      enhancedTriggers.push('alternatives', 'options');
    }

    // Remove duplicates and limit
    return Array.from(new Set(enhancedTriggers)).slice(0, 10);
  }

  /**
   * Generate enriched alternative formulations
   */
  private generateEnrichedAlternatives(
    baseQuestion: AdaptiveQuestion,
    knowledge: EnrichmentKnowledge
  ): string[] {
    
    const alternatives: string[] = [...baseQuestion.alternativeFormulations];
    
    // Generate alternatives based on knowledge
    if (knowledge.domainSpecificExamples.length > 0) {
      alternatives.push(`Can you provide examples of how ${baseQuestion.domain} handles this?`);
    }
    
    if (knowledge.relevantBestPractices.length > 0) {
      alternatives.push(`What are the ${baseQuestion.domain} best practices for this situation?`);
    }
    
    if (knowledge.alternativeApproaches.length > 0) {
      alternatives.push(`What alternative ${baseQuestion.domain} approaches could work?`);
    }

    return alternatives.slice(0, 5); // Limit alternatives
  }

  /**
   * Enhance question tags with knowledge-derived tags
   */
  private enhanceQuestionTags(originalTags: string[], knowledge: EnrichmentKnowledge): string[] {
    const enhancedTags = [...originalTags];
    
    if (knowledge.domainSpecificExamples.length > 0) enhancedTags.push('examples-available');
    if (knowledge.relevantBestPractices.length > 0) enhancedTags.push('best-practices');
    if (knowledge.alternativeApproaches.length > 0) enhancedTags.push('alternatives');
    if (knowledge.performanceConsiderations.length > 0) enhancedTags.push('performance');
    if (knowledge.securityGuidelines.length > 0) enhancedTags.push('security');

    return Array.from(new Set(enhancedTags));
  }

  /**
   * Calculate confidence boost from enrichment
   */
  private calculateEnrichmentBoost(knowledge: EnrichmentKnowledge): number {
    let boost = 0;
    
    if (knowledge.domainSpecificExamples.length > 0) boost += 0.1;
    if (knowledge.relevantBestPractices.length > 0) boost += 0.1;
    if (knowledge.alternativeApproaches.length > 0) boost += 0.05;
    if (knowledge.contextualHints.length > 0) boost += 0.05;

    return Math.min(boost, 0.3); // Max boost of 0.3
  }

  /**
   * Calculate overall enrichment confidence
   */
  private calculateEnrichmentConfidence(
    knowledge: EnrichmentKnowledge,
    request: QuestionEnrichmentRequest
  ): number {
    
    let confidence = 0.5; // Base confidence
    
    // Boost based on knowledge completeness
    const totalKnowledgeItems = Object.values(knowledge).flat().length;
    confidence += Math.min(totalKnowledgeItems * 0.05, 0.3);
    
    // Boost based on domain context strength
    if (request.domainContext && request.domainContext.confidence > 0.8) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Extract knowledge sources for attribution
   */
  private extractKnowledgeSources(_knowledge: EnrichmentKnowledge): string[] {
    const sources = ['template-knowledge']; // Always include template fallback
    
    if (this.multiSourceKnowledge) {
      sources.push('multi-source-knowledge');
    }
    
    return sources;
  }

  /**
   * Create fallback enrichment when main process fails
   */
  private createFallbackEnrichment(
    request: QuestionEnrichmentRequest,
    startTime: number
  ): QuestionEnrichmentResult {
    
    const fallbackKnowledge: EnrichmentKnowledge = {
      domainSpecificExamples: [],
      relevantBestPractices: [],
      alternativeApproaches: [],
      contextualHints: [`Consider your specific ${request.baseQuestion.domain} requirements`],
      performanceConsiderations: [],
      securityGuidelines: []
    };

    return {
      enrichedQuestion: request.baseQuestion, // Return unchanged
      knowledgeUsed: fallbackKnowledge,
      enrichmentConfidence: 0.3,
      processingTimeMs: Date.now() - startTime,
      fallbackUsed: true,
      sources: ['fallback']
    };
  }

  /**
   * Generate cache key for enrichment request
   */
  private generateEnrichmentCacheKey(request: QuestionEnrichmentRequest): string {
    const keyData = {
      questionId: request.baseQuestion.id,
      domain: request.domainContext?.domain || 'none',
      type: request.baseQuestion.type,
      includeExamples: request.includeExamples,
      includeBestPractices: request.includeBestPractices,
      includeAlternatives: request.includeAlternatives
    };
    return btoa(JSON.stringify(keyData));
  }

  /**
   * Cache enrichment result
   */
  private cacheEnrichment(key: string, result: QuestionEnrichmentResult): void {
    this.enrichmentCache.set(key, result);
    
    // Clean cache periodically
    if (Date.now() - this.lastCacheCleanup > 300000) { // 5 minutes
      this.cleanEnrichmentCache();
    }
  }

  /**
   * Clean enrichment cache
   */
  private cleanEnrichmentCache(): void {
    if (this.enrichmentCache.size > 50) {
      // Remove oldest entries
      const entries = Array.from(this.enrichmentCache.entries());
      const toRemove = entries.slice(0, entries.length - 25);
      toRemove.forEach(([key]) => this.enrichmentCache.delete(key));
    }
    this.lastCacheCleanup = Date.now();
  }
}

export default DynamicContextualEnrichment;
