"use client";

import { Phone } from "lucide-react";

export default function FloatingCallButton() {
  return (
    <a
 className="
  fixed
  left-5
  bottom-5
  z-[9998]
  md:hidden
        w-16
        h-16
        rounded-full
        bg-[#D4AF37]
        text-black
        flex
        items-center
        justify-center
        shadow-[0_0_25px_rgba(212,175,55,0.55)]
        transition-all
        duration-300
        hover:scale-110
        hover:shadow-[0_0_40px_rgba(212,175,55,0.8)]
        active:scale-95
      "
    >
      <Phone
        size={28}
        strokeWidth={2.5}
      />

      <span
        className="
          absolute
          inset-0
          rounded-full
          border
          border-[#D4AF37]
          animate-ping
          opacity-30
        "
      />
    </a>
  );
}