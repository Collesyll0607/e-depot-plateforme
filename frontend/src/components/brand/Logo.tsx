import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'dark', size = 'md', to = '/' }) => {
  const isLight = variant === 'light';
  const textColor = isLight ? '#FFFFFF' : '#123B2A';
  const subColor = isLight ? '#A5C4B5' : '#727A72';

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 42,
  };

  const textSizes = {
    sm: '1.1rem',
    md: '1.35rem',
    lg: '1.75rem',
  };

  const px = iconSizes[size];

  const content = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="48" height="48" rx="10" fill={isLight ? '#236B4A' : '#123B2A'} />
        {/* Symbole stylisé : colis en mouvement et route */}
        <path d="M12 24L24 16L36 24L24 32L12 24Z" fill="#E88945" />
        <path d="M12 24L24 32V38L12 30V24Z" fill="#D37532" />
        <path d="M36 24L24 32V38L36 30V24Z" fill="#F49E5F" />
        <circle cx="24" cy="14" r="3" fill="#FFFFFF" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: textSizes[size],
            color: textColor,
            letterSpacing: '-0.02em',
          }}
        >
          E-Dépôt
        </span>
        <span
          style={{
            fontSize: size === 'lg' ? '0.75rem' : '0.65rem',
            color: subColor,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            marginTop: '2px',
          }}
        >
          Logistique Casamance
        </span>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  return content;
};
