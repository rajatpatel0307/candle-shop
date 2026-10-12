import { AuthLayout } from '../components/AuthLayout.jsx';
import { VerifyEmail } from '../components/VerifyEmail.jsx';

export function VerifyEmailPage() {
  return <AuthLayout title="Verify email" subtitle="Confirming your account email."><VerifyEmail /></AuthLayout>;
}
