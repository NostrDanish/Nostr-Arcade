# Contributing to Nostr Arcade

Welcome, sovereign builder. This guide covers everything you need to contribute to Nostr Arcade — whether you're adding a new built-in game, submitting via the Nostr protocol, or improving the platform itself.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Ways to Contribute](#ways-to-contribute)
3. [Adding a Built-in Game](#adding-a-built-in-game)
4. [Submitting a Game via Nostr (kind 34988)](#submitting-a-game-via-nostr)
5. [Score Integration (kind 34987)](#score-integration)
6. [postMessage Bridge API](#postmessage-bridge-api)
7. [Development Setup](#development-setup)
8. [Code Style](#code-style)
9. [Security Considerations](#security-considerations)
10. [PR Guidelines](#pr-guidelines)

---

## Philosophy

Every contribution must respect the cypherpunk principles this project is built on:

- **Player sovereignty** — players own their scores, keys, and game state
- **No central servers** — game logic is client-side; relays are the only backend
- **Permissionless** — any developer can submit games without asking permission
- **Open source** — all code is auditable and forkable
- **Privacy by default** — no tracking, no analytics, no telemetry

If a contribution requires a trusted third party, it doesn't belong here.

---

## Ways to Contribute

| Method | Description | Requires PR? |
|--------|-------------|--------------|
| **Nostr kind 34988** | Submit your game to the community directory | No — permissionless |
| **Built-in game PR** | Add a new native game to the arcade | Yes |
| **Bug fix PR** | Fix a bug in an existing game or feature | Yes |
| **Feature PR** | Add new arcade infrastructure | Yes |
| **Documentation** | Improve guides and docs | Yes |

---

## Adding a Built-in Game

Built-in games live in `src/games/`. Each game is a self-contained React component.

### 1. Create the component

```tsx
// src/games/GameYours.tsx

interface Props {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

export function GameYours({ onGameOver, onScoreUpdate }: Props) {
  // Your game logic here
  // Call onScoreUpdate(score) whenever the score changes
  // Call onGameOver(finalScore) when the game ends
  return <div>/* Your game UI */</div>;
}
```

**Required props contract:**

| Prop | Type | When to call |
|------|------|--------------|
| `onScoreUpdate` | `(score: number) => void` | Every time the score changes |
| `onGameOver` | `(score: number) => void` | Exactly once when the game ends |

### 2. Add a game ID to `arcadeKinds.ts`

```typescript
// src/lib/arcadeKinds.ts

export const GAME_IDS = {
  // ... existing games
  YOUR_GAME: 'your-game',   // lowercase, hyphens only
} as const;
```

### 3. Register in BUILTIN_GAMES

```typescript
// src/lib/arcadeKinds.ts — add to BUILTIN_GAMES array

{
  id: GAME_IDS.YOUR_GAME,
  name: 'Your Game',
  emoji: '🎯',
  desc: 'One-sentence description of your game.',
  tags: ['Action', 'Single-player'],
  color: 'blue',
  textClass: 'text-blue-400',
  borderClass: 'border-blue-500/30 hover:border-blue-400/60',
  glowClass: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
  badgeClass: 'bg-blue-900/40 text-blue-300 border-blue-500/30',
  bgClass: 'from-blue-900/20 to-transparent',
},
```

### 4. Wire up in GamePage.tsx

```tsx
// src/pages/GamePage.tsx

import { GameYours } from '@/games/GameYours';

// In GAME_META:
[GAME_IDS.YOUR_GAME]: {
  name: 'Your Game', emoji: '🎯', desc: 'Brief desc.',
  textClass: 'text-blue-400', borderClass: 'border-blue-500/30',
},

// In the render block:
{validGameId === GAME_IDS.YOUR_GAME && (
  <GameYours onGameOver={handleGameOver} onScoreUpdate={handleScoreUpdate} />
)}
```

### 5. Mobile requirements

Every built-in game **must** work on mobile. Checklist:

- [ ] Touch events handled (tap, swipe, or on-screen d-pad)
- [ ] Responsive sizing — use `max-w-full` and percentage widths
- [ ] Canvas games: `style={{ maxWidth: '100%', height: 'auto' }}`
- [ ] No hover-only interactions on mobile
- [ ] On-screen d-pad buttons for directional games (see `GameSnake.tsx` for example)
- [ ] Minimum tap target size: 44×44px (Apple HIG)

---

## Submitting a Game via Nostr

This is the **permissionless path** — no PR needed.

Publish a **kind 34988** addressable event with these tags:

```json
{
  "kind": 34988,
  "content": "",
  "tags": [
    ["d", "your-game-slug"],
    ["name", "Your Game Name"],
    ["url", "https://yourgame.example.com"],
    ["description", "What your game is and how to play it"],
    ["image", "https://yourgame.example.com/cover.png"],
    ["repo", "https://github.com/you/your-game"],
    ["license", "MIT"],
    ["category", "action"],
    ["t", "arcade-game"],
    ["t", "nostr-arcade"],
    ["alt", "Nostr Arcade game submission: Your Game Name"]
  ]
}
```

**Via the arcade UI:** Visit [/submit](https://0xnostr-arcade.shakespeare.wtf/submit)

**Via Nostr CLI:**
```bash
# Using nak (https://github.com/fiatjaf/nak)
nak event --kind 34988 \
  -t d=your-game-slug \
  -t name="Your Game" \
  -t url="https://yourgame.example.com" \
  -t description="Your description" \
  -t t=arcade-game \
  -t t=nostr-arcade \
  -t alt="Nostr Arcade game submission: Your Game" \
  wss://relay.ditto.pub
```

Your listing will appear in the **Community Games** tab as soon as the event propagates.

### Requirements for community submissions

- Game must run entirely in the browser (no required server)
- Must be playable on mobile (responsive layout or touch controls)
- Must load over HTTPS
- No malicious code, malware, or phishing

---

## Score Integration

To publish scores from your game, implement kind 34987:

```javascript
async function publishScore(gameId, score, level) {
  const tags = [
    ['d', gameId],
    ['score', score.toString()],
    ['t', 'arcade'],
    ['t', `arcade-${gameId}`],
    ['alt', `Nostr Arcade high score: ${score} in ${gameId}`],
  ];
  if (level !== undefined) tags.push(['level', level.toString()]);

  const event = {
    kind: 34987,
    content: '',
    created_at: Math.floor(Date.now() / 1000),
    tags,
  };

  // NIP-07 signing (browser extension)
  const signed = await window.nostr.signEvent(event);

  // Publish
  const ws = new WebSocket('wss://relay.ditto.pub');
  ws.onopen = () => ws.send(JSON.stringify(['EVENT', signed]));
}
```

**Important:** Kind 34987 is addressable — publishing a new event with the same `d` tag **replaces** the old one on the relay. This means each player has exactly one high-score record per game. Only submit when the player beats their previous best, or always submit and let the relay deduplicate.

---

## postMessage Bridge API

If your game runs inside an iframe (embedded in a Nostr client), use the postMessage API to request signing and payments from the host — compatible with YakiHonne Smart Widget format.

### From your game (client)

```javascript
// Tell host you're ready
window.parent.postMessage({ kind: 'app-loaded' }, '*');

// Request score signing + publishing
window.parent.postMessage({
  kind: 'sign-publish',
  data: {
    kind: 34987,
    content: '',
    tags: [['d', 'your-game'], ['score', '9001'], ['t', 'arcade']],
  },
}, '*');

// Request Lightning payment (zap to continue)
window.parent.postMessage({
  kind: 'payment-request',
  data: { address: 'player@wallet.example.com', amount: 21 },
}, '*');

// Listen for responses
window.addEventListener('message', ({ data }) => {
  if (data.kind === 'user-metadata') {
    // data.data = { pubkey, display_name, lud16, ... }
  }
  if (data.kind === 'nostr-event') {
    // Signed event returned
  }
  if (data.kind === 'payment-response') {
    // data.data = { status: true, preImage: '...' }
  }
});
```

### Message types

| Kind | Direction | Description |
|------|-----------|-------------|
| `app-loaded` | Client → Host | Widget is ready |
| `sign-event` | Client → Host | Request signature (don't publish) |
| `sign-publish` | Client → Host | Request signature + publish |
| `payment-request` | Client → Host | Request Lightning payment |
| `custom-data` | Client → Host | Arbitrary data |
| `user-metadata` | Host → Client | Connected user's Nostr profile |
| `nostr-event` | Host → Client | Signed/published event |
| `payment-response` | Host → Client | Payment result |
| `err-msg` | Host → Client | Error from host |

This API is compatible with [YakiHonne's smart-widget-handler](https://github.com/YakiHonne/smart-widget-handler).

---

## Development Setup

```bash
# Clone
git clone https://github.com/NostrDanish/Nostr-Arcade.git
cd Nostr-Arcade

# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Type-check
npx tsc --noEmit

# Build production bundle
npm run build

# Run full test suite
npm test
```

**Requirements:**
- Node.js 18+
- npm 9+
- No environment variables needed
- Connects to public Nostr relays by default

**Recommended tools:**
- A NIP-07 browser extension (Alby, nos2x, Nostore) for testing score publishing
- [nak](https://github.com/fiatjaf/nak) CLI for publishing test events

---

## Code Style

- **TypeScript** everywhere — no `any` types
- **React functional components** with hooks only
- **Tailwind CSS** for all styling — no inline styles except computed game dimensions
- **shadcn/ui** components for UI primitives
- Use `cn()` from `@/lib/utils` for conditional class merging
- Name game components `Game<Name>.tsx` in `src/games/`
- Keep each game self-contained — no shared mutable state between games
- Follow existing patterns in `GameSnake.tsx` (interval-based) or `GameBreakout.tsx` (rAF-based)

### File naming

```
src/games/GameYourGame.tsx      # Game component
src/hooks/useYourHook.ts        # Custom hooks
src/pages/YourPage.tsx          # Route pages
src/lib/yourUtils.ts            # Pure utility functions
```

### Commits

Use conventional commit format:

```
feat: add Asteroids game with Nostr score publishing
fix: snake game d-pad not working on iOS Safari
docs: update SDK guide with vanilla JS examples
refactor: extract score validation into useArcadeScore hook
```

---

## Security Considerations

Nostr is permissionless — **anyone can publish any event**. Keep these in mind:

### Leaderboard integrity

Scores are signed by the player's private key. They cannot be forged without the key. However, a player could modify the client-side game to submit inflated scores. Mitigations in progress:

- [ ] Zero-knowledge proofs for move verification
- [ ] On-chain score commitment schemes
- [ ] Community flagging via reaction events

For now, the leaderboard is **opt-in and social** — players choose to publish. Obvious cheating can be filtered by clients.

### Community game submissions

Kind 34988 events are permissionless. The arcade **does not embed untrusted iframes** directly — external games open in a new tab. This prevents XSS and clickjacking attacks from malicious submissions.

### Private keys

**Never** request or handle private keys in game code. Always use:
- `window.nostr.signEvent()` (NIP-07 extension)
- The postMessage bridge to request signing from the host
- NIP-46 remote signing for advanced use cases

---

## PR Guidelines

1. **One feature per PR** — keep diffs reviewable
2. **Test on mobile** before submitting (Chrome DevTools device emulation minimum)
3. **No new external dependencies** without discussion — bundle size matters
4. **Update NIP.md** if you change event schemas
5. **Add your game to BUILTIN_GAMES** if it's a new built-in game
6. **Credit original authors** if your game is a port or fork

### PR checklist

- [ ] Game works on mobile (tested on real device or emulator)
- [ ] TypeScript compiles without errors (`npm test` passes)
- [ ] No `any` types introduced
- [ ] Follows `Props` contract (`onGameOver` + `onScoreUpdate`)
- [ ] Added to `BUILTIN_GAMES` registry in `arcadeKinds.ts`
- [ ] Wired up in `GamePage.tsx`
- [ ] On-screen d-pad for directional games
- [ ] Credits included for ported/forked games

---

## Questions?

Open an issue on GitHub or find the Nostr Arcade on Nostr:

- GitHub: [github.com/NostrDanish/Nostr-Arcade](https://github.com/NostrDanish/Nostr-Arcade)
- Live: [0xnostr-arcade.shakespeare.wtf](https://0xnostr-arcade.shakespeare.wtf)
- SDK guide: [/sdk](https://0xnostr-arcade.shakespeare.wtf/sdk)

---

*"Code the fun. Ship the freedom. Let the games begin."* ⚡
