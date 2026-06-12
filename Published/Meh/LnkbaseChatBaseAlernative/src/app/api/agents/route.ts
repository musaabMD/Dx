import { NextResponse } from "next/server";
import { api } from "@convex/_generated/api";
import { getConvexClient } from "@/lib/convex-http";
import { openRouterChat } from "@/lib/openrouter";
import { ingestWebsite } from "@/lib/website-ingest";

type CreateAgentBody = {
  name?: string;
  websiteUrl?: string;
  instructions?: string;
  tools?: string[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateAgentBody;
    const websiteUrl = body.websiteUrl?.trim();

    if (!websiteUrl) {
      return NextResponse.json(
        { error: "websiteUrl is required" },
        { status: 400 }
      );
    }

    const website = await ingestWebsite(websiteUrl);
    const hostname = new URL(website.url).hostname.replace(/^www\./, "");
    const agentName = body.name?.trim() || titleFromHost(hostname);
    const baseInstructions =
      body.instructions?.trim() ||
      "Answer visitor questions clearly, cite the business context when useful, collect lead details for demo or sales requests, and escalate when uncertain.";

    const generated = await generateAgentProfile({
      name: agentName,
      websiteUrl: website.url,
      websiteContent: website.content,
      baseInstructions,
    });
    const slug = slugify(agentName);

    const convex = getConvexClient();
    const agentId = await convex.mutation(api.agents.create, {
      name: agentName,
      slug,
      websiteUrl: website.url,
      instructions: generated.instructions,
      summary: generated.summary,
      model: "openai/gpt-4.1-mini",
      themeColor: "#6b5cff",
      welcomeMessage: generated.welcomeMessage,
      suggestedQuestions: generated.suggestedQuestions,
      tools: body.tools ?? [],
    });

    await convex.mutation(api.sources.add, {
      agentId,
      type: "website",
      title: `${hostname} website`,
      url: website.url,
      content: website.content,
    });

    return NextResponse.json({
      agentId,
      slug,
      agent: {
        name: agentName,
        slug,
        websiteUrl: website.url,
        summary: generated.summary,
        suggestedQuestions: generated.suggestedQuestions,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create agent",
      },
      { status: 500 }
    );
  }
}

async function generateAgentProfile({
  name,
  websiteUrl,
  websiteContent,
  baseInstructions,
}: {
  name: string;
  websiteUrl: string;
  websiteContent: string;
  baseInstructions: string;
}) {
  const fallback = {
    summary: `${name} assistant trained from ${websiteUrl}.`,
    instructions: baseInstructions,
    welcomeMessage: `Hi! I am the ${name} assistant. What can I help you with?`,
    suggestedQuestions: [
      "What do you offer?",
      "How much does it cost?",
      "Can I talk to a human?",
      "How do I get started?",
    ],
  };

  try {
    const text = await openRouterChat({
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You create concise AI chatbot configuration JSON. Return only valid JSON with keys: summary, instructions, welcomeMessage, suggestedQuestions.",
        },
        {
          role: "user",
          content: `Business name: ${name}
Website: ${websiteUrl}
Base instructions: ${baseInstructions}

Website content:
${websiteContent}`,
        },
      ],
    });

    const parsed = JSON.parse(stripCodeFence(text)) as Partial<typeof fallback>;

    return {
      summary: parsed.summary || fallback.summary,
      instructions: parsed.instructions || fallback.instructions,
      welcomeMessage: parsed.welcomeMessage || fallback.welcomeMessage,
      suggestedQuestions:
        Array.isArray(parsed.suggestedQuestions) &&
        parsed.suggestedQuestions.length > 0
          ? parsed.suggestedQuestions.slice(0, 4)
          : fallback.suggestedQuestions,
    };
  } catch {
    return fallback;
  }
}

function stripCodeFence(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function titleFromHost(hostname: string) {
  return hostname
    .split(".")[0]
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "agent"}-${Math.random().toString(36).slice(2, 8)}`;
}
