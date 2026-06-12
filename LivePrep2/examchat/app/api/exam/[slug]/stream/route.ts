import { NextRequest } from "next/server";
import { getExam } from "@/lib/exams";
import { getLiveCount, subscribe, type Message } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) {
    return new Response("Not found", { status: 404 });
  }
  const channelKey = req.nextUrl.searchParams.get("channel") || "main";

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // controller closed
        }
      };

      send("hello", { live: getLiveCount(slug, exam.baseMembers) });

      const onMessage = (msg: Message) => send("message", msg);
      const unsubscribe = subscribe(slug, channelKey, onMessage);

      const presence = setInterval(() => {
        send("presence", { live: getLiveCount(slug, exam.baseMembers) });
      }, 4000);

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // ignore
        }
      }, 15000);

      const close = () => {
        clearInterval(presence);
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
