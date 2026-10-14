import { useDispatch, useSelector } from 'react-redux';
import { loadCurrentUser, loginUser, logoutUser, registerUser, verifyEmailUser } from '../store/authSlice.js';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  return {
    ...auth,
    isAuthenticated: Boolean(auth.user),
    hasRole: (role) => auth.user?.roles?.includes(role),
    loadCurrentUser: () => dispatch(loadCurrentUser()),
    login: (payload) => dispatch(loginUser(payload)).unwrap(),
    register: (payload) => dispatch(registerUser(payload)).unwrap(),
    verifyEmail: (payload) => dispatch(verifyEmailUser(payload)).unwrap(),
    logout: () => dispatch(logoutUser()).unwrap(),
  };
}
