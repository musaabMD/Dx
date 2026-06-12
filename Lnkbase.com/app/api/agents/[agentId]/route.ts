import { NextResponse } from "next/server";
import { deleteAgent, getAgent, updateAgent } from "@/lib/agents";

export async function GET(_request: Request, { params }: { params: { agentId: string } }) {
  const agent = await getAgent(params.agentId);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({ agent });
}

export async function PUT(request: Request, { params }: { params: { agentId: string } }) {
  const input = await request.json();
  const agent = await updateAgent(params.agentId, input);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({ agent });
}

export async function DELETE(_request: Request, { params }: { params: { agentId: string } }) {
  await deleteAgent(params.agentId);
  return NextResponse.json({ ok: true });
}
