import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserRole } from '../types';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RequireRole: React.FC<RequireRoleProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement de l'espace sécurisé...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirection vers son espace dédié selon son rôle
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'COMMERCANT') return <Navigate to="/commercant" replace />;
    if (user.role === 'CAMIONNEUR') return <Navigate to="/camionneur" replace />;
    if (user.role === 'DESTINATAIRE') return <Navigate to="/destinataire" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
