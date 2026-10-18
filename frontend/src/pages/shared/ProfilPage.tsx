import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatWeight } from '../../lib/format';
import {
  User,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Truck,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  Radio,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TYPES_CAMION = [
  'Plateau ridelles',
  'Benne basculante',
  'Fourgon frigorifique',
  'Semi-remorque bâché',
  'Citerne',
  'Camionnette / Pick-up bâché',
  'Camion fourgon fermé',
];

const AXES_CASAMANCE_SUGGESTIONS = [
  'Ziguinchor',
  'Bignona',
  'Kolda',
  'Sédhiou',
  'Oussouye',
  'Cap Skirring',
  'Vélingara',
  'Goudomp',
  'Dakar',
];

export const ProfilPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Coordonnées de base
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('Ziguinchor');

  // Spécifique Commerçant
  const [nomEntreprise, setNomEntreprise] = useState('');
  const [secteurActivite, setSecteurActivite] = useState('');

  // Spécifique Camionneur (Véhicule & Opérations)
  const [typeCamion, setTypeCamion] = useState('Plateau ridelles');
  const [capaciteKg, setCapaciteKg] = useState<number>(10000);
  const [immatriculation, setImmatriculation] = useState('');
  const [zonesDesservies, setZonesDesservies] = useState<string[]>([]);
  const [nouvelleZone, setNouvelleZone] = useState('');
  const [disponible, setDisponible] = useState<boolean>(true);
  const [permisValide, setPermisValide] = useState<boolean>(true);
  const [carteGriseValide, setCarteGriseValide] = useState<boolean>(true);
  const [assuranceValide, setAssuranceValide] = useState<boolean>(true);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Synchroniser avec l'utilisateur connecté
  useEffect(() => {
    if (user) {
      setNom(user.nom || '');
      setTelephone(user.telephone || '');
      setAdresse(user.adresse || '');
      setVille(user.ville || 'Ziguinchor');

      setNomEntreprise(user.nomEntreprise || '');
      setSecteurActivite(user.secteurActivite || 'Commerce général & vivres');

      setTypeCamion(user.typeCamion || 'Plateau ridelles');
      setCapaciteKg(user.capaciteKg || 10000);
      setImmatriculation(user.immatriculation || '');
      setZonesDesservies(user.zonesDesservies || ['Ziguinchor', 'Bignona', 'Kolda']);
      setDisponible(user.disponible ?? true);

      if (user.documents) {
        setPermisValide(user.documents.permisValide ?? true);
        setCarteGriseValide(user.documents.carteGriseValide ?? true);
        setAssuranceValide(user.documents.assuranceValide ?? true);
      }
    }
  }, [user]);

  if (!user) return null;

  const handleToggleZone = (zone: string) => {
    if (zonesDesservies.includes(zone)) {
      setZonesDesservies(zonesDesservies.filter((z) => z !== zone));
    } else {
      setZonesDesservies([...zonesDesservies, zone]);
    }
  };

  const handleAddCustomZone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nouvelleZone.trim();
    if (clean && !zonesDesservies.includes(clean)) {
      setZonesDesservies([...zonesDesservies, clean]);
      setNouvelleZone('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        nom,
        telephone,
        adresse,
        ville,
        // Commerçant
        nomEntreprise: user.role === 'COMMERCANT' ? nomEntreprise : undefined,
        secteurActivite: user.role === 'COMMERCANT' ? secteurActivite : undefined,
        // Camionneur
        typeCamion: user.role === 'CAMIONNEUR' ? typeCamion : undefined,
        capaciteKg: user.role === 'CAMIONNEUR' ? Number(capaciteKg) : undefined,
        immatriculation: user.role === 'CAMIONNEUR' ? immatriculation : undefined,
        zonesDesservies: user.role === 'CAMIONNEUR' ? zonesDesservies : undefined,
        disponible: user.role === 'CAMIONNEUR' ? disponible : undefined,
        documents: user.role === 'CAMIONNEUR' ? {
          permisValide,
          carteGriseValide,
          assuranceValide,
        } : undefined,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const isCamionneur = user.role === 'CAMIONNEUR';
  const isCommercant = user.role === 'COMMERCANT';

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>
          {isCamionneur ? 'Mon Profil & Caractéristiques du Camion' : 'Mon Profil'}
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          {isCamionneur
            ? 'Mettez à jour les spécifications techniques de votre véhicule, votre capacité de charge et vos axes de fret.'
            : 'Gérez vos coordonnées, les informations de votre entreprise et la sécurité de votre compte.'}
        </p>
      </div>

      {savedSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          <span>Vos informations et caractéristiques ont été enregistrées avec succès !</span>
        </div>
      )}

      {/* Carte d'en-tête utilisateur */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 700,
              }}
            >
              {user.nom.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--color-primary)' }}>{user.nom}</h2>
                <Badge label={user.role} className="badge-info" />
                {user.verifie && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600 }}>
                    <ShieldCheck size={16} /> Compte vérifié
                  </span>
                )}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                {user.email} • Membre depuis {formatDate(user.dateInscription)}
              </div>
            </div>
          </div>

          {/* Statut disponibilité camionneur en en-tête */}
          {isCamionneur && (
            <div
              style={{
                padding: '0.6rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: disponible ? 'var(--color-success-bg)' : '#F2F0E8',
                border: disponible ? '1px solid rgba(30,126,69,0.3)' : '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: disponible ? 'var(--color-success)' : '#727A72',
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: disponible ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                {disponible ? 'Disponible pour fret' : 'Indisponible / En mission'}
              </span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* SECTION 1 : COORDONNÉES GÉNÉRALES */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} />
            Coordonnées personnelles & Contact
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nom complet</label>
              <input
                type="text"
                required
                className="form-input"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Téléphone (SMS & Wave)</label>
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

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Ville de résidence / Port d'attache</label>
              <input
                type="text"
                required
                className="form-input"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Adresse / Localisation précise</label>
              <input
                type="text"
                className="form-input"
                placeholder="ex: Marché Tilène, Entrepôt GIE, Garage Bignona"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2 : CARACTÉRISTIQUES DU CAMION (CAMIONNEUR) */}
        {isCamionneur && (
          <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="var(--color-primary-light)" />
                Caractéristiques & Fiche Technique du Camion
              </h3>

              {/* Bouton bascule disponibilité */}
              <button
                type="button"
                onClick={() => setDisponible(!disponible)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: disponible ? 'var(--color-success-bg)' : '#FFFFFF',
                  color: disponible ? 'var(--color-success)' : 'var(--color-text-main)',
                }}
              >
                {disponible ? <ToggleRight size={20} color="var(--color-success)" /> : <ToggleLeft size={20} color="#727A72" />}
                {disponible ? 'Actif pour de nouvelles missions' : 'Passer en pause'}
              </button>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Type de carrosserie / Utilitaire</label>
                <select
                  className="form-select"
                  value={typeCamion}
                  onChange={(e) => setTypeCamion(e.target.value)}
                >
                  {TYPES_CAMION.map((tc) => (
                    <option key={tc} value={tc}>
                      {tc}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                  Permet aux commerçants de vérifier l'adéquation avec leur type de cargaison.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Numéro d'immatriculation</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="ex: ZG-1234-A ou KL-5678-C"
                  value={immatriculation}
                  onChange={(e) => setImmatriculation(e.target.value)}
                />
                <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                  Figure sur le bon de chargement et le contrat de transport.
                </span>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  Capacité de charge utile maximale (en kg) : <strong>{formatWeight(capaciteKg)}</strong>
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  max={60000}
                  step={500}
                  className="form-input"
                  value={capaciteKg}
                  onChange={(e) => setCapaciteKg(Number(e.target.value))}
                />
                <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                  Exemples : 3 500 kg (3,5 t) • 10 000 kg (10 t) • 35 000 kg (35 t).
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Statut de disponibilité immédiate</label>
                <select
                  className="form-select"
                  value={disponible ? 'DISPONIBLE' : 'INDISPONIBLE'}
                  onChange={(e) => setDisponible(e.target.value === 'DISPONIBLE')}
                >
                  <option value="DISPONIBLE">Prêt à charger (Disponible)</option>
                  <option value="INDISPONIBLE">En transit / Indisponible momentanément</option>
                </select>
                <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                  Définit votre visibilité dans la recherche de camionneurs disponibles.
                </span>
              </div>
            </div>

            {/* Axes & Zones de rotation en Casamance */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Axes routiers & Villes régulièrement desservies en Casamance
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {AXES_CASAMANCE_SUGGESTIONS.map((villeSugg) => {
                  const isSelected = zonesDesservies.includes(villeSugg);
                  return (
                    <button
                      key={villeSugg}
                      type="button"
                      onClick={() => handleToggleZone(villeSugg)}
                      style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: 'var(--radius-full)',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-primary)' : '#FAF9F5',
                        color: isSelected ? '#FFFFFF' : 'var(--color-text-main)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {villeSugg}
                    </button>
                  );
                })}
              </div>

              {/* Ajouter une zone sur-mesure */}
              <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '380px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                  placeholder="Autre localité (ex: Kafountine)..."
                  value={nouvelleZone}
                  onChange={(e) => setNouvelleZone(e.target.value)}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomZone}>
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Conformité des pièces de bord */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck size={16} color="var(--color-primary-light)" />
                Déclaration de conformité des documents de transport
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={permisValide}
                    onChange={(e) => setPermisValide(e.target.checked)}
                  />
                  <span>Permis de conduire poids lourd (Catégorie C / CE) en cours de validité</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={carteGriseValide}
                    onChange={(e) => setCarteGriseValide(e.target.checked)}
                  />
                  <span>Carte grise et contrôle technique du véhicule à jour</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={assuranceValide}
                    onChange={(e) => setAssuranceValide(e.target.checked)}
                  />
                  <span>Assurance responsabilité civile & marchandises transportées</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2 : SPÉCIFIQUE COMMERÇANT */}
        {isCommercant && (
          <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="var(--color-primary-light)" />
              Activité Professionnelle & Entreprise
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nom de l'Entreprise ou Coopérative</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="ex: GIE Maraîcher des Rivières, Coopérative Anacarde"
                  value={nomEntreprise}
                  onChange={(e) => setNomEntreprise(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Secteur d'activité</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ex: Fruits & Légumes, Céréales, Poissons, Quincaillerie"
                  value={secteurActivite}
                  onChange={(e) => setSecteurActivite(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bouton d'enregistrement général */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', marginBottom: '2.5rem' }}>
          <Button type="submit" variant="primary" loading={saving}>
            Enregistrer toutes les modifications
          </Button>
        </div>
      </form>
    </div>
  );
};
