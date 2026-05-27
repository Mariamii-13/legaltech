# SmartDocs.ge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Georgian LegalTech SaaS platform where users generate legally-binding contracts via dynamic questionnaires and pay via subscription.

**Architecture:** Next.js 14 App Router for frontend + API routes, MongoDB + Mongoose for data, NextAuth for auth, OpenAI for AI-assisted generation, TBC Pay / BOG Pay for billing.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, MongoDB, Mongoose, NextAuth.js, OpenAI API, Puppeteer (PDF), TBC Pay, BOG Pay, Smsoffice.ge

---

## File Structure

```
smartdocs-ge/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── (auth)/verify-otp/page.tsx
│   ├── (dashboard)/dashboard/page.tsx
│   ├── (dashboard)/documents/page.tsx
│   ├── (dashboard)/documents/[id]/page.tsx
│   ├── (dashboard)/subscription/page.tsx
│   ├── (marketing)/page.tsx              ← landing
│   ├── (marketing)/pricing/page.tsx
│   ├── wizard/[templateId]/page.tsx
│   ├── api/auth/[...nextauth]/route.ts
│   ├── api/users/route.ts
│   ├── api/templates/route.ts
│   ├── api/documents/route.ts
│   ├── api/documents/[id]/route.ts
│   ├── api/documents/[id]/pdf/route.ts
│   ├── api/subscriptions/route.ts
│   ├── api/payments/tbc/route.ts
│   ├── api/payments/bog/route.ts
│   ├── api/payments/webhook/route.ts
│   ├── api/sms/send/route.ts
│   ├── api/sms/verify/route.ts
│   ├── api/ai/suggest/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                               ← shadcn generated
│   ├── layout/Header.tsx
│   ├── layout/Footer.tsx
│   ├── layout/Sidebar.tsx
│   ├── landing/Hero.tsx
│   ├── landing/Features.tsx
│   ├── landing/Pricing.tsx
│   ├── landing/TemplateGrid.tsx
│   ├── auth/LoginForm.tsx
│   ├── auth/RegisterForm.tsx
│   ├── auth/OTPForm.tsx
│   ├── wizard/WizardContainer.tsx
│   ├── wizard/WizardProgress.tsx
│   ├── wizard/QuestionRenderer.tsx
│   ├── wizard/DocumentPreview.tsx
│   ├── dashboard/DocumentCard.tsx
│   └── dashboard/SubscriptionBadge.tsx
├── lib/
│   ├── mongodb.ts
│   ├── auth.ts
│   ├── document-engine.ts
│   ├── ai-service.ts
│   ├── pdf-generator.ts
│   ├── sms.ts
│   ├── tbc-pay.ts
│   └── bog-pay.ts
├── models/
│   ├── User.ts
│   ├── Subscription.ts
│   ├── Template.ts
│   ├── GeneratedDocument.ts
│   └── OTPCode.ts
├── types/index.ts
├── middleware.ts
└── .env.local
```

---

## PHASE 1 — Frontend

### Task 1: Project Initialization

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`

- [ ] **Step 1: Scaffold Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

Expected output: Next.js 14 project created in current directory.

- [ ] **Step 2: Install core dependencies**

```bash
npm install mongoose next-auth@beta @auth/mongodb-adapter \
  openai puppeteer @react-pdf/renderer \
  react-hook-form @hookform/resolvers zod \
  axios lucide-react clsx tailwind-merge \
  jsonwebtoken bcryptjs
npm install -D @types/bcryptjs @types/jsonwebtoken
```

- [ ] **Step 3: Install and init shadcn/ui**

```bash
npx shadcn@latest init
```

Choose: Default style, Zinc base color, CSS variables yes.

- [ ] **Step 4: Add shadcn components used throughout**

```bash
npx shadcn@latest add button input label card badge \
  dialog sheet progress skeleton toast \
  form select textarea separator avatar \
  dropdown-menu navigation-menu tabs
```

- [ ] **Step 5: Create `.env.local`**

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smartdocs
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
SMSOFFICE_API_KEY=...
TBC_PAY_API_KEY=...
TBC_PAY_SECRET=...
BOG_PAY_CLIENT_ID=...
BOG_PAY_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: scaffold Next.js 14 project with shadcn/ui"
```

---

### Task 2: Types Definition

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Write all shared TypeScript types**

```typescript
// types/index.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

### Task 3: Landing Page

**Files:**
- Create: `app/(marketing)/page.tsx`
- Create: `components/landing/Hero.tsx`
- Create: `components/landing/Features.tsx`
- Create: `components/landing/Pricing.tsx`
- Create: `components/landing/TemplateGrid.tsx`
- Create: `components/layout/Header.tsx`
- Create: `components/layout/Footer.tsx`

- [ ] **Step 1: Create Header**

```tsx
// components/layout/Header.tsx
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-blue-700">
          SmartDocs<span className="text-gray-500">.ge</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
          <Link href="#templates" className="text-gray-600 hover:text-gray-900">Templates</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
          <Button asChild><Link href="/register">Get Started</Link></Button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create Hero**

```tsx
// components/landing/Hero.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-800">Georgia's #1 Legal Document Platform</Badge>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Legal Documents.<br />
          <span className="text-blue-700">Done in Minutes.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Create professional, legally-binding Georgian contracts — Labor Agreements,
          NDAs, Lease Contracts — by answering simple questions. No lawyer needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/register">Start for Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#templates">Browse Templates</Link>
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-6">✓ Georgian Law Compliant  ✓ Instant Download  ✓ E-Signature Ready</p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create Features section**

```tsx
// components/landing/Features.tsx
import { FileText, Shield, Zap, Globe } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Instant Generation', titleKa: 'მყისიერი შექმნა',
    desc: 'Answer questions, get a ready document in under 5 minutes.' },
  { icon: Shield, title: 'Georgian Law Compliant', titleKa: 'ქართული კანონმდებლობა',
    desc: 'All templates reviewed and updated by Georgian legal professionals.' },
  { icon: FileText, title: '20+ Templates', titleKa: '20+ შაბლონი',
    desc: 'Labor contracts, NDAs, lease agreements, service contracts and more.' },
  { icon: Globe, title: 'Bilingual (KA/EN)', titleKa: 'ორენოვანი',
    desc: 'All documents available in Georgian and English.' },
];

export function Features() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why SmartDocs.ge?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.title} className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create Pricing section**

```tsx
// components/landing/Pricing.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Free', price: '0', currency: 'GEL', period: '/month',
    badge: null,
    features: ['1 document/month', 'Basic templates', 'PDF download'],
    cta: 'Start Free', href: '/register',
  },
  {
    name: 'Basic', price: '29', currency: 'GEL', period: '/month',
    badge: 'Popular',
    features: ['10 documents/month', 'All templates', 'PDF + Word download', 'E-signature'],
    cta: 'Start Basic', href: '/register?plan=basic',
  },
  {
    name: 'Pro', price: '79', currency: 'GEL', period: '/month',
    badge: null,
    features: ['Unlimited documents', 'All templates', 'Priority support', 'Team access (3 users)', 'Custom branding'],
    cta: 'Start Pro', href: '/register?plan=pro',
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Simple, Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.badge ? 'border-blue-500 border-2 shadow-lg' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.badge && <Badge className="bg-blue-600">{plan.badge}</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.currency}{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.badge ? 'default' : 'outline'} asChild>
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Assemble landing page**

```tsx
// app/(marketing)/page.tsx
import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { Footer } from '@/components/layout/Footer';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 6: Create Footer**

```tsx
// components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="border-t bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="font-bold text-white mb-3">SmartDocs.ge</p>
          <p>Legal documents for Georgian businesses and individuals.</p>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Documents</p>
          <ul className="space-y-1">
            <li>Labor Contract</li><li>NDA</li><li>Lease Agreement</li><li>Service Contract</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Company</p>
          <ul className="space-y-1"><li>About</li><li>Pricing</li><li>Contact</li></ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Legal</p>
          <ul className="space-y-1"><li>Privacy Policy</li><li>Terms of Service</li></ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-xs">
        © 2026 SmartDocs.ge. All rights reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add landing page with Hero, Features, Pricing, Header, Footer"
```

---

### Task 4: Auth Pages

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`
- Create: `app/(auth)/verify-otp/page.tsx`
- Create: `components/auth/LoginForm.tsx`
- Create: `components/auth/RegisterForm.tsx`
- Create: `components/auth/OTPForm.tsx`

- [ ] **Step 1: Create LoginForm component**

```tsx
// components/auth/LoginForm.tsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 2: Create login page**

```tsx
// app/(auth)/login/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your SmartDocs.ge account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          <p className="text-center text-sm text-gray-600">
            No account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Create RegisterForm**

```tsx
// components/auth/RegisterForm.tsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\+995[0-9]{9}$/, 'Georgian phone: +995XXXXXXXXX'),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/users', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      router.push(`/verify-otp?phone=${encodeURIComponent(data.phone)}`);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem><FormLabel>First Name</FormLabel>
              <FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem><FormLabel>Last Name</FormLabel>
              <FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email</FormLabel>
            <FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>Phone (+995XXXXXXXXX)</FormLabel>
            <FormControl><Input placeholder="+995599123456" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>Password</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem><FormLabel>Confirm Password</FormLabel>
            <FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 4: Create register page**

```tsx
// app/(auth)/register/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Join SmartDocs.ge — Georgia's legal document platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm />
          <p className="text-center text-sm text-gray-600">
            Have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: Create OTP verification page**

```tsx
// components/auth/OTPForm.tsx
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

export function OTPForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  async function verify() {
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/sms/verify', { phone, code: otp });
      router.push('/login?verified=true');
    } catch {
      setError('Invalid or expired code');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResendLoading(true);
    await axios.post('/api/sms/send', { phone });
    setResendLoading(false);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 text-center">
        Code sent to <strong>{phone}</strong>
      </p>
      <Input
        placeholder="Enter 6-digit code"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        maxLength={6}
        className="text-center text-2xl tracking-widest"
      />
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      <Button className="w-full" onClick={verify} disabled={loading || otp.length < 6}>
        {loading ? 'Verifying...' : 'Verify Phone'}
      </Button>
      <Button variant="ghost" className="w-full text-sm" onClick={resend} disabled={resendLoading}>
        Resend code
      </Button>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add auth pages (login, register, OTP verification)"
```

---

### Task 5: Dashboard Layout

**Files:**
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(dashboard)/dashboard/page.tsx`
- Create: `components/layout/Sidebar.tsx`
- Create: `components/dashboard/DocumentCard.tsx`
- Create: `components/dashboard/SubscriptionBadge.tsx`

- [ ] **Step 1: Create Sidebar**

```tsx
// components/layout/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutDashboard, CreditCard, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documents', label: 'My Documents', icon: FileText },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="font-bold text-lg">SmartDocs<span className="text-gray-400">.ge</span></Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white')}>
            <Icon className="w-4 h-4" />{label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white w-full">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create dashboard layout**

```tsx
// app/(dashboard)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create DocumentCard**

```tsx
// components/dashboard/DocumentCard.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';
import Link from 'next/link';
import { IGeneratedDocument } from '@/types';
import { format } from 'date-fns';

export function DocumentCard({ doc }: { doc: IGeneratedDocument }) {
  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    signed: 'bg-blue-100 text-blue-800',
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <CardTitle className="text-base">{doc.templateName}</CardTitle>
              <p className="text-xs text-gray-500">{format(new Date(doc.createdAt), 'dd MMM yyyy')}</p>
            </div>
          </div>
          <Badge className={statusColors[doc.status]}>{doc.status}</Badge>
        </div>
      </CardHeader>
      <CardFooter className="gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href={`/documents/${doc._id}`}><Eye className="w-4 h-4 mr-1" />View</Link>
        </Button>
        {doc.pdfUrl && (
          <Button size="sm" variant="outline" asChild>
            <a href={doc.pdfUrl} download><Download className="w-4 h-4 mr-1" />PDF</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 4: Create dashboard page**

```tsx
// app/(dashboard)/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {session?.user?.name}</h1>
          <p className="text-gray-500">Manage your legal documents</p>
        </div>
        <Button asChild>
          <Link href="/templates"><Plus className="w-4 h-4 mr-2" />New Document</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm text-gray-500">Documents Created</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">0</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-gray-500">Current Plan</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-blue-600">Free</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-gray-500">Documents This Month</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">0 / 1</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add dashboard layout, sidebar, document card"
```

---

### Task 6: Document Wizard UI

**Files:**
- Create: `app/wizard/[templateId]/page.tsx`
- Create: `components/wizard/WizardContainer.tsx`
- Create: `components/wizard/WizardProgress.tsx`
- Create: `components/wizard/QuestionRenderer.tsx`
- Create: `components/wizard/DocumentPreview.tsx`

- [ ] **Step 1: Create WizardProgress**

```tsx
// components/wizard/WizardProgress.tsx
import { Progress } from '@/components/ui/progress';

interface Props {
  current: number;
  total: number;
  title: string;
}

export function WizardProgress({ current, total, title }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Step {current} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <Progress value={pct} className="h-2" />
      <p className="text-xs text-gray-500">{title}</p>
    </div>
  );
}
```

- [ ] **Step 2: Create QuestionRenderer**

```tsx
// components/wizard/QuestionRenderer.tsx
'use client';
import { IQuestion } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
      <Label className="text-base font-medium">
        {label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {question.type === 'text' && (
        <Input value={value as string} onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder} />
      )}

      {question.type === 'textarea' && (
        <Textarea value={value as string} onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder} rows={4} />
      )}

      {question.type === 'select' && (
        <Select value={value as string} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
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
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50">
              <input type="radio" name={question.id} value={opt.value}
                checked={value === opt.value} onChange={() => onChange(opt.value)}
                className="w-4 h-4" />
              <span>{lang === 'ka' ? opt.labelKa : opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'date' && (
        <Input type="date" value={value as string} onChange={(e) => onChange(e.target.value)} />
      )}

      {question.type === 'number' && (
        <Input type="number" value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          min={question.validation?.min} max={question.validation?.max} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create WizardContainer**

```tsx
// components/wizard/WizardContainer.tsx
'use client';
import { useState, useMemo } from 'react';
import { ITemplate, IQuestion, WizardState } from '@/types';
import { WizardProgress } from './WizardProgress';
import { QuestionRenderer } from './QuestionRenderer';
import { DocumentPreview } from './DocumentPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function isQuestionVisible(question: IQuestion, answers: Record<string, string | number | boolean>): boolean {
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
  const [lang, setLang] = useState<'en' | 'ka'>('ka');

  const visibleQuestions = useMemo(
    () => template.questions.filter((q) => isQuestionVisible(q, answers)),
    [template.questions, answers]
  );

  const currentQuestion = visibleQuestions[currentStep];
  const isLastStep = currentStep === visibleQuestions.length - 1;
  const canProceed = !currentQuestion?.required || answers[currentQuestion?.id] !== undefined;

  function handleAnswer(value: string | number | boolean) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await axios.post('/api/documents', {
        templateId: template._id,
        answers,
      });
      router.push(`/documents/${res.data._id}`);
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{lang === 'ka' ? template.nameKa : template.name}</h1>
        <Button variant="outline" size="sm" onClick={() => setLang(lang === 'ka' ? 'en' : 'ka')}>
          {lang === 'ka' ? 'English' : 'ქართული'}
        </Button>
      </div>

      <WizardProgress current={currentStep + 1} total={visibleQuestions.length}
        title={lang === 'ka' ? currentQuestion?.labelKa : currentQuestion?.label} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            {currentQuestion && (
              <QuestionRenderer question={currentQuestion}
                value={answers[currentQuestion.id] ?? ''}
                onChange={handleAnswer} lang={lang} />
            )}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)}
                disabled={currentStep === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              {isLastStep ? (
                <Button onClick={handleSubmit} disabled={!canProceed || submitting}>
                  {submitting ? 'Generating...' : 'Generate Document'}
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
```

- [ ] **Step 4: Create DocumentPreview**

```tsx
// components/wizard/DocumentPreview.tsx
'use client';
import { ITemplate } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { renderDocument } from '@/lib/document-engine';
import { useMemo } from 'react';

interface Props {
  template: ITemplate;
  answers: Record<string, string | number | boolean>;
  lang: 'en' | 'ka';
}

export function DocumentPreview({ template, answers, lang }: Props) {
  const preview = useMemo(() => renderDocument(template, answers, lang), [template, answers, lang]);
  return (
    <Card className="sticky top-4 max-h-[70vh] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-sm text-gray-500">Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none text-xs leading-relaxed"
          dangerouslySetInnerHTML={{ __html: preview }} />
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Create wizard page**

```tsx
// app/wizard/[templateId]/page.tsx
import { WizardContainer } from '@/components/wizard/WizardContainer';
import { connectDB } from '@/lib/mongodb';
import { TemplateModel } from '@/models/Template';
import { notFound } from 'next/navigation';

export default async function WizardPage({ params }: { params: { templateId: string } }) {
  await connectDB();
  const template = await TemplateModel.findById(params.templateId).lean();
  if (!template) notFound();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <WizardContainer template={JSON.parse(JSON.stringify(template))} />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add document wizard UI with conditional logic and live preview"
```

---

## PHASE 2 — Backend + Mongoose

### Task 7: MongoDB Connection

**Files:**
- Create: `lib/mongodb.ts`

- [ ] **Step 1: Write MongoDB connection helper**

```typescript
// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error('MONGODB_URI not defined in .env.local');

let cached = (global as any).mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
  (global as any).mongoose = { conn: null, promise: null };
  cached = (global as any).mongoose;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: 'smartdocs',
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/mongodb.ts
git commit -m "feat: add MongoDB connection helper with caching"
```

---

### Task 8: Mongoose Models

**Files:**
- Create: `models/User.ts`
- Create: `models/Subscription.ts`
- Create: `models/Template.ts`
- Create: `models/GeneratedDocument.ts`
- Create: `models/OTPCode.ts`

- [ ] **Step 1: Create User model**

```typescript
// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDoc extends Document {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: 'user' | 'admin';
  isPhoneVerified: boolean;
  subscriptionId?: mongoose.Types.ObjectId;
  documentsCreatedThisMonth: number;
  lastMonthReset: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDoc>({
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isPhoneVerified: { type: Boolean, default: false },
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  documentsCreatedThisMonth: { type: Number, default: 0 },
  lastMonthReset: { type: Date, default: Date.now },
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
});

UserSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const UserModel: Model<IUserDoc> =
  mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
```

- [ ] **Step 2: Create Subscription model**

```typescript
// models/Subscription.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriptionDoc extends Document {
  userId: mongoose.Types.ObjectId;
  plan: 'free' | 'basic' | 'pro';
  status: 'active' | 'inactive' | 'cancelled' | 'trial';
  startDate: Date;
  endDate: Date;
  paymentProvider: 'tbc' | 'bog' | 'none';
  paymentToken?: string;
  recurringOrderId?: string;
  price: number;
}

const SubscriptionSchema = new Schema<ISubscriptionDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['free', 'basic', 'pro'], default: 'free' },
  status: { type: String, enum: ['active', 'inactive', 'cancelled', 'trial'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  paymentProvider: { type: String, enum: ['tbc', 'bog', 'none'], default: 'none' },
  paymentToken: String,
  recurringOrderId: String,
  price: { type: Number, default: 0 },
}, { timestamps: true });

export const SubscriptionModel: Model<ISubscriptionDoc> =
  mongoose.models.Subscription || mongoose.model<ISubscriptionDoc>('Subscription', SubscriptionSchema);
```

- [ ] **Step 3: Create Template model**

```typescript
// models/Template.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

const QuestionSchema = new Schema({
  id: { type: String, required: true },
  order: { type: Number, required: true },
  type: { type: String, enum: ['text', 'textarea', 'select', 'radio', 'checkbox', 'date', 'number'] },
  label: String,
  labelKa: String,
  placeholder: String,
  required: { type: Boolean, default: true },
  options: [{ value: String, label: String, labelKa: String }],
  conditionalLogic: [{
    questionId: String,
    operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'greater_than'] },
    value: Schema.Types.Mixed,
    action: { type: String, enum: ['show', 'hide'] },
  }],
  validation: { min: Number, max: Number, pattern: String },
}, { _id: false });

const ClauseSchema = new Schema({
  id: { type: String, required: true },
  content: String,
  contentKa: String,
  condition: {
    questionId: String,
    operator: { type: String, enum: ['equals', 'not_equals'] },
    value: Schema.Types.Mixed,
  },
}, { _id: false });

export interface ITemplateDoc extends Document {
  name: string;
  nameKa: string;
  description: string;
  descriptionKa: string;
  category: string;
  requiredPlan: 'free' | 'basic' | 'pro';
  questions: typeof QuestionSchema[];
  clauses: typeof ClauseSchema[];
  headerTemplate: string;
  footerTemplate: string;
  isActive: boolean;
  slug: string;
}

const TemplateSchema = new Schema<ITemplateDoc>({
  name: { type: String, required: true },
  nameKa: { type: String, required: true },
  description: String,
  descriptionKa: String,
  category: { type: String, required: true },
  requiredPlan: { type: String, enum: ['free', 'basic', 'pro'], default: 'free' },
  questions: [QuestionSchema],
  clauses: [ClauseSchema],
  headerTemplate: String,
  footerTemplate: String,
  isActive: { type: Boolean, default: true },
  slug: { type: String, unique: true },
}, { timestamps: true });

export const TemplateModel: Model<ITemplateDoc> =
  mongoose.models.Template || mongoose.model<ITemplateDoc>('Template', TemplateSchema);
```

- [ ] **Step 4: Create GeneratedDocument model**

```typescript
// models/GeneratedDocument.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGeneratedDocumentDoc extends Document {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  templateName: string;
  answers: Record<string, string | number | boolean>;
  renderedContent: string;
  renderedContentKa: string;
  pdfUrl?: string;
  status: 'draft' | 'completed' | 'signed';
}

const GeneratedDocumentSchema = new Schema<IGeneratedDocumentDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
  templateName: String,
  answers: { type: Schema.Types.Mixed, default: {} },
  renderedContent: String,
  renderedContentKa: String,
  pdfUrl: String,
  status: { type: String, enum: ['draft', 'completed', 'signed'], default: 'completed' },
}, { timestamps: true });

export const GeneratedDocumentModel: Model<IGeneratedDocumentDoc> =
  mongoose.models.GeneratedDocument ||
  mongoose.model<IGeneratedDocumentDoc>('GeneratedDocument', GeneratedDocumentSchema);
```

- [ ] **Step 5: Create OTPCode model**

```typescript
// models/OTPCode.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOTPCodeDoc extends Document {
  phone: string;
  code: string;
  expiresAt: Date;
  used: boolean;
}

const OTPCodeSchema = new Schema<IOTPCodeDoc>({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

OTPCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTPCodeModel: Model<IOTPCodeDoc> =
  mongoose.models.OTPCode || mongoose.model<IOTPCodeDoc>('OTPCode', OTPCodeSchema);
```

- [ ] **Step 6: Commit**

```bash
git add models/
git commit -m "feat: add Mongoose models for User, Subscription, Template, GeneratedDocument, OTPCode"
```

---

### Task 9: Document Engine

**Files:**
- Create: `lib/document-engine.ts`

- [ ] **Step 1: Write the core rendering engine**

```typescript
// lib/document-engine.ts
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
  // Replace {{variableName}} with answer values
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
      <div class="document-header">${header}</div>
      <div class="document-body">${clauseContent}</div>
      <div class="document-footer">${footer}</div>
    </div>
  `;
}

export function renderDocumentPlainText(
  template: ITemplate,
  answers: Record<string, string | number | boolean>,
  lang: 'en' | 'ka' = 'ka'
): string {
  const activeClauses = template.clauses.filter((clause) =>
    evaluateCondition(clause.condition, answers)
  );

  const parts = [
    template.headerTemplate ? interpolateVariables(template.headerTemplate, answers) : '',
    ...activeClauses.map((clause) => {
      const text = lang === 'ka' ? clause.contentKa : clause.content;
      return interpolateVariables(text, answers);
    }),
    template.footerTemplate ? interpolateVariables(template.footerTemplate, answers) : '',
  ];

  return parts.filter(Boolean).join('\n\n');
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/document-engine.ts
git commit -m "feat: add document rendering engine with conditional clauses and variable interpolation"
```

---

### Task 10: API Routes

**Files:**
- Create: `app/api/users/route.ts`
- Create: `app/api/templates/route.ts`
- Create: `app/api/documents/route.ts`
- Create: `app/api/documents/[id]/route.ts`

- [ ] **Step 1: Create users API (registration)**

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { SubscriptionModel } from '@/models/Subscription';
import { z } from 'zod';
import axios from 'axios';

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\+995[0-9]{9}$/),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    await connectDB();

    const exists = await UserModel.findOne({
      $or: [{ email: data.email }, { phone: data.phone }]
    });
    if (exists) {
      return NextResponse.json({ error: 'Email or phone already registered' }, { status: 409 });
    }

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 100);

    const subscription = await SubscriptionModel.create({
      plan: 'free', status: 'active',
      paymentProvider: 'none', price: 0,
      endDate,
      userId: new (await import('mongoose')).default.Types.ObjectId(),
    });

    const user = await UserModel.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      passwordHash: data.password,
      subscriptionId: subscription._id,
    });

    subscription.userId = user._id;
    await subscription.save();

    // Send OTP
    await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/sms/send`, { phone: data.phone });

    return NextResponse.json({ success: true, userId: user._id }, { status: 201 });
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create templates API**

```typescript
// app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TemplateModel } from '@/models/Template';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  const query: any = { isActive: true };
  if (category) query.category = category;

  const templates = await TemplateModel.find(query)
    .select('name nameKa description descriptionKa category requiredPlan slug')
    .lean();

  return NextResponse.json(templates);
}
```

- [ ] **Step 3: Create documents API**

```typescript
// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { GeneratedDocumentModel } from '@/models/GeneratedDocument';
import { TemplateModel } from '@/models/Template';
import { UserModel } from '@/models/User';
import { SubscriptionModel } from '@/models/Subscription';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { renderDocument, renderDocumentPlainText } from '@/lib/document-engine';

const PLAN_LIMITS = { free: 1, basic: 10, pro: Infinity };

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { templateId, answers } = await req.json();

  const [user, template] = await Promise.all([
    UserModel.findById(session.user.id).populate('subscriptionId'),
    TemplateModel.findById(templateId),
  ]);

  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  const subscription = await SubscriptionModel.findById(user?.subscriptionId);
  const plan = subscription?.plan || 'free';

  // Reset monthly counter if new month
  const now = new Date();
  const lastReset = new Date(user!.lastMonthReset);
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    user!.documentsCreatedThisMonth = 0;
    user!.lastMonthReset = now;
  }

  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];
  if (user!.documentsCreatedThisMonth >= limit) {
    return NextResponse.json({ error: 'Monthly document limit reached. Upgrade your plan.' }, { status: 403 });
  }

  const templateObj = JSON.parse(JSON.stringify(template));
  const renderedContent = renderDocument(templateObj, answers, 'en');
  const renderedContentKa = renderDocument(templateObj, answers, 'ka');

  const doc = await GeneratedDocumentModel.create({
    userId: session.user.id,
    templateId,
    templateName: template.name,
    answers,
    renderedContent,
    renderedContentKa,
    status: 'completed',
  });

  user!.documentsCreatedThisMonth += 1;
  await user!.save();

  return NextResponse.json(doc, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  const docs = await GeneratedDocumentModel.find({ userId: session.user.id })
    .sort({ createdAt: -1 }).lean();
  return NextResponse.json(docs);
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/
git commit -m "feat: add API routes for users, templates, documents"
```

---

## PHASE 3 — Auth + AI Integration

### Task 11: NextAuth Configuration

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create auth options**

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from './mongodb';
import { UserModel } from '@/models/User';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await UserModel.findOne({ email: credentials.email.toLowerCase() });
        if (!user) return null;
        if (!user.isPhoneVerified) return null;
        const valid = await user.comparePassword(credentials.password);
        if (!valid) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
};
```

- [ ] **Step 2: Create NextAuth route**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 3: Add session provider to root layout**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartDocs.ge — Legal Documents Made Simple',
  description: 'Create legally-binding Georgian contracts in minutes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

```tsx
// components/providers/SessionProvider.tsx
'use client';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

- [ ] **Step 4: Add auth middleware**

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
});

export const config = {
  matcher: ['/dashboard/:path*', '/documents/:path*', '/subscription/:path*', '/wizard/:path*'],
};
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add NextAuth with credentials provider, JWT strategy, route protection middleware"
```

---

### Task 12: SMS OTP (Smsoffice.ge)

**Files:**
- Create: `lib/sms.ts`
- Create: `app/api/sms/send/route.ts`
- Create: `app/api/sms/verify/route.ts`

- [ ] **Step 1: Create SMS service**

```typescript
// lib/sms.ts
import axios from 'axios';

const SMSOFFICE_API = 'https://smsoffice.ge/api/v2/send/';

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    const response = await axios.get(SMSOFFICE_API, {
      params: {
        key: process.env.SMSOFFICE_API_KEY,
        destination: phone,
        sender: 'SmartDocs',
        content: message,
        urgent: true,
      },
    });
    return response.data?.success === true;
  } catch {
    return false;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

- [ ] **Step 2: Create send OTP route**

```typescript
// app/api/sms/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OTPCodeModel } from '@/models/OTPCode';
import { sendSMS, generateOTP } from '@/lib/sms';

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone?.match(/^\+995[0-9]{9}$/)) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
  }

  await connectDB();

  // Rate limit: max 3 OTPs per phone per 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentCount = await OTPCodeModel.countDocuments({
    phone, createdAt: { $gte: tenMinutesAgo }
  });
  if (recentCount >= 3) {
    return NextResponse.json({ error: 'Too many attempts. Wait 10 minutes.' }, { status: 429 });
  }

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  await OTPCodeModel.create({ phone, code, expiresAt });

  const sent = await sendSMS(phone, `SmartDocs.ge verification code: ${code}. Valid for 5 minutes.`);
  if (!sent) {
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Create verify OTP route**

```typescript
// app/api/sms/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { OTPCodeModel } from '@/models/OTPCode';
import { UserModel } from '@/models/User';

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();
  await connectDB();

  const otp = await OTPCodeModel.findOne({
    phone,
    code,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otp) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  otp.used = true;
  await otp.save();

  await UserModel.findOneAndUpdate({ phone }, { isPhoneVerified: true });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/sms.ts app/api/sms/
git commit -m "feat: add SMS OTP via Smsoffice.ge with rate limiting"
```

---

### Task 13: AI Integration (OpenAI)

**Files:**
- Create: `lib/ai-service.ts`
- Create: `app/api/ai/suggest/route.ts`

- [ ] **Step 1: Create AI service**

```typescript
// lib/ai-service.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function suggestClauseImprovement(
  clauseText: string,
  context: string,
  lang: 'en' | 'ka' = 'ka'
): Promise<string> {
  const systemPrompt = lang === 'ka'
    ? 'თქვენ ხართ ქართული სამართლის ექსპერტი. გააუმჯობესეთ მოცემული სახელშეკრულებო პუნქტი.'
    : 'You are a Georgian law expert. Improve the given contract clause.';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context: ${context}\n\nClause: ${clauseText}\n\nImprove this clause while keeping it legally sound under Georgian law.` },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content || clauseText;
}

export async function generateMissingAnswer(
  questionLabel: string,
  context: Record<string, string | number | boolean>,
  lang: 'en' | 'ka' = 'ka'
): Promise<string> {
  const contextStr = Object.entries(context)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful legal assistant. Suggest a reasonable default answer for a contract question based on context. Return only the answer, no explanation.',
      },
      {
        role: 'user',
        content: `Context from previous answers: ${contextStr}\n\nQuestion: ${questionLabel}\n\nSuggest a reasonable default answer:`,
      },
    ],
    max_tokens: 100,
    temperature: 0.2,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}
```

- [ ] **Step 2: Create AI suggest route**

```typescript
// app/api/ai/suggest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateMissingAnswer } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { questionLabel, context, lang } = await req.json();

  try {
    const suggestion = await generateMissingAnswer(questionLabel, context, lang);
    return NextResponse.json({ suggestion });
  } catch {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Add AI suggest button to QuestionRenderer**

```tsx
// Add to components/wizard/QuestionRenderer.tsx
// Inside the component, after the input element:

import { useState } from 'react';
import axios from 'axios';
import { Sparkles } from 'lucide-react';

// Add this inside the component before return:
const [aiLoading, setAiLoading] = useState(false);

async function handleAISuggest() {
  setAiLoading(true);
  try {
    const res = await axios.post('/api/ai/suggest', {
      questionLabel: label,
      context: {},  // pass current answers from parent
      lang,
    });
    onChange(res.data.suggestion);
  } finally {
    setAiLoading(false);
  }
}

// Add this button below each input:
// <Button variant="ghost" size="sm" onClick={handleAISuggest} disabled={aiLoading}>
//   <Sparkles className="w-3 h-3 mr-1" /> AI Suggest
// </Button>
```

- [ ] **Step 4: Commit**

```bash
git add lib/ai-service.ts app/api/ai/
git commit -m "feat: add OpenAI integration for AI-assisted document completion"
```

---

## PHASE 4 — Georgian Integrations

### Task 14: TBC Pay Integration

**Files:**
- Create: `lib/tbc-pay.ts`
- Create: `app/api/payments/tbc/route.ts`
- Create: `app/api/payments/webhook/route.ts`

- [ ] **Step 1: Create TBC Pay service**

```typescript
// lib/tbc-pay.ts
import axios from 'axios';

const TBC_API = 'https://api.tbcpayments.ge/v1';

interface TBCPaymentInit {
  amount: number;           // in tetri (GEL * 100)
  currency: 'GEL';
  description: string;
  returnUrl: string;
  failUrl: string;
  saveCard?: boolean;
  userId: string;
}

export async function initTBCPayment(data: TBCPaymentInit) {
  const response = await axios.post(
    `${TBC_API}/tpay/payments`,
    {
      amount: { currency: data.currency, total: data.amount },
      returnurl: data.returnUrl,
      failurl: data.failUrl,
      extra: data.userId,
      saveCard: data.saveCard,
      saveCardToDate: data.saveCard ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.TBC_PAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data; // { payId, status, links: { redirect } }
}

export async function chargeSavedCard(cardId: string, amount: number, currency: 'GEL', userId: string) {
  const response = await axios.post(
    `${TBC_API}/tpay/payments`,
    {
      amount: { currency, total: amount },
      saveCard: false,
      extra: userId,
      cardId,
    },
    {
      headers: { Authorization: `Bearer ${process.env.TBC_PAY_API_KEY}` },
    }
  );
  return response.data;
}

export async function getTBCPaymentStatus(payId: string) {
  const response = await axios.get(`${TBC_API}/tpay/payments/${payId}`, {
    headers: { Authorization: `Bearer ${process.env.TBC_PAY_API_KEY}` },
  });
  return response.data;
}
```

- [ ] **Step 2: Create TBC payment init route**

```typescript
// app/api/payments/tbc/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { initTBCPayment } from '@/lib/tbc-pay';

const PLAN_PRICES: Record<string, number> = {
  basic: 2900,  // 29 GEL in tetri
  pro: 7900,    // 79 GEL in tetri
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan } = await req.json();
  const amount = PLAN_PRICES[plan];
  if (!amount) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const payment = await initTBCPayment({
    amount,
    currency: 'GEL',
    description: `SmartDocs.ge ${plan} plan - monthly subscription`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true&provider=tbc`,
    failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?error=true&provider=tbc`,
    saveCard: true,
    userId: session.user.id,
  });

  return NextResponse.json({ redirectUrl: payment.links?.redirect, payId: payment.payId });
}
```

- [ ] **Step 3: Create payment webhook handler**

```typescript
// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { SubscriptionModel } from '@/models/Subscription';
import { UserModel } from '@/models/User';

export async function POST(req: NextRequest) {
  const body = await req.json();
  await connectDB();

  // TBC Pay webhook payload
  if (body.payId && body.status === 'Succeeded') {
    const userId = body.extra;
    const cardId = body.cardId;

    const user = await UserModel.findById(userId);
    if (!user) return NextResponse.json({ ok: false });

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await SubscriptionModel.findOneAndUpdate(
      { userId },
      {
        status: 'active',
        plan: body.plan || 'basic',
        paymentProvider: 'tbc',
        paymentToken: cardId,
        endDate,
      },
      { upsert: true }
    );
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/tbc-pay.ts app/api/payments/
git commit -m "feat: add TBC Pay integration with recurring billing webhook"
```

---

### Task 15: BOG Pay Integration

**Files:**
- Create: `lib/bog-pay.ts`
- Create: `app/api/payments/bog/route.ts`

- [ ] **Step 1: Create BOG Pay service**

```typescript
// lib/bog-pay.ts
import axios from 'axios';

const BOG_API = 'https://api.bog.ge/payments/v1';
let _bogToken: string | null = null;
let _bogTokenExpiry = 0;

async function getBOGToken(): Promise<string> {
  if (_bogToken && Date.now() < _bogTokenExpiry) return _bogToken;

  const res = await axios.post(
    'https://account.bog.ge/auth/realms/bog/protocol/openid-connect/token',
    new URLSearchParams({
      client_id: process.env.BOG_PAY_CLIENT_ID!,
      client_secret: process.env.BOG_PAY_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  _bogToken = res.data.access_token;
  _bogTokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
  return _bogToken!;
}

export async function initBOGPayment(amount: number, orderId: string, userId: string) {
  const token = await getBOGToken();
  const res = await axios.post(
    `${BOG_API}/ecommerce/orders`,
    {
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      purchase_units: [{
        transferable_amount: amount,
        currency: 'GEL',
      }],
      redirect_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true&provider=bog`,
        fail: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?error=true&provider=bog`,
      },
      external_order_id: orderId,
      shop_order_id: `${userId}_${Date.now()}`,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data; // { id, redirect_url }
}
```

- [ ] **Step 2: Create BOG payment route**

```typescript
// app/api/payments/bog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { initBOGPayment } from '@/lib/bog-pay';
import { randomUUID } from 'crypto';

const PLAN_PRICES: Record<string, number> = { basic: 29, pro: 79 };

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json();
  const amount = PLAN_PRICES[plan];
  if (!amount) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const orderId = randomUUID();
  const payment = await initBOGPayment(amount, orderId, session.user.id);

  return NextResponse.json({ redirectUrl: payment.redirect_url, orderId: payment.id });
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/bog-pay.ts app/api/payments/bog/
git commit -m "feat: add BOG Pay (Bank of Georgia) payment integration"
```

---

### Task 16: PDF Generation

**Files:**
- Create: `lib/pdf-generator.ts`
- Create: `app/api/documents/[id]/pdf/route.ts`

- [ ] **Step 1: Create PDF generator**

```typescript
// lib/pdf-generator.ts
import puppeteer from 'puppeteer';

export async function generatePDF(htmlContent: string, title: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@400;700&display=swap');
        body {
          font-family: 'Noto Sans Georgian', 'DejaVu Sans', sans-serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #1a1a1a;
          padding: 2cm;
        }
        h1 { font-size: 16pt; text-align: center; margin-bottom: 2em; }
        p { margin-bottom: 1em; text-align: justify; }
        .document-header { text-align: center; margin-bottom: 2em; border-bottom: 2px solid #333; padding-bottom: 1em; }
        .document-footer { margin-top: 3em; border-top: 1px solid #ccc; padding-top: 1em; }
        .signature-block { display: grid; grid-template-columns: 1fr 1fr; gap: 2em; margin-top: 3em; }
        .signature-line { border-top: 1px solid #333; padding-top: 0.5em; margin-top: 2em; }
      </style>
    </head>
    <body>${htmlContent}</body>
    </html>
  `;

  await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2cm' },
    printBackground: true,
  });

  await browser.close();
  return Buffer.from(pdf);
}
```

- [ ] **Step 2: Create PDF download route**

```typescript
// app/api/documents/[id]/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { GeneratedDocumentModel } from '@/models/GeneratedDocument';
import { generatePDF } from '@/lib/pdf-generator';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const doc = await GeneratedDocumentModel.findOne({
    _id: params.id,
    userId: session.user.id,
  });

  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  const lang = new URL(req.url).searchParams.get('lang') === 'en' ? 'en' : 'ka';
  const content = lang === 'en' ? doc.renderedContent : doc.renderedContentKa;

  const pdf = await generatePDF(content, doc.templateName);

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${doc.templateName}-${doc._id}.pdf"`,
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/pdf-generator.ts app/api/documents/
git commit -m "feat: add PDF generation via Puppeteer with Georgian font support"
```

---

## PHASE 5 — Security & Polish

### Task 17: Security Hardening

**Files:**
- Modify: `next.config.ts`
- Create: `app/api/middleware-utils.ts`

- [ ] **Step 1: Add security headers to Next.js config**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self' api.openai.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
  serverExternalPackages: ['puppeteer'],
};

export default nextConfig;
```

- [ ] **Step 2: Create rate limiter utility**

```typescript
// app/api/middleware-utils.ts
import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: NextRequest, maxRequests: number, windowMs: number): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}
```

- [ ] **Step 3: Seed template data**

```typescript
// scripts/seed-templates.ts
import { connectDB } from '../lib/mongodb';
import { TemplateModel } from '../models/Template';

const laborContractTemplate = {
  name: 'Employment Contract',
  nameKa: 'შრომითი ხელშეკრულება',
  description: 'Standard employment contract compliant with Georgian Labor Code',
  descriptionKa: 'სტანდარტული შრომითი ხელშეკრულება ქართული შრომის კოდექსის შესაბამისად',
  category: 'employment',
  requiredPlan: 'free',
  slug: 'employment-contract',
  questions: [
    {
      id: 'employer_name', order: 1, type: 'text',
      label: 'Employer (Company) Name', labelKa: 'დამსაქმებლის (კომპანიის) სახელი',
      placeholder: 'e.g. Tech Solutions LLC', required: true,
    },
    {
      id: 'employer_id', order: 2, type: 'text',
      label: 'Employer ID Number', labelKa: 'დამსაქმებლის საიდენტიფიკაციო კოდი',
      required: true,
    },
    {
      id: 'employee_name', order: 3, type: 'text',
      label: 'Employee Full Name', labelKa: 'დასაქმებულის სახელი და გვარი',
      required: true,
    },
    {
      id: 'employee_id', order: 4, type: 'text',
      label: 'Employee Personal Number', labelKa: 'დასაქმებულის პირადი ნომერი',
      required: true,
    },
    {
      id: 'position', order: 5, type: 'text',
      label: 'Job Position', labelKa: 'თანამდებობა',
      required: true,
    },
    {
      id: 'salary', order: 6, type: 'number',
      label: 'Monthly Salary (GEL)', labelKa: 'თვიური ანაზღაურება (ლარი)',
      required: true, validation: { min: 0 },
    },
    {
      id: 'start_date', order: 7, type: 'date',
      label: 'Start Date', labelKa: 'დაწყების თარიღი',
      required: true,
    },
    {
      id: 'contract_type', order: 8, type: 'radio',
      label: 'Contract Type', labelKa: 'ხელშეკრულების ვადა',
      required: true,
      options: [
        { value: 'indefinite', label: 'Indefinite (Permanent)', labelKa: 'განუსაზღვრელი ვადით' },
        { value: 'fixed', label: 'Fixed-Term', labelKa: 'ვადიანი' },
      ],
    },
    {
      id: 'end_date', order: 9, type: 'date',
      label: 'Contract End Date', labelKa: 'ხელშეკრულების დასრულების თარიღი',
      required: true,
      conditionalLogic: [
        { questionId: 'contract_type', operator: 'equals', value: 'fixed', action: 'show' },
      ],
    },
    {
      id: 'trial_period', order: 10, type: 'radio',
      label: 'Include Trial Period?', labelKa: 'გამოსაცდელი ვადა?',
      required: true,
      options: [
        { value: 'yes', label: 'Yes (3 months)', labelKa: 'დიახ (3 თვე)' },
        { value: 'no', label: 'No', labelKa: 'არა' },
      ],
    },
  ],
  clauses: [
    {
      id: 'header',
      content: '<h1>EMPLOYMENT CONTRACT</h1>',
      contentKa: '<h1>შრომითი ხელშეკრულება</h1>',
    },
    {
      id: 'parties',
      content: '<p>This Employment Contract is entered into between <strong>{{employer_name}}</strong> (ID: {{employer_id}}) as Employer, and <strong>{{employee_name}}</strong> (Personal Number: {{employee_id}}) as Employee.</p>',
      contentKa: '<p>წინამდებარე შრომითი ხელშეკრულება იდება <strong>{{employer_name}}</strong>-ს (საიდ. კოდი: {{employer_id}}) მხრივ, როგორც დამსაქმებელი, და <strong>{{employee_name}}</strong>-ს (პირ. ნომერი: {{employee_id}}) მხრივ, როგორც დასაქმებული.</p>',
    },
    {
      id: 'position_clause',
      content: '<p><strong>Position:</strong> Employee is hired as {{position}}, commencing {{start_date}}.</p>',
      contentKa: '<p><strong>თანამდებობა:</strong> დასაქმებული მიიღება {{position}}-ად, {{start_date}}-დან.</p>',
    },
    {
      id: 'fixed_term_clause',
      content: '<p><strong>Contract Duration:</strong> This is a fixed-term contract ending on {{end_date}}.</p>',
      contentKa: '<p><strong>ვადა:</strong> ხელშეკრულება დასრულდება {{end_date}}-ს.</p>',
      condition: { questionId: 'contract_type', operator: 'equals', value: 'fixed' },
    },
    {
      id: 'indefinite_clause',
      content: '<p><strong>Contract Duration:</strong> This is a permanent, indefinite-term employment contract.</p>',
      contentKa: '<p><strong>ვადა:</strong> ხელშეკრულება გაფორმებულია განუსაზღვრელი ვადით.</p>',
      condition: { questionId: 'contract_type', operator: 'equals', value: 'indefinite' },
    },
    {
      id: 'salary_clause',
      content: '<p><strong>Compensation:</strong> Employee shall receive a monthly salary of <strong>{{salary}} GEL</strong>.</p>',
      contentKa: '<p><strong>ანაზღაურება:</strong> დასაქმებული მიიღებს თვიურ ანაზღაურებას <strong>{{salary}} ლარი</strong> ოდენობით.</p>',
    },
    {
      id: 'trial_clause',
      content: '<p><strong>Trial Period:</strong> The first 3 months shall be considered a probationary period pursuant to Article 37 of the Georgian Labour Code.</p>',
      contentKa: '<p><strong>გამოსაცდელი ვადა:</strong> პირველი 3 თვე ითვლება გამოსაცდელ ვადად ქართული შრომის კოდექსის 37-ე მუხლის შესაბამისად.</p>',
      condition: { questionId: 'trial_period', operator: 'equals', value: 'yes' },
    },
    {
      id: 'signatures',
      content: '<div class="signature-block"><div><p>Employer: _______________</p><p>{{employer_name}}</p></div><div><p>Employee: _______________</p><p>{{employee_name}}</p></div></div>',
      contentKa: '<div class="signature-block"><div><p>დამსაქმებელი: _______________</p><p>{{employer_name}}</p></div><div><p>დასაქმებული: _______________</p><p>{{employee_name}}</p></div></div>',
    },
  ],
  headerTemplate: '<p style="text-align:right">Date / თარიღი: {{start_date}}</p>',
  footerTemplate: '<p style="text-align:center;font-size:10pt;color:#666">This document was generated by SmartDocs.ge · smartdocs.ge</p>',
};

async function seed() {
  await connectDB();
  await TemplateModel.deleteMany({});
  await TemplateModel.create(laborContractTemplate);
  console.log('Seeded templates');
  process.exit(0);
}

seed();
```

- [ ] **Step 4: Add seed script to package.json**

```json
// Add to scripts in package.json:
"seed": "tsx scripts/seed-templates.ts"
```

```bash
npm install -D tsx
```

- [ ] **Step 5: Run seed**

```bash
npm run seed
```

Expected: `Seeded templates`

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: add security headers, rate limiting, seed script with Labor Contract template"
```

---

## Georgian Integrations Reference

### TBC Pay Recurring Billing Flow
```
1. User selects plan → POST /api/payments/tbc → get redirect URL
2. User completes payment on TBC → TBC calls webhook → subscription activated
3. Monthly: use saved cardId to charge via chargeSavedCard()
4. On failure: mark subscription inactive, email user
```

### BOG Pay Flow
```
1. POST /api/payments/bog → get redirect_url
2. User pays on BOG portal → BOG webhook → subscription activated
3. BOG does not natively support card-on-file recurring; implement via BOG Open API subscriptions endpoint
```

### SMS OTP Flow (Smsoffice.ge)
```
Register at: https://smsoffice.ge
API Key: Account Settings → API
Endpoint: GET https://smsoffice.ge/api/v2/send/?key=KEY&destination=PHONE&sender=SENDER&content=MSG&urgent=true
Rate: Max 1 SMS/minute per number
```

### Digital Signatures (Georgian Law Compliance)
```
Options (in order of compliance strength):
1. Napr.ge — Georgian National e-signature portal (strongest, legally equivalent to handwritten)
2. DocuSign with ID.me — accepted in Georgia for commercial contracts
3. Simple click-to-sign — valid for most commercial contracts under Georgian Civil Code Art. 327

For MVP: implement simple click-to-sign (record timestamp, IP, user ID)
For Pro tier: integrate Napr.ge API for qualified e-signatures
```

### Simple E-Signature Implementation (MVP)
```typescript
// Add to GeneratedDocument model:
signature?: {
  signedAt: Date;
  signedByUserId: string;
  ipAddress: string;
  method: 'click' | 'napr';
}

// API: POST /api/documents/:id/sign
// Records: timestamp, userId, IP → sets status: 'signed'
```

---

## Environment Variables Reference

```env
# Database
MONGODB_URI=mongodb+srv://...

# Auth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://smartdocs.ge

# AI
OPENAI_API_KEY=sk-...

# SMS (Smsoffice.ge)
SMSOFFICE_API_KEY=your-key

# TBC Pay
TBC_PAY_API_KEY=your-tbc-api-key
TBC_PAY_SECRET=your-tbc-secret

# BOG Pay
BOG_PAY_CLIENT_ID=your-bog-client-id
BOG_PAY_CLIENT_SECRET=your-bog-secret

# App
NEXT_PUBLIC_APP_URL=https://smartdocs.ge
```

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set env vars
vercel env add MONGODB_URI production
vercel env add NEXTAUTH_SECRET production
# ... repeat for all vars
```

Note: Puppeteer on Vercel — use `@sparticuz/chromium` instead of full puppeteer for serverless:
```bash
npm install @sparticuz/chromium puppeteer-core
```
