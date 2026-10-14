import Image from "next/image";
export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[100svh] overflow-hidden md:h-screen"
    >
      {/* תמונת רקע */}
      <Image
        src="/hero-new.jpg"
        alt="Maestro Events"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* שכבה כהה */}
      <div className="absolute inset-0 bg-black/55" />
      {/* תוכן מרכזי */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 py-8 text-center md:px-6">
        {/* לוגו */}
        <Image
          src="/weare.png"
          alt="We Are Maestro"
          width={700}
          height={400}
          priority
          sizes="(max-width: 767px) 82vw, 500px"
          className="mb-3 h-auto w-[82%] max-w-[360px] object-contain md:mb-5 md:w-[90%] md:max-w-[500px]"
        />
        {/* כותרת */}
        <h2 className="mb-7 max-w-3xl text-xl font-semibold leading-relaxed text-white sm:text-2xl md:mb-10 md:text-4xl">
          הופכים כל אירוע לחוויה בלתי נשכחת
        </h2>
        {/* כפתורים */}
        <div className="flex w-full max-w-[320px] flex-col gap-4 md:max-w-none md:flex-row md:justify-center md:gap-5">
          <a
            href="#contact"
            className="w-full rounded-xl bg-[#D4AF37] px-8 py-4 text-center font-semibold text-black transition hover:bg-[#c89d24] md:w-auto"
          >
            קבלו הצעת מחיר
          </a>
          <a
            href="#portfolio"
            className="w-full rounded-xl border-2 border-[#D4AF37] px-8 py-4 text-center font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black md:w-auto"
          >
            צפו בתיק עבודות
          </a>
        </div>
      </div>
    </section>
  );
}