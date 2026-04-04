import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Config ─────────────────────────────────────────────────
const EMOJIS = ['₿', '⚡', '🔑', '🛡️', '🌐', '🔒', '🕹️', '👾', '🚀', '💎', '🦊', '🤖'];

function makeCards(count: number) {
  const pool = EMOJIS.slice(0, count / 2);
  const pairs = [...pool, ...pool];
  // Fisher-Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

type Card = ReturnType<typeof makeCards>[0];

const LEVELS = [
  { name: 'Easy', pairs: 6, cols: 4 },
  { name: 'Medium', pairs: 8, cols: 4 },
  { name: 'Hard', pairs: 12, cols: 6 },
];

// ── Component ──────────────────────────────────────────────
interface Props { onGameOver: (score: number) => void; onScoreUpdate: (score: number) => void; }

export function GameMemory({ onGameOver, onScoreUpdate }: Props) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [cards, setCards] = useState<Card[]>(() => makeCards(LEVELS[0].pairs * 2));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);
  const [startTime] = useState(Date.now());

  const level = LEVELS[levelIdx];

  const restart = useCallback((li?: number) => {
    const idx = li ?? levelIdx;
    setCards(makeCards(LEVELS[idx].pairs * 2));
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setScore(0);
    setLocked(false);
    setWon(false);
    setLevelIdx(idx);
  }, [levelIdx]);

  const flipCard = useCallback((id: number) => {
    if (locked || won) return;
    setCards(prev => {
      const card = prev.find(c => c.id === id);
      if (!card || card.flipped || card.matched) return prev;
      return prev.map(c => c.id === id ? { ...c, flipped: true } : c);
    });
    setFlipped(prev => {
      if (prev.length === 1 && prev[0] !== id) return [...prev, id];
      if (prev.length === 0) return [id];
      return prev;
    });
  }, [locked, won]);

  // Check match after 2 flips
  useEffect(() => {
    if (flipped.length !== 2) return;
    setLocked(true);
    setMoves(m => m + 1);

    const [a, b] = flipped;
    const cardA = cards.find(c => c.id === a);
    const cardB = cards.find(c => c.id === b);

    if (cardA?.emoji === cardB?.emoji) {
      // Match!
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          c.id === a || c.id === b ? { ...c, matched: true } : c
        ));
        setFlipped([]);
        setLocked(false);
        const newMatches = matches + 1;
        setMatches(newMatches);
        const pts = Math.max(10, 100 - moves * 2);
        setScore(s => {
          const ns = s + pts;
          onScoreUpdate(ns);
          if (newMatches === level.pairs) {
            setWon(true);
            onGameOver(ns);
          }
          return ns;
        });
      }, 400);
    } else {
      // No match
      setTimeout(() => {
        setCards(prev => prev.map(c =>
          c.id === a || c.id === b ? { ...c, flipped: false } : c
        ));
        setFlipped([]);
        setLocked(false);
      }, 900);
    }
  }, [flipped]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-4 select-none w-full">
      {/* Header */}
      <div className="flex gap-2 w-full max-w-sm items-center">
        <div className="flex-1 bg-zinc-800 rounded-lg p-1.5 text-center border border-pink-500/30">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Score</div>
          <div className="text-base font-bold text-pink-400">{score}</div>
        </div>
        <div className="flex-1 bg-zinc-800 rounded-lg p-1.5 text-center border border-zinc-700/50">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Moves</div>
          <div className="text-base font-bold text-zinc-300">{moves}</div>
        </div>
        <div className="flex-1 bg-zinc-800 rounded-lg p-1.5 text-center border border-zinc-700/50">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Left</div>
          <div className="text-base font-bold text-zinc-300">{level.pairs - matches}</div>
        </div>
        <Button variant="outline" size="sm" onClick={() => restart()} className="border-pink-500/50 text-pink-300 hover:bg-pink-900/30 px-2">↺</Button>
      </div>

      {/* Level selector */}
      <div className="flex gap-2">
        {LEVELS.map((l, i) => (
          <Button key={l.name} size="sm" variant={levelIdx === i ? 'default' : 'outline'}
            className={cn('text-xs', levelIdx === i ? 'bg-pink-600 text-white' : 'border-pink-500/30 text-pink-400 hover:bg-pink-900/20')}
            onClick={() => restart(i)}>
            {l.name}
          </Button>
        ))}
      </div>

      {/* Card grid */}
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)`, maxWidth: '100%' }}>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => flipCard(card.id)}
            className={cn(
              'w-14 h-14 sm:w-16 sm:h-16 rounded-xl text-2xl flex items-center justify-center transition-all duration-300 font-bold border-2',
              card.matched
                ? 'bg-green-900/40 border-green-500/50 scale-95 opacity-60'
                : card.flipped
                  ? 'bg-pink-900/40 border-pink-500/60 scale-105'
                  : 'bg-zinc-800 border-zinc-700/50 hover:border-pink-500/40 hover:bg-zinc-700 active:scale-95',
            )}
          >
            {card.flipped || card.matched ? card.emoji : '?'}
          </button>
        ))}
      </div>

      {/* Win overlay */}
      {won && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="bg-zinc-900 border border-pink-500/50 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <div className="text-4xl">🎉</div>
            <div className="text-2xl font-bold text-pink-400">You matched them all!</div>
            <div className="text-zinc-300">{moves} moves · {score} pts</div>
            <div className="flex gap-3">
              <Button onClick={() => restart()} className="bg-pink-600 hover:bg-pink-500 text-white">Play Again</Button>
              {levelIdx < LEVELS.length - 1 && (
                <Button onClick={() => restart(levelIdx + 1)} className="bg-purple-600 hover:bg-purple-500 text-white">
                  Next Level
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
