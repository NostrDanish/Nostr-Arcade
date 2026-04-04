import { useNostr } from '@nostrify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { KIND_ARCADE_SCORE, type GameId } from '@/lib/arcadeKinds';
import type { NostrEvent } from '@nostrify/nostrify';

export interface LeaderboardEntry {
  pubkey: string;
  score: number;
  level?: number;
  createdAt: number;
  event: NostrEvent;
}

/** Query the global leaderboard for a game (top 50 scores across all players) */
export function useLeaderboard(gameId: GameId) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['arcade', 'leaderboard', gameId],
    queryFn: async () => {
      const signal = AbortSignal.timeout(8000);

      const events = await nostr.query(
        [{ kinds: [KIND_ARCADE_SCORE], '#d': [gameId], limit: 200 }],
        { signal },
      );

      // Deduplicate: keep only the latest event per pubkey
      const byPubkey = new Map<string, NostrEvent>();
      for (const event of events) {
        const existing = byPubkey.get(event.pubkey);
        if (!existing || event.created_at > existing.created_at) {
          byPubkey.set(event.pubkey, event);
        }
      }

      const entries: LeaderboardEntry[] = [];
      for (const event of byPubkey.values()) {
        const scoreTag = event.tags.find(([n]) => n === 'score')?.[1];
        const levelTag = event.tags.find(([n]) => n === 'level')?.[1];
        if (!scoreTag) continue;
        const score = parseInt(scoreTag, 10);
        if (isNaN(score)) continue;
        entries.push({
          pubkey: event.pubkey,
          score,
          level: levelTag ? parseInt(levelTag, 10) : undefined,
          createdAt: event.created_at,
          event,
        });
      }

      // Sort descending by score
      return entries.sort((a, b) => b.score - a.score).slice(0, 50);
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Query the current user's personal best for a game */
export function useMyBestScore(gameId: GameId) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['arcade', 'my-score', gameId, user?.pubkey],
    enabled: !!user?.pubkey,
    queryFn: async () => {
      if (!user?.pubkey) return null;
      const signal = AbortSignal.timeout(5000);
      const events = await nostr.query(
        [{ kinds: [KIND_ARCADE_SCORE], '#d': [gameId], authors: [user.pubkey], limit: 1 }],
        { signal },
      );
      if (!events.length) return null;
      const event = events[0];
      const scoreTag = event.tags.find(([n]) => n === 'score')?.[1];
      if (!scoreTag) return null;
      return parseInt(scoreTag, 10);
    },
    staleTime: 30_000,
  });
}

/** Publish (or replace) the current user's high score for a game */
export function usePublishScore(gameId: GameId) {
  const queryClient = useQueryClient();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ score, level }: { score: number; level?: number }) => {
      if (!user) throw new Error('Not logged in');

      const tags: string[][] = [
        ['d', gameId],
        ['score', score.toString()],
        ['t', 'arcade'],
        ['t', `arcade-${gameId}`],
        ['alt', `Nostr Arcade high score: ${score} in ${gameId}`],
      ];

      if (level !== undefined) {
        tags.push(['level', level.toString()]);
      }

      return publishEvent({
        kind: KIND_ARCADE_SCORE,
        content: '',
        tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arcade', 'leaderboard', gameId] });
      queryClient.invalidateQueries({ queryKey: ['arcade', 'my-score', gameId] });
    },
  });
}
