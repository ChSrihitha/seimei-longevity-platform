import { Navigate, Outlet } from 'react-router-dom';
import { getAuthenticatedUser } from './auth';

export function ProtectedRoute() {
  return getAuthenticatedUser() ? <Outlet /> : <Navigate to="/sign-in" replace />;
}