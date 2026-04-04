import { useNostr } from '@nostrify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { KIND_ARCADE_GAME } from '@/lib/arcadeKinds';
import type { NostrEvent } from '@nostrify/nostrify';

export interface CommunityGame {
  pubkey: string;
  id: string;          // d-tag (slug)
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  tags: string[];
  repoUrl?: string;
  license?: string;
  category: string;
  event: NostrEvent;
  createdAt: number;
}

function parseGameEvent(event: NostrEvent): CommunityGame | null {
  const get = (name: string) => event.tags.find(([n]) => n === name)?.[1];
  const id = get('d');
  const name = get('name');
  const url = get('url');
  if (!id || !name || !url) return null;
  return {
    pubkey: event.pubkey,
    id,
    name,
    description: get('description') ?? '',
    url,
    imageUrl: get('image'),
    tags: event.tags.filter(([n]) => n === 't').map(([, v]) => v),
    repoUrl: get('repo'),
    license: get('license'),
    category: get('category') ?? 'game',
    event,
    createdAt: event.created_at,
  };
}

/** Query community-submitted games from relays */
export function useCommunityGames() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['arcade', 'community-games'],
    queryFn: async () => {
      const signal = AbortSignal.timeout(8000);
      const events = await nostr.query(
        [{ kinds: [KIND_ARCADE_GAME], '#t': ['arcade-game'], limit: 100 }],
        { signal },
      );

      // Deduplicate by pubkey+d-tag (addressable)
      const byKey = new Map<string, NostrEvent>();
      for (const event of events) {
        const d = event.tags.find(([n]) => n === 'd')?.[1];
        if (!d) continue;
        const key = `${event.pubkey}:${d}`;
        const existing = byKey.get(key);
        if (!existing || event.created_at > existing.created_at) byKey.set(key, event);
      }

      const games: CommunityGame[] = [];
      for (const event of byKey.values()) {
        const g = parseGameEvent(event);
        if (g) games.push(g);
      }
      return games.sort((a, b) => b.createdAt - a.createdAt);
    },
    staleTime: 60_000,
  });
}

/** Submit a game to the community registry */
export function useSubmitGame() {
  const queryClient = useQueryClient();
  const { mutateAsync: publishEvent } = useNostrPublish();

  return useMutation({
    mutationFn: async (game: {
      slug: string;
      name: string;
      description: string;
      url: string;
      imageUrl?: string;
      repoUrl?: string;
      license?: string;
      category: string;
      tags: string[];
    }) => {
      const slug = game.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 64);

      const tags: string[][] = [
        ['d', slug],
        ['name', game.name],
        ['url', game.url],
        ['description', game.description],
        ['category', game.category],
        ['t', 'arcade-game'],
        ['t', 'nostr-arcade'],
        ['alt', `Nostr Arcade game submission: ${game.name}`],
      ];

      if (game.imageUrl) tags.push(['image', game.imageUrl]);
      if (game.repoUrl) tags.push(['repo', game.repoUrl]);
      if (game.license) tags.push(['license', game.license]);
      game.tags.forEach(t => tags.push(['t', t.toLowerCase().replace(/\s+/g, '-')]));

      return publishEvent({ kind: KIND_ARCADE_GAME, content: '', tags });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arcade', 'community-games'] });
    },
  });
}
