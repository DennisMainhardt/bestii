import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/context/AuthContext';

const SubscriptionSection: React.FC = () => {
  const { currentUser } = useAuth();

  // Placeholder for subscription data and management logic
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<'active' | 'inactive' | 'trial'>('active');
  const [planName, setPlanName] = React.useState('Premium Plan');
  const [nextBillingDate, setNextBillingDate] = React.useState('2024-12-31');

  const handleManageSubscription = async () => {
    // This is a placeholder. In a real application, you would use the
    // Firebase Stripe extension's portal link functionality.
    // For now, it will just log to the console.
    if (currentUser) {
      // In a real app, you'd get the portal link from a backend call
      // or from the user's custom claims if using the Stripe extension.
      // E.g., const portalUrl = '...';
      // window.location.href = portalUrl;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your subscription and billing details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Plan</p>
            <p className="text-muted-foreground">{planName}</p>
          </div>
          <Badge variant={subscriptionStatus === 'active' ? 'default' : 'secondary'}>
            {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
          </Badge>
        </div>

        {subscriptionStatus === 'active' && (
          <div className="flex items-center justify-between">
            <p className="font-medium">Next Billing Date</p>
            <p className="text-muted-foreground">{nextBillingDate}</p>
          </div>
        )}

        <Button onClick={handleManageSubscription} className="w-full">
          Manage Subscription
        </Button>

        {subscriptionStatus === 'inactive' && (
          <Button variant="outline" className="w-full mt-2">
            Renew Subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionSection; 