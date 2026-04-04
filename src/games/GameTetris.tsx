import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────
type Board = (string | null)[][];
type Piece = { shape: number[][]; color: string; x: number; y: number };

// ── Tetrominoes ────────────────────────────────────────────
const PIECES = [
  { shape: [[1,1,1,1]], color: '#00ffff' },                        // I
  { shape: [[1,1],[1,1]], color: '#ffd700' },                       // O
  { shape: [[0,1,0],[1,1,1]], color: '#a855f7' },                   // T
  { shape: [[1,0,0],[1,1,1]], color: '#f97316' },                   // L
  { shape: [[0,0,1],[1,1,1]], color: '#3b82f6' },                   // J
  { shape: [[0,1,1],[1,1,0]], color: '#22c55e' },                   // S
  { shape: [[1,1,0],[0,1,1]], color: '#ef4444' },                   // Z
];

const COLS = 10;
const ROWS = 20;
const CELL = 28; // px on desktop, scales on mobile

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomPiece(): Piece {
  const t = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { ...t, x: Math.floor(COLS / 2) - Math.floor(t.shape[0].length / 2), y: 0 };
}

function rotate(shape: number[][]): number[][] {
  const rows = shape.length, cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
}

function validPosition(board: Board, piece: Piece, dx = 0, dy = 0, shape?: number[][]): boolean {
  const s = shape ?? piece.shape;
  for (let r = 0; r < s.length; r++) {
    for (let c = 0; c < s[r].length; c++) {
      if (!s[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
      if (ny >= 0 && board[ny][nx]) return false;
    }
  }
  return true;
}

function placePiece(board: Board, piece: Piece): { board: Board; lines: number } {
  const next = board.map(r => [...r]) as Board;
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const ny = piece.y + r;
      const nx = piece.x + c;
      if (ny >= 0) next[ny][nx] = piece.color;
    }
  }
  // Clear full lines
  const cleared = next.filter(row => row.some(c => !c));
  const lines = ROWS - cleared.length;
  const empty = Array.from({ length: lines }, () => Array(COLS).fill(null));
  return { board: [...empty, ...cleared] as Board, lines };
}

const SCORE_TABLE = [0, 100, 300, 500, 800];
const DROP_INTERVAL = (level: number) => Math.max(100, 800 - level * 70);

// ── Component ──────────────────────────────────────────────
interface Props { onGameOver: (score: number) => void; onScoreUpdate: (score: number) => void; }

export function GameTetris({ onGameOver, onScoreUpdate }: Props) {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [piece, setPiece] = useState<Piece>(() => randomPiece());
  const [nextPiece, setNextPiece] = useState<Piece>(() => randomPiece());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [running, setRunning] = useState(false);
  const [dead, setDead] = useState(false);

  const boardRef = useRef(board);
  const pieceRef = useRef(piece);
  boardRef.current = board;
  pieceRef.current = piece;

  const lockPiece = useCallback(() => {
    const { board: newBoard, lines: cleared } = placePiece(boardRef.current, pieceRef.current);
    const newScore = (prev: number) => {
      const gained = SCORE_TABLE[cleared] ?? 0;
      const updated = prev + gained * level;
      onScoreUpdate(updated);
      return updated;
    };
    setScore(newScore);
    setLines(l => {
      const nl = l + cleared;
      setLevel(Math.floor(nl / 10) + 1);
      return nl;
    });
    setBoard(newBoard);

    // Spawn next
    const spawn = nextPiece;
    if (!validPosition(newBoard, spawn)) {
      setRunning(false);
      setDead(true);
      setScore(s => { onGameOver(s); return s; });
    } else {
      setPiece(spawn);
      setNextPiece(randomPiece());
    }
  }, [level, nextPiece, onGameOver, onScoreUpdate]);

  // Auto drop
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const p = pieceRef.current;
      if (validPosition(boardRef.current, p, 0, 1)) {
        setPiece(prev => ({ ...prev, y: prev.y + 1 }));
      } else {
        lockPiece();
      }
    }, DROP_INTERVAL(level));
    return () => clearInterval(id);
  }, [running, level, lockPiece]);

  const moveLeft = useCallback(() => {
    setPiece(p => validPosition(boardRef.current, p, -1, 0) ? { ...p, x: p.x - 1 } : p);
  }, []);
  const moveRight = useCallback(() => {
    setPiece(p => validPosition(boardRef.current, p, 1, 0) ? { ...p, x: p.x + 1 } : p);
  }, []);
  const moveDown = useCallback(() => {
    setPiece(p => {
      if (validPosition(boardRef.current, p, 0, 1)) return { ...p, y: p.y + 1 };
      lockPiece(); return p;
    });
  }, [lockPiece]);
  const rotatePiece = useCallback(() => {
    setPiece(p => {
      const rotated = rotate(p.shape);
      if (validPosition(boardRef.current, p, 0, 0, rotated)) return { ...p, shape: rotated };
      // wall kick
      if (validPosition(boardRef.current, p, 1, 0, rotated)) return { ...p, shape: rotated, x: p.x + 1 };
      if (validPosition(boardRef.current, p, -1, 0, rotated)) return { ...p, shape: rotated, x: p.x - 1 };
      return p;
    });
  }, []);
  const hardDrop = useCallback(() => {
    setPiece(p => {
      let dy = 0;
      while (validPosition(boardRef.current, p, 0, dy + 1)) dy++;
      const dropped = { ...p, y: p.y + dy };
      pieceRef.current = dropped;
      lockPiece();
      return dropped;
    });
  }, [lockPiece]);

  const restart = useCallback(() => {
    setBoard(emptyBoard());
    setPiece(randomPiece());
    setNextPiece(randomPiece());
    setScore(0); setLines(0); setLevel(1);
    setDead(false); setRunning(false);
  }, []);

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!running && !dead && e.key !== 'Enter') return;
      const map: Record<string, () => void> = {
        ArrowLeft: moveLeft, a: moveLeft,
        ArrowRight: moveRight, d: moveRight,
        ArrowDown: moveDown, s: moveDown,
        ArrowUp: rotatePiece, w: rotatePiece,
        ' ': hardDrop,
        Enter: () => { if (!running && !dead) setRunning(true); },
      };
      const fn = map[e.key];
      if (fn) { e.preventDefault(); fn(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [running, dead, moveLeft, moveRight, moveDown, rotatePiece, hardDrop]);

  // Build render board (with ghost + current piece)
  const ghost = (() => {
    let dy = 0;
    while (validPosition(board, piece, 0, dy + 1)) dy++;
    return { ...piece, y: piece.y + dy };
  })();

  const renderBoard = board.map(r => [...r]);
  // ghost
  ghost.shape.forEach((row, r) => row.forEach((v, c) => {
    if (!v) return;
    const ny = ghost.y + r, nx = ghost.x + c;
    if (ny >= 0 && ny < ROWS && !renderBoard[ny][nx]) renderBoard[ny][nx] = 'ghost';
  }));
  // active piece
  piece.shape.forEach((row, r) => row.forEach((v, c) => {
    if (!v) return;
    const ny = piece.y + r, nx = piece.x + c;
    if (ny >= 0 && ny < ROWS) renderBoard[ny][nx] = piece.color;
  }));

  // Next piece preview (4x4 grid)
  const previewGrid = Array.from({ length: 4 }, (_, r) =>
    Array.from({ length: 4 }, (_, c) => {
      const pr = r - Math.floor((4 - nextPiece.shape.length) / 2);
      const pc = c - Math.floor((4 - nextPiece.shape[0].length) / 2);
      if (pr >= 0 && pr < nextPiece.shape.length && pc >= 0 && pc < nextPiece.shape[0].length)
        return nextPiece.shape[pr][pc] ? nextPiece.color : null;
      return null;
    })
  );

  return (
    <div className="flex flex-col items-center gap-3 select-none w-full">
      {/* Stats row */}
      <div className="flex gap-2 w-full max-w-xs">
        {[['Score', score, 'text-cyan-400'], ['Lines', lines, 'text-green-400'], ['Lvl', level, 'text-purple-400']].map(([label, val, cls]) => (
          <div key={String(label)} className="flex-1 bg-zinc-800 rounded-lg p-1.5 text-center border border-zinc-700/50">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{label}</div>
            <div className={`text-base font-bold ${cls}`}>{val}</div>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={restart} className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/30 px-2">↺</Button>
      </div>

      <div className="flex gap-3 items-start">
        {/* Board */}
        <div className="relative border border-cyan-500/30 rounded-lg overflow-hidden neon-border-cyan"
          style={{ width: COLS * CELL, minHeight: ROWS * CELL, background: '#050a10' }}>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, ${CELL}px)` }}>
            {renderBoard.flat().map((color, i) => (
              <div key={i} className="border border-zinc-900/30 transition-none"
                style={{
                  width: CELL, height: CELL,
                  backgroundColor: color === 'ghost' ? 'rgba(255,255,255,0.07)' : color ?? '#0a0f18',
                  boxShadow: color && color !== 'ghost' ? `inset 0 0 6px rgba(0,0,0,0.4), 0 0 4px ${color}40` : undefined,
                  borderColor: color && color !== 'ghost' ? `${color}30` : undefined,
                }} />
            ))}
          </div>

          {/* Overlays */}
          {!running && !dead && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 gap-3">
              <div className="text-2xl font-bold text-cyan-400 neon-glow-cyan pixel-font">TETRIS</div>
              <div className="text-xs text-zinc-400">Arrows/WASD + Space to hard drop</div>
              <Button onClick={() => setRunning(true)} className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold">Play</Button>
            </div>
          )}
          {dead && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
              <div className="text-2xl font-bold text-red-400">GAME OVER</div>
              <div className="text-lg text-cyan-300">{score.toLocaleString()}</div>
              <Button onClick={restart} className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold">Try Again</Button>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-2">
          <div className="bg-zinc-900 border border-zinc-700/50 rounded-lg p-2 text-xs text-zinc-400">
            <div className="mb-1 font-semibold text-zinc-300">NEXT</div>
            <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(4, 14px)' }}>
              {previewGrid.flat().map((color, i) => (
                <div key={i} style={{ width: 14, height: 14, backgroundColor: color ?? 'transparent', borderRadius: 2 }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile D-pad */}
      <div className="grid grid-cols-3 gap-2 mt-1 md:hidden">
        <div />
        <Button size="sm" className="bg-zinc-800 border border-zinc-700 text-white h-12 w-12 text-xl" onClick={rotatePiece}>↻</Button>
        <div />
        <Button size="sm" className="bg-zinc-800 border border-zinc-700 text-white h-12 w-12 text-xl" onClick={moveLeft}>◀</Button>
        <Button size="sm" className="bg-zinc-800 border border-zinc-700 text-white h-12 w-12 text-xl" onClick={moveDown}>▼</Button>
        <Button size="sm" className="bg-zinc-800 border border-zinc-700 text-white h-12 w-12 text-xl" onClick={moveRight}>▶</Button>
        <div />
        <Button size="sm" className="bg-cyan-800 border border-cyan-600 text-white h-12 w-12 text-xs col-span-1" onClick={hardDrop}>DROP</Button>
        <div />
      </div>
    </div>
  );
}
