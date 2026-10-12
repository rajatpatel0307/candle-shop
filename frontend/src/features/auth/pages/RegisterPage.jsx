import { AuthLayout } from '../components/AuthLayout.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';

export function RegisterPage() {
  return <AuthLayout title="Create account" subtitle="Join Candle Commerce for a quieter, warmer shopping experience."><RegisterForm /></AuthLayout>;
}
