import { Award, Camera, HeartHandshake, Sparkles } from "lucide-react";
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
    <section id="about" className="bg-[#090909] py-24">

      <div className="max-w-7xl mx-auto px-6">

<SectionTitle
  title="אודות מאסטרו איוונט"
  subtitle="הכירו את מאסטרו איוונט ואת הדרך שלנו להפוך כל אירוע לחוויה בלתי נשכחת."
/>

        <p className="max-w-4xl mx-auto text-center text-gray-300 text-xl leading-9 mb-16">

          ב-מאסטרו איוונט אנחנו מאמינים שכל אירוע הוא רגע שלא חוזר,
          ולכן אנחנו דואגים שכל פרט יהיה מושלם.

          <br /><br />

          אנחנו מציעים מגוון רחב של שירותים במקום אחד –
          צילום סטילס, מגנטים, בר אקטיבי, חבילת סלואו,
          זיקוקים קרים, קיאק פירות, עיצוב בלונים ועוד.

          <br /><br />

          המטרה שלנו היא להעניק לכל לקוח שירות אישי,
          מקצועיות ללא פשרות וחוויה שתישאר איתכם הרבה אחרי שהאירוע יסתיים.

        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

          {stats.map((item) => {

            const Icon = item.icon;

            return (

              <div
                key={item.title}
                className="bg-[#111] border border-[#2d2d2d] rounded-3xl p-8 text-center hover:border-[#D4AF37] transition-all duration-300 hover:-translate-y-2"
              >

                <Icon
                  className="mx-auto text-[#D4AF37] mb-5"
                  size={42}
                />

                <div className="text-4xl font-bold text-[#D4AF37] mb-3">
                  {item.number}
                </div>

                <div className="text-white text-lg">
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