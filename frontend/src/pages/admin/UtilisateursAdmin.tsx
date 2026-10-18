import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { User, Litige, ResolutionLitige } from '../../types';
import { formatDate } from '../../lib/format';
import { getStatutLitigeBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users, CheckCircle2, XCircle, Scale, ShieldAlert, AlertTriangle } from 'lucide-react';

export const UtilisateursAdmin: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'utilisateurs' | 'litiges') || 'utilisateurs';
  const [activeTab, setActiveTab] = useState<'utilisateurs' | 'litiges'>(initialTab);

  const [users, setUsers] = useState<User[]>([]);
  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    return <Navigate to="/connexion" replace />;
  }

  // Modale arbitrage
  const [selectedLitigeForArbitrage, setSelectedLitigeForArbitrage] = useState<Litige | null>(null);
  const [resolution, setResolution] = useState<ResolutionLitige>('LIBERATION_CAMIONNEUR');
  const [motifDecision, setMotifDecision] = useState('');
  const [arbitrating, setArbitrating] = useState(false);

  const loadData = async () => {
    try {
      const [userList, litigesList] = await Promise.all([
        api.getUsers(),
        api.getLitiges(),
      ]);
      setUsers(userList);
      setLitiges(litigesList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const switchTab = (tab: 'utilisateurs' | 'litiges') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleToggleVerifie = async (userId: string, current: boolean) => {
    await api.updateProfile(userId, { verifie: !current });
    loadData();
  };

  const handleArbitrer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLitigeForArbitrage) return;
    setArbitrating(true);
    try {
      await api.arbitrerLitige(selectedLitigeForArbitrage.id, {
        resolution,
        motif: motifDecision,
      });
      setSelectedLitigeForArbitrage(null);
      setMotifDecision('');
      await loadData();
    } finally {
      setArbitrating(false);
    }
  };

  const filtered = filterRole === 'ALL'
    ? users
    : users.filter((u) => u.role === filterRole);

  const litigesOuverts = litiges.filter((l) => l.statut === 'OUVERT');

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Utilisateurs & Gestion des Litiges</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Supervision des comptes professionnels, vérification d'identité et arbitrage des litiges de transport.
        </p>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => switchTab('utilisateurs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'utilisateurs' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'utilisateurs' ? '#FFFFFF' : 'var(--color-text-main)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Users size={17} />
          Comptes & Vérifications ({users.length})
        </button>

        <button
          onClick={() => switchTab('litiges')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'litiges' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'litiges' ? '#FFFFFF' : 'var(--color-text-main)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Scale size={17} />
          Litiges & Arbitrages ({litiges.length})
          {litigesOuverts.length > 0 && (
            <span
              style={{
                marginLeft: '4px',
                padding: '0.15rem 0.5rem',
                backgroundColor: 'var(--color-danger)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
              }}
            >
              {litigesOuverts.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement...</p>
      ) : (
        <>
          {/* TAB 1: UTILISATEURS */}
          {activeTab === 'utilisateurs' && (
            <div>
              {/* Filtres par rôle */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'ALL', label: `Tous (${users.length})` },
                  { key: 'COMMERCANT', label: 'Commerçants & GIE' },
                  { key: 'CAMIONNEUR', label: 'Transporteurs' },
                  { key: 'DESTINATAIRE', label: 'Destinataires' },
                  { key: 'ADMIN', label: 'Administrateurs' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterRole(f.key)}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: 'var(--radius-full)',
                      border: filterRole === f.key ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: filterRole === f.key ? 'var(--color-primary)' : '#FFFFFF',
                      color: filterRole === f.key ? '#FFFFFF' : 'var(--color-text-main)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Coordonnées</th>
                      <th>Activité / Véhicule</th>
                      <th>Inscription</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.nom}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{u.ville || 'Casamance'}</div>
                        </td>
                        <td>
                          <Badge label={u.role} className="badge-info" />
                        </td>
                        <td>
                          <div>{u.email}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{u.telephone}</div>
                        </td>
                        <td>
                          {u.nomEntreprise && <div>{u.nomEntreprise}</div>}
                          {u.typeCamion && (
                            <div style={{ fontSize: '0.85rem' }}>
                              {u.typeCamion} ({u.immatriculation})
                            </div>
                          )}
                          {!u.nomEntreprise && !u.typeCamion && <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            {formatDate(u.dateInscription)}
                          </span>
                        </td>
                        <td>
                          {u.verifie ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.8rem' }}>
                              <CheckCircle2 size={15} /> Validé
                            </span>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-warning)', fontWeight: 600, fontSize: '0.8rem' }}>
                              <XCircle size={15} /> En attente
                            </span>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleVerifie(u.id, u.verifie)}
                          >
                            {u.verifie ? 'Révoquer' : 'Valider'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: LITIGES & ARBITRAGE */}
          {activeTab === 'litiges' && (
            <div>
              {litiges.length === 0 ? (
                <EmptyState
                  title="Aucun litige ouvert"
                  description="Aucun dossier contentieux n'a été déposé par les utilisateurs."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {litiges.map((l) => {
                    const badge = getStatutLitigeBadge(l.statut);
                    return (
                      <div key={l.id} className="card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{l.reference}</h3>
                              <Badge label={badge.label} className={badge.className} />
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                              Déposé le {formatDate(l.dateCreation)} par <strong>{l.declarantNom}</strong> ({l.declarantRole})
                            </div>
                          </div>

                          <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Expédition liée :</span>
                            <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--color-primary)' }}>
                              {l.expeditionReference}
                            </strong>
                          </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-danger)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            Motif invoqué : {l.motif}
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                            « {l.description} »
                          </p>
                        </div>

                        {l.statut === 'RESOLU' && (
                          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--color-success-bg)', border: '1px solid rgba(30,126,69,0.25)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--color-success)', marginBottom: '0.25rem' }}>
                              <CheckCircle2 size={16} /> Arbitrage prononcé le {formatDate(l.dateResolution || '')}
                            </div>
                            <div style={{ fontSize: '0.875rem' }}>
                              Décision : <strong>{l.typeResolution}</strong>
                            </div>
                            {l.decisionAdmin && (
                              <p style={{ fontSize: '0.85rem', margin: '4px 0 0', color: 'var(--color-text-main)' }}>
                                Justification : {l.decisionAdmin}
                              </p>
                            )}
                          </div>
                        )}

                        {l.statut === 'OUVERT' && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                            <Button
                              variant="accent"
                              size="sm"
                              icon={<Scale size={16} />}
                              onClick={() => {
                                setSelectedLitigeForArbitrage(l);
                                setMotifDecision('Constat d’avarie partielle établi contradictoirement.');
                              }}
                            >
                              Prononcer une décision d'arbitrage
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modale Arbitrage Admin */}
      <Modal
        isOpen={Boolean(selectedLitigeForArbitrage)}
        onClose={() => setSelectedLitigeForArbitrage(null)}
        title="Arbitrage officiel du litige (Plateforme E-Dépôt)"
      >
        {selectedLitigeForArbitrage && (
          <form onSubmit={handleArbitrer}>
            <div className="alert alert-warning" style={{ marginBottom: '1.25rem' }}>
              <ShieldAlert size={20} />
              <span style={{ fontSize: '0.85rem' }}>
                Votre décision déterminera l'attribution définitive des fonds actuellement sous séquestre Wave.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Décision arbitrale</label>
              <select className="form-select" value={resolution} onChange={(e) => setResolution(e.target.value as any)}>
                <option value="LIBERATION_CAMIONNEUR">Libération intégrale au profit du transporteur</option>
                <option value="REMBOURSEMENT_TOTAL">Remboursement intégral du commerçant</option>
                <option value="REMBOURSEMENT_PARTIEL">Remboursement partiel négocié</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Motifs et considérations de la décision</label>
              <textarea
                rows={3}
                required
                className="form-textarea"
                value={motifDecision}
                onChange={(e) => setMotifDecision(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedLitigeForArbitrage(null)}>
                Annuler
              </Button>
              <Button type="submit" variant="primary" loading={arbitrating}>
                Enregistrer la décision arbitrale
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
