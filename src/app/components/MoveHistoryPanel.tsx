'use client';

import React, { useRef, useEffect } from 'react';

interface MoveRecord {
  san: string;
  from: string;
  to: string;
  color: string;
  captured?: string;
  piece: string;
  flags: string;
}

interface MoveHistoryPanelProps {
  moveHistory: MoveRecord[];
}

export function MoveHistoryPanel({ moveHistory }: MoveHistoryPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory.length]);

  // Group into pairs (white + black per row)
  const pairs: Array<{ moveNum: number; white?: MoveRecord; black?: MoveRecord }> = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairs.push({
      moveNum: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1],
    });
  }

  const lastIdx = moveHistory.length - 1;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
          Move History
        </span>
        <span className="text-xs font-mono-nums" style={{ color: 'var(--muted-foreground)' }}>
          {moveHistory.length} {moveHistory.length === 1 ? 'ply' : 'plies'}
        </span>
      </div>

      {pairs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
          <span className="text-3xl opacity-30">♟</span>
          <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            No moves yet
          </span>
          <span className="text-xs text-center" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
            Make your first move to start recording
          </span>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-chess"
          style={{ maxHeight: '240px', minHeight: '80px' }}
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-1 pr-2 text-xs font-medium" style={{ color: 'var(--muted-foreground)', width: '28px' }}>
                  #
                </th>
                <th className="text-left py-1 pr-2 text-xs font-medium" style={{ color: 'var(--muted-foreground)', width: '50%' }}>
                  White
                </th>
                <th className="text-left py-1 text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Black
                </th>
              </tr>
            </thead>
            <tbody>
              {pairs.map(({ moveNum, white, black }) => {
                const whiteIdx = (moveNum - 1) * 2;
                const blackIdx = whiteIdx + 1;
                const isWhiteLatest = whiteIdx === lastIdx;
                const isBlackLatest = blackIdx === lastIdx;

                return (
                  <tr
                    key={`move-pair-${moveNum}`}
                    style={{
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <td
                      className="py-1.5 pr-2 font-mono-nums text-xs"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {moveNum}.
                    </td>
                    <td className="py-1.5 pr-2">
                      {white && (
                        <span
                          className="font-mono text-sm px-1.5 py-0.5 rounded"
                          style={{
                            color: isWhiteLatest ? 'var(--primary-foreground)' : 'var(--foreground)',
                            background: isWhiteLatest ? 'var(--primary)' : 'transparent',
                            fontWeight: isWhiteLatest ? 600 : 400,
                          }}
                        >
                          {white.san}
                        </span>
                      )}
                    </td>
                    <td className="py-1.5">
                      {black && (
                        <span
                          className="font-mono text-sm px-1.5 py-0.5 rounded"
                          style={{
                            color: isBlackLatest ? 'var(--primary-foreground)' : 'var(--foreground)',
                            background: isBlackLatest ? 'var(--primary)' : 'transparent',
                            fontWeight: isBlackLatest ? 600 : 400,
                          }}
                        >
                          {black.san}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}