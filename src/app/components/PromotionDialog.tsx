'use client';

import React from 'react';
import { getPieceSVG } from '@/lib/pieces';

interface PromotionDialogProps {
  color: 'w' | 'b';
  onSelect: (piece: string) => void;
  onCancel: () => void;
}

const PROMOTION_PIECES = ['q', 'r', 'b', 'n'];
const PIECE_NAMES: Record<string, string> = {
  q: 'Queen',
  r: 'Rook',
  b: 'Bishop',
  n: 'Knight',
};

export function PromotionDialog({ color, onSelect, onCancel }: PromotionDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center promotion-modal-backdrop"
      onClick={onCancel}
    >
      <div
        className="flex flex-col items-center gap-5 p-6 rounded-xl status-slide-in"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="text-base font-semibold text-center mb-1" style={{ color: 'var(--foreground)' }}>
            Pawn Promotion
          </div>
          <div className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
            Choose a piece to promote your pawn
          </div>
        </div>

        <div className="flex gap-3">
          {PROMOTION_PIECES.map((piece) => (
            <button
              key={`promo-${piece}`}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all duration-150 group"
              style={{
                background: 'var(--secondary)',
                border: '1px solid var(--border)',
                minWidth: '72px',
              }}
              onClick={() => onSelect(piece)}
            >
              <div
                className="w-12 h-12 chess-piece-shadow"
                style={{ transition: 'transform 0.15s ease' }}
                dangerouslySetInnerHTML={{ __html: getPieceSVG(piece, color) }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                {PIECE_NAMES[piece]}
              </span>
            </button>
          ))}
        </div>

        <button
          className="text-xs"
          style={{ color: 'var(--muted-foreground)' }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}