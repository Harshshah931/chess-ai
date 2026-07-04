'use client';

import dynamic from 'next/dynamic';

const ChessGameBoard = dynamic(() => import('./components/ChessGameBoard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}
        />
        <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
          Loading Chess AI…
        </p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return <ChessGameBoard />;
}