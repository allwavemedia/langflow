import { generateAdaptiveQuestion } from "../questionGenerator";
import { DomainContext, QuestionSession } from "../types";

describe("generateAdaptiveQuestion", () => {
  const dc: DomainContext = { name: "Langflow", confidence: 0.92 };

  it("generates a simple question without history", async () => {
    const q = await generateAdaptiveQuestion(dc, [], 2);
    expect(q.text.toLowerCase()).toContain("langflow");
    expect(q.sophistication).toBe(2);
  });

  it("references last turn from history", async () => {
    const history: QuestionSession[] = [
      { id: "1", question: "What is your goal?", timestamp: Date.now() - 1000 },
      { id: "2", question: "", answer: "Build a chatbot", timestamp: Date.now() },
    ];
    const q = await generateAdaptiveQuestion(dc, history, 3);
    expect(q.text).toMatch(/build a chatbot/i);
  });
});

