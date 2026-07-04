/**
 * Chess AI module — Minimax with Alpha-Beta Pruning
 *
 * Architecture:
 *   - makeAIMove(): entry point, returns best move
 *   - minimax(): recursive search with alpha-beta pruning
 *   - orderMoves(): move ordering for better pruning efficiency
 *   - evaluatePosition(): see evaluation.ts
 *
 * Backend integration point: Wrap makeAIMove() in a Web Worker
 * for non-blocking execution on Hard difficulty (depth 4+).
 */

import { Chess } from 'chess.js';
import { evaluatePosition, PIECE_VALUES } from './evaluation';

interface AIMove {
  from: string;
  to: string;
  promotion?: string;
}

// ── Move ordering ────────────────────────────────────────────────────────
// Prioritize: captures (MVV-LVA), promotions, checks
function orderMoves(chess: Chess): any[] {
  const moves = chess.moves({ verbose: true });

  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Captures: Most Valuable Victim - Least Valuable Attacker
    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured] ?? 0) - (PIECE_VALUES[a.piece] ?? 0) / 10 + 1000;
    }
    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured] ?? 0) - (PIECE_VALUES[b.piece] ?? 0) / 10 + 1000;
    }

    // Promotions
    if (a.promotion) scoreA += 900;
    if (b.promotion) scoreB += 900;

    // Pawn push to center
    if (a.piece === 'p' && (a.to[0] === 'd' || a.to[0] === 'e')) scoreA += 50;
    if (b.piece === 'p' && (b.to[0] === 'd' || b.to[0] === 'e')) scoreB += 50;

    // Knight/bishop development early
    if ((a.piece === 'n' || a.piece === 'b') && parseInt(a.from[1]) === (a.color === 'w' ? 1 : 8)) scoreA += 40;
    if ((b.piece === 'n' || b.piece === 'b') && parseInt(b.from[1]) === (b.color === 'w' ? 1 : 8)) scoreB += 40;

    return scoreB - scoreA;
  });
}

// ── Minimax with Alpha-Beta Pruning ──────────────────────────────────────
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluatePosition(chess);
  }

  const moves = orderMoves(chess);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

// ── Entry point ──────────────────────────────────────────────────────────
export function makeAIMove(chess: Chess, depth: number): AIMove | null {
  const moves = orderMoves(chess);
  if (moves.length === 0) return null;

  let bestMove: any = null;
  let bestScore = -Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of moves) {
    chess.move(move);
    // AI is black (minimizing from white's perspective → black maximizes negative)
    // We negate because black wants to minimize white's score
    const score = -minimax(chess, depth - 1, -beta, -alpha, false);
    chess.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  if (!bestMove) return null;

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion ?? (bestMove.flags?.includes('p') ? 'q' : undefined),
  };
}