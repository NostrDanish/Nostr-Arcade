import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSubmitGame } from '@/hooks/useCommunityGames';
import { LoginArea } from '@/components/auth/LoginArea';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface FormValues {
  name: string;
  slug: string;
  url: string;
  description: string;
  imageUrl: string;
  repoUrl: string;
  license: string;
  category: string;
  tags: string;
}

export function SubmitGamePage() {
  useSeoMeta({
    title: 'Submit Your Game — Nostr Arcade',
    description: 'Submit your browser game to the Nostr Arcade community directory. No permission required.',
  });

  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: submitGame, isPending } = useSubmitGame();
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { category: 'action', license: 'MIT' },
  });

  const nameValue = watch('name');
  // Auto-generate slug from name
  const autoSlug = (nameValue ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    try {
      await submitGame({
        slug: data.slug || autoSlug,
        name: data.name,
        description: data.description,
        url: data.url,
        imageUrl: data.imageUrl || undefined,
        repoUrl: data.repoUrl || undefined,
        license: data.license || undefined,
        category: data.category,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setSubmitted(true);
      toast({ title: '🎮 Game submitted!', description: 'Your game is now live on Nostr relays.' });
    } catch {
      toast({ title: 'Submission failed', description: 'Check your Nostr connection', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen arcade-grid">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200 gap-1">
              <ArrowLeft className="w-4 h-4" /> Arcade
            </Button>
          </Link>
          <div className="font-bold text-purple-400 neon-glow-purple">Submit Game</div>
          <div className="ml-auto"><LoginArea className="max-w-48" /></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Intro */}
        <div className="mb-8 text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h1 className="text-3xl font-black text-white mb-3">Submit Your Game</h1>
          <p className="text-zinc-400 leading-relaxed max-w-lg mx-auto">
            Publish a Nostr event (kind 34988) to list your game in the community directory.
            No approval. No gatekeepers. Just sign and broadcast.
          </p>
          <div className="mt-4">
            <Link to="/sdk" className="text-purple-400 hover:text-purple-300 text-sm flex items-center justify-center gap-1">
              <ExternalLink className="w-3 h-3" /> Read the SDK guide first
            </Link>
          </div>
        </div>

        {!user ? (
          <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-8 text-center">
            <div className="text-3xl mb-4">🔑</div>
            <div className="text-lg font-semibold text-purple-300 mb-2">Login required</div>
            <div className="text-zinc-400 text-sm mb-6">
              Connect your Nostr identity to sign and publish your game listing.
            </div>
            <LoginArea className="w-full max-w-xs mx-auto" />
          </div>
        ) : submitted ? (
          <div className="rounded-xl border border-green-500/30 bg-green-950/20 p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <div className="text-xl font-bold text-green-400 mb-2">Game submitted! 🎉</div>
            <p className="text-zinc-400 text-sm mb-6">
              Your kind 34988 event has been published to Nostr relays. It will appear in the Community Games tab
              as relays propagate the event (usually within a minute).
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-500 text-white">
                Back to Arcade
              </Button>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="border-zinc-700 text-zinc-300">
                Submit Another
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/50 p-6 space-y-5">
              <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase">Game Info</h2>

              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Game Name *</Label>
                <Input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g. My Awesome Nostr Game"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Slug (d-tag) *</Label>
                <Input
                  {...register('slug')}
                  placeholder={autoSlug || 'my-awesome-game'}
                  className="bg-zinc-800 border-zinc-700 text-white font-mono"
                />
                <p className="text-xs text-zinc-500">Lowercase letters, numbers, hyphens only. Will auto-fill from name.</p>
              </div>

              {/* URL */}
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Game URL *</Label>
                <Input
                  {...register('url', { required: 'URL is required', pattern: { value: /^https?:\/\/.+/, message: 'Must be a valid URL' } })}
                  placeholder="https://mygame.example.com"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                {errors.url && <p className="text-xs text-red-400">{errors.url.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Description *</Label>
                <Textarea
                  {...register('description', { required: 'Description is required' })}
                  placeholder="What is your game about? How do you play it?"
                  className="bg-zinc-800 border-zinc-700 text-white resize-none"
                  rows={3}
                />
                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/50 p-6 space-y-5">
              <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase">Optional Details</h2>

              {/* Image */}
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Screenshot / Cover Image URL</Label>
                <Input
                  {...register('imageUrl')}
                  placeholder="https://mygame.example.com/cover.png"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* Repo */}
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Source Code Repository</Label>
                <Input
                  {...register('repoUrl')}
                  placeholder="https://github.com/you/my-game"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              {/* Category + License */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-zinc-300">Category</Label>
                  <Select onValueChange={(v) => setValue('category', v)} defaultValue="action">
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {['action', 'puzzle', 'multiplayer', 'adventure', 'classic'].map(c => (
                        <SelectItem key={c} value={c} className="text-white capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-300">License</Label>
                  <Input
                    {...register('license')}
                    placeholder="MIT, GPL-2.0, etc."
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Tags (comma-separated)</Label>
                <Input
                  {...register('tags')}
                  placeholder="nostr, lightning, puzzle, mobile"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            {/* What gets published */}
            <div className="rounded-xl border border-zinc-700/30 bg-zinc-900/30 p-4 text-xs text-zinc-500">
              <strong className="text-zinc-400">What gets published:</strong> A signed Nostr event (kind 34988)
              containing your game metadata. It will be stored on relays and displayed in the Community Games tab.
              You can update it anytime by publishing a new event with the same slug.
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 text-base"
            >
              {isPending ? 'Publishing to Nostr...' : '⚡ Publish Game Listing'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default SubmitGamePage;
