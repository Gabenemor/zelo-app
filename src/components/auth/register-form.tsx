
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, UserPlus, Briefcase, Users, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { registerUser, signInWithGoogle, type SignInWithGoogleResult } from "@/lib/auth";
import type { UserRole } from "@/types";

const registerSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
  userType: z.enum(["client", "artisan"], { required_error: "Please select your account type." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface PasswordStrengthResult {
  strength: 'weak' | 'medium' | 'strong' | '';
  suggestions: string[];
  score: number;
}

function calculatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { strength: '', suggestions: [], score: 0 };
  }

  let score = 0;
  const suggestions: string[] = [];

  const hasLength8 = password.length >= 8;
  const hasLength12 = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  if (hasLength8) score++;
  if (hasLength12) score++;
  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;

  let strengthLevel: PasswordStrengthResult['strength'] = '';

  if (score <= 2) {
    strengthLevel = 'weak';
  } else if (score <= 4) {
    strengthLevel = 'medium';
  } else {
    strengthLevel = 'strong';
  }
  
  if (strengthLevel !== 'strong') {
    if (!hasLength8) {
      suggestions.push("Make it at least 8 characters long.");
    } else if (!hasLength12 && strengthLevel === 'medium') {
        suggestions.push("Consider making it 12+ characters for extra strength.");
    }
    if (!hasUppercase) suggestions.push("Add an uppercase letter (A-Z).");
    if (!hasLowercase && password.length > 0) suggestions.push("Add a lowercase letter (a-z).");
    if (!hasNumber) suggestions.push("Add a number (0-9).");
    if (!hasSpecialChar) suggestions.push("Add a special character (e.g., !@#$).");
  }

  return { strength: strengthLevel, suggestions, score };
}


export function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult>({ strength: '', suggestions: [], score: 0 });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: undefined,
    },
  });

  const currentPassword = form.watch("password");

  useEffect(() => {
    if (currentPassword) {
      setPasswordStrength(calculatePasswordStrength(currentPassword));
    } else {
      setPasswordStrength({ strength: '', suggestions: [], score: 0 });
    }
  }, [currentPassword]);

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    try {
      const result = await registerUser(
        values.email,
        values.password,
        `${values.firstName} ${values.lastName}`,
        values.userType as UserRole
      );

      if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.user) {
        toast({ title: "Registration Successful", description: "Welcome! Let's set up your profile." });
        const onboardingQueryParams = new URLSearchParams({
          firstName: values.firstName,
          uid: result.user.uid,
          email: values.email,
        });
        router.push(`/onboarding/${values.userType}/step-1?${onboardingQueryParams.toString()}`);
      }
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    const result: SignInWithGoogleResult = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (result.error) {
      toast({ title: "Google Sign-Up Failed", description: result.error, variant: "destructive" });
    } else if (result.requiresRoleSelection && result.partialUser) {
      toast({ title: "Almost there!", description: `Welcome, ${result.partialUser.displayName || 'User'}! Please choose your account type.` });
      const queryParams = new URLSearchParams({
        uid: result.partialUser.uid,
        email: result.partialUser.email || "",
        displayName: result.partialUser.displayName || "User",
      });
      router.push(`/auth/choose-role?${queryParams.toString()}`);
    } else if (result.user) {
      // Existing user or a case where role was determined (e.g., admin re-auth)
      toast({ title: "Google Sign-In Successful", description: `Welcome, ${result.user.displayName || 'User'}!` });
      let redirectPath = "/dashboard";
      if (result.requiresOnboarding) {
         const queryParams = new URLSearchParams({
          firstName: result.user.displayName?.split(' ')[0] || "User",
          uid: result.user.uid,
        });
        redirectPath = `/onboarding/${result.user.role}/step-1?${queryParams.toString()}`;
      } else if (result.user.role === "admin") {
        redirectPath = "/dashboard/admin";
      } else {
        redirectPath = `/dashboard?role=${result.user.role}`;
      }
      router.push(redirectPath);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="e.g. John" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="e.g. Doe" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
              {currentPassword && currentPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1">
                    <div title="Weak" className={`h-1.5 flex-1 rounded-full transition-colors ${
                      passwordStrength.score >= 1 ? (passwordStrength.strength === 'weak' ? 'bg-destructive' : passwordStrength.strength === 'medium' ? 'bg-yellow-400' : 'bg-green-500') : 'bg-muted'
                    }`} />
                    <div title="Medium" className={`h-1.5 flex-1 rounded-full transition-colors ${
                      passwordStrength.score >= 3 ? (passwordStrength.strength === 'medium' ? 'bg-yellow-400' : 'bg-green-500') : 'bg-muted'
                    }`} />
                    <div title="Strong" className={`h-1.5 flex-1 rounded-full transition-colors ${
                      passwordStrength.score >= 5 ? 'bg-green-500' : 'bg-muted'
                    }`} />
                  </div>
                  {passwordStrength.suggestions.length > 0 && (
                    <ul className="list-inside list-disc space-y-0.5 pt-1 text-xs text-muted-foreground">
                      {passwordStrength.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>I am registering as a...</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="client" className="group">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground group-data-[highlighted]:text-accent-foreground" /> 
                      <span>Client (Looking for services)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="artisan" className="group">
                     <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground group-data-[highlighted]:text-accent-foreground" />
                      <span>Artisan (Offering services)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-semibold" disabled={isLoading || isGoogleLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignUp} disabled={isLoading || isGoogleLoading}>
           {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /><path d="M1 1h22v22H1z" fill="none" /></svg>
          }
          {isGoogleLoading ? "Signing up..." : "Sign up with Google"}
        </Button>
         <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </Form>
  );
}
