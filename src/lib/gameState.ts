import { Chess } from 'chess.js';

export interface MoveRecord {
  san: string;
  from: string;
  to: string;
  color: string;
  captured?: string;
  piece: string;
  flags: string;
}

export interface GameState {
  fen: string;
  moveHistory: MoveRecord[];
  capturedByWhite: string[]; // pieces white has captured (black pieces)
  capturedByBlack: string[]; // pieces black has captured (white pieces)
  isGameOver: boolean;
  gameResult: string | null;
  isCheck: boolean;
  turn: string; // 'w' | 'b'
}

export function createInitialGameState(): GameState {
  const chess = new Chess();
  return {
    fen: chess.fen(),
    moveHistory: [],
    capturedByWhite: [],
    capturedByBlack: [],
    isGameOver: false,
    gameResult: null,
    isCheck: false,
    turn: 'w',
  };
}