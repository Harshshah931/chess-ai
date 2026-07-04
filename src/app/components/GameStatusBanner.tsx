'use client';

import React from 'react';
import { Trophy, Minus, Skull } from 'lucide-react';

interface GameStatusBannerProps {
  result: string | null;
  onNewGame: () => void;
}

export function GameStatusBanner({ result, onNewGame }: GameStatusBannerProps) {
  if (!result) return null;

  const isWhiteWin = result.includes('White wins');
  const isBlackWin = result.includes('Black wins');
  const isDraw = result.includes('Draw');

  const icon = isDraw ? (
    <Minus size={28} style={{ color: 'var(--primary)' }} />
  ) : isWhiteWin ? (
    <Trophy size={28} style={{ color: 'var(--primary)' }} />
  ) : (
    <Skull size={28} style={{ color: '#f87171' }} />
  );

  const headline = isDraw ? 'Draw' : isWhiteWin ? 'You Win!' : 'AI Wins';
  const headlineColor = isDraw ? 'var(--primary)' : isWhiteWin ? 'var(--primary)' : '#f87171';

  return (
    <div
      className="absolute inset-0 flex items-center justify-center status-slide-in"
      style={{
        background: 'rgba(10, 10, 20, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 30,
        marginLeft: '18px',
        marginBottom: '18px',
        borderRadius: '4px',
      }}
    >
      <div
        className="flex flex-col items-center gap-4 p-8 rounded-xl"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          maxWidth: '280px',
          width: '90%',
        }}
      >
        {icon}
        <div>
          <div
            className="text-2xl font-bold text-center mb-1"
            style={{ color: headlineColor }}
          >
            {headline}
          </div>
          <div className="text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
            {result}
          </div>
        </div>
        <button
          className="btn-primary w-full py-2.5 text-sm"
          onClick={onNewGame}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}