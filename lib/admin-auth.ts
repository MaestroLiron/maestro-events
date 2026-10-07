import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getAdminUser() {
  try {
    const cookieStore = await cookies();

    const session = cookieStore.get("maestroAdminSession")?.value;

    if (!session) {
      return null;
    }

    const userId = Number(session);

    if (!userId || Number.isNaN(userId)) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        role: true,
        permissions: true,
        isActive: true,
      },
    });

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("GET ADMIN USER ERROR:", error);
    return null;
  }
}

export async function requireAdminUser() {
  const user = await getAdminUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export function isAdmin(user: {
  role: string;
}) {
  return user.role === "admin";
}

export function isEmployee(user: {
  role: string;
}) {
  return user.role === "employee";
}

export function isViewer(user: {
  role: string;
}) {
  return user.role === "viewer";
}

export function canManageUsers(user: {
  role: string;
}) {
  return user.role === "admin";
}

export function canEdit(user: {
  role: string;
}) {
  return (
    user.role === "admin" ||
    user.role === "employee"
  );
}

export function canView(user: {
  role: string;
}) {
  return (
    user.role === "admin" ||
    user.role === "employee" ||
    user.role === "viewer"
  );
}