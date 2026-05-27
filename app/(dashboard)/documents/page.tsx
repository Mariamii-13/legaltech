import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DocumentsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-500 mt-1">All your generated legal documents</p>
        </div>
        <Button asChild>
          <Link href="/"><Plus className="w-4 h-4 mr-2" /> New Document</Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">No documents yet</h3>
        <p className="text-gray-400 text-sm mb-6">Create your first legal document using one of our templates</p>
        <Button asChild>
          <Link href="/">Browse Templates</Link>
        </Button>
      </div>
    </div>
  );
}
