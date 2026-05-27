import { Progress } from '@/components/ui/progress';

interface Props {
  current: number;
  total: number;
  title?: string;
}

export function WizardProgress({ current, total, title }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span className="font-medium">Step {current} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <Progress value={pct} className="h-2" />
      {title && <p className="text-xs text-gray-400 truncate">{title}</p>}
    </div>
  );
}
