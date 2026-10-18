import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { DemandeTransport, OffreTransport } from '../../types';
import { formatFCFA, formatDate } from '../../lib/format';
import { getStatutOffreBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CheckCircle2, XCircle, MessageSquare, Star, Truck, Shield } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export const OffresRecues: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const filterDemandeId = searchParams.get('demandeId');
  const navigate = useNavigate();

  const [offres, setOffres] = useState<OffreTransport[]>([]);
  const [demandesMap, setDemandesMap] = useState<Record<string, DemandeTransport>>({});
  const [loading, setLoading] = useState(true);

  // Modal Contre-proposition
  const [selectedOffreForCounter, setSelectedOffreForCounter] = useState<OffreTransport | null>(null);
  const [nouveauPrix, setNouveauPrix] = useState<number>(0);
  const [messageContre, setMessageContre] = useState('');
  const [submittingCounter, setSubmittingCounter] = useState(false);

  // Modal Acceptation
  const [selectedOffreForAccept, setSelectedOffreForAccept] = useState<OffreTransport | null>(null);
  const [accepting, setAccepting] = useState(false);

  const loadData = async () => {
    try {
      const [dList, oList] = await Promise.all([
        api.getDemandes({ commercantId: user?.id }),
        api.getOffres(),
      ]);

      const dMap: Record<string, DemandeTransport> = {};
      dList.forEach((d) => (dMap[d.id] = d));
      setDemandesMap(dMap);

      let filtered = oList.filter((o) => dMap[o.demandeId]);
      if (filterDemandeId) {
        filtered = filtered.filter((o) => o.demandeId === filterDemandeId);
      }
      setOffres(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, filterDemandeId]);

  const handleOpenCounter = (offre: OffreTransport) => {
    setSelectedOffreForCounter(offre);
    setNouveauPrix(offre.prixPropose);
    setMessageContre('Je vous propose ce tarif compte tenu du volume régulier.');
  };

  const handleSubmitCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffreForCounter) return;
    setSubmittingCounter(true);
    try {
      await api.faireContreProposition(selectedOffreForCounter.id, {
        prix: Number(nouveauPrix),
        message: messageContre,
        auteurRole: 'COMMERCANT',
      });
      setSelectedOffreForCounter(null);
      await loadData();
    } finally {
      setSubmittingCounter(false);
    }
  };

  const handleRefuse = async (offreId: string) => {
    if (window.confirm('Voulez-vous décliner cette proposition ?')) {
      await api.refuserOffre(offreId);
      await loadData();
    }
  };

  const handleAcceptConfirm = async () => {
    if (!selectedOffreForAccept) return;
    setAccepting(true);
    try {
      const res = await api.accepterOffre(selectedOffreForAccept.id);
      setSelectedOffreForAccept(null);
      // Redirection vers le paiement du séquestre de l'expédition créée
      navigate(`/commercant/paiements?expeditionId=${res.expedition.id}`);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>
          Offres des transporteurs
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Comparez les propositions de prix, négociez ou sélectionnez le transporteur retenu pour vos trajets.
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement des offres...</p>
      ) : offres.length === 0 ? (
        <EmptyState
          title="Aucune offre reçue"
          description="Vous n'avez pas encore d'offres soumises pour cette demande."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {offres.map((o) => {
            const demande = demandesMap[o.demandeId];
            const badge = getStatutOffreBadge(o.statut);
            return (
              <div key={o.id} className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{o.camionneurNom}</h3>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.85rem', color: '#B57414', fontWeight: 600 }}>
                        <Star size={15} fill="#E88945" color="#E88945" /> {o.camionneurNote} / 5
                      </span>
                      <Badge label={badge.label} className={badge.className} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Contact : {o.camionneurTelephone} • Reçue le {formatDate(o.dateCreation)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {formatFCFA(o.prixPropose)}
                    </div>
                    {demande && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Budget initial demandé : {formatFCFA(demande.prixPropose)}
                      </span>
                    )}
                  </div>
                </div>

                {demande && (
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    <strong>Demande associée :</strong> {demande.reference} ({demande.origine} ➔ {demande.destination}) • {demande.typeMarchandise}
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                    Conditions & Détails fournis par le chauffeur :
                  </div>
                  <p style={{ fontSize: '0.925rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                    {o.conditions}
                  </p>
                </div>

                {/* Bloc Contre-proposition si active */}
                {o.contreProposition && (
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-warning-bg)', border: '1px solid rgba(181,116,20,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.875rem', color: 'var(--color-warning)' }}>
                        Dernière contre-proposition : {formatFCFA(o.contreProposition.prix)}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Par {o.contreProposition.auteurRole === 'COMMERCANT' ? 'Vous' : 'Le transporteur'} • {formatDate(o.contreProposition.date)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>« {o.contreProposition.message} »</p>
                  </div>
                )}

                {/* Actions */}
                {o.statut === 'EN_ATTENTE' || o.statut === 'CONTRE_PROPOSITION' ? (
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <Button variant="outline" size="sm" onClick={() => handleRefuse(o.id)} icon={<XCircle size={15} />}>
                      Décliner
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenCounter(o)} icon={<MessageSquare size={15} />}>
                      Faire une contre-offre
                    </Button>
                    <Button variant="accent" size="sm" onClick={() => setSelectedOffreForAccept(o)} icon={<CheckCircle2 size={16} />}>
                      Retenir cette offre ({formatFCFA(o.prixPropose)})
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Modale Contre-proposition */}
      <Modal
        isOpen={Boolean(selectedOffreForCounter)}
        onClose={() => setSelectedOffreForCounter(null)}
        title="Faire une contre-proposition tarifaire"
      >
        {selectedOffreForCounter && (
          <form onSubmit={handleSubmitCounter}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Vous négociez avec <strong>{selectedOffreForCounter.camionneurNom}</strong> (Tarif actuel : {formatFCFA(selectedOffreForCounter.prixPropose)}).
            </p>

            <div className="form-group">
              <label className="form-label">Votre nouveau prix proposé (FCFA)</label>
              <input
                type="number"
                required
                min={5000}
                step={5000}
                className="form-input"
                value={nouveauPrix}
                onChange={(e) => setNouveauPrix(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message ou justification</label>
              <textarea
                rows={3}
                required
                className="form-textarea"
                value={messageContre}
                onChange={(e) => setMessageContre(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedOffreForCounter(null)}>
                Annuler
              </Button>
              <Button type="submit" variant="primary" loading={submittingCounter}>
                Envoyer la contre-proposition
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modale Confirmation Sélection & Direction Séquestre */}
      <Modal
        isOpen={Boolean(selectedOffreForAccept)}
        onClose={() => setSelectedOffreForAccept(null)}
        title="Confirmer le choix du transporteur"
      >
        {selectedOffreForAccept && (
          <div>
            <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
              <Shield size={20} />
              <span style={{ fontSize: '0.875rem' }}>
                En acceptant cette offre, une mission d'expédition officielle sera générée. Vous serez invité à consigner
                le montant en séquestre sécurisé via Wave Sandbox.
              </span>
            </div>

            <div style={{ backgroundColor: '#FAF9F5', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Transporteur :</span>
                <strong>{selectedOffreForAccept.camionneurNom}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Tarif convenu :</span>
                <strong style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                  {formatFCFA(selectedOffreForAccept.prixPropose)}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                <span>Commission E-Dépôt (5%) :</span>
                <span>{formatFCFA(Math.round(selectedOffreForAccept.prixPropose * 0.05))}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedOffreForAccept(null)}>
                Annuler
              </Button>
              <Button type="button" variant="accent" loading={accepting} onClick={handleAcceptConfirm}>
                Valider et passer au séquestre Wave
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
