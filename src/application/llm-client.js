import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are an expert product manager and UX strategist.

Your task is to convert product manager input text into a structured Product Map.

You must extract:

- stages (timeline of user journey)
- rows (User Goal, Jobs to be Done, Pain Points, Opportunities, Solutions)
- cells (content for each stage and row intersection)

Output MUST be valid JSON matching this structure:

{
  name: string,
  description: string,
  persona: {
    name: string,
    description: string,
    goals: string,
    frustrations: string
  },
  stages: [
    { name: string, order: number }
  ],
  rows: [
    { name: string, type: string, order: number }
  ],
  cells: [
    {
      stage_name: string,
      row_name: string,
      content: string
    }
  ]
}

Rules:

- Stages must be specific and domain-relevant
- Avoid generic stage names like Discover or Evaluate
- Include at least 4 stages
- Include all 5 default rows
- Populate meaningful pain points and opportunities
- Ensure no empty stages

Return ONLY valid JSON. No explanation.`;

export async function generateMapStructure(inputText) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set.");
  }

  const groq = new Groq({ apiKey });
  const userPrompt = `Generate Product Map from this input:\n\n${inputText}`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt }
    ]
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned an empty response.");
  }

  return content;
}

export default { generateMapStructure };
