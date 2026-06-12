import { NextResponse } from "next/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex-http";
import { openRouterChat } from "@/lib/openrouter";

type ChatBody = {
  message?: string;
  conversationId?: Id<"conversations">;
  visitorId?: string;
  pageUrl?: string;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = (await req.json()) as ChatBody;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const convex = getConvexClient();
    const typedAgentId = agentId as Id<"agents">;
    const context = await convex.query(api.chats.getContext, {
      agentId: typedAgentId,
    });

    if (!context) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const conversationId =
      body.conversationId ??
      (await convex.mutation(api.chats.createConversation, {
        agentId: typedAgentId,
        visitorId: body.visitorId ?? crypto.randomUUID(),
        pageUrl: body.pageUrl,
      }));

    await convex.mutation(api.chats.addMessage, {
      agentId: typedAgentId,
      conversationId,
      role: "user",
      content: message,
    });

    const sourceContext = context.sources
      .map((source) => `Source: ${source.title}\n${source.content}`)
      .join("\n\n---\n\n")
      .slice(0, 32000);

    const reply = await openRouterChat({
      model: context.agent.model ?? "openai/gpt-4.1-mini",
      temperature: 0.25,
      messages: [
        {
          role: "system",
          content: `You are ${context.agent.name}, an embedded website assistant.
Business summary: ${context.agent.summary}
Instructions: ${context.agent.instructions}
If the user asks for human support, demo, pricing quote, or follow-up, ask for their email naturally.
Use only the context below when answering factual business questions. If unsure, say so and offer follow-up.

Training context:
${sourceContext}`,
        },
        { role: "user", content: message },
      ],
    });

    await convex.mutation(api.chats.addMessage, {
      agentId: typedAgentId,
      conversationId,
      role: "assistant",
      content: reply,
    });

    return NextResponse.json({
      conversationId,
      reply,
      suggestedQuestions: context.agent.suggestedQuestions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 }
    );
  }
}
