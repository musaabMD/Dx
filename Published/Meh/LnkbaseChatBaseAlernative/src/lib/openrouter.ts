type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function openRouterChat({
  messages,
  model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
  temperature = 0.2,
}: {
  messages: OpenRouterMessage[];
  model?: string;
  temperature?: number;
}) {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
      "X-Title": "Lnkbase",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  const data = (await response.json()) as OpenRouterResponse;
  const text = data.choices?.[0]?.message?.content;

  if (!response.ok || !text) {
    throw new Error(data.error?.message ?? "OpenRouter request failed");
  }

  return text;
}
