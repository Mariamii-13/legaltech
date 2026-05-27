import { Header } from '@/components/layout/Header';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/layout/Footer';

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="py-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-gray-500">Start free, upgrade when you need more</p>
        </div>
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
