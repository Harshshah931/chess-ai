'use client';

import React from 'react';
import AppLogo from '@/components/ui/AppLogo';
import { Volume2, VolumeX } from 'lucide-react';

interface TopBarProps {
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

export function TopBar({ soundEnabled, onSoundToggle }: TopBarProps) {
  return (
    <header
      className="flex items-center justify-between px-4 lg:px-8 xl:px-12 2xl:px-20 h-14 flex-shrink-0"
      style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <AppLogo size={32} />
        <div className="flex flex-col">
          <span
            className="font-bold text-base leading-none"
            style={{ color: 'var(--foreground)' }}
          >
            ChessAI
          </span>
          <span className="text-xs leading-none" style={{ color: 'var(--muted-foreground)' }}>
            Minimax · Alpha-Beta
          </span>
        </div>
      </div>

      {/* Badge */}
      <div className="hidden md:flex items-center gap-2">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: 'var(--secondary)', color: 'var(--primary)', border: '1px solid var(--border)' }}
        >
          Browser-only · No server
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="btn-secondary p-2 flex items-center justify-center"
          onClick={onSoundToggle}
          title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary p-2 flex items-center justify-center"
          title="View on GitHub"
          aria-label="View on GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
      </div>
    </header>
  );
}