import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

// ────────────────────────────────────────────────────────────
// Physics constants
// ────────────────────────────────────────────────────────────
const W = 360;
const H = 480;
const BIRD_X = 80;
const BIRD_R = 16;
const GRAVITY = 0.45;
const FLAP_V = -8;
const PIPE_W = 52;
const PIPE_GAP = 130;
const PIPE_SPEED = 2.6;
const PIPE_INTERVAL = 1600; // ms

type Pipe = { x: number; gapY: number; passed: boolean };

interface GameState {
  birdY: number;
  velY: number;
  pipes: Pipe[];
  score: number;
  phase: 'idle' | 'playing' | 'dead';
  lives: number;
}

function initState(): GameState {
  return {
    birdY: H / 2,
    velY: 0,
    pipes: [],
    score: 0,
    phase: 'idle',
    lives: 1,
  };
}

function randomGapY(): number {
  const minY = PIPE_GAP / 2 + 40;
  const maxY = H - PIPE_GAP / 2 - 80;
  return Math.floor(Math.random() * (maxY - minY)) + minY;
}

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────
interface Props {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  canZap?: boolean;
  onZapRevive?: () => void;
}

export function GameFlappy({ onGameOver, onScoreUpdate, canZap = false, onZapRevive }: Props) {
  const [state, setState] = useState<GameState>(initState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const lastPipeTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const flap = useCallback(() => {
    setState(prev => {
      if (prev.phase === 'idle') return { ...prev, phase: 'playing', velY: FLAP_V };
      if (prev.phase === 'playing') return { ...prev, velY: FLAP_V };
      return prev;
    });
  }, []);

  const restart = useCallback(() => {
    lastPipeTimeRef.current = 0;
    lastTimeRef.current = 0;
    setState(initState());
  }, []);

  const handleZapRevive = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'playing',
      birdY: H / 2,
      velY: FLAP_V,
      lives: prev.lives + 1,
    }));
    onZapRevive?.();
  }, [onZapRevive]);

  // Game loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      const current = stateRef.current;
      if (current.phase !== 'playing') {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const dt = lastTimeRef.current ? Math.min(timestamp - lastTimeRef.current, 50) : 16;
      lastTimeRef.current = timestamp;
      const steps = dt / 16;

      setState(prev => {
        if (prev.phase !== 'playing') return prev;

        // Physics
        const newVel = prev.velY + GRAVITY * steps;
        const newY = prev.birdY + newVel * steps;

        // Floor / ceiling
        if (newY + BIRD_R >= H - 40 || newY - BIRD_R <= 0) {
          onGameOver(prev.score);
          return { ...prev, phase: 'dead', velY: newVel, birdY: newY };
        }

        // Pipes
        let pipes = prev.pipes.map(p => ({ ...p, x: p.x - PIPE_SPEED * steps }));

        // Add new pipe
        if (timestamp - lastPipeTimeRef.current > PIPE_INTERVAL) {
          pipes.push({ x: W + PIPE_W, gapY: randomGapY(), passed: false });
          lastPipeTimeRef.current = timestamp;
        }

        // Remove off-screen
        pipes = pipes.filter(p => p.x + PIPE_W > -10);

        // Score & collision
        let score = prev.score;
        for (const pipe of pipes) {
          // Score
          if (!pipe.passed && pipe.x + PIPE_W < BIRD_X) {
            pipe.passed = true;
            score++;
            onScoreUpdate(score);
          }

          // Collision (AABB vs circle-ish)
          const topH = pipe.gapY - PIPE_GAP / 2;
          const botY = pipe.gapY + PIPE_GAP / 2;
          const inX = BIRD_X + BIRD_R > pipe.x && BIRD_X - BIRD_R < pipe.x + PIPE_W;
          if (inX) {
            if (newY - BIRD_R < topH || newY + BIRD_R > botY) {
              onGameOver(score);
              return { ...prev, phase: 'dead', pipes, score, velY: newVel, birdY: newY };
            }
          }
        }

        return { ...prev, birdY: newY, velY: newVel, pipes, score };
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [onGameOver, onScoreUpdate]);

  // Input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w') { e.preventDefault(); flap(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap]);

  const { birdY, velY, pipes, score, phase } = state;
  const birdRot = Math.max(-30, Math.min(70, velY * 5));

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Score display */}
      <div className="flex gap-4 w-full max-w-xs items-center">
        <div className="flex-1 bg-zinc-800 rounded-lg p-2 text-center border border-yellow-500/30">
          <div className="text-xs text-zinc-400 uppercase tracking-widest">Score</div>
          <div className="text-xl font-bold text-yellow-400 neon-glow-yellow">{score}</div>
        </div>
        <Button variant="outline" onClick={restart} className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-900/30">
          Reset
        </Button>
      </div>

      {/* Canvas */}
      <div
        className="relative overflow-hidden rounded-xl border border-yellow-500/30 cursor-pointer"
        style={{ width: W, height: H, maxWidth: '100%', background: 'linear-gradient(180deg, #0c1222 0%, #0f2233 60%, #1a3a1a 100%)' }}
        onClick={flap}
        onTouchStart={(e) => { e.preventDefault(); flap(); }}
      >
        {/* Scrolling background stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-50"
              style={{ left: `${(i * 17 + 5) % 100}%`, top: `${(i * 13 + 7) % 70}%` }}
            />
          ))}
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-green-900 to-green-800 border-t border-green-600/50" />

        {/* Pipes */}
        {pipes.map((pipe, i) => {
          const topH = pipe.gapY - PIPE_GAP / 2;
          const botH = H - (pipe.gapY + PIPE_GAP / 2) - 40;
          return (
            <g key={i}>
              {/* Top pipe */}
              <div
                className="absolute bg-gradient-to-r from-green-700 to-green-600 border border-green-500/50"
                style={{
                  left: pipe.x, top: 0, width: PIPE_W, height: topH,
                  boxShadow: '0 0 10px rgba(74,222,128,0.3)',
                }}
              >
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-green-500/80 border border-green-400/50 -mx-1 rounded-b-sm" />
              </div>
              {/* Bottom pipe */}
              <div
                className="absolute bg-gradient-to-r from-green-700 to-green-600 border border-green-500/50"
                style={{
                  left: pipe.x, bottom: 40, width: PIPE_W, height: botH,
                  boxShadow: '0 0 10px rgba(74,222,128,0.3)',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-6 bg-green-500/80 border border-green-400/50 -mx-1 rounded-t-sm" />
              </div>
            </g>
          );
        })}

        {/* Bird */}
        <div
          className="absolute flex items-center justify-center font-bold text-lg"
          style={{
            left: BIRD_X - BIRD_R,
            top: birdY - BIRD_R,
            width: BIRD_R * 2,
            height: BIRD_R * 2,
            transform: `rotate(${birdRot}deg)`,
            transition: phase === 'playing' ? 'none' : 'transform 0.1s',
            fontSize: 28,
          }}
        >
          ₿
        </div>
        {/* Bird glow */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: BIRD_X - BIRD_R - 4,
            top: birdY - BIRD_R - 4,
            width: BIRD_R * 2 + 8,
            height: BIRD_R * 2 + 8,
            boxShadow: '0 0 12px #f59e0b, 0 0 24px #f59e0b40',
          }}
        />

        {/* Score mid-screen */}
        {phase === 'playing' && (
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <div className="text-3xl font-bold text-white drop-shadow-lg neon-glow-yellow opacity-80">{score}</div>
          </div>
        )}

        {/* Idle overlay */}
        {phase === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm gap-3">
            <div className="text-3xl font-bold text-yellow-400 neon-glow-yellow pixel-font">NOSTR BIRD</div>
            <div className="text-sm text-zinc-300">Tap / Space to flap</div>
            <div className="text-4xl float-anim">₿</div>
            <Button onClick={flap} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
              Flap!
            </Button>
          </div>
        )}

        {/* Dead overlay */}
        {phase === 'dead' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-3">
            <div className="text-2xl font-bold text-red-400">REKT</div>
            <div className="text-xl text-yellow-300">Score: {score}</div>
            {canZap && (
              <Button
                onClick={handleZapRevive}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Zap to Continue (21 sats)
              </Button>
            )}
            <Button onClick={restart} variant="outline" className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-900/30">
              Try Again
            </Button>
          </div>
        )}
      </div>

      <div className="text-xs text-zinc-600 text-center">Space / Tap to flap • Don't hit the pipes</div>
    </div>
  );
}
