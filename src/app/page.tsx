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
      try {
        const events = await getWorldCupMatches();
        
        const formattedMatches = await Promise.all(events.map(async (event) => {
          // Busca badges reais para cada time via API
          const [homeTeam, awayTeam] = await Promise.all([
            getTeamDetails(event.idHomeTeam),
            getTeamDetails(event.idAwayTeam)
          ]);

          return {
            id: event.idEvent,
            teamA: event.strHomeTeam,
            teamB: event.strAwayTeam,
            badgeA: homeTeam?.strTeamBadge || `https://picsum.photos/seed/${event.idHomeTeam}/200/200`,
            badgeB: awayTeam?.strTeamBadge || `https://picsum.photos/seed/${event.idAwayTeam}/200/200`,
            displayDate: `${event.dateEvent} - ${event.strTime.substring(0, 5)}`,
            startTime: event.strTimestamp || `${event.dateEvent}T${event.strTime}`,
            realScoreA: event.intHomeScore,
            realScoreB: event.intAwayScore,
          };
        }));

        setMatches(formattedMatches);
      } catch (error) {
        console.error("Erro ao carregar dados da API:", error);
      } finally {
        setLoading(false);
      }
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
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Saldo</span>
            <span className="text-sm font-headline font-bold text-accent">1,250 pts</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-6">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 h-12 mb-8 rounded-xl p-1">
            <TabsTrigger value="feed" className="data-[state=active]:bg-background data-[state=active]:text-primary font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all">
              <Gamepad2 className="w-4 h-4" /> Jogos
            </TabsTrigger>
            <TabsTrigger value="rank" className="data-[state=active]:bg-background data-[state=active]:text-primary font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all">
              <Trophy className="w-4 h-4" /> Ranking
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-background data-[state=active]:text-primary font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all">
              <History className="w-4 h-4" /> Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6 focus-visible:outline-none">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-headline font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tabela 2026 (Real-time)
              </h2>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest animate-pulse">Conectando ao banco de dados FIFA...</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {matches.length > 0 ? (
                  matches.map((match) => (
                    <MatchCard key={match.id} {...match} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-secondary/10 rounded-3xl border border-dashed border-border/50">
                    <p className="text-sm text-muted-foreground font-medium">Os confrontos de 2026 estão sendo definidos.</p>
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
                  <h3 className="font-headline font-bold text-sm text-foreground">Sistema Oficial de Palpites</h3>
                  <p className="text-xs text-muted-foreground mt-1">Placares atualizados conforme a API TheSportsDB.</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rank" className="focus-visible:outline-none">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="history" className="focus-visible:outline-none">
             <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground">
                  <History className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg">Histórico Vazio</h3>
                  <p className="text-sm text-muted-foreground max-w-[280px] mt-2">
                    Seus palpites finalizados aparecerão aqui assim que as partidas encerrarem.
                  </p>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </main>
  );
}
