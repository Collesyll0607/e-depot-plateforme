import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { Expedition } from '../../types';
import { formatFCFA, formatDate, formatWeight } from '../../lib/format';
import { getStatutExpeditionBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PaymentBreakdown } from '../../components/domain/PaymentBreakdown';
import { Link } from 'react-router-dom';
import { MapPin, CreditCard, AlertTriangle, Eye, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export const ExpeditionsCommercant: React.FC = () => {
  const { user } = useAuth();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);

  // Modale paiement séquestre Wave intégré
  const [selectedExpForPayment, setSelectedExpForPayment] = useState<Expedition | null>(null);
  const [waveNumero, setWaveNumero] = useState(user?.telephone || '+221 77 123 45 67');
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await api.getExpeditions({ commercantId: user?.id });
      setExpeditions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handlePayerSequestre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpForPayment) return;
    setPaying(true);
    try {
      await api.payerSequestre(selectedExpForPayment.id, waveNumero);
      setPaySuccess('Séquestre Wave Sandbox consigné avec succès ! Le transporteur peut débuter le chargement.');
      setTimeout(() => {
        setSelectedExpForPayment(null);
        setPaySuccess(null);
        loadData();
      }, 1500);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Expéditions & Séquestre de fret</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Suivez l'avancement de vos cargaisons, gérez le séquestre Wave et visualisez les trajets en Casamance.
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement des expéditions...</p>
      ) : expeditions.length === 0 ? (
        <EmptyState
          title="Aucune expédition en cours"
          description="Dès qu'une offre de transporteur est retenue sur l'une de vos annonces, la mission apparaîtra ici avec son statut de séquestre."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {expeditions.map((exp) => {
            const badge = getStatutExpeditionBadge(exp.statut);
            return (
              <div key={exp.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary)' }}>{exp.reference}</h3>
                      <Badge label={badge.label} className={badge.className} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Créée le {formatDate(exp.dateCreation)} • Chauffeur : <strong>{exp.camionneurNom}</strong> ({exp.camionneurTelephone})
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {formatFCFA(exp.prixConvenu)}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Séquestre 5 % inclus
                    </span>
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Trajet Casamance</div>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={14} color="#123B2A" />
                      {exp.origine} ➔ {exp.destination}
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Cargaison</div>
                    <div style={{ fontWeight: 600, marginTop: '2px' }}>
                      {exp.typeMarchandise} ({formatWeight(exp.poidsKg)})
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Destinataire désigné</div>
                    <div style={{ fontWeight: 600, marginTop: '2px' }}>
                      {exp.destinataire.nom} ({exp.destinataire.telephone})
                    </div>
                  </div>
                </div>

                {/* Actions contextuelles claires */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                  {exp.statut === 'A_PAYER' && (
                    <Button
                      variant="accent"
                      size="sm"
                      icon={<CreditCard size={15} />}
                      onClick={() => {
                        setSelectedExpForPayment(exp);
                        setPaySuccess(null);
                      }}
                    >
                      Payer le séquestre Wave Sandbox
                    </Button>
                  )}

                  <Link to="/suivi">
                    <Button variant="outline" size="sm" icon={<Eye size={15} />}>
                      Suivi GPS & Journal
                    </Button>
                  </Link>

                  <Link to={`/commercant/litiges?expeditionId=${exp.id}`}>
                    <Button variant="outline" size="sm" style={{ color: 'var(--color-danger)', borderColor: 'rgba(192,57,43,0.3)' }} icon={<AlertTriangle size={15} />}>
                      Signaler une anomalie
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale Paiement Séquestre Wave direct */}
      <Modal
        isOpen={Boolean(selectedExpForPayment)}
        onClose={() => setSelectedExpForPayment(null)}
        title="Dépôt de séquestre sécurisé via Wave Sandbox"
      >
        {selectedExpForPayment && (
          <form onSubmit={handlePayerSequestre}>
            <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
              <ShieldCheck size={20} />
              <span style={{ fontSize: '0.85rem' }}>
                Environnement Wave Sandbox : les fonds sont simulés. Le montant restera bloqué sous séquestre jusqu'à la confirmation OTP par le destinataire à l'arrivée.
              </span>
            </div>

            {paySuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={18} />
                <span>{paySuccess}</span>
              </div>
            )}

            <PaymentBreakdown
              montantTotal={selectedExpForPayment.prixConvenu}
              statut="EN_ATTENTE"
              style={{ marginBottom: '1.25rem' }}
            />

            <div className="form-group">
              <label className="form-label">Numéro de téléphone Wave pour le paiement</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="+221 77 XXX XX XX"
                value={waveNumero}
                onChange={(e) => setWaveNumero(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedExpForPayment(null)}>
                Annuler
              </Button>
              <Button type="submit" variant="accent" loading={paying} icon={<CreditCard size={16} />}>
                Confirmer le dépôt ({formatFCFA(selectedExpForPayment.prixConvenu)})
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
