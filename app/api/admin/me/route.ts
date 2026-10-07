import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";

export async function GET() {
  try {
    const user = await getAdminUser();

    if (!user) {
      return NextResponse.json(
        { error: "לא מחובר" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
    });
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);

    return NextResponse.json(
      { error: "שגיאה בטעינת המשתמש" },
      { status: 500 }
    );
  }
}