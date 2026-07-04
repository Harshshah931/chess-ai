/**
 * Chess position evaluation module
 * Implements material values, piece-square tables, mobility,
 * king safety, pawn structure, center control, and endgame heuristics.
 *
 * Backend integration point: This module runs synchronously on the main thread.
 * For production, move into a Web Worker to prevent UI blocking on Hard difficulty.
 */

import { Chess } from 'chess.js';

// ── Material values (centipawns) ─────────────────────────────────────────
export const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// ── Piece-Square Tables (from White's perspective) ───────────────────────
// Positive values = good squares for that piece

const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
];

const KING_MIDDLE_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
];

const KING_END_TABLE = [
  -50,-40,-30,-20,-20,-30,-40,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50,
];

const PIECE_TABLES: Record<string, number[]> = {
  p: PAWN_TABLE,
  n: KNIGHT_TABLE,
  b: BISHOP_TABLE,
  r: ROOK_TABLE,
  q: QUEEN_TABLE,
  k: KING_MIDDLE_TABLE,
};

// ── Helpers ───────────────────────────────────────────────────────────────

function isEndgame(chess: Chess): boolean {
  const board = chess.board();
  let queens = 0;
  let minors = 0;
  for (const row of board) {
    for (const sq of row) {
      if (!sq) continue;
      if (sq.type === 'q') queens++;
      if (sq.type === 'n' || sq.type === 'b') minors++;
    }
  }
  return queens === 0 || (queens <= 2 && minors <= 2);
}

function getPST(piece: string, color: string, rank: number, file: number, endgame: boolean): number {
  const table = piece === 'k' && endgame ? KING_END_TABLE : PIECE_TABLES[piece] ?? [];
  if (table.length === 0) return 0;
  // For white: rank 0 = rank 8 (top), rank 7 = rank 1 (bottom)
  // For black: mirror vertically
  const idx = color === 'w' ? rank * 8 + file : (7 - rank) * 8 + file;
  return table[idx] ?? 0;
}

function countDoubledPawns(board: ReturnType<Chess['board']>, color: string): number {
  const fileCounts = new Array(8).fill(0);
  for (const row of board) {
    for (let f = 0; f < 8; f++) {
      const sq = row[f];
      if (sq && sq.type === 'p' && sq.color === color) {
        fileCounts[f]++;
      }
    }
  }
  return fileCounts.filter((c) => c > 1).length;
}

function countIsolatedPawns(board: ReturnType<Chess['board']>, color: string): number {
  const fileCounts = new Array(8).fill(0);
  for (const row of board) {
    for (let f = 0; f < 8; f++) {
      const sq = row[f];
      if (sq && sq.type === 'p' && sq.color === color) {
        fileCounts[f]++;
      }
    }
  }
  let isolated = 0;
  for (let f = 0; f < 8; f++) {
    if (fileCounts[f] > 0) {
      const leftEmpty = f === 0 || fileCounts[f - 1] === 0;
      const rightEmpty = f === 7 || fileCounts[f + 1] === 0;
      if (leftEmpty && rightEmpty) isolated++;
    }
  }
  return isolated;
}

function countPassedPawns(board: ReturnType<Chess['board']>, color: string): number {
  const opponentColor = color === 'w' ? 'b' : 'w';
  let passed = 0;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq || sq.type !== 'p' || sq.color !== color) continue;

      let isBlocked = false;
      if (color === 'w') {
        for (let rr = r - 1; rr >= 0; rr--) {
          for (let ff = Math.max(0, f - 1); ff <= Math.min(7, f + 1); ff++) {
            const opp = board[rr][ff];
            if (opp && opp.type === 'p' && opp.color === opponentColor) {
              isBlocked = true;
              break;
            }
          }
          if (isBlocked) break;
        }
      } else {
        for (let rr = r + 1; rr < 8; rr++) {
          for (let ff = Math.max(0, f - 1); ff <= Math.min(7, f + 1); ff++) {
            const opp = board[rr][ff];
            if (opp && opp.type === 'p' && opp.color === opponentColor) {
              isBlocked = true;
              break;
            }
          }
          if (isBlocked) break;
        }
      }
      if (!isBlocked) passed++;
    }
  }
  return passed;
}

// ── Main evaluation function ──────────────────────────────────────────────

export function evaluatePosition(chess: Chess): number {
  // Checkmate / stalemate
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -99999 : 99999;
    }
    return 0; // stalemate or draw
  }

  const board = chess.board();
  const endgame = isEndgame(chess);
  let score = 0;

  // Material + piece-square tables
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq) continue;
      const val = PIECE_VALUES[sq.type] ?? 0;
      const pst = getPST(sq.type, sq.color, r, f, endgame);
      const contribution = val + pst;
      score += sq.color === 'w' ? contribution : -contribution;
    }
  }

  // Mobility (count legal moves for each side)
  const currentTurn = chess.turn();
  const currentMoves = chess.moves().length;

  // Switch turns to count opponent mobility
  // We approximate: just use current side's mobility
  score += currentTurn === 'w' ? currentMoves * 0.1 : -currentMoves * 0.1;

  // Pawn structure
  const doubledW = countDoubledPawns(board, 'w');
  const doubledB = countDoubledPawns(board, 'b');
  const isolatedW = countIsolatedPawns(board, 'w');
  const isolatedB = countIsolatedPawns(board, 'b');
  const passedW = countPassedPawns(board, 'w');
  const passedB = countPassedPawns(board, 'b');

  score -= doubledW * 20;
  score += doubledB * 20;
  score -= isolatedW * 15;
  score += isolatedB * 15;
  score += passedW * 30;
  score -= passedB * 30;

  // Check bonus
  if (chess.inCheck()) {
    score += currentTurn === 'b' ? 30 : -30;
  }

  // Bishop pair bonus
  let whiteBishops = 0;
  let blackBishops = 0;
  for (const row of board) {
    for (const sq of row) {
      if (!sq || sq.type !== 'b') continue;
      if (sq.color === 'w') whiteBishops++;
      else blackBishops++;
    }
  }
  if (whiteBishops >= 2) score += 30;
  if (blackBishops >= 2) score -= 30;

  return score;
}