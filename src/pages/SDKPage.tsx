import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

function CodeBlock({ code, lang = 'typescript' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl bg-zinc-950 border border-zinc-800/60 overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/40">
        <span className="text-xs text-zinc-500 font-mono">{lang}</span>
        <Button variant="ghost" size="sm" onClick={copy} className="h-6 px-2 text-xs text-zinc-400 hover:text-zinc-200">
          {copied ? <CheckCircle className="w-3 h-3 mr-1 text-green-400" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="p-4 text-sm text-zinc-300 overflow-x-auto leading-relaxed">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-20">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="w-1 h-7 bg-purple-500 rounded-full" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SDKPage() {
  useSeoMeta({
    title: 'Developer SDK — Nostr Arcade',
    description: 'Build games for the Nostr Arcade. Submit your game via Nostr events, implement the score API, and join the sovereign gaming ecosystem.',
  });

  return (
    <div className="min-h-screen arcade-grid">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200 gap-1">
              <ArrowLeft className="w-4 h-4" /> Arcade
            </Button>
          </Link>
          <div className="font-bold text-purple-400 neon-glow-purple">Developer SDK</div>
          <Badge variant="outline" className="border-green-500/40 text-green-400 text-xs ml-auto">Open Source</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="text-5xl mb-4">🛠️</div>
          <h1 className="text-4xl font-black text-white mb-4">
            Build for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Nostr Arcade
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The Nostr Arcade is an open platform. Any developer can submit games, build integrations,
            or fork the entire arcade. Here's everything you need to get started.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6 text-xs">
            {['No approval required', 'Permissionless', 'Cryptographically signed', 'Self-sovereign'].map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-400">{t}</span>
            ))}
          </div>
        </div>

        {/* TOC */}
        <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/50 p-6 mb-12">
          <div className="text-sm font-semibold text-zinc-300 mb-4">Contents</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {[
              ['#overview', '1. How it Works'],
              ['#score-api', '2. Score API (Kind 34987)'],
              ['#submit-game', '3. Submit Your Game (Kind 34988)'],
              ['#sdk-bridge', '4. SDK Bridge (postMessage)'],
              ['#yakihonne', '5. YakiHonne Smart Widgets'],
              ['#vector', '6. Vector WebXDC Games'],
              ['#checklist', '7. Submission Checklist'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-purple-400 hover:text-purple-300 flex items-center gap-1">
                → {label}
              </a>
            ))}
          </div>
        </div>

        {/* Section 1 */}
        <Section id="overview" title="How It Works">
          <p className="text-zinc-400 leading-relaxed mb-4">
            The Nostr Arcade uses two custom event kinds to create a permissionless game platform:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { kind: '34987', name: 'Arcade Score', range: 'Addressable', desc: 'One high-score per player per game. Signed with your Nostr key. Immutable.' },
              { kind: '34988', name: 'Game Listing', range: 'Addressable', desc: 'Submit your game to the community directory. Anyone can discover and play it.' },
            ].map(k => (
              <div key={k.kind} className="rounded-xl border border-purple-500/20 bg-zinc-900/60 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-purple-500/40 text-purple-300 font-mono text-xs">kind:{k.kind}</Badge>
                  <span className="text-xs text-zinc-500">{k.range}</span>
                </div>
                <div className="font-semibold text-zinc-200 mb-1">{k.name}</div>
                <div className="text-sm text-zinc-400">{k.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Both kinds use the <strong className="text-zinc-200">d-tag</strong> as the unique identifier,
            making them addressable — publishing a new event with the same d-tag replaces the old one.
            This means scores are automatically updated when a player beats their personal best.
          </p>
        </Section>

        {/* Section 2 */}
        <Section id="score-api" title="Score API — Kind 34987">
          <p className="text-zinc-400 mb-4">
            To publish a player's score, publish an addressable event with kind <code className="text-purple-300">34987</code>.
            The <code className="text-purple-300">d</code> tag is your game's unique identifier (slug).
          </p>

          <h3 className="text-lg font-semibold text-zinc-200 mb-2">Event Schema</h3>
          <CodeBlock lang="json" code={`{
  "kind": 34987,
  "content": "",
  "tags": [
    ["d", "my-game"],          // Required: unique game slug
    ["score", "42000"],        // Required: integer score as string
    ["level", "5"],            // Optional: level/stage reached
    ["t", "arcade"],           // Required: category tags
    ["t", "arcade-my-game"],   // Required: game-specific tag
    ["alt", "Nostr Arcade high score: 42000 in my-game"]  // NIP-31
  ]
}`} />

          <h3 className="text-lg font-semibold text-zinc-200 mb-2 mt-6">React Hook (copy-paste ready)</h3>
          <CodeBlock code={`import { useNostr } from '@nostrify/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const KIND_ARCADE_SCORE = 34987;

// Publish a score
export function usePublishScore(gameId: string) {
  const queryClient = useQueryClient();
  // ... (see useNostrPublish in the arcade source)
  return useMutation({
    mutationFn: async ({ score, level }: { score: number; level?: number }) => {
      const tags = [
        ['d', gameId],
        ['score', score.toString()],
        ['t', 'arcade'],
        ['t', \`arcade-\${gameId}\`],
        ['alt', \`Nostr Arcade high score: \${score} in \${gameId}\`],
      ];
      if (level !== undefined) tags.push(['level', level.toString()]);
      // sign and publish with nostr.event(...)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['arcade', gameId] }),
  });
}

// Query global leaderboard
export function useLeaderboard(gameId: string) {
  const { nostr } = useNostr();
  return useQuery({
    queryKey: ['arcade', 'leaderboard', gameId],
    queryFn: async () => {
      const events = await nostr.query([{
        kinds: [KIND_ARCADE_SCORE],
        '#d': [gameId],
        limit: 200,
      }]);
      // Deduplicate by pubkey, sort by score descending
      const byPubkey = new Map();
      for (const e of events) {
        const existing = byPubkey.get(e.pubkey);
        if (!existing || e.created_at > existing.created_at) byPubkey.set(e.pubkey, e);
      }
      return [...byPubkey.values()]
        .map(e => ({ pubkey: e.pubkey, score: parseInt(e.tags.find(t => t[0]==='score')?.[1] ?? '0') }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);
    },
  });
}`} />

          <h3 className="text-lg font-semibold text-zinc-200 mb-2 mt-6">Vanilla JS (no framework)</h3>
          <CodeBlock lang="javascript" code={`// Using window.nostr (NIP-07 browser extension)
async function publishScore(gameId, score) {
  const event = {
    kind: 34987,
    content: '',
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['d', gameId],
      ['score', score.toString()],
      ['t', 'arcade'],
      ['t', \`arcade-\${gameId}\`],
      ['alt', \`Nostr Arcade high score: \${score} in \${gameId}\`],
    ],
  };

  // Sign with NIP-07 extension
  const signed = await window.nostr.signEvent(event);

  // Publish to relays
  const relay = new WebSocket('wss://relay.ditto.pub');
  relay.onopen = () => {
    relay.send(JSON.stringify(['EVENT', signed]));
  };
}

// Query leaderboard
async function getLeaderboard(gameId, limit = 50) {
  const relay = new WebSocket('wss://relay.ditto.pub');
  return new Promise((resolve) => {
    const events = [];
    relay.onopen = () => {
      relay.send(JSON.stringify([
        'REQ', 'leaderboard',
        { kinds: [34987], '#d': [gameId], limit: 200 }
      ]));
    };
    relay.onmessage = (msg) => {
      const [type, , event] = JSON.parse(msg.data);
      if (type === 'EVENT') events.push(event);
      if (type === 'EOSE') {
        relay.close();
        // Dedupe + sort
        const byPubkey = new Map();
        events.forEach(e => {
          const ex = byPubkey.get(e.pubkey);
          if (!ex || e.created_at > ex.created_at) byPubkey.set(e.pubkey, e);
        });
        resolve([...byPubkey.values()]
          .map(e => ({ pubkey: e.pubkey, score: parseInt(e.tags.find(t => t[0]==='score')?.[1]) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit));
      }
    };
  });
}`} />
        </Section>

        {/* Section 3 */}
        <Section id="submit-game" title="Submit Your Game — Kind 34988">
          <p className="text-zinc-400 mb-4">
            To list your game in the Nostr Arcade community directory, publish a kind <code className="text-purple-300">34988</code> event.
            No permission required — just sign and broadcast.
          </p>
          <CodeBlock lang="json" code={`{
  "kind": 34988,
  "content": "",
  "tags": [
    ["d", "my-awesome-game"],         // Unique slug (max 64 chars, lowercase)
    ["name", "My Awesome Game"],
    ["url", "https://mygame.example.com"],
    ["description", "A sovereign browser game built on Nostr"],
    ["image", "https://mygame.example.com/screenshot.png"],
    ["repo", "https://github.com/you/my-game"],
    ["license", "MIT"],
    ["category", "action"],           // action | puzzle | multiplayer | adventure | classic
    ["t", "arcade-game"],             // Required for discovery
    ["t", "nostr-arcade"],            // Required for discovery
    ["t", "action"],                  // Additional category tags
    ["alt", "Nostr Arcade game submission: My Awesome Game"]
  ]
}`} />
          <p className="text-zinc-400 mt-4 leading-relaxed">
            Your game will appear in the Community Games tab of the Nostr Arcade once the event propagates
            to relays. The listing is controlled entirely by you — update it by publishing a new event with the same d-tag.
          </p>

          <div className="mt-6 p-4 rounded-xl border border-yellow-500/20 bg-yellow-950/20">
            <div className="text-sm font-semibold text-yellow-300 mb-2">⚡ Submit via the arcade UI</div>
            <div className="text-sm text-zinc-400">
              Visit the <Link to="/submit" className="text-yellow-400 underline">Submit Game</Link> page
              to publish your kind 34988 event directly from the arcade using your connected Nostr identity.
            </div>
          </div>
        </Section>

        {/* Section 4 */}
        <Section id="sdk-bridge" title="SDK Bridge — postMessage API">
          <p className="text-zinc-400 mb-4">
            If your game runs in an iframe (embedded in a Nostr client), use the postMessage bridge
            to request Nostr event signing and Lightning payments from the host — inspired by the
            YakiHonne Smart Widget handler.
          </p>
          <CodeBlock lang="javascript" code={`// In your game (inside the iframe / miniapp)
// -----------------------------------------------

// 1. Notify host that your game is ready
window.parent.postMessage({ kind: 'app-loaded' }, '*');

// 2. Listen for the user context from host
window.addEventListener('message', (event) => {
  const { kind, data } = event.data;

  if (kind === 'user-metadata') {
    // data = { pubkey, display_name, name, picture, lud16, ... }
    console.log('Player logged in:', data.display_name);
    initGameWithUser(data);
  }

  if (kind === 'nostr-event') {
    // Host signed and/or published an event for us
    console.log('Signed event:', data);
  }

  if (kind === 'payment-response') {
    // data = { status: true, preImage: '...' }
    if (data.status) onZapSuccess();
    else onZapFailed();
  }
});

// 3. Request Nostr event signing (e.g. high score)
function publishScore(score) {
  window.parent.postMessage({
    kind: 'sign-publish',
    data: {
      kind: 34987,
      content: '',
      tags: [
        ['d', 'my-game'],
        ['score', score.toString()],
        ['t', 'arcade'],
        ['alt', \`Score: \${score}\`],
      ],
    },
  }, '*');
}

// 4. Request Lightning zap (e.g. zap-to-continue)
function zapToContinue(sats = 21) {
  window.parent.postMessage({
    kind: 'payment-request',
    data: {
      address: 'arcade@nostrarcade.com', // LNURL or Lightning address
      amount: sats,
    },
  }, '*');
}`} />

          <CodeBlock lang="javascript" code={`// In the host (Nostr client embedding your game)
// -----------------------------------------------
import SWHandler from 'smart-widget-handler'; // npm i smart-widget-handler

const iframe = document.getElementById('game-iframe');

// Send user context to the game
SWHandler.host.sendContext({
  pubkey: currentUser.npub,
  display_name: currentUser.displayName,
  lud16: currentUser.lightning,
}, 'https://yourapp.com', 'https://mygame.example.com', iframe);

// Listen for game requests
const listener = SWHandler.host.listen(async (data) => {
  if (data.kind === 'sign-publish') {
    // Sign and publish the event on behalf of the user
    const signed = await window.nostr.signEvent(data.data);
    await relay.publish(signed);
    SWHandler.host.sendContext({ signedEvent: signed }, ...);
  }
  if (data.kind === 'payment-request') {
    const paid = await webln.sendPayment(data.data.address, data.data.amount);
    SWHandler.host.sendPaymentResponse(
      { status: !!paid, preImage: paid?.preimage },
      'https://mygame.example.com', iframe
    );
  }
});`} />
        </Section>

        {/* Section 5 */}
        <Section id="yakihonne" title="YakiHonne Smart Widgets">
          <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/50 p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🟡</div>
              <div>
                <div className="font-bold text-zinc-200 mb-2 flex items-center gap-2">
                  YakiHonne Smart Widget Ecosystem
                  <a href="https://yakihonne.com" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    yakihonne.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  YakiHonne pioneered the Smart Widget protocol for Nostr — a lightweight host/client bridge
                  over postMessage that enables Nostr signing, Lightning payments, and rich interaction
                  inside embedded iframes. This is the gold standard for Nostr miniapps today.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href="https://github.com/YakiHonne/smart-widget-handler" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-yellow-500/40 text-yellow-400 gap-1 text-xs">
                      <ExternalLink className="w-3 h-3" /> smart-widget-handler
                    </Button>
                  </a>
                  <a href="https://github.com/YakiHonne/sw-dynamic-api" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-yellow-500/40 text-yellow-400 gap-1 text-xs">
                      <ExternalLink className="w-3 h-3" /> sw-dynamic-api (boilerplate)
                    </Button>
                  </a>
                  <a href="https://github.com/YakiHonne/smart-widget-builder" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-yellow-500/40 text-yellow-400 gap-1 text-xs">
                      <ExternalLink className="w-3 h-3" /> smart-widget-builder
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Section 6 */}
        <Section id="vector" title="Vector WebXDC Games">
          <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/50 p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🔴</div>
              <div>
                <div className="font-bold text-zinc-200 mb-2 flex items-center gap-2">
                  VectorPrivacy — P2P Gaming via WebXDC
                  <a href="https://vectorapp.io" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    vectorapp.io <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  VectorPrivacy built DOOM and Quake III as <strong className="text-zinc-300">WebXDC</strong> chat miniapps
                  — tiny compressed files (4.2MB for DOOM!) that run directly inside a chat message.
                  No servers. No app store. Real-time P2P multiplayer via gossip protocols. This is the future.
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  WebXDC is an open standard for sandboxed in-chat apps. It works in Delta Chat, Vector Messenger,
                  and other compatible clients. Build once, deploy everywhere — as a chat message.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href="https://github.com/VectorPrivacy/DOOM" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-red-500/40 text-red-400 gap-1 text-xs">
                      <ExternalLink className="w-3 h-3" /> VectorDOOM (GPL-2.0)
                    </Button>
                  </a>
                  <a href="https://github.com/VectorPrivacy/VectorQuake" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-red-500/40 text-red-400 gap-1 text-xs">
                      <ExternalLink className="w-3 h-3" /> VectorQuake
                    </Button>
                  </a>
                  <a href="https://vectorapp.io" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="border-red-500/40 text-red-400 gap-1 text-xs">
                      <ExternalLink className="w-3 h-3" /> Vector Messenger
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Section 7 */}
        <Section id="checklist" title="Submission Checklist">
          <div className="space-y-3">
            {[
              ['Game runs 100% client-side (no required backend)', '✅'],
              ['Works on mobile (touch controls or responsive layout)', '✅'],
              ['Uses HTTPS / loads from a secure origin', '✅'],
              ['Implements kind 34987 score publishing (or uses SDK bridge)', '✅'],
              ['Publishes kind 34988 listing with correct tags', '✅'],
              ['Open source preferred (include repo + license tags)', '⭐'],
              ['No tracking, no telemetry, no ads', '✅'],
              ["Respects player's Nostr identity (NIP-07 or bridge)", '✅'],
            ].map(([item, icon]) => (
              <div key={String(item)} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/40">
                <span className="text-lg">{icon}</span>
                <span className="text-sm text-zinc-300">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-950/40 to-cyan-950/30 border border-purple-500/20 text-center">
            <div className="text-2xl mb-3">⚡</div>
            <div className="text-lg font-bold text-white mb-2">Ready to ship?</div>
            <div className="text-zinc-400 text-sm mb-4">Submit your game to the community directory</div>
            <Link to="/submit">
              <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                Submit Your Game
              </Button>
            </Link>
          </div>
        </Section>
      </div>
    </div>
  );
}

export default SDKPage;
