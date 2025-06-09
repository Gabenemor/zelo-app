
import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { ClientProfileSetupForm } from '@/components/onboarding/client-profile-setup-form';
import { UserCog } from 'lucide-react';
import { OnboardingProgressIndicator } from '@/components/onboarding/onboarding-progress-indicator';

export default function ClientOnboardingStep2() {
  return (
    <div className="container mx-auto max-w-2xl py-8 sm:py-12">
      <PageHeader
        title="Complete Your Profile"
        description="Tell us a bit more about yourself to enhance your Zelo experience."
        icon={UserCog}
      />
      <OnboardingProgressIndicator currentStep={2} totalSteps={2} />
      <div className="p-6 border rounded-lg shadow-sm bg-card">
        <ClientProfileSetupForm />
      </div>
    </div>
  );
}
