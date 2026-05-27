export type UserRole = 'user' | 'admin';
export type SubscriptionPlan = 'free' | 'basic' | 'pro';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'trial';
export type DocumentStatus = 'draft' | 'completed' | 'signed';
export type QuestionType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number';

export interface IUser {
  _id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isPhoneVerified: boolean;
  subscriptionId?: string;
  createdAt: Date;
}

export interface ISubscription {
  _id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  paymentProvider: 'tbc' | 'bog';
  paymentToken?: string;
  price: number;
}

export interface ConditionalLogic {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than';
  value: string | number | boolean;
  action: 'show' | 'hide';
}

export interface IQuestion {
  id: string;
  order: number;
  type: QuestionType;
  label: string;
  labelKa: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string; labelKa: string }[];
  conditionalLogic?: ConditionalLogic[];
  validation?: { min?: number; max?: number; pattern?: string };
}

export interface IClause {
  id: string;
  content: string;
  contentKa: string;
  condition?: {
    questionId: string;
    operator: 'equals' | 'not_equals';
    value: string | boolean;
  };
}

export interface ITemplate {
  _id: string;
  name: string;
  nameKa: string;
  description: string;
  descriptionKa: string;
  category: string;
  requiredPlan: SubscriptionPlan;
  questions: IQuestion[];
  clauses: IClause[];
  headerTemplate: string;
  footerTemplate: string;
  isActive: boolean;
  slug: string;
}

export interface IGeneratedDocument {
  _id: string;
  userId: string;
  templateId: string;
  templateName: string;
  answers: Record<string, string | number | boolean>;
  renderedContent: string;
  pdfUrl?: string;
  status: DocumentStatus;
  createdAt: Date;
}

export interface WizardState {
  currentStep: number;
  totalSteps: number;
  answers: Record<string, string | number | boolean>;
  templateId: string;
}
