
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard } from '@/components/MatchCard';
import { Leaderboard } from '@/components/Leaderboard';
import { Trophy, Gamepad2, History, TrendingUp, Bell, Loader2, RefreshCcw } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useEffect, useState, useCallback } from 'react';
import { getWorldCupMatches, getTeamBadge } from '@/services/sports-db';
import { Button } from '@/components/ui/button';
import { fetchPastResults } from '@/app/actions/sportsApi';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [events, pastEvents] = await Promise.all([
        getWorldCupMatches(),
        fetchPastResults()
      ]);
      
      const allEvents = [...events];
      // Mesclar resultados reais da API de histórico se disponível
      const formattedMatches = await Promise.all(allEvents.map(async (event) => {
        const pastResult = pastEvents.find((p: any) => p.idEvent === event.idEvent);
        const [badgeA, badgeB] = await Promise.all([
          getTeamBadge(event.idHomeTeam),
          getTeamBadge(event.idAwayTeam)
        ]);

        return {
          id: event.idEvent,
          teamA: event.strHomeTeam,
          teamB: event.strAwayTeam,
          badgeA,
          badgeB,
          displayDate: `${event.dateEvent} - ${event.strTime.substring(0, 5)}`,
          startTime: event.strTimestamp,
          realScoreA: pastResult?.intHomeScore || event.intHomeScore,
          realScoreB: pastResult?.intAwayScore || event.intAwayScore,
        };
      }));

      setMatches(formattedMatches);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 120000);
    return () => clearInterval(interval);
  }, [loadData]);

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
                Partidas
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => loadData(true)} 
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
              >
                <RefreshCcw className="w-3 h-3 mr-2" /> {lastUpdate || 'Atualizar'}
              </Button>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Sincronizando placares oficiais...</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {matches.map((match) => (
                  <MatchCard key={match.id} {...match} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rank" className="focus-visible:outline-none">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="history" className="focus-visible:outline-none">
             <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <History className="w-12 h-12 text-muted-foreground/30" />
                <h3 className="font-headline font-bold text-lg">Histórico de Palpites</h3>
                <p className="text-sm text-muted-foreground max-w-[280px]">Os jogos finalizados e seus pontos aparecerão aqui em breve.</p>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      <Toaster />
    </main>
  );
}
