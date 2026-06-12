import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { ConvexHttpClient } from "convex/browser";
import type { NextRequest } from "next/server";
import { api } from "@/convex/_generated/api";

function normalizeText(value: unknown) {
  if (typeof value !== "string") return undefined;
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function planFromPayload(payload: Record<string, any>, eventType: string) {
  const candidates = [
    payload?.plan?.slug,
    payload?.plan?.id,
    payload?.plan?.name,
    payload?.items?.[0]?.plan?.slug,
    payload?.items?.[0]?.plan?.id,
    payload?.items?.[0]?.plan?.name,
  ];
  const raw = candidates.find(value => typeof value === "string" && value.trim().length > 0);
  const slug = normalizeText(raw);
  if (slug === "monthly" || slug === "pro_monthly") return "monthly";
  if (slug === "quarterly" || slug === "pro_quarterly") return "quarterly";
  if (slug === "yearly" || slug === "pro_yearly") return "yearly";
  if (slug === "annual") return "yearly";
  if (slug === "pro") return "monthly";
  if (slug && slug.includes("quarter")) return "quarterly";
  if (slug && slug.includes("year")) return "yearly";
  if (slug && slug.includes("month")) return "monthly";
  if (!slug && eventType.includes("subscription.deleted")) return "free";
  if (!slug && /cancel|expire|trial_end|subscription\.ended/i.test(eventType)) return "free";
  return slug === "free_user" || slug === "free" ? "free" : undefined;
}

function clerkUserIdFromPayload(payload: Record<string, any>) {
  return payload?.user_id ?? payload?.payer?.user_id ?? payload?.subject ?? payload?.id;
}

export async function POST(req: NextRequest) {
  let event;

  try {
    event = await verifyWebhook(req);
  } catch {
    return new Response("Webhook verification failed", { status: 400 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return new Response("Convex URL missing", { status: 500 });
  }

  const payload = event.data as Record<string, any>;
  const client = new ConvexHttpClient(convexUrl);
  const eventId = `${event.type}:${payload?.id ?? Date.now()}`;

  await client.mutation(api.billing.syncClerkEvent, {
    eventId,
    eventType: event.type,
    clerkUserId: clerkUserIdFromPayload(payload),
    status: payload?.status,
    plan: planFromPayload(payload, event.type),
    subscriptionId: payload?.id,
    payload,
  });

  return Response.json({ ok: true });
}
