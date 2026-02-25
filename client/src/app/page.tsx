import NavbarDemo from "@/components/resizable-navbar-demo";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <NavbarDemo />
      <Hero />
      <Features />
      <FAQ />
      <Footer />
    </main>
  );
}
