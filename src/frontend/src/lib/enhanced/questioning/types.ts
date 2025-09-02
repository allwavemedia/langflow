// Types for the Adaptive Questioning Engine (Story 1.2)

export type ExpertiseLevel = 1 | 2 | 3 | 4 | 5;

export interface DomainContext {
  name: string; // e.g., "Langflow", "Airbyte", etc.
  confidence: number; // 0..1
  state?: Record<string, unknown>; // arbitrary state from detection
}

export interface QuestionSession {
  id: string;
  question: string;
  answer?: string;
  timestamp: number;
}

export interface AdaptiveQuestion {
  id: string;
  text: string;
  domain: string;
  sophistication: ExpertiseLevel;
  metadata?: Record<string, unknown>;
}

export interface EnrichedQuestion extends AdaptiveQuestion {
  sources?: Array<{
    provider: string;
    ref: string;
    snippet?: string;
  }>;
  rationale?: string;
}

export interface KnowledgeQueryOptions {
  query: string;
  includeWebSearch?: boolean;
  includeMCPServers?: boolean;
}

export interface KnowledgeProvider {
  queryMultipleSources(
    options: KnowledgeQueryOptions
  ): Promise<{
    items: Array<{ provider: string; ref: string; snippet?: string }>;
    usedCache?: boolean;
  }>;
}

export interface DomainDetectionProvider {
  getActiveDomainContext(): Promise<DomainContext>;
}

export interface QuestionGenerationEngine {
  generateAdaptiveQuestion(
    domainContext: DomainContext,
    conversationHistory: QuestionSession[],
    expertiseLevel: ExpertiseLevel
  ): Promise<AdaptiveQuestion>;

  enrichQuestionWithKnowledge(
    baseQuestion: AdaptiveQuestion,
    domainContext: DomainContext
  ): Promise<EnrichedQuestion>;

  validateQuestionRelevance(
    question: AdaptiveQuestion,
    currentContext: DomainContext
  ): boolean;
}

export interface PerformanceTimer {
  start(label: string): void;
  end(label: string): { ms: number };
}

export const defaultTimer: PerformanceTimer = {
  start: () => {},
  end: () => ({ ms: 0 }),
};

export function isSocraticEnabled(): boolean {
  // Support both Next-style and Vite-style flags for flexibility.
  // Story references NEXT_PUBLIC_ENABLE_SOCRATIC_QUESTIONING specifically.
  const nextFlag =
    (globalThis as any).NEXT_PUBLIC_ENABLE_SOCRATIC_QUESTIONING ??
    (globalThis as any).process?.env?.NEXT_PUBLIC_ENABLE_SOCRATIC_QUESTIONING;
  const viteFlag = (import.meta as any)?.env?.VITE_ENABLE_SOCRATIC_QUESTIONING;
  const val = `${nextFlag ?? viteFlag ?? "false"}`.toLowerCase();
  return val === "1" || val === "true" || val === "yes";
}

