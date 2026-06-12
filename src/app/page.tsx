import { Bell } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { getFormattedMatches } from '@/app/actions/matches';
import { FeedJogos } from '@/components/FeedJogos';

export default async function Home() {
  // Busca inicial no servidor - Resolve CORS e aplica cache automaticamente
  const { matches, timestamp } = await getFormattedMatches();

  return (
    <main className="min-h-screen max-w-2xl mx-auto pb-24 md:pb-8">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-5 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="font-headline font-black text-2xl tracking-tighter text-primary italic uppercase leading-none">
            Palpiteiro<span className="text-foreground">Pro</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Copa do Mundo 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </button>
        </div>
      </header>

      <FeedJogos initialMatches={matches} initialUpdate={timestamp} />

      <Toaster />
    </main>
  );
}
