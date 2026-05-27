'use client';
import { useState, useMemo } from 'react';
import { ITemplate, IQuestion } from '@/types';
import { WizardProgress } from './WizardProgress';
import { QuestionRenderer } from './QuestionRenderer';
import { DocumentPreview } from './DocumentPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function isQuestionVisible(
  question: IQuestion,
  answers: Record<string, string | number | boolean>
): boolean {
  if (!question.conditionalLogic?.length) return true;
  return question.conditionalLogic.every((logic) => {
    const answer = answers[logic.questionId];
    const match = (() => {
      switch (logic.operator) {
        case 'equals': return answer === logic.value;
        case 'not_equals': return answer !== logic.value;
        case 'contains': return String(answer).includes(String(logic.value));
        case 'greater_than': return Number(answer) > Number(logic.value);
        default: return true;
      }
    })();
    return logic.action === 'show' ? match : !match;
  });
}

interface Props {
  template: ITemplate;
}

export function WizardContainer({ template }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lang, setLang] = useState<'en' | 'ka'>('ka');

  const visibleQuestions = useMemo(
    () => template.questions.filter((q) => isQuestionVisible(q, answers)),
    [template.questions, answers]
  );

  const currentQuestion = visibleQuestions[currentStep];
  const isLastStep = currentStep === visibleQuestions.length - 1;
  const currentValue = currentQuestion ? (answers[currentQuestion.id] ?? '') : '';
  const canProceed = !currentQuestion?.required || (currentValue !== '' && currentValue !== undefined);

  function handleAnswer(value: string | number | boolean) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    // Mock submit for Phase 1 — Phase 2 will POST to /api/documents
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Document Generated!</h2>
        <p className="text-gray-500">
          Your <strong>{lang === 'ka' ? template.nameKa : template.name}</strong> has been created successfully.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          <Button variant="outline" onClick={() => { setSubmitted(false); setCurrentStep(0); setAnswers({}); }}>
            Start New
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lang === 'ka' ? template.nameKa : template.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {lang === 'ka' ? template.descriptionKa : template.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {template.requiredPlan === 'free' ? '🟢 Free' : template.requiredPlan === 'basic' ? '🔵 Basic' : '🟣 Pro'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === 'ka' ? 'en' : 'ka')}
            className="text-xs"
          >
            {lang === 'ka' ? 'Switch to English' : 'ქართულზე გადართვა'}
          </Button>
        </div>
      </div>

      <WizardProgress
        current={currentStep + 1}
        total={visibleQuestions.length}
        title={currentQuestion ? (lang === 'ka' ? currentQuestion.labelKa : currentQuestion.label) : ''}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Question {currentStep + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion && (
              <QuestionRenderer
                question={currentQuestion}
                value={currentValue}
                onChange={handleAnswer}
                lang={lang}
              />
            )}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((s) => s - 1)}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? 'Generating...' : '✓ Generate Document'}
                </Button>
              ) : (
                <Button onClick={() => setCurrentStep((s) => s + 1)} disabled={!canProceed}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <DocumentPreview template={template} answers={answers} lang={lang} />
      </div>
    </div>
  );
}
