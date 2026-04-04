import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyBestScore, usePublishScore } from '@/hooks/useArcadeScore';
import { ArcadeLeaderboard } from '@/components/ArcadeLeaderboard';
import { LoginArea } from '@/components/auth/LoginArea';
import { Game2048 } from '@/games/Game2048';
import { GameSnake } from '@/games/GameSnake';
import { GameFlappy } from '@/games/GameFlappy';
import { GameTetris } from '@/games/GameTetris';
import { GameMemory } from '@/games/GameMemory';
import { GameBreakout } from '@/games/GameBreakout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trophy, Upload, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GAME_IDS, BUILTIN_GAMES, type GameId } from '@/lib/arcadeKinds';
import { useToast } from '@/hooks/useToast';

const GAME_META: Record<GameId, { name: string; emoji: string; desc: string; textClass: string; borderClass: string }> = {
  [GAME_IDS.TETRIS]: { name: 'Tetris', emoji: '🟦', desc: 'Stack falling tetrominoes. Clear lines. Score.', textClass: 'text-cyan-400', borderClass: 'border-cyan-500/30' },
  [GAME_IDS.GAME_2048]: { name: '2048', emoji: '🔢', desc: 'Slide tiles and reach 2048', textClass: 'text-purple-400', borderClass: 'border-purple-500/30' },
  [GAME_IDS.SNAKE]: { name: 'Snake', emoji: '🐍', desc: 'Classic snake. Eat. Grow. Survive.', textClass: 'text-green-400', borderClass: 'border-green-500/30' },
  [GAME_IDS.BREAKOUT]: { name: 'Breakout', emoji: '🧱', desc: 'Destroy bricks with your paddle.', textClass: 'text-orange-400', borderClass: 'border-orange-500/30' },
  [GAME_IDS.FLAPPY]: { name: 'Nostr Bird', emoji: '₿', desc: 'Flap through pipes to glory', textClass: 'text-yellow-400', borderClass: 'border-yellow-500/30' },
  [GAME_IDS.MEMORY]: { name: 'Memory Match', emoji: '🧠', desc: 'Match crypto emoji pairs', textClass: 'text-pink-400', borderClass: 'border-pink-500/30' },
};

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useCurrentUser();

  const validGameId = Object.values(GAME_IDS).includes(gameId as GameId) ? (gameId as GameId) : null;
  const meta = validGameId ? GAME_META[validGameId] : null;

  useSeoMeta({
    title: meta ? `${meta.name} — Nostr Arcade` : 'Nostr Arcade',
    description: meta?.desc ?? 'Play sovereign games on Nostr',
  });

  const [liveScore, setLiveScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: myBest, refetch: refetchBest } = useMyBestScore(validGameId ?? GAME_IDS.SNAKE);
  const { mutateAsync: publishScore, isPending: isSubmitting } = usePublishScore(validGameId ?? GAME_IDS.SNAKE);

  useEffect(() => {
    setLiveScore(0); setFinalScore(null); setSubmitted(false);
  }, [gameId]);

  const handleScoreUpdate = useCallback((score: number) => setLiveScore(score), []);
  const handleGameOver = useCallback((score: number) => { setFinalScore(score); setLiveScore(score); }, []);

  const handleSubmitScore = useCallback(async () => {
    if (!user || finalScore === null || finalScore <= 0) return;
    try {
      await publishScore({ score: finalScore });
      setSubmitted(true);
      await refetchBest();
      toast({ title: '⚡ Score published!', description: `${finalScore.toLocaleString()} pts recorded on Nostr` });
    } catch {
      toast({ title: 'Failed to publish', description: 'Check your Nostr connection', variant: 'destructive' });
    }
  }, [user, finalScore, publishScore, refetchBest, toast]);

  if (!validGameId || !meta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🕹️</div>
          <div className="text-xl text-zinc-400">Game not found</div>
          <Link to="/" className="text-purple-400 hover:text-purple-300 mt-4 block">← Back to Arcade</Link>
        </div>
      </div>
    );
  }

  const isNewBest = finalScore !== null && finalScore > 0 && (!myBest || finalScore > myBest);

  // Other games quick-nav
  const otherGames = BUILTIN_GAMES.filter(g => g.id !== validGameId).slice(0, 3);

  return (
    <div className="min-h-screen arcade-grid">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-3 py-2.5 flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-zinc-400 hover:text-zinc-200 gap-1 px-2 sm:px-3">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Arcade</span>
          </Button>
          <Separator orientation="vertical" className="h-5 bg-zinc-800" />
          <div className={cn('font-bold text-base sm:text-lg', meta.textClass)}>
            {meta.emoji} {meta.name}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className={cn('border-zinc-700 tabular-nums text-xs', meta.textClass)}>
              {liveScore.toLocaleString()}
            </Badge>
            <LoginArea className="max-w-40" />
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-3 py-4 sm:py-8 flex flex-col lg:flex-row gap-6">
        {/* Game area */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {/* Score submit banner */}
          {finalScore !== null && finalScore > 0 && (
            <div className={cn(
              'w-full max-w-sm p-3 rounded-xl border',
              isNewBest ? 'border-yellow-500/50 bg-yellow-950/30' : 'border-zinc-700/50 bg-zinc-900/50',
            )}>
              <div className="flex items-center gap-3">
                <div className={cn('text-lg font-bold', isNewBest ? 'text-yellow-400' : 'text-zinc-300')}>
                  {isNewBest ? '🏆 NEW BEST!' : 'Game Over'}
                </div>
                <div className={cn('text-xl font-bold ml-auto', meta.textClass)}>
                  {finalScore.toLocaleString()}
                </div>
              </div>
              {user ? (
                submitted ? (
                  <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                    <CheckCircle className="w-3 h-3" /> Score published to Nostr!
                  </div>
                ) : (
                  <Button size="sm" onClick={handleSubmitScore} disabled={isSubmitting}
                    className="mt-2 bg-purple-600 hover:bg-purple-500 text-white gap-1 w-full text-xs">
                    <Upload className="w-3 h-3" />
                    {isSubmitting ? 'Publishing...' : 'Publish to Leaderboard'}
                  </Button>
                )
              ) : (
                <div className="mt-2 text-xs text-zinc-500">Log in to publish your score globally</div>
              )}
            </div>
          )}

          {/* The game */}
          <div className="game-container p-3 sm:p-4 w-full max-w-max">
            {validGameId === GAME_IDS.TETRIS && <GameTetris onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} />}
            {validGameId === GAME_IDS.GAME_2048 && <Game2048 onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} />}
            {validGameId === GAME_IDS.SNAKE && <GameSnake onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} />}
            {validGameId === GAME_IDS.BREAKOUT && <GameBreakout onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} />}
            {validGameId === GAME_IDS.FLAPPY && <GameFlappy onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} canZap={!!user} />}
            {validGameId === GAME_IDS.MEMORY && <GameMemory onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} />}
          </div>

          {/* Quick nav to other games on mobile */}
          <div className="flex gap-2 flex-wrap justify-center lg:hidden">
            {otherGames.map(g => (
              <Link key={g.id} to={`/game/${g.id}`}>
                <Button variant="outline" size="sm" className={cn('text-xs border gap-1', g.borderClass, g.textClass)}>
                  {g.emoji} {g.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:w-72 flex flex-col gap-4">
          {/* Personal best */}
          {myBest !== null && myBest !== undefined && (
            <div className={cn('rounded-xl border p-4', meta.borderClass, 'bg-zinc-900/60')}>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                <Trophy className="w-3 h-3 text-yellow-400" /> Your personal best
              </div>
              <div className={cn('text-3xl font-bold', meta.textClass)}>
                {myBest.toLocaleString()}
              </div>
            </div>
          )}

          {/* Global leaderboard */}
          <div className={cn('rounded-xl border p-4', meta.borderClass, 'bg-zinc-900/60')}>
            <ArcadeLeaderboard gameId={validGameId} gameName={meta.name} currentUserPubkey={user?.pubkey} />
          </div>

          {/* Login CTA */}
          {!user && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-4 text-sm">
              <div className="font-semibold text-purple-300 mb-1">🔑 Own your scores</div>
              <div className="text-zinc-400 text-xs mb-3">
                Log in with Nostr to publish scores to the global leaderboard. No registration. No servers.
              </div>
              <LoginArea className="w-full" />
            </div>
          )}

          {/* Other games quick nav (desktop) */}
          <div className="hidden lg:block rounded-xl border border-zinc-700/40 bg-zinc-900/40 p-4">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Other Games</div>
            <div className="space-y-2">
              {BUILTIN_GAMES.filter(g => g.id !== validGameId).map(g => (
                <Link key={g.id} to={`/game/${g.id}`}>
                  <div className={cn('flex items-center gap-2 p-2 rounded-lg border text-xs hover:bg-zinc-800/50 transition-all cursor-pointer', g.borderClass)}>
                    <span className="text-base">{g.emoji}</span>
                    <span className={cn('font-medium', g.textClass)}>{g.name}</span>
                    <ArrowLeft className="w-3 h-3 ml-auto rotate-180 text-zinc-600" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
