import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { Expedition, Litige, ResolutionLitige, Evaluation } from '../../types';
import { formatDate } from '../../lib/format';
import { getStatutLitigeBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RatingStars } from '../../components/ui/RatingStars';
import {
  AlertTriangle,
  Scale,
  CheckCircle2,
  ShieldAlert,
  Star,
  MessageSquare,
  PlusCircle,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const LitigesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'litiges' | 'avis') || 'litiges';
  const [activeTab, setActiveTab] = useState<'litiges' | 'avis'>(initialTab);

  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modale arbitrage admin
  const [selectedLitigeForArbitrage, setSelectedLitigeForArbitrage] = useState<Litige | null>(null);
  const [resolution, setResolution] = useState<ResolutionLitige>('LIBERATION_CAMIONNEUR');
  const [motifDecision, setMotifDecision] = useState('');
  const [arbitrating, setArbitrating] = useState(false);

  // Modale nouveau litige
  const [showNewModal, setShowNewModal] = useState(false);
  const [newExpId, setNewExpId] = useState('');
  const [newMotif, setNewMotif] = useState('Marchandise endommagée au déchargement');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modale Nouvel Avis
  const [showAvisModal, setShowAvisModal] = useState(false);
  const [selectedExpIdAvis, setSelectedExpIdAvis] = useState('');
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [submittingAvis, setSubmittingAvis] = useState(false);

  const loadData = async () => {
    try {
      const [lList, eList, evList] = await Promise.all([
        api.getLitiges(),
        api.getExpeditions(),
        api.getEvaluations(),
      ]);
      setLitiges(lList);
      setExpeditions(eList);
      setEvaluations(evList);

      if (eList.length > 0) setNewExpId(eList[0].id);
      const livrees = eList.filter((exp) => exp.statut === 'LIVREE');
      if (livrees.length > 0) setSelectedExpIdAvis(livrees[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const switchTab = (tab: 'litiges' | 'avis') => {
    setActiveTab(tab);
    setSearchParams({ tab });
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

  const handleCreateLitige = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const exp = expeditions.find((e) => e.id === newExpId);
    if (!exp) return;
    setSubmitting(true);
    try {
      await api.creerLitige({
        expeditionId: exp.id,
        expeditionReference: exp.reference,
        declarantId: user.id,
        declarantNom: user.nom,
        declarantRole: user.role,
        motif: newMotif,
        description: newDescription,
      });
      setShowNewModal(false);
      setNewDescription('');
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAvis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const exp = expeditions.find((x) => x.id === selectedExpIdAvis);
    if (!exp) return;

    const cibleId = user.role === 'COMMERCANT' ? exp.camionneurId : exp.commercantId;
    const cibleNom = user.role === 'COMMERCANT' ? exp.camionneurNom : exp.commercantNom;

    setSubmittingAvis(true);
    try {
      await api.creerEvaluation({
        expeditionId: exp.id,
        auteurId: user.id,
        auteurNom: user.nom,
        auteurRole: user.role,
        cibleId,
        cibleNom,
        note,
        commentaire,
      });
      setShowAvisModal(false);
      setCommentaire('');
      setNote(5);
      await loadData();
    } finally {
      setSubmittingAvis(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const livrees = expeditions.filter((exp) => exp.statut === 'LIVREE');
  const mesAvisRecus = evaluations.filter((ev) => ev.cibleId === user?.id);
  const moyenne = mesAvisRecus.length > 0
    ? (mesAvisRecus.reduce((sum, ev) => sum + ev.note, 0) / mesAvisRecus.length).toFixed(1)
    : '5.0';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Litiges, Réclamations & Avis</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Espace de confiance pour la médiation contradictoire, la protection du séquestre et l'évaluation bilatérale.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {activeTab === 'litiges' && !isAdmin && expeditions.length > 0 && (
            <Button variant="danger" icon={<AlertTriangle size={17} />} onClick={() => setShowNewModal(true)}>
              Déclarer un litige
            </Button>
          )}

          {activeTab === 'avis' && livrees.length > 0 && (
            <Button variant="accent" icon={<PlusCircle size={17} />} onClick={() => setShowAvisModal(true)}>
              Laisser un avis
            </Button>
          )}
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
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
          <AlertTriangle size={17} />
          Litiges & Réclamations ({litiges.length})
        </button>

        <button
          onClick={() => switchTab('avis')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'avis' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'avis' ? '#FFFFFF' : 'var(--color-text-main)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Star size={17} />
          Avis & Confiance mutuelle ({evaluations.length})
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement des données...</p>
      ) : (
        <>
          {/* TAB 1: LITIGES */}
          {activeTab === 'litiges' && (
            <div>
              {litiges.length === 0 ? (
                <EmptyState
                  title="Aucun litige ouvert"
                  description="Tous les transports s'exécutent en conformité avec les accords mutuels."
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
                              Déclaré le {formatDate(l.dateCreation)} par <strong>{l.declarantNom}</strong> ({l.declarantRole})
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
                            Motif : {l.motif}
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                            « {l.description} »
                          </p>
                        </div>

                        {l.statut === 'RESOLU' && (
                          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--color-success-bg)', border: '1px solid rgba(30,126,69,0.25)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--color-success)', marginBottom: '0.25rem' }}>
                              <CheckCircle2 size={16} /> Décision arbitrale de la plateforme ({formatDate(l.dateResolution || '')})
                            </div>
                            <div style={{ fontSize: '0.875rem' }}>
                              Résolution : <strong>{l.typeResolution}</strong>
                            </div>
                            {l.decisionAdmin && (
                              <p style={{ fontSize: '0.85rem', margin: '4px 0 0', color: 'var(--color-text-main)' }}>
                                Motif retenu : {l.decisionAdmin}
                              </p>
                            )}
                          </div>
                        )}

                        {isAdmin && l.statut === 'OUVERT' && (
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

          {/* TAB 2: AVIS */}
          {activeTab === 'avis' && (
            <div>
              <div className="card" style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                    {moyenne}
                  </div>
                  <div>
                    <RatingStars rating={parseFloat(moyenne)} size={22} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Basé sur {mesAvisRecus.length} avis reçu(s) sur votre profil
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '420px' }}>
                  Les retours d'expérience sur la ponctualité, le respect des chargements et l'intégrité de la cargaison favorisent les accords futurs.
                </div>
              </div>

              {evaluations.length === 0 ? (
                <EmptyState
                  title="Aucun avis enregistré"
                  description="Les évaluations apparaîtront dès que vos premières expéditions seront livrées."
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {evaluations.map((ev) => (
                    <div key={ev.id} className="card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <strong style={{ fontSize: '1rem', color: 'var(--color-primary)' }}>{ev.auteurNom}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>
                            ({ev.auteurRole}) pour <strong>{ev.cibleNom}</strong>
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            Le {formatDate(ev.date)}
                          </div>
                        </div>

                        <RatingStars rating={ev.note} size={16} />
                      </div>

                      <p style={{ fontSize: '0.925rem', color: 'var(--color-text-main)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                        « {ev.commentaire} »
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modale Déclaration Litige */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Ouvrir une réclamation de transport">
        <form onSubmit={handleCreateLitige}>
          <div className="form-group">
            <label className="form-label">Sélectionner l'expédition concernée</label>
            <select className="form-select" value={newExpId} onChange={(e) => setNewExpId(e.target.value)}>
              {expeditions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.reference} — {e.typeMarchandise} ({e.origine} ➔ {e.destination})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Motif du litige</label>
            <select className="form-select" value={newMotif} onChange={(e) => setNewMotif(e.target.value)}>
              <option value="Marchandise endommagée au déchargement">Marchandise endommagée au déchargement</option>
              <option value="Colis ou sacs manquants">Colis ou sacs manquants</option>
              <option value="Retard excessif ayant causé avarie">Retard excessif ayant causé avarie</option>
              <option value="Chauffeur injoignable ou panne non signalée">Chauffeur injoignable ou panne non signalée</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description détaillée des constats</label>
            <textarea
              rows={3}
              required
              className="form-textarea"
              placeholder="Précisez la quantité endommagée, les témoins au déchargement..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setShowNewModal(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="danger" loading={submitting}>
              Déposer le litige
            </Button>
          </div>
        </form>
      </Modal>

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

      {/* Modale Laisser un avis */}
      <Modal isOpen={showAvisModal} onClose={() => setShowAvisModal(false)} title="Évaluer une mission de transport">
        <form onSubmit={handleSubmitAvis}>
          <div className="form-group">
            <label className="form-label">Sélectionner la livraison achevée</label>
            <select className="form-select" value={selectedExpIdAvis} onChange={(e) => setSelectedExpIdAvis(e.target.value)}>
              {livrees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.reference} — {e.typeMarchandise} ({e.origine} ➔ {e.destination})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: '1.25rem 0' }}>
            <label className="form-label">Votre note de satisfaction globale</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem' }}>
              <RatingStars rating={note} size={28} interactive onChange={(val) => setNote(val)} />
              <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{note} / 5</strong>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Votre retour d'expérience & commentaire</label>
            <textarea
              rows={3}
              required
              className="form-textarea"
              placeholder="Ponctualité, état du chargement, communication..."
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button type="button" variant="outline" onClick={() => setShowAvisModal(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={submittingAvis}>
              Publier mon évaluation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
