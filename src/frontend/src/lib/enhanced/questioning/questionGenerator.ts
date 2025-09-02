import {
  AdaptiveQuestion,
  DomainContext,
  ExpertiseLevel,
  QuestionSession,
} from "./types";

// Core question generation logic (no direct LLM dependency here).
// This module composes a base question string using domain context,
// conversation history, and sophistication level. Actual LLM calls are
// performed upstream via injected components if needed.

export async function generateAdaptiveQuestion(
  domainContext: DomainContext,
  conversationHistory: QuestionSession[],
  expertiseLevel: ExpertiseLevel
): Promise<AdaptiveQuestion> {
  const domain = domainContext.name || "unknown";
  const lastTurn = conversationHistory[conversationHistory.length - 1];
  const prior = lastTurn?.answer?.trim() || lastTurn?.question?.trim();

  // Compose a deterministic base question respecting sophistication level.
  const sophisticationPrompt = getSophisticationPrefix(expertiseLevel);
  const contextHint = prior
    ? ` Building on the previous exchange ("${truncate(prior, 120)}"),`
    : "";

  const text = `${sophisticationPrompt}${contextHint} within the ${domain} domain, what is the next most valuable question to uncover best-practice patterns relevant to the current workflow?`;

  return {
    id: `q-${Date.now()}`,
    text,
    domain,
    sophistication: expertiseLevel,
    metadata: {
      confidence: domainContext.confidence,
      stateHint: domainContext.state ? Object.keys(domainContext.state) : [],
    },
  };
}

function getSophisticationPrefix(level: ExpertiseLevel): string {
  switch (level) {
    case 1:
      return "In simple terms,";
    case 2:
      return "At a beginner level,";
    case 3:
      return "From an intermediate perspective,";
    case 4:
      return "From an advanced perspective,";
    case 5:
      return "As an expert advisor,";
    default:
      return "";
  }
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

