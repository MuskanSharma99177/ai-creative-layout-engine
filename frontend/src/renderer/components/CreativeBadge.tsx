import React from 'react';
import { LayoutConfig } from '../../types/layout';

interface CreativeBadgeProps {
  badgeText: string;
  config: LayoutConfig;
  className?: string;
}

export const CreativeBadge: React.FC<CreativeBadgeProps> = ({ badgeText, config, className = '' }) => {
  if (!badgeText || !badgeText.trim()) return null;

  const { theme } = config;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase transition-transform ${className}`}
      style={{
        backgroundColor: theme.accentColor,
        color: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      {badgeText}
    </div>
  );
};
