import React from 'react';

export const HeroIllustration: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-border)',
        backgroundColor: '#FFFFFF',
      }}
    >
      <svg
        viewBox="0 0 600 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {/* Fond ciel doux et soleil de Casamance */}
        <rect width="600" height="420" fill="#F4F8F4" />
        <circle cx="480" cy="100" r="60" fill="#FDEFE4" />
        <circle cx="480" cy="100" r="45" fill="#FADBC4" />

        {/* Végétation verdoyante en arrière-plan (Palmiers et Fromagers stylisés) */}
        <path d="M0 290 Q 150 250 300 280 T 600 260 L 600 420 L 0 420 Z" fill="#D3E5D9" />
        <path d="M0 320 Q 200 290 400 310 T 600 300 L 600 420 L 0 420 Z" fill="#95BC9F" />

        {/* Silhouettes de palmiers */}
        <g stroke="#236B4A" strokeWidth="4" strokeLinecap="round">
          <path d="M90 280 Q 95 210 110 160" />
          <path d="M110 160 Q 70 150 50 170" />
          <path d="M110 160 Q 120 125 100 135" />
          <path d="M110 160 Q 150 145 160 170" />
          <path d="M110 160 Q 140 180 130 200" />

          <path d="M520 270 Q 515 220 505 175" />
          <path d="M505 175 Q 470 165 455 185" />
          <path d="M505 175 Q 515 145 495 155" />
          <path d="M505 175 Q 540 160 550 185" />
        </g>

        {/* Route goudronnée en perspective */}
        <polygon points="120,420 480,420 340,280 280,280" fill="#2E3830" />
        <line x1="300" y1="420" x2="310" y2="280" stroke="#FFFFFF" strokeWidth="5" strokeDasharray="16 14" />

        {/* Camion de transport de fret stylisé (sans personnes, focus logistique) */}
        <g transform="translate(180, 240)">
          {/* Ombre portée */}
          <ellipse cx="120" cy="140" rx="125" ry="12" fill="rgba(18, 59, 42, 0.2)" />

          {/* Roues */}
          <circle cx="50" cy="130" r="18" fill="#123B2A" />
          <circle cx="50" cy="130" r="8" fill="#E6E8E1" />
          <circle cx="85" cy="130" r="18" fill="#123B2A" />
          <circle cx="85" cy="130" r="8" fill="#E6E8E1" />
          <circle cx="195" cy="130" r="18" fill="#123B2A" />
          <circle cx="195" cy="130" r="8" fill="#E6E8E1" />

          {/* Châssis */}
          <rect x="30" y="115" width="180" height="10" fill="#202820" rx="3" />

          {/* Remorque / Plateau de chargement sécurisé */}
          <rect x="25" y="45" width="135" height="70" rx="4" fill="#123B2A" />
          <rect x="29" y="49" width="127" height="62" rx="2" fill="#236B4A" />

          {/* Cargaison stylisée : sacs de récoltes et caisses de mangues */}
          <rect x="40" y="25" width="30" height="20" rx="3" fill="#E88945" />
          <rect x="75" y="20" width="35" height="25" rx="3" fill="#D37532" />
          <rect x="115" y="28" width="30" height="17" rx="3" fill="#E88945" />
          {/* Cordes d'arrimage */}
          <line x1="25" y1="50" x2="160" y2="50" stroke="#E6E8E1" strokeWidth="2" />
          <line x1="55" y1="25" x2="55" y2="115" stroke="#E6E8E1" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="92" y1="20" x2="92" y2="115" stroke="#E6E8E1" strokeWidth="1.5" strokeDasharray="4 2" />
          <line x1="130" y1="28" x2="130" y2="115" stroke="#E6E8E1" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* Cabine tracteur moderne */}
          <path d="M160 55 L 195 55 L 215 80 L 215 118 L 160 118 Z" fill="#123B2A" />
          <path d="M175 62 L 195 62 L 208 80 L 175 80 Z" fill="#D3E5D9" />
          {/* Phares */}
          <rect x="210" y="100" width="6" height="10" rx="2" fill="#FADBC4" />
        </g>

        {/* Badges flottants technologiques (Séquestre Wave & Géolocalisation) */}
        <g transform="translate(40, 60)">
          <rect width="180" height="52" rx="10" fill="#FFFFFF" filter="drop-shadow(0px 4px 10px rgba(0,0,0,0.08))" />
          <circle cx="28" cy="26" r="14" fill="#EAF7EE" />
          <path d="M22 26 L 26 30 L 34 22" stroke="#1E7E45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="50" y="22" fill="#123B2A" fontSize="12" fontWeight="700" fontFamily="sans-serif">Séquestre Sécurisé</text>
          <text x="50" y="38" fill="#727A72" fontSize="10" fontFamily="sans-serif">Wave Sandbox 5%</text>
        </g>

        <g transform="translate(390, 310)">
          <rect width="170" height="52" rx="10" fill="#FFFFFF" filter="drop-shadow(0px 4px 10px rgba(0,0,0,0.08))" />
          <circle cx="28" cy="26" r="14" fill="#FCEFE6" />
          <circle cx="28" cy="26" r="6" fill="#E88945" />
          <text x="50" y="22" fill="#123B2A" fontSize="12" fontWeight="700" fontFamily="sans-serif">Suivi de trajet</text>
          <text x="50" y="38" fill="#727A72" fontSize="10" fontFamily="sans-serif">Casamance en direct</text>
        </g>
      </svg>
    </div>
  );
};
