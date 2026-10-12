export function passwordStrength(password = '') {
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  if (score <= 2) return { label: 'Weak', tone: 'text-red-700', score };
  if (score <= 4) return { label: 'Good', tone: 'text-amber-700', score };
  return { label: 'Strong', tone: 'text-green-700', score };
}
