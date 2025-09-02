import {
  AdaptiveQuestion,
  DomainContext,
  EnrichedQuestion,
  KnowledgeProvider,
} from "./types";

// Integrates with multiSourceKnowledge.queryMultipleSources() via KnowledgeProvider.
// Provides graceful fallback when provider or external services are unavailable.

export async function enrichQuestionWithKnowledge(
  base: AdaptiveQuestion,
  domainContext: DomainContext,
  knowledge?: KnowledgeProvider
): Promise<EnrichedQuestion> {
  if (!knowledge) {
    return {
      ...base,
      sources: [],
      rationale:
        "Knowledge provider unavailable; proceeding with context-only enrichment.",
    };
  }

  try {
    const q = `Best practices and common patterns for ${domainContext.name}`;
    const res = await knowledge.queryMultipleSources({
      query: q,
      includeWebSearch: true,
      includeMCPServers: true,
    });

    return {
      ...base,
      sources: res.items ?? [],
      metadata: {
        ...(base.metadata ?? {}),
        knowledgeUsedCache: Boolean((res as any).usedCache),
      },
      rationale:
        "Question enriched with domain-specific best practices from multiple sources.",
    };
  } catch {
    // Graceful degradation
    return {
      ...base,
      sources: [],
      rationale:
        "Knowledge enrichment failed; falling back to context-based question only.",
    };
  }
}

