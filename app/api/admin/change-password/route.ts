import { NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";

const SALT = "maestro-events-salt";

function hashPassword(password: string) {
  return scryptSync(password, SALT, 64).toString("hex");
}

function verifyPassword(
  password: string,
  hash: string
) {
  try {
    const hashedPassword = hashPassword(password);

    const hashBuffer = Buffer.from(hash, "hex");
    const passwordBuffer = Buffer.from(
      hashedPassword,
      "hex"
    );

    if (
      hashBuffer.length !==
      passwordBuffer.length
    ) {
      return false;
    }

    return timingSafeEqual(
      hashBuffer,
      passwordBuffer
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // ==========================================
    // בדיקת המשתמש המחובר
    // ==========================================

    const currentUser = await getAdminUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error:
            "המשתמש אינו מחובר למערכת",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // קבלת הנתונים
    // ==========================================

    const body = await request.json();

    const currentPassword = String(
      body.currentPassword || ""
    );

    const newPassword = String(
      body.newPassword || ""
    );

    const confirmPassword = String(
      body.confirmPassword || ""
    );

    // ==========================================
    // בדיקות
    // ==========================================

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return NextResponse.json(
        {
          error:
            "יש למלא את כל השדות",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error:
            "הסיסמה החדשה חייבת להכיל לפחות 6 תווים",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          error:
            "הסיסמאות החדשות אינן זהות",
        },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          error:
            "הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // בדיקת הסיסמה הנוכחית
    // ==========================================

    const validPassword = verifyPassword(
      currentPassword,
      (
        await prisma.user.findUnique({
          where: {
            id: currentUser.id,
          },
          select: {
            passwordHash: true,
          },
        })
      )?.passwordHash || ""
    );

    if (!validPassword) {
      return NextResponse.json(
        {
          error:
            "הסיסמה הנוכחית שגויה",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // שמירת הסיסמה החדשה
    // ==========================================

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        passwordHash:
          hashPassword(newPassword),
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "הסיסמה שונתה בהצלחה",
    });
  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "אירעה שגיאה בשינוי הסיסמה",
      },
      { status: 500 }
    );
  }
}