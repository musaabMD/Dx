import { NextResponse } from "next/server";
import { createAgent, getAgents } from "@/lib/agents";

export async function GET() {
  return NextResponse.json({ agents: await getAgents() });
}

export async function POST(request: Request) {
  const input = await request.json();
  const agent = await createAgent(input);
  return NextResponse.json({ agent }, { status: 201 });
}
