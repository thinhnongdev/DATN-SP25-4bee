import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const getRoleFromToken = (token) => {
  try {
    return jwtDecode(token)?.scope || null;
  } catch {
    return null;
  }
};

const ProtectedRoutes = ({ allowedRoles }) => {

  const token = localStorage.getItem('token');
  const role = token ? getRoleFromToken(token) : null;

  if (!token || !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
