import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { LISTE_VILLES, estimerDistanceRoutiereKm, estimerDureeHeures } from '../../lib/geo';
import { formatFCFA, formatDistance, formatDuration } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { PlusCircle, MapPin, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PublierDemande: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [origine, setOrigine] = useState('Kafountine');
  const [destination, setDestination] = useState('Ziguinchor');
  const [dateChargement, setDateChargement] = useState(new Date().toISOString().split('T')[0]);
  const [dateLivraisonSouhaitee, setDateLivraisonSouhaitee] = useState('');
  const [typeMarchandise, setTypeMarchandise] = useState('Mangues greffées et papayes en caisses');
  const [poidsKg, setPoidsKg] = useState(3000);
  const [volumeM3, setVolumeM3] = useState(6);
  const [instructions, setInstructions] = useState('Bâchage impératif contre le soleil et la poussière.');
  const [prixPropose, setPrixPropose] = useState(115000);

  // Destinataire
  const [destNom, setDestNom] = useState('Ousmane Sané');
  const [destTel, setDestTel] = useState('+221 77 567 89 01');
  const [destAdresse, setDestAdresse] = useState('Marché Tilène, Hall fruits N° 12');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const distanceEstimee = estimerDistanceRoutiereKm(origine, destination);
  const dureeEstimee = estimerDureeHeures(distanceEstimee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setLoading(true);

    try {
      await api.createDemande({
        commercantId: user.id,
        commercantNom: `${user.nom} (${user.nomEntreprise || 'Commerçant'})`,
        commercantTelephone: user.telephone,
        origine,
        destination,
        dateChargement,
        dateLivraisonSouhaitee: dateLivraisonSouhaitee || undefined,
        typeMarchandise,
        poidsKg: Number(poidsKg),
        volumeM3: volumeM3 ? Number(volumeM3) : undefined,
        instructionsManutention: instructions,
        prixPropose: Number(prixPropose),
        destinataire: {
          nom: destNom,
          telephone: destTel,
          adresse: destAdresse,
          ville: destination,
        },
      });

      navigate('/commercant/demandes');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Publier une demande de fret</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Renseignez votre cargaison et votre destination pour recevoir des offres de transporteurs qualifiés.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="var(--color-primary-light)" />
            Trajet et planification
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Ville de départ (Chargement)</label>
              <select className="form-select" value={origine} onChange={(e) => setOrigine(e.target.value)}>
                {LISTE_VILLES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ville d'arrivée (Déchargement)</label>
              <select className="form-select" value={destination} onChange={(e) => setDestination(e.target.value)}>
                {LISTE_VILLES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimation automatique de distance */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#FAF9F5',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              gap: '2rem',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Distance estimée : </span>
              <strong>{formatDistance(distanceEstimee)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Temps de route moyen : </span>
              <strong>{formatDuration(dureeEstimee)}</strong>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date de chargement prévue</label>
              <input
                type="date"
                required
                className="form-input"
                value={dateChargement}
                onChange={(e) => setDateChargement(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date souhaitée de livraison</label>
              <input
                type="date"
                className="form-input"
                value={dateLivraisonSouhaitee}
                onChange={(e) => setDateLivraisonSouhaitee(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={20} color="var(--color-primary-light)" />
            Caractéristiques du fret & Tarif proposé
          </h3>

          <div className="form-group">
            <label className="form-label">Nature et désignation de la marchandise</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="ex: Mangues Kent en cagettes, sacs de riz, tubercules..."
              value={typeMarchandise}
              onChange={(e) => setTypeMarchandise(e.target.value)}
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Poids total estimé (kg)</label>
              <input
                type="number"
                required
                min={100}
                step={100}
                className="form-input"
                value={poidsKg}
                onChange={(e) => setPoidsKg(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Volume estimé (m³ - optionnel)</label>
              <input
                type="number"
                min={1}
                className="form-input"
                value={volumeM3}
                onChange={(e) => setVolumeM3(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Prix proposé (FCFA)</label>
              <input
                type="number"
                required
                min={5000}
                step={5000}
                className="form-input"
                value={prixPropose}
                onChange={(e) => setPrixPropose(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Consignes de manutention & arrimage</label>
            <textarea
              rows={2}
              className="form-textarea"
              placeholder="Conditions météo, précautions chocs, chargement à quai..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>
            Coordonnées du destinataire (Validation OTP à l'arrivée)
          </h3>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Nom complet du destinataire</label>
              <input
                type="text"
                required
                className="form-input"
                value={destNom}
                onChange={(e) => setDestNom(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Téléphone (Réception du code OTP)</label>
              <input
                type="tel"
                required
                className="form-input"
                value={destTel}
                onChange={(e) => setDestTel(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Adresse de livraison</label>
              <input
                type="text"
                required
                className="form-input"
                value={destAdresse}
                onChange={(e) => setDestAdresse(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button type="button" variant="outline" onClick={() => navigate('/commercant')}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" size="lg" loading={loading} icon={<CheckCircle2 size={18} />}>
            Publier mon annonce ({formatFCFA(prixPropose)})
          </Button>
        </div>
      </form>
    </div>
  );
};
