import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Join Zelo Today"
      description="Create your account to start connecting with skilled artisans or offering your services."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
