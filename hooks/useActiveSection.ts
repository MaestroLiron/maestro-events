"use client";

import { useEffect, useState } from "react";

export default function useActiveSection() {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "home",
        "services",
        "portfolio",
        "why-us",
        "testimonials",
        "about",
        "contact",
      ];

      const scrollPosition = window.scrollY + 250;

      // אם אנחנו ממש בראש העמוד
      if (window.scrollY < 100) {
        setActiveSection("home");
        return;
      }

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);

        if (element && scrollPosition >= element.offsetTop) {
          setActiveSection(sections[i]);
          return;
        }
      }

      setActiveSection("home");
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return activeSection;
}