import Hero from "../components/Hero";
import Services from "../components/Services";
import Portfolio from "../components/Portfolio";
import WhyUs from "../components/WhyUs";
import Testimonials from "../components/Testimonials";
import About from "../components/About";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function Home() {
  return (
    <main className="bg-black text-white overflow-x-hidden">
      <Hero />
      <Services />
      <Portfolio />
      <WhyUs />
      <Testimonials />
      <About />
      <Contact />
      <Footer />
      <ScrollToTop />
    </main>
  );
}