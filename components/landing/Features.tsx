import { FileText, Shield, Zap, Globe, Clock, Lock } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant Generation',
    titleKa: 'მყისიერი შექმნა',
    desc: 'Answer a few questions and get a ready, professional document in under 5 minutes.',
  },
  {
    icon: Shield,
    title: 'Georgian Law Compliant',
    titleKa: 'ქართული კანონმდებლობა',
    desc: 'All templates reviewed and updated by Georgian legal professionals annually.',
  },
  {
    icon: FileText,
    title: '20+ Templates',
    titleKa: '20+ შაბლონი',
    desc: 'Labor contracts, NDAs, lease agreements, service contracts and more.',
  },
  {
    icon: Globe,
    title: 'Bilingual (KA/EN)',
    titleKa: 'ორენოვანი',
    desc: 'Every document available in Georgian and English simultaneously.',
  },
  {
    icon: Clock,
    title: 'Save & Resume',
    titleKa: 'შენახვა და გაგრძელება',
    desc: 'Start a document, save progress, and come back to finish it later.',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    titleKa: 'უსაფრთხო',
    desc: 'All documents encrypted at rest. Your data never shared with third parties.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why SmartDocs.ge?</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Built specifically for Georgian legal requirements — no generic templates.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
