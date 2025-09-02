import { useCallback, useMemo, useRef, useState } from "react";
import {
  DomainDetectionProvider,
  EnrichedQuestion,
  ExpertiseLevel,
  QuestionSession,
  isSocraticEnabled,
} from "../questioning/types";
import { QuestioningEngine, QuestioningEngineDeps } from "../questioning/questioningEngine";

type UseQuestionGenerationOpts = {
  domainDetection: DomainDetectionProvider;
  knowledge?: QuestioningEngineDeps["knowledge"];
};

export function useQuestionGeneration({ domainDetection, knowledge }: UseQuestionGenerationOpts) {
  const engineRef = useRef<QuestioningEngine>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<EnrichedQuestion | null>(null);

  const engine = useMemo(() => {
    if (!engineRef.current) {
      engineRef.current = new QuestioningEngine({ domainDetection, knowledge });
    }
    return engineRef.current;
  }, [domainDetection, knowledge]);

  const generate = useCallback(
    async (history: QuestionSession[], level: ExpertiseLevel = 3) => {
      if (!isSocraticEnabled()) return null;
      setLoading(true);
      setError(null);
      try {
        const q = await engine.generate(history, level);
        setLastQuestion(q);
        return q;
      } catch (e: any) {
        setError(e?.message ?? "Failed to generate question");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [engine]
  );

  return { generate, loading, error, lastQuestion };
}

