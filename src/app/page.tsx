
import { Bell, LogOut, User } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { getFormattedMatches } from '@/app/actions/matches';
import { FeedJogos } from '@/components/FeedJogos';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { logout } from './login/actions';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center relative group">
                <User className="w-5 h-5 text-muted-foreground" />
                <div className="absolute top-full right-0 mt-2 bg-card border border-border p-2 rounded-xl shadow-xl hidden group-hover:block w-48 z-[60]">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mb-2 truncate px-2">{user.email}</p>
                  <form action={logout}>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs font-bold uppercase">
                      <LogOut className="w-3 h-3 mr-2" /> Sair
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="font-headline font-bold uppercase text-[10px] tracking-widest px-4 h-9">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </header>

      <FeedJogos initialMatches={matches} initialUpdate={timestamp} />

      <Toaster />
    </main>
  );
}
