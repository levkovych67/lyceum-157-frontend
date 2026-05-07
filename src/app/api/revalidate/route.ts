import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { tags?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!Array.isArray(body.tags) || body.tags.some((t) => typeof t !== "string")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  body.tags.forEach(revalidateTag);
  return NextResponse.json({ ok: true, revalidated: body.tags });
}
