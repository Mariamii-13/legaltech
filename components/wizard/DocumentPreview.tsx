'use client';
import { ITemplate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { renderDocument } from '@/lib/document-engine';
import { useMemo } from 'react';
import { Eye } from 'lucide-react';

interface Props {
  template: ITemplate;
  answers: Record<string, string | number | boolean>;
  lang: 'en' | 'ka';
}

export function DocumentPreview({ template, answers, lang }: Props) {
  const preview = useMemo(
    () => renderDocument(template, answers, lang),
    [template, answers, lang]
  );

  return (
    <Card className="sticky top-4 max-h-[75vh] flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
          <Eye className="w-4 h-4" /> Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        <div
          className="text-xs leading-relaxed text-gray-700 font-serif"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
      </CardContent>
    </Card>
  );
}
