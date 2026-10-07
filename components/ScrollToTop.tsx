"use client";

import { useEffect, useState ,  } from "react";

export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }}
      aria-label="חזרה לראש הדף"
      className="
        fixed
        bottom-6
        right-6
        z-50
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-full
        bg-[#D4AF37]
        text-black
        shadow-[0_0_25px_rgba(212,175,55,0.35)]
        transition-all
        duration-300
        hover:scale-110
        hover:bg-[#e6c34d]
        hover:shadow-[0_0_35px_rgba(212,175,55,0.55)]
      "
    >
<span className="text-2xl font-black">
  ↑
</span>

    </button>
  );
}