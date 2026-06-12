import { NextResponse } from "next/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex-http";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { model } = (await req.json()) as { model?: string };

    if (!model?.trim()) {
      return NextResponse.json({ error: "model is required" }, { status: 400 });
    }

    await getConvexClient().mutation(api.agents.update, {
      agentId: agentId as Id<"agents">,
      model: model.trim(),
    });

    return NextResponse.json({ ok: true, model: model.trim() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save model" },
      { status: 500 }
    );
  }
}
