import { AuthLayout } from '../components/AuthLayout.jsx';
import { VerifyEmail } from '../components/VerifyEmail.jsx';

export function VerifyEmailPage() {
  return <AuthLayout title="Verify email" subtitle="Enter the 6-digit OTP sent to your email."><VerifyEmail /></AuthLayout>;
}
