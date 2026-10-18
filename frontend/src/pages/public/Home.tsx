import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { HeroIllustration } from '../../components/brand/HeroIllustration';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle,
  FileText,
  Smartphone,
  MapPin,
  Lock,
  Users,
  LayoutDashboard,
  PlusCircle,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  const getDashboardUrl = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'CAMIONNEUR':
        return '/camionneur';
      case 'DESTINATAIRE':
        return '/destinataire';
      case 'COMMERCANT':
      default:
        return '/commercant';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'CAMIONNEUR':
        return 'Transporteur';
      case 'DESTINATAIRE':
        return 'Destinataire Marché';
      case 'COMMERCANT':
        return 'Commerçant / Expéditeur';
      default:
        return 'Membre';
    }
  };

  return (
    <div>
      {/* Bannière de Bienvenue & Notification de Nouveauté - Visible lors de la connexion */}
      {user && showWelcomeBanner && (
        <aside
          aria-label="Notification de bienvenue"
          style={{
            backgroundColor: '#123B2A',
            color: '#FFFFFF',
            borderBottom: '3px solid #E88945',
            padding: '0.95rem 0',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.12)',
          }}
        >
          <div className="public-container">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: 1, minWidth: '280px' }}>
                <div
                  style={{
                    backgroundColor: '#E88945',
                    color: '#FFFFFF',
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(232, 137, 69, 0.4)',
                  }}
                >
                  <Sparkles size={19} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        backgroundColor: '#E88945',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        padding: '2px 9px',
                        borderRadius: '20px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Sparkles size={11} /> Nouveautés de votre espace
                    </span>
                    <strong style={{ fontSize: '0.95rem', color: '#FFFFFF' }}>
                      Bienvenue, {user.nom} !
                    </strong>
                  </div>

                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#D2E2D5', lineHeight: 1.4 }}>
                    {user.role === 'COMMERCANT' &&
                      "De nouvelles opportunités de fret groupé et des transporteurs certifiés sont disponibles pour vos récoltes (mangues, agrumes, riz). Le séquestre Wave garantit 100% de vos transactions."}
                    {user.role === 'CAMIONNEUR' &&
                      "4 nouvelles demandes de chargement sont ouvertes sur l'axe Ziguinchor - Bignona - Kolda. Optimisez votre retour à vide avec un règlement net garanti à 95% dès livraison."}
                    {user.role === 'DESTINATAIRE' &&
                      "Vos arrivages de fret au marché sont synchronisés en direct avec remise sécurisée du code secret OTP après inspection des marchandises."}
                    {user.role === 'ADMIN' &&
                      "Supervision globale active : flux de fret en temps réel, arbitrage des litiges et suivi de la retenue d'intermédiation de 5%."}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to={getDashboardUrl(user.role)}>
                  <Button
                    variant="accent"
                    size="sm"
                    icon={<ArrowRight size={14} />}
                    style={{ fontWeight: 700, padding: '0.45rem 1rem' }}
                  >
                    Ouvrir mon tableau de bord
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowWelcomeBanner(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    color: '#E0E8E0',
                    width: 32,
                    height: 32,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  title="Fermer la notification"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="public-container">
          <div className="hero-grid">
            <div>
              <div className="hero-tag">
                <MapPin size={15} />
                {user ? `Connecté • ${getRoleLabel(user.role)}` : 'Plateforme Logistique de Casamance'}
              </div>
              <h1 className="hero-title">
                {user
                  ? `Ravi de vous revoir, ${user.nom.split(' ')[0]} !`
                  : 'Vos marchandises en route, votre activité en mouvement.'}
              </h1>
              <p className="hero-subtitle">
                {user
                  ? `Votre espace ${getRoleLabel(user.role)} est opérationnel. Retrouvez vos opérations en cours, vos cotations de fret et vos garanties financières avec le séquestre Wave.`
                  : 'E-Dépôt connecte directement les commerçants et producteurs agricoles de Casamance aux transporteurs professionnels. Bénéficiez de cotations transparentes et sécurisez chaque transaction avec le séquestre Wave.'}
              </p>

              <div className="hero-actions">
                {user ? (
                  <>
                    <Link to={getDashboardUrl(user.role)}>
                      <Button variant="primary" size="lg" icon={<LayoutDashboard size={18} />}>
                        Accéder à mon tableau de bord
                      </Button>
                    </Link>

                    {user.role === 'COMMERCANT' && (
                      <Link to="/commercant/publier">
                        <Button variant="accent" size="lg" icon={<PlusCircle size={18} />}>
                          Publier une annonce
                        </Button>
                      </Link>
                    )}

                    {user.role === 'CAMIONNEUR' && (
                      <Link to="/camionneur/demandes-disponibles">
                        <Button variant="accent" size="lg" icon={<Search size={18} />}>
                          Trouver du fret disponible
                        </Button>
                      </Link>
                    )}

                    {user.role === 'DESTINATAIRE' && (
                      <Link to="/destinataire">
                        <Button variant="accent" size="lg" icon={<Lock size={18} />}>
                          Suivre mes réceptions
                        </Button>
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link to="/admin/demandes">
                        <Button variant="accent" size="lg" icon={<FileText size={18} />}>
                          Superviser les flux de fret
                        </Button>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/inscription?role=COMMERCANT">
                      <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                        Créer un compte expéditeur
                      </Button>
                    </Link>
                    <Link to="/inscription?role=CAMIONNEUR">
                      <Button variant="accent" size="lg" icon={<Truck size={18} />}>
                        Espace transporteur
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="hero-stats">
                <div className="stat-item">
                  <h4>Casamance</h4>
                  <p>Axe Ziguinchor, Bignona, Kolda</p>
                </div>
                <div className="stat-item">
                  <h4>100 % Séquestre</h4>
                  <p>Garantie financière Wave</p>
                </div>
                <div className="stat-item">
                  <h4>Code OTP</h4>
                  <p>Validation sécurisée à l'arrivée</p>
                </div>
              </div>
            </div>

            <div>
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Raccourcis Rapides Métier (Affiché uniquement aux utilisateurs connectés) */}
      {user && (
        <section
          style={{
            backgroundColor: '#FAFBF9',
            borderBottom: '1px solid var(--color-border)',
            padding: '2rem 0',
          }}
        >
          <div className="public-container">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    color: 'var(--color-primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <LayoutDashboard size={20} color="var(--color-accent)" />
                  Raccourcis rapides ({getRoleLabel(user.role)})
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Accédez directement à vos outils métiers et opérations prioritaires
                </p>
              </div>

              <Link to={getDashboardUrl(user.role)}>
                <Button variant="outline" size="sm" icon={<ArrowRight size={14} />}>
                  Voir mon tableau de bord complet
                </Button>
              </Link>
            </div>

            <div className="grid-4" style={{ gap: '0.85rem' }}>
              {user.role === 'COMMERCANT' && (
                <>
                  <Link
                    to="/commercant/publier"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <PlusCircle size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Publier une demande
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Nouvelle annonce de fret
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/commercant/demandes"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Mes annonces
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Suivi des besoins publiés
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/commercant/offres"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#E88945',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <Users size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Offres reçues
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Cotations des camionneurs
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/commercant/expeditions"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#1F6F8B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <Truck size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Expéditions en cours
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Suivi GPS & séquestre
                      </span>
                    </div>
                  </Link>
                </>
              )}

              {user.role === 'CAMIONNEUR' && (
                <>
                  <Link
                    to="/camionneur/demandes-disponibles"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#E88945',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <Search size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Fret disponible
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Cargaisons à transporter
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/camionneur/mes-transports"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <Truck size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Mes transports
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Trajets actifs & livraisons
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/camionneur/mes-transports?tab=revenus"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Gains Wave
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Règlements 95% garantis
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/profil"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#5A6F5A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Véhicule & Profil
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Gabarit & documents
                      </span>
                    </div>
                  </Link>
                </>
              )}

              {user.role === 'DESTINATAIRE' && (
                <>
                  <Link
                    to="/destinataire"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#1F6F8B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <Lock size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Mes réceptions
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Cargaisons attendues
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/destinataire"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#E88945',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Code secret OTP
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Valider la remise
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/profil"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <Users size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Mon commerce
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Coordonnées & entrepôt
                      </span>
                    </div>
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <LayoutDashboard size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Pilotage Général
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Métriques & volumes
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/admin/demandes"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#E88945',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Demandes & Fret
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Superviser les flux
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/admin/transactions"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Séquestre & 5%
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Commissions & flux Wave
                      </span>
                    </div>
                  </Link>

                  <Link
                    to="/admin/utilisateurs"
                    className="card"
                    style={{
                      padding: '1.15rem',
                      textDecoration: 'none',
                      color: 'inherit',
                      border: '1px solid #D9E5D9',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#1F6F8B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        flexShrink: 0,
                      }}
                    >
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--color-primary)' }}>
                        Utilisateurs & Litiges
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        Arbitrage & conformité
                      </span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Comment ça fonctionne (4 étapes claires) */}
      <section className="section">
        <div className="public-container">
          <div className="section-header">
            <span className="section-tag">Fonctionnement</span>
            <h2 className="section-title">Le transport de marchandises en 4 étapes simples</h2>
            <p className="section-description">
              Une chaîne logistique transparente : de la publication de la demande jusqu'au déblocage des fonds à la livraison.
            </p>
          </div>

          <div className="grid-4">
            <div className="step-card">
              <span className="step-number">01</span>
              <div className="step-icon">
                <FileText size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Publiez votre besoin</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Indiquez les villes de départ et d'arrivée, le type de récolte (mangues, riz, légumes) et le tonnage estimé.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">02</span>
              <div className="step-icon">
                <Truck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Recevez les offres</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Les transporteurs disponibles sur votre itinéraire proposent leurs tarifs. Comparez et validez le devis adapté.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">03</span>
              <div className="step-icon">
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Séquestre Wave consigné</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Le montant convenu est consigné sous séquestre sécurisé. Le chauffeur procède au chargement avec la certitude d'être payé.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">04</span>
              <div className="step-icon">
                <CheckCircle size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Livraison & Code OTP</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Le destinataire remet son code secret OTP après inspection des marchandises. Les fonds sont débloqués immédiatement au transporteur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sécurité et Séquestre Wave */}
      <section className="section" style={{ backgroundColor: '#F0EFEA' }}>
        <div className="public-container">
          <div className="security-banner">
            <div>
              <span style={{ color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.06em' }}>
                Garantie financière bilatérale
              </span>
              <h3>Paiement sécurisé par séquestre Wave</h3>
              <p>
                Finies les incertitudes de paiement et les retards de règlement sur les routes de Casamance.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={18} color="#E88945" />
                  <span>Le commerçant est garanti que les fonds ne sont libérés qu'après vérification conforme au déchargement.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={18} color="#E88945" />
                  <span>Le camionneur a l'assurance formelle que les fonds sont déjà déposés avant de prendre la route.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle size={18} color="#E88945" />
                  <span>Commission fixe et transparente de 5 % prélevée pour la garantie et la médiation de la plateforme.</span>
                </li>
              </ul>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#E88945', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={22} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#D5DAD5' }}>Intégration Mobile Money</div>
                  <strong style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>Passerelle Wave & Code OTP</strong>
                </div>
              </div>

              <div style={{ fontSize: '0.9rem', color: '#C0C8C0', lineHeight: 1.5 }}>
                En cas d'avarie constatée ou de retard majeur, une procédure de réclamation contradictoire est disponible.
                Les fonds restent sous séquestre jusqu'à décision équitable d'arbitrage.
              </div>

              <Link to={user ? "/suivi" : "/connexion"}>
                <Button variant="accent" size="sm" style={{ width: '100%' }}>
                  {user ? "Suivre une cargaison en direct" : "Se connecter pour le suivi"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Présentation des 3 profils d'acteurs - S'adapte au rôle connecté */}
      <section className="section">
        <div className="public-container">
          <div className="section-header">
            <span className="section-tag">Écosystème</span>
            <h2 className="section-title">Une solution adaptée à chaque acteur de la logistique</h2>
            <p className="section-description">
              Des fonctionnalités pensées pour les besoins réels du commerce rural et interurbain au Sénégal.
            </p>
          </div>

          <div className="grid-3">
            {/* Carte Expéditeurs */}
            <div
              className="card"
              style={
                user?.role === 'COMMERCANT'
                  ? { border: '2px solid var(--color-primary)', position: 'relative' }
                  : {}
              }
            >
              {user?.role === 'COMMERCANT' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#EAF4EC',
                    color: 'var(--color-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '12px',
                  }}
                >
                  Votre rôle actif
                </div>
              )}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  marginBottom: '1rem',
                }}
              >
                <FileText size={20} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                Expéditeurs & GIE
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Publiez vos chargements en quelques secondes, recevez plusieurs propositions tarifaires et suivez l'avancée de vos récoltes sans intermédiaire opaque.
              </p>
              {user?.role === 'COMMERCANT' ? (
                <Link
                  to="/commercant"
                  style={{ fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Accéder à mon espace expéditeur <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  to={user ? "/fonctionnement" : "/inscription?role=COMMERCANT"}
                  style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {user ? "Découvrir les fonctionnalités" : "Rejoindre comme commerçant"} <ArrowRight size={14} />
                </Link>
              )}
            </div>

            {/* Carte Transporteurs */}
            <div
              className="card"
              style={
                user?.role === 'CAMIONNEUR'
                  ? { border: '2px solid #E88945', position: 'relative' }
                  : {}
              }
            >
              {user?.role === 'CAMIONNEUR' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#FDF0E6',
                    color: '#E88945',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '12px',
                  }}
                >
                  Votre rôle actif
                </div>
              )}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#E88945',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  marginBottom: '1rem',
                }}
              >
                <Truck size={20} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                Transporteurs & Camionneurs
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Rentabilisez vos retours à vide en trouvant du fret compatible avec votre gabarit. Paiement garanti à 95% net par virement Wave dès la livraison validée.
              </p>
              {user?.role === 'CAMIONNEUR' ? (
                <Link
                  to="/camionneur"
                  style={{ fontWeight: 700, color: '#E88945', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Accéder à mon espace camionneur <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  to={user ? "/fonctionnement" : "/inscription?role=CAMIONNEUR"}
                  style={{ fontWeight: 600, color: '#E88945', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {user ? "Découvrir les fonctionnalités" : "Rejoindre comme transporteur"} <ArrowRight size={14} />
                </Link>
              )}
            </div>

            {/* Carte Destinataires */}
            <div
              className="card"
              style={
                user?.role === 'DESTINATAIRE'
                  ? { border: '2px solid #1F6F8B', position: 'relative' }
                  : {}
              }
            >
              {user?.role === 'DESTINATAIRE' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#E6F3F7',
                    color: '#1F6F8B',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '12px',
                  }}
                >
                  Votre rôle actif
                </div>
              )}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#1F6F8B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  marginBottom: '1rem',
                }}
              >
                <Lock size={20} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                Destinataires au Marché
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Consultez les camions en approche de votre magasin ou entrepôt. Contrôlez l'état des sacs ou colis avant de transmettre votre code secret OTP.
              </p>
              {user?.role === 'DESTINATAIRE' ? (
                <Link
                  to="/destinataire"
                  style={{ fontWeight: 700, color: '#1F6F8B', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Accéder à mes réceptions <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  to={user ? "/fonctionnement" : "/inscription?role=DESTINATAIRE"}
                  style={{ fontWeight: 600, color: '#1F6F8B', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {user ? "Découvrir les fonctionnalités" : "Rejoindre comme destinataire"} <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Appel à l'action final - S'adapte à la connexion */}
      <section style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF', padding: '4.5rem 0', textAlign: 'center' }}>
        <div className="public-container">
          <h2 style={{ color: '#FFFFFF', fontSize: '2.4rem', marginBottom: '1rem' }}>
            {user
              ? `Votre logistique sécurisée, ${user.nom.split(' ')[0]}`
              : 'Prêt à optimiser vos expéditions de fret ?'}
          </h2>
          <p style={{ color: '#D5DAD5', maxWidth: '620px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
            {user
              ? `Votre compte ${getRoleLabel(user.role)} est connecté. Retrouvez vos opérations en cours, vos cotations de fret et vos garanties Wave.`
              : 'Rejoignez le réseau logistique de Casamance. Inscription rapide avec votre numéro de téléphone.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {user ? (
              <>
                <Link to={getDashboardUrl(user.role)}>
                  <Button variant="accent" size="lg" icon={<LayoutDashboard size={18} />}>
                    Ouvrir mon tableau de bord
                  </Button>
                </Link>
                <Link to="/profil">
                  <Button variant="outline" size="lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' }}>
                    Mon profil & informations
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/inscription">
                  <Button variant="accent" size="lg">
                    Créer un compte
                  </Button>
                </Link>
                <Link to="/connexion">
                  <Button variant="outline" size="lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' }}>
                    Se connecter
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
