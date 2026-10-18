import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { Evaluation, Expedition } from '../../types';
import { formatDate } from '../../lib/format';
import { RatingStars } from '../../components/ui/RatingStars';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Star, MessageSquare, PlusCircle } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export const EvaluationsPage: React.FC = () => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);

  // Modale Nouvel Avis
  const [showModal, setShowModal] = useState(false);
  const [selectedExpId, setSelectedExpId] = useState('');
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [eList, expList] = await Promise.all([
        api.getEvaluations(),
        api.getExpeditions(),
      ]);
      setEvaluations(eList);
      const livrees = expList.filter((exp) => exp.statut === 'LIVREE');
      setExpeditions(livrees);
      if (livrees.length > 0) setSelectedExpId(livrees[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmitAvis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const exp = expeditions.find((x) => x.id === selectedExpId);
    if (!exp) return;

    // La cible est l'autre partie
    const cibleId = user.role === 'COMMERCANT' ? exp.camionneurId : exp.commercantId;
    const cibleNom = user.role === 'COMMERCANT' ? exp.camionneurNom : exp.commercantNom;

    setSubmitting(true);
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
      setShowModal(false);
      setCommentaire('');
      setNote(5);
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const mesAvisRecus = evaluations.filter((ev) => ev.cibleId === user?.id);
  const moyenne = mesAvisRecus.length > 0
    ? (mesAvisRecus.reduce((sum, ev) => sum + ev.note, 0) / mesAvisRecus.length).toFixed(1)
    : '5.0';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Évaluations & Confiance bilatérale</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Les avis réciproques après chaque trajet renforcent la fiabilité et la réputation des acteurs en Casamance.
          </p>
        </div>

        {expeditions.length > 0 && (
          <Button variant="accent" icon={<PlusCircle size={18} />} onClick={() => setShowModal(true)}>
            Évaluer un transport achevé
          </Button>
        )}
      </div>

      {/* Résumé de notation */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
            {moyenne}
          </div>
          <div>
            <RatingStars rating={parseFloat(moyenne)} size={22} />
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Basé sur {mesAvisRecus.length} avis reçu(s)
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: '420px' }}>
          Les notes de ponctualité, d'état du matériel et de respect des accords influent sur la compatibilité de vos futures missions.
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement des avis...</p>
      ) : evaluations.length === 0 ? (
        <EmptyState
          title="Aucun avis enregistré"
          description="Les évaluations bilatérales apparaîtront dès la clôture des premières livraisons."
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

      {/* Modale Laisser un avis */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Évaluer une mission de transport">
        <form onSubmit={handleSubmitAvis}>
          <div className="form-group">
            <label className="form-label">Sélectionner la livraison achevée</label>
            <select className="form-select" value={selectedExpId} onChange={(e) => setSelectedExpId(e.target.value)}>
              {expeditions.map((e) => (
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
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Publier mon évaluation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
