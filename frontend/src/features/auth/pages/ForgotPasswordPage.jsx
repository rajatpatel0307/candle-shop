import { AuthLayout } from '../components/AuthLayout.jsx';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm.jsx';

export function ForgotPasswordPage() {
  return <AuthLayout title="Reset password" subtitle="Enter your account email and we will send reset instructions."><ForgotPasswordForm /></AuthLayout>;
}
