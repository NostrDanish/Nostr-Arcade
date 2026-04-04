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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trophy, Upload, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GAME_IDS, type GameId } from '@/lib/arcadeKinds';
import { useToast } from '@/hooks/useToast';

const GAME_META: Record<GameId, { name: string; emoji: string; desc: string; color: string; glowClass: string }> = {
  [GAME_IDS.GAME_2048]: {
    name: '2048',
    emoji: '🔢',
    desc: 'Slide tiles and reach 2048',
    color: 'text-purple-400',
    glowClass: 'neon-glow-purple',
  },
  [GAME_IDS.SNAKE]: {
    name: 'Snake',
    emoji: '🐍',
    desc: 'Classic snake. Eat. Grow. Survive.',
    color: 'text-green-400',
    glowClass: 'neon-glow-green',
  },
  [GAME_IDS.FLAPPY]: {
    name: 'Nostr Bird',
    emoji: '₿',
    desc: 'Flap through pipes to glory',
    color: 'text-yellow-400',
    glowClass: 'neon-glow-yellow',
  },
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
    // reset when game changes
    setLiveScore(0);
    setFinalScore(null);
    setSubmitted(false);
  }, [gameId]);

  const handleScoreUpdate = useCallback((score: number) => {
    setLiveScore(score);
  }, []);

  const handleGameOver = useCallback((score: number) => {
    setFinalScore(score);
    setLiveScore(score);
    // Auto-submit if it's a new personal best
    if (user && score > 0 && (!myBest || score > myBest)) {
      // Will be submitted via button, but notify user
    }
  }, [user, myBest]);

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

  return (
    <div className="min-h-screen arcade-grid">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-zinc-400 hover:text-zinc-200 gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Arcade
          </Button>
          <Separator orientation="vertical" className="h-5 bg-zinc-800" />
          <div className={cn('font-bold text-lg', meta.color, meta.glowClass)}>
            {meta.emoji} {meta.name}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className={cn('border-zinc-700 tabular-nums', meta.color)}>
              {liveScore.toLocaleString()}
            </Badge>
            <LoginArea className="max-w-48" />
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Game area */}
        <div className="flex-1 flex flex-col items-center gap-6">
          {/* Submit score panel — appears after game over */}
          {finalScore !== null && finalScore > 0 && (
            <div className={cn(
              'w-full max-w-sm p-4 rounded-xl border',
              isNewBest ? 'border-yellow-500/50 bg-yellow-950/30' : 'border-zinc-700/50 bg-zinc-900/50',
            )}>
              <div className="flex items-center gap-3">
                <div className={cn('text-2xl font-bold', isNewBest ? 'text-yellow-400' : 'text-zinc-300')}>
                  {isNewBest ? '🏆 NEW BEST!' : 'Game Over'}
                </div>
                <div className={cn('text-2xl font-bold ml-auto', meta.color, meta.glowClass)}>
                  {finalScore.toLocaleString()}
                </div>
              </div>
              {user ? (
                submitted ? (
                  <div className="flex items-center gap-2 mt-3 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Score published to Nostr!
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={handleSubmitScore}
                      disabled={isSubmitting}
                      className="bg-purple-600 hover:bg-purple-500 text-white gap-1 flex-1"
                    >
                      <Upload className="w-3 h-3" />
                      {isSubmitting ? 'Publishing...' : 'Publish to Leaderboard'}
                    </Button>
                  </div>
                )
              ) : (
                <div className="mt-3 text-xs text-zinc-400">
                  Log in with Nostr to publish your score globally ↓
                </div>
              )}
            </div>
          )}

          {/* The actual game */}
          <div className="game-container p-4">
            {validGameId === GAME_IDS.GAME_2048 && (
              <Game2048 onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} />
            )}
            {validGameId === GAME_IDS.SNAKE && (
              <GameSnake onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} />
            )}
            {validGameId === GAME_IDS.FLAPPY && (
              <GameFlappy onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} canZap={!!user} />
            )}
          </div>
        </div>

        {/* Right sidebar — leaderboard */}
        <div className="lg:w-80 flex flex-col gap-6">
          {/* Personal best */}
          {myBest !== null && myBest !== undefined && (
            <div className="rounded-xl border border-purple-500/20 bg-zinc-900/60 p-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Your personal best
              </div>
              <div className={cn('text-3xl font-bold', meta.color, meta.glowClass)}>
                {myBest.toLocaleString()}
              </div>
            </div>
          )}

          {/* Global leaderboard */}
          <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/60 p-4">
            <ArcadeLeaderboard
              gameId={validGameId}
              gameName={meta.name}
              currentUserPubkey={user?.pubkey}
            />
          </div>

          {/* Login CTA */}
          {!user && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-4 text-sm">
              <div className="font-semibold text-purple-300 mb-1">🔑 Claim your scores</div>
              <div className="text-zinc-400 text-xs mb-3">
                Log in with a Nostr key to publish scores to the global relay-based leaderboard.
                No account registration. No servers. Pure cryptographic sovereignty.
              </div>
              <LoginArea className="w-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GamePage;
