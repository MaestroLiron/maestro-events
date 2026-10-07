import { NextResponse } from "next/server";
import JSZip from "jszip";

import { PrismaClient } from "../../../../../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// ==========================================
// Prisma
// ==========================================

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

// ==========================================
// GET - הורדת כל הגלריה
// ==========================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    // ========================================
    // קבלת slug
    // ========================================

    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        {
          error: "קישור גלריה לא תקין",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // מציאת הגלריה
    // ========================================

    const gallery =
      await prisma.clientGallery.findUnique({
        where: {
          slug: slug,
        },
        include: {
          images: {
            where: {
              isActive: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
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
        {
          error: "הגלריה לא נמצאה",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================
    // בדיקת פעילות
    // ========================================

    if (!gallery.isActive) {
      return NextResponse.json(
        {
          error: "הגלריה אינה פעילה",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================
    // בדיקת תוקף
    // ========================================

    if (
      gallery.expiresAt &&
      new Date(gallery.expiresAt).getTime() <
        Date.now()
    ) {
      return NextResponse.json(
        {
          error: "תוקף הגלריה הסתיים",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================
    // בדיקה שיש תמונות
    // ========================================

    if (gallery.images.length === 0) {
      return NextResponse.json(
        {
          error: "אין תמונות להורדה",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // יצירת ZIP
    // ========================================

    const zip = new JSZip();

    // ========================================
    // כתובת האתר
    // ========================================

    const requestUrl = new URL(request.url);

    const origin = requestUrl.origin;

    // ========================================
    // הורדת התמונות
    // ========================================

    for (
      let index = 0;
      index < gallery.images.length;
      index++
    ) {
      const image = gallery.images[index];

      try {
        let imageUrl = image.url;

        // אם מדובר בנתיב מקומי
        if (imageUrl.startsWith("/")) {
          imageUrl = `${origin}${imageUrl}`;
        }

        const response = await fetch(imageUrl);

        if (!response.ok) {
          console.error(
            "לא ניתן להוריד תמונה:",
            imageUrl
          );

          continue;
        }

        const imageBuffer =
          await response.arrayBuffer();

        // ======================================
        // שם הקובץ
        // ======================================

        let fileName =
          image.fileName ||
          `photo-${index + 1}.jpg`;

        fileName = fileName.replace(
          /[<>:"/\\|?*\x00-\x1F]/g,
          "_"
        );

        fileName =
          `${index + 1}-${fileName}`;

        // ======================================
        // הוספת התמונה ל-ZIP
        // ======================================

        zip.file(
          fileName,
          imageBuffer
        );
      } catch (imageError) {
        console.error(
          "שגיאה בהורדת תמונה:",
          image.url,
          imageError
        );
      }
    }

    // ========================================
    // יצירת ZIP כ-ArrayBuffer
    // ========================================

    const zipBuffer =
      await zip.generateAsync({
        type: "arraybuffer",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6,
        },
      });

    // ========================================
    // בדיקה שהקובץ לא ריק
    // ========================================

    if (zipBuffer.byteLength === 0) {
      return NextResponse.json(
        {
          error:
            "לא הצלחנו להכין את התמונות להורדה",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================
    // שם הגלריה
    // ========================================

    let galleryName =
      gallery.name || "Maestro Gallery";

    galleryName = galleryName
      .replace(
        /[<>:"/\\|?*\x00-\x1F]/g,
        "_"
      )
      .trim();

    if (!galleryName) {
      galleryName = "Maestro Gallery";
    }

    // ========================================
    // החזרת ZIP
    // ========================================

    return new NextResponse(
      zipBuffer,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/zip",

          "Content-Disposition":
            `attachment; filename="maestro-gallery.zip"; filename*=UTF-8''${encodeURIComponent(
              galleryName + ".zip"
            )}`,

          "Cache-Control":
            "no-store, no-cache, must-revalidate",

          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error(
      "DOWNLOAD ALL GALLERY ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "אירעה שגיאה בהכנת הורדת הגלריה",
      },
      {
        status: 500,
      }
    );
  }
}