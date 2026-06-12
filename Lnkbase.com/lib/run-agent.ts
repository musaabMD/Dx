import type { Agent } from "./agents";

export async function runAgent(agent: Agent, input: string) {
  if (agent.provider !== "openai") {
    return {
      output: `Provider "${agent.provider}" is saved for this agent, but only OpenAI execution is wired in this MVP.`,
      mode: "disabled"
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      output:
        agent.outputFormat === "json"
          ? JSON.stringify(
              {
                status: "mock",
                agent: agent.name,
                input_preview: input.slice(0, 180),
                note: "Set OPENAI_API_KEY in .env.local to run the real model."
              },
              null,
              2
            )
          : `Mock result from ${agent.name}\n\nSet OPENAI_API_KEY in .env.local to run the real model.\n\nInput preview: ${input.slice(0, 220)}`,
      mode: "mock"
    };
  }

  const instructions = [agent.systemPrompt, agent.rules && `Rules:\n${agent.rules}`, `Output format: ${agent.outputFormat}`]
    .filter(Boolean)
    .join("\n\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: agent.model,
      instructions,
      input
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const json = await response.json();
  const output =
    json.output_text ||
    json.output?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content || []).map((content: { text?: string }) => content.text).filter(Boolean).join("\n") ||
    JSON.stringify(json, null, 2);

  return { output, mode: "openai" };
}
