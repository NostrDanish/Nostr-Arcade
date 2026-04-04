import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyBestScore } from '@/hooks/useArcadeScore';
import { useCommunityGames } from '@/hooks/useCommunityGames';
import { ArcadeLeaderboard } from '@/components/ArcadeLeaderboard';
import { LoginArea } from '@/components/auth/LoginArea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Zap, Shield, Globe, Lock, ExternalLink, Code2, Trophy, Gamepad2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BUILTIN_GAMES, EXTERNAL_GAMES, type GameId } from '@/lib/arcadeKinds';

// ────────────────────────────────────────────────────────────
// Built-in game card
// ────────────────────────────────────────────────────────────
function BuiltinGameCard({ game, userPubkey }: { game: typeof BUILTIN_GAMES[0]; userPubkey?: string }) {
  const { data: myBest } = useMyBestScore(game.id as GameId);

  return (
    <Link
      to={`/game/${game.id}`}
      className={`group relative overflow-hidden rounded-2xl border bg-zinc-900/60 backdrop-blur-sm p-5 flex flex-col gap-3 transition-all duration-300 cursor-pointer ${game.borderClass} ${game.glowClass}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${game.bgClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="text-4xl float-anim">{game.emoji}</div>
          {myBest !== null && myBest !== undefined && userPubkey && (
            <div className="text-right">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Best</div>
              <div className={`text-base font-bold tabular-nums ${game.textClass}`}>{myBest.toLocaleString()}</div>
            </div>
          )}
        </div>
        <div>
          <h2 className={`text-lg font-bold mb-0.5 ${game.textClass}`}>{game.name}</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">{game.desc}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {game.tags.map(tag => (
            <Badge key={tag} variant="outline" className={`text-[10px] px-2 py-0 ${game.badgeClass}`}>
              {tag === 'Lightning' && <Zap className="w-2 h-2 mr-0.5" />}{tag}
            </Badge>
          ))}
        </div>
        <div className={`text-xs font-semibold ${game.textClass} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
          → Play now
        </div>
      </div>
    </Link>
  );
}

// ────────────────────────────────────────────────────────────
// External game card
// ────────────────────────────────────────────────────────────
function ExternalGameCard({ game }: { game: typeof EXTERNAL_GAMES[0] }) {
  const categoryColors: Record<string, string> = {
    action: 'border-red-500/30 hover:border-red-400/50 text-red-400',
    puzzle: 'border-blue-500/30 hover:border-blue-400/50 text-blue-400',
    multiplayer: 'border-cyan-500/30 hover:border-cyan-400/50 text-cyan-400',
    sdk: 'border-yellow-500/30 hover:border-yellow-400/50 text-yellow-400',
    classic: 'border-orange-500/30 hover:border-orange-400/50 text-orange-400',
  };
  const styles = categoryColors[game.category] ?? 'border-zinc-600/30 text-zinc-400';

  return (
    <div className={`rounded-2xl border bg-zinc-900/60 p-5 flex flex-col gap-3 ${styles} hover:bg-zinc-800/40 transition-all`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-zinc-100">{game.name}</h3>
            {game.featured && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] px-1.5 py-0">Featured</Badge>}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            By{' '}
            {game.authorUrl ? (
              <a href={game.authorUrl} target="_blank" rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                onClick={e => e.stopPropagation()}>
                {game.author} <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ) : game.author}
            {game.license && <span className="ml-1 px-1.5 py-0 rounded bg-zinc-800 text-zinc-500 border border-zinc-700/50">{game.license}</span>}
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed">{game.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {game.tags.map(tag => (
          <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 border-zinc-700/50 text-zinc-400">{tag}</Badge>
        ))}
      </div>

      <div className="text-[10px] text-zinc-600 italic border-t border-zinc-800/60 pt-2">
        Credit: {game.credit}
      </div>

      <a href={game.url} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline" className="w-full text-xs gap-1 border-zinc-700/50 text-zinc-300 hover:text-white hover:border-zinc-600">
          <ExternalLink className="w-3 h-3" />
          {game.ctaLabel ?? 'View Project'}
        </Button>
      </a>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Community game card
// ────────────────────────────────────────────────────────────
function CommunityGameCard({ game }: { game: ReturnType<typeof useCommunityGames>['data'] extends (infer T)[] | undefined ? T : never }) {
  if (!game) return null;
  return (
    <div className="rounded-2xl border border-zinc-700/40 bg-zinc-900/60 p-5 flex flex-col gap-3 hover:border-zinc-600/60 transition-all">
      <div>
        <h3 className="font-bold text-zinc-100 mb-1">{game.name}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{game.description}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {game.tags.map(tag => (
          <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 border-zinc-700/50 text-zinc-400">{tag}</Badge>
        ))}
      </div>
      {game.repoUrl && (
        <div className="text-xs text-zinc-500 flex items-center gap-1">
          Open source
          {game.license && <span className="px-1.5 py-0 rounded bg-zinc-800 border border-zinc-700/50">{game.license}</span>}
        </div>
      )}
      <a href={game.url} target="_blank" rel="noopener noreferrer">
        <Button size="sm" className="w-full text-xs gap-1 bg-purple-600/80 hover:bg-purple-500/80 text-white">
          <ExternalLink className="w-3 h-3" /> Play Game
        </Button>
      </a>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────
export default function Index() {
  useSeoMeta({
    title: 'Nostr Arcade — The Sovereign Gaming Platform',
    description: 'Play classic arcade games with Nostr-powered leaderboards, Lightning zaps, and true player ownership. Submit your game. No app stores. No servers. Pure fun.',
  });

  const { user } = useCurrentUser();
  const { data: communityGames, isLoading: communityLoading } = useCommunityGames();

  return (
    <div className="min-h-screen arcade-grid">
      {/* Ticker */}
      <div className="bg-purple-950/60 border-b border-purple-500/20 overflow-hidden py-1">
        <div className="marquee whitespace-nowrap text-xs text-purple-300/60 pixel-font">
          ⚡ NOSTR ARCADE ⚡ • Sovereign gaming platform • No servers • No gatekeepers • Your scores on the blockchain of your choice •
          Powered by Nostr + Lightning + Open Source • Inspired by VectorPrivacy + YakiHonne • Submit your game today •
          Code the fun. Ship the freedom. Let the games begin. ⚡
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="text-2xl">🕹️</div>
            <div>
              <div className="text-sm font-bold text-purple-400 neon-glow-purple leading-none">NOSTR</div>
              <div className="text-[10px] text-zinc-500 leading-none tracking-widest uppercase">Arcade</div>
            </div>
          </Link>
          <Separator orientation="vertical" className="h-6 bg-zinc-800 mx-1 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-400" /> Sovereign</span>
            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-purple-400" /> Self-custodial</span>
            <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-cyan-400" /> Censorship-resistant</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Link to="/sdk" className="hidden md:block">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-400 gap-1 hover:text-purple-300">
                <Code2 className="w-3 h-3" /> Dev SDK
              </Button>
            </Link>
            <Link to="/submit">
              <Button variant="outline" size="sm" className="text-xs border-purple-500/40 text-purple-300 hover:bg-purple-900/30 gap-1">
                <Gamepad2 className="w-3 h-3" /> Submit Game
              </Button>
            </Link>
            <LoginArea className="max-w-48" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <section className="text-center mb-12 relative">
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none isolate">
            <div className="w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-xs text-purple-300 mb-5">
            <Zap className="w-3 h-3 text-yellow-400" />
            Built on Nostr · Powered by Lightning · Inspired by VectorPrivacy & YakiHonne
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none">
            <span className="text-white">NOSTR</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400">ARCADE</span>
          </h1>
          <p className="text-base text-zinc-400 max-w-xl mx-auto mb-5 leading-relaxed">
            The sovereign gaming platform where scores are signed Nostr events, leaderboards run on relays,
            and no app store can shut it down. Play built-in games or submit your own.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-zinc-500">
            {['6 built-in games', 'Community submissions', 'Nostr leaderboards', 'Lightning zaps', 'Open SDK', 'Mobile-first'].map(t => (
              <span key={t} className="px-2 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50">{t}</span>
            ))}
          </div>
        </section>

        {/* Main Tabs */}
        <Tabs defaultValue="games" className="mb-16">
          <TabsList className="w-full bg-zinc-900/60 border border-zinc-800/60 p-1 mb-8 flex flex-wrap h-auto gap-1">
            <TabsTrigger value="games" className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400 gap-1.5 text-xs sm:text-sm">
              <Gamepad2 className="w-3.5 h-3.5" /> Play Games
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400 gap-1.5 text-xs sm:text-sm">
              <Trophy className="w-3.5 h-3.5" /> Leaderboards
            </TabsTrigger>
            <TabsTrigger value="ecosystem" className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400 gap-1.5 text-xs sm:text-sm">
              <Globe className="w-3.5 h-3.5" /> Ecosystem
            </TabsTrigger>
            <TabsTrigger value="community" className="flex-1 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-zinc-400 gap-1.5 text-xs sm:text-sm">
              <Code2 className="w-3.5 h-3.5" /> Community
            </TabsTrigger>
          </TabsList>

          {/* Games tab */}
          <TabsContent value="games">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest px-3">6 Built-in Games</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {BUILTIN_GAMES.map(game => (
                <BuiltinGameCard key={game.id} game={game} userPubkey={user?.pubkey} />
              ))}
            </div>
          </TabsContent>

          {/* Leaderboards tab */}
          <TabsContent value="leaderboards">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest px-3">Global Rankings</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BUILTIN_GAMES.map(game => (
                <div key={game.id} className={`rounded-xl border ${game.borderClass} bg-zinc-900/60 p-4`}>
                  <div className={`text-sm font-bold mb-3 flex items-center gap-2 ${game.textClass}`}>
                    <span>{game.emoji}</span> {game.name}
                  </div>
                  <ArcadeLeaderboard gameId={game.id as GameId} gameName={game.name} currentUserPubkey={user?.pubkey} />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Ecosystem tab */}
          <TabsContent value="ecosystem">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest px-3">Featured Nostr Game Projects</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
            </div>
            <div className="mb-4 p-4 rounded-xl border border-zinc-700/30 bg-zinc-900/30 text-sm text-zinc-400">
              These projects pioneered sovereign gaming on Nostr and decentralized protocols.
              Full credit to their original authors — we stand on the shoulders of these giants.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EXTERNAL_GAMES.map(game => (
                <ExternalGameCard key={game.id} game={game} />
              ))}
            </div>
            <div className="mt-8 p-6 rounded-xl border border-purple-500/20 bg-purple-950/20 text-center">
              <div className="text-sm font-semibold text-purple-300 mb-2">Want your project listed here?</div>
              <div className="text-xs text-zinc-400 mb-4">Submit a kind 34988 event or open a PR on the arcade repo.</div>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to="/submit">
                  <Button className="bg-purple-600 hover:bg-purple-500 text-white text-xs">Submit Your Game</Button>
                </Link>
                <Link to="/sdk">
                  <Button variant="outline" className="border-purple-500/40 text-purple-300 hover:bg-purple-900/30 text-xs">Read the SDK</Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          {/* Community tab */}
          <TabsContent value="community">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
              <span className="text-xs text-zinc-500 uppercase tracking-widest px-3">Community Submissions (Kind 34988)</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
            </div>

            {communityLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-zinc-800/40 animate-pulse" />)}
              </div>
            ) : !communityGames?.length ? (
              <div className="rounded-xl border border-dashed border-zinc-700/50 bg-zinc-900/30 p-12 text-center">
                <div className="text-4xl mb-4">🎮</div>
                <div className="text-lg font-semibold text-zinc-300 mb-2">No community games yet</div>
                <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">
                  Be the first sovereign game developer to submit! Publish a Nostr kind 34988 event
                  and your game appears here for all players to discover.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link to="/submit">
                    <Button className="bg-purple-600 hover:bg-purple-500 text-white">Submit Your Game</Button>
                  </Link>
                  <Link to="/sdk">
                    <Button variant="outline" className="border-zinc-600 text-zinc-300">Developer SDK</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {communityGames.map(game => (
                  <CommunityGameCard key={`${game.pubkey}:${game.id}`} game={game} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* How it works */}
        <section className="mb-12 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 md:p-8">
          <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-6">How the leaderboard works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {[
              { icon: '🎮', title: 'Play offline-first', desc: 'All game logic runs 100% client-side. No game server can censor your session or go down during play.' },
              { icon: '✍️', title: 'Sign your score', desc: `After a game ends, your score is signed with your Nostr key (kind 34987) and published to relays. Immutable. Verifiable.` },
              { icon: '🌐', title: 'Global relay leaderboard', desc: 'Anyone queries the leaderboard from any relay. No central server owns the rankings. The protocol is the backend.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-2">
                <div className="text-2xl">{icon}</div>
                <div className="font-semibold text-zinc-200">{title}</div>
                <div className="text-zinc-400 text-xs leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <section className="text-center py-8 border-t border-zinc-800/40">
          <div className="text-xs text-zinc-600 max-w-lg mx-auto leading-relaxed mb-4">
            "We the Cypherpunks are dedicated to building anonymous systems." — A Cypherpunk's Manifesto.
            Games are no different. Score ownership is a right, not a privilege.
          </div>
          <div className="flex flex-wrap justify-center gap-3 items-center text-xs text-zinc-600">
            <a href="https://shakespeare.diy" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">
              Vibed with Shakespeare
            </a>
            <span>•</span>
            <a href="https://vectorapp.io" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Inspired by VectorPrivacy</a>
            <span>•</span>
            <a href="https://yakihonne.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Inspired by YakiHonne</a>
            <span>•</span>
            <Link to="/sdk" className="hover:text-zinc-400 transition-colors">Developer SDK</Link>
            <span>•</span>
            <span>Built on Nostr</span>
          </div>
        </section>
      </main>
    </div>
  );
}
