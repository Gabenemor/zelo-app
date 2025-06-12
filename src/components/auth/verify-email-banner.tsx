
"use client";

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MailWarning, Send, X, Loader2 } from 'lucide-react';
import { resendVerificationEmail } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/components/providers/auth-provider';

export function VerifyEmailBanner() {
  const { user, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!authLoading && user && !user.emailVerified) {
      // Check session storage if user dismissed it for this session
      const dismissed = sessionStorage.getItem(`verifyEmailBannerDismissed_${user.uid}`);
      if (!dismissed) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [user, authLoading]);

  const handleResend = async () => {
    setIsResending(true);
    const result = await resendVerificationEmail();
    if (result.success) {
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox (and spam folder). The link is valid for a limited time.",
      });
    } else {
      toast({
        title: "Error Resending Email",
        description: result.error || "Could not send verification email. Please try again shortly.",
        variant: "destructive",
      });
    }
    setIsResending(false);
  };

  const handleDismiss = () => {
    if (user) {
      // Use sessionStorage to dismiss for the current browser session only
      sessionStorage.setItem(`verifyEmailBannerDismissed_${user.uid}`, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible || authLoading || !user || user.emailVerified) {
    return null;
  }

  return (
    <Alert 
        variant="default" 
        className="mb-4 border-yellow-400 bg-yellow-50 text-yellow-800 shadow-md"
    >
      <MailWarning className="h-5 w-5 !text-yellow-600" />
      <AlertTitle className="font-semibold text-yellow-800">
        Action Required: Verify Your Email Address
      </AlertTitle>
      <AlertDescription className="text-yellow-700">
        Your email address ({user.email}) is not yet verified. 
        Please check your inbox for a verification link sent during registration. 
        Verifying helps secure your account and ensures you receive important notifications.
      </AlertDescription>
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Button
          onClick={handleResend}
          disabled={isResending}
          size="sm"
          variant="outline"
          className="border-yellow-600 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 focus:ring-yellow-500"
        >
          {isResending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Resend Verification Email
        </Button>
        <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 p-1.5"
        >
            <X className="mr-1 h-4 w-4" /> Dismiss
        </Button>
      </div>
    </Alert>
  );
}
