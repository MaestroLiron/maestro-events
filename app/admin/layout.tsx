"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserRole = "admin" | "employee" | "viewer";

type CurrentUser = {
  id: number;
  username: string;
  role: UserRole;
  permissions?: string;
};

type MenuItem = {
  name: string;
  href: string;
  icon: string;
  roles: UserRole[];
};

const menu: MenuItem[] = [
  {
    name: "דאשבורד",
    href: "/admin/dashboard",
    icon: "🏠",
    roles: ["admin", "employee", "viewer"],
  },
  {
    name: "לקוחות",
    href: "/admin/clients",
    icon: "👥",
    roles: ["admin", "employee", "viewer"],
  },
  {
    name: "יומן אירועים",
    href: "/admin/calendar",
    icon: "📅",
    roles: ["admin", "employee", "viewer"],
  },
  {
    name: "שירותים",
    href: "/admin/services",
    icon: "🛠️",
    roles: ["admin", "employee", "viewer"],
  },
  {
    name: "תיק עבודות",
    href: "/admin/portfolio",
    icon: "🖼️",
    roles: ["admin", "employee", "viewer"],
  },
  {
    name: "המלצות",
    href: "/admin/testimonials",
    icon: "⭐",
    roles: ["admin", "employee", "viewer"],
  },
  {
    name: "גלריות",
    href: "/admin/galleries",
    icon: "📸",
    roles: ["admin", "employee", "viewer"],
  },
  {
    name: "חוזים",
    href: "/admin/contracts",
    icon: "📄",
    roles: ["admin", "employee", "viewer"],
  },
  {
    name: "קבלות",
    href: "/admin/receipts",
    icon: "🧾",
    roles: ["admin", "employee", "viewer"],
  },
  {
    name: "הצעות מחיר",
    href: "/admin/quotes",
    icon: "💰",
    roles: ["admin", "employee", "viewer"],
  },
  {
    name: "פניות",
    href: "/admin/leads",
    icon: "📞",
    roles: ["admin", "employee", "viewer"],
  },
  {
    name: "הגדרות",
    href: "/admin/settings",
    icon: "⚙️",
    roles: ["admin"],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin";

  const isDashboard =
    pathname === "/admin/dashboard" ||
    pathname === "/admin";

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [userLoading, setUserLoading] =
    useState(true);

  // ==========================================
  // טעינת המשתמש המחובר
  // ==========================================

  useEffect(() => {
    if (isLoginPage) {
      setCurrentUser(null);
      setUserLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCurrentUser() {
      try {
        setUserLoading(true);

        const response = await fetch(
          "/api/admin/me",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setCurrentUser(null);
          }

          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setCurrentUser(data);
        }
      } catch (error) {
        console.error(
          "שגיאה בטעינת המשתמש:",
          error
        );

        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setUserLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [pathname, isLoginPage]);

  // ==========================================
  // הגנה על דפים לפי תפקיד
  // ==========================================

  useEffect(() => {
    if (
      userLoading ||
      !currentUser ||
      isLoginPage
    ) {
      return;
    }

    // ========================================
    // הגדרות — מנהל בלבד
    // ========================================

    if (
      pathname.startsWith("/admin/settings") &&
      currentUser.role !== "admin"
    ) {
      router.replace("/admin/dashboard");
      return;
    }
  }, [
    pathname,
    currentUser,
    userLoading,
    isLoginPage,
    router,
  ]);

  // ==========================================
  // תפריט לפי הרשאות
  // ==========================================

  const visibleMenu =
    currentUser && !userLoading
      ? menu.filter((item) =>
          item.roles.includes(
            currentUser.role
          )
        )
      : [];

  // ==========================================
  // התנתקות
  // ==========================================

  const handleLogout = async () => {
    try {
      await fetch(
        "/api/admin/logout",
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "שגיאה בהתנתקות:",
        error
      );
    }

    window.location.href = "/admin";
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#090909] text-white"
    >
      {/* ==========================================
          סרגל ניהול
      ========================================== */}

      {!isLoginPage && (
        <>
          <header
            className="
              fixed
              top-0
              right-0
              left-0
              z-[9998]
              bg-[#0d0d0d]/95
              backdrop-blur-xl
              border-b
              border-[#292929]
              shadow-[0_10px_40px_rgba(0,0,0,0.35)]
            "
          >
            {/* ==========================================
                שורה עליונה
            ========================================== */}

            <div
              className="
                min-h-[78px]
                px-4
                md:px-8
                flex
                items-center
                justify-between
                gap-4
              "
            >
              {/* לוגו */}

              <Link
                href="/admin/dashboard"
                className="
                  flex
                  items-center
                  shrink-0
                  hover:opacity-90
                  transition
                "
              >
                <Image
                  src="/logo.png"
                  alt="Maestro Events"
                  width={145}
                  height={58}
                  className="object-contain"
                  priority
                />
              </Link>

              {/* צד שמאל */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                  md:gap-3
                "
              >
                {/* משתמש מחובר */}

                {!userLoading &&
                  currentUser && (
                    <div
                      className="
                        hidden
                        lg:flex
                        items-center
                        gap-2
                        border
                        border-white/10
                        bg-white/5
                        px-4
                        py-2.5
                        rounded-xl
                      "
                    >
                      <span className="text-[#D4AF37]">
                        👤
                      </span>

                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-bold text-white">
                          {currentUser.username}
                        </span>

                        <span className="text-[11px] text-gray-400">
                          {currentUser.role ===
                            "admin" &&
                            "מנהל"}

                          {currentUser.role ===
                            "employee" &&
                            "עובד"}

                          {currentUser.role ===
                            "viewer" &&
                            "צפייה בלבד"}
                        </span>
                      </div>
                    </div>
                  )}

                {/* חזרה לאתר */}

                <Link
                  href="/"
                  className="
                    hidden
                    sm:flex
                    items-center
                    justify-center
                    gap-2
                    border
                    border-[#D4AF37]/60
                    text-[#D4AF37]
                    px-4
                    py-2.5
                    rounded-xl
                    hover:bg-[#D4AF37]
                    hover:text-black
                    hover:border-[#D4AF37]
                    transition
                    font-semibold
                    text-sm
                  "
                >
                  🌐
                  <span>חזרה לאתר</span>
                </Link>

                {/* התנתקות */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    border
                    border-red-500/40
                    bg-red-500/5
                    text-red-400
                    px-4
                    py-2.5
                    rounded-xl
                    hover:bg-red-500
                    hover:text-white
                    hover:border-red-500
                    transition
                    font-semibold
                    text-sm
                  "
                >
                  🚪

                  <span className="hidden sm:inline">
                    התנתקות
                  </span>
                </button>
              </div>
            </div>

            {/* ==========================================
                תפריט
            ========================================== */}

            <nav
              className="
                px-4
                md:px-8
                pb-3
                flex
                gap-2
                overflow-x-auto
                scrollbar-thin
                scrollbar-thumb-[#D4AF37]/40
                scrollbar-track-transparent
              "
            >
              {visibleMenu.map((item) => {
                const active =
                  item.href ===
                  "/admin/dashboard"
                    ? pathname ===
                      "/admin/dashboard"
                    : pathname.startsWith(
                        item.href
                      );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex
                      items-center
                      justify-center
                      gap-2
                      whitespace-nowrap
                      px-4
                      py-2.5
                      rounded-xl
                      border
                      text-sm
                      font-semibold
                      transition-all
                      duration-200
                      shrink-0

                      ${
                        active
                          ? `
                            bg-[#D4AF37]
                            text-black
                            border-[#D4AF37]
                            shadow-[0_0_18px_rgba(212,175,55,0.18)]
                          `
                          : `
                            bg-[#151515]
                            text-gray-300
                            border-[#292929]
                            hover:border-[#D4AF37]
                            hover:text-[#D4AF37]
                            hover:bg-[#1a1a1a]
                          `
                      }
                    `}
                  >
                    <span className="text-base">
                      {item.icon}
                    </span>

                    <span>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </header>

          {/* ==========================================
              מקום לסרגל הקבוע
          ========================================== */}

          <div className="h-[135px]" />
        </>
      )}

      {/* ==========================================
          תוכן
      ========================================== */}

      {children}

      {/* ==========================================
          כפתור חזרה לדאשבורד
      ========================================== */}

      {!isLoginPage && !isDashboard && (
        <Link
          href="/admin/dashboard"
          className="
            fixed
            bottom-6
            right-6
            z-[9997]
            bg-[#D4AF37]
            text-black
            font-bold
            px-6
            py-3
            rounded-full
            shadow-[0_8px_30px_rgba(0,0,0,0.45)]
            hover:bg-[#e5c451]
            hover:scale-105
            transition-all
          "
        >
          ← חזרה לדאשבורד
        </Link>
      )}
    </div>
  );
}