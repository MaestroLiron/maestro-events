import Image from "next/image";


export default function Hero() {
  return (
    <section id="home" className="relative h-screen overflow-hidden">

      {/* תמונת רקע */}
      <Image
        src="/hero-new.jpg"
        alt="Maestro Events"
        fill
        priority
        className="object-cover"
      />

      {/* שכבה כהה */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* תוכן מרכזי */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">

        {/* לוגו */}
        <Image
          src="/weare.png"
          alt="We Are Maestro"
          width={700}
          height={400}
          priority
          className="w-[90%] max-w-[500px] h-auto -mb-35"
        />

        {/* כותרת */}
        <h2 className="text-white text-2xl md:text-4xl font-semibold mb-10">
          הופכים כל אירוע לחוויה בלתי נשכחת
        </h2>

{/* כפתורים */}
<div className="flex flex-col md:flex-row gap-5">

  <a
    href="#contact"
    className="bg-[#D4AF37] hover:bg-[#c89d24] text-black font-semibold px-8 py-4 rounded-xl text-center transition"
  >
    קבלו הצעת מחיר
  </a>

  <a
    href="#portfolio"
    className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-semibold px-8 py-4 rounded-xl text-center transition"
  >
    צפו בתיק עבודות
  </a>

</div>
      </div>

    </section>
  );
}