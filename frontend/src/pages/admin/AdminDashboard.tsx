import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { StatsPlateforme, Transaction, Litige } from '../../types';
import { formatFCFA, formatDate } from '../../lib/format';
import { getStatutPaiementBadge, getStatutLitigeBadge } from '../../lib/status';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BarChart } from '../../components/charts/BarChart';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Users, Package, Truck, DollarSign, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<StatsPlateforme | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [loading, setLoading] = useState(true);

  if (!authLoading && (!user || user.role !== 'ADMIN')) {
    return <Navigate to="/connexion" replace />;
  }

  useEffect(() => {
    async function load() {
      try {
        const [s, t, l] = await Promise.all([
          api.getStats(),
          api.getTransactions(),
          api.getLitiges(),
        ]);
        setStats(s);
        setTransactions(t);
        setLitiges(l);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !stats) {
    return <div style={{ color: 'var(--color-text-muted)' }}>Chargement des indicateurs administrateur...</div>;
  }

  const litigesOuverts = litiges.filter((l) => l.statut === 'OUVERT');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Supervision Globale de la Plateforme</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Indicateurs d'activité, flux financiers Wave Sandbox, commissions (5 %) et médiation en Casamance.
        </p>
      </div>

      {/* Alerte si litige ouvert */}
      {litigesOuverts.length > 0 && (
        <div className="alert alert-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} />
            <div>
              <strong>{litigesOuverts.length} litige(s) en attente d'arbitrage</strong>
              <div style={{ fontSize: '0.85rem' }}>Les fonds séquestrés sont temporairement gelés.</div>
            </div>
          </div>
          <Link to="/admin/utilisateurs?tab=litiges">
            <Button variant="danger" size="sm">
              Arbitrer les réclamations
            </Button>
          </Link>
        </div>
      )}

      {/* Cartes d'indicateurs globaux */}
      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Utilisateurs inscrits</span>
            <Users size={20} color="var(--color-primary-light)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>{stats.utilisateursActifs}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Commerçants & Transporteurs</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Transports actifs</span>
            <Truck size={20} color="var(--color-info)" />
          </div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-info)' }}>{stats.transportsActifs}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>En transit sur les axes</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Volume Fret Total</span>
            <DollarSign size={20} color="var(--color-success)" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: 'var(--color-success)' }}>{formatFCFA(stats.volumeTotalFCFA)}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Flux sécurisés par séquestre</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Commissions (5 %)</span>
            <ShieldCheck size={20} color="#E88945" />
          </div>
          <h3 style={{ fontSize: '1.4rem', color: '#E88945' }}>{formatFCFA(stats.commissionsTotalesFCFA)}</h3>
          <span style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)' }}>Revenus plateforme</span>
        </div>
      </div>

      {/* Graphique de l'activité */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Évolution du volume de fret en Casamance</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Montants cumulés des transactions consignées
            </p>
          </div>
        </div>
        <BarChart data={stats.activiteParMois} height={220} />
      </div>

      {/* Dernières transactions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Dernières opérations financières</h3>
          <Link to="/admin/transactions" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Voir toutes ({transactions.length})
          </Link>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Réf Transaction</th>
                <th>Expédition</th>
                <th>Commerçant</th>
                <th>Camionneur</th>
                <th>Total (FCFA)</th>
                <th>Com. 5%</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((t) => {
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
                    <td style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{formatFCFA(t.montantCommission)}</td>
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
