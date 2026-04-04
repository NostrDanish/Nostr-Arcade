import { useEffect, useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';

// ── Constants ─────────────────────────────────────────────
const W = 360, H = 480;
const PADDLE_W = 80, PADDLE_H = 12, PADDLE_Y = H - 50;
const BALL_R = 8;
const BRICK_COLS = 8, BRICK_ROWS = 5;
const BRICK_W = (W - 20) / BRICK_COLS;
const BRICK_H = 20;
const BRICK_PADDING = 3;
const BRICK_TOP = 60;

const ROW_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6'];

function initBricks() {
  return Array.from({ length: BRICK_ROWS }, (_, r) =>
    Array.from({ length: BRICK_COLS }, (_, c) => ({
      x: 10 + c * BRICK_W,
      y: BRICK_TOP + r * (BRICK_H + BRICK_PADDING),
      alive: true,
      color: ROW_COLORS[r],
      points: (BRICK_ROWS - r) * 10,
    }))
  ).flat();
}

type Brick = ReturnType<typeof initBricks>[0];

// ── Component ──────────────────────────────────────────────
interface Props { onGameOver: (score: number) => void; onScoreUpdate: (score: number) => void; }

export function GameBreakout({ onGameOver, onScoreUpdate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    paddleX: W / 2 - PADDLE_W / 2,
    ballX: W / 2, ballY: H / 2,
    vx: 3.5, vy: -3.5,
    bricks: initBricks(),
    score: 0,
    lives: 3,
    phase: 'idle' as 'idle' | 'playing' | 'dead' | 'won',
    lastTouch: 0,
  });
  const rafRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'dead' | 'won'>('idle');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLives, setDisplayLives] = useState(3);

  const restart = useCallback(() => {
    const s = stateRef.current;
    s.paddleX = W / 2 - PADDLE_W / 2;
    s.ballX = W / 2; s.ballY = H / 2;
    s.vx = 3.5; s.vy = -3.5;
    s.bricks = initBricks();
    s.score = 0; s.lives = 3;
    s.phase = 'idle';
    setPhase('idle'); setDisplayScore(0); setDisplayLives(3);
  }, []);

  const startGame = useCallback(() => {
    stateRef.current.phase = 'playing';
    setPhase('playing');
  }, []);

  // Mouse / touch paddle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;

    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - rect.left) * scaleX - PADDLE_W / 2;
      stateRef.current.paddleX = Math.max(0, Math.min(W - PADDLE_W, x));
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const sx = W / r.width;
      const x = (e.touches[0].clientX - r.left) * sx - PADDLE_W / 2;
      stateRef.current.paddleX = Math.max(0, Math.min(W - PADDLE_W, x));
      if (stateRef.current.phase === 'idle') startGame();
    };
    const onClick = () => { if (stateRef.current.phase === 'idle') startGame(); };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('click', onClick);
    return () => {
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [startGame]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const loop = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#05080f';
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(168,85,247,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Bricks
      s.bricks.forEach(b => {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        const bx = b.x + BRICK_PADDING / 2, by = b.y + BRICK_PADDING / 2;
        const bw = BRICK_W - BRICK_PADDING, bh = BRICK_H - BRICK_PADDING;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 3);
        ctx.fill();
        ctx.strokeStyle = b.color + '80';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Paddle
      ctx.fillStyle = '#a855f7';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(s.paddleX, PADDLE_Y, PADDLE_W, PADDLE_H, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ball
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // HUD
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`Score: ${s.score}`, 10, 20);
      ctx.fillStyle = '#00ffff';
      ctx.fillText(`Lives: ${'♥'.repeat(s.lives)}`, W - 90, 20);

      if (s.phase === 'idle') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BREAKOUT', W / 2, H / 2 - 20);
        ctx.fillStyle = '#ffffff80';
        ctx.font = '14px monospace';
        ctx.fillText('Move mouse / touch to start', W / 2, H / 2 + 10);
        ctx.textAlign = 'left';
      }

      if (s.phase === 'dead') {
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
        ctx.fillStyle = '#a855f7';
        ctx.font = '18px monospace';
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 + 14);
        ctx.textAlign = 'left';
      }

      if (s.phase === 'won') {
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('YOU WIN! 🎉', W / 2, H / 2 - 20);
        ctx.fillStyle = '#ffd700';
        ctx.font = '18px monospace';
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 + 14);
        ctx.textAlign = 'left';
      }

      // Physics
      if (s.phase === 'playing') {
        s.ballX += s.vx;
        s.ballY += s.vy;

        // Wall bounce
        if (s.ballX - BALL_R <= 0 || s.ballX + BALL_R >= W) s.vx = -s.vx;
        if (s.ballY - BALL_R <= 0) s.vy = -s.vy;

        // Paddle collision
        if (
          s.ballY + BALL_R >= PADDLE_Y &&
          s.ballY + BALL_R <= PADDLE_Y + PADDLE_H &&
          s.ballX >= s.paddleX - BALL_R &&
          s.ballX <= s.paddleX + PADDLE_W + BALL_R
        ) {
          const relX = (s.ballX - s.paddleX) / PADDLE_W - 0.5;
          const angle = relX * Math.PI * 0.6;
          const speed = Math.hypot(s.vx, s.vy);
          s.vx = speed * Math.sin(angle);
          s.vy = -Math.abs(speed * Math.cos(angle));
        }

        // Ball falls below
        if (s.ballY > H) {
          s.lives--;
          setDisplayLives(s.lives);
          if (s.lives <= 0) {
            s.phase = 'dead';
            setPhase('dead');
            onGameOver(s.score);
          } else {
            s.ballX = s.paddleX + PADDLE_W / 2;
            s.ballY = PADDLE_Y - 20;
            s.vx = (Math.random() > 0.5 ? 1 : -1) * 3.5;
            s.vy = -3.5;
          }
        }

        // Brick collision
        let allDead = true;
        for (const b of s.bricks) {
          if (!b.alive) continue;
          allDead = false;
          const bx = b.x + BRICK_PADDING / 2, by = b.y + BRICK_PADDING / 2;
          const bw = BRICK_W - BRICK_PADDING, bh = BRICK_H - BRICK_PADDING;
          if (
            s.ballX + BALL_R > bx && s.ballX - BALL_R < bx + bw &&
            s.ballY + BALL_R > by && s.ballY - BALL_R < by + bh
          ) {
            b.alive = false;
            s.score += b.points;
            setDisplayScore(s.score);
            onScoreUpdate(s.score);

            // Bounce direction
            const fromLeft = s.ballX < bx;
            const fromRight = s.ballX > bx + bw;
            if (fromLeft || fromRight) s.vx = -s.vx;
            else s.vy = -s.vy;
            break;
          }
        }
        if (allDead) {
          s.phase = 'won';
          setPhase('won');
          onGameOver(s.score);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [onGameOver, onScoreUpdate]);

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="flex gap-3 items-center w-full max-w-xs">
        <div className="flex-1 bg-zinc-800 rounded-lg p-1.5 text-center border border-purple-500/30">
          <div className="text-[10px] text-zinc-500 uppercase">Score</div>
          <div className="text-base font-bold text-purple-400">{displayScore}</div>
        </div>
        <div className="flex-1 bg-zinc-800 rounded-lg p-1.5 text-center border border-red-500/30">
          <div className="text-[10px] text-zinc-500 uppercase">Lives</div>
          <div className="text-base font-bold text-red-400">{'♥'.repeat(displayLives)}</div>
        </div>
        <Button variant="outline" size="sm" onClick={restart} className="border-purple-500/50 text-purple-300 hover:bg-purple-900/30 px-2">↺</Button>
      </div>

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="rounded-xl border border-purple-500/30 cursor-none touch-none"
        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
      />

      {(phase === 'dead' || phase === 'won') && (
        <Button onClick={restart} className="bg-purple-600 hover:bg-purple-500 text-white">
          {phase === 'won' ? 'Play Again' : 'Try Again'}
        </Button>
      )}
      <div className="text-xs text-zinc-600 text-center">Move mouse or touch to control paddle</div>
    </div>
  );
}
