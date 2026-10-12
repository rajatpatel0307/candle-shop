import { AuthLayout } from '../components/AuthLayout.jsx';
import { LoginForm } from '../components/LoginForm.jsx';

export function LoginPage() {
  return <AuthLayout title="Welcome back" subtitle="Sign in to manage orders, wishlist, and checkout faster."><LoginForm /></AuthLayout>;
}
