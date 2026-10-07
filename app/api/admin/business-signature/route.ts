import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUser, isAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: "אין הרשאה. יש להתחבר למערכת." },
        { status: 401 }
      );
    }

    const settings =
      await prisma.businessSettings.findUnique({
        where: {
          id: 1,
        },
      });

    return NextResponse.json({
      businessSignatureData:
        settings?.businessSignatureData || null,
    });
  } catch (error) {
    console.error(
      "GET BUSINESS SIGNATURE ERROR:",
      error
    );

    return NextResponse.json(
      { error: "שגיאה בטעינת חתימת העסק" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: "אין הרשאה. יש להתחבר למערכת." },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: "אין לך הרשאה לשנות את חתימת העסק." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const signature =
      String(body.businessSignatureData || "").trim();

    if (!signature) {
      return NextResponse.json(
        { error: "לא נבחרה חתימה לשמירה." },
        { status: 400 }
      );
    }

    const settings =
      await prisma.businessSettings.upsert({
        where: {
          id: 1,
        },
        update: {
          businessSignatureData: signature,
        },
        create: {
          id: 1,
          businessSignatureData: signature,
        },
      });

    return NextResponse.json({
      success: true,
      businessSignatureData:
        settings.businessSignatureData,
      message: "חתימת העסק נשמרה בהצלחה",
    });
  } catch (error) {
    console.error(
      "SAVE BUSINESS SIGNATURE ERROR:",
      error
    );

    return NextResponse.json(
      { error: "שגיאה בשמירת חתימת העסק" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: "אין הרשאה. יש להתחבר למערכת." },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: "אין לך הרשאה למחוק את חתימת העסק." },
        { status: 403 }
      );
    }

    await prisma.businessSettings.upsert({
      where: {
        id: 1,
      },
      update: {
        businessSignatureData: null,
      },
      create: {
        id: 1,
        businessSignatureData: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "חתימת העסק נמחקה",
    });
  } catch (error) {
    console.error(
      "DELETE BUSINESS SIGNATURE ERROR:",
      error
    );

    return NextResponse.json(
      { error: "שגיאה במחיקת חתימת העסק" },
      { status: 500 }
    );
  }
}