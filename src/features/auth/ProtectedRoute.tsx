import { Navigate, Outlet } from 'react-router-dom';
import { getAuthenticatedUser, isAdminUser } from './auth';

export function ProtectedRoute() {
  const user = getAuthenticatedUser();
  if (!user) return <Navigate to="/sign-in" replace />;
  return isAdminUser(user) ? <Navigate to="/admin" replace /> : <Outlet />;
}