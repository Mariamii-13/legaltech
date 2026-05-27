import { Pricing } from '@/components/landing/Pricing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

export default function SubscriptionPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-500 mt-1">Manage your plan and billing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold">Free Plan</p>
              <p className="text-sm text-gray-500">1 document per month</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">Active</Badge>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Upgrade Your Plan</h2>
        <Pricing />
      </div>
    </div>
  );
}
