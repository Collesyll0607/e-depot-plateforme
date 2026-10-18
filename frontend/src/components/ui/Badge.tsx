import React from 'react';

interface BadgeProps {
  label: string;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ label, className = 'badge-neutral', icon }) => {
  return (
    <span className={`badge ${className}`}>
      {icon}
      {label}
    </span>
  );
};
