import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';
import Link from 'next/link';
import { IGeneratedDocument } from '@/types';

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  signed: 'bg-blue-100 text-blue-800',
};

export function DocumentCard({ doc }: { doc: IGeneratedDocument }) {
  const date = new Date(doc.createdAt).toLocaleDateString('ka-GE');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base leading-tight truncate">{doc.templateName}</CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">{date}</p>
            </div>
          </div>
          <Badge className={`text-xs shrink-0 ${statusColors[doc.status]}`}>{doc.status}</Badge>
        </div>
      </CardHeader>
      <CardFooter className="gap-2 pt-0">
        <Button size="sm" variant="outline" asChild>
          <Link href={`/documents/${doc._id}`}><Eye className="w-3 h-3 mr-1" /> View</Link>
        </Button>
        {doc.pdfUrl && (
          <Button size="sm" variant="outline" asChild>
            <a href={doc.pdfUrl} download><Download className="w-3 h-3 mr-1" /> PDF</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
