"use client";

import Image from "next/image";

export default function MobileHero() {
  return (
    <section
      id="home"
      className="
        relative
        min-h-[100svh]
        w-full
        overflow-hidden
        flex
        items-center
        justify-center
      "
    >
      {/* תמונת רקע */}
      <Image
        src="/hero-new.jpg"
        alt="Maestro Events"
        fill
        priority
        className="object-cover object-center"
      />

      {/* שכבה כהה */}
      <div className="absolute inset-0 bg-black/55" />

      {/* תוכן */}
      <div
        className="
          relative
          z-10
          w-full
          flex
          flex-col
          items-center
          justify-center
          text-center
          px-6
          pt-20
          pb-16
        "
      >
        {/* לוגו */}
        <Image
          src="/weare.png"
          alt="We Are Maestro Events"
          width={700}
          height={400}
          priority
          className="
            w-[82%]
            max-w-[350px]
            h-auto
            mb-1
            translate-y-4
          "
        />

        {/* כותרת */}
        <h1
          className="
            text-white
            text-[25px]
            leading-[1.35]
            font-semibold
            max-w-[340px]
            mb-8
          "
        >
          הופכים כל אירוע לחוויה בלתי נשכחת
        </h1>

        {/* כפתורים */}
        <div
          className="
            w-full
            max-w-[330px]
            flex
            flex-col
            gap-4
          "
        >
          {/* קבלו הצעת מחיר */}
          <a
            href="#contact"
            className="
              w-full
              min-h-[62px]
              flex
              items-center
              justify-center
              bg-[#D4AF37]
              text-black
              font-bold
              text-[19px]
              rounded-[24px]
              shadow-[0_8px_25px_rgba(212,175,55,0.25)]
              active:scale-[0.98]
              transition-transform
              touch-manipulation
            "
          >
            קבלו הצעת מחיר
          </a>

          {/* תיק עבודות */}
          <a
            href="#portfolio"
            className="
              w-full
              min-h-[62px]
              flex
              items-center
              justify-center
              border-[3px]
              border-[#D4AF37]
              text-[#D4AF37]
              font-bold
              text-[19px]
              rounded-[24px]
              bg-black/20
              active:bg-[#D4AF37]
              active:text-black
              active:scale-[0.98]
              transition-all
              touch-manipulation
            "
          >
            צפו בתיק עבודות
          </a>
        </div>
      </div>
    </section>
  );
}