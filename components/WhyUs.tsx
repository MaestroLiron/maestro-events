import SectionTitle from "./SectionTitle";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  HeartHandshake,
  Clock3,
  Camera,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
const benefits = [
  {
    icon: Award,
    title: "איכות ללא פשרות",
    description:
      "ציוד מתקדם, שירות מקצועי ותוצאה מושלמת בכל אירוע.",
  },
  {
    icon: HeartHandshake,
    title: "יחס אישי",
    description:
      "ליווי אישי והתאמה מלאה לכל לקוח מתחילת הדרך ועד סוף האירוע.",
  },
  {
    icon: Clock3,
    title: "עמידה בזמנים",
    description:
      "מתחייבים להגיע בזמן ולעמוד בכל לוחות הזמנים של האירוע.",
  },
  {
    icon: Camera,
    title: "ציוד מתקדם",
    description:
      "ציוד צילום ואטרקציות מהמתקדמים בתחום לקבלת איכות מקסימלית.",
  },
  {
    icon: ShieldCheck,
    title: "אמינות ומקצועיות",
    description:
      "שקיפות מלאה, ניסיון ושירות ברמה הגבוהה ביותר.",
  },
  {
    icon: Sparkles,
    title: "חוויה בלתי נשכחת",
    description:
      "כל השירותים במקום אחד כדי להפוך את האירוע שלכם לחוויה מושלמת.",
  },
];
export default function WhyUs() {
  return (
    <section
      id="why-us"
      className="bg-[#090909] py-12 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="למה לבחור בנו?"
          subtitle="אנחנו מאמינים שכל אירוע הוא ייחודי. לכן אנו משלבים שירות אישי, מקצועיות, יצירתיות ותשומת לב לכל פרט כדי להפוך את החלום שלכם למציאות."
        />
        {/* כרטיסי היתרונות */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-8">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article
                key={benefit.title}
                className="
                  group flex h-full flex-col items-center
                  rounded-2xl border border-[#2a2a2a]
                  bg-[#111] p-3 text-center
                  transition-all duration-300
                  hover:border-[#D4AF37]
                  sm:rounded-3xl sm:p-6
                  lg:p-8
                  lg:hover:-translate-y-2
                  lg:hover:shadow-[0_0_35px_rgba(212,175,55,0.15)]
                "
              >
                {/* אייקון */}
                <div
                  className="
                    mb-3 flex h-12 w-12 shrink-0
                    items-center justify-center rounded-full
                    border border-[#D4AF37]/40
                    bg-gradient-to-br from-[#D4AF37]/20 to-transparent
                    transition-transform duration-300
                    sm:mb-5 sm:h-16 sm:w-16
                    lg:mb-6 lg:h-20 lg:w-20
                    lg:group-hover:scale-110
                  "
                >
                  <Icon
                    size={25}
                    strokeWidth={1.8}
                    className="text-[#D4AF37] sm:h-8 sm:w-8 lg:h-[42px] lg:w-[42px]"
                  />
                </div>
                {/* כותרת */}
                <h3
                  className="
                    mb-2 text-sm font-bold leading-snug
                    text-[#D4AF37]
                    sm:mb-3 sm:text-lg
                    lg:mb-4 lg:text-2xl
                  "
                >
                  {benefit.title}
                </h3>
                {/* תיאור */}
                <p
                  className="
                    text-xs leading-5 text-gray-400
                    sm:text-sm sm:leading-6
                    lg:text-base lg:leading-8
                  "
                >
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
        {/* קריאה לפעולה */}
        <div
          className="
            mt-8 rounded-2xl border border-[#D4AF37]/30
            bg-gradient-to-r from-[#111] to-[#1b1b1b]
            p-5 text-center
            sm:mt-12 sm:rounded-3xl sm:p-8
            lg:mt-20 lg:p-10
          "
        >
          <h3
            className="
              mb-3 text-xl font-bold text-[#D4AF37]
              sm:mb-4 sm:text-2xl
              lg:mb-5 lg:text-4xl
            "
          >
            מוכנים ליצור אירוע בלתי נשכח?
          </h3>
          <p
            className="
              mx-auto mb-5 max-w-3xl
              text-sm leading-6 text-gray-300
              sm:mb-7 sm:text-base sm:leading-7
              lg:mb-8 lg:text-lg lg:leading-9
            "
          >
            נשמח ללוות אתכם מהרגע הראשון ועד סוף האירוע,
            להתאים עבורכם את החבילה המושלמת
            ולהעניק חוויה מקצועית, יוקרתית ובלתי נשכחת.
          </p>
          <Link
            href="#contact"
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl bg-[#D4AF37]
              px-6 py-3 text-sm font-bold text-black
              transition-all duration-300
              hover:bg-[#e8c65b]
              active:scale-[0.98]
              sm:gap-3 sm:px-8 sm:py-4 sm:text-base
              lg:hover:scale-105
            "
          >
            קבלו הצעת מחיר
            <ArrowLeft size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}