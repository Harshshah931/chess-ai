'use client';

import React, { useRef, useEffect } from 'react';
import { Difficulty } from './ChessGameBoard';
import { MoveHistoryPanel } from './MoveHistoryPanel';
import { EvalChart } from './EvalChart';
import {
  RotateCcw,
  RefreshCw,
  ArrowLeftRight,
  Brain,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface SidePanelProps {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  moveHistory: any[];
  evalHistory: number[];
  isAIThinking: boolean;
  turn: string;
  isGameOver: boolean;
  onNewGame: () => void;
  onUndo: () => void;
  onFlipBoard: () => void;
  canUndo: boolean;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; depth: number; color: string }> = {
  easy: { label: 'Easy', depth: 2, color: '#4ade80' },
  medium: { label: 'Medium', depth: 3, color: '#facc15' },
  hard: { label: 'Hard', depth: 4, color: '#f87171' },
};

export function SidePanel({
  difficulty,
  onDifficultyChange,
  moveHistory,
  evalHistory,
  isAIThinking,
  turn,
  isGameOver,
  onNewGame,
  onUndo,
  onFlipBoard,
  canUndo,
}: SidePanelProps) {
  const moveCount = moveHistory.length;
  const fullMoves = Math.ceil(moveCount / 2);

  return (
    <div
      className="flex flex-col gap-4 w-full xl:w-72 2xl:w-80 flex-shrink-0"
      style={{ minWidth: 0 }}
    >
      {/* Turn Indicator */}
      <div
        className="card-elevated p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded-full border-2 flex-shrink-0"
            style={{
              background: turn === 'w' ? 'var(--board-light)' : '#1a1a2e',
              borderColor: turn === 'w' ? '#c0a870' : '#666',
              boxShadow: !isGameOver ? '0 0 8px rgba(201,168,76,0.5)' : 'none',
            }}
          />
          <div>
            <div className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
              Current Turn
            </div>
            <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {isGameOver ? 'Game Over' : turn === 'w' ? 'Your move' : isAIThinking ? 'AI thinking…' : 'AI to move'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono-nums" style={{ color: 'var(--muted-foreground)' }}>
          <Clock size={12} />
          <span>Move {fullMoves}</span>
        </div>
      </div>

      {/* AI Difficulty */}
      <div className="card-elevated p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={14} style={{ color: 'var(--primary)' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
            AI Difficulty
          </span>
        </div>
        <div className="flex gap-2">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => (
            <button
              key={`diff-${d}`}
              className={`difficulty-chip flex-1 text-center ${difficulty === d ? 'active' : ''}`}
              onClick={() => onDifficultyChange(d)}
              disabled={isAIThinking}
            >
              {DIFFICULTY_CONFIG[d].label}
            </button>
          ))}
        </div>
        <div className="mt-2.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Search depth:{' '}
          <span className="font-semibold font-mono-nums" style={{ color: DIFFICULTY_CONFIG[difficulty].color }}>
            {DIFFICULTY_CONFIG[difficulty].depth} plies
          </span>
          {' · '}Alpha-Beta Pruning
        </div>
      </div>

      {/* Eval Chart */}
      <div className="card-elevated p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} style={{ color: 'var(--primary)' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
            Position Evaluation
          </span>
        </div>
        <EvalChart evalHistory={evalHistory} />
        <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <span>Black advantage</span>
          <span>White advantage</span>
        </div>
      </div>

      {/* Move History */}
      <div className="card-elevated p-4 flex-1 flex flex-col min-h-0">
        <MoveHistoryPanel moveHistory={moveHistory} />
      </div>

      {/* Controls */}
      <div className="card-elevated p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn-primary flex items-center justify-center gap-2 py-2.5 text-sm col-span-2"
            onClick={onNewGame}
          >
            <RefreshCw size={15} />
            New Game
          </button>
          <button
            className="btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm"
            onClick={onUndo}
            disabled={!canUndo}
            style={{ opacity: canUndo ? 1 : 0.4, cursor: canUndo ? 'pointer' : 'not-allowed' }}
          >
            <RotateCcw size={15} />
            Undo
          </button>
          <button
            className="btn-secondary flex items-center justify-center gap-2 py-2.5 text-sm"
            onClick={onFlipBoard}
          >
            <ArrowLeftRight size={15} />
            Flip
          </button>
        </div>
      </div>
    </div>
  );
}