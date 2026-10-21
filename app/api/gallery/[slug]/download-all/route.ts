import { NextResponse } from "next/server";
import JSZip from "jszip";
import { readFile } from "fs/promises";
import path from "path";

import { PrismaClient } from "../../../../../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ==========================================
// Prisma
// ==========================================

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

// ==========================================
// GET - הורדת כל הגלריה
// ==========================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{ slug: string }>;
  }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: "קישור גלריה לא תקין" },
        { status: 400 }
      );
    }

    // מציאת הגלריה והתמונות הפעילות
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

    const zip = new JSZip();
    const publicDir = path.resolve(process.cwd(), "public");
    const requestUrl = new URL(request.url);

    let addedImages = 0;
    const failedImages: string[] = [];

    // ========================================
    // קריאת התמונות והוספתן ל-ZIP
    // ========================================

    for (let index = 0; index < gallery.images.length; index++) {
      const image = gallery.images[index];

      try {
        let imageBuffer: Buffer;
        const rawUrl = image.url.trim();

        if (!rawUrl) {
          throw new Error("כתובת התמונה ריקה");
        }

        // כתובת יחסית, או כתובת מלאה של האתר שלנו:
        // מנסים לקרוא את הקובץ ישירות מהשרת.
        let localPath: string | null = null;

        if (rawUrl.startsWith("/")) {
          localPath = rawUrl.split("?")[0].split("#")[0];
        } else {
          const parsedUrl = new URL(rawUrl);

          if (parsedUrl.origin === requestUrl.origin) {
            localPath = parsedUrl.pathname;
          }
        }

        if (localPath !== null) {
          const decodedPath = decodeURIComponent(localPath);
          const filePath = path.resolve(
            publicDir,
            `.${decodedPath}`
          );

          // מונע קריאה של קבצים מחוץ לתיקיית public.
          if (!filePath.startsWith(publicDir + path.sep)) {
            throw new Error("נתיב התמונה נמצא מחוץ לתיקיית public");
          }

          imageBuffer = await readFile(filePath);
        } else {
          // כתובת חיצונית: הורדה דרך HTTP.
          const response = await fetch(rawUrl);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          imageBuffer = Buffer.from(await response.arrayBuffer());
        }

        if (imageBuffer.length === 0) {
          throw new Error("קובץ התמונה ריק");
        }

        // יצירת שם קובץ בטוח וייחודי.
        let fileName =
          image.fileName || `photo-${index + 1}.jpg`;

        fileName = path
          .basename(fileName)
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
          .trim();

        if (!fileName || fileName === "." || fileName === "..") {
          fileName = `photo-${index + 1}.jpg`;
        }

        zip.file(`${index + 1}-${fileName}`, imageBuffer);
        addedImages++;
      } catch (imageError) {
        failedImages.push(image.url);

        console.error(
          "שגיאה בהוספת תמונה ל-ZIP:",
          image.url,
          imageError
        );
      }
    }

    // לא שולחים קובץ ZIP ריק.
    if (addedImages === 0) {
      return NextResponse.json(
        {
          error:
            "לא ניתן לקרוא אף תמונה. יש לבדוק את נתיבי התמונות ואת מיקום הקבצים בשרת.",
          totalImages: gallery.images.length,
          addedImages,
          failedImages: failedImages.length,
        },
        { status: 500 }
      );
    }

    // יצירת קובץ ZIP.
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    if (zipBuffer.length === 0) {
      return NextResponse.json(
        { error: "יצירת קובץ ה-ZIP נכשלה" },
        { status: 500 }
      );
    }

    let galleryName = (gallery.name || "Maestro Gallery")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .trim();

    if (!galleryName) {
      galleryName = "Maestro Gallery";
    }

    const encodedName = encodeURIComponent(`${galleryName}.zip`);

   return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          `attachment; filename="maestro-gallery.zip"; filename*=UTF-8''${encodedName}`,
        "Content-Length": String(zipBuffer.length),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("DOWNLOAD ALL GALLERY ERROR:", error);

    return NextResponse.json(
      { error: "אירעה שגיאה בהכנת הורדת הגלריה" },
      { status: 500 }
    );
  }
}