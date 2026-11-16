import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.popupSettings.findUnique({
      where: { id: 1 },
    });

    return NextResponse.json({
      popupEnabled: settings?.popupEnabled ?? false,
      popupImage: settings?.popupImage ?? null,
      popupTargetUrl: settings?.popupTargetUrl ?? "/#contact",
      popupButtonText:
        settings?.popupButtonText ?? "להשארת פרטים",
      popupDelay: settings?.popupDelay ?? 1,
      popupFrequency: settings?.popupFrequency ?? "daily",
    });
  } catch (error) {
    console.error("GET POPUP ERROR:", error);

    return NextResponse.json(
      { error: "לא ניתן לטעון את הגדרות הפופ־אפ" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAdminUser();

    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: "אין הרשאה לשנות הגדרות פופ־אפ" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const popupEnabled = body.popupEnabled === true;
    const popupImage = String(body.popupImage || "").trim();

    const popupTargetUrl = String(
      body.popupTargetUrl || "/#contact"
    ).trim();

    const popupButtonText = String(
      body.popupButtonText || "להשארת פרטים"
    ).trim();

    const popupDelay = Number(body.popupDelay ?? 1);

    const popupFrequency = String(
      body.popupFrequency || "daily"
    );

    if (popupEnabled && !popupImage) {
      return NextResponse.json(
        { error: "יש להעלות תמונה לפני הפעלת הפופ־אפ" },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(popupDelay) ||
      popupDelay < 0 ||
      popupDelay > 60
    ) {
      return NextResponse.json(
        { error: "זמן ההשהיה חייב להיות בין 0 ל־60 שניות" },
        { status: 400 }
      );
    }

    if (
      !["always", "daily", "weekly", "once"].includes(
        popupFrequency
      )
    ) {
      return NextResponse.json(
        { error: "תדירות הצגה לא תקינה" },
        { status: 400 }
      );
    }

    if (
      !popupTargetUrl.startsWith("/") &&
      !/^https?:\/\//i.test(popupTargetUrl)
    ) {
      return NextResponse.json(
        { error: "כתובת יעד לא תקינה" },
        { status: 400 }
      );
    }

    const settings = await prisma.popupSettings.upsert({
      where: { id: 1 },

      update: {
        popupEnabled,
        popupImage: popupImage || null,
        popupTargetUrl,
        popupButtonText,
        popupDelay,
        popupFrequency,
      },

      create: {
        id: 1,
        popupEnabled,
        popupImage: popupImage || null,
        popupTargetUrl,
        popupButtonText,
        popupDelay,
        popupFrequency,
      },
    });

    return NextResponse.json({
      success: true,
      settings,
      message: "הגדרות הפופ־אפ נשמרו בהצלחה",
    });
  } catch (error) {
    console.error("SAVE POPUP ERROR:", error);

    return NextResponse.json(
      { error: "שגיאה בשמירת הגדרות הפופ־אפ" },
      { status: 500 }
    );
  }
}