'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

import { GameState, createInitialGameState } from '@/lib/gameState';
import { makeAIMove } from '@/lib/ai';
import { ChessBoard } from './ChessBoard';
import { SidePanel } from './SidePanel';
import { PromotionDialog } from './PromotionDialog';
import { GameStatusBanner } from './GameStatusBanner';
import { TopBar } from './TopBar';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Chess } from 'chess.js';

export type Difficulty = 'easy' | 'medium' | 'hard';

const DEPTH_MAP: Record<Difficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 4,
};

export default function ChessGameBoard() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isBoardFlipped, setIsBoardFlipped] = useState(false);
  const [promotionPending, setPromotionPending] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [evalHistory, setEvalHistory] = useState<number[]>([0]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [statusKey, setStatusKey] = useState(0);
  const aiWorkerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playMove, playCapture, playCheck, playGameOver, playSelect } = useSoundEffects(soundEnabled);

  const chess = useRef<Chess>(new Chess());

  // Sync chess.js instance with game state FEN
  useEffect(() => {
    chess.current.load(gameState.fen);
  }, [gameState.fen]);

  const getLegalMovesForSquare = useCallback(
    (square: string): string[] => {
      const c = new Chess(gameState.fen);
      const moves = c.moves({ square: square as any, verbose: true });
      return moves.map((m) => m.to);
    },
    [gameState.fen]
  );

  const handleSquareClick = useCallback(
    (square: string) => {
      if (isAIThinking || gameState.isGameOver) return;
      const c = new Chess(gameState.fen);
      if (c.turn() !== 'w') return; // Player is always white

      const piece = c.get(square as any);

      if (selectedSquare === null) {
        if (piece && piece.color === 'w') {
          setSelectedSquare(square);
          setLegalMoves(getLegalMovesForSquare(square));
          playSelect();
        }
        return;
      }

      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
        setLegalMoves(getLegalMovesForSquare(square));
        playSelect();
        return;
      }

      if (legalMoves.includes(square)) {
        // Check for pawn promotion
        const movingPiece = c.get(selectedSquare as any);
        if (
          movingPiece?.type === 'p' &&
          ((movingPiece.color === 'w' && square[1] === '8') ||
            (movingPiece.color === 'b' && square[1] === '1'))
        ) {
          setPromotionPending({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }
        executePlayerMove(selectedSquare, square);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    },
    [selectedSquare, legalMoves, isAIThinking, gameState, getLegalMovesForSquare, playSelect]
  );

  const executePlayerMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      const c = new Chess(gameState.fen);
      const moveObj: any = { from, to };
      if (promotion) moveObj.promotion = promotion;

      const captured = c.get(to as any);
      const result = c.move(moveObj);
      if (!result) return;

      const isCapture = !!captured || result.flags.includes('e');
      const isCheck = c.inCheck();
      const isGameOver = c.isGameOver();

      if (isCapture) playCapture();
      else playMove();
      if (isCheck && !isGameOver) playCheck();
      if (isGameOver) playGameOver();

      setLastMove({ from, to });
      setSelectedSquare(null);
      setLegalMoves([]);
      setStatusKey((k) => k + 1);

      const newState = buildGameState(c, gameState.moveHistory, result, gameState.capturedByWhite, gameState.capturedByBlack);
      setGameState(newState);

      if (!newState.isGameOver) {
        triggerAIMove(newState);
      }
    },
    [gameState, playMove, playCapture, playCheck, playGameOver]
  );

  const triggerAIMove = useCallback(
    (state: GameState) => {
      setIsAIThinking(true);
      if (aiWorkerRef.current) clearTimeout(aiWorkerRef.current);

      aiWorkerRef.current = setTimeout(() => {
        try {
          const c = new Chess(state.fen);
          // Backend integration point: replace with Web Worker for non-blocking AI
          const aiResult = makeAIMove(c, DEPTH_MAP[difficulty]);
          if (aiResult) {
            const { from, to, promotion } = aiResult;
            const captured = c.get(to as any);
            const result = c.move({ from, to, promotion });
            if (!result) {
              setIsAIThinking(false);
              return;
            }

            const isCapture = !!captured || result.flags.includes('e');
            const isCheck = c.inCheck();
            const isGameOver = c.isGameOver();

            if (isCapture) playCapture();
            else playMove();
            if (isCheck && !isGameOver) playCheck();
            if (isGameOver) playGameOver();

            setLastMove({ from, to });
            setStatusKey((k) => k + 1);

            const newState = buildGameState(c, state.moveHistory, result, state.capturedByWhite, state.capturedByBlack);
            setGameState(newState);

            // Update eval history
            setEvalHistory((prev) => {
              let score = getSimpleEval(c);
              return [...prev.slice(-29), score];
            });
          }
        } catch (e) {
          console.error('AI move error:', e);
        } finally {
          setIsAIThinking(false);
        }
      }, 150);
    },
    [difficulty, playMove, playCapture, playCheck, playGameOver]
  );

  const handlePromotion = useCallback(
    (piece: string) => {
      if (!promotionPending) return;
      setPromotionPending(null);
      executePlayerMove(promotionPending.from, promotionPending.to, piece);
    },
    [promotionPending, executePlayerMove]
  );

  const handleNewGame = useCallback(() => {
    if (aiWorkerRef.current) clearTimeout(aiWorkerRef.current);
    setIsAIThinking(false);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setEvalHistory([0]);
    setPromotionPending(null);
    setStatusKey((k) => k + 1);
    setGameState(createInitialGameState());
  }, []);

  const handleUndo = useCallback(() => {
    if (isAIThinking || gameState.moveHistory.length < 2) return;
    // Undo two moves (player + AI)
    const c = new Chess();
    const movesToReplay = gameState.moveHistory.slice(0, -2);
    for (const move of movesToReplay) {
      c.move(move.san);
    }

    const newHistory = gameState.moveHistory.slice(0, -2);
    const newCapturedByWhite = [...gameState.capturedByWhite];
    const newCapturedByBlack = [...gameState.capturedByBlack];

    // Remove last captured pieces if any
    const lastTwo = gameState.moveHistory.slice(-2);
    for (const m of lastTwo) {
      if (m.captured) {
        if (m.color === 'w') {
          const idx = newCapturedByWhite.indexOf(m.captured);
          if (idx !== -1) newCapturedByWhite.splice(idx, 1);
        } else {
          const idx = newCapturedByBlack.indexOf(m.captured);
          if (idx !== -1) newCapturedByBlack.splice(idx, 1);
        }
      }
    }

    setGameState({
      fen: c.fen(),
      moveHistory: newHistory,
      capturedByWhite: newCapturedByWhite,
      capturedByBlack: newCapturedByBlack,
      isGameOver: false,
      gameResult: null,
      isCheck: c.inCheck(),
      turn: c.turn(),
    });
    setLastMove(
      newHistory.length > 0
        ? { from: newHistory[newHistory.length - 1].from, to: newHistory[newHistory.length - 1].to }
        : null
    );
    setSelectedSquare(null);
    setLegalMoves([]);
    setEvalHistory((prev) => prev.slice(0, -2));
  }, [gameState, isAIThinking]);

  const handleDragMove = useCallback(
    (from: string, to: string) => {
      if (isAIThinking || gameState.isGameOver) return;
      const c = new Chess(gameState.fen);
      if (c.turn() !== 'w') return;

      const movingPiece = c.get(from as any);
      if (!movingPiece || movingPiece.color !== 'w') return;

      const moves = c.moves({ square: from as any, verbose: true });
      const isLegal = moves.some((m) => m.to === to);
      if (!isLegal) return;

      if (
        movingPiece.type === 'p' &&
        ((movingPiece.color === 'w' && to[1] === '8') ||
          (movingPiece.color === 'b' && to[1] === '1'))
      ) {
        setPromotionPending({ from, to });
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      executePlayerMove(from, to);
    },
    [isAIThinking, gameState, executePlayerMove]
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <TopBar
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled((s) => !s)}
      />

      <main className="flex-1 flex flex-col xl:flex-row gap-4 lg:gap-6 px-4 lg:px-8 xl:px-12 2xl:px-20 py-4 lg:py-6 max-w-screen-2xl mx-auto w-full">
        {/* Board Area */}
        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          {/* Black player info */}
          <PlayerBar
            color="b"
            label="ChessAI"
            capturedPieces={gameState.capturedByWhite}
            materialAdvantage={getMaterialAdvantage(gameState.capturedByWhite, gameState.capturedByBlack)}
            isActive={!gameState.isGameOver && gameState.turn === 'b'}
            isFlipped={isBoardFlipped}
            isThinking={isAIThinking}
          />

          <div className="relative">
            {gameState.isCheck && !gameState.isGameOver && (
              <div key={statusKey} className="status-slide-in absolute -top-10 left-0 right-0 z-10 flex justify-center">
                <span className="bg-red-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                  ♚ CHECK
                </span>
              </div>
            )}

            <ChessBoard
              fen={gameState.fen}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              isFlipped={isBoardFlipped}
              isAIThinking={isAIThinking}
              isGameOver={gameState.isGameOver}
              onSquareClick={handleSquareClick}
              onDragMove={handleDragMove}
              turn={gameState.turn}
            />

            {gameState.isGameOver && (
              <GameStatusBanner result={gameState.gameResult} onNewGame={handleNewGame} />
            )}
          </div>

          {/* White player info */}
          <PlayerBar
            color="w"
            label="You"
            capturedPieces={gameState.capturedByBlack}
            materialAdvantage={getMaterialAdvantage(gameState.capturedByBlack, gameState.capturedByWhite)}
            isActive={!gameState.isGameOver && gameState.turn === 'w'}
            isFlipped={isBoardFlipped}
            isThinking={false}
          />
        </div>

        {/* Side Panel */}
        <SidePanel
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          moveHistory={gameState.moveHistory}
          evalHistory={evalHistory}
          isAIThinking={isAIThinking}
          turn={gameState.turn}
          isGameOver={gameState.isGameOver}
          onNewGame={handleNewGame}
          onUndo={handleUndo}
          onFlipBoard={() => setIsBoardFlipped((f) => !f)}
          canUndo={gameState.moveHistory.length >= 2 && !isAIThinking}
        />
      </main>

      {promotionPending && (
        <PromotionDialog
          color="w"
          onSelect={handlePromotion}
          onCancel={() => setPromotionPending(null)}
        />
      )}
    </div>
  );
}

// ── Helper: build GameState from Chess.js instance ──────────────────────────
function buildGameState(
  c: Chess,
  prevHistory: GameState['moveHistory'],
  lastResult: any,
  prevCapturedByWhite: string[],
  prevCapturedByBlack: string[]
): GameState {
  const newCapturedByWhite = [...prevCapturedByWhite];
  const newCapturedByBlack = [...prevCapturedByBlack];

  if (lastResult.captured) {
    if (lastResult.color === 'w') newCapturedByWhite.push(lastResult.captured);
    else newCapturedByBlack.push(lastResult.captured);
  }
  // En passant
  if (lastResult.flags?.includes('e')) {
    if (lastResult.color === 'w') newCapturedByWhite.push('p');
    else newCapturedByBlack.push('p');
  }

  const moveRecord = {
    san: lastResult.san,
    from: lastResult.from,
    to: lastResult.to,
    color: lastResult.color,
    captured: lastResult.captured,
    piece: lastResult.piece,
    flags: lastResult.flags,
  };

  let gameResult: string | null = null;
  if (c.isGameOver()) {
    if (c.isCheckmate()) {
      gameResult = c.turn() === 'w' ? 'Black wins by checkmate' : 'White wins by checkmate';
    } else if (c.isStalemate()) {
      gameResult = 'Draw by stalemate';
    } else if (c.isThreefoldRepetition()) {
      gameResult = 'Draw by threefold repetition';
    } else if (c.isInsufficientMaterial()) {
      gameResult = 'Draw by insufficient material';
    } else {
      gameResult = 'Draw';
    }
  }

  return {
    fen: c.fen(),
    moveHistory: [...prevHistory, moveRecord],
    capturedByWhite: newCapturedByWhite,
    capturedByBlack: newCapturedByBlack,
    isGameOver: c.isGameOver(),
    gameResult,
    isCheck: c.inCheck(),
    turn: c.turn(),
  };
}

// ── Helper: simple eval score ─────────────────────────────────────────────
function getSimpleEval(c: Chess): number {
  const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let score = 0;
  const board = c.board();
  for (const row of board) {
    for (const sq of row) {
      if (!sq) continue;
      const val = PIECE_VALUES[sq.type] ?? 0;
      score += sq.color === 'w' ? val : -val;
    }
  }
  return Math.max(-15, Math.min(15, score));
}

// ── Helper: material advantage ────────────────────────────────────────────
function getMaterialAdvantage(myCaptures: string[], theirCaptures: string[]): number {
  const VALS: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const myScore = myCaptures.reduce((s, p) => s + (VALS[p] ?? 0), 0);
  const theirScore = theirCaptures.reduce((s, p) => s + (VALS[p] ?? 0), 0);
  return myScore - theirScore;
}

// ── PlayerBar sub-component ───────────────────────────────────────────────
interface PlayerBarProps {
  color: 'w' | 'b';
  label: string;
  capturedPieces: string[];
  materialAdvantage: number;
  isActive: boolean;
  isFlipped: boolean;
  isThinking: boolean;
}

function PlayerBar({ color, label, capturedPieces, materialAdvantage, isActive, isThinking }: PlayerBarProps) {
  const PIECE_SYMBOLS: Record<string, string> = {
    p: color === 'w' ? '♟' : '♙',
    n: color === 'w' ? '♞' : '♘',
    b: color === 'w' ? '♝' : '♗',
    r: color === 'w' ? '♜' : '♖',
    q: color === 'w' ? '♛' : '♕',
  };

  // Group captured pieces
  const grouped: Record<string, number> = {};
  for (const p of capturedPieces) {
    grouped[p] = (grouped[p] ?? 0) + 1;
  }

  return (
    <div className="flex items-center gap-3 w-full" style={{ maxWidth: 'min(90vw, 560px)' }}>
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 border-2"
        style={{
          background: color === 'w' ? 'var(--board-light)' : '#2a2a42',
          color: color === 'w' ? '#1a1a2e' : 'var(--board-light)',
          borderColor: isActive ? 'var(--primary)' : 'var(--border)',
          boxShadow: isActive ? '0 0 10px rgba(201,168,76,0.4)' : 'none',
        }}
      >
        {color === 'w' ? '♔' : '♚'}
      </div>

      {/* Name + thinking */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {label}
          </span>
          {isActive && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: 'var(--primary)', animation: 'thinkingPulse 1.2s ease-in-out infinite' }}
            />
          )}
          {isThinking && (
            <span className="text-xs thinking-pulse" style={{ color: 'var(--primary)' }}>
              thinking…
            </span>
          )}
        </div>
        {/* Captured pieces */}
        <div className="flex items-center gap-1 flex-wrap">
          {Object.entries(grouped).map(([piece, count]) => (
            <span key={`cap-${color}-${piece}`} className="text-xs" style={{ color: 'var(--muted-foreground)', lineHeight: 1 }}>
              {PIECE_SYMBOLS[piece] ?? ''}
              {count > 1 && <span className="text-xs">×{count}</span>}
            </span>
          ))}
          {materialAdvantage > 0 && (
            <span className="text-xs font-semibold ml-1" style={{ color: 'var(--primary)' }}>
              +{materialAdvantage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}