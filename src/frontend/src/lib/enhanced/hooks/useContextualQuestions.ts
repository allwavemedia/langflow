import { useEffect } from "react";
import { useQuestionGeneration } from "./useQuestionGeneration";
import { DomainDetectionProvider, ExpertiseLevel, QuestionSession } from "../questioning/types";

type UseContextualQuestionsOpts = {
  domainDetection: DomainDetectionProvider;
  knowledge?: {
    queryMultipleSources: (args: {
      query: string;
      includeWebSearch?: boolean;
      includeMCPServers?: boolean;
    }) => Promise<{ items: Array<{ provider: string; ref: string; snippet?: string }>; usedCache?: boolean }>;
  };
  history: QuestionSession[];
  level?: ExpertiseLevel;
  auto?: boolean; // auto-generate on mount or dependency changes
};

export function useContextualQuestions({
  domainDetection,
  knowledge,
  history,
  level = 3,
  auto = true,
}: UseContextualQuestionsOpts) {
  const q = useQuestionGeneration({ domainDetection, knowledge });

  useEffect(() => {
    if (!auto) return;
    void q.generate(history, level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, level, JSON.stringify(history)]);

  return q;
}

