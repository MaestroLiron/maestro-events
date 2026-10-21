import { NextResponse } from "next/server";
import JSZip from "jszip";
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
      include: {
        images: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            fileName: true,
          },
        },
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

    if (gallery.images.length === 0) {
      return NextResponse.json(
        { error: "אין תמונות פעילות להורדה" },
        { status: 400 }
      );
    }

    const publicDir = path.resolve(process.cwd(), "public");
    const zip = new JSZip();
    let addedImages = 0;
    const failedImages: string[] = [];

    for (let i = 0; i < gallery.images.length; i++) {
      const image = gallery.images[i];

      try {
        const urlPath = image.url.split(/[?#]/)[0];

        if (!urlPath.startsWith("/uploads/galleries/")) {
          throw new Error("נתיב תמונה לא תקין");
        }

        const decodedPath = decodeURIComponent(urlPath);
        const filePath = path.resolve(
          publicDir,
          "." + decodedPath
        );

        if (!filePath.startsWith(publicDir + path.sep)) {
          throw new Error("נתיב מחוץ לתיקיית התמונות");
        }

        const buffer = await readFile(filePath);

        if (!buffer.length) {
          throw new Error("קובץ ריק");
        }

        let fileName = path.basename(
          image.fileName || `photo-${i + 1}.jpg`
        );

        fileName = fileName
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
          .trim();

        if (!fileName || fileName === "." || fileName === "..") {
          fileName = `photo-${i + 1}.jpg`;
        }

        zip.file(`${i + 1}-${fileName}`, buffer);
        addedImages++;
      } catch (error) {
        console.error(
          "Gallery ZIP image error:",
          image.url,
          error
        );
        failedImages.push(image.url);
      }
    }

    if (addedImages === 0) {
      return NextResponse.json(
        {
          error: "לא נמצאו קובצי תמונות לקריאה בשרת",
          totalImages: gallery.images.length,
          failedImages: failedImages.length,
        },
        { status: 500 }
      );
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const safeGalleryName = (gallery.name || "Maestro Gallery")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .trim();

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          `attachment; filename="maestro-gallery.zip"; filename*=UTF-8''${encodeURIComponent(
            (safeGalleryName || "Maestro Gallery") + ".zip"
          )}`,
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("DOWNLOAD GALLERY ERROR:", error);

    return NextResponse.json(
      { error: "אירעה שגיאה בהכנת הורדת הגלריה" },
      { status: 500 }
    );
  }
}