import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    console.log("=== PORTFOLIO UPLOAD START ===");

    const formData = await request.formData();

    const file = formData.get("file");
    const mediaType = formData.get("mediaType");

    console.log("mediaType:", mediaType);

    if (!(file instanceof File)) {
      console.log("NO FILE");

      return NextResponse.json(
        {
          error: "לא נבחר קובץ",
        },
        { status: 400 }
      );
    }

    console.log("file name:", file.name);
    console.log("file type:", file.type);
    console.log(
      "file size MB:",
      (file.size / 1024 / 1024).toFixed(2)
    );

    if (
      mediaType !== "image" &&
      mediaType !== "video"
    ) {
      return NextResponse.json(
        {
          error: "סוג מדיה לא תקין",
        },
        { status: 400 }
      );
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];

    if (
      mediaType === "image" &&
      !allowedImageTypes.includes(file.type)
    ) {
      return NextResponse.json(
        {
          error:
            `סוג תמונה לא נתמך: ${file.type}`,
        },
        { status: 400 }
      );
    }

    if (
      mediaType === "video" &&
      !allowedVideoTypes.includes(file.type)
    ) {
      return NextResponse.json(
        {
          error:
            `סוג סרטון לא נתמך: ${file.type}`,
        },
        { status: 400 }
      );
    }

    const maxImageSize =
      10 * 1024 * 1024;

    const maxVideoSize =
      200 * 1024 * 1024;

    if (
      mediaType === "image" &&
      file.size > maxImageSize
    ) {
      return NextResponse.json(
        {
          error: "גודל התמונה לא יכול להיות מעל 10MB",
        },
        { status: 400 }
      );
    }

    if (
      mediaType === "video" &&
      file.size > maxVideoSize
    ) {
      return NextResponse.json(
        {
          error: "גודל הסרטון לא יכול להיות מעל 200MB",
        },
        { status: 400 }
      );
    }

    const folderName =
      mediaType === "image"
        ? "images"
        : "videos";

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "portfolio",
      folderName
    );

    await mkdir(uploadDirectory, {
      recursive: true,
    });

    const extensionMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",

      "video/mp4": "mp4",
      "video/webm": "webm",
      "video/quicktime": "mov",
      "video/x-msvideo": "avi",
    };

    const extension =
      extensionMap[file.type];

    if (!extension) {
      return NextResponse.json(
        {
          error: `לא ניתן לזהות את סוג הקובץ: ${file.type}`,
        },
        { status: 400 }
      );
    }

    const uniqueName =
      `${Date.now()}-${crypto
        .randomBytes(8)
        .toString("hex")}.${extension}`;

    const filePath = path.join(
      uploadDirectory,
      uniqueName
    );

    console.log("saving to:", filePath);

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    await writeFile(
      filePath,
      buffer
    );

    console.log("FILE SAVED SUCCESSFULLY");

    const url =
      `/uploads/portfolio/${folderName}/${uniqueName}`;

    console.log("PUBLIC URL:", url);

    return NextResponse.json(
      {
        success: true,
        url,
        filename: uniqueName,
        originalName: file.name,
        mediaType,
        size: file.size,
      },
      { status: 201 }
    );

  } catch (error) {

    console.error(
      "=== PORTFOLIO UPLOAD ERROR ==="
    );

    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "שגיאה בהעלאת הקובץ",
      },
      { status: 500 }
    );
  }
}