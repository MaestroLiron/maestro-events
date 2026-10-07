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
Diamond,
} from "lucide-react";

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-[#090909] py-24">
      <div className="mx-auto max-w-7xl px-6">

<SectionTitle
  title="למה לבחור בנו?"
  subtitle="אנחנו מאמינים שכל אירוע הוא ייחודי. לכן אנו משלבים שירות אישי, מקצועיות, יצירתיות ותשומת לב לכל פרט כדי להפוך את החלום שלכם למציאות."
/>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">

          <div className="group rounded-3xl border border-[#2a2a2a] bg-[#111] p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-[0_0_35px_rgba(212,175,55,0.20)]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-transparent transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <Award size={42} className="text-[#D4AF37]" />
            </div>

            <h3 className="mb-4 text-2xl font-bold text-[#D4AF37]">
              איכות ללא פשרות
            </h3>

            <p className="leading-8 text-gray-400">
              ציוד מתקדם, שירות מקצועי ותוצאה מושלמת בכל אירוע.
            </p>
          </div>

          <div className="group rounded-3xl border border-[#2a2a2a] bg-[#111] p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-[0_0_35px_rgba(212,175,55,0.20)]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-transparent transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <HeartHandshake size={42} className="text-[#D4AF37]" />
            </div>

            <h3 className="mb-4 text-2xl font-bold text-[#D4AF37]">
              יחס אישי
            </h3>

            <p className="leading-8 text-gray-400">
              ליווי אישי והתאמה מלאה לכל לקוח מתחילת הדרך ועד סוף האירוע.
            </p>
          </div>

          <div className="group rounded-3xl border border-[#2a2a2a] bg-[#111] p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-[0_0_35px_rgba(212,175,55,0.20)]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-transparent transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <Clock3 size={42} className="text-[#D4AF37]" />
            </div>

            <h3 className="mb-4 text-2xl font-bold text-[#D4AF37]">
              עמידה בזמנים
            </h3>

            <p className="leading-8 text-gray-400">
              מתחייבים להגיע בזמן ולעמוד בכל לוחות הזמנים של האירוע.
            </p>
          </div>
          <div className="group rounded-3xl border border-[#2a2a2a] bg-[#111] p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-[0_0_35px_rgba(212,175,55,0.20)]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-transparent transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <Camera size={42} className="text-[#D4AF37]" />
            </div>

            <h3 className="mb-4 text-2xl font-bold text-[#D4AF37]">
              ציוד מתקדם
            </h3>

            <p className="leading-8 text-gray-400">
              ציוד צילום ואטרקציות מהמתקדמים בתחום לקבלת איכות מקסימלית.
            </p>
          </div>

          <div className="group rounded-3xl border border-[#2a2a2a] bg-[#111] p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-[0_0_35px_rgba(212,175,55,0.20)]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-transparent transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <ShieldCheck size={42} className="text-[#D4AF37]" />
            </div>

            <h3 className="mb-4 text-2xl font-bold text-[#D4AF37]">
              אמינות ומקצועיות
            </h3>

            <p className="leading-8 text-gray-400">
              שקיפות מלאה, ניסיון ושירות ברמה הגבוהה ביותר.
            </p>
          </div>

          <div className="group rounded-3xl border border-[#2a2a2a] bg-[#111] p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-[0_0_35px_rgba(212,175,55,0.20)]">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-gradient-to-br from-[#D4AF37]/20 to-transparent transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
              <Sparkles size={42} className="text-[#D4AF37]" />
            </div>

            <h3 className="mb-4 text-2xl font-bold text-[#D4AF37]">
              חוויה בלתי נשכחת
            </h3>

            <p className="leading-8 text-gray-400">
              כל השירותים במקום אחד כדי להפוך את האירוע שלכם לחוויה מושלמת.
            </p>
          </div>

        </div>

        <div className="mt-20 rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#111] to-[#1b1b1b] p-10 text-center">

          <h3 className="mb-5 text-3xl font-bold text-[#D4AF37] md:text-4xl">
            מוכנים ליצור אירוע בלתי נשכח?
          </h3>

          <p className="mx-auto mb-8 max-w-3xl text-lg leading-9 text-gray-300">
            נשמח ללוות אתכם מהרגע הראשון ועד סוף האירוע,
            להתאים עבורכם את החבילה המושלמת
            ולהעניק חוויה מקצועית, יוקרתית ובלתי נשכחת.
          </p>

          <Link
            href="#contact"
            className="inline-flex items-center gap-3 rounded-xl bg-[#D4AF37] px-8 py-4 font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-[#e8c65b]"
          >
            קבלו הצעת מחיר
            <ArrowLeft size={20} />
          </Link>

        </div>

      </div>
    </section>
  );
}