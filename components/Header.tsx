"use client";
import Link from "next/link";
import Image from "next/image";
import { User, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import activeSectionHook from "../hooks/useActiveSection";
const menuItems = [
  { name: "צור קשר", href: "/#contact" },
  { name: "אודות", href: "/#about" },
  { name: "המלצות", href: "/#testimonials" },
  { name: "למה לבחור בנו", href: "/#why-us" },
  { name: "תיק עבודות", href: "/#portfolio" },
  { name: "השירותים שלנו", href: "/#services" },
  { name: "דף הבית", href: "/" },
];
export default function Header() {
  const pathname = usePathname();
  const activeSection = activeSectionHook();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  return (
    <>
      <header
        className="
          fixed
          top-0
          left-0
          w-full
          z-[5000]
          bg-black/45
          backdrop-blur-md
          border-b
          border-yellow-500/20
        "
      >
        <div
          className="
            relative
            max-w-7xl
            mx-auto
            flex
            items-center
            justify-between
            px-4
            sm:px-6
            md:px-8
            py-3
            sm:py-4
            md:py-5
          "
        >
          {/* התחברות */}
          <Link
            href="/admin"
            onClick={closeMobileMenu}
            className={`
              relative
              z-[5001]
              w-10
              h-10
              sm:w-11
              sm:h-11
              md:w-12
              md:h-12
              flex
              items-center
              justify-center
              rounded-full
              border
              border-yellow-500
              text-yellow-500
              transition-all
              duration-300
              ${
                pathname === "/admin"
                  ? "bg-yellow-500 text-black shadow-[0_0_20px_rgba(255,215,0,0.6)]"
                  : "hover:bg-yellow-500 hover:text-black"
              }
            `}
            aria-label="התחברות"
          >
            <User size={19} />
          </Link>
          {/* לוגו Maestro Events */}
          <Link
            href="/"
            onClick={(e) => {
              closeMobileMenu();
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }
            }}
            aria-label="Maestro Events - דף הבית"
            className="
              absolute
              left-1/2
              -translate-x-1/2
              z-[5001]
              flex
              items-center
              justify-center
            "
          >
            <Image
              src="/M%20logo%20yellow-01.png"
              alt="Maestro Events"
              width={64}
              height={64}
              priority
              className="
                h-10
                w-10
                sm:h-12
                sm:w-12
                md:h-14
                md:w-14
                object-contain
              "
            />
          </Link>
          {/* תפריט מחשב */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-2 xl:gap-3">
              {menuItems.map((item) => {
                const sectionId =
                  item.href === "/"
                    ? "home"
                    : item.href.replace("/#", "");
                const isActive =
                  pathname === "/" &&
                  activeSection === sectionId;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (
                          item.href === "/" &&
                          pathname === "/"
                        ) {
                          e.preventDefault();
                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }
                      }}
                      className={`
                        relative
                        px-4
                        xl:px-6
                        py-3
                        rounded-xl
                        font-bold
                        text-sm
                        xl:text-base
                        transition-all
                        duration-300
                        whitespace-nowrap
                        ${
                          isActive
                            ? "text-black bg-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                            : "text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:scale-105"
                        }
                      `}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* כפתור פתיחת תפריט מובייל */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="
              relative
              z-[5001]
              lg:hidden
              w-10
              h-10
              sm:w-11
              sm:h-11
              flex
              items-center
              justify-center
              rounded-xl
              border
              border-yellow-500
              text-yellow-500
              bg-black/40
              active:bg-yellow-500
              active:text-black
              transition-all
              touch-manipulation
            "
            aria-label="פתיחת תפריט"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={23} />
          </button>
          <div className="hidden lg:block w-10 xl:w-12" />
        </div>
      </header>
      {/* תפריט מובייל */}
      {mobileMenuOpen && (
        <div
          className="
            fixed
            inset-0
            z-[9990]
            lg:hidden
            isolate
          "
        >
          {/* רקע */}
          <div
            onClick={closeMobileMenu}
            className="
              absolute
              inset-0
              z-0
              bg-black/80
              backdrop-blur-sm
            "
          />
          {/* חלונית התפריט */}
          <aside
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="
              fixed
              top-0
              right-0
              z-10
              h-[100dvh]
              w-[78vw]
              max-w-[330px]
              bg-[#090909]
              border-l
              border-yellow-500/30
              shadow-[-20px_0_60px_rgba(0,0,0,0.9)]
              flex
              flex-col
              overflow-hidden
              pointer-events-auto
            "
          >
            {/* כותרת התפריט */}
            <div
              className="
                shrink-0
                flex
                items-center
                justify-between
                px-5
                py-4
                border-b
                border-yellow-500/20
              "
            >
              <div>
                <div className="text-[#D4AF37] text-lg font-bold">
                  Maestro
                </div>
                <div className="text-white/40 text-[9px] tracking-[0.3em]">
                  EVENTS
                </div>
              </div>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="
                  w-9
                  h-9
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-yellow-500/50
                  text-yellow-500
                  active:bg-yellow-500
                  active:text-black
                  touch-manipulation
                "
                aria-label="סגירת תפריט"
              >
                <X size={21} />
              </button>
            </div>
            {/* קישורים - סדר הפוך במובייל */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="flex flex-col-reverse gap-1.5">
                {menuItems.map((item) => {
                  const sectionId =
                    item.href === "/"
                      ? "home"
                      : item.href.replace("/#", "");
                  const isActive =
                    pathname === "/" &&
                    activeSection === sectionId;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={`
                          relative
                          z-20
                          flex
                          items-center
                          justify-between
                          w-full
                          min-h-[46px]
                          px-4
                          rounded-xl
                          border
                          text-[15px]
                          font-semibold
                          select-none
                          touch-manipulation
                          ${
                            isActive
                              ? "bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                              : "text-[#D4AF37] border-yellow-500/15 bg-white/[0.025] active:bg-yellow-500/20"
                          }
                        `}
                      >
                        <span>{item.name}</span>
                        <span
                          className={
                            isActive
                              ? "text-black text-lg"
                              : "text-yellow-500/50 text-lg"
                          }
                        >
                          ‹
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {/* תחתית התפריט */}
            <div
              className="
                shrink-0
                px-5
                py-4
                border-t
                border-yellow-500/20
                text-center
              "
            >
              <div className="text-[#D4AF37] text-xs font-semibold">
                Maestro Events
              </div>
              <div className="text-white/35 text-[10px] mt-1">
                הופכים אירועים לזיכרונות
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}