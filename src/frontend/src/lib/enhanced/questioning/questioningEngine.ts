import {
  AdaptiveQuestion,
  DomainContext,
  DomainDetectionProvider,
  EnrichedQuestion,
  ExpertiseLevel,
  QuestionGenerationEngine,
  QuestionSession,
  defaultTimer,
} from "./types";
import { generateAdaptiveQuestion } from "./questionGenerator";
import { enrichQuestionWithKnowledge } from "./contextualEnrichment";
import { filterInappropriate, validateQuestionRelevance } from "./questionValidation";

type CacheKey = string;

export interface QuestioningEngineDeps {
  domainDetection: DomainDetectionProvider;
  knowledge?: {
    queryMultipleSources: (args: {
      query: string;
      includeWebSearch?: boolean;
      includeMCPServers?: boolean;
    }) => Promise<{ items: Array<{ provider: string; ref: string; snippet?: string }>; usedCache?: boolean }>;
  };
  timer?: typeof defaultTimer;
}

export class QuestioningEngine implements QuestionGenerationEngine {
  private deps: QuestioningEngineDeps;
  private cache: Map<CacheKey, EnrichedQuestion> = new Map();

  constructor(deps: QuestioningEngineDeps) {
    this.deps = { ...deps, timer: deps.timer ?? defaultTimer };
  }

  async generateAdaptiveQuestion(
    domainContext: DomainContext,
    conversationHistory: QuestionSession[],
    expertiseLevel: ExpertiseLevel
  ): Promise<AdaptiveQuestion> {
    return generateAdaptiveQuestion(domainContext, conversationHistory, expertiseLevel);
  }

  async enrichQuestionWithKnowledge(
    baseQuestion: AdaptiveQuestion,
    domainContext: DomainContext
  ): Promise<EnrichedQuestion> {
    return enrichQuestionWithKnowledge(baseQuestion, domainContext, this.deps.knowledge);
  }

  validateQuestionRelevance(question: AdaptiveQuestion, currentContext: DomainContext): boolean {
    return validateQuestionRelevance(question, currentContext);
  }

  async generate(
    conversationHistory: QuestionSession[],
    expertiseLevel: ExpertiseLevel
  ): Promise<EnrichedQuestion | null> {
    const t0 = Date.now();
    const domainContext = await this.deps.domainDetection.getActiveDomainContext();

    const cacheKey = this.key(domainContext, conversationHistory, expertiseLevel);
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const base = await this.generateAdaptiveQuestion(domainContext, conversationHistory, expertiseLevel);
    if (!this.validateQuestionRelevance(base, domainContext)) return null;
    if (!filterInappropriate(base)) return null;

    const enriched = await this.enrichQuestionWithKnowledge(base, domainContext);
    this.cache.set(cacheKey, enriched);

    // Basic timing capture; consumer can compare to baseline externally
    const elapsed = Date.now() - t0;
    (enriched.metadata as any) = {
      ...(enriched.metadata ?? {}),
      generationMs: elapsed,
    };

    return enriched;
  }

  private key(dc: DomainContext, hist: QuestionSession[], level: ExpertiseLevel): CacheKey {
    const h = hist.map((t) => `${t.question}|${t.answer ?? ""}`).join("::");
    return `${dc.name}:${dc.confidence}:${level}:${this.hash(h)}`;
  }

  private hash(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h >>> 0;
  }
}

