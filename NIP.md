# Nostr Arcade — Custom Event Kinds

## Kind 34987: Arcade High Score

**Range:** Addressable (30000–39999)  
**Status:** Draft — Nostr Arcade custom kind

---

### Summary

Kind `34987` represents a player's **personal best score** for a specific arcade game.
One canonical high-score record per `(pubkey, kind, d-tag)` triple. Submitting a higher score replaces the previous event.

### Event Schema

```json
{
  "kind": 34987,
  "content": "",
  "tags": [
    ["d", "<game-id>"],
    ["score", "<integer-score>"],
    ["level", "<integer-level>"],
    ["t", "arcade"],
    ["t", "arcade-<game-id>"],
    ["alt", "Nostr Arcade high score: <score> in <game-id>"]
  ]
}
```

### Tags

| Tag | Required | Description |
|-----|----------|-------------|
| `d` | ✅ | Game identifier. Known values: `2048`, `snake`, `flappy`, `tetris`, `memory`, `breakout` |
| `score` | ✅ | Integer score as decimal string |
| `level` | ❌ | Optional level/stage reached |
| `t` | ✅ | Always includes `arcade` and `arcade-<game-id>` |
| `alt` | ✅ | NIP-31 human-readable description |

---

## Kind 34988: Community Game Listing

**Range:** Addressable (30000–39999)  
**Status:** Draft — Nostr Arcade custom kind

---

### Summary

Kind `34988` allows any developer to submit their game to the Nostr Arcade community directory.
No approval required — publish the event and it appears on the platform.

### Event Schema

```json
{
  "kind": 34988,
  "content": "",
  "tags": [
    ["d", "<game-slug>"],
    ["name", "<Game Name>"],
    ["url", "https://mygame.example.com"],
    ["description", "A brief description of the game"],
    ["image", "https://mygame.example.com/cover.png"],
    ["repo", "https://github.com/you/my-game"],
    ["license", "MIT"],
    ["category", "action"],
    ["t", "arcade-game"],
    ["t", "nostr-arcade"],
    ["t", "<additional-tag>"],
    ["alt", "Nostr Arcade game submission: <Game Name>"]
  ]
}
```

### Tags

| Tag | Required | Description |
|-----|----------|-------------|
| `d` | ✅ | Unique slug (max 64 chars, lowercase + hyphens) |
| `name` | ✅ | Display name of the game |
| `url` | ✅ | Playable game URL |
| `description` | ✅ | Short description |
| `image` | ❌ | Screenshot or cover image URL |
| `repo` | ❌ | Source code repository URL |
| `license` | ❌ | SPDX license identifier (MIT, GPL-2.0, etc.) |
| `category` | ❌ | `action`, `puzzle`, `multiplayer`, `adventure`, `classic` |
| `t` | ✅ | Must include `arcade-game` and `nostr-arcade` for discovery |
| `alt` | ✅ | NIP-31 human-readable description |

### Querying Community Games

```json
{ "kinds": [34988], "#t": ["arcade-game"], "limit": 100 }
```

---

## Game IDs (Kind 34987)

| `d` value | Game |
|-----------|------|
| `2048`    | 2048 tile puzzle |
| `snake`   | Classic Snake |
| `flappy`  | Nostr Bird (Flappy clone) |
| `tetris`  | Tetris |
| `memory`  | Memory Match |
| `breakout`| Breakout |

---

## Ecosystem Credits

This arcade draws inspiration from:

- **VectorPrivacy** (https://vectorapp.io) — Open-Source DOOM + Quake III as serverless P2P WebXDC games. Original authors: JSKitty, WofWca.
- **YakiHonne** (https://yakihonne.com) — Smart Widget protocol for Nostr miniapps. PostMessage bridge for NIP-07 signing + Lightning payments.

---

*"Code the fun. Ship the freedom. Let the games begin."*
