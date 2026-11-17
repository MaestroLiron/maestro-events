import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// ==========================================
// Prisma
// ==========================================

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

// ==========================================
// TYPES
// ==========================================

type ServiceContent = {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
};

// ==========================================
// תוכן השירותים
// ==========================================

const serviceContents: Record<string, ServiceContent> = {
  stills: {
    title: "צילום סטילס",
    subtitle: "צילום מקצועי לכל שלבי האירוע.",
    description:
      "צילום מקצועי ואיכותי שמנציח את הרגעים החשובים והיפים ביותר באירוע שלכם.",
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
    features: [
      "צילום מקצועי",
      "הדפסה במקום",
      "מגנטים באיכות גבוהה",
      "מזכרת לאורחים",
    ],
  },

  slow: {
    title: "חבילת סלואו",
    subtitle: "עשן כבד, בועות סבון וקונפטי לרגע בלתי נשכח.",
    description:
      "חבילת סלואו מרשימה שיוצרת אווירה מיוחדת ומוסיפה אפקט וואו לרגעים הגדולים של האירוע.",
    features: [
      "עשן כבד",
      "בועות סבון",
      "קונפטי",
      "הפעלת האפקטים במהלך הרגע המרכזי",
    ],
  },

  fireworks: {
    title: "זיקוקים קרים",
    subtitle: "זיקוקים לרגעי השיא של האירוע.",
    description:
      "אפקט מרשים לרגעי השיא באירוע, המוסיף תאורה ואווירה מיוחדת לצילומים ולרגעים הגדולים.",
    features: [
      "אפקט זיקוקים קרים",
      "הפעלה מקצועית",
      "תזמון לרגע המרכזי",
      "מתאים לצילומים",
    ],
  },

  fruits: {
    title: "קיאק פירות",
    subtitle: "קיאק פירות מעוצב ומרשים לכל אירוע.",
    description:
      "עמדת פירות מרשימה ומעוצבת שמוסיפה צבע, טעם ואווירה מיוחדת לאירוע.",
    features: [
      "פירות טריים",
      "עיצוב מרשים",
      "הגשה במהלך האירוע",
      "מתאים למגוון סוגי אירועים",
    ],
  },

  balloons: {
    title: "עיצוב בלונים",
    subtitle: "עיצוב בלונים בהתאמה אישית.",
    description:
      "עיצוב בלונים בהתאמה אישית שיוצר מראה מרשים ומיוחד ומתאים לקונספט של האירוע.",
    features: [
      "עיצוב בהתאמה אישית",
      "מגוון צבעים",
      "עיצוב מרשים",
      "התאמה לקונספט האירוע",
    ],
  },

  bar: {
    title: "בר אקטיבי",
    subtitle: "בר מקצועי עם צוות מנוסה וקוקטיילים איכותיים.",
    description:
      "בר אקטיבי שמוסיף אנרגיה ואווירה לאירוע, עם צוות מקצועי והכנת משקאות וקוקטיילים.",
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
      "עמדת משקפיים צבעונית ומיוחדת שמוסיפה כיף, צבע ואווירה לאירוע ולתמונות.",
    features: [
      "מגוון משקפיים",
      "עמדה צבעונית",
      "מתאים לצילומים",
      "אטרקציה לאורחים",
    ],
  },

  fueling: {
    title: "עמדת תדלוק לרחבה",
    subtitle: "מתדלקים את הרחבה באנרגיה ובסטייל.",
    description:
      "עמדת תדלוק ייחודית ומעוצבת שמכניסה את האורחים לאווירה ומוסיפה טאץ' מיוחד לרחבת האירועים.",
    features: [
      "עמדת תדלוק בעיצוב ייחודי",
      "מגוון משקאות לבחירה",
      "הפעלה במהלך האירוע",
      "אטרקציה שמושכת את האורחים",
    ],
  },

  // ==========================================
  // הצעת נישואין
  // ==========================================

  "proposal-design": {
    title: "עיצוב הצעת נישואין",
    subtitle: "רגע של פעם בחיים – הפקה יוקרתית ומרגשת.",
    description:
      "אנחנו הופכים את הרגע המיוחד שלכם לחוויה בלתי נשכחת. עיצוב הצעת נישואין יוקרתי בהתאמה אישית, עם תפאורה מרהיבה, זיקוקים קרים וצילום סטילס מקצועי לתיעוד הרגעים החשובים והמרגשים ביותר בחיים.",
    features: [
      "עיצוב הצעת נישואין יוקרתי",
      "תפאורה רומנטית בהתאמה אישית",
      "זיקוקים קרים ליצירת אפקט מרהיב",
      "צילום סטילס מקצועי",
      "תיעוד רגע הצעת הנישואין",
      "התאמה אישית לכל זוג",
    ],
  },
};

// ==========================================
// PAGE
// ==========================================

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // ==========================================
  // תוכן השירות
  // ==========================================

  const content = serviceContents[decodedSlug];

  // ==========================================
  // שליפת השירות מהמסד
  // ==========================================

  const service = await prisma.service.findFirst({
    where: {
      slug: decodedSlug,
      isActive: true,
    },
  });

  // ==========================================
  // אם השירות לא קיים
  // ==========================================

  if (!service && !content) {
    notFound();
  }

  // ==========================================
  // נתוני השירות
  // ==========================================

  const title = service?.title || content?.title || "השירות שלנו";

  const subtitle =
    content?.subtitle || "שירות מקצועי מבית Maestro Events.";

  const description =
    service?.description || content?.description || "שירות מקצועי ואיכותי לאירוע שלכם.";

  // features נשמרים במסד כטקסט JSON
  let dbFeatures: string[] = [];

  if (service?.features) {
    try {
      const parsed =
        typeof service.features === "string"
          ? JSON.parse(service.features)
          : service.features;

      if (Array.isArray(parsed)) {
        dbFeatures = parsed.filter(
          (feature): feature is string => typeof feature === "string"
        );
      }
    } catch {
      dbFeatures = [];
    }
  }

  const features =
    dbFeatures.length > 0
      ? dbFeatures
      : content?.features || [];

  // ==========================================
  // תמונה
  // עדיפות לתמונה מהדאשבורד
  // ==========================================

  const image =
    service?.image?.trim() ||
    (decodedSlug === "proposal-design"
      ? "/services/proposal.jpg"
      : "/services/placeholder.jpg");

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[#080808]
        text-white
        overflow-hidden
      "
    >
      {/* כפתור חזרה */}

      <Link
        href="/"
        aria-label="חזרה לדף הבית"
        className="
          fixed right-6 bottom-6 z-50
          w-14 h-14 min-w-12 min-h-12
          flex items-center justify-center
          rounded-full bg-[#D4AF37] text-black
          shadow-[0_0_20px_rgba(212,175,55,0.35)]
          transition-all duration-300
          hover:scale-110 hover:bg-[#e6c34d]
          hover:shadow-[0_0_30px_rgba(212,175,55,0.55)]
        "
      >
        <span className="text-2xl font-black leading-none">
          →
        </span>
      </Link>

      {/* תוכן ראשי */}

      <section
        className="
          relative
          pt-24 pb-16
          md:pt-32 md:pb-24
        "
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="
              grid grid-cols-1
              lg:grid-cols-[1fr_430px]
              gap-12 lg:gap-16
              items-start
            "
          >
            {/* אזור טקסט */}

            <div
              className="
                order-2 lg:order-1
                flex flex-col items-center
                text-center w-full
              "
            >
              <h1
                className="
                  text-4xl md:text-6xl lg:text-7xl
                  font-bold text-[#D4AF37]
                  leading-tight mb-8
                  drop-shadow-[0_0_18px_rgba(212,175,55,0.18)]
                "
              >
                {title}
              </h1>

              {/* פס MAESTRO EVENTS */}

              <div
                className="
                  w-full max-w-3xl
                  flex items-center justify-center
                  gap-4 mb-10
                "
              >
                <div
                  className="
                    h-[2px] flex-1 max-w-[260px]
                    bg-gradient-to-l
                    from-[#D4AF37]/90
                    via-[#D4AF37]/35
                    to-transparent
                  "
                />

                <span className="text-[#D4AF37] text-xl leading-none shrink-0">
                  ◆
                </span>

                <span
                  className="
                    whitespace-nowrap text-[#D4AF37]
                    text-sm md:text-base font-semibold
                    tracking-[0.25em] shrink-0
                  "
                >
                  MAESTRO EVENTS
                </span>

                <span className="text-[#D4AF37] text-xl leading-none shrink-0">
                  ◆
                </span>

                <div
                  className="
                    h-[2px] flex-1 max-w-[260px]
                    bg-gradient-to-r
                    from-[#D4AF37]/90
                    via-[#D4AF37]/35
                    to-transparent
                  "
                />
              </div>

              <h2
                className="
                  text-xl md:text-2xl lg:text-3xl
                  font-semibold text-white
                  mb-7 max-w-3xl
                "
              >
                {subtitle}
              </h2>

              <p
                className="
                  text-white/80 text-base md:text-lg
                  leading-8 max-w-3xl mb-10
                "
              >
                {description}
              </p>

              <div
                className="
                  w-full max-w-3xl h-px
                  bg-gradient-to-r
                  from-transparent
                  via-[#D4AF37]/40
                  to-transparent mb-10
                "
              />

              {/* מה כולל השירות */}

              {features.length > 0 && (
                <div className="w-full max-w-2xl">
                  <h3
                    className="
                      text-3xl md:text-4xl
                      font-bold text-white mb-8
                    "
                  >
                    מה כולל השירות?
                  </h3>

                  <div className="flex flex-col items-center gap-5">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="
                          flex items-center justify-center
                          gap-4 text-white/90
                          text-base md:text-lg
                        "
                      >
                        <span
                          className="
                            w-2 h-2 rotate-45
                            bg-[#D4AF37]
                            shadow-[0_0_8px_rgba(212,175,55,0.35)]
                            shrink-0
                          "
                        />

                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* כפתור הצעת מחיר */}

              <div className="w-full max-w-2xl mt-12">
                <Link
                  href="/#contact"
                  className="
                    flex items-center justify-center
                    w-full min-h-[58px]
                    rounded-xl bg-[#D4AF37]
                    text-black font-semibold
                    text-base md:text-lg
                    transition-all duration-300
                    hover:bg-[#e6c34d]
                    hover:shadow-[0_0_30px_rgba(212,175,55,0.25)]
                    hover:-translate-y-0.5
                  "
                >
                  בקשת הצעת מחיר
                </Link>
              </div>
            </div>

            {/* תמונה מהדאשבורד */}

            <div
              className="
                order-1 lg:order-2
                w-full flex justify-center
                lg:justify-end lg:self-center
                lg:translate-y-8
              "
            >
              <div
                className="
                  relative w-full max-w-[450px]
                  aspect-square overflow-hidden
                  rounded-3xl border
                  border-[#D4AF37]/30
                  bg-[#111]
                  shadow-[0_0_40px_rgba(212,175,55,0.08)]
                "
              >
                <Image
                  src={image}
                  alt={title}
                  fill
                  priority
                  className="
                    object-cover
                    transition-transform duration-700
                    hover:scale-105
                  "
                  sizes="(max-width: 1024px) 100vw, 430px"
                />

                <div
                  className="
                    absolute inset-0
                    bg-gradient-to-t
                    from-black/35 via-transparent
                    to-transparent
                    pointer-events-none
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}