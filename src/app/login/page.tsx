import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome Back to Zelo"
      description="Log in to connect with artisans or find service opportunities."
    >
      <LoginForm />
    </AuthLayout>
  );
}
