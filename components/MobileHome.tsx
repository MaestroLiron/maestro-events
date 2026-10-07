"use client";

import MobileHero from "./MobileHero";
import Services from "./Services";
import Portfolio from "./Portfolio";
import WhyUs from "./WhyUs";
import Testimonials from "./Testimonials";
import About from "./About";
import Contact from "./Contact";
import Footer from "./Footer";

export default function MobileHome() {
  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-black
        text-white
      "
    >
      {/* Hero */}
      <MobileHero />

      {/* שירותים */}
      <Services />

      {/* תיק עבודות */}
      <Portfolio />

      {/* למה אנחנו */}
      <WhyUs />

      {/* המלצות */}
      <Testimonials />

      {/* אודות */}
      <About />

      {/* צור קשר */}
      <Contact />

      {/* Footer */}
      <Footer />
    </main>
  );
}