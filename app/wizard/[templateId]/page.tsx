import { WizardContainer } from '@/components/wizard/WizardContainer';
import { MOCK_TEMPLATES } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function WizardPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  const template = MOCK_TEMPLATES.find((t) => t._id === templateId);
  if (!template) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-6 py-3 flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <span className="text-gray-300">|</span>
        <span className="font-semibold text-gray-900 text-sm">
          SmartDocs<span className="text-gray-400">.ge</span>
        </span>
      </div>
      <div className="p-6 md:p-10">
        <WizardContainer template={template} />
      </div>
    </div>
  );
}
