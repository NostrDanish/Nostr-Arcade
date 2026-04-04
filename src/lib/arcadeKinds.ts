/**
 * Nostr Arcade — Custom Event Kinds
 *
 * Kind 34987: Arcade High Score (Addressable)
 * Kind 34988: Community Game Listing (Addressable)
 */
export const KIND_ARCADE_SCORE = 34987;
export const KIND_ARCADE_GAME = 34988;

/** Built-in game identifiers */
export const GAME_IDS = {
  GAME_2048: '2048',
  SNAKE: 'snake',
  FLAPPY: 'flappy',
  TETRIS: 'tetris',
  MEMORY: 'memory',
  BREAKOUT: 'breakout',
} as const;

export type GameId = (typeof GAME_IDS)[keyof typeof GAME_IDS];

/** Built-in game meta */
export const BUILTIN_GAMES = [
  {
    id: GAME_IDS.TETRIS,
    name: 'Tetris',
    emoji: '🟦',
    desc: 'Stack falling tetrominoes. Clear lines. Score. Classic arcade at its finest.',
    tags: ['Classic', 'Puzzle'],
    color: 'cyan',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/30 hover:border-cyan-400/60',
    glowClass: 'hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]',
    badgeClass: 'bg-cyan-900/40 text-cyan-300 border-cyan-500/30',
    bgClass: 'from-cyan-900/20 to-transparent',
  },
  {
    id: GAME_IDS.GAME_2048,
    name: '2048',
    emoji: '🔢',
    desc: 'Slide tiles on a 4×4 grid. Merge numbers. Reach 2048. Publish your score to the Nostr relay.',
    tags: ['Puzzle', 'Single-player'],
    color: 'purple',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30 hover:border-purple-400/60',
    glowClass: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]',
    badgeClass: 'bg-purple-900/40 text-purple-300 border-purple-500/30',
    bgClass: 'from-purple-900/20 to-transparent',
  },
  {
    id: GAME_IDS.SNAKE,
    name: 'Snake',
    emoji: '🐍',
    desc: 'Classic snake reimagined. Eat. Grow. Don\'t bite yourself. High score on Nostr forever.',
    tags: ['Arcade', 'Single-player'],
    color: 'green',
    textClass: 'text-green-400',
    borderClass: 'border-green-500/30 hover:border-green-400/60',
    glowClass: 'hover:shadow-[0_0_30px_rgba(0,255,136,0.15)]',
    badgeClass: 'bg-green-900/40 text-green-300 border-green-500/30',
    bgClass: 'from-green-900/20 to-transparent',
  },
  {
    id: GAME_IDS.BREAKOUT,
    name: 'Breakout',
    emoji: '🧱',
    desc: 'Destroy all bricks with your paddle and ball. Classic Atari-style action.',
    tags: ['Classic', 'Action'],
    color: 'orange',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/30 hover:border-orange-400/60',
    glowClass: 'hover:shadow-[0_0_30px_rgba(251,146,60,0.15)]',
    badgeClass: 'bg-orange-900/40 text-orange-300 border-orange-500/30',
    bgClass: 'from-orange-900/20 to-transparent',
  },
  {
    id: GAME_IDS.FLAPPY,
    name: 'Nostr Bird',
    emoji: '₿',
    desc: 'Flap through an infinite gauntlet of pipes. Zap to continue. Own your score.',
    tags: ['Endless', 'Lightning'],
    color: 'yellow',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500/30 hover:border-yellow-400/60',
    glowClass: 'hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]',
    badgeClass: 'bg-yellow-900/40 text-yellow-300 border-yellow-500/30',
    bgClass: 'from-yellow-900/20 to-transparent',
  },
  {
    id: GAME_IDS.MEMORY,
    name: 'Memory Match',
    emoji: '🧠',
    desc: 'Flip cards and match crypto/Nostr pairs. Test your memory. Score in fewest moves.',
    tags: ['Puzzle', 'Casual'],
    color: 'pink',
    textClass: 'text-pink-400',
    borderClass: 'border-pink-500/30 hover:border-pink-400/60',
    glowClass: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]',
    badgeClass: 'bg-pink-900/40 text-pink-300 border-pink-500/30',
    bgClass: 'from-pink-900/20 to-transparent',
  },
] as const;

/** External / community-featured game cards */
export interface ExternalGame {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
  tags: string[];
  author: string;
  authorUrl?: string;
  license?: string;
  featured?: boolean;
  category: string;
  credit: string;
  ctaLabel?: string;
}

export const EXTERNAL_GAMES: ExternalGame[] = [
  {
    id: 'vector-doom',
    name: 'DOOM (P2P Multiplayer)',
    description: 'Open-Source DOOM with real-time peer-to-peer multiplayer over WebXDC. No servers. No accounts. A 4.2MB file in a chat message — open it and frag your friends.',
    url: 'https://github.com/VectorPrivacy/DOOM',
    tags: ['FPS', 'Multiplayer', 'P2P', 'WASM', 'No-Server'],
    author: 'VectorPrivacy / JSKitty',
    authorUrl: 'https://vectorapp.io',
    license: 'GPL-2.0',
    featured: true,
    category: 'action',
    credit: 'Built by VectorPrivacy (vectorapp.io). Forked from JSKitty/VectorDoom. Uses Chocolate Doom → Emscripten + custom P2P netcode.',
    ctaLabel: 'Play via Vector Messenger',
  },
  {
    id: 'vector-quake',
    name: 'Quake III Arena (WebXDC)',
    description: 'Quake III Arena as a WebXDC in-chat miniapp. No servers required. P2P arena shooter you can send as a chat message and play with friends instantly.',
    url: 'https://github.com/VectorPrivacy/VectorQuake',
    tags: ['FPS', 'Multiplayer', 'P2P', 'Classic', 'WebXDC'],
    author: 'VectorPrivacy / WofWca',
    authorUrl: 'https://vectorapp.io',
    license: 'GPL-2.0',
    featured: true,
    category: 'action',
    credit: 'Forked by VectorPrivacy from WofWca/quake3.xdc. Play inside Vector Messenger (vectorapp.io).',
    ctaLabel: 'Play via Vector Messenger',
  },
  {
    id: 'yakihonne-smart-widgets',
    name: 'Smart Widget Framework',
    description: 'YakiHonne\'s Smart Widget SDK — the standard for Nostr miniapps. Build interactive widgets with NIP-07 signing, Lightning payments, and host/client postMessage bridge.',
    url: 'https://github.com/YakiHonne/smart-widget-handler',
    tags: ['SDK', 'Framework', 'Lightning', 'NIP-07', 'Miniapp'],
    author: 'YakiHonne',
    authorUrl: 'https://yakihonne.com',
    license: 'MIT',
    featured: true,
    category: 'sdk',
    credit: 'Built by YakiHonne (yakihonne.com). Open-source Smart Widget protocol. Used by Nostr Arcade\'s SDK bridge.',
    ctaLabel: 'View on GitHub',
  },
];
