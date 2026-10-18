import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api';
import { Transaction } from '../../types';
import { formatFCFA, formatDate } from '../../lib/format';
import { getStatutPaiementBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { ShieldCheck, DollarSign, TrendingUp, Percent, CreditCard } from 'lucide-react';

export const TransactionsAdmin: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'sequestre' | 'commissions') || 'sequestre';
  const [activeTab, setActiveTab] = useState<'sequestre' | 'commissions'>(initialTab);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    return <Navigate to="/connexion" replace />;
  }

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getTransactions();
        setTransactions(list);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const switchTab = (tab: 'sequestre' | 'commissions') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const totalConsigne = transactions.reduce((acc, t) => acc + t.montantTotal, 0);
  const totalCommissions = transactions.reduce((acc, t) => acc + t.montantCommission, 0);
  const totalNetCamionneurs = transactions.reduce((acc, t) => acc + t.montantNetTransporteur, 0);

  const commissionsEncaissees = transactions
    .filter((t) => t.statut === 'LIBERE')
    .reduce((acc, t) => acc + t.montantCommission, 0);

  const commissionsEnSequestre = transactions
    .filter((t) => t.statut !== 'LIBERE' && t.statut !== 'REMBOURSE')
    .reduce((acc, t) => acc + t.montantCommission, 0);

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Séquestre Wave & Commissions (5 %)</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Supervision centrale des flux consignés via Wave Sandbox, ventilation comptable et revenus de la plateforme.
        </p>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => switchTab('sequestre')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'sequestre' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'sequestre' ? '#FFFFFF' : 'var(--color-text-main)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <CreditCard size={17} />
          Flux financiers & Séquestre ({transactions.length})
        </button>

        <button
          onClick={() => switchTab('commissions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: activeTab === 'commissions' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'commissions' ? '#FFFFFF' : 'var(--color-text-main)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <DollarSign size={17} />
          Modèle Économique & Commissions E-Dépôt (5 %)
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Chargement des données comptables...</p>
      ) : (
        <>
          {/* TAB 1: FLUX FINANCIERS & SÉQUESTRE */}
          {activeTab === 'sequestre' && (
            <div>
              <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Volume brut consigné</span>
                  <h3 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', margin: '0.25rem 0' }}>{formatFCFA(totalConsigne)}</h3>
                  <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Passerelle Wave Sandbox</span>
                </div>

                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Commissions E-Dépôt (5 %)</span>
                  <h3 style={{ fontSize: '1.8rem', color: '#E88945', margin: '0.25rem 0' }}>{formatFCFA(totalCommissions)}</h3>
                  <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Part plateforme</span>
                </div>

                <div className="card">
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Net garanti transporteurs (95 %)</span>
                  <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)', margin: '0.25rem 0' }}>{formatFCFA(totalNetCamionneurs)}</h3>
                  <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Conditionné à la livraison OTP</span>
                </div>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Expédition</th>
                      <th>Commerçant</th>
                      <th>Camionneur</th>
                      <th>Montant brut</th>
                      <th>Commission (5%)</th>
                      <th>Net Chauffeur (95%)</th>
                      <th>Réf Wave</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => {
                      const badge = getStatutPaiementBadge(t.statut);
                      return (
                        <tr key={t.id}>
                          <td>
                            <strong>{t.reference}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatDate(t.dateCreation)}</div>
                          </td>
                          <td>{t.expeditionReference}</td>
                          <td>{t.commercantNom}</td>
                          <td>{t.camionneurNom}</td>
                          <td><strong>{formatFCFA(t.montantTotal)}</strong></td>
                          <td style={{ color: '#E88945', fontWeight: 600 }}>{formatFCFA(t.montantCommission)}</td>
                          <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{formatFCFA(t.montantNetTransporteur)}</td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                              {t.waveReference}
                            </span>
                          </td>
                          <td>
                            <Badge label={badge.label} className={badge.className} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: MODÈLE ÉCONOMIQUE & COMMISSIONS */}
          {activeTab === 'commissions' && (
            <div>
              <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Commissions totales générées</span>
                    <DollarSign size={20} color="#E88945" />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', color: '#E88945' }}>{formatFCFA(totalCommissions)}</h3>
                  <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Taux fixe contractuel de 5 %</span>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Commissions encaissées</span>
                    <TrendingUp size={20} color="var(--color-success)" />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>{formatFCFA(commissionsEncaissees)}</h3>
                  <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Missions livrées et validées par OTP</span>
                </div>

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Commissions sous séquestre</span>
                    <ShieldCheck size={20} color="#1F6F8B" />
                  </div>
                  <h3 style={{ fontSize: '1.8rem', color: '#1F6F8B' }}>{formatFCFA(commissionsEnSequestre)}</h3>
                  <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>En cours de transit</span>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Détail des commissions prélevées par expédition</h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Réf Transaction</th>
                        <th>Expédition</th>
                        <th>Commerçant</th>
                        <th>Transporteur</th>
                        <th>Montant Fret</th>
                        <th>Taux</th>
                        <th>Commission E-Dépôt</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => {
                        const badge = getStatutPaiementBadge(t.statut);
                        return (
                          <tr key={t.id}>
                            <td><strong>{t.reference}</strong></td>
                            <td>{t.expeditionReference}</td>
                            <td>{t.commercantNom}</td>
                            <td>{t.camionneurNom}</td>
                            <td>{formatFCFA(t.montantTotal)}</td>
                            <td><Badge label="5 %" className="badge-neutral" /></td>
                            <td style={{ color: '#E88945', fontWeight: 700 }}>
                              {formatFCFA(t.montantCommission)}
                            </td>
                            <td><Badge label={badge.label} className={badge.className} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
