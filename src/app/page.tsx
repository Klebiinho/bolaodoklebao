'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard } from '@/components/MatchCard';
import { Leaderboard } from '@/components/Leaderboard';
import { Trophy, Gamepad2, History, TrendingUp, Bell, Loader2, RefreshCcw } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useEffect, useState, useCallback } from 'react';
import { getWorldCupMatches, getTeamBadge } from '@/services/sports-db';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const events = await getWorldCupMatches();
      
      const formattedMatches = await Promise.all(events.map(async (event) => {
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
          realScoreA: event.intHomeScore,
          realScoreB: event.intAwayScore,
        };
      }));

      setMatches(formattedMatches);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Erro ao carregar dados da API:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Atualização automática a cada 2 minutos (respeitando limite de requisições)
    const interval = setInterval(() => loadData(true), 120000);
    return () => clearInterval(interval);
  }, [loadData]);

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
          <div className="hidden sm:flex flex-col items-end mr-2 text-[10px] text-muted-foreground font-bold uppercase">
            <span>Última Sincronização</span>
            <span className="text-primary">{lastUpdate || '--:--'}</span>
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
                Partidas em Tempo Real
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => loadData(true)} 
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
              >
                <RefreshCcw className="w-3 h-3 mr-2" /> Atualizar
              </Button>
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
                    <p className="text-sm text-muted-foreground font-medium">Nenhuma partida encontrada no momento.</p>
                  </div>
                )}
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
