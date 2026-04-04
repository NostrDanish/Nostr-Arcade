import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ────────────────────────────────────────────────────────────
// Pure game logic
// ────────────────────────────────────────────────────────────
type Board = number[][];

function emptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function addRandomTile(board: Board): Board {
  const empties: [number, number][] = [];
  board.forEach((row, r) => row.forEach((v, c) => { if (v === 0) empties.push([r, c]); }));
  if (!empties.length) return board;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const next = board.map(row => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function slideLeft(row: number[]): { row: number[]; score: number } {
  const filtered = row.filter(v => v !== 0);
  let score = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(0);
  return { row: merged, score };
}

function rotate90(board: Board): Board {
  const n = board.length;
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => board[n - 1 - c][r])
  );
}

function move(board: Board, dir: 'left' | 'right' | 'up' | 'down'): { board: Board; score: number; moved: boolean } {
  let b = board.map(r => [...r]);
  let totalScore = 0;

  if (dir === 'right') b = rotate90(rotate90(b));
  else if (dir === 'up') b = rotate90(rotate90(rotate90(b)));
  else if (dir === 'down') b = rotate90(b);

  const newRows = b.map(row => slideLeft(row));
  const newBoard = newRows.map(r => r.row);
  newRows.forEach(r => { totalScore += r.score; });

  if (dir === 'right') {
    const r2 = rotate90(rotate90(newBoard));
    const moved = r2.some((row, ri) => row.some((v, ci) => v !== board[ri][ci]));
    return { board: r2, score: totalScore, moved };
  } else if (dir === 'up') {
    const r2 = rotate90(newBoard);
    const moved = r2.some((row, ri) => row.some((v, ci) => v !== board[ri][ci]));
    return { board: r2, score: totalScore, moved };
  } else if (dir === 'down') {
    const r2 = rotate90(rotate90(rotate90(newBoard)));
    const moved = r2.some((row, ri) => row.some((v, ci) => v !== board[ri][ci]));
    return { board: r2, score: totalScore, moved };
  }

  const moved = newBoard.some((row, ri) => row.some((v, ci) => v !== board[ri][ci]));
  return { board: newBoard, score: totalScore, moved };
}

function hasMovesLeft(board: Board): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return true;
      if (c < 3 && board[r][c] === board[r][c + 1]) return true;
      if (r < 3 && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

function initGame(): { board: Board; score: number } {
  let b = emptyBoard();
  b = addRandomTile(b);
  b = addRandomTile(b);
  return { board: b, score: 0 };
}

// ────────────────────────────────────────────────────────────
// Tile colour map
// ────────────────────────────────────────────────────────────
const TILE_STYLES: Record<number, string> = {
  0: 'bg-zinc-800/60 text-transparent',
  2: 'bg-zinc-700 text-zinc-100',
  4: 'bg-zinc-600 text-zinc-100',
  8: 'bg-orange-600 text-white',
  16: 'bg-orange-500 text-white',
  32: 'bg-orange-400 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-yellow-400 text-zinc-900',
  256: 'bg-yellow-300 text-zinc-900',
  512: 'bg-purple-500 text-white',
  1024: 'bg-purple-400 text-white',
  2048: 'bg-cyan-400 text-zinc-900',
};

function tileStyle(val: number): string {
  return TILE_STYLES[val] ?? 'bg-pink-500 text-white';
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────
interface Props {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

export function Game2048({ onGameOver, onScoreUpdate }: Props) {
  const [{ board, score }, setState] = useState(initGame);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleMove = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;
    setState(prev => {
      const { board: newBoard, score: gained, moved } = move(prev.board, dir);
      if (!moved) return prev;

      const withTile = addRandomTile(newBoard);
      const newScore = prev.score + gained;
      onScoreUpdate(newScore);

      const isWon = withTile.some(row => row.some(v => v === 2048));
      if (isWon) setWon(true);

      if (!hasMovesLeft(withTile)) {
        setGameOver(true);
        onGameOver(newScore);
      }

      return { board: withTile, score: newScore };
    });
  }, [gameOver, onGameOver, onScoreUpdate]);

  const restart = useCallback(() => {
    setState(initGame());
    setGameOver(false);
    setWon(false);
  }, []);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, 'left' | 'right' | 'up' | 'down'> = {
        ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down',
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); handleMove(dir); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleMove]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 'right' : 'left');
    else handleMove(dy > 0 ? 'down' : 'up');
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Score */}
      <div className="flex gap-4 w-full max-w-xs">
        <div className="flex-1 bg-zinc-800 rounded-lg p-2 text-center border border-purple-500/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest">Score</div>
          <div className="text-xl font-bold text-purple-400 neon-glow-purple">{score}</div>
        </div>
        <Button variant="outline" onClick={restart} className="border-purple-500/50 text-purple-300 hover:bg-purple-900/30">
          New Game
        </Button>
      </div>

      {/* Board */}
      <div
        className="relative p-2 rounded-xl bg-zinc-900 border border-purple-500/30 neon-border-purple"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="grid grid-cols-4 gap-2">
          {board.flat().map((val, i) => (
            <div
              key={i}
              className={cn(
                'w-16 h-16 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-100',
                tileStyle(val),
              )}
            >
              {val > 0 ? val : ''}
            </div>
          ))}
        </div>

        {/* Game Over overlay */}
        {(gameOver || won) && (
          <div className="absolute inset-0 rounded-xl bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className={cn('text-3xl font-bold', won ? 'text-cyan-400 neon-glow-cyan' : 'text-red-400')}>
              {won ? '🎉 You Win!' : 'GAME OVER'}
            </div>
            <div className="text-xl text-purple-300">Score: {score}</div>
            <Button onClick={restart} className="bg-purple-600 hover:bg-purple-500 text-white">
              Play Again
            </Button>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="text-xs text-zinc-600 text-center">
        Arrow keys / WASD / Swipe to move tiles
      </div>
    </div>
  );
}
