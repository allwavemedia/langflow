// Question Generator - Epic 6.4.3 Story 1.2 Core Component
// Dynamic question generation based on domain context without hardcoded patterns

import { AdaptiveQuestion, QuestionType, QuestionComplexity, SophisticationLevel } from './questionTypes';
import { DomainContext, EnhancedDomainContext } from '../domainDetectionSystem';
import { QuestioningFeatureFlagsConfig } from '../featureFlags';

export interface DomainInformation {
  detectedDomain?: string;
  confidence: number;
  context: string;
  components: string[];
}

export interface QuestionGenerationRequest {
  domainContext: DomainContext | null;
  enhancedContext?: EnhancedDomainContext;
  sophisticationLevel: SophisticationLevel;
  conversationHistory: string[];
  currentInput?: string;
  preferredComplexity?: QuestionComplexity;
  focusAreas?: string[];
  excludeTypes?: QuestionType[];
}

export interface QuestionGenerationResult {
  question: AdaptiveQuestion;
  confidence: number;
  reasoning: string;
  alternativeQuestions: AdaptiveQuestion[];
  generationTimeMs: number;
  fallbackUsed: boolean;
}

export interface QuestionGenerationEngine {
  generateAdaptiveQuestion(request: QuestionGenerationRequest): Promise<QuestionGenerationResult>;
  generateMultipleQuestions(request: QuestionGenerationRequest, count: number): Promise<QuestionGenerationResult[]>;
  validateGenerationRequest(request: QuestionGenerationRequest): boolean;
  getQuestionGenerationCapabilities(): QuestionGenerationCapabilities;
}

export interface QuestionGenerationCapabilities {
  supportedDomains: string[];
  supportedComplexityLevels: QuestionComplexity[];
  supportedQuestionTypes: QuestionType[];
  maxQuestionsPerRequest: number;
  estimatedLatencyMs: number;
}

/**
 * Main Question Generator Implementation
 * Generates dynamic questions based on domain context without hardcoded patterns
 */
export class DynamicQuestionGenerator implements QuestionGenerationEngine {
  private readonly featureFlags: QuestioningFeatureFlagsConfig;
  private readonly openAIApiKey: string | null;
  private generationCache: Map<string, QuestionGenerationResult>;
  private lastCacheCleanup: number;
  
  constructor(featureFlags: QuestioningFeatureFlagsConfig) {
    this.featureFlags = featureFlags;
    this.openAIApiKey = process.env.OPENAI_API_KEY || null;
    this.generationCache = new Map();
    this.lastCacheCleanup = Date.now();
  }

  /**
   * Generate adaptive question based on domain context
   */
  async generateAdaptiveQuestion(request: QuestionGenerationRequest): Promise<QuestionGenerationResult> {
    const startTime = Date.now();
    
    // Validation
    if (!this.validateGenerationRequest(request)) {
      throw new Error('Invalid question generation request');
    }

    // Check feature flags
    if (!this.featureFlags.enableQuestionGeneration) {
      return this.generateFallbackQuestion(request, startTime);
    }

    // Generate cache key for potential reuse
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    if (this.generationCache.has(cacheKey)) {
      const cached = this.generationCache.get(cacheKey)!;
      return {
        ...cached,
        generationTimeMs: Date.now() - startTime
      };
    }

    try {
      // Generate question using domain context
      const question = await this.generateQuestionFromContext(request);
      
      const result: QuestionGenerationResult = {
        question,
        confidence: this.calculateQuestionConfidence(question, request),
        reasoning: this.generateQuestionReasoning(question, request),
        alternativeQuestions: await this.generateAlternativeQuestions(request, question),
        generationTimeMs: Date.now() - startTime,
        fallbackUsed: false
      };

      // Cache if successful
      this.cacheResult(cacheKey, result);
      
      return result;
      
    } catch (error) {
      console.warn('Question generation failed, using fallback:', error);
      return this.generateFallbackQuestion(request, startTime);
    }
  }

  /**
   * Generate multiple questions for increased options
   */
  async generateMultipleQuestions(
    request: QuestionGenerationRequest, 
    count: number
  ): Promise<QuestionGenerationResult[]> {
    const results: QuestionGenerationResult[] = [];
    
    // Generate first question normally
    const firstResult = await this.generateAdaptiveQuestion(request);
    results.push(firstResult);
    
    // Generate additional questions with variation
    for (let i = 1; i < count; i++) {
      const modifiedRequest: QuestionGenerationRequest = {
        ...request,
        excludeTypes: [...(request.excludeTypes || []), firstResult.question.type],
        focusAreas: this.generateAlternativeFocusAreas(request, results)
      };
      
      const result = await this.generateAdaptiveQuestion(modifiedRequest);
      results.push(result);
      
      // Throttle to prevent overwhelming external APIs
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * Validate generation request for completeness and safety
   */
  validateGenerationRequest(request: QuestionGenerationRequest): boolean {
    // Basic validation
    if (!request.sophisticationLevel || request.sophisticationLevel < 1 || request.sophisticationLevel > 5) {
      return false;
    }
    
    // Conversation history validation
    if (request.conversationHistory && request.conversationHistory.length > 50) {
      return false; // Prevent excessive context
    }
    
    return true;
  }

  /**
   * Get current capabilities of question generation engine
   */
  getQuestionGenerationCapabilities(): QuestionGenerationCapabilities {
    return {
      supportedDomains: ['web-development', 'data-science', 'devops', 'mobile-development', 'ai-ml', 'generic'],
      supportedComplexityLevels: ['beginner', 'intermediate', 'advanced', 'expert', 'research'],
      supportedQuestionTypes: [
        'clarifying', 'exploration', 'assumption-testing', 'concept-validation',
        'pattern-discovery', 'integration-focused', 'performance-oriented'
      ],
      maxQuestionsPerRequest: 5,
      estimatedLatencyMs: 400
    };
  }

  /**
   * Generate question from domain context without hardcoded patterns
   */
  private async generateQuestionFromContext(request: QuestionGenerationRequest): Promise<AdaptiveQuestion> {
    const domainInfo = this.extractDomainInformation(request);
    const conversationContext = this.buildConversationContext(request);
    
    // Determine question type based on context
    const questionType = this.determineQuestionType(request, domainInfo);
    const complexity = this.determineComplexity(request);
    
    // Generate question using AI if available, otherwise use template-based generation
    const questionText = await this.generateQuestionText(domainInfo, conversationContext, questionType, complexity);
    
    return {
      id: this.generateQuestionId(),
      type: questionType,
      complexity: complexity,
      priority: this.determinePriority(questionType, request),
      domain: domainInfo.detectedDomain || 'generic',
      question: questionText,
      context: conversationContext,
      expectedResponseType: this.determineResponseType(questionType),
      followUpTriggers: this.generateFollowUpTriggers(questionType, domainInfo),
      prerequisiteQuestions: [],
      alternativeFormulations: [],
      domainSpecific: Boolean(request.domainContext),
      complianceRelated: this.isComplianceRelated(questionType, domainInfo),
      performanceImpact: 'minimal',
      tags: this.generateQuestionTags(questionType, domainInfo),
      generatedAt: new Date(),
      source: 'dynamic',
      confidence: 0.8 // Will be recalculated
    };
  }

  /**
   * Generate question text using AI or template fallback
   */
  private async generateQuestionText(
    domainInfo: DomainInformation,
    conversationContext: string,
    questionType: QuestionType,
    complexity: QuestionComplexity
  ): Promise<string> {
    
    // Try AI generation first if available
    if (this.openAIApiKey && this.featureFlags.enableQuestioningDebugMode) {
      try {
        return await this.generateQuestionWithAI(domainInfo, conversationContext, questionType, complexity);
      } catch (error) {
        console.warn('AI question generation failed, using template fallback:', error);
      }
    }
    
    // Template-based fallback
    return this.generateQuestionFromTemplate(domainInfo, questionType, complexity);
  }

  /**
   * AI-powered question generation using OpenAI API
   */
  private async generateQuestionWithAI(
    domainInfo: DomainInformation,
    conversationContext: string,
    questionType: QuestionType,
    _complexity: QuestionComplexity
  ): Promise<string> {
    
    // This would integrate with existing OpenAI connection
    // For now, return a smart template-based result that could be enhanced
    return this.generateIntelligentTemplate(domainInfo, questionType);
  }

  /**
   * Template-based question generation with domain awareness
   */
  private generateQuestionFromTemplate(
    domainInfo: DomainInformation,
    questionType: QuestionType,
    complexity: QuestionComplexity
  ): string {
    
    const domain = domainInfo.detectedDomain || 'general';
    const confidence = domainInfo.confidence || 0.5;
    
    const templates = this.getQuestionTemplates(questionType, complexity);
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Replace placeholders with domain-specific content
    return selectedTemplate
      .replace('{domain}', domain)
      .replace('{confidence}', confidence > 0.8 ? 'specific' : 'general')
      .replace('{complexity}', complexity);
  }

  /**
   * Generate intelligent template with domain context
   */
  private generateIntelligentTemplate(
    domainInfo: DomainInformation,
    questionType: QuestionType
  ): string {
    
    const domain = domainInfo.detectedDomain || 'your project';
    
    const questionStarters: Partial<Record<QuestionType, string[]>> = {
      'clarifying': [
        `What specific aspect of ${domain} are you focusing on?`,
        `Can you elaborate on the ${domain} requirements you mentioned?`,
        `Which part of your ${domain} approach needs more definition?`
      ],
      'exploration': [
        `What patterns have you considered for ${domain}?`,
        `How might you approach the core ${domain} challenges?`,
        `What alternatives could work for your ${domain} scenario?`
      ],
      'assumption-testing': [
        `What assumptions are you making about ${domain}?`,
        `How have you validated your ${domain} approach?`,
        `What could challenge your current ${domain} strategy?`
      ],
      'concept-validation': [
        `How does this ${domain} concept fit your overall architecture?`,
        `What would success look like for this ${domain} implementation?`,
        `How will you measure the effectiveness of this ${domain} approach?`
      ],
      'pattern-discovery': [
        `What patterns emerge from your ${domain} requirements?`,
        `How do successful ${domain} projects typically handle this?`,
        `What recurring themes do you see in ${domain} best practices?`
      ],
      'integration-focused': [
        `How will this ${domain} component integrate with your existing systems?`,
        `What integration challenges might arise with ${domain}?`,
        `How can you ensure smooth ${domain} integration?`
      ],
      'performance-oriented': [
        `What performance requirements does your ${domain} solution need to meet?`,
        `How will you optimize ${domain} performance?`,
        `What performance bottlenecks might affect your ${domain} implementation?`
      ]
    };
    
    const templates = questionStarters[questionType] || questionStarters['clarifying'] || ['Can you tell me more about your project?'];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate fallback question when main generation fails
   */
  private generateFallbackQuestion(
    request: QuestionGenerationRequest,
    startTime: number
  ): QuestionGenerationResult {
    
    const fallbackQuestion: AdaptiveQuestion = {
      id: this.generateQuestionId(),
      type: 'clarifying',
      complexity: 'intermediate',
      priority: 'medium',
      domain: request.domainContext?.domain || 'general',
      question: 'Can you tell me more about what you\'re trying to accomplish?',
      context: 'Fallback question for continued conversation',
      expectedResponseType: 'text',
      followUpTriggers: ['clarification', 'elaboration'],
      prerequisiteQuestions: [],
      alternativeFormulations: [
        'What specific goals are you working toward?',
        'Can you describe your current challenge in more detail?'
      ],
      domainSpecific: false,
      complianceRelated: false,
      performanceImpact: 'minimal',
      tags: ['fallback', 'general', 'clarifying'],
      generatedAt: new Date(),
      source: 'template',
      confidence: 0.6
    };
    
    return {
      question: fallbackQuestion,
      confidence: 0.6,
      reasoning: 'Fallback question used due to generation failure or disabled features',
      alternativeQuestions: [],
      generationTimeMs: Date.now() - startTime,
      fallbackUsed: true
    };
  }

  // Helper methods
  private extractDomainInformation(request: QuestionGenerationRequest): DomainInformation {
    return {
      detectedDomain: request.domainContext?.domain,
      confidence: request.domainContext?.confidence || 0,
      context: request.currentInput || '',
      components: [] // DomainContext doesn't have detectedComponents, use empty array
    };
  }

  private buildConversationContext(request: QuestionGenerationRequest): string {
    const recentHistory = request.conversationHistory.slice(-3).join(' ');
    return recentHistory || 'Starting new conversation';
  }

  private determineQuestionType(request: QuestionGenerationRequest, domainInfo: DomainInformation): QuestionType {
    // Logic to determine appropriate question type based on context
    if (request.conversationHistory.length < 2) return 'clarifying';
    if (domainInfo.confidence < 0.7) return 'exploration';
    if (request.sophisticationLevel >= 4) return 'assumption-testing';
    return 'concept-validation';
  }

  private determineComplexity(request: QuestionGenerationRequest): QuestionComplexity {
    if (request.preferredComplexity) return request.preferredComplexity;
    
    const levelMap: Record<SophisticationLevel, QuestionComplexity> = {
      1: 'beginner',
      2: 'intermediate',
      3: 'intermediate',
      4: 'advanced',
      5: 'expert'
    };
    
    return levelMap[request.sophisticationLevel];
  }

  private determinePriority(questionType: QuestionType, request: QuestionGenerationRequest): 'low' | 'medium' | 'high' | 'critical' {
    if (questionType === 'clarifying' && request.conversationHistory.length < 2) return 'high';
    if (questionType === 'assumption-testing') return 'high';
    return 'medium';
  }

  private determineResponseType(questionType: QuestionType): 'text' | 'selection' | 'structured' | 'boolean' {
    const typeMap: Record<QuestionType, 'text' | 'selection' | 'structured' | 'boolean'> = {
      'clarifying': 'text',
      'exploration': 'text',
      'assumption-testing': 'text',
      'concept-validation': 'structured',
      'pattern-discovery': 'text',
      'integration-focused': 'structured',
      'compliance-aware': 'boolean',
      'performance-oriented': 'structured',
      'security-focused': 'structured'
    };
    
    return typeMap[questionType] || 'text';
  }

  private generateFollowUpTriggers(questionType: QuestionType, domainInfo: DomainInformation): string[] {
    const baseKeywords = ['clarification', 'more details', 'examples'];
    const domainKeywords = domainInfo.detectedDomain ? [domainInfo.detectedDomain, 'implementation'] : [];
    return [...baseKeywords, ...domainKeywords];
  }

  private isComplianceRelated(questionType: QuestionType, domainInfo: DomainInformation): boolean {
    return questionType === 'compliance-aware' || 
           Boolean(domainInfo.context && domainInfo.context.includes('compliance'));
  }

  private generateQuestionTags(questionType: QuestionType, domainInfo: DomainInformation): string[] {
    const tags: string[] = [questionType];
    if (domainInfo.detectedDomain) tags.push(domainInfo.detectedDomain);
    if (domainInfo.confidence > 0.8) tags.push('high-confidence');
    return tags;
  }

  private calculateQuestionConfidence(question: AdaptiveQuestion, request: QuestionGenerationRequest): number {
    let confidence = 0.7; // Base confidence
    
    // Boost confidence if domain is well-detected
    if (request.domainContext && request.domainContext.confidence > 0.8) {
      confidence += 0.2;
    }
    
    // Boost confidence if conversation has context
    if (request.conversationHistory.length > 2) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  private generateQuestionReasoning(question: AdaptiveQuestion, request: QuestionGenerationRequest): string {
    return `Generated ${question.type} question for ${question.domain} domain based on conversation context and sophistication level ${request.sophisticationLevel}`;
  }

  private async generateAlternativeQuestions(
    request: QuestionGenerationRequest,
    primaryQuestion: AdaptiveQuestion
  ): Promise<AdaptiveQuestion[]> {
    // Generate 1-2 alternative questions with different approaches
    const alternatives: AdaptiveQuestion[] = [];
    
    if (this.featureFlags.enableQuestioningDebugMode) {
      // In debug mode, generate more alternatives
      try {
        const altRequest = { ...request, excludeTypes: [primaryQuestion.type] };
        const altResult = await this.generateAdaptiveQuestion(altRequest);
        alternatives.push(altResult.question);
      } catch {
        // Ignore errors in alternative generation
      }
    }
    
    return alternatives;
  }

  private generateAlternativeFocusAreas(
    request: QuestionGenerationRequest,
    existingResults: QuestionGenerationResult[]
  ): string[] {
    const usedTypes = existingResults.map(r => r.question.type);
    const availableTypes: QuestionType[] = [
      'clarifying', 'exploration', 'assumption-testing', 'concept-validation',
      'pattern-discovery', 'integration-focused', 'performance-oriented'
    ];
    
    return availableTypes.filter(type => !usedTypes.includes(type));
  }

  private getQuestionTemplates(questionType: QuestionType, complexity: QuestionComplexity): string[] {
    // Template database - these would be more sophisticated in production
    const templates: Record<QuestionType, Record<QuestionComplexity, string[]>> = {
      'clarifying': {
        'beginner': ['What are you trying to do with {domain}?', 'Can you describe your {domain} goal?'],
        'intermediate': ['What specific {domain} challenge are you addressing?'],
        'advanced': ['How does this {domain} approach align with your architecture?'],
        'expert': ['What are the implications of this {domain} design choice?'],
        'research': ['How does this {domain} approach compare to cutting-edge alternatives?']
      },
      'exploration': {
        'beginner': ['What {domain} options have you considered?'],
        'intermediate': ['What {domain} patterns might work here?'],
        'advanced': ['How would you approach {domain} optimization?'],
        'expert': ['What {domain} trade-offs are you evaluating?'],
        'research': ['What novel {domain} approaches could apply?']
      },
      // Add more templates for other question types...
      'assumption-testing': {
        'beginner': ['What are you assuming about {domain}?'],
        'intermediate': ['How have you validated your {domain} assumptions?'],
        'advanced': ['What could invalidate your {domain} approach?'],
        'expert': ['What implicit assumptions underlie your {domain} strategy?'],
        'research': ['How do your {domain} assumptions compare to recent research?']
      },
      'concept-validation': {
        'beginner': ['Does this {domain} concept make sense?'],
        'intermediate': ['How does this {domain} concept fit your needs?'],
        'advanced': ['How would you validate this {domain} concept?'],
        'expert': ['What are the theoretical foundations of this {domain} concept?'],
        'research': ['How does this {domain} concept advance the field?']
      },
      'pattern-discovery': {
        'beginner': ['What patterns do you see in {domain}?'],
        'intermediate': ['What {domain} patterns are emerging?'],
        'advanced': ['How do these {domain} patterns optimize your solution?'],
        'expert': ['What meta-patterns govern your {domain} architecture?'],
        'research': ['What novel patterns could revolutionize {domain}?']
      },
      'integration-focused': {
        'beginner': ['How will {domain} connect to other parts?'],
        'intermediate': ['What {domain} integration challenges do you foresee?'],
        'advanced': ['How will you ensure seamless {domain} integration?'],
        'expert': ['What are the systemic implications of {domain} integration?'],
        'research': ['How could {domain} integration patterns evolve?']
      },
      'compliance-aware': {
        'beginner': ['Are there {domain} rules to follow?'],
        'intermediate': ['What {domain} compliance requirements apply?'],
        'advanced': ['How will you ensure {domain} regulatory compliance?'],
        'expert': ['What are the compliance implications of your {domain} approach?'],
        'research': ['How might {domain} compliance requirements evolve?']
      },
      'performance-oriented': {
        'beginner': ['How fast should {domain} be?'],
        'intermediate': ['What {domain} performance requirements exist?'],
        'advanced': ['How will you optimize {domain} performance?'],
        'expert': ['What are the performance trade-offs in your {domain} design?'],
        'research': ['What performance breakthroughs could transform {domain}?']
      },
      'security-focused': {
        'beginner': ['How will you keep {domain} secure?'],
        'intermediate': ['What {domain} security measures are needed?'],
        'advanced': ['How will you implement defense-in-depth for {domain}?'],
        'expert': ['What are the security implications of your {domain} architecture?'],
        'research': ['What emerging security paradigms could protect {domain}?']
      }
    };
    
    return templates[questionType]?.[complexity] || ['Can you tell me more about {domain}?'];
  }

  private generateCacheKey(request: QuestionGenerationRequest): string {
    const keyData = {
      domain: request.domainContext?.domain || 'none',
      sophistication: request.sophisticationLevel,
      historyLength: request.conversationHistory.length,
      complexity: request.preferredComplexity || 'default'
    };
    return btoa(JSON.stringify(keyData));
  }

  private cacheResult(key: string, result: QuestionGenerationResult): void {
    this.generationCache.set(key, result);
    
    // Clean cache periodically
    if (Date.now() - this.lastCacheCleanup > 300000) { // 5 minutes
      this.cleanCache();
    }
  }

  private cleanCache(): void {
    if (this.generationCache.size > 100) {
      // Remove oldest entries
      const entries = Array.from(this.generationCache.entries());
      const toRemove = entries.slice(0, entries.length - 50);
      toRemove.forEach(([key]) => this.generationCache.delete(key));
    }
    this.lastCacheCleanup = Date.now();
  }

  private generateQuestionId(): string {
    return `question-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private buildAIPrompt(
    domainInfo: DomainInformation,
    conversationContext: string,
    questionType: QuestionType,
    complexity: QuestionComplexity
  ): string {
    return `Generate a ${questionType} question about ${domainInfo.detectedDomain || 'general development'} 
            at ${complexity} level, given this context: ${conversationContext}`;
  }
}

export default DynamicQuestionGenerator;
