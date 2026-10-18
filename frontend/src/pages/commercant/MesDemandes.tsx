import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { DemandeTransport } from '../../types';
import { formatFCFA, formatDate, formatWeight } from '../../lib/format';
import { getStatutDemandeBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { PlusCircle, MapPin, Eye, XCircle } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export const MesDemandes: React.FC = () => {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState<DemandeTransport[]>([]);
  const [filterStatut, setFilterStatut] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const loadDemandes = async () => {
    try {
      const data = await api.getDemandes({ commercantId: user?.id });
      setDemandes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemandes();
  }, [user]);

  const handleAnnuler = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment annuler cette demande ?')) {
      await api.annulerDemande(id);
      loadDemandes();
    }
  };

  const filtered = filterStatut === 'ALL'
    ? demandes
    : demandes.filter((d) => d.statut === filterStatut);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Mes demandes de fret</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Suivi de vos annonces publiées et gestion des offres associées
          </p>
        </div>

        <Link to="/commercant/publier">
          <Button variant="accent" icon={<PlusCircle size={18} />}>
            Nouvelle demande
          </Button>
        </Link>
      </div>

      {/* Filtres de statut */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'Toutes' },
          { key: 'OUVERTE', label: 'Ouvertes aux offres' },
          { key: 'OFFRE_ACCEPTEE', label: 'Offre retenue' },
          { key: 'EN_COURS', label: 'En transit' },
          { key: 'TERMINEE', label: 'Livrées' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatut(f.key)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              border: filterStatut === f.key ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              backgroundColor: filterStatut === f.key ? 'var(--color-primary)' : '#FFFFFF',
              color: filterStatut === f.key ? '#FFFFFF' : 'var(--color-text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement de vos demandes...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucune demande trouvée"
          description="Vous n'avez aucune demande dans cette catégorie pour le moment."
          actionText="Publier une demande"
          onAction={() => (window.location.href = '/commercant/publier')}
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Trajet</th>
                <th>Marchandise & Poids</th>
                <th>Budget proposé</th>
                <th>Offres reçues</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const badge = getStatutDemandeBadge(d.statut);
                return (
                  <tr key={d.id}>
                    <td>
                      <strong>{d.reference}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(d.dateCreation)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <MapPin size={14} color="#123B2A" />
                        {d.origine} ➔ {d.destination}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Chargement le {formatDate(d.dateChargement)}
                      </div>
                    </td>
                    <td>
                      <div>{d.typeMarchandise}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {formatWeight(d.poidsKg)}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-primary)' }}>{formatFCFA(d.prixPropose)}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: d.nombreOffres > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        }}
                      >
                        {d.nombreOffres} offre(s)
                      </span>
                    </td>
                    <td>
                      <Badge label={badge.label} className={badge.className} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/commercant/offres?demandeId=${d.id}`}>
                          <Button variant="outline" size="sm" icon={<Eye size={14} />}>
                            Voir offres
                          </Button>
                        </Link>
                        {d.statut === 'OUVERTE' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnnuler(d.id)}
                            style={{ color: 'var(--color-danger)', borderColor: 'rgba(192,57,43,0.3)' }}
                            title="Annuler la demande"
                          >
                            <XCircle size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
