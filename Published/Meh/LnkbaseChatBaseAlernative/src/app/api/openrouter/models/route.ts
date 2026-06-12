import { NextResponse } from "next/server";

type OpenRouterModel = {
  id: string;
  name?: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
};

type OpenRouterModelsResponse = {
  data?: OpenRouterModel[];
};

const fallbackModels: OpenRouterModel[] = [
  { id: "openai/gpt-4.1-mini", name: "GPT-4.1 mini", context_length: 1047576 },
  { id: "openai/gpt-4.1", name: "GPT-4.1", context_length: 1047576 },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
  { id: "perplexity/sonar", name: "Perplexity Sonar" },
  { id: "x-ai/grok-3-mini", name: "Grok 3 Mini" },
];

export async function GET() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: process.env.OPENROUTER_API_KEY
          ? `Bearer ${process.env.OPENROUTER_API_KEY}`
          : "",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error("OpenRouter models request failed");
    }

    const data = (await response.json()) as OpenRouterModelsResponse;
    const models = (data.data ?? [])
      .filter((model) =>
        [
          "openai/",
          "anthropic/",
          "google/",
          "x-ai/",
          "perplexity/",
          "meta-llama/",
          "mistralai/",
        ].some((prefix) => model.id.startsWith(prefix))
      )
      .sort((a, b) => scoreModel(b) - scoreModel(a))
      .slice(0, 80);

    return NextResponse.json({ models: models.length ? models : fallbackModels });
  } catch {
    return NextResponse.json({ models: fallbackModels });
  }
}

function scoreModel(model: OpenRouterModel) {
  const id = model.id.toLowerCase();
  let score = 0;
  if (id.includes("gpt-4.1")) score += 80;
  if (id.includes("claude")) score += 70;
  if (id.includes("gemini")) score += 60;
  if (id.includes("grok")) score += 50;
  if (id.includes("sonar")) score += 40;
  if (id.includes("mini") || id.includes("flash")) score += 10;
  score += Math.min((model.context_length ?? 0) / 100000, 20);
  return score;
}
