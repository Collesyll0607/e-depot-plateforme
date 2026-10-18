import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { Expedition } from '../../types';
import { formatFCFA, formatDate, formatWeight } from '../../lib/format';
import { getStatutExpeditionBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RouteMap } from '../../components/map/RouteMap';
import { Key, AlertTriangle, CheckCircle2, ShieldAlert, Phone, MapPin } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const DestinataireDashboard: React.FC = () => {
  const { user } = useAuth();
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);

  // Modale confirmation OTP
  const [selectedExp, setSelectedExp] = useState<Expedition | null>(null);
  const [codeOtp, setCodeOtp] = useState('');
  const [confirmWarningChecked, setConfirmWarningChecked] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modale Litige
  const [litigeExp, setLitigeExp] = useState<Expedition | null>(null);
  const [motifLitige, setMotifLitige] = useState('Marchandise endommagée au déchargement');
  const [descLitige, setDescLitige] = useState('');
  const [submittingLitige, setSubmittingLitige] = useState(false);

  const loadData = async () => {
    try {
      const data = await api.getExpeditions();
      // Filtrer les expéditions où ce destinataire est concerné (par nom ou téléphone)
      const myDeliveries = data.filter(
        (e) =>
          e.destinataire.nom.toLowerCase().includes(user?.nom.toLowerCase() || '') ||
          e.destinataire.telephone.includes(user?.telephone.slice(-6) || '')
      );
      setExpeditions(myDeliveries.length > 0 ? myDeliveries : data.slice(0, 2));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExp || !confirmWarningChecked) return;
    setErrorMsg(null);
    setValidating(true);

    try {
      const res = await api.validerOtpLivraison(selectedExp.id, codeOtp);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          setSelectedExp(null);
          setCodeOtp('');
          setConfirmWarningChecked(false);
          setSuccessMsg(null);
          loadData();
        }, 1500);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la validation.');
    } finally {
      setValidating(false);
    }
  };

  const handleCreerLitige = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!litigeExp || !user) return;
    setSubmittingLitige(true);
    try {
      await api.creerLitige({
        expeditionId: litigeExp.id,
        expeditionReference: litigeExp.reference,
        declarantId: user.id,
        declarantNom: user.nom,
        declarantRole: user.role,
        motif: motifLitige,
        description: descLitige,
      });
      setLitigeExp(null);
      setDescLitige('');
      await loadData();
    } finally {
      setSubmittingLitige(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Mes réceptions de marchandises</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Espace simplifié pour le contrôle, la remise de votre code de confirmation et la notification d'anomalies.
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement des livraisons...</p>
      ) : expeditions.length === 0 ? (
        <EmptyState
          title="Aucune livraison attendue"
          description="Vous serez notifié par SMS dès qu'une expédition de fret sera programmée à votre attention."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {expeditions.map((exp) => {
            const badge = getStatutExpeditionBadge(exp.statut);
            return (
              <div key={exp.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary)' }}>{exp.reference}</h3>
                      <Badge label={badge.label} className={badge.className} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Expéditeur : <strong>{exp.commercantNom}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FAF9F5', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)' }}>
                    <Phone size={15} color="#123B2A" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{exp.camionneurTelephone}</span>
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.85rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Cargaison attendue</div>
                    <strong style={{ fontSize: '1rem', display: 'block', marginTop: '2px' }}>
                      {exp.typeMarchandise} ({formatWeight(exp.poidsKg)})
                    </strong>
                  </div>

                  <div style={{ padding: '0.85rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Lieu de livraison</div>
                    <strong style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={15} color="#E88945" />
                      {exp.destinataire.adresse}, {exp.destinataire.ville}
                    </strong>
                  </div>
                </div>

                {/* Bannière SMS OTP simulée pour les tests & soutenance */}
                {exp.codeOtp && (
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#E8F4F8',
                      border: '1px solid rgba(31,111,139,0.3)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#1F6F8B', fontWeight: 700 }}>
                        SMS reçu sur votre mobile (Simulation)
                      </span>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                        « E-DEPOT : Votre code secret de livraison pour {exp.reference} est{' '}
                        <strong style={{ fontSize: '1.2rem', letterSpacing: '2px', color: 'var(--color-primary)' }}>
                          {exp.codeOtp}
                        </strong>
                        . Ne le communiquez qu'après inspection. »
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                  {exp.statut !== 'LIVREE' && exp.statut !== 'LITIGE' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ color: 'var(--color-danger)', borderColor: 'rgba(192,57,43,0.3)' }}
                        icon={<AlertTriangle size={15} />}
                        onClick={() => setLitigeExp(exp)}
                      >
                        Signaler une anomalie / litige
                      </Button>

                      <Button
                        variant="accent"
                        size="sm"
                        icon={<Key size={15} />}
                        onClick={() => {
                          setSelectedExp(exp);
                          setCodeOtp(exp.codeOtp || '');
                          setErrorMsg(null);
                        }}
                      >
                        Confirmer réception (Code OTP)
                      </Button>
                    </>
                  )}

                  {exp.statut === 'LIVREE' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} /> Réception validée et conforme
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale Confirmation OTP avec avertissement solennel */}
      <Modal
        isOpen={Boolean(selectedExp)}
        onClose={() => setSelectedExp(null)}
        title="Confirmation définitive de réception de marchandise"
      >
        {selectedExp && (
          <form onSubmit={handleConfirmOtp}>
            <div
              style={{
                backgroundColor: 'var(--color-warning-bg)',
                border: '1px solid rgba(181,116,20,0.35)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.75rem',
              }}
            >
              <ShieldAlert size={22} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: '#73460A', lineHeight: 1.5 }}>
                <strong>Avertissement important avant validation :</strong>
                <br />
                En confirmant la réception par ce code OTP, vous certifiez que l'intégralité de la marchandise (
                {selectedExp.typeMarchandise}, {formatWeight(selectedExp.poidsKg)}) a été déchargée en bon état.
                <br />
                <strong>Cette action est irréversible</strong> et déclenche la libération immédiate des fonds séquestrés
                au profit du transporteur.
              </div>
            </div>

            {errorMsg && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertTriangle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Saisir le code OTP (4 chiffres)</label>
              <input
                type="text"
                required
                maxLength={6}
                className="form-input"
                style={{ fontSize: '1.4rem', textAlign: 'center', letterSpacing: '8px', fontWeight: 700 }}
                value={codeOtp}
                onChange={(e) => setCodeOtp(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', margin: '1rem 0' }}>
              <input
                type="checkbox"
                id="warningCheck"
                required
                checked={confirmWarningChecked}
                onChange={(e) => setConfirmWarningChecked(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <label htmlFor="warningCheck" style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                J'atteste avoir inspecté personnellement le chargement et accepte le déblocage définitif du paiement.
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setSelectedExp(null)}>
                Annuler
              </Button>
              <Button type="submit" variant="primary" loading={validating} disabled={!confirmWarningChecked}>
                Confirmer la livraison
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modale Déclaration de litige */}
      <Modal
        isOpen={Boolean(litigeExp)}
        onClose={() => setLitigeExp(null)}
        title="Signaler une anomalie / Ouvrir un litige"
      >
        {litigeExp && (
          <form onSubmit={handleCreerLitige}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              L'ouverture d'un litige bloque immédiatement le séquestre financier jusqu'à arbitrage par l'équipe E-Dépôt.
            </p>

            <div className="form-group">
              <label className="form-label">Motif principal</label>
              <select className="form-select" value={motifLitige} onChange={(e) => setMotifLitige(e.target.value)}>
                <option value="Marchandise endommagée au déchargement">Marchandise endommagée au déchargement</option>
                <option value="Colis ou sacs manquants">Colis ou sacs manquants</option>
                <option value="Retard excessif ayant causé avarie">Retard excessif ayant causé avarie</option>
                <option value="Non-conformité de la marchandise">Non-conformité de la marchandise</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description précise des faits constatés</label>
              <textarea
                rows={3}
                required
                className="form-textarea"
                placeholder="Précisez le nombre de caisses touchées, l'état à l'arrivée..."
                value={descLitige}
                onChange={(e) => setDescLitige(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setLitigeExp(null)}>
                Annuler
              </Button>
              <Button type="submit" variant="danger" loading={submittingLitige}>
                Ouvrir le litige (Geler le séquestre)
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
