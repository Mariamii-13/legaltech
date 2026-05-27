import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200 text-sm px-4 py-1">
          🇬🇪 Georgia&apos;s #1 Legal Document Platform
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Legal Documents.
          <br />
          <span className="text-blue-700">Done in Minutes.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create professional, legally-binding Georgian contracts — Labor Agreements,
          NDAs, Lease Contracts — by answering simple questions. No lawyer needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-base px-8" asChild>
            <Link href="/register">Start for Free →</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8" asChild>
            <Link href="/#templates">Browse Templates</Link>
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-500">
          <span>✓ Georgian Law Compliant</span>
          <span>✓ Instant PDF Download</span>
          <span>✓ E-Signature Ready</span>
          <span>✓ Bilingual (ქართული / English)</span>
        </div>
      </div>
    </section>
  );
}
