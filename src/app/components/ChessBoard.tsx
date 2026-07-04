'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { getPieceSVG } from '@/lib/pieces';

interface ChessBoardProps {
  fen: string;
  selectedSquare: string | null;
  legalMoves: string[];
  lastMove: { from: string; to: string } | null;
  isFlipped: boolean;
  isAIThinking: boolean;
  isGameOver: boolean;
  turn: string;
  onSquareClick: (square: string) => void;
  onDragMove: (from: string, to: string) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export function ChessBoard({
  fen,
  selectedSquare,
  legalMoves,
  lastMove,
  isFlipped,
  isAIThinking,
  isGameOver,
  turn,
  onSquareClick,
  onDragMove,
}: ChessBoardProps) {
  const [dragging, setDragging] = useState<{
    square: string;
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const chess = new Chess(fen);
  const board = chess.board();

  const files = isFlipped ? [...FILES].reverse() : FILES;
  const ranks = isFlipped ? [...RANKS].reverse() : RANKS;

  const getSquareName = (fileIdx: number, rankIdx: number): string => {
    return `${files[fileIdx]}${ranks[rankIdx]}`;
  };

  const getPieceAt = (square: string) => {
    const file = square[0];
    const rank = square[1];
    const fileIdx = FILES.indexOf(file);
    const rankIdx = RANKS.indexOf(rank);
    if (fileIdx === -1 || rankIdx === -1) return null;
    return board[rankIdx]?.[fileIdx] ?? null;
  };

  const getKingInCheckSquare = (): string | null => {
    if (!chess.inCheck()) return null;
    const color = chess.turn();
    const b = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = b[r][f];
        if (sq && sq.type === 'k' && sq.color === color) {
          return `${FILES[f]}${RANKS[r]}`;
        }
      }
    }
    return null;
  };

  const checkSquare = getKingInCheckSquare();

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, square: string) => {
      if (isAIThinking || isGameOver) return;
      const piece = getPieceAt(square);
      if (!piece || piece.color !== 'w') return;
      e.preventDefault();
      setDragging({ square, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY });
      setDragPos({ x: e.clientX, y: e.clientY });
    },
    [isAIThinking, isGameOver, fen]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, square: string) => {
      if (isAIThinking || isGameOver) return;
      const piece = getPieceAt(square);
      if (!piece || piece.color !== 'w') return;
      const touch = e.touches[0];
      setDragging({ square, x: touch.clientX, y: touch.clientY, startX: touch.clientX, startY: touch.clientY });
      setDragPos({ x: touch.clientX, y: touch.clientY });
    },
    [isAIThinking, isGameOver, fen]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      setDragPos({ x: e.clientX, y: e.clientY });
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const touch = e.touches[0];
      setDragPos({ x: touch.clientX, y: touch.clientY });
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (!dragging || !boardRef.current) {
        setDragging(null);
        setDragPos(null);
        return;
      }
      const targetSquare = getSquareFromCoords(e.clientX, e.clientY, boardRef.current, isFlipped);
      if (targetSquare && targetSquare !== dragging.square) {
        onDragMove(dragging.square, targetSquare);
      } else {
        onSquareClick(dragging.square);
      }
      setDragging(null);
      setDragPos(null);
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (!dragging || !boardRef.current) {
        setDragging(null);
        setDragPos(null);
        return;
      }
      const touch = e.changedTouches[0];
      const targetSquare = getSquareFromCoords(touch.clientX, touch.clientY, boardRef.current, isFlipped);
      if (targetSquare && targetSquare !== dragging.square) {
        onDragMove(dragging.square, targetSquare);
      } else {
        onSquareClick(dragging.square);
      }
      setDragging(null);
      setDragPos(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging, isFlipped, onDragMove, onSquareClick]);

  const squareSize = 'min(10vw, 70px)';

  return (
    <div className="relative select-none" style={{ userSelect: 'none' }}>
      {/* Coordinate labels — ranks (left) */}
      <div
        className="absolute left-0 top-0 flex flex-col"
        style={{ width: '18px', height: '100%', zIndex: 2 }}
      >
        {ranks.map((rank, i) => (
          <div
            key={`rank-label-${rank}`}
            className="flex items-center justify-center font-mono text-xs font-semibold"
            style={{
              flex: 1,
              color: (i + (isFlipped ? 1 : 0)) % 2 === 0 ? 'var(--board-dark)' : 'var(--board-light)',
              fontSize: '11px',
            }}
          >
            {rank}
          </div>
        ))}
      </div>

      {/* Board */}
      <div
        ref={boardRef}
        className="relative"
        style={{
          marginLeft: '18px',
          marginBottom: '18px',
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          width: 'min(90vw, 560px)',
          height: 'min(90vw, 560px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 2px var(--border)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {ranks.map((rank, rankIdx) =>
          files.map((file, fileIdx) => {
            const square = `${file}${rank}`;
            const isLight = (fileIdx + rankIdx) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isLegal = legalMoves.includes(square);
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isCheckSq = checkSquare === square;
            const piece = getPieceAt(square);
            const isDraggingThis = dragging?.square === square;

            let bgColor = isLight ? 'var(--board-light)' : 'var(--board-dark)';
            if (isSelected) bgColor = 'rgba(201, 168, 76, 0.75)';
            else if (isLastMoveFrom || isLastMoveTo) bgColor = isLight ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.35)';
            if (isCheckSq) bgColor = 'rgba(220, 50, 50, 0.75)';

            const isLegalCapture = isLegal && !!piece;

            return (
              <div
                key={`sq-${square}`}
                className="relative flex items-center justify-center"
                style={{
                  backgroundColor: bgColor,
                  cursor: piece && piece.color === 'w' ? 'grab' : isLegal ? 'pointer' : 'default',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => !dragging && onSquareClick(square)}
                onMouseDown={(e) => handleMouseDown(e, square)}
                onTouchStart={(e) => handleTouchStart(e, square)}
              >
                {/* Legal move indicator */}
                {isLegal && !isLegalCapture && (
                  <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: '33%',
                      height: '33%',
                      background: 'rgba(0,0,0,0.22)',
                      zIndex: 3,
                    }}
                  />
                )}
                {isLegalCapture && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      border: '4px solid rgba(0,0,0,0.22)',
                      borderRadius: '50%',
                      zIndex: 3,
                    }}
                  />
                )}

                {/* Piece */}
                {piece && !isDraggingThis && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ zIndex: 4, pointerEvents: 'none' }}
                  >
                    <div
                      className="chess-piece-shadow"
                      style={{ width: '88%', height: '88%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      dangerouslySetInnerHTML={{ __html: getPieceSVG(piece.type, piece.color) }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Coordinate labels — files (bottom) */}
      <div
        className="absolute bottom-0 flex flex-row"
        style={{ left: '18px', right: 0, height: '18px', zIndex: 2 }}
      >
        {files.map((file, i) => (
          <div
            key={`file-label-${file}`}
            className="flex items-center justify-end font-mono font-semibold pr-1"
            style={{
              flex: 1,
              color: (i + (isFlipped ? 1 : 0)) % 2 === 0 ? 'var(--board-dark)' : 'var(--board-light)',
              fontSize: '11px',
            }}
          >
            {file}
          </div>
        ))}
      </div>

      {/* Drag ghost piece */}
      {dragging && dragPos && (() => {
        const piece = getPieceAt(dragging.square);
        if (!piece) return null;
        return (
          <div
            className="fixed pointer-events-none chess-piece-shadow"
            style={{
              left: dragPos.x - 35,
              top: dragPos.y - 35,
              width: 70,
              height: 70,
              zIndex: 9999,
              transform: 'scale(1.1)',
              opacity: 0.92,
            }}
            dangerouslySetInnerHTML={{ __html: getPieceSVG(piece.type, piece.color) }}
          />
        );
      })()}

      {/* AI Thinking overlay */}
      {isAIThinking && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            marginLeft: '18px',
            marginBottom: '18px',
            background: 'rgba(0,0,0,0.08)',
            zIndex: 20,
            pointerEvents: 'none',
            borderRadius: '4px',
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent"
              style={{
                borderColor: 'var(--primary)',
                borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
              AI thinking…
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Helper: get square name from pixel coords ─────────────────────────────
function getSquareFromCoords(
  x: number,
  y: number,
  boardEl: HTMLElement,
  isFlipped: boolean
): string | null {
  const rect = boardEl.getBoundingClientRect();
  const relX = x - rect.left;
  const relY = y - rect.top;
  if (relX < 0 || relY < 0 || relX > rect.width || relY > rect.height) return null;

  const fileIdx = Math.floor((relX / rect.width) * 8);
  const rankIdx = Math.floor((relY / rect.height) * 8);
  if (fileIdx < 0 || fileIdx > 7 || rankIdx < 0 || rankIdx > 7) return null;

  const files = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = isFlipped ? ['1', '2', '3', '4', '5', '6', '7', '8'] : ['8', '7', '6', '5', '4', '3', '2', '1'];
  return `${files[fileIdx]}${ranks[rankIdx]}`;
}