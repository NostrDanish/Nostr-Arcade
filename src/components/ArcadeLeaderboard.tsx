import { useLeaderboard, useMyBestScore } from '@/hooks/useArcadeScore';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GameId } from '@/lib/arcadeKinds';
import type { LeaderboardEntry } from '@/hooks/useArcadeScore';

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const author = useAuthor(entry.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name ?? genUserName(entry.pubkey);
  const avatar = metadata?.picture;

  const rankColors = ['text-yellow-400', 'text-zinc-300', 'text-orange-400'];
  const rankGlow = ['neon-glow-yellow', '', ''];
  const rankSymbols = ['🥇', '🥈', '🥉'];

  return (
    <div className={cn(
      'flex items-center gap-3 p-2 rounded-lg transition-all',
      rank <= 3
        ? 'bg-zinc-800/80 border border-zinc-700/50'
        : 'bg-zinc-900/40 hover:bg-zinc-800/40',
    )}>
      {/* Rank */}
      <div className={cn('w-8 text-center font-bold text-sm', rankColors[rank - 1] ?? 'text-zinc-500', rankGlow[rank - 1] ?? '')}>
        {rank <= 3 ? rankSymbols[rank - 1] : `#${rank}`}
      </div>

      {/* Avatar */}
      <Avatar className="w-7 h-7">
        <AvatarImage src={avatar} />
        <AvatarFallback className="text-xs bg-zinc-700 text-zinc-300">
          {displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-zinc-200 truncate">{displayName}</div>
      </div>

      {/* Score */}
      <div className={cn('text-sm font-bold tabular-nums', rank === 1 ? 'text-yellow-400 neon-glow-yellow' : 'text-purple-300')}>
        {entry.score.toLocaleString()}
      </div>
    </div>
  );
}

interface Props {
  gameId: GameId;
  gameName: string;
  currentUserPubkey?: string;
}

export function ArcadeLeaderboard({ gameId, gameName, currentUserPubkey }: Props) {
  const { data: entries, isLoading } = useLeaderboard(gameId);
  const { data: myBest } = useMyBestScore(gameId);

  const myRank = entries ? entries.findIndex(e => e.pubkey === currentUserPubkey) + 1 : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-semibold text-zinc-200">Leaderboard — {gameName}</span>
        {myBest !== null && myBest !== undefined && (
          <Badge variant="outline" className="ml-auto text-xs border-purple-500/40 text-purple-300">
            My best: {myBest.toLocaleString()}
          </Badge>
        )}
      </div>

      {myRank > 0 && myRank <= 50 && (
        <div className="text-xs text-zinc-400 flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-400" />
          Your global rank: <span className="text-yellow-400 font-bold">#{myRank}</span>
        </div>
      )}

      {/* Rows */}
      <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="w-8 h-4 bg-zinc-800" />
              <Skeleton className="w-7 h-7 rounded-full bg-zinc-800" />
              <Skeleton className="flex-1 h-4 bg-zinc-800" />
              <Skeleton className="w-12 h-4 bg-zinc-800" />
            </div>
          ))
        ) : !entries?.length ? (
          <div className="text-xs text-zinc-500 text-center py-4">
            No scores yet. Be the first to claim the crown! 👑
          </div>
        ) : (
          entries.map((entry, i) => (
            <LeaderboardRow key={entry.pubkey} entry={entry} rank={i + 1} />
          ))
        )}
      </div>
    </div>
  );
}
