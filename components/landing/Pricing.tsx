import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '0',
    currency: 'GEL',
    period: '/month',
    badge: null,
    features: [
      '1 document/month',
      'Basic templates (Labor Contract)',
      'PDF download',
      'Email support',
    ],
    cta: 'Start Free',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Basic',
    price: '29',
    currency: 'GEL',
    period: '/month',
    badge: 'Most Popular',
    features: [
      '10 documents/month',
      'All templates (20+)',
      'PDF + Word download',
      'E-signature',
      'Priority support',
    ],
    cta: 'Start Basic',
    href: '/register?plan=basic',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '79',
    currency: 'GEL',
    period: '/month',
    badge: null,
    features: [
      'Unlimited documents',
      'All templates',
      'PDF + Word download',
      'E-signature',
      'Team access (3 users)',
      'Custom branding',
      'Dedicated support',
    ],
    cta: 'Start Pro',
    href: '/register?plan=pro',
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-500">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlight ? 'border-blue-500 border-2 shadow-xl scale-105' : 'border-gray-200'}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.badge && (
                    <Badge className="bg-blue-600 text-white text-xs">{plan.badge}</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.currency}{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlight ? 'default' : 'outline'}
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
