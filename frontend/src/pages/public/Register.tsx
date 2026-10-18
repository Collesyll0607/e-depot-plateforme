import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/brand/Logo';
import { UserRole } from '../../types';
import { UserPlus, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { LISTE_VILLES } from '../../lib/geo';

const TYPES_CAMION = [
  'Plateau ridelles',
  'Benne basculante',
  'Fourgon frigorifique',
  'Semi-remorque bâché',
  'Citerne',
  'Camionnette / Pick-up bâché',
];

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRoleParam = searchParams.get('role');
  const initialRole: UserRole =
    initialRoleParam === 'CAMIONNEUR' ? 'CAMIONNEUR' :
    initialRoleParam === 'DESTINATAIRE' ? 'DESTINATAIRE' : 'COMMERCANT';

  const [role, setRole] = useState<UserRole>(initialRole);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('+221 ');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmationMdp, setConfirmationMdp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ville, setVille] = useState('Ziguinchor');
  const [adresse, setAdresse] = useState('');

  // Spécifique Commerçant
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [secteurActivite, setSecteurActivite] = useState('Fruits, maraîchage & vivres');

  // Spécifique Camionneur
  const [typeCamion, setTypeCamion] = useState('Plateau ridelles');
  const [capaciteKg, setCapaciteKg] = useState(10000);
  const [immatriculation, setImmatriculation] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePhone = (tel: string) => {
    // Format sénégalais (+221 7X XXX XX XX ou 7X XXX XX XX)
    const cleaned = tel.replace(/[\s-]/g, '');
    return /^(\+221|00221)?[7][05678]\d{7}$/.test(cleaned);
  };

  const validateEmail = (mail: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations côté client
    if (!nom.trim()) {
      setError('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Veuillez renseigner une adresse e-mail valide.');
      return;
    }
    if (!validatePhone(telephone)) {
      setError('Le numéro de téléphone doit être un numéro sénégalais valide (ex: +221 77 123 45 67).');
      return;
    }
    if (motDePasse.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (motDePasse !== confirmationMdp) {
      setError('Le mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    // Sécurité stricte : l'inscription publique refuse tout rôle ADMIN
    if (role === 'ADMIN') {
      setError("La création d'un compte administrateur n'est pas autorisée via ce formulaire.");
      return;
    }

    setLoading(true);

    try {
      const newUser = await register({
        nom: nom.trim(),
        email: email.trim().toLowerCase(),
        telephone: telephone.trim(),
        motDePasse,
        role,
        nomEntreprise: role === 'COMMERCANT' ? nomEntreprise.trim() : undefined,
        typeCamion: role === 'CAMIONNEUR' ? typeCamion : undefined,
        capaciteKg: role === 'CAMIONNEUR' ? Number(capaciteKg) : undefined,
        immatriculation: role === 'CAMIONNEUR' ? immatriculation.trim() : undefined,
        zonesDesservies: role === 'CAMIONNEUR' ? ['Ziguinchor', 'Bignona', 'Kolda'] : undefined,
      });

      // Redirection vers l'accueil avec message de bienvenue
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l’inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Logo variant="dark" size="md" />
          <h2 style={{ marginTop: '1.25rem', fontSize: '1.6rem', color: 'var(--color-primary)' }}>
            Créer un compte E-Dépôt
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Rejoignez le réseau logistique et sécurisez vos transports en Casamance
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ padding: '0.85rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Sélection du profil / rôle */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="role-select">
              Type de profil à créer
            </label>
            <select
              id="role-select"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="COMMERCANT">Expéditeur / Commerçant (Je souhaite faire transporter des marchandises)</option>
              <option value="CAMIONNEUR">Transporteur / Camionneur (Je dispose d'un véhicule et propose du fret)</option>
              <option value="DESTINATAIRE">Destinataire (Je réceptionne des colis et valide les livraisons)</option>
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nom et prénom complet</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="ex: Aïssatou Diatta"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Numéro de téléphone (Mobile Money & SMS)</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="+221 77 XXX XX XX"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Adresse e-mail</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="votre.email@domaine.sn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Mot de passe (min. 6 caractères)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="form-input"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="••••••••"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
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
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                className="form-input"
                placeholder="••••••••"
                value={confirmationMdp}
                onChange={(e) => setConfirmationMdp(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Ville de résidence / base</label>
              <select className="form-select" value={ville} onChange={(e) => setVille(e.target.value)}>
                {LISTE_VILLES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Adresse précise</label>
              <input
                type="text"
                className="form-input"
                placeholder="ex: Marché Tilène, Entrepôt GIE"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
              />
            </div>
          </div>

          {/* Champs spécifiques Commerçant */}
          {role === 'COMMERCANT' && (
            <div style={{ padding: '1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nom de l’Entreprise ou GIE</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="ex: GIE Terroir Casamance"
                    value={nomEntreprise}
                    onChange={(e) => setNomEntreprise(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Secteur d'activité</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="ex: Fruits, Noix d'anacarde, Riz"
                    value={secteurActivite}
                    onChange={(e) => setSecteurActivite(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Champs spécifiques Camionneur */}
          {role === 'CAMIONNEUR' && (
            <div style={{ padding: '1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '1.25rem' }}>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Type de carrosserie</label>
                  <select className="form-select" value={typeCamion} onChange={(e) => setTypeCamion(e.target.value)}>
                    {TYPES_CAMION.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Capacité utile (kg)</label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={500}
                    className="form-input"
                    value={capaciteKg}
                    onChange={(e) => setCapaciteKg(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Immatriculation</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="ex: ZG-4592-A"
                    value={immatriculation}
                    onChange={(e) => setImmatriculation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={<UserPlus size={18} />}
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}
          >
            Créer mon compte
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Vous possédez déjà un compte ?{' '}
          <Link to="/connexion" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};
