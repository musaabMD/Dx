import { NextRequest, NextResponse } from "next/server";
import { getDocx } from "@/lib/onlyoffice-document-store";

export const dynamic = "force-dynamic";

/** Lets browser demos (e.g. sweetwisdom.github.io) fetch the registered .docx. */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { ...CORS_HEADERS } });
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return new NextResponse(null, { status: 400, headers: { ...CORS_HEADERS } });
  }
  const buffer = getDocx(id);
  if (!buffer) {
    return new NextResponse(null, { status: 404, headers: { ...CORS_HEADERS } });
  }
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `inline; filename="document.docx"`,
      "Cache-Control": "no-store",
      ...CORS_HEADERS,
    },
  });
}
