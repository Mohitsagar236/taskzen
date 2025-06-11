import React from 'react';
import { useUserStore } from '../store/userStore';
import { Button } from './ui/Button';
import { Crown, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export function SubscriptionBanner() {
  const { user, subscription } = useUserStore();

  if (!user || subscription?.plan === 'team') return null;

  const handleUpgrade = () => {
    // This would typically open your payment flow
    toast.success('Redirecting to upgrade page...');
  };

  const isLimitedPlan = subscription?.plan === 'free';
  const isPastDue = subscription?.status === 'past_due';

  if (isPastDue) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-200">
              Your subscription payment is past due. Please update your payment method to avoid service interruption.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpgrade}
              className="mt-2"
            >
              Update Payment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLimitedPlan) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Crown className="w-5 h-5 text-blue-500 mr-3" />
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Upgrade to Pro for unlimited tasks, team collaboration, and more!
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleUpgrade}
            className="ml-4"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  return null;
}