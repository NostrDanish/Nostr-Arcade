# Nostr Arcade — Custom Event Kind

## Kind 34987: Arcade High Score

**Range:** Addressable (30000–39999)  
**Status:** Draft — Nostr Arcade project custom kind

---

### Summary

Kind `34987` represents a player's **personal best score** for a specific arcade game.
Because this is an addressable event, each `(pubkey, kind, d-tag)` triple is unique,
meaning a player has exactly **one canonical high-score record per game** on the network.
Submitting a higher score simply replaces the previous event on relays.

---

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

---

### Tags

| Tag | Required | Description |
|-----|----------|-------------|
| `d` | ✅ | Game identifier string. Known values: `2048`, `snake`, `flappy` |
| `score` | ✅ | Integer score as a decimal string |
| `level` | ❌ | Optional level/stage reached (integer string) |
| `t` | ✅ | Always includes `arcade` and `arcade-<game-id>` for relay filtering |
| `alt` | ✅ | NIP-31 human-readable description for clients that don't support this kind |

---

### `content`

The `content` field is always empty (`""`). All data lives in tags for relay-level indexing.

---

### Querying

**All scores for a specific game (global leaderboard):**
```json
{ "kinds": [34987], "#d": ["snake"], "limit": 200 }
```

**A specific player's best score:**
```json
{ "kinds": [34987], "#d": ["2048"], "authors": ["<pubkey-hex>"], "limit": 1 }
```

**All arcade scores from a player:**
```json
{ "kinds": [34987], "#t": ["arcade"], "authors": ["<pubkey-hex>"] }
```

---

### Security Notes

- Scores are signed with the player's Nostr keypair. Forgery is computationally infeasible.
- Client-side game logic means scores could theoretically be inflated locally. Future versions
  may incorporate zero-knowledge proofs for verifiable fairness.
- Relay operators can implement rate-limiting or score-range sanity checks as optional policy.

---

### Game IDs

| `d` value | Game |
|-----------|------|
| `2048`    | 2048 tile puzzle |
| `snake`   | Classic Snake |
| `flappy`  | Nostr Bird (Flappy clone) |

---

*"Code the fun. Ship the freedom. Let the games begin."*
