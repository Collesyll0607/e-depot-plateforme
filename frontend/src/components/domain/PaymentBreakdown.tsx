import React from 'react';
import { formatFCFA } from '../../lib/format';
import { StatutPaiement } from '../../types';
import { getStatutPaiementBadge } from '../../lib/status';
import { Badge } from '../ui/Badge';
import { Shield, Smartphone } from 'lucide-react';

interface PaymentBreakdownProps {
  montantTotal: number;
  statut: StatutPaiement;
  tauxCommission?: number;
  waveReference?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({
  montantTotal,
  statut,
  tauxCommission = 0.05,
  waveReference,
  className = '',
  style,
}) => {
  const montantCommission = Math.round(montantTotal * tauxCommission);
  const montantNet = montantTotal - montantCommission;
  const badgeInfo = getStatutPaiementBadge(statut);

  return (
    <div
      className={`card ${className}`}
      style={{
        backgroundColor: '#FAFAF7',
        border: '1px solid var(--color-border)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} color="var(--color-primary-light)" />
          Sécurisation financière
        </h4>
        <Badge label={badgeInfo.label} className={badgeInfo.className} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.925rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Montant convenu (brut) :</span>
          <strong>{formatFCFA(montantTotal)}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
          <span>Commission E-Dépôt ({(tauxCommission * 100).toFixed(0)} %) :</span>
          <span>- {formatFCFA(montantCommission)}</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            marginTop: '0.25rem',
            borderTop: '1px dashed var(--color-border)',
            fontWeight: 700,
            color: 'var(--color-primary)',
          }}
        >
          <span>Net transporteur garanti :</span>
          <span style={{ color: 'var(--color-success)' }}>{formatFCFA(montantNet)}</span>
        </div>
      </div>

      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.75rem',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.825rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
          <Smartphone size={16} color="#1F6F8B" />
          <span>Passerelle Wave Sandbox</span>
        </div>
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-main)' }}>
          {waveReference || 'Attente séquestre'}
        </span>
      </div>
    </div>
  );
};
