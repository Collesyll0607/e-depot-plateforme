import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Transaction } from '../../types';
import { formatFCFA, formatDate } from '../../lib/format';
import { Badge } from '../../components/ui/Badge';
import { DollarSign, ShieldCheck, Percent, TrendingUp } from 'lucide-react';
import { getStatutPaiementBadge } from '../../lib/status';

export const CommissionsAdmin: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalCommissions = transactions.reduce((acc, t) => acc + t.montantCommission, 0);
  const commissionsEncaissees = transactions
    .filter((t) => t.statut === 'LIBERE')
    .reduce((acc, t) => acc + t.montantCommission, 0);
  const commissionsEnSequestre = transactions
    .filter((t) => t.statut !== 'LIBERE' && t.statut !== 'REMBOURSE')
    .reduce((acc, t) => acc + t.montantCommission, 0);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Commissions de la Plateforme (5 %)</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Suivi des retenues d'intermédiation et modèle économique E-Dépôt sur les opérations de fret.
        </p>
      </div>

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
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Missions livrées et validées</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Commissions en séquestre</span>
            <ShieldCheck size={20} color="var(--color-info)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-info)' }}>{formatFCFA(commissionsEnSequestre)}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>En cours d'acheminement</span>
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
  );
};
