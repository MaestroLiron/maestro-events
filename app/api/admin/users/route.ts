import { NextResponse } from "next/server";
import { scryptSync } from "crypto";
import { prisma } from "@/lib/prisma";
import { getAdminUser, isAdmin } from "@/lib/admin-auth";

const SALT = "maestro-events-salt";

function hashPassword(password: string) {
  return scryptSync(password, SALT, 64).toString("hex");
}

// ==========================================
// בדיקת מנהל
// ==========================================

async function requireAdmin() {
  const user = await getAdminUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "אין הרשאה. יש להתחבר למערכת." },
        { status: 401 }
      ),
    };
  }

  if (!isAdmin(user)) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "אין לך הרשאה לבצע פעולה זו." },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

// ==========================================
// GET — הצגת משתמשים
// ==========================================

export async function GET() {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
        username: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      { error: "שגיאה בטעינת המשתמשים" },
      { status: 500 }
    );
  }
}

// ==========================================
// POST — יצירת משתמש
// ==========================================

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const body = await request.json();

    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const role = String(body.role || "employee");

    if (!username || !password) {
      return NextResponse.json(
        { error: "יש להזין שם משתמש וסיסמה" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "הסיסמה חייבת להכיל לפחות 6 תווים" },
        { status: 400 }
      );
    }

    if (!["admin", "employee", "viewer"].includes(role)) {
      return NextResponse.json(
        { error: "תפקיד לא תקין" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "שם המשתמש כבר קיים במערכת" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashPassword(password),
        role,
        permissions: "[]",
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, {
      status: 201,
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json(
      { error: "שגיאה ביצירת המשתמש" },
      { status: 500 }
    );
  }
}

// ==========================================
// PATCH — שינוי משתמש
// ==========================================

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const body = await request.json();

    const id = Number(body.id);

    if (!id) {
      return NextResponse.json(
        { error: "מזהה משתמש חסר" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "המשתמש לא נמצא" },
        { status: 404 }
      );
    }

    const data: {
      role?: string;
      isActive?: boolean;
      passwordHash?: string;
    } = {};

    // שינוי תפקיד
    if (body.role !== undefined) {
      if (
        !["admin", "employee", "viewer"].includes(
          body.role
        )
      ) {
        return NextResponse.json(
          { error: "תפקיד לא תקין" },
          { status: 400 }
        );
      }

      data.role = body.role;
    }

    // הפעלה / השבתה
    if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
    }

    // שינוי סיסמה
    if (body.password) {
      const password = String(body.password);

      if (password.length < 6) {
        return NextResponse.json(
          {
            error:
              "הסיסמה חייבת להכיל לפחות 6 תווים",
          },
          { status: 400 }
        );
      }

      data.passwordHash = hashPassword(password);
    }

    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        username: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return NextResponse.json(
      { error: "שגיאה בעדכון המשתמש" },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE — מחיקת משתמש
// ==========================================

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const body = await request.json();

    const id = Number(body.id);

    if (!id) {
      return NextResponse.json(
        { error: "מזהה משתמש חסר" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "המשתמש לא נמצא" },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      { error: "שגיאה במחיקת המשתמש" },
      { status: 500 }
    );
  }
}