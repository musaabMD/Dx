import { NextResponse } from "next/server";

export async function POST(req) {
  const { messages, context } = await req.json();

  const systemPrompt = context
    ? `You are a concise medical exam tutor. The student is reviewing this MCQ:\n\nQuestion: ${context.question}\nA) ${context.a}\nB) ${context.b}\nC) ${context.c}\nD) ${context.d}\nCorrect answer: ${context.correct}\nExplanation: ${context.explanation}\n\nAnswer the student's question in 2-4 sentences. Be direct, educational, and clinical. Do not repeat the full question back.`
    : "You are a concise medical exam tutor. Answer in 2-4 sentences maximum. Be direct and educational.";

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      content: "AI chat is not configured. Add OPENROUTER_API_KEY to your .env.local file.",
    });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "DrNote AI Tutor",
      },
      body: JSON.stringify({
        model: "anthropic/claude-haiku-4-5",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 280,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "Sorry, I couldn't process that.";
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ content: "Sorry, couldn't connect to AI right now." });
  }
}
