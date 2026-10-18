import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { Expedition } from '../../types';
import { RouteMap } from '../../components/map/RouteMap';
import { Badge } from '../../components/ui/Badge';
import { getStatutExpeditionBadge } from '../../lib/status';
import { formatDate, formatDateTime, formatWeight, formatFCFA } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Search, Package, MapPin, Truck, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const SuiviPublic: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState('EXP-2025-001');
  const [expedition, setExpedition] = useState<Expedition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const all = await api.getExpeditions();
      const match = all.find(
        (exp) =>
          exp.reference.toLowerCase() === query.trim().toLowerCase() ||
          exp.destinataire.telephone.includes(query.trim())
      );

      if (match) {
        setExpedition(match);
      } else {
        setError("Aucune expédition trouvée pour cette référence ou ce numéro de téléphone.");
        setExpedition(null);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la recherche.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto 2.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>Suivi d'expédition en direct</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Entrez le numéro de votre expédition (ex: <code>EXP-2025-001</code>) ou le téléphone du destinataire.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
          <input
            type="text"
            className="form-input"
            style={{ fontSize: '1rem', padding: '0.75rem 1rem' }}
            placeholder="Référence d'expédition ou numéro..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" variant="primary" loading={loading} icon={<Search size={18} />}>
            Rechercher
          </Button>
        </form>

        {error && (
          <div className="alert alert-danger" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {expedition && (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Fret en Casamance
                </span>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', margin: '0.2rem 0' }}>
                  {expedition.reference}
                </h2>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Créée le {formatDate(expedition.dateCreation)} • Type : {expedition.typeMarchandise}
                </div>
              </div>

              <div>
                <Badge
                  label={getStatutExpeditionBadge(expedition.statut).label}
                  className={getStatutExpeditionBadge(expedition.statut).className}
                />
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="#123B2A" /> Départ
                </div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{expedition.origine}</strong>
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>Commerçant : {expedition.commercantNom}</div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="#E88945" /> Destination
                </div>
                <strong style={{ fontSize: '1.1rem', color: 'var(--color-accent)' }}>{expedition.destination}</strong>
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>Destinataire : {expedition.destinataire.nom}</div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={14} /> Chauffeur transporteur
                </div>
                <strong style={{ fontSize: '1.1rem' }}>{expedition.camionneurNom}</strong>
                <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>Tél : {expedition.camionneurTelephone}</div>
              </div>
            </div>

            {/* Carte du trajet Leaflet */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Visualisation de l'itinéraire</h3>
              <RouteMap
                departVille={expedition.origine}
                arriveeVille={expedition.destination}
                positionCamion={expedition.positionActuelle}
                height="320px"
              />
            </div>

            {/* Historique des étapes */}
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Journal de l'expédition</h3>
              <div className="timeline">
                {expedition.historique.map((ev, i) => (
                  <div key={i} className={`timeline-item ${i === expedition.historique.length - 1 ? 'active' : ''}`}>
                    <div className="timeline-dot" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <strong style={{ fontSize: '0.95rem' }}>{ev.description}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {formatDateTime(ev.date)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Responsable : {ev.auteur}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
