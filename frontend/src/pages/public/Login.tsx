import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/brand/Logo';
import {
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  Store,
  Truck,
  Package,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';

interface TestProfile {
  role: string;
  label: string;
  nom: string;
  sousTitre: string;
  email: string;
  motDePasse: string;
}

const TEST_PROFILES: TestProfile[] = [
  {
    role: 'COMMERCANT',
    label: 'Commerçant',
    nom: 'Aïssatou Diatta',
    sousTitre: 'GIE Terroir Casamance',
    email: 'aissatou@edepot.sn',
    motDePasse: 'Passer123!',
  },
  {
    role: 'CAMIONNEUR',
    label: 'Camionneur',
    nom: 'Moussa Badji',
    sousTitre: 'Plateau 10T (ZG-4592-A)',
    email: 'moussa@edepot.sn',
    motDePasse: 'Passer123!',
  },
  {
    role: 'DESTINATAIRE',
    label: 'Destinataire (Ziguinchor)',
    nom: 'Ousmane Sané',
    sousTitre: 'Marché Tilène Gros',
    email: 'ousmane@edepot.sn',
    motDePasse: 'Passer123!',
  },
  {
    role: 'DESTINATAIRE_AMADOU',
    label: 'Destinataire (Dakar)',
    nom: 'Amadou Fall',
    sousTitre: 'Marché Syndicat Pikine',
    email: 'amadou@edepot.sn',
    motDePasse: 'Passer123!',
  },
  {
    role: 'ADMIN',
    label: 'Administrateur',
    nom: 'Directeur E-Dépôt',
    sousTitre: 'Supervision & Séquestre',
    email: 'admin@edepot.sn',
    motDePasse: 'Admin2025!',
  },
];

export const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Détection d'un rôle passé en paramètre URL (ex: /connexion?role=COMMERCANT)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paramRole = params.get('role');
    if (paramRole) {
      handleProfileSelect(paramRole.toUpperCase());
    }
  }, [location.search]);

  const handleProfileSelect = (roleKey: string) => {
    setSelectedRole(roleKey);
    setError(null);
    const found = TEST_PROFILES.find((p) => p.role === roleKey);
    if (found) {
      setEmail(found.email);
      setMotDePasse(found.motDePasse);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Veuillez renseigner votre adresse e-mail.');
      return;
    }
    if (!motDePasse) {
      setError('Veuillez renseigner votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await login({ email: cleanEmail, motDePasse });

      // Redirection : aller à l'accueil en premier avec le message de bienvenue personnalisé
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== '/connexion') {
        navigate(from, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides. Veuillez vérifier votre adresse e-mail et votre mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Logo variant="dark" size="md" />
          <h2 style={{ marginTop: '1.25rem', fontSize: '1.6rem', color: 'var(--color-primary)' }}>
            Connexion à E-Dépôt
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Accédez à vos flux de transport, expéditions et paiements sécurisés
          </p>
        </div>

        {/* Section de sélection du profil avec identifiants de test */}
        <div
          style={{
            marginBottom: '1.75rem',
            padding: '1.15rem',
            background: '#F8FAF8',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #D5E2D5',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <label
              style={{
                margin: 0,
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={16} color="var(--color-accent)" />
              Choisir un profil de test
            </label>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#236B4A',
                backgroundColor: '#E2EFE5',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 600,
              }}
            >
              Comptes en base
            </span>
          </div>

          {/* Menu déroulant pour choisir son profil */}
          <div style={{ marginBottom: '0.75rem' }}>
            <select
              className="form-input"
              style={{
                fontSize: '0.875rem',
                backgroundColor: '#FFFFFF',
                borderColor: selectedRole ? 'var(--color-primary)' : '#CBD5CB',
              }}
              value={selectedRole}
              onChange={(e) => handleProfileSelect(e.target.value)}
            >
              <option value="">-- Sélectionnez un profil pour remplir les accès --</option>
              {TEST_PROFILES.map((p) => (
                <option key={p.role} value={p.role}>
                  {p.label} — {p.nom} ({p.email})
                </option>
              ))}
            </select>
          </div>

          {/* Grille de raccourcis visuels par profil */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {TEST_PROFILES.map((p) => {
              const isSelected = selectedRole === p.role;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleProfileSelect(p.role)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    padding: '0.6rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected
                      ? '2px solid var(--color-primary)'
                      : '1px solid #D6E0D6',
                    background: isSelected ? '#EAF4EC' : '#FFFFFF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  <div
                    style={{
                      marginTop: '2px',
                      color: isSelected ? 'var(--color-primary)' : '#4A6B4A',
                      flexShrink: 0,
                    }}
                  >
                    {p.role === 'COMMERCANT' && <Store size={18} />}
                    {p.role === 'CAMIONNEUR' && <Truck size={18} />}
                    {p.role === 'DESTINATAIRE' && <Package size={18} />}
                    {p.role === 'ADMIN' && <ShieldCheck size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '4px',
                      }}
                    >
                      <strong
                        style={{
                          fontSize: '0.825rem',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text)',
                        }}
                      >
                        {p.label}
                      </strong>
                      {isSelected && <Check size={14} color="var(--color-primary)" />}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--color-text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {p.nom}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            className="alert alert-danger"
            style={{
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="email">
              Adresse e-mail
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="form-input"
                placeholder="votre.email@domaine.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSelectedRole('');
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <label className="form-label" htmlFor="password" style={{ margin: 0 }}>
                Mot de passe
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="form-input"
                style={{ paddingRight: '2.75rem' }}
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => {
                  setMotDePasse(e.target.value);
                  setSelectedRole('');
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={<LogIn size={18} />}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            Se connecter
          </Button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.9rem',
            color: 'var(--color-text-muted)',
          }}
        >
          Vous n'avez pas encore de compte ?{' '}
          <Link to="/inscription" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
};
