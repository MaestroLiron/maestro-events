import Image from "next/image";
import SectionTitle from "./SectionTitle";
import Link from "next/link";
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
// ==========================================
// תוכן השירותים
// ==========================================
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
// ==========================================
// שליפת שירותים מהמסד
// ==========================================
async function getDbServices(): Promise<DbService[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/services`,
      {
        cache: "no-store",
      }
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Services load error:", error);
    return [];
  }
}
// ==========================================
// SERVICES
// ==========================================
export default async function Services() {
  const dbServices = await getDbServices();
  const dbBySlug = new Map(
    dbServices.map((service) => [service.slug, service])
  );
  const serviceList = Object.entries(services);
  return (
    <section
      id="services"
      className="bg-[#090909] py-10 sm:py-16 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="השירותים שלנו"
          subtitle="כל מה שצריך כדי להפוך את האירוע שלכם לבלתי נשכח"
        />
        {/* ==========================================
            מובייל: קרוסלה אופקית
            טאבלט: שתי עמודות
            מחשב: שלוש עמודות
        ========================================== */}
        <div
          dir="rtl"
          className="
            -mx-4 flex snap-x snap-mandatory gap-4
            overflow-x-auto overscroll-x-contain
            px-4 pb-4
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
            sm:mx-0 sm:px-0
            md:grid md:grid-cols-2 md:gap-6
            md:overflow-visible md:pb-0
            lg:grid-cols-3 lg:gap-8
          "
        >
          {serviceList.map(([slug, service]) => {
            // חיבור למסד הנתונים
            const dbService =
              dbBySlug.get(slug) ||
              (slug === "fueling"
                ? dbBySlug.get("refuel")
                : undefined);
            const image =
              dbService?.image?.trim()
                ? dbService.image
                : service.image;
            // כתובת דף השירות
            const serviceSlug =
              slug === "fueling" && dbBySlug.has("refuel")
                ? "refuel"
                : slug;
            return (
              <article
                key={slug}
                className="
                  group flex w-[82%] shrink-0 snap-center
                  flex-col overflow-hidden rounded-2xl
                  border border-[#2a2a2a] bg-[#111]
                  transition-colors duration-300
                  hover:border-[#D4AF37]
                  sm:w-[65%]
                  md:w-auto md:shrink md:snap-align-none
                  md:rounded-3xl
                "
              >
                {/* תמונה */}
                <div
                  className="
                    relative h-40 w-full shrink-0 overflow-hidden
                    sm:h-48 md:h-52 lg:h-64
                  "
                >
                  <Image
                    src={image}
                    alt={service.title}
                    fill
                    sizes="
                      (max-width: 639px) 82vw,
                      (max-width: 767px) 65vw,
                      (max-width: 1023px) 50vw,
                      33vw
                    "
                    className="
                      object-cover transition-transform duration-500
                      md:group-hover:scale-105
                    "
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                {/* תוכן */}
                <div className="flex flex-1 flex-col p-4 text-center sm:p-5 lg:p-6">
                  <h3
                    className="
                      mb-2 text-lg font-bold leading-tight
                      text-[#D4AF37] sm:text-xl lg:mb-3 lg:text-2xl
                    "
                  >
                    {service.title}
                  </h3>
                  <p
                    className="
                      mb-4 text-sm leading-5 text-gray-300
                      sm:leading-6 lg:mb-6 lg:text-base lg:leading-7
                    "
                  >
                    {service.subtitle}
                  </p>
                  <Link
                    href={`/services/${serviceSlug}`}
                    className="
                      mt-auto block w-full rounded-xl
                      border border-[#D4AF37]
                      px-3 py-2.5 text-center text-sm
                      font-semibold text-[#D4AF37]
                      transition-colors duration-300
                      hover:bg-[#D4AF37] hover:text-black
                      active:scale-[0.98]
                      sm:px-4 sm:py-3 sm:text-base
                    "
                  >
                    למידע נוסף
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        {/* רמז להחלקה במובייל */}
        <p className="mt-2 text-center text-xs text-gray-500 md:hidden">
          החליקו לצדדים לצפייה בכל השירותים ←
        </p>
      </div>
    </section>
  );
}