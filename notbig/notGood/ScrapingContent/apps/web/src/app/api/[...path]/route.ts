import { NextRequest } from "next/server";

async function proxy(req: NextRequest, params: { path?: string[] }) {
  const apiBase = process.env.API_BASE_URL;
  const adminKey = process.env.ADMIN_KEY;

  if (!apiBase || !adminKey) {
    return Response.json({ error: "Missing API_BASE_URL or ADMIN_KEY" }, { status: 500 });
  }

  const path = (params.path ?? []).join("/");
  const targetUrl = new URL(`/api/${path}${req.nextUrl.search}`, apiBase);

  const bodyAllowed = req.method !== "GET" && req.method !== "HEAD";
  const response = await fetch(targetUrl.toString(), {
    method: req.method,
    headers: {
      "x-admin-key": adminKey,
      "content-type": "application/json"
    },
    body: bodyAllowed ? await req.text() : undefined,
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") ?? "application/json";
  const raw = await response.arrayBuffer();
  return new Response(raw, {
    status: response.status,
    headers: {
      "content-type": contentType
    }
  });
}

export async function GET(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, await context.params);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, await context.params);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, await context.params);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, await context.params);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, await context.params);
}
