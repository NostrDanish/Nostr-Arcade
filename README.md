# 🕹️ Nostr Arcade

**The sovereign gaming platform built entirely on Nostr.**

No app stores. No central servers. No gatekeepers. Your scores are cryptographically signed Nostr events. Leaderboards run on public relays. Any developer can submit a game. No permission required.

[![MIT License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)
[![Built on Nostr](https://img.shields.io/badge/built%20on-Nostr-blueviolet)](https://nostr.com)
[![Lightning](https://img.shields.io/badge/payments-Lightning%20%E2%9A%A1-yellow)](https://lightning.network)
[![Edit with Shakespeare](https://shakespeare.diy/badge.svg)](https://shakespeare.diy/clone?url=https%3A%2F%2Fgithub.com%2FNostrDanish%2FNostr-Arcade.git)

> *"We the Cypherpunks are dedicated to building anonymous systems."*
> — A Cypherpunk's Manifesto
>
> Score ownership is a right, not a privilege.

---

## Live Demo

**[0xnostr-arcade.shakespeare.wtf](https://0xnostr-arcade.shakespeare.wtf)**

---

## Games

Six fully playable browser games, all mobile-first with touch controls:

| Game | Type | Controls |
|------|------|----------|
| 🟦 **Tetris** | Puzzle / Classic | Arrow keys, WASD, on-screen d-pad, Space to hard drop |
| 🔢 **2048** | Puzzle | Arrow keys, WASD, swipe |
| 🐍 **Snake** | Arcade | Arrow keys, WASD, swipe, on-screen d-pad |
| 🧱 **Breakout** | Action / Classic | Mouse, touch drag |
| ₿ **Nostr Bird** | Endless runner | Space, tap, Lightning zap to continue |
| 🧠 **Memory Match** | Puzzle / Casual | Tap/click, 3 difficulty levels |

Every game publishes high scores as signed **Nostr events (kind 34987)** to public relays. Leaderboards are derived entirely from relay queries — no backend, no database.

---

## How Scores Work

```
Play game → score updated live
   ↓
Game ends → sign score event with Nostr key (NIP-07)
   ↓
kind 34987 event published to 3 relays
   ↓
Global leaderboard queries relay: { kinds: [34987], '#d': ['snake'] }
   ↓
Deduplicate by pubkey → sort by score → display rankings
```

All game logic runs **100% client-side**. The relay is the only backend. If every relay goes down, the game still plays — scores just queue for later.

---

## Architecture

```
src/
├── games/          # Self-contained game components
│   ├── Game2048.tsx
│   ├── GameBreakout.tsx
│   ├── GameFlappy.tsx
│   ├── GameMemory.tsx
│   ├── GameSnake.tsx
│   └── GameTetris.tsx
├── hooks/
│   ├── useArcadeScore.ts     # kind 34987: publish + query scores
│   └── useCommunityGames.ts  # kind 34988: community game directory
├── lib/
│   └── arcadeKinds.ts        # Kind constants + game registry
└── pages/
    ├── Index.tsx             # Arcade hub (4 tabs)
    ├── GamePage.tsx          # Per-game route with leaderboard sidebar
    ├── SDKPage.tsx           # Developer SDK guide
    └── SubmitGamePage.tsx    # Community game submission form
```

**Tech stack:**
- **React 19** + TypeScript
- **Nostrify** — Nostr protocol framework
- **TanStack Query** — data fetching + caching
- **TailwindCSS 3** + shadcn/ui
- **Vite** — build tool
- **nostr-tools** — NIP utilities

---

## Nostr Event Kinds

This project uses two custom addressable event kinds:

| Kind | Name | Description |
|------|------|-------------|
| `34987` | Arcade High Score | One personal best per player per game. Replaced when beaten. |
| `34988` | Community Game Listing | Developer-submitted game entries. Permissionless directory. |

Full schema documentation: **[NIP.md](NIP.md)**

---

## Developer SDK

Build your own game for the Nostr Arcade.

### Quick Start — Publish a Score

```javascript
// Vanilla JS — works in any browser game
async function publishScore(gameId, score) {
  const event = {
    kind: 34987,
    content: '',
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', gameId],
      ['score', score.toString()],
      ['t', 'arcade'],
      ['t', `arcade-${gameId}`],
      ['alt', `Nostr Arcade high score: ${score} in ${gameId}`],
    ],
  };
  const signed = await window.nostr.signEvent(event); // NIP-07
  const relay = new WebSocket('wss://relay.ditto.pub');
  relay.onopen = () => relay.send(JSON.stringify(['EVENT', signed]));
}
```

### Submit Your Game to the Directory

```javascript
// Publish kind 34988 — appears in Community Games tab immediately
const listing = {
  kind: 34988,
  content: '',
  created_at: Math.floor(Date.now() / 1000),
  tags: [
    ['d', 'my-game'],
    ['name', 'My Awesome Game'],
    ['url', 'https://mygame.example.com'],
    ['description', 'A sovereign browser game'],
    ['repo', 'https://github.com/you/my-game'],
    ['license', 'MIT'],
    ['category', 'action'],
    ['t', 'arcade-game'],      // required for discovery
    ['t', 'nostr-arcade'],     // required for discovery
    ['alt', 'Nostr Arcade game submission: My Awesome Game'],
  ],
};
const signed = await window.nostr.signEvent(listing);
// publish to relay...
```

Full documentation with React hooks, postMessage bridge API, and submission checklist:
**[/sdk](https://0xnostr-arcade.shakespeare.wtf/sdk)** | **[CONTRIBUTING.md](CONTRIBUTING.md)**

---

## Ecosystem

This project stands on the shoulders of pioneers:

### VectorPrivacy
[vectorapp.io](https://vectorapp.io) · [github.com/VectorPrivacy](https://github.com/VectorPrivacy)

Built **Open-Source DOOM** and **Quake III** as serverless P2P WebXDC miniapps — no servers, real-time multiplayer, distributed as 4.2MB chat messages. The gold standard for sovereign gaming.

- [VectorPrivacy/DOOM](https://github.com/VectorPrivacy/DOOM) (GPL-2.0) — original: JSKitty/VectorDoom
- [VectorPrivacy/VectorQuake](https://github.com/VectorPrivacy/VectorQuake) (GPL-2.0) — original: WofWca/quake3.xdc

### YakiHonne
[yakihonne.com](https://yakihonne.com) · [github.com/YakiHonne](https://github.com/YakiHonne)

Pioneered the **Smart Widget protocol** for Nostr miniapps — a lightweight postMessage bridge enabling NIP-07 signing and Lightning payments inside embedded iframes. Our SDK bridge is inspired by their architecture.

- [YakiHonne/smart-widget-handler](https://github.com/YakiHonne/smart-widget-handler) (MIT)
- [YakiHonne/sw-dynamic-api](https://github.com/YakiHonne/sw-dynamic-api) (MIT)

---

## Running Locally

```bash
git clone https://github.com/NostrDanish/Nostr-Arcade.git
cd Nostr-Arcade
npm install
npm run dev
```

Requires Node.js 18+. No environment variables needed — connects to public Nostr relays by default.

### Build for production

```bash
npm run build
# Output in dist/
```

### Run tests

```bash
npm test
```

---

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full guide including:

- How to add a new game
- How to submit a game via Nostr event (kind 34988)
- Code style and PR guidelines
- Security considerations for Nostr games

---

## Roadmap

- [ ] Multiplayer via Nostr pub/sub (real-time relay coordination)
- [ ] WebXDC support (send games as chat messages in Vector Messenger)
- [ ] Tournament system (bracket events on Nostr)
- [ ] Lightning prize pools (zap-funded tournaments)
- [ ] More games: Asteroids, Minesweeper, Chess, Pac-Man clone
- [ ] Nostr DVM (NIP-90) game AI opponents
- [ ] WASM game cores (Rust → WASM for high-performance game loops)
- [ ] Zero-knowledge proofs for verifiable score integrity

---

## License

**MIT** — see [LICENSE](LICENSE)

This means you can fork it, commercialize it, modify it, and redistribute it freely.
The only ask: keep building sovereign, censorship-resistant software.

---

## Credits

Built with [Shakespeare](https://shakespeare.diy) · Powered by [Nostr](https://nostr.com) · Payments via [Lightning](https://lightning.network)

*"Code the fun. Ship the freedom. Let the games begin."* ⚡
