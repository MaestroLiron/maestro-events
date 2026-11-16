"use client";

import { useEffect, useRef, useState } from "react";

type PopupSettings = {
  popupEnabled: boolean;
  popupImage: string | null;
  popupTargetUrl: string;
  popupButtonText: string;
  popupDelay: number;
  popupFrequency: string;
};

const defaultSettings: PopupSettings = {
  popupEnabled: false,
  popupImage: null,
  popupTargetUrl: "/#contact",
  popupButtonText: "להשארת פרטים",
  popupDelay: 1,
  popupFrequency: "daily",
};

export default function PopupPage() {
  const [settings, setSettings] =
    useState<PopupSettings>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/popup", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "טעינת ההגדרות נכשלה");
      }

      setSettings({
        ...defaultSettings,
        ...data,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "לא ניתן לטעון את הגדרות הפופ־אפ"
      );
    } finally {
      setLoading(false);
    }
  }

  function updateSetting<K extends keyof PopupSettings>(
    key: K,
    value: PopupSettings[K]
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function uploadImage(file: File) {
    try {
      setUploading(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/admin/popup/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "העלאת התמונה נכשלה");
      }

      const imageUrl = data.url || data.imageUrl;

      if (!imageUrl) {
        throw new Error("שרת ההעלאה לא החזיר כתובת תמונה");
      }

      updateSetting("popupImage", imageUrl);
      setMessage("התמונה הועלתה בהצלחה");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "העלאת התמונה נכשלה"
      );
    } finally {
      setUploading(false);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/admin/popup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שמירת ההגדרות נכשלה");
      }

      setMessage(
        settings.popupEnabled
          ? "הפופ־אפ הופעל וההגדרות נשמרו בהצלחה"
          : "הפופ־אפ כובה וההגדרות נשמרו בהצלחה"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "שמירת ההגדרות נכשלה"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-black text-white flex items-center justify-center"
      >
        טוען הגדרות פופ־אפ...
      </div>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#080808] text-white p-4 md:p-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D4AF37]">
            ניהול פופ־אפ באתר
          </h1>

          <p className="text-gray-400 mt-2">
            העלאת תמונה וניהול הופעת חלון הפרסום באתר
          </p>
        </div>

        <section className="bg-[#151515] border border-[#333] rounded-2xl p-5 md:p-7 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                הפעלת פופ־אפ
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                ניתן להפעיל או לכבות את הפופ־אפ בכל רגע
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateSetting(
                  "popupEnabled",
                  !settings.popupEnabled
                )
              }
              aria-pressed={settings.popupEnabled}
              className={`relative w-16 h-9 rounded-full transition-colors ${
                settings.popupEnabled
                  ? "bg-green-600"
                  : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 w-7 h-7 rounded-full bg-white transition-all ${
                  settings.popupEnabled
                    ? "right-1"
                    : "right-8"
                }`}
              />
            </button>
          </div>

          <div
            className={`rounded-xl p-3 text-center font-bold ${
              settings.popupEnabled
                ? "bg-green-900/30 text-green-400"
                : "bg-red-900/30 text-red-400"
            }`}
          >
            {settings.popupEnabled
              ? "הפופ־אפ מסומן כפעיל"
              : "הפופ־אפ מסומן ככבוי"}
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-lg font-bold mb-3">
              תמונת הפופ־אפ
            </h2>

            {settings.popupImage && (
              <div className="mb-4">
                <img
                  src={settings.popupImage}
                  alt="תצוגה מקדימה של הפופ־אפ"
                  className="w-full max-h-[420px] object-contain rounded-xl bg-black border border-gray-700"
                />
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  uploadImage(file);
                }

                event.target.value = "";
              }}
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border border-[#D4AF37] text-[#D4AF37] py-3 font-bold hover:bg-[#D4AF37] hover:text-black transition disabled:opacity-50"
            >
              {uploading
                ? "מעלה תמונה..."
                : settings.popupImage
                  ? "החלפת תמונה"
                  : "בחירת תמונה להעלאה"}
            </button>
          </div>

          <div className="border-t border-gray-700 pt-6 space-y-4">
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                כתובת יעד בלחיצה
              </label>

              <input
                type="text"
                value={settings.popupTargetUrl}
                onChange={(e) =>
                  updateSetting("popupTargetUrl", e.target.value)
                }
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white"
                placeholder="/#contact"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">
                טקסט הכפתור
              </label>

              <input
                type="text"
                value={settings.popupButtonText}
                onChange={(e) =>
                  updateSetting("popupButtonText", e.target.value)
                }
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">
                השהיה לפני הצגה (בשניות)
              </label>

              <input
                type="number"
                min="0"
                max="60"
                value={settings.popupDelay}
                onChange={(e) =>
                  updateSetting(
                    "popupDelay",
                    Number(e.target.value)
                  )
                }
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-gray-300">
                תדירות הצגה
              </label>

              <select
                value={settings.popupFrequency}
                onChange={(e) =>
                  updateSetting("popupFrequency", e.target.value)
                }
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white"
              >
                <option value="always">בכל כניסה</option>
                <option value="daily">פעם ביום</option>
                <option value="weekly">פעם בשבוע</option>
                <option value="once">פעם אחת בלבד</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-3">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-900/30 border border-green-700 text-green-300 rounded-lg p-3">
              {message}
            </div>
          )}

          <button
            type="button"
            onClick={saveSettings}
            disabled={saving || uploading}
            className="w-full bg-[#D4AF37] text-black font-bold py-4 rounded-xl hover:bg-yellow-500 transition disabled:opacity-50"
          >
            {saving ? "שומר הגדרות..." : "שמירת הגדרות"}
          </button>
        </section>
      </div>
    </main>
  );
}