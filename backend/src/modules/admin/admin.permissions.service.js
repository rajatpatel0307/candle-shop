export function canManageSettings(user) {
  return user?.roles?.includes('ADMIN');
}
