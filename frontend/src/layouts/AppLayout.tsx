import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Logo } from '../components/brand/Logo';
import { DemoBanner } from '../components/domain/DemoBanner';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Inbox,
  Truck,
  CreditCard,
  AlertTriangle,
  Star,
  User,
  Users,
  DollarSign,
  FileText,
  MapPin,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8F7F2' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Vérification de la session sécurisée...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };

  // Liens dynamiques selon le rôle
  // Liens dynamiques simplifiés et sans doublons
  const getNavItems = () => {
    switch (user.role) {
      case 'COMMERCANT':
        return [
          { to: '/commercant', label: "Vue d'ensemble", icon: <LayoutDashboard size={18} />, end: true },
          { to: '/commercant/demandes', label: 'Mes demandes & Offres', icon: <Package size={18} /> },
          { to: '/commercant/expeditions', label: 'Expéditions & Séquestre', icon: <Truck size={18} /> },
          { to: '/commercant/litiges', label: 'Litiges & Avis', icon: <AlertTriangle size={18} /> },
          { to: '/profil', label: 'Mon profil', icon: <User size={18} /> },
        ];

      case 'CAMIONNEUR':
        return [
          { to: '/camionneur', label: 'Tableau de bord', icon: <LayoutDashboard size={18} />, end: true },
          { to: '/camionneur/demandes-disponibles', label: 'Fret disponible', icon: <Package size={18} /> },
          { to: '/camionneur/mes-transports', label: 'Mes transports & Revenus', icon: <Truck size={18} /> },
          { to: '/profil', label: 'Mon profil & Camion', icon: <User size={18} /> },
        ];

      case 'DESTINATAIRE':
        return [
          { to: '/destinataire', label: 'Réceptions & Code OTP', icon: <Package size={18} />, end: true },
          { to: '/profil', label: 'Mon profil', icon: <User size={18} /> },
        ];

      case 'ADMIN':
        return [
          { to: '/admin', label: "Vue d'ensemble", icon: <LayoutDashboard size={18} />, end: true },
          { to: '/admin/demandes', label: 'Demandes & Expéditions', icon: <Package size={18} /> },
          { to: '/admin/transactions', label: 'Séquestre & Commissions (5 %)', icon: <CreditCard size={18} /> },
          { to: '/admin/utilisateurs', label: 'Utilisateurs & Litiges', icon: <Users size={18} /> },
          { to: '/profil', label: 'Mon profil', icon: <User size={18} /> },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    switch (user.role) {
      case 'COMMERCANT':
        return 'Espace Commerçant';
      case 'CAMIONNEUR':
        return 'Espace Camionneur';
      case 'DESTINATAIRE':
        return 'Espace Destinataire';
      case 'ADMIN':
        return 'Supervision Admin';
      default:
        return 'E-Dépôt';
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Desktop & Mobile */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ justifyContent: 'space-between' }}>
          <Logo variant="light" size="sm" to="/" />
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#A5C4B5', fontWeight: 600 }}>
            {getRoleLabel()}
          </span>
          <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.nom}
          </div>
          {user.nomEntreprise && (
            <div style={{ fontSize: '0.8rem', color: '#D0DDD5' }}>{user.nomEntreprise}</div>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              cursor: 'pointer',
              color: '#F4A5A5',
            }}
          >
            <LogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main">
        <DemoBanner />

        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <Menu size={22} />
            </button>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{getRoleLabel()}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user.verifie && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  color: 'var(--color-success)',
                  backgroundColor: 'var(--color-success-bg)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={13} /> Compte vérifié
              </span>
            )}
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              {user.email}
            </div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
