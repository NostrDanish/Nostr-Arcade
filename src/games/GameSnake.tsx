import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────
const GRID = 20;
const CELL = 22; // px
const INITIAL_SPEED = 150; // ms per tick

type Pos = { x: number; y: number };
type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

function randomFood(snake: Pos[]): Pos {
  let pos: Pos;
  do {
    pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function initState() {
  const snake: Pos[] = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  return { snake, food: randomFood(snake), dir: 'RIGHT' as Dir, pendingDir: 'RIGHT' as Dir, score: 0 };
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────
interface Props {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

export function GameSnake({ onGameOver, onScoreUpdate }: Props) {
  const [gameState, setGameState] = useState(initState);
  const [running, setRunning] = useState(false);
  const [dead, setDead] = useState(false);
  const stateRef = useRef(gameState);
  stateRef.current = gameState;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const tick = useCallback(() => {
    setGameState(prev => {
      const { snake, food, pendingDir, score } = prev;
      const dir = pendingDir;

      const head = snake[0];
      let nx = head.x;
      let ny = head.y;
      if (dir === 'UP') ny -= 1;
      else if (dir === 'DOWN') ny += 1;
      else if (dir === 'LEFT') nx -= 1;
      else nx += 1;

      // Wall collision
      if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
        setRunning(false);
        setDead(true);
        onGameOver(score);
        return prev;
      }

      // Self collision
      if (snake.some(s => s.x === nx && s.y === ny)) {
        setRunning(false);
        setDead(true);
        onGameOver(score);
        return prev;
      }

      const ate = nx === food.x && ny === food.y;
      const newSnake = [{ x: nx, y: ny }, ...snake];
      if (!ate) newSnake.pop();

      const newScore = ate ? score + 10 : score;
      if (ate) onScoreUpdate(newScore);

      return {
        snake: newSnake,
        food: ate ? randomFood(newSnake) : food,
        dir,
        pendingDir: dir,
        score: newScore,
      };
    });
  }, [onGameOver, onScoreUpdate]);

  // Game loop
  useEffect(() => {
    if (!running) return;
    const speed = Math.max(60, INITIAL_SPEED - Math.floor(stateRef.current.score / 50) * 5);
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [running, tick, gameState.score]);

  // Direction input
  const setDir = useCallback((newDir: Dir) => {
    const opposites: Record<Dir, Dir> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    setGameState(prev => {
      if (opposites[newDir] === prev.dir) return prev;
      return { ...prev, pendingDir: newDir };
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
        w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); setDir(dir); if (!running && !dead) setRunning(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setDir, running, dead]);

  const restart = useCallback(() => {
    setGameState(initState());
    setDead(false);
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    if (dead) restart();
    setRunning(true);
  }, [dead, restart]);

  // Touch
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 'RIGHT' : 'LEFT');
    else setDir(dy > 0 ? 'DOWN' : 'UP');
    if (!running && !dead) setRunning(true);
  };

  const { snake, food, score } = gameState;
  const boardPx = GRID * CELL;

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Score */}
      <div className="flex gap-4 w-full max-w-xs items-center">
        <div className="flex-1 bg-zinc-800 rounded-lg p-2 text-center border border-green-500/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest">Score</div>
          <div className="text-xl font-bold text-green-400 neon-glow-green">{score}</div>
        </div>
        <div className="text-xs text-zinc-500">Len: {snake.length}</div>
        <Button variant="outline" onClick={restart} className="border-green-500/50 text-green-300 hover:bg-green-900/30">
          Reset
        </Button>
      </div>

      {/* Board */}
      <div
        className="relative border border-green-500/40 rounded-lg overflow-hidden cursor-pointer neon-border-green"
        style={{ width: boardPx, height: boardPx }}
        onClick={() => { if (!running) start(); }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Grid background */}
        <div className="absolute inset-0 bg-zinc-950"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)',
            backgroundSize: `${CELL}px ${CELL}px`,
          }}
        />

        {/* Food */}
        <div
          className="absolute rounded-full bg-red-500 float-anim"
          style={{
            width: CELL - 4, height: CELL - 4,
            left: food.x * CELL + 2, top: food.y * CELL + 2,
            boxShadow: '0 0 8px #ef4444, 0 0 16px #ef4444',
          }}
        />

        {/* Snake */}
        {snake.map((seg, i) => (
          <div
            key={i}
            className={cn('absolute rounded-sm transition-all duration-75', i === 0 ? 'bg-green-400' : 'bg-green-600')}
            style={{
              width: CELL - 2, height: CELL - 2,
              left: seg.x * CELL + 1, top: seg.y * CELL + 1,
              boxShadow: i === 0 ? '0 0 8px #00ff88' : undefined,
              opacity: 1 - i * 0.015,
            }}
          />
        ))}

        {/* Overlays */}
        {!running && !dead && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-3">
            <div className="text-2xl font-bold text-green-400 neon-glow-green pixel-font">NOSTR SNAKE</div>
            <div className="text-sm text-zinc-400">Press any arrow key or tap to start</div>
            <Button onClick={start} className="bg-green-600 hover:bg-green-500 text-white">
              Start Game
            </Button>
          </div>
        )}
        {dead && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm gap-3">
            <div className="text-2xl font-bold text-red-400">DEAD</div>
            <div className="text-lg text-zinc-300">Score: {score}</div>
            <Button onClick={start} className="bg-green-600 hover:bg-green-500 text-white">
              Play Again
            </Button>
          </div>
        )}
      </div>

      {/* D-pad for mobile */}
      <div className="grid grid-cols-3 gap-1 md:hidden">
        <div />
        <Button size="sm" variant="outline" className="border-green-500/40 text-green-300" onClick={() => setDir('UP')}>▲</Button>
        <div />
        <Button size="sm" variant="outline" className="border-green-500/40 text-green-300" onClick={() => setDir('LEFT')}>◀</Button>
        <Button size="sm" variant="outline" className="border-green-500/40 text-green-300" onClick={() => setDir('DOWN')}>▼</Button>
        <Button size="sm" variant="outline" className="border-green-500/40 text-green-300" onClick={() => setDir('RIGHT')}>▶</Button>
      </div>
    </div>
  );
}
