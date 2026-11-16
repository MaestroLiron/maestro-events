"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type PopupSettings = {
  popupEnabled: boolean;
  popupImage: string | null;
  popupTargetUrl: string;
  popupButtonText: string;
  popupDelay: number;
  popupFrequency: string;
};

export default function SitePopup() {
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [settings, setSettings] =
    useState<PopupSettings | null>(null);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    async function loadPopup() {
      try {
        const response = await fetch("/api/admin/popup", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("טעינת הגדרות הפופ־אפ נכשלה");
        }

        const data: PopupSettings = await response.json();

        if (
          cancelled ||
          !data.popupEnabled ||
          !data.popupImage
        ) {
          return;
        }

        const frequency = data.popupFrequency;
        const storageKey = "maestro-popup-" + frequency;
        const previous = localStorage.getItem(storageKey);
        const now = Date.now();

        // פעם אחת בלבד
        if (frequency === "once" && previous) {
          return;
        }

        // פעם ביום
        if (frequency === "daily" && previous) {
          const today = new Date().toDateString();

          if (previous === today) {
            return;
          }
        }

        // פעם בשבוע
        if (frequency === "weekly" && previous) {
          const previousTime = Number(previous);

          if (
            Number.isFinite(previousTime) &&
            now - previousTime <
              7 * 24 * 60 * 60 * 1000
          ) {
            return;
          }
        }

        setSettings(data);

        timer = setTimeout(() => {
          if (cancelled) return;

          // שמירת מועד ההצגה
          if (frequency === "once") {
            localStorage.setItem(storageKey, "shown");
          }

          if (frequency === "daily") {
            localStorage.setItem(
              storageKey,
              new Date().toDateString()
            );
          }

          if (frequency === "weekly") {
            localStorage.setItem(
              storageKey,
              String(Date.now())
            );
          }

          setVisible(true);
        }, Math.max(0, data.popupDelay) * 1000);

      } catch (error) {
        console.error("POPUP LOAD ERROR:", error);
      }
    }

    loadPopup();

    return () => {
      cancelled = true;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [pathname]);

  if (!visible || !settings || !settings.popupImage) {
    return null;
  }

  // סגירת הפופ־אפ
  function closePopup() {
    setVisible(false);
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={closePopup}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Maestro Events"
        className="relative bg-[#111] border border-[#D4AF37] rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        {/* כפתור סגירה */}
        <button
          type="button"
          onClick={closePopup}
          aria-label="סגירת חלון"
          className="absolute top-3 right-3 z-10 bg-black/80 text-white w-10 h-10 rounded-full text-2xl flex items-center justify-center hover:bg-black transition"
        >
          ×
        </button>

        {/* תמונת הפופ־אפ */}
        <img
          src={settings.popupImage!}
          alt="Maestro Events"
          className="block w-full max-h-[70vh] object-contain bg-black"
        />

        {/* כפתור השארת פרטים */}
        <div className="p-4">
          <a
            href={settings.popupTargetUrl}
            onClick={closePopup}
            className="block w-full text-center bg-[#D4AF37] text-black font-bold rounded-xl py-4 hover:bg-yellow-500 transition"
          >
            {settings.popupButtonText}
          </a>
        </div>
      </div>
    </div>
  );
}