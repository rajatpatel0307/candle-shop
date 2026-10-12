import { AuthLayout } from '../components/AuthLayout.jsx';
import { ResetPasswordForm } from '../components/ResetPasswordForm.jsx';

export function ResetPasswordPage() {
  return <AuthLayout title="Choose new password" subtitle="Use the secure reset token from your email."><ResetPasswordForm /></AuthLayout>;
}
