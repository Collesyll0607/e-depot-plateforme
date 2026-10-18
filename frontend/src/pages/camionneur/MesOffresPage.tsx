import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { OffreTransport } from '../../types';
import { formatFCFA, formatDate } from '../../lib/format';
import { getStatutOffreBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Inbox, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';
import { Link } from 'react-router-dom';

export const MesOffresPage: React.FC = () => {
  const { user } = useAuth();
  const [offres, setOffres] = useState<OffreTransport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getOffres({ camionneurId: user?.id });
        setOffres(list);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Mes offres de transport soumises</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Suivez les réponses des commerçants, les contre-propositions et les offres retenues pour expédition.
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement de vos offres...</p>
      ) : offres.length === 0 ? (
        <EmptyState
          title="Aucune offre soumise"
          description="Vous n'avez pas encore postulé à des demandes de transport."
          actionText="Consulter les demandes disponibles"
          onAction={() => (window.location.href = '/camionneur/demandes-disponibles')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {offres.map((o) => {
            const badge = getStatutOffreBadge(o.statut);
            const netTransporteur = Math.round(o.prixPropose * 0.95);

            return (
              <div key={o.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong style={{ fontSize: '1.15rem', color: 'var(--color-primary)' }}>
                        Demande {o.demandeReference}
                      </strong>
                      <Badge label={badge.label} className={badge.className} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Offre soumise le {formatDate(o.dateCreation)} • Disponibilité : {formatDate(o.dateDisponible)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {formatFCFA(o.prixPropose)}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600 }}>
                      Net garanti : {formatFCFA(netTransporteur)}
                    </span>
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
                    Vos conditions communiquées :
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', margin: 0 }}>
                    « {o.conditions} »
                  </p>
                </div>

                {/* Contre-proposition reçue */}
                {o.contreProposition && (
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-warning-bg)', border: '1px solid rgba(181,116,20,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--color-warning)' }}>
                        Contre-offre du commerçant : {formatFCFA(o.contreProposition.prix)}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(o.contreProposition.date)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>« {o.contreProposition.message} »</p>
                  </div>
                )}

                {o.statut === 'ACCEPTEE' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <Link to="/camionneur/mes-transports">
                      <Button variant="accent" size="sm" icon={<CheckCircle2 size={16} />}>
                        Accéder à la mission de transport
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
