import { NextRequest, NextResponse } from "next/server";
import { addMessage, getMessages, type Message } from "@/lib/store";
import { getExam } from "@/lib/exams";
import { getOrCreateParticipant } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!getExam(slug)) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }
  const channelKey = req.nextUrl.searchParams.get("channel") || "main";
  return NextResponse.json({ messages: getMessages(slug, channelKey) });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!getExam(slug)) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  const participant = await getOrCreateParticipant();

  let body: { text?: string; channelKey?: string; replyToId?: string; dmToUserId?: string; dmToUsername?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = body.text?.toString().trim();
  if (!text) {
    return NextResponse.json({ error: "Message is empty" }, { status: 400 });
  }
  if (text.length > 1000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const channelKey = body.channelKey?.toString().trim() || "main";
  const replySource =
    body.replyToId && getMessages(slug, channelKey).find((m) => m.id === body.replyToId);

  const msg: Message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    examSlug: slug,
    channelKey,
    userId: participant.id,
    username: participant.name,
    avatarColor: participant.avatarColor,
    text,
    dmToUserId: body.dmToUserId?.trim() || undefined,
    dmToUsername: body.dmToUsername?.trim() || undefined,
    replyTo: replySource
      ? {
          id: replySource.id,
          username: replySource.username,
          text: replySource.text.slice(0, 160),
        }
      : undefined,
    createdAt: Date.now(),
  };
  addMessage(msg);
  return NextResponse.json({ message: msg, participant });
}
