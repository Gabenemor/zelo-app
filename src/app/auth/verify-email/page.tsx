
import React, { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { VerifyEmailClientContent } from '@/components/auth/verify-email-client-content';
import { Skeleton } from '@/components/ui/skeleton';

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Check Your Email"
      description="We've sent a verification link to your email address."
    >
      <Suspense fallback={<VerifyEmailSkeleton />}>
        <VerifyEmailClientContent />
      </Suspense>
    </AuthLayout>
  );
}

function VerifyEmailSkeleton() {
  return (
    <div className="text-center space-y-6 animate-pulse">
      <Skeleton className="mx-auto h-16 w-16 rounded-full bg-muted" />
      <Skeleton className="h-4 w-3/4 mx-auto bg-muted" />
      <Skeleton className="h-4 w-1/2 mx-auto bg-muted" />
      <Skeleton className="h-10 w-full bg-muted" />
      <Skeleton className="h-3 w-1/4 mx-auto bg-muted" />
    </div>
  );
}
