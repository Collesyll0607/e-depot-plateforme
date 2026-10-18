import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { Expedition, Transaction } from '../../types';
import { formatFCFA, formatDate, formatDateTime } from '../../lib/format';
import { getStatutPaiementBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PaymentBreakdown } from '../../components/domain/PaymentBreakdown';
import { Modal } from '../../components/ui/Modal';
import { CreditCard, Smartphone, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export const PaiementsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const paramExpeditionId = searchParams.get('expeditionId');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expeditionsAPayer, setExpeditionsAPayer] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);

  // Modale Paiement Wave
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null);
  const [waveNumero, setWaveNumero] = useState('+221 77 123 45 67');
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [txList, expList] = await Promise.all([
        api.getTransactions(
          user?.role === 'COMMERCANT'
            ? { commercantId: user.id }
            : user?.role === 'CAMIONNEUR'
            ? { camionneurId: user.id }
            : undefined
        ),
        api.getExpeditions(user?.role === 'COMMERCANT' ? { commercantId: user.id } : undefined),
      ]);
      setTransactions(txList);

      const aPayer = expList.filter((e) => e.statut === 'A_PAYER');
      setExpeditionsAPayer(aPayer);

      if (paramExpeditionId) {
        const found = aPayer.find((e) => e.id === paramExpeditionId);
        if (found) setSelectedExpedition(found);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, paramExpeditionId]);

  const handlePayerSequestre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpedition) return;
    setPaying(true);
    try {
      await api.payerSequestre(selectedExpedition.id, waveNumero);
      setPaySuccess('Dépôt en séquestre Wave Sandbox confirmé ! Les fonds sont consignés.');
      setTimeout(() => {
        setSelectedExpedition(null);
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
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Paiements & Séquestre Wave Sandbox</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Gestion transparente des versements en séquestre, retenue de commission (5 %) et déblocages aux transporteurs.
        </p>
      </div>

      {/* Liste des expéditions en attente de séquestre pour le commerçant */}
      {expeditionsAPayer.length > 0 && user?.role === 'COMMERCANT' && (
        <div className="card" style={{ backgroundColor: '#FFFBF2', borderColor: 'rgba(181,116,20,0.3)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--color-warning)" />
            <strong style={{ color: 'var(--color-warning)', fontSize: '1rem' }}>
              {expeditionsAPayer.length} expédition(s) en attente de dépôt en séquestre
            </strong>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Le transporteur retenu ne peut débuter le chargement qu'après sécurisation des fonds sous séquestre Wave Sandbox.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {expeditionsAPayer.map((exp) => (
              <div
                key={exp.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--color-primary)' }}>{exp.reference}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                    {exp.origine} ➔ {exp.destination} ({exp.typeMarchandise})
                  </span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Chauffeur : {exp.camionneurNom}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{formatFCFA(exp.prixConvenu)}</strong>
                  <Button variant="accent" size="sm" onClick={() => setSelectedExpedition(exp)}>
                    Consigner en séquestre
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement des données financières...</p>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="Aucune transaction enregistrée"
          description="Les opérations financières apparaîtront dès qu'une expédition sera payée en séquestre."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {transactions.map((tx) => (
            <div key={tx.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{tx.reference}</h3>
                    <Badge
                      label={getStatutPaiementBadge(tx.statut).label}
                      className={getStatutPaiementBadge(tx.statut).className}
                    />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Expédition liée : <strong>{tx.expeditionReference}</strong> • Date : {formatDate(tx.dateCreation)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {formatFCFA(tx.montantTotal)}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Réf Wave : {tx.waveReference}
                  </span>
                </div>
              </div>

              <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Montant consigné</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                    {formatFCFA(tx.montantSequestre)}
                  </strong>
                </div>

                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Commission E-Dépôt (5 %)</div>
                  <strong style={{ fontSize: '1.1rem', color: '#1F6F8B' }}>
                    {formatFCFA(tx.montantCommission)}
                  </strong>
                </div>

                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Net garanti transporteur (95 %)</div>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--color-success)' }}>
                    {formatFCFA(tx.montantNetTransporteur)}
                  </strong>
                </div>
              </div>

              {/* Journal des opérations financières */}
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Historique des mouvements comptables
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {tx.operations.map((op) => (
                    <div
                      key={op.id}
                      style={{
                        padding: '0.6rem 0.85rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div>
                        <strong>{op.description}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                          {formatDateTime(op.date)}
                        </span>
                      </div>
                      <Badge label={op.statut} className="badge-success" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale Dépôt Séquestre Wave Sandbox */}
      <Modal
        isOpen={Boolean(selectedExpedition)}
        onClose={() => setSelectedExpedition(null)}
        title="Dépôt de séquestre sécurisé via Wave Sandbox"
      >
        {selectedExpedition && (
          <form onSubmit={handlePayerSequestre}>
            <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
              <ShieldCheck size={20} />
              <span style={{ fontSize: '0.85rem' }}>
                Environnement Wave Sandbox : les fonds sont simulés. Aucun prélèvement bancaire réel n'est effectué.
              </span>
            </div>

            {paySuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={18} />
                <span>{paySuccess}</span>
              </div>
            )}

            <PaymentBreakdown
              montantTotal={selectedExpedition.prixConvenu}
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
              <Button type="button" variant="outline" onClick={() => setSelectedExpedition(null)}>
                Annuler
              </Button>
              <Button type="submit" variant="accent" loading={paying} icon={<Smartphone size={16} />}>
                Confirmer le dépôt Wave ({formatFCFA(selectedExpedition.prixConvenu)})
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
