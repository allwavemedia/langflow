import { QuestioningEngine } from "../questioningEngine";
import { QuestionSession } from "../types";

const mockDomainDetection = {
  getActiveDomainContext: async () => ({ name: "Langflow", confidence: 0.95 }),
};

const mockKnowledge = {
  queryMultipleSources: async () => ({ items: [{ provider: "test", ref: "ref1" }] }),
};

describe("QuestioningEngine", () => {
  it("generates and caches questions", async () => {
    const engine = new QuestioningEngine({ domainDetection: mockDomainDetection as any, knowledge: mockKnowledge });
    const hist: QuestionSession[] = [{ id: "1", question: "Goal?", answer: "Build a bot", timestamp: Date.now() }];

    const q1 = await engine.generate(hist, 3);
    const q2 = await engine.generate(hist, 3);
    expect(q1?.text).toBeDefined();
    expect(q2).toBe(q1); // cached
  });
});

