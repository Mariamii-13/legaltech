import { ITemplate, IClause } from '@/types';

function evaluateCondition(
  condition: IClause['condition'],
  answers: Record<string, string | number | boolean>
): boolean {
  if (!condition) return true;
  const answer = answers[condition.questionId];
  switch (condition.operator) {
    case 'equals': return answer === condition.value;
    case 'not_equals': return answer !== condition.value;
    default: return true;
  }
}

function interpolateVariables(
  text: string,
  answers: Record<string, string | number | boolean>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return answers[key] !== undefined ? String(answers[key]) : `[${key}]`;
  });
}

export function renderDocument(
  template: ITemplate,
  answers: Record<string, string | number | boolean>,
  lang: 'en' | 'ka' = 'ka'
): string {
  const activeClauses = template.clauses.filter((clause) =>
    evaluateCondition(clause.condition, answers)
  );

  const clauseContent = activeClauses
    .map((clause) => {
      const text = lang === 'ka' ? clause.contentKa : clause.content;
      return `<p class="mb-4">${interpolateVariables(text, answers)}</p>`;
    })
    .join('\n');

  const header = interpolateVariables(template.headerTemplate || '', answers);
  const footer = interpolateVariables(template.footerTemplate || '', answers);

  return `
    <div class="document">
      <div class="document-header mb-6">${header}</div>
      <div class="document-body space-y-3">${clauseContent}</div>
      <div class="document-footer mt-8 pt-4 border-t text-xs text-gray-400">${footer}</div>
    </div>
  `;
}
