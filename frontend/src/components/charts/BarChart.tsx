import React from 'react';
import { formatFCFA } from '../../lib/format';

interface BarChartProps {
  data: any[];
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 220 }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        Aucune donnée d'activité disponible pour le moment.
      </div>
    );
  }

  // Normalisation des données pour accepter les formats:
  // { mois, volume, commissions } OU { label, value }
  const normalized = data.map((item) => {
    const mois = item.mois || item.label || 'Mois';
    const volume = Number(item.volume ?? item.value ?? 0);
    const commissions = Number(item.commissions ?? Math.round(volume * 0.05));
    return { mois, volume, commissions };
  });

  const maxVolume = Math.max(...normalized.map((d) => d.volume), 100000);
  const chartHeight = height - 50;

  return (
    <div style={{ width: '100%' }}>
      <svg width="100%" height={height} viewBox={`0 0 500 ${height}`} preserveAspectRatio="none">
        {/* Lignes de repère horizontales */}
        <line x1="40" y1="20" x2="480" y2="20" stroke="#E6E8E1" strokeDasharray="3 3" />
        <line x1="40" y1={chartHeight / 2 + 20} x2="480" y2={chartHeight / 2 + 20} stroke="#E6E8E1" strokeDasharray="3 3" />
        <line x1="40" y1={chartHeight + 20} x2="480" y2={chartHeight + 20} stroke="#E6E8E1" />

        {normalized.map((item, index) => {
          const barWidth = 46;
          const gap = (440 - normalized.length * barWidth) / (normalized.length + 1);
          const x = 40 + gap + index * (barWidth + gap);
          const barH = Math.max(8, (item.volume / maxVolume) * chartHeight);
          const y = chartHeight + 20 - barH;

          return (
            <g key={item.mois + index}>
              {/* Barre de volume fret */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={4}
                fill="#123B2A"
                opacity={0.88}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                <title>{`${item.mois} : ${formatFCFA(item.volume)} (Commissions: ${formatFCFA(item.commissions)})`}</title>
              </rect>

              {/* Valeur chiffrée au-dessus de la barre */}
              <text
                x={x + barWidth / 2}
                y={Math.max(16, y - 6)}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#236B4A"
                fontFamily="sans-serif"
              >
                {item.volume >= 1000 ? `${Math.round(item.volume / 1000)}k` : item.volume}
              </text>

              {/* Libellé du mois */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 36}
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                fill="#727A72"
                fontFamily="sans-serif"
              >
                {item.mois}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 12, height: 12, backgroundColor: '#123B2A', borderRadius: 2 }} />
          <span>Volume fret (FCFA)</span>
        </div>
      </div>
    </div>
  );
};
