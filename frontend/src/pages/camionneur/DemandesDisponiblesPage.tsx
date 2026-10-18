import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { DemandeTransport } from '../../types';
import { formatFCFA, formatDate, formatWeight, formatDistance } from '../../lib/format';
import { getStatutDemandeBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LISTE_VILLES, estimerDistanceRoutiereKm } from '../../lib/geo';
import { MapPin, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const DemandesDisponiblesPage: React.FC = () => {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState<DemandeTransport[]>([]);
  const [filterZone, setFilterZone] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modale Offre
  const [selectedDemande, setSelectedDemande] = useState<DemandeTransport | null>(null);
  const [prixOffre, setPrixOffre] = useState<number>(0);
  const [conditions, setConditions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const dList = await api.getDemandes({ statut: 'OUVERTE' });
      setDemandes(dList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      setSuccessMsg('Votre offre a été transmise au commerçant !');
      setTimeout(() => {
        setSelectedDemande(null);
        setSuccessMsg(null);
        loadData();
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = demandes.filter((d) => {
    const matchZone =
      filterZone === 'ALL' || d.origine === filterZone || d.destination === filterZone;
    const matchSearch =
      d.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.typeMarchandise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.commercantNom.toLowerCase().includes(searchQuery.toLowerCase());
    return matchZone && matchSearch;
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Demandes de fret disponibles</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Consultez l'ensemble des cargaisons à transporter en Casamance et soumettez vos tarifs.
        </p>
      </div>

      {/* Barre de filtres */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Filtrer par marchandise, commerçant, référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '180px' }}
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
        >
          <option value="ALL">Toutes les villes</option>
          {LISTE_VILLES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement des chargements disponibles...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Aucun fret disponible pour ce filtre"
          description="Essayez d'élargir votre zone géographique ou de modifier vos termes de recherche."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filtered.map((d) => {
            const distance = estimerDistanceRoutiereKm(d.origine, d.destination);
            const isCompatible = (user?.capaciteKg || 10000) >= d.poidsKg;

            return (
              <div key={d.id} className="card" style={{ borderLeft: isCompatible ? '4px solid var(--color-primary)' : '4px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>{d.reference}</strong>
                      <Badge label={getStatutDemandeBadge(d.statut).label} className={getStatutDemandeBadge(d.statut).className} />
                      {isCompatible ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
                          ✓ Compatible avec votre camion
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-warning)', fontWeight: 600 }}>
                          Poids supérieur à votre capacité
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Commerçant : <strong>{d.commercantNom}</strong> • Chargement prévu le {formatDate(d.dateChargement)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {formatFCFA(d.prixPropose)}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Budget suggéré commerçant</span>
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Trajet Casamance</div>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={14} color="#123B2A" />
                      {d.origine} ➔ {d.destination} ({formatDistance(distance)})
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Marchandise</div>
                    <div style={{ fontWeight: 600, marginTop: '2px' }}>
                      {d.typeMarchandise} ({formatWeight(d.poidsKg)})
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: '#FAF9F5', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Lieu de déchargement</div>
                    <div style={{ fontWeight: 600, marginTop: '2px' }}>
                      {d.destinataire.adresse}, {d.destinataire.ville}
                    </div>
                  </div>
                </div>

                {d.instructionsManutention && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>
                    Consignes : {d.instructionsManutention}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <Button variant="accent" size="sm" onClick={() => handleOpenOffre(d)}>
                    Faire une offre de transport
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale Soumettre Offre */}
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
                    Après retenue commission 5 % : <strong>{formatFCFA(Math.round(prixOffre * 0.95))} nets</strong> garantis à la livraison.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Vos conditions & matériel d'arrimage</label>
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
                    Transmettre mon offre
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
