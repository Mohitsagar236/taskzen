import React from 'react';
import { useUserStore } from '../store/userStore';
import { Button } from '../components/ui/Button';
import { Check, Crown, Users, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      'Up to 100 tasks',
      '1 project',
      'Basic task management',
      '100MB storage',
      'Email support',
    ],
    icon: Star,
    color: 'bg-gray-100 dark:bg-gray-800',
    buttonText: 'Get Started',
  },
  {
    name: 'Pro',
    price: 10,
    description: 'For power users and freelancers',
    features: [
      'Unlimited tasks',
      'Unlimited projects',
      'Up to 5 team members',
      '1GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom fields',
      'API access',
    ],
    icon: Crown,
    color: 'bg-blue-100 dark:bg-blue-900',
    buttonText: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Team',
    price: 25,
    description: 'Best for teams and organizations',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      '5GB storage',
      'Team analytics',
      'Admin controls',
      'Custom branding',
      'SSO integration',
      'Dedicated support',
    ],
    icon: Users,
    color: 'bg-purple-100 dark:bg-purple-900',
    buttonText: 'Contact Sales',
  },
];

export default function Pricing() {
  const { user, subscription } = useUserStore();

  const handleSelectPlan = (planName: string) => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      return;
    }

    if (subscription?.plan === planName.toLowerCase()) {
      toast.info('You are already on this plan');
      return;
    }

    // This would typically integrate with your payment provider
    toast.success(`Redirecting to ${planName} plan checkout...`);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold dark:text-white">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = subscription?.plan === plan.name.toLowerCase();

          return (
            <div
              key={plan.name}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 dark:divide-gray-700 ${
                plan.popular
                  ? 'border-2 border-blue-500 dark:border-blue-400'
                  : 'border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold dark:text-white">
                    {plan.name}
                  </h2>
                  <Icon
                    className={`w-8 h-8 ${
                      plan.popular ? 'text-blue-500' : 'text-gray-500'
                    }`}
                  />
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  {plan.description}
                </p>
                <p className="mt-8">
                  <span className="text-4xl font-bold dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">/month</span>
                </p>

                <Button
                  className="mt-8 w-full"
                  variant={plan.popular ? 'primary' : 'outline'}
                  onClick={() => handleSelectPlan(plan.name)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.buttonText}
                </Button>
              </div>

              <div className="px-6 pt-6 pb-8">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                      <span className="ml-3 text-gray-600 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          All plans include 14-day free trial. No credit card required.
        </p>
        <div className="mt-6">
          <h3 className="text-lg font-semibold dark:text-white">
            Need something else?
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Contact us for custom pricing and enterprise solutions.
          </p>
          <Button variant="outline" className="mt-4">
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}