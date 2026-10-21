import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

import { PrismaClient } from "../../../../../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: "קישור גלריה לא תקין" },
        { status: 400 }
      );
    }

    const gallery = await prisma.clientGallery.findUnique({
      where: { slug },
      select: {
        name: true,
        slug: true,
        isActive: true,
        expiresAt: true,
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { error: "הגלריה לא נמצאה" },
        { status: 404 }
      );
    }

    if (!gallery.isActive) {
      return NextResponse.json(
        { error: "הגלריה אינה פעילה" },
        { status: 403 }
      );
    }

    if (
      gallery.expiresAt &&
      new Date(gallery.expiresAt).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "תוקף הגלריה הסתיים" },
        { status: 403 }
      );
    }

    // קובץ ZIP שנשמר מראש בתיקיית storage בשרת
    const zipPath = path.join(
      process.cwd(),
      "storage",
      "gallery-zips",
      `${gallery.slug}.zip`
    );

    let zipBuffer: Buffer;

    try {
      zipBuffer = await readFile(zipPath);
    } catch {
      return NextResponse.json(
        { error: "קובץ ה-ZIP של הגלריה עדיין לא הועלה" },
        { status: 404 }
      );
    }

    if (
      zipBuffer.length < 4 ||
      zipBuffer[0] !== 0x50 ||
      zipBuffer[1] !== 0x4b
    ) {
      return NextResponse.json(
        { error: "קובץ ה-ZIP של הגלריה אינו תקין" },
        { status: 500 }
      );
    }

    const safeName = (gallery.name || "Maestro Gallery")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .trim();

    const downloadName = `${safeName || "Maestro Gallery"}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          `attachment; filename="gallery.zip"; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("DOWNLOAD GALLERY ERROR:", error);

    return NextResponse.json(
      { error: "אירעה שגיאה בהורדת הגלריה" },
      { status: 500 }
    );
  }
}