'use client';
import { IQuestion } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Props {
  question: IQuestion;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  lang: 'en' | 'ka';
}

export function QuestionRenderer({ question, value, onChange, lang }: Props) {
  const label = lang === 'ka' ? question.labelKa : question.label;

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-gray-800 leading-relaxed">
        {label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {question.type === 'text' && (
        <Input
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="h-11"
        />
      )}

      {question.type === 'textarea' && (
        <Textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="resize-none"
        />
      )}

      {question.type === 'select' && (
        <Select value={value as string} onValueChange={(val) => onChange(val ?? '')}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {lang === 'ka' ? opt.labelKa : opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {question.type === 'radio' && (
        <div className="space-y-2">
          {question.options?.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                value === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              <input
                type="radio"
                name={question.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium">
                {lang === 'ka' ? opt.labelKa : opt.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'date' && (
        <Input
          type="date"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="h-11"
        />
      )}

      {question.type === 'number' && (
        <Input
          type="number"
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          min={question.validation?.min}
          max={question.validation?.max}
          className="h-11"
        />
      )}
    </div>
  );
}
