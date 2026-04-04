/**
 * Nostr Arcade — Custom Event Kinds
 *
 * Kind 34987: Arcade High Score (Addressable)
 * Each player publishes at most ONE high-score event per game (replaceable by d-tag).
 * d-tag = game identifier (e.g. "2048", "snake", "flappy")
 *
 * See NIP.md for full schema documentation.
 */
export const KIND_ARCADE_SCORE = 34987;

/** Supported game identifiers */
export const GAME_IDS = {
  GAME_2048: '2048',
  SNAKE: 'snake',
  FLAPPY: 'flappy',
} as const;

export type GameId = (typeof GAME_IDS)[keyof typeof GAME_IDS];

export interface ArcadeScoreEvent {
  /** The game identifier */
  gameId: GameId;
  /** The player's best score */
  score: number;
  /** Optional extra metadata (level reached, etc.) */
  level?: number;
}
