"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Service = {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
};

type DbService = {
  id: number;
  title: string;
  slug: string;
  image: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
};

// =====================================================
// שירותי ברירת מחדל
// =====================================================

const services: Record<string, Service> = {
  stills: {
    title: "צילום סטילס",
    subtitle: "צילום מקצועי לכל שלבי האירוע.",
    description:
      "צילום מקצועי ואיכותי שמנציח את הרגעים החשובים והיפים ביותר באירוע שלכם.",
    image: "/services/stills.jpg",
    features: [
      "צילום מקצועי",
      "תיעוד רגעים מיוחדים",
      "צילום במהלך האירוע",
      "תמונות באיכות גבוהה",
    ],
  },

  magnets: {
    title: "צילום מגנטים",
    subtitle: "מגנטים באיכות גבוהה והדפסה במקום.",
    description:
      "צילום מקצועי במהלך האירוע עם הדפסה איכותית במקום, כדי שהאורחים יוכלו לקחת איתם מזכרת מהאירוע.",
    image: "/services/magnets.jpg",
    features: [
      "צילום מקצועי",
      "הדפסה במקום",
      "מגנטים באיכות גבוהה",
      "מזכרת לאורחים",
    ],
  },

  slow: {
    title: "חבילת סלואו",
    subtitle: "עשן כבד, בועות סבון וקונפטי.",
    description:
      "חבילת אפקטים מרשימה שיוצרת אווירה מיוחדת ומוסיפה אפקט וואו לרגעים הגדולים של האירוע.",
    image: "/services/slow.jpg",
    features: [
      "עשן כבד",
      "בועות סבון",
      "קונפטי",
      "הפעלת האפקטים ברגע המרכזי",
    ],
  },

  fireworks: {
    title: "זיקוקים קרים",
    subtitle: "אפקט מרשים לרגעי השיא.",
    description:
      "זיקוקים קרים שמוסיפים תאורה, אווירה ואפקט מיוחד לרגעים הגדולים ולצילומים.",
    image: "/services/fireworks.jpg",
    features: [
      "אפקט זיקוקים קרים",
      "הפעלה מקצועית",
      "תזמון לרגע המרכזי",
      "מתאים לצילומים",
    ],
  },

  fruits: {
    title: "קיאק פירות",
    subtitle: "עמדת פירות מעוצבת ומרשימה.",
    description:
      "עמדת פירות צבעונית ומעוצבת שמוסיפה טעם, צבע ואווירה מיוחדת לאירוע.",
    image: "/services/fruits.jpg",
    features: [
      "פירות טריים",
      "עיצוב מרשים",
      "הגשה במהלך האירוע",
      "מתאים למגוון אירועים",
    ],
  },

  balloons: {
    title: "עיצוב בלונים",
    subtitle: "עיצוב בלונים בהתאמה אישית.",
    description:
      "עיצוב בלונים מרשים בהתאמה לקונספט, לצבעים ולאופי של האירוע.",
    image: "/services/balloons.jpg",
    features: [
      "עיצוב בהתאמה אישית",
      "מגוון צבעים",
      "עיצוב מרשים",
      "התאמה לקונספט האירוע",
    ],
  },

  bar: {
    title: "בר אקטיבי",
    subtitle: "בר מקצועי עם אנרגיה וקוקטיילים.",
    description:
      "בר אקטיבי שמוסיף אנרגיה לאירוע עם צוות מקצועי, משקאות וקוקטיילים.",
    image: "/services/bar.jpg",
    features: [
      "צוות מקצועי",
      "בר אקטיבי",
      "קוקטיילים ומשקאות",
      "שירות במהלך האירוע",
    ],
  },

  glasses: {
    title: "קיר משקפיים",
    subtitle: "עמדת משקפיים צבעונית ומיוחדת.",
    description:
      "עמדת משקפיים צבעונית שמוסיפה כיף, צבע ואווירה מיוחדת לאירוע ולתמונות.",
    image: "/services/glasses.jpg",
    features: [
      "מגוון משקפיים",
      "עמדה צבעונית",
      "מתאים לצילומים",
      "אטרקציה לאורחים",
    ],
  },

  fueling: {
    title: "עמדת תדלוק לרחבה",
    subtitle: "מתדלקים את הרחבה באנרגיה.",
    description:
      "עמדת תדלוק ייחודית שהופכת את המשקאות לאטרקציה בפני עצמה.",
    image: "/services/refuel.jpg",
    features: [
      "עיצוב ייחודי בסגנון תחנת דלק",
      "מספר ידיות עם משקאות שונים",
      "חוויה מקורית ומצטלמת",
      "אטרקציה לרחבת הריקודים",
    ],
  },
};

// =====================================================
// תיקון כתובת תמונה
// =====================================================

function normalizeImagePath(
  image: string | undefined,
  fallback: string
) {
  if (!image || typeof image !== "string") {
    return fallback;
  }

  let value = image.trim();

  if (!value) {
    return fallback;
  }

  // public/services/x.jpg
  if (value.startsWith("public/")) {
    value = value.replace(/^public/, "");
  }

  // /public/services/x.jpg
  if (value.startsWith("/public/")) {
    value = value.replace(/^\/public/, "");
  }

  // services/x.jpg
  if (
    !value.startsWith("/") &&
    !value.startsWith("http://") &&
    !value.startsWith("https://")
  ) {
    value = `/${value}`;
  }

  return value;
}

// =====================================================
// Mobile Services
// =====================================================

export default function MobileServices() {
  const [dbServices, setDbServices] =
    useState<DbService[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [imageErrors, setImageErrors] =
    useState<Record<string, boolean>>({});

  // ===================================================
  // טעינת השירותים מהדאשבורד / Database
  // ===================================================

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        setLoading(true);

        const response = await fetch(
          "/api/services",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!response.ok) {
          console.error(
            "Failed to load services:",
            response.status
          );
          return;
        }

        const data: DbService[] =
          await response.json();

        if (
          !cancelled &&
          Array.isArray(data)
        ) {
          setDbServices(data);
        }
      } catch (error) {
        console.error(
          "Mobile services load error:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  // ===================================================
  // מיפוי השירותים מה-DB
  // ===================================================

  const dbBySlug = new Map(
    dbServices.map((service) => [
      service.slug,
      service,
    ])
  );

  // ===================================================
  // רשימת השירותים
  //
  // הסדר הבסיסי נשאר כמו ב-Services.tsx
  // והמידע מתעדכן מהדאשבורד.
  // ===================================================

  const serviceList = Object.entries(
    services
  );

  // ===================================================
  // Loading
  // ===================================================

  if (loading && dbServices.length === 0) {
    return (
      <section
        id="services"
        dir="rtl"
        className="
          w-full
          bg-[#090909]
          text-white
          py-16
        "
      >
        <div className="px-5 text-center">

          <div
            className="
              flex
              items-center
              justify-center
              gap-3
              mb-5
            "
          >
            <span className="w-8 h-px bg-[#D4AF37]/60" />

            <span
              className="
                w-2.5
                h-2.5
                rotate-45
                bg-[#D4AF37]
              "
            />

            <span
              className="
                text-[#D4AF37]
                text-[10px]
                tracking-[0.3em]
                font-semibold
              "
            >
              MAESTRO EVENTS
            </span>

            <span
              className="
                w-2.5
                h-2.5
                rotate-45
                bg-[#D4AF37]
              "
            />

            <span className="w-8 h-px bg-[#D4AF37]/60" />
          </div>

          <h2
            className="
              text-[#D4AF37]
              text-[32px]
              font-bold
            "
          >
            השירותים שלנו
          </h2>

        </div>
      </section>
    );
  }

  return (
    <section
      id="services"
      dir="rtl"
      className="
        w-full
        bg-[#090909]
        text-white
        py-16
        overflow-hidden
      "
    >
      <div className="w-full px-5">

        {/* =================================================
            כותרת
        ================================================= */}

        <div
          className="
            text-center
            mb-10
          "
        >

          {/* קישוט */}

          <div
            className="
              flex
              items-center
              justify-center
              gap-3
              mb-5
            "
          >
            <span
              className="
                w-8
                h-px
                bg-[#D4AF37]/70
              "
            />

            <span
              className="
                w-2.5
                h-2.5
                rotate-45
                bg-[#D4AF37]
              "
            />

            <span
              className="
                text-[#D4AF37]
                text-[10px]
                font-semibold
                tracking-[0.3em]
              "
            >
              MAESTRO EVENTS
            </span>

            <span
              className="
                w-2.5
                h-2.5
                rotate-45
                bg-[#D4AF37]
              "
            />

            <span
              className="
                w-8
                h-px
                bg-[#D4AF37]/70
              "
            />
          </div>

          <h2
            className="
              text-[#D4AF37]
              text-[32px]
              leading-tight
              font-bold
              mb-3
            "
          >
            השירותים שלנו
          </h2>

          <p
            className="
              text-gray-400
              text-[15px]
              leading-6
              max-w-[330px]
              mx-auto
            "
          >
            כל מה שצריך כדי להפוך את האירוע שלכם
            <br />
            לבלתי נשכח
          </p>

        </div>

        {/* =================================================
            כרטיסי השירותים
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-7
          "
        >

          {serviceList.map(
            ([slug, service]) => {

              // ==========================================
              // השירות מהדאשבורד
              // ==========================================

              const dbService =
                dbBySlug.get(slug) ||
                (slug === "fueling"
                  ? dbBySlug.get("refuel")
                  : undefined);

              // ==========================================
              // אם השירות קיים ב-DB אבל כבוי
              // לא נציג אותו במובייל
              // ==========================================

              if (
                dbServices.length > 0 &&
                dbService &&
                !dbService.isActive
              ) {
                return null;
              }

              // ==========================================
              // תמונת ברירת מחדל
              // ==========================================

              const fallbackImage =
                service.image;

              // ==========================================
              // תמונה מהדאשבורד
              //
              // אם הדאשבורד שמר תמונה -
              // היא התמונה שתוצג.
              // ==========================================

              const dashboardImage =
                dbService?.image &&
                dbService.image.trim() !== ""
                  ? normalizeImagePath(
                      dbService.image,
                      fallbackImage
                    )
                  : fallbackImage;

              // ==========================================
              // אם התמונה מהדאשבורד נכשלה
              // חוזרים לתמונה המקורית
              // ==========================================

              const image =
                imageErrors[slug]
                  ? fallbackImage
                  : dashboardImage;

              // ==========================================
              // slug לדף השירות
              // ==========================================

              const serviceSlug =
                slug === "fueling" &&
                dbBySlug.has("refuel")
                  ? "refuel"
                  : slug;

              // ==========================================
              // מפתח ייחודי לתמונה
              //
              // אם הדאשבורד החליף תמונה,
              // React מרענן את התמונה.
              // ==========================================

              const imageKey =
                `${slug}-${dbService?.id ?? "default"}-${dashboardImage}`;

              return (
                <article
                  key={slug}
                  className="
                    w-full

                    overflow-hidden

                    rounded-[24px]

                    bg-[#111111]

                    border
                    border-[#2a2a2a]

                    shadow-[0_12px_35px_rgba(0,0,0,0.45)]

                    flex
                    flex-col
                  "
                >

                  {/* ======================================
                      תמונה
                  ====================================== */}

                  <div
                    className="
                      relative

                      w-full

                      h-[210px]
                      min-h-[210px]

                      overflow-hidden

                      bg-[#181818]
                    "
                  >

                    <img
                      key={imageKey}
                      src={image}
                      alt={service.title}
                      className="
                        absolute
                        inset-0

                        w-full
                        h-full

                        object-cover

                        block

                        transition-transform
                        duration-500
                      "
                      onError={() => {
                        if (
                          image !== fallbackImage
                        ) {
                          setImageErrors(
                            (previous) => ({
                              ...previous,
                              [slug]: true,
                            })
                          );
                        }
                      }}
                    />

                    {/* שכבת כהות */}

                    <div
                      className="
                        absolute
                        inset-0

                        bg-gradient-to-t
                        from-black/60
                        via-transparent
                        to-transparent

                        pointer-events-none
                      "
                    />

                    {/* פס זהב */}

                    <div
                      className="
                        absolute
                        bottom-0
                        left-0
                        right-0

                        h-[3px]

                        bg-[#D4AF37]

                        pointer-events-none
                      "
                    />

                  </div>

                  {/* ======================================
                      תוכן
                  ====================================== */}

                  <div
                    className="
                      p-5

                      text-center

                      flex
                      flex-col
                    "
                  >

                    {/* כותרת */}

                    <h3
                      className="
                        text-[#D4AF37]

                        text-[25px]

                        leading-tight

                        font-bold

                        mb-3
                      "
                    >
                      {service.title}
                    </h3>

                    {/* תיאור */}

                    <p
                      className="
                        text-gray-400

                        text-[15px]

                        leading-7

                        mb-5
                      "
                    >
                      {service.description}
                    </p>

                    {/* ==================================
                        מידע נוסף
                    ================================== */}

                    <Link
                      href={`/services/${serviceSlug}`}
                      className="
                        flex
                        items-center
                        justify-center

                        w-full

                        h-[54px]

                        rounded-xl

                        border
                        border-[#D4AF37]

                        text-[#D4AF37]

                        text-[17px]

                        font-bold

                        transition-all
                        duration-200

                        active:bg-[#D4AF37]
                        active:text-black

                        active:scale-[0.98]

                        touch-manipulation
                      "
                    >
                      למידע נוסף
                    </Link>

                  </div>

                </article>
              );
            }
          )}

        </div>

        {/* =================================================
            כפתור כל השירותים
        ================================================= */}

        <div className="mt-8">

          <Link
            href="/services"
            className="
              flex
              items-center
              justify-center

              w-full

              h-[58px]

              rounded-2xl

              bg-[#D4AF37]

              text-black

              text-[18px]

              font-bold

              shadow-[0_8px_25px_rgba(212,175,55,0.2)]

              active:scale-[0.98]

              transition-all
              duration-200

              touch-manipulation
            "
          >
            צפייה בכל השירותים
          </Link>

        </div>

      </div>
    </section>
  );
}