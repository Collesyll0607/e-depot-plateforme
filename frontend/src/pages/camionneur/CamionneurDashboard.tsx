import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { DemandeTransport, Expedition, OffreTransport } from '../../types';
import { formatFCFA, formatDate, formatWeight } from '../../lib/format';
import { getStatutDemandeBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Truck, Package, DollarSign, Star, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const CamionneurDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [demandes, setDemandes] = useState<DemandeTransport[]>([]);
  const [mesTransports, setMesTransports] = useState<Expedition[]>([]);
  const [mesOffres, setMesOffres] = useState<OffreTransport[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Soumettre Offre
  const [selectedDemande, setSelectedDemande] = useState<DemandeTransport | null>(null);
  const [prixOffre, setPrixOffre] = useState<number>(0);
  const [conditions, setConditions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [dList, eList, oList] = await Promise.all([
        api.getDemandes({ statut: 'OUVERTE' }),
        api.getExpeditions({ camionneurId: user?.id }),
        api.getOffres({ camionneurId: user?.id }),
      ]);
      setDemandes(dList);
      setMesTransports(eList);
      setMesOffres(oList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleToggleDispo = async () => {
    if (!user) return;
    await updateProfile({ disponible: !user.disponible });
  };

  const handleOpenOffre = (demande: DemandeTransport) => {
    setSelectedDemande(demande);
    setPrixOffre(demande.prixPropose);
    setConditions(`Prise en charge avec camion ${user?.typeCamion || 'fret'}, sangles d'arrimage et bâche sécurisée.`);
    setSuccessMsg(null);
  };

  const handleSubmitOffre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemande || !user) return;
    setSubmitting(true);
    try {
      await api.createOffre({
        demandeId: selectedDemande.id,
        camionneurId: user.id,
        camionneurNom: user.nom,
        camionneurTelephone: user.telephone,
        camionneurNote: user.noteMoyenne || 5.0,
        prixPropose: Number(prixOffre),
        dateDisponible: selectedDemande.dateChargement,
        conditions,
      });
      setSuccessMsg('Votre offre a été soumise au commerçant avec succès !');
      setTimeout(() => {
        setSelectedDemande(null);
        setSuccessMsg(null);
        loadData();
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--color-text-muted)' }}>Chargement de votre espace transporteur...</div>;
  }

  // Filtrer les demandes compatibles avec le tonnage du camionneur
  const demandesCompatibles = demandes.filter((d) => {
    const maxPoids = user?.capaciteKg || 10000;
    return d.poidsKg <= maxPoids;
  });

  const transportsActifs = mesTransports.filter((t) => ['PAYEE_SEQUESTRE', 'CHARGEE', 'EN_ROUTE'].includes(t.statut));
  const revenusEnAttente = transportsActifs.reduce((sum, t) => sum + Math.round(t.prixConvenu * 0.95), 0);

  return (
    <div>
      {/* En-tête Chauffeur */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>
            Bonjour, {user?.nom}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            {user?.typeCamion} • Capacité : {formatWeight(user?.capaciteKg || 10000)} • Immatriculation : {user?.immatriculation}
          </p>
        </div>

        <button
          onClick={handleToggleDispo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            backgroundColor: user?.disponible ? 'var(--color-success-bg)' : '#F2F0E8',
            color: user?.disponible ? 'var(--color-success)' : 'var(--color-text-muted)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: user?.disponible ? 'var(--color-success)' : '#727A72' }} />
          <span>{user?.disponible ? 'Disponible pour fret' : 'Non disponible actuellement'}</span>
        </button>
      </div>

      {/* Cartes d'indicateurs */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Fret compatible</span>
            <Package size={20} color="var(--color-primary-light)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>{demandesCompatibles.length}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Sur vos axes Casamance</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Missions en route</span>
            <Truck size={20} color="var(--color-info)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-info)' }}>{transportsActifs.length}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>En transit routier</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Gains en séquestre</span>
            <DollarSign size={20} color="var(--color-success)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-success)' }}>{formatFCFA(revenusEnAttente)}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Net garanti à débloquer</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Évaluation moyenne</span>
            <Star size={20} color="#E88945" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: '#E88945' }}>{user?.noteMoyenne || 5.0} / 5</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Sur {user?.nombreAvis || 0} missions évaluées</span>
        </div>
      </div>

      {/* Demandes disponibles compatibles */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Cargaisons prêtes au chargement en Casamance</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Missions compatibles avec votre gabarit de {formatWeight(user?.capaciteKg || 10000)}
            </p>
          </div>
          <Link to="/camionneur/demandes-disponibles">
            <Button variant="outline" size="sm">
              Voir tout ({demandes.length})
            </Button>
          </Link>
        </div>

        {demandesCompatibles.length === 0 ? (
          <EmptyState
            title="Aucune demande compatible pour le moment"
            description="Revenez régulièrement pour consulter les chargements postés par les commerçants et coopératives."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {demandesCompatibles.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                      {d.origine} ➔ {d.destination}
                    </strong>
                    <Badge label={getStatutDemandeBadge(d.statut).label} className={getStatutDemandeBadge(d.statut).className} />
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
                    {d.typeMarchandise} • <strong>{formatWeight(d.poidsKg)}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Commerçant : {d.commercantNom} • Date prévue : {formatDate(d.dateChargement)}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Budget proposé</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>{formatFCFA(d.prixPropose)}</strong>
                  </div>

                  <Button variant="accent" size="sm" onClick={() => handleOpenOffre(d)}>
                    Faire une offre de transport
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale Soumettre une offre */}
      <Modal
        isOpen={Boolean(selectedDemande)}
        onClose={() => setSelectedDemande(null)}
        title="Proposer mes services de transport"
      >
        {selectedDemande && (
          <form onSubmit={handleSubmitOffre}>
            {successMsg ? (
              <div className="alert alert-success">
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            ) : (
              <>
                <div style={{ backgroundColor: '#FAF9F5', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                    {selectedDemande.origine} ➔ {selectedDemande.destination} ({selectedDemande.typeMarchandise})
                  </div>
                  <div style={{ color: 'var(--color-text-muted)' }}>
                    Poids : {formatWeight(selectedDemande.poidsKg)} • Budget suggéré : {formatFCFA(selectedDemande.prixPropose)}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Votre tarif proposé (FCFA)</label>
                  <input
                    type="number"
                    required
                    min={5000}
                    step={5000}
                    className="form-input"
                    value={prixOffre}
                    onChange={(e) => setPrixOffre(Number(e.target.value))}
                  />
                  <span className="form-hint">
                    Après retenue commission 5 % : <strong>{formatFCFA(Math.round(prixOffre * 0.95))} nets</strong> versés à la livraison.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Vos conditions de transport & matériel disponible</label>
                  <textarea
                    rows={3}
                    required
                    className="form-textarea"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <Button type="button" variant="outline" onClick={() => setSelectedDemande(null)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting}>
                    Transmettre mon offre ({formatFCFA(prixOffre)})
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
};
