import { NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

function hashPassword(password: string) {
  const salt = "maestro-events-salt";
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, hash: string) {
  const hashedPassword = hashPassword(password);

  const hashBuffer = Buffer.from(hash, "hex");
  const passwordBuffer = Buffer.from(hashedPassword, "hex");

  if (hashBuffer.length !== passwordBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, passwordBuffer);
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "יש להזין שם משתמש וסיסמה" },
        { status: 400 }
      );
    }

    // חיפוש המשתמש במסד הנתונים
    let user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

// יצירת / איפוס מנהל ראשי
if (username === "admin" && password === "Maestro2026!") {
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: "admin",
        passwordHash: hashPassword("Maestro2026!"),
        role: "ADMIN",
        permissions: "[]",
        isActive: true,
      },
    });
  } else {
    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: hashPassword("Maestro2026!"),
        isActive: true,
        role: "admin",
      },
    });
  }
}

    // משתמש לא קיים
    if (!user) {
      return NextResponse.json(
        { error: "שם המשתמש או הסיסמה שגויים" },
        { status: 401 }
      );
    }

    // משתמש חסום
    if (!user.isActive) {
      return NextResponse.json(
        { error: "המשתמש אינו פעיל" },
        { status: 403 }
      );
    }

    // בדיקת סיסמה
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "שם המשתמש או הסיסמה שגויים" },
        { status: 401 }
      );
    }

    // יצירת session
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

response.cookies.set(
  "maestroAdminSession",
  String(user.id),
  {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  }
);

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "אירעה שגיאה בהתחברות" },
      { status: 500 }
    );
  }
}