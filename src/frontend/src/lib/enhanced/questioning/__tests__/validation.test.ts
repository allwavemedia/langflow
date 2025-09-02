import { validateQuestionRelevance, filterInappropriate } from "../questionValidation";

describe("question validation", () => {
  const ctx = { name: "Langflow", confidence: 0.9 };
  it("requires domain mention and valid sophistication", () => {
    expect(
      validateQuestionRelevance(
        { id: "q1", text: "In simple terms, within the Langflow domain, ...", domain: "Langflow", sophistication: 3 },
        ctx
      )
    ).toBe(true);

    expect(
      validateQuestionRelevance(
        { id: "q2", text: "Generic question?", domain: "Other", sophistication: 3 },
        ctx
      )
    ).toBe(false);

    expect(
      validateQuestionRelevance(
        { id: "q3", text: "Langflow something", domain: "Langflow", sophistication: 6 as any },
        ctx
      )
    ).toBe(false);
  });

  it("filters inappropriate content", () => {
    expect(filterInappropriate({ id: "a", text: "benign", domain: "X", sophistication: 2 })).toBe(true);
    expect(filterInappropriate({ id: "b", text: "incites violence", domain: "X", sophistication: 2 })).toBe(false);
  });
});

