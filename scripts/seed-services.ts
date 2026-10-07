import { PrismaClient } from "../generated/prisma/client";
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
// השירותים
// ==========================================

const services = [
  {
    title: "צילום סטילס",
    slug: "stills",
    description:
      "צילום מקצועי ואיכותי שמנציח את הרגעים החשובים והיפים ביותר באירוע שלכם.",
    image: "/services/stills.jpg",
    subtitle: "צילום מקצועי לכל שלבי האירוע.",
    longDescription:
      "צילום מקצועי במהלך האירוע, עם דגש על הרגעים החשובים, האווירה והאנשים שהופכים את האירוע שלכם למיוחד.",
    features: [
      "צילום מקצועי",
      "תיעוד רגעים מיוחדים",
      "צילום במהלך האירוע",
      "תמונות באיכות גבוהה",
    ],
    sortOrder: 1,
  },

  {
    title: "צילום מגנטים",
    slug: "magnets",
    description:
      "צילום מקצועי במהלך האירוע עם הדפסה איכותית במקום, כדי שהאורחים יוכלו לקחת איתם מזכרת.",
    image: "/services/magnets.jpg",
    subtitle: "מגנטים באיכות גבוהה והדפסה במקום.",
    longDescription:
      "צילום מקצועי במהלך האירוע והדפסה במקום, כך שהאורחים יכולים ליהנות מתמונה איכותית כמזכרת כבר במהלך האירוע.",
    features: [
      "צילום מקצועי",
      "הדפסה במקום",
      "מגנטים באיכות גבוהה",
      "מזכרת לאורחים",
    ],
    sortOrder: 2,
  },

  {
    title: "חבילת סלואו",
    slug: "slow",
    description:
      "חבילת סלואו מרשימה שיוצרת אווירה מיוחדת ומוסיפה אפקט וואו לרגעים הגדולים של האירוע.",
    image: "/services/slow.jpg",
    subtitle: "עשן כבד, בועות סבון וקונפטי לרגע בלתי נשכח.",
    longDescription:
      "חבילת אפקטים מיוחדת לרגעים הגדולים של האירוע, עם שילוב של עשן כבד, בועות סבון וקונפטי.",
    features: [
      "עשן כבד",
      "בועות סבון",
      "קונפטי",
      "הפעלת האפקטים במהלך הרגע המרכזי",
    ],
    sortOrder: 3,
  },

  {
    title: "זיקוקים קרים",
    slug: "fireworks",
    description:
      "אפקט מרשים לרגעי השיא באירוע, המוסיף תאורה ואווירה מיוחדת לצילומים ולרגעים הגדולים.",
    image: "/services/fireworks.jpg",
    subtitle: "זיקוקים קרים לרגעי השיא של האירוע.",
    longDescription:
      "אפקט תאורה מרשים שמוסיף נוכחות ואווירה מיוחדת לרגעים המרכזיים באירוע ולצילומים.",
    features: [
      "אפקט זיקוקים קרים",
      "הפעלה מקצועית",
      "תזמון לרגע המרכזי",
      "מתאים לצילומים",
    ],
    sortOrder: 4,
  },

  {
    title: "קיאק פירות",
    slug: "fruits",
    description:
      "עמדת פירות מרשימה ומעוצבת שמוסיפה צבע, טעם ואווירה מיוחדת לאירוע.",
    image: "/services/fruits.jpg",
    subtitle: "קיאק פירות מעוצב ומרשים לכל אירוע.",
    longDescription:
      "עמדת פירות צבעונית ומעוצבת שמוסיפה חוויה מיוחדת לאורחים ומשתלבת באירועים מכל הסוגים.",
    features: [
      "פירות טריים",
      "עיצוב מרשים",
      "הגשה במהלך האירוע",
      "מתאים למגוון סוגי אירועים",
    ],
    sortOrder: 5,
  },

  {
    title: "עיצוב בלונים",
    slug: "balloons",
    description:
      "עיצוב בלונים בהתאמה אישית שיוצר מראה מרשים ומיוחד ומתאים לקונספט של האירוע.",
    image: "/services/balloons.jpg",
    subtitle: "עיצוב בלונים בהתאמה אישית.",
    longDescription:
      "עיצוב בלונים בהתאמה אישית לפי צבעי האירוע, הקונספט והאווירה שאתם רוצים ליצור.",
    features: [
      "עיצוב בהתאמה אישית",
      "מגוון צבעים",
      "עיצוב מרשים",
      "התאמה לקונספט האירוע",
    ],
    sortOrder: 6,
  },

  {
    title: "בר אקטיבי",
    slug: "bar",
    description:
      "בר אקטיבי שמוסיף אנרגיה ואווירה לאירוע, עם צוות מקצועי והכנת משקאות וקוקטיילים.",
    image: "/services/bar.jpg",
    subtitle: "בר מקצועי עם צוות מנוסה וקוקטיילים איכותיים.",
    longDescription:
      "בר אקטיבי שמכניס אנרגיה לרחבה ומעניק לאורחים חוויית שתייה מיוחדת לאורך האירוע.",
    features: [
      "צוות מקצועי",
      "בר אקטיבי",
      "קוקטיילים ומשקאות",
      "שירות במהלך האירוע",
    ],
    sortOrder: 7,
  },

  {
    title: "קיר משקפיים",
    slug: "glasses",
    description:
      "עמדת משקפיים צבעונית ומיוחדת שמוסיפה כיף, צבע ואווירה לאירוע ולתמונות.",
    image: "/services/glasses.jpg",
    subtitle: "עמדת משקפיים צבעונית ומיוחדת.",
    longDescription:
      "עמדת משקפיים מיוחדת עם מגוון אביזרים צבעוניים שמכניסים אנרגיה וכיף לצילומים ולאירוע.",
    features: [
      "מגוון משקפיים",
      "עמדה צבעונית",
      "מתאים לצילומים",
      "אטרקציה לאורחים",
    ],
    sortOrder: 8,
  },

  {
    title: "עמדת תדלוק לרחבה",
    slug: "fueling",
    description:
      "עמדת תדלוק ייחודית ומעוצבת שמכניסה את האורחים לאווירה ומוסיפה טאץ' מיוחד לרחבת האירועים.",
    image: "/services/fueling.jpg",
    subtitle: "מתדלקים את הרחבה באנרגיה ובסטייל.",
    longDescription:
      "עמדת תדלוק בעיצוב של תחנת דלק, שבה כל ידית תדלוק מציעה משקה אחר. אטרקציה מקורית שמושכת את האורחים ומוסיפה חוויה מיוחדת לרחבה.",
    features: [
      "עמדת תדלוק בעיצוב ייחודי",
      "מגוון משקאות לבחירה",
      "ידיות תדלוק בעיצוב מיוחד",
      "אטרקציה שמושכת את האורחים",
    ],
    sortOrder: 9,
  },
];

// ==========================================
// הכנסת השירותים
// ==========================================

async function main() {
  console.log("");
  console.log("🚀 מתחיל להכניס את שירותי Maestro Events...");
  console.log("");

  for (const service of services) {
    const existing = await prisma.service.findUnique({
      where: {
        slug: service.slug,
      },
    });

    const data = {
      title: service.title,
      description: service.description,
      image: service.image,
      subtitle: service.subtitle,
      longDescription: service.longDescription,
      features: JSON.stringify(service.features),
      sortOrder: service.sortOrder,
      isActive: true,
    };

    if (existing) {
      await prisma.service.update({
        where: {
          id: existing.id,
        },
        data,
      });

      console.log(`✓ עודכן: ${service.title}`);
    } else {
      await prisma.service.create({
        data: {
          ...data,
          slug: service.slug,
        },
      });

      console.log(`✓ נוצר: ${service.title}`);
    }
  }

  console.log("");
  console.log("======================================");
  console.log("✅ כל השירותים נמצאים במסד הנתונים!");
  console.log("======================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ שגיאה:", error);
    console.error("");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });