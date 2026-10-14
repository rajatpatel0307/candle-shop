import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/authApi.js';
import { useAuth } from '../hooks/useAuth.js';

export function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, status, error, pendingVerificationEmail } = useAuth();
  const [email, setEmail] = useState(params.get('email') || pendingVerificationEmail || '');
  const [otp, setOtp] = useState('');
  const [verified, setVerified] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    await verifyEmail({ email, otp });
    setVerified(true);
  }

  async function handleResend() {
    if (!email) return;
    setResendStatus('Sending...');
    try {
      await authApi.resendVerification(email);
      setResendStatus('A new OTP has been sent if this account still needs verification.');
    } catch {
      setResendStatus('Could not send a new OTP right now.');
    }
  }

  if (verified) {
    return (
      <div className="grid gap-4 text-sm text-stone-700">
        <CheckCircle2 className="h-10 w-10 text-green-700" />
        <p>Your email has been verified.</p>
        <button className="btn-primary w-fit" type="button" onClick={() => navigate('/', { replace: true })}>Continue</button>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-1 text-sm font-medium text-stone-700">
        Email
        <input className="input" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="grid gap-1 text-sm font-medium text-stone-700">
        OTP
        <input
          className="input tracking-widest"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className="btn-primary" disabled={status === 'loading' || otp.length !== 6}>
        {status === 'loading' ? 'Verifying...' : 'Verify account'}
      </button>
      <button className="w-fit text-left text-sm font-semibold text-[#8d5132] underline" type="button" onClick={handleResend}>
        Resend OTP
      </button>
      {resendStatus && <p className="text-sm text-stone-600">{resendStatus}</p>}
    </form>
  );
}
