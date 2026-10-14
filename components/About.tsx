import {
  Award,
  Camera,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import SectionTitle from "./SectionTitle";
const stats = [
  {
    icon: Award,
    number: "100+",
    title: "אירועים שליווינו",
  },
  {
    icon: Camera,
    number: "8+",
    title: "שירותים במקום אחד",
  },
  {
    icon: HeartHandshake,
    number: "100%",
    title: "שירות אישי",
  },
  {
    icon: Sparkles,
    number: "★★★★★",
    title: "חוויית שירות",
  },
];
export default function About() {
  return (
    <section
      id="about"
      className="bg-[#090909] py-12 sm:py-16 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* כותרת */}
        <SectionTitle
          title="אודות מאסטרו איוונט"
          subtitle="הכירו את מאסטרו איוונט ואת הדרך שלנו להפוך כל אירוע לחוויה בלתי נשכחת."
        />
        {/* תוכן אודות */}
        <div
          className="
            mx-auto mb-8 max-w-4xl text-center
            text-sm leading-7 text-gray-300
            sm:mb-12 sm:text-lg sm:leading-8
            lg:mb-16 lg:text-xl lg:leading-9
          "
        >
          <p>
            במאסטרו איוונט אנחנו מאמינים שכל אירוע
            הוא רגע שלא חוזר, ולכן אנחנו דואגים
            שכל פרט יהיה מושלם.
          </p>
          <p className="mt-4 sm:mt-6">
            אנחנו מציעים מגוון רחב של שירותים במקום אחד:
            צילום סטילס, מגנטים, בר אקטיבי, חבילת סלואו,
            זיקוקים קרים, קיאק פירות, עיצוב בלונים ועוד.
          </p>
          <p className="mt-4 sm:mt-6">
            המטרה שלנו היא להעניק לכל לקוח שירות אישי,
            מקצועיות ללא פשרות וחוויה שתישאר איתכם
            הרבה אחרי שהאירוע יסתיים.
          </p>
        </div>
        {/* נתונים מרכזיים */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-8">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="
                  flex flex-col items-center justify-center
                  rounded-2xl border border-[#2d2d2d]
                  bg-[#111] p-4 text-center
                  transition-all duration-300
                  hover:border-[#D4AF37]
                  sm:rounded-3xl sm:p-6
                  lg:p-8 lg:hover:-translate-y-2
                "
              >
                <Icon
                  className="
                    mb-3 h-7 w-7 text-[#D4AF37]
                    sm:mb-4 sm:h-9 sm:w-9
                    lg:mb-5 lg:h-[42px] lg:w-[42px]
                  "
                  aria-hidden="true"
                />
                <div
                  className={`
                    mb-2 font-bold text-[#D4AF37]
                    ${
                      item.number === "★★★★★"
                        ? "text-xl sm:text-2xl lg:text-3xl"
                        : "text-2xl sm:text-3xl lg:text-4xl"
                    }
                  `}
                  dir="ltr"
                >
                  {item.number}
                </div>
                <div className="text-xs leading-5 text-white sm:text-base sm:leading-6 lg:text-lg">
                  {item.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}