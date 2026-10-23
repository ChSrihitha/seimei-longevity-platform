import { Navigate, Outlet } from 'react-router-dom';
import { getAuthenticatedUser, isAdminUser } from './auth';

export function AdminRoute() {
  const user = getAuthenticatedUser();
  if (!user) return <Navigate to="/sign-in" replace />;
  return isAdminUser(user) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
