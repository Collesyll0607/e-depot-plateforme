import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { DemandeTransport, Expedition, OffreTransport } from '../../types';
import { formatFCFA, formatDate, formatWeight } from '../../lib/format';
import { getStatutDemandeBadge, getStatutExpeditionBadge, getStatutOffreBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { PlusCircle, Package, Truck, Inbox, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export const CommercantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState<DemandeTransport[]>([]);
  const [offres, setOffres] = useState<OffreTransport[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dList, oList, eList] = await Promise.all([
          api.getDemandes({ commercantId: user?.id }),
          api.getOffres(),
          api.getExpeditions({ commercantId: user?.id }),
        ]);
        setDemandes(dList);
        // Filtrer les offres liées à ses demandes
        const myDemandeIds = new Set(dList.map((d) => d.id));
        setOffres(oList.filter((o) => myDemandeIds.has(o.demandeId)));
        setExpeditions(eList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return <div style={{ color: 'var(--color-text-muted)' }}>Chargement de votre tableau de bord...</div>;
  }

  const demandesOuvertes = demandes.filter((d) => d.statut === 'OUVERTE');
  const offresEnAttente = offres.filter((o) => o.statut === 'EN_ATTENTE');
  const transportsEnRoute = expeditions.filter((e) => ['PAYEE_SEQUESTRE', 'CHARGEE', 'EN_ROUTE'].includes(e.statut));
  const montantSequestreTotal = expeditions
    .filter((e) => e.statut !== 'LIVREE' && e.statut !== 'ANNULEE')
    .reduce((sum, e) => sum + e.prixConvenu, 0);

  return (
    <div>
      {/* En-tête de bienvenue */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>
            Bonjour, {user?.nom}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            {user?.nomEntreprise || 'Espace Commerçant'} • Gérez vos flux de fret et expéditions en Casamance
          </p>
        </div>

        <Link to="/commercant/publier">
          <Button variant="accent" icon={<PlusCircle size={18} />}>
            Publier une demande de fret
          </Button>
        </Link>
      </div>

      {/* Cartes de statistiques clés */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Demandes ouvertes</span>
            <Package size={20} color="var(--color-primary-light)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>{demandesOuvertes.length}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>En attente d'offres</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Offres de transporteurs</span>
            <Inbox size={20} color="#E88945" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: '#E88945' }}>{offresEnAttente.length}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>À examiner & comparer</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Expéditions en cours</span>
            <Truck size={20} color="var(--color-info)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-info)' }}>{transportsEnRoute.length}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>En transit routier</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Séquestre Wave consigné</span>
            <ShieldCheck size={20} color="var(--color-success)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-success)' }}>{formatFCFA(montantSequestreTotal)}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Fonds protégés</span>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Dernières demandes publiées */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Mes dernières demandes</h3>
            <Link to="/commercant/demandes" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Voir tout ({demandes.length})
            </Link>
          </div>

          {demandes.length === 0 ? (
            <EmptyState
              title="Aucune demande de transport"
              description="Publiez votre première expédition pour recevoir des propositions de camionneurs."
              actionText="Créer une demande"
              onAction={() => (window.location.href = '/commercant/publier')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {demandes.slice(0, 3).map((d) => {
                const badge = getStatutDemandeBadge(d.statut);
                return (
                  <div
                    key={d.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#FAF9F5',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>{d.reference}</strong>
                      <Badge label={badge.label} className={badge.className} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
                      <MapPin size={14} color="#123B2A" />
                      {d.origine} ➔ {d.destination}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{d.typeMarchandise} • {formatWeight(d.poidsKg)}</span>
                      <strong>{formatFCFA(d.prixPropose)}</strong>
                    </div>
                    <div style={{ marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid #ECEAE2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{d.nombreOffres} offre(s) reçue(s)</span>
                      {d.nombreOffres > 0 ? (
                        <Link to={`/commercant/offres?demandeId=${d.id}`} style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          Examiner les offres <ArrowRight size={13} />
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>En attente</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Offres reçues récemment */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Offres de camionneurs reçues</h3>
            <Link to="/commercant/offres" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Comparer tout ({offres.length})
            </Link>
          </div>

          {offres.length === 0 ? (
            <EmptyState
              title="Aucune offre en attente"
              description="Les offres des transporteurs apparaîtront ici dès qu'ils postuleront à vos annonces."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {offres.slice(0, 3).map((o) => {
                const badge = getStatutOffreBadge(o.statut);
                return (
                  <div
                    key={o.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.95rem' }}>{o.camionneurNom}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                          ★ {o.camionneurNote}
                        </span>
                      </div>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>
                        {formatFCFA(o.prixPropose)}
                      </strong>
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      {o.conditions}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <Badge label={badge.label} className={badge.className} />
                      <Link to={`/commercant/offres?demandeId=${o.demandeId}`} style={{ fontWeight: 600 }}>
                        Gérer cette offre ➔
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
