"use client";

import { useEffect, useState } from "react";

type GalleryImage = {
  id: number;
  url: string;
  fileName: string;
};

type Gallery = {
  id: number;
  name: string;
  slug: string;
  expiresAt: string | null;
  images: GalleryImage[];
};

export default function GalleryPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const [slug, setSlug] = useState("");

  const [gallery, setGallery] =
    useState<Gallery | null>(null);

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [opening, setOpening] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState("");

  // ==========================================
  // קבלת SLUG
  // ==========================================

  useEffect(() => {
    async function loadSlug() {
      const resolvedParams = await params;

      setSlug(resolvedParams.slug);
      setLoading(false);
    }

    loadSlug();
  }, [params]);

  // ==========================================
  // טיימר
  // ==========================================

  useEffect(() => {
    if (!gallery?.expiresAt) {
      setTimeLeft("ללא הגבלת זמן");
      return;
    }

    function updateTimer() {
      const now = new Date().getTime();
      const expiration = new Date(
        gallery!.expiresAt!
      ).getTime();

      const difference = expiration - now;

      if (difference <= 0) {
        setTimeLeft("הגלריה פגה");
        return;
      }

      const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
      );

      const hours = Math.floor(
        (difference %
          (1000 * 60 * 60 * 24)) /
          (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (difference %
          (1000 * 60 * 60)) /
          (1000 * 60)
      );

      const seconds = Math.floor(
        (difference %
          (1000 * 60)) /
          1000
      );

      setTimeLeft(
        `${days} ימים · ${hours
          .toString()
          .padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    }

    updateTimer();

    const interval =
      setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [gallery?.expiresAt]);

  // ==========================================
  // פתיחת הגלריה
  // ==========================================

  async function openGallery() {
    if (!password.trim()) {
      setError("נא להזין את סיסמת הגלריה");
      return;
    }

    if (!slug) {
      setError("קישור הגלריה אינו תקין");
      return;
    }

    try {
      setOpening(true);
      setError("");

      const response = await fetch(
        `/api/gallery/${slug}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "לא ניתן לפתוח את הגלריה"
        );

        return;
      }

      setGallery(data.gallery);
      setIsAuthenticated(true);
      setPassword("");
    } catch (error) {
      console.error(error);

      setError(
        "אירעה שגיאה בפתיחת הגלריה"
      );
    } finally {
      setOpening(false);
    }
  }

  // ==========================================
  // Enter
  // ==========================================

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      event.key === "Enter" &&
      !opening
    ) {
      openGallery();
    }
  }

  // ==========================================
  // הורדת תמונה
  // ==========================================

  function downloadImage(
    image: GalleryImage
  ) {
    const link =
      document.createElement("a");

    link.href = image.url;
    link.download =
      image.fileName || "maestro-photo";

    link.target = "_blank";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  // ==========================================
  // הורדת כל הגלריה
  // ==========================================

  function downloadAllGallery() {
    if (!slug) return;

    window.location.href =
      `/api/gallery/${slug}/download-all`;
  }

  // ==========================================
  // טעינה
  // ==========================================

  if (loading) {
    return (
      <div
        dir="rtl"
        className="
          min-h-screen
          bg-[#090909]
          text-white
          flex
          items-center
          justify-center
        "
      >
        <div className="
          text-[#D4AF37]
          text-xl
        ">
          טוען...
        </div>
      </div>
    );
  }

  // ==========================================
  // מסך הגלריה
  // ==========================================

  if (
    isAuthenticated &&
    gallery
  ) {
    return (
      <div
        dir="rtl"
        className="
          min-h-screen
          bg-[#090909]
          text-white
          px-4
          pb-12
          pt-32
          md:px-8
          md:pt-36
        "
      >

        <div className="
          max-w-7xl
          mx-auto
        ">

          {/* ==================================
              המלצה
          ================================== */}

          <div className="
            mb-8
            rounded-3xl
            border
            border-[#D4AF37]/30
            bg-[#111]
            p-5
            text-center
            shadow-xl
          ">

            <div className="
              text-[#D4AF37]
              text-2xl
              mb-2
            ">
              ⭐
            </div>

            <h2 className="
              text-lg
              md:text-xl
              font-bold
            ">
              אל תשכחו להשאיר לנו המלצה ❤️
            </h2>

            <p className="
              text-gray-400
              text-sm
              mt-2
              mb-4
            ">
              היה לכם אירוע מוצלח?
              נשמח לשמוע מכם!
            </p>

            <a
              href="/#testimonials"
              className="
                inline-flex
                items-center
                justify-center
                bg-[#D4AF37]
                text-black
                font-bold
                px-6
                py-3
                rounded-xl
                hover:scale-105
                transition
              "
            >
              ⭐ השאירו לנו המלצה
            </a>

          </div>

          {/* ==================================
              HEADER
          ================================== */}

          <div className="
            text-center
            mb-8
          ">

            <div className="
              text-[#D4AF37]
              text-sm
              mb-3
              tracking-widest
            ">
              MAESTRO EVENTS
            </div>

            <h1 className="
              text-3xl
              md:text-5xl
              font-bold
            ">
              {gallery.name}
            </h1>

            <p className="
              text-gray-400
              mt-3
            ">
              {gallery.images.length} תמונות
            </p>

          </div>

          {/* ==================================
              טיימר
          ================================== */}

          <div className="
            mb-8
            bg-[#111]
            border
            border-[#D4AF37]/30
            rounded-3xl
            p-5
            text-center
          ">

            <div className="
              text-gray-400
              text-sm
              mb-2
            ">
              ⏳ זמן שנותר לגלריה
            </div>

            <div className="
              text-[#D4AF37]
              text-2xl
              md:text-3xl
              font-bold
              tracking-wide
            ">
              {timeLeft}
            </div>

            <div className="
              text-gray-600
              text-xs
              mt-2
            ">
              מומלץ להוריד את התמונות לפני
              סיום תוקף הגלריה
            </div>

          </div>

          {/* ==================================
              הורדת כל הגלריה
          ================================== */}

          {gallery.images.length > 0 && (
            <div className="
              flex
              justify-center
              mb-10
            ">

              <button
                type="button"
                onClick={
                  downloadAllGallery
                }
                className="
                  w-full
                  md:w-auto
                  bg-[#D4AF37]
                  text-black
                  font-bold
                  px-8
                  py-4
                  rounded-2xl
                  shadow-xl
                  hover:scale-105
                  transition
                "
              >
                📦 הורד את כל הגלריה
              </button>

            </div>
          )}

          {/* ==================================
              IMAGES
          ================================== */}

          {gallery.images.length === 0 ? (
            <div className="
              bg-[#111]
              border
              border-[#2a2a2a]
              rounded-3xl
              p-12
              text-center
            ">

              <div className="
                text-5xl
                mb-4
              ">
                📸
              </div>

              <h2 className="
                text-xl
                font-bold
              ">
                הגלריה עדיין ריקה
              </h2>

              <p className="
                text-gray-500
                mt-2
              ">
                התמונות יופיעו כאן לאחר העלאתן.
              </p>

            </div>
          ) : (

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              gap-5
            ">

              {gallery.images.map(
                (image) => (

                  <div
                    key={image.id}
                    className="
                      group
                      overflow-hidden
                      rounded-2xl
                      bg-[#111]
                      border
                      border-[#222]
                      hover:border-[#D4AF37]/50
                      transition
                    "
                  >

                    {/* תמונה */}

                    <div className="
                      overflow-hidden
                    ">

                      <img
                        src={image.url}
                        alt={
                          image.fileName
                        }
                        className="
                          w-full
                          aspect-square
                          object-cover
                          group-hover:scale-105
                          transition
                          duration-500
                        "
                      />

                    </div>

                    {/* שם הקובץ */}

                    <div className="
                      px-4
                      pt-4
                    ">

                      <div className="
                        text-gray-400
                        text-xs
                        truncate
                      ">
                        {image.fileName}
                      </div>

                    </div>

                    {/* כפתור הורדה */}

                    <div className="
                      p-4
                    ">

                      <button
                        type="button"
                        onClick={() =>
                          downloadImage(
                            image
                          )
                        }
                        className="
                          w-full
                          bg-[#1a1a1a]
                          border
                          border-[#D4AF37]/40
                          text-[#D4AF37]
                          font-bold
                          py-3
                          rounded-xl
                          hover:bg-[#D4AF37]
                          hover:text-black
                          transition
                        "
                      >
                        ⬇️ הורדת תמונה
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>
          )}

          {/* ==================================
              FOOTER
          ================================== */}

          <div className="
            text-center
            text-gray-600
            text-xs
            mt-16
          ">
            ©️ Maestro Events
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // מסך סיסמה
  // ==========================================

  return (
    <div
      dir="rtl"
      className="
        min-h-screen
        bg-[#090909]
        text-white
        flex
        items-center
        justify-center
        p-4
        pt-28
      "
    >

      <div className="
        w-full
        max-w-md
      ">

        {/* TITLE */}

        <div className="
          text-center
          mb-8
        ">

          <div className="
            text-[#D4AF37]
            font-bold
            tracking-[0.3em]
            text-sm
            mb-4
          ">
            MAESTRO EVENTS
          </div>

          <h1 className="
            text-3xl
            font-bold
          ">
            גלריה פרטית
          </h1>

          <p className="
            text-gray-500
            mt-3
          ">
            הזן את הסיסמה שקיבלת כדי לצפות בתמונות
          </p>

        </div>

        {/* LOGIN BOX */}

        <div className="
          bg-[#111]
          border
          border-[#D4AF37]/30
          rounded-3xl
          p-7
          shadow-2xl
        ">

          <label className="
            block
            text-gray-300
            mb-2
          ">
            סיסמת גלריה
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="הזן סיסמה"
            autoFocus
            className="
              w-full
              bg-[#090909]
              border
              border-[#333]
              rounded-xl
              px-5
              py-4
              text-white
              outline-none
              focus:border-[#D4AF37]
              transition
            "
          />

          {error && (
            <div className="
              mt-4
              bg-red-500/10
              border
              border-red-500/20
              text-red-400
              rounded-xl
              p-4
              text-sm
            ">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={
              openGallery
            }
            disabled={opening}
            className="
              w-full
              mt-5
              bg-[#D4AF37]
              text-black
              font-bold
              py-4
              rounded-xl
              hover:scale-[1.02]
              transition
              disabled:opacity-50
              disabled:hover:scale-100
            "
          >
            {opening
              ? "פותח גלריה..."
              : "🔓 כניסה לגלריה"}
          </button>

        </div>

        <div className="
          text-center
          text-gray-600
          text-xs
          mt-6
        ">
          התמונות מוגנות בגלריה פרטית
        </div>

      </div>

    </div>
  );
}