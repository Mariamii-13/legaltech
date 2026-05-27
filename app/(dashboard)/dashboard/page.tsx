import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

const recentTemplates = [
  { id: '1', name: 'Employment Contract', nameKa: 'შრომითი ხელშეკრულება', category: 'Employment' },
  { id: '2', name: 'NDA', nameKa: 'კონფიდენციალობის შეთანხმება', category: 'Business' },
  { id: '3', name: 'Lease Agreement', nameKa: 'იჯარის ხელშეკრულება', category: 'Real Estate' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Giorgi</h1>
          <p className="text-gray-500 mt-1">Manage your legal documents</p>
        </div>
        <Button asChild>
          <Link href="/"><Plus className="w-4 h-4 mr-2" /> New Document</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Documents Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-400 mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">Free</p>
            <Link href="/subscription" className="text-xs text-blue-500 hover:underline mt-1 block">Upgrade →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4" /> This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">0 <span className="text-lg text-gray-400">/ 1</span></p>
            <p className="text-xs text-gray-400 mt-1">Documents remaining</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Start — Popular Templates</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">View all →</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentTemplates.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-900 truncate">{t.name}</p>
                    <p className="text-xs text-gray-500 truncate">{t.nameKa}</p>
                    <Badge variant="outline" className="text-xs mt-2">{t.category}</Badge>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-4" asChild>
                  <Link href={`/wizard/${t.id}`}>Start Document</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Documents</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No documents yet</p>
          <Button size="sm" className="mt-4" asChild>
            <Link href="/">Create your first document</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
