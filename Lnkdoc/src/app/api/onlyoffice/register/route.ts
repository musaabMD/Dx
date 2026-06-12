import { NextResponse } from "next/server";
import { storeDocx } from "@/lib/onlyoffice-document-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  const ab = await file.arrayBuffer();
  const buffer = Buffer.from(ab);
  if (buffer.length === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (buffer.length > 40 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 40MB)" }, { status: 413 });
  }
  const id = storeDocx(buffer);
  return NextResponse.json({ id });
}
