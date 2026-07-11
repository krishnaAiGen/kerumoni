import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isS3Configured, presignUpload } from "@/lib/s3";

export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  }
  if (!isS3Configured()) {
    return NextResponse.json(
      { ok: false, error: "S3 is not configured on the server." },
      { status: 501 },
    );
  }

  const body = await req.json().catch(() => null);
  const filename = body?.filename as string | undefined;
  const contentType = body?.contentType as string | undefined;

  if (!filename || !contentType) {
    return NextResponse.json({ ok: false, error: "Missing filename/contentType." }, { status: 400 });
  }
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "Only images are allowed." }, { status: 400 });
  }

  const result = await presignUpload(filename, contentType);
  return NextResponse.json({ ok: true, ...result });
}
