import { NextResponse } from "next/server";
import { getAgent } from "@/lib/agents";
import { runAgent } from "@/lib/run-agent";

export async function POST(request: Request, { params }: { params: { agentId: string } }) {
  const agent = await getAgent(params.agentId);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const input = String(body.input || "");

  if (!input.trim()) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }

  try {
    const result = await runAgent(agent, input);
    return NextResponse.json({ agentId: agent.id, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Agent run failed" }, { status: 500 });
  }
}
