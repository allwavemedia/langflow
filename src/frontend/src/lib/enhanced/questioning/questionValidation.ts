import { AdaptiveQuestion, DomainContext } from "./types";

// Simple validation rules for Story 1.2 with room for extension
export function validateQuestionRelevance(
  question: AdaptiveQuestion,
  currentContext: DomainContext
): boolean {
  if (!question?.text?.trim()) return false;
  if (!currentContext?.name?.trim()) return false;

  // Require domain mention to increase perceived relevance
  const domainLower = currentContext.name.toLowerCase();
  const textLower = question.text.toLowerCase();
  if (!textLower.includes(domainLower)) return false;

  // Ensure sophistication is in the 1..5 range
  if (question.sophistication < 1 || question.sophistication > 5) return false;

  return true;
}

export function filterInappropriate(question: AdaptiveQuestion): boolean {
  // Basic keyword filtering; extendable with policy list or external service
  const banned = ["hate", "violence", "illicit", "self-harm"];
  const lower = question.text.toLowerCase();
  return !banned.some((w) => lower.includes(w));
}

