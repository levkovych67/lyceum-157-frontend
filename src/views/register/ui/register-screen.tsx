import { AuthLayout } from "@/widgets/auth-layout";
import { EditorialLabel } from "@/shared/ui";
import { RegisterForm } from "@/features/auth";

export function RegisterScreen() {
  return (
    <AuthLayout
      photoSide="right"
      photoSlot="auth/register/cover"
      photoCaption="Майстерня художнього класу"
    >
      <div className="w-full max-w-2xl">
        <EditorialLabel>НОВА КАРТКА</EditorialLabel>
        <h1 className="mt-4 font-display text-display italic text-burgundy">Реєстрація</h1>
        <RegisterForm />
      </div>
    </AuthLayout>
  );
}
