import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { TemplateGrid } from '@/components/landing/TemplateGrid';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/layout/Footer';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <TemplateGrid />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
