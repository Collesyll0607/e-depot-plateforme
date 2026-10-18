import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { Expedition, OffreTransport, Transaction } from '../../types';
import { formatFCFA, formatDate, formatDateTime, formatWeight } from '../../lib/format';
import { getStatutExpeditionBadge, getStatutOffreBadge, getStatutPaiementBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RouteMap } from '../../components/map/RouteMap';
import {
  Truck,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Key,
  Inbox,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const MesTransports: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'missions' | 'offres' | 'revenus') || 'missions';
  const [activeTab, setActiveTab] = useState<'missions' | 'offres' | 'revenus'>(initialTab);

  const [transports, setTransports] = useState<Expedition[]>([]);
  const [offres, setOffres] = useState<OffreTransport[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // OTP Validation Modal
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null);
  const [codeOtp, setCodeOtp] = useState('');
  const [validatingOtp, setValidatingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [expData, offresData, txData] = await Promise.all([
        api.getExpeditions({ camionneurId: user?.id }),
        api.getOffres({ camionneurId: user?.id }),
        api.getTransactions({ camionneurId: user?.id }),
      ]);
      setTransports(expData);
      setOffres(offresData);
      setTransactions(txData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const switchTab = (tab: 'missions' | 'offres' | 'revenus') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleStatutUpdate = async (expId: string, nouveauStatut: any, note: string) => {
    await api.mettreAJourStatutExpedition(expId, nouveauStatut, note);
    await loadData();
  };

  const handleValiderOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpedition) return;
    setOtpError(null);
    setOtpSuccess(null);
    setValidatingOtp(true);

    try {
      const res = await api.validerOtpLivraison(selectedExpedition.id, codeOtp);
      if (res.success) {
        setOtpSuccess(res.message);
        setTimeout(() => {
          setSelectedExpedition(null);
          setCodeOtp('');
          setOtpSuccess(null);
          loadData();
        }, 1500);
      } else {
        setOtpError(res.message);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Erreur lors de la validation du code.');
    } finally {
      setValidatingOtp(false);
    }
  };

  // Calculs financiers pour le camionneur
  const totalRevenusEncaisses = transactions
    .filter((t) => t.statut === 'LIBERE')
    .reduce((acc, t) => acc + t.montantNetTransporteur, 0);

  const totalRevenusEnSequestre = transactions
    .filter((t) => t.statut === 'CONFIRME_SEQUESTRE')
    .reduce((acc, t) => acc + t.montantNetTransporteur, 0);

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Mes transports & Revenus</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Gérez l'avancement de vos missions, suivez vos offres soumises et consultez vos gains nets Wave (95 %).
        </p>
      </div>

      {/* Onglets principaux */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => switchTab('missions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'missions' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'missions' ? '#FFFFFF' : 'var(--color-text-main)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Truck size={17} />
          Missions en cours ({transports.length})
        </button>

        <button
          onClick={() => switchTab('offres')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'offres' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'offres' ? '#FFFFFF' : 'var(--color-text-main)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Inbox size={17} />
          Offres soumises ({offres.length})
        </button>

        <button
          onClick={() => switchTab('revenus')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'revenus' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'revenus' ? '#FFFFFF' : 'var(--color-text-main)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <DollarSign size={17} />
          Revenus & Séquestre Wave ({transactions.length})
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement des données...</p>
      ) : (
        <>
          {/* TAB 1 : MISSIONS EN COURS */}
          {activeTab === 'missions' && (
            <div>
              {transports.length === 0 ? (
                <EmptyState
                  title="Aucun transport actif"
                  description="Vous n'avez pas de mission de transport en cours pour le moment."
                  actionText="Consulter le fret disponible"
                  onAction={() => (window.location.href = '/camionneur/demandes-disponibles')}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {transports.map((t) => {
                    const badge = getStatutExpeditionBadge(t.statut);
                    return (
                      <div key={t.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary)' }}>{t.reference}</h3>
                              <Badge label={badge.label} className={badge.className} />
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                              Commerçant : <strong>{t.commercantNom}</strong> • Date création : {formatDate(t.dateCreation)}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                              {formatFCFA(Math.round(t.prixConvenu * 0.95))} nets
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Séquestre total {formatFCFA(t.prixConvenu)}
                            </span>
                          </div>
                        </div>

                        <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
                          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Axe routier</div>
                            <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <MapPin size={14} color="#123B2A" />
                              {t.origine} ➔ {t.destination}
                            </strong>
                          </div>

                          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Cargaison</div>
                            <strong style={{ fontSize: '0.95rem', display: 'block', marginTop: '2px' }}>
                              {t.typeMarchandise} ({formatWeight(t.poidsKg)})
                            </strong>
                          </div>

                          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Destinataire au point d'arrivée</div>
                            <strong style={{ fontSize: '0.95rem', display: 'block', marginTop: '2px' }}>
                              {t.destinataire.nom} ({t.destinataire.telephone})
                            </strong>
                          </div>
                        </div>

                        {/* Carte de suivi */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <RouteMap
                            departVille={t.origine}
                            arriveeVille={t.destination}
                            positionCamion={t.positionActuelle}
                            height="220px"
                          />
                        </div>

                        {/* Barre d'actions du chauffeur selon l'avancement */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid var(--color-border)',
                            paddingTop: '1rem',
                            flexWrap: 'wrap',
                            gap: '1rem',
                          }}
                        >
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            {t.statut === 'A_PAYER' && "En attente du versement par le commerçant en séquestre."}
                            {t.statut === 'PAYEE_SEQUESTRE' && "Séquestre confirmé ! Vous pouvez procéder au chargement."}
                            {t.statut === 'CHARGEE' && "Cargaison arrimée. Vous pouvez prendre la route."}
                            {t.statut === 'EN_ROUTE' && "En transit vers le destinataire."}
                            {t.statut === 'LIVREE_A_CONFIRMER' && "Arrivé à destination. Demandez le code OTP au destinataire."}
                            {t.statut === 'LIVREE' && "Mission terminée avec succès. Paiement Wave débloqué."}
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {t.statut === 'PAYEE_SEQUESTRE' && (
                              <Button
                                variant="primary"
                                size="sm"
                                icon={<CheckCircle size={15} />}
                                onClick={() => handleStatutUpdate(t.id, 'CHARGEE', 'Marchandise inspectée et chargée sur le plateau.')}
                              >
                                Confirmer chargement effectué
                              </Button>
                            )}

                            {t.statut === 'CHARGEE' && (
                              <Button
                                variant="primary"
                                size="sm"
                                icon={<Truck size={15} />}
                                onClick={() => handleStatutUpdate(t.id, 'EN_ROUTE', 'Départ du camion en route vers la destination.')}
                              >
                                Partir en route
                              </Button>
                            )}

                            {t.statut === 'EN_ROUTE' && (
                              <Button
                                variant="accent"
                                size="sm"
                                icon={<MapPin size={15} />}
                                onClick={() => handleStatutUpdate(t.id, 'LIVREE_A_CONFIRMER', 'Camion arrivé sur le site de livraison.')}
                              >
                                Arrivé à destination (Demander OTP)
                              </Button>
                            )}

                            {t.statut === 'LIVREE_A_CONFIRMER' && (
                              <Button
                                variant="accent"
                                size="sm"
                                icon={<Key size={15} />}
                                onClick={() => {
                                  setSelectedExpedition(t);
                                  setCodeOtp('');
                                  setOtpError(null);
                                }}
                              >
                                Saisir le code OTP destinataire
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2 : OFFRES SOUMISES & NÉGOCIATIONS */}
          {activeTab === 'offres' && (
            <div>
              {offres.length === 0 ? (
                <EmptyState
                  title="Aucune offre soumise"
                  description="Vous n'avez pas encore postulé à des demandes de fret disponibles."
                  actionText="Consulter le fret disponible"
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
                            <Button variant="accent" size="sm" icon={<CheckCircle2 size={16} />} onClick={() => switchTab('missions')}>
                              Voir la mission de transport
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

          {/* TAB 3 : REVENUS & SÉQUESTRE WAVE */}
          {activeTab === 'revenus' && (
            <div>
              <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Revenus nets encaissés</span>
                    <TrendingUp size={20} color="var(--color-success)" />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>{formatFCFA(totalRevenusEncaisses)}</h3>
                  <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Débloqués après validation OTP</span>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>En séquestre Wave garanti</span>
                    <ShieldCheck size={20} color="#1F6F8B" />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', color: '#1F6F8B' }}>{formatFCFA(totalRevenusEnSequestre)}</h3>
                  <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Fonds consignés pour vos trajets</span>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Part plateforme retenue</span>
                    <DollarSign size={20} color="#E88945" />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', color: '#E88945' }}>5 %</h3>
                  <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Assurance & sécurisation séquestre</span>
                </div>
              </div>

              {transactions.length === 0 ? (
                <EmptyState
                  title="Aucun revenu enregistré"
                  description="Vos virements Wave apparaîtront dès que vos premières missions seront consignées ou achevées."
                />
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Réf Transaction</th>
                        <th>Expédition</th>
                        <th>Commerçant</th>
                        <th>Montant brut</th>
                        <th>Commission (5%)</th>
                        <th>Net transporteur (95%)</th>
                        <th>Réf Wave</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const badge = getStatutPaiementBadge(tx.statut);
                        return (
                          <tr key={tx.id}>
                            <td>
                              <strong>{tx.reference}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatDate(tx.dateCreation)}</div>
                            </td>
                            <td>{tx.expeditionReference}</td>
                            <td>{tx.commercantNom}</td>
                            <td>{formatFCFA(tx.montantTotal)}</td>
                            <td style={{ color: '#E88945' }}>{formatFCFA(tx.montantCommission)}</td>
                            <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>{formatFCFA(tx.montantNetTransporteur)}</td>
                            <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{tx.waveReference}</span></td>
                            <td><Badge label={badge.label} className={badge.className} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modale Saisie OTP Livraison */}
      <Modal
        isOpen={Boolean(selectedExpedition)}
        onClose={() => setSelectedExpedition(null)}
        title="Validation de livraison par code OTP"
      >
        {selectedExpedition && (
          <form onSubmit={handleValiderOtp}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Demandez au destinataire (<strong>{selectedExpedition.destinataire.nom}</strong>) le code à 4 chiffres qu'il a reçu par SMS.
            </p>

            {selectedExpedition.codeOtp && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  color: '#166534',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📲 SMS Destinataire (Simulation de test) :</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', marginTop: '3px', color: '#15803D' }}>
                      « E-Dépôt : Votre code de livraison est le{' '}
                      <strong style={{ fontSize: '1.15rem', color: '#123B2A', letterSpacing: '2px' }}>
                        {selectedExpedition.codeOtp}
                      </strong>{' '}
                      »
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCodeOtp(selectedExpedition.codeOtp || '')}
                    className="btn btn-outline"
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      height: 'auto',
                      whiteSpace: 'nowrap',
                      borderColor: '#86EFAC',
                      color: '#166534',
                      backgroundColor: '#FFFFFF',
                      fontWeight: 600,
                    }}
                  >
                    Remplir ({selectedExpedition.codeOtp})
                  </button>
                </div>
              </div>
            )}

            {otpError && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertTriangle size={18} />
                <span>{otpError}</span>
              </div>
            )}

            {otpSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle size={18} />
                <span>{otpSuccess}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Code OTP de livraison (4 chiffres)</label>
              <input
                type="text"
                required
                maxLength={6}
                className="form-input"
                style={{ fontSize: '1.3rem', textAlign: 'center', letterSpacing: '6px', fontWeight: 700 }}
                placeholder="••••"
                value={codeOtp}
                onChange={(e) => setCodeOtp(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedExpedition(null)}>
                Annuler
              </Button>
              <Button type="submit" variant="primary" loading={validatingOtp}>
                Valider la livraison & Débloquer le virement
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
