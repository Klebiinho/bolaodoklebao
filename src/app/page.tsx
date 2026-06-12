
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard } from '@/components/MatchCard';
import { Leaderboard } from '@/components/Leaderboard';
import { Trophy, Gamepad2, History, TrendingUp, Bell, Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useEffect, useState } from 'react';
import { getWorldCupMatches, getTeamDetails } from '@/services/sports-db';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const events = await getWorldCupMatches();
      
      const formattedMatches = await Promise.all(events.map(async (event) => {
        // Tentamos buscar escudos reais, caso contrário usamos placeholders temáticos
        const homeTeam = await getTeamDetails(event.idHomeTeam);
        const awayTeam = await getTeamDetails(event.idAwayTeam);

        return {
          id: event.idEvent,
          teamA: event.strHomeTeam,
          teamB: event.strAwayTeam,
          badgeA: homeTeam?.strTeamBadge || `https://picsum.photos/seed/${event.idHomeTeam}/200/200`,
          badgeB: awayTeam?.strTeamBadge || `https://picsum.photos/seed/${event.idAwayTeam}/200/200`,
          displayDate: `${event.dateEvent} - ${event.strTime.substring(0, 5)}`,
          startTime: event.strTimestamp || `${event.dateEvent}T${event.strTime}`,
        };
      }));

      setMatches(formattedMatches);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <main className="min-h-screen max-w-2xl mx-auto pb-24 md:pb-8">
      {/* Header */}
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
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Seu Saldo</span>
            <span className="text-sm font-headline font-bold text-accent">1,250 pts</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-6">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 h-12 mb-8 rounded-xl p-1">
            <TabsTrigger value="feed" className="data-[state=active]:bg-background data-[state=active]:text-primary font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" /> Jogos
            </TabsTrigger>
            <TabsTrigger value="rank" className="data-[state=active]:bg-background data-[state=active]:text-primary font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Ranking
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-background data-[state=active]:text-primary font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4" /> Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6 focus-visible:outline-none">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-headline font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Partidas 2026
              </h2>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-medium animate-pulse">Preparando a Copa de 2026...</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {matches.length > 0 ? (
                  matches.map((match) => (
                    <MatchCard key={match.id} {...match} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">Aguardando definição dos confrontos.</p>
                  </div>
                )}
              </div>
            )}

            {!loading && (
              <div className="mt-12 p-8 bg-secondary/20 rounded-3xl border-2 border-dashed border-border/50 text-center flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-foreground">Prepare sua torcida</h3>
                  <p className="text-xs text-muted-foreground mt-1">Dados atualizados para o mundial de 2026.</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rank" className="focus-visible:outline-none">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="history" className="focus-visible:outline-none">
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                  <History className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-headline font-bold">Histórico Vazio</h3>
                  <p className="text-sm text-muted-foreground max-w-[240px] mt-2">
                    Comece a palpitar nos jogos de 2026 para ver seu histórico aqui.
                  </p>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Navigation Mobile Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/50 px-8 py-4 flex items-center justify-between md:hidden z-50">
        <button className="flex flex-col items-center gap-1 text-primary">
          <Gamepad2 className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Jogos</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <Trophy className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Ranking</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <History className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Histórico</span>
        </button>
      </nav>

      <Toaster />
    </main>
  );
}
