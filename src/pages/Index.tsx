import { Link } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMyBestScore } from '@/hooks/useArcadeScore';
import { ArcadeLeaderboard } from '@/components/ArcadeLeaderboard';
import { LoginArea } from '@/components/auth/LoginArea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Zap, Shield, Globe, Lock } from 'lucide-react';
import { GAME_IDS, type GameId } from '@/lib/arcadeKinds';

// ────────────────────────────────────────────────────────────
// Game card data
// ────────────────────────────────────────────────────────────
const GAMES = [
  {
    id: GAME_IDS.GAME_2048,
    name: '2048',
    emoji: '🔢',
    desc: 'Slide tiles on a 4×4 grid. Merge numbers. Reach 2048. Publish your score to the Nostr relay.',
    tags: ['Puzzle', 'Single-player'],
    color: 'purple',
    borderClass: 'border-purple-500/30 hover:border-purple-400/60',
    glowClass: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]',
    textClass: 'text-purple-400',
    badgeClass: 'bg-purple-900/40 text-purple-300 border-purple-500/30',
    bgClass: 'from-purple-900/20 to-transparent',
  },
  {
    id: GAME_IDS.SNAKE,
    name: 'Snake',
    emoji: '🐍',
    desc: 'Classic snake reimagined. Eat. Grow. Don\'t bite yourself. Your high score lives on Nostr forever.',
    tags: ['Arcade', 'Single-player'],
    color: 'green',
    borderClass: 'border-green-500/30 hover:border-green-400/60',
    glowClass: 'hover:shadow-[0_0_30px_rgba(0,255,136,0.15)]',
    textClass: 'text-green-400',
    badgeClass: 'bg-green-900/40 text-green-300 border-green-500/30',
    bgClass: 'from-green-900/20 to-transparent',
  },
  {
    id: GAME_IDS.FLAPPY,
    name: 'Nostr Bird',
    emoji: '₿',
    desc: 'Flap through an infinite gauntlet of pipes. Zap to continue. Survive longer. Own your score.',
    tags: ['Endless', 'Lightning'],
    color: 'yellow',
    borderClass: 'border-yellow-500/30 hover:border-yellow-400/60',
    glowClass: 'hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]',
    textClass: 'text-yellow-400',
    badgeClass: 'bg-yellow-900/40 text-yellow-300 border-yellow-500/30',
    bgClass: 'from-yellow-900/20 to-transparent',
  },
];

// ────────────────────────────────────────────────────────────
// Game card with personal best
// ────────────────────────────────────────────────────────────
function GameCard({ game, userPubkey }: { game: typeof GAMES[0]; userPubkey?: string }) {
  const { data: myBest } = useMyBestScore(game.id as GameId);

  return (
    <Link
      to={`/game/${game.id}`}
      className={`group relative overflow-hidden rounded-2xl border bg-zinc-900/60 backdrop-blur-sm p-6 flex flex-col gap-4 transition-all duration-300 cursor-pointer ${game.borderClass} ${game.glowClass}`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${game.bgClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={`text-5xl float-anim`} style={{ animationDelay: `${Math.random() * 2}s` }}>
            {game.emoji}
          </div>
          {myBest !== null && myBest !== undefined && userPubkey && (
            <div className="text-right">
              <div className="text-xs text-zinc-500 uppercase tracking-widest">Best</div>
              <div className={`text-lg font-bold tabular-nums ${game.textClass}`}>{myBest.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* Title & description */}
        <div>
          <h2 className={`text-xl font-bold mb-1 ${game.textClass} group-hover:scale-105 transition-transform origin-left`}>
            {game.name}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{game.desc}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {game.tags.map(tag => (
            <Badge key={tag} variant="outline" className={`text-xs ${game.badgeClass}`}>
              {tag === 'Lightning' && <Zap className="w-2.5 h-2.5 mr-1" />}
              {tag}
            </Badge>
          ))}
        </div>

        {/* Play button hint */}
        <div className={`text-xs font-semibold ${game.textClass} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
          → Play now
        </div>
      </div>
    </Link>
  );
}

// ────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────
export default function Index() {
  useSeoMeta({
    title: 'Nostr Arcade — Sovereign Games on Nostr',
    description: 'Play classic arcade games with Nostr-powered leaderboards, Lightning zaps, and true player ownership. No app stores. No servers. Pure fun.',
  });

  const { user } = useCurrentUser();

  return (
    <div className="min-h-screen arcade-grid">
      {/* ── Ticker banner ── */}
      <div className="bg-purple-950/60 border-b border-purple-500/20 overflow-hidden py-1">
        <div className="marquee whitespace-nowrap text-xs text-purple-300/60 pixel-font">
          ⚡ NOSTR ARCADE ⚡ • No servers. No gatekeepers. No censorship. Just pure sovereign play. •
          Your scores live on Nostr relays forever. •
          High scores secured by cryptographic signatures. •
          ⚡ Zap to continue. ⚡ Code the fun. Ship the freedom. Let the games begin. •
          Powered by Nostr + Lightning + Open Source •
        </div>
      </div>

      {/* ── Header ── */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="text-2xl">🕹️</div>
            <div>
              <div className="text-sm font-bold text-purple-400 neon-glow-purple leading-none">NOSTR</div>
              <div className="text-xs text-zinc-500 leading-none tracking-widest uppercase">Arcade</div>
            </div>
          </Link>

          <Separator orientation="vertical" className="h-6 bg-zinc-800 mx-2" />

          <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-400" /> Sovereign
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-purple-400" /> Self-custodial
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-cyan-400" /> Censorship-resistant
            </span>
          </div>

          <div className="ml-auto">
            <LoginArea className="max-w-48" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* ── Hero ── */}
        <section className="text-center mb-16 relative">
          {/* Decorative background glow */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-xs text-purple-300 mb-6">
            <Zap className="w-3 h-3 text-yellow-400" />
            Built on Nostr • Powered by Lightning
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none">
            <span className="text-white">NOSTR</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 neon-glow-purple">
              ARCADE
            </span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-6 leading-relaxed">
            The first sovereign arcade where your scores are cryptographically signed Nostr events,
            leaderboards run on relays, and there's no app store that can pull the plug.
          </p>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-zinc-500">
            <span className="px-2 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50">No registration</span>
            <span className="px-2 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50">No cloud backend</span>
            <span className="px-2 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50">Nostr-native scores</span>
            <span className="px-2 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50">Lightning payments</span>
            <span className="px-2 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50">Open source</span>
          </div>
        </section>

        {/* ── Game cards ── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
            <h2 className="text-xs font-bold tracking-widest text-zinc-500 uppercase px-3">Choose your game</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GAMES.map(game => (
              <GameCard key={game.id} game={game} userPubkey={user?.pubkey} />
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mb-16 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-8">
          <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase mb-6">How the leaderboard works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex flex-col gap-2">
              <div className="text-2xl">🎮</div>
              <div className="font-semibold text-zinc-200">Play offline-first</div>
              <div className="text-zinc-400">All game logic runs 100% client-side. No game server can censor your session or go down during play.</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-2xl">✍️</div>
              <div className="font-semibold text-zinc-200">Sign your score</div>
              <div className="text-zinc-400">After a game ends, your score is signed with your Nostr private key (kind {34987}) and published to relays. Immutable. Verifiable.</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-2xl">🌐</div>
              <div className="font-semibold text-zinc-200">Global relay leaderboard</div>
              <div className="text-zinc-400">Anyone can query the leaderboard from any relay. No central server owns the rankings. The protocol is the backend.</div>
            </div>
          </div>
        </section>

        {/* ── Global leaderboards ── */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-800" />
            <h2 className="text-xs font-bold tracking-widest text-zinc-500 uppercase px-3">Global leaderboards</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GAMES.map(game => (
              <div key={game.id} className={`rounded-xl border ${game.borderClass} bg-zinc-900/60 p-4`}>
                <div className={`text-sm font-bold mb-3 ${game.textClass}`}>
                  {game.emoji} {game.name}
                </div>
                <ArcadeLeaderboard
                  gameId={game.id as GameId}
                  gameName={game.name}
                  currentUserPubkey={user?.pubkey}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Nostr manifesto footer ── */}
        <section className="text-center py-8 border-t border-zinc-800/40">
          <div className="text-xs text-zinc-600 max-w-lg mx-auto leading-relaxed mb-6">
            "We the Cypherpunks are dedicated to building anonymous systems. We are defending our
            privacy with cryptography." — A Cypherpunk's Manifesto. Games are no different.
            Score ownership is a right, not a privilege.
          </div>
          <div className="flex flex-wrap justify-center gap-4 items-center text-xs text-zinc-600">
            <a href="https://shakespeare.diy" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">
              Vibed with Shakespeare
            </a>
            <span>•</span>
            <span>Built on Nostr</span>
            <span>•</span>
            <span>No servers were harmed</span>
          </div>
        </section>
      </main>
    </div>
  );
}
