import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const templates = [
  { id: '1', name: 'Employment Contract', nameKa: 'შრომითი ხელშეკრულება', category: 'Employment', plan: 'Free', slug: 'employment-contract' },
  { id: '2', name: 'Non-Disclosure Agreement', nameKa: 'კონფიდენციალობის შეთანხმება', category: 'Business', plan: 'Basic', slug: 'nda' },
  { id: '3', name: 'Lease Agreement', nameKa: 'იჯარის ხელშეკრულება', category: 'Real Estate', plan: 'Basic', slug: 'lease-agreement' },
  { id: '4', name: 'Service Contract', nameKa: 'მომსახურების ხელშეკრულება', category: 'Business', plan: 'Basic', slug: 'service-contract' },
  { id: '5', name: 'Loan Agreement', nameKa: 'სესხის ხელშეკრულება', category: 'Finance', plan: 'Pro', slug: 'loan-agreement' },
  { id: '6', name: 'Partnership Agreement', nameKa: 'პარტნიორობის ხელშეკრულება', category: 'Business', plan: 'Pro', slug: 'partnership-agreement' },
];

const planColors: Record<string, string> = {
  Free: 'bg-green-100 text-green-800',
  Basic: 'bg-blue-100 text-blue-800',
  Pro: 'bg-purple-100 text-purple-800',
};

export function TemplateGrid() {
  return (
    <section id="templates" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Legal Document Templates</h2>
          <p className="text-gray-500">All templates reviewed by Georgian legal professionals</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t) => (
            <Card key={t.id} className="group hover:shadow-md transition-all hover:border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight">{t.name}</CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">{t.nameKa}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs shrink-0 ${planColors[t.plan]}`}>{t.plan}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs text-gray-500">{t.category}</Badge>
                  <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-800 p-0 h-auto" asChild>
                    <Link href={`/wizard/${t.id}`}>
                      Use Template <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" asChild>
            <Link href="/register">View All 20+ Templates →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
