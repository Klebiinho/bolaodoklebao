
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard } from '@/components/MatchCard';
import { Leaderboard } from '@/components/Leaderboard';
import { Trophy, Gamepad2, History, TrendingUp, Loader2, RefreshCcw, Award } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { getFormattedMatches } from '@/app/actions/matches';
import { isAfter, parseISO } from 'date-fns';

interface FeedJogosProps {
  initialMatches: any[];
  initialUpdate: string;
}

export function FeedJogos({ initialMatches, initialUpdate }: FeedJogosProps) {
  const [matches, setMatches] = useState<any[]>(initialMatches);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(initialUpdate);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const data = await getFormattedMatches();
      setMatches(data.matches);
      setLastUpdate(data.timestamp);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => loadData(false), 120000);
    return () => clearInterval(interval);
  }, [loadData]);

  const historyMatches = useMemo(() => {
    return matches.filter(m => m.realScoreA !== null || isAfter(new Date(), parseISO(m.startTime)));
  }, [matches]);

  const activeMatches = useMemo(() => {
    return matches.filter(m => m.realScoreA === null && !isAfter(new Date(), parseISO(m.startTime)));
  }, [matches]);

  return (
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
              Partidas Abertas
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => loadData(true)} 
              disabled={loading}
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              ) : (
                <RefreshCcw className="w-3 h-3 mr-2" />
              )}
              {lastUpdate || 'Atualizar'}
            </Button>
          </div>
          
          <div className="grid gap-6">
            {activeMatches.length > 0 ? (
              activeMatches.map((match) => (
                <MatchCard key={match.id} {...match} />
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                <p className="text-sm text-muted-foreground">Nenhuma partida aberta no momento.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rank" className="focus-visible:outline-none">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="history" className="focus-visible:outline-none">
           <div className="space-y-6">
              <h2 className="font-headline font-bold text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Meus Resultados
              </h2>
              <div className="grid gap-6">
                {historyMatches.length > 0 ? (
                  historyMatches.map((match) => (
                    <MatchCard key={match.id} {...match} />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                    <History className="w-12 h-12 text-muted-foreground/30" />
                    <h3 className="font-headline font-bold text-lg">Sem Histórico</h3>
                    <p className="text-sm text-muted-foreground max-w-[280px]">Os jogos finalizados e seus pontos aparecerão aqui assim que as partidas terminarem.</p>
                  </div>
                )}
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
