
import { Bell, LogOut, User } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { getFormattedMatches, getLeaderboardData } from '@/app/actions/matches';
import { FeedJogos } from '@/components/FeedJogos';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { logout } from './login/actions';
import Link from 'next/link';
import { UserMenu } from '@/components/UserMenu';
import Image from 'next/image';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Executa as duas buscas pesadas (Jogos + Ranking) de forma paralela também para acelerar o carregamento da Home
  const [matchesData, leaderboardData] = await Promise.all([
    getFormattedMatches(),
    getLeaderboardData()
  ]);

  const { matches, timestamp } = matchesData;

  return (
    <main className="min-h-screen max-w-2xl mx-auto pb-24 md:pb-8">
      <header className="sticky top-0 z-50 bg-background border-b border-border px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-border/50 shadow-sm shrink-0 bg-white">
            <Image src="/logo.jpg" alt="Bolão do Klebão Logo" width={48} height={48} className="object-cover" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline font-black text-3xl tracking-tighter text-primary uppercase leading-none">
              Bolão do <span className="text-foreground font-black">Klebão</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">Copa do Mundo 2026</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu user={user} onLogout={logout} />
          ) : (
            <Link href="/login">
              <Button size="sm" className="font-headline font-semibold uppercase text-[10px] tracking-widest px-6 h-10 rounded-full border border-transparent bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </header>

      <FeedJogos 
        initialMatches={matches} 
        initialUpdate={timestamp} 
        initialLeaderboard={leaderboardData} 
      />

      <Toaster />
    </main>
  );
}
