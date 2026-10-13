const STAFF_ROLES = ['ADMIN', 'SUPPORT'];

function normalizeRole(role) {
  return String(role || '').trim().toUpperCase();
}

export function getUserRoles(user) {
  return Array.isArray(user?.roles) ? user.roles.map(normalizeRole) : [];
}

export function hasAnyRole(user, roles) {
  const userRoles = getUserRoles(user);
  return roles.some((role) => userRoles.includes(normalizeRole(role)));
}

export function getRoleHomePath(user) {
  if (hasAnyRole(user, STAFF_ROLES)) return '/admin/dashboard';
  return '/account';
}

export function getPostAuthPath(user, fromPath) {
  const isStaff = hasAnyRole(user, STAFF_ROLES);

  if (isStaff) {
    return fromPath?.startsWith('/admin') ? fromPath : '/admin/dashboard';
  }

  if (fromPath?.startsWith('/admin')) {
    return getRoleHomePath(user);
  }

  return fromPath && fromPath !== '/login' && fromPath !== '/register' ? fromPath : getRoleHomePath(user);
}
