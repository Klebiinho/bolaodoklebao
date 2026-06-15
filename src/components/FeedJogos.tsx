
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard, COUNTRY_TRANSLATIONS } from '@/components/MatchCard';
import { Leaderboard } from '@/components/Leaderboard';
import { Trophy, Gamepad2, History, TrendingUp, Loader2, Award, Compass, Search } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getFormattedMatches } from '@/app/actions/matches';

interface FeedJogosProps {
  initialMatches: any[];
  initialUpdate: string;
  initialLeaderboard?: any[] | null;
}

/** Agrupa partidas por rodada e retorna um array ordenado de [rodada, partidas[]] */
function groupByRound(matches: any[]): [string, any[]][] {
  const groups: Record<string, any[]> = {};
  for (const m of matches) {
    const round = m.round || 'Sem rodada';
    if (!groups[round]) groups[round] = [];
    groups[round].push(m);
  }
  // Ordena rodadas numericamente (1, 2, 3...)
  return Object.entries(groups).sort(([a], [b]) => {
    const na = parseInt(a);
    const nb = parseInt(b);
    if (isNaN(na) && isNaN(nb)) return 0;
    if (isNaN(na)) return 1;
    if (isNaN(nb)) return -1;
    return na - nb;
  });
}

/** Retorna label bonito para a rodada */
function getRoundLabel(round: string): string {
  const num = parseInt(round);
  if (!isNaN(num)) return `${num}ª Rodada`;
  return round;
}

export function FeedJogos({ initialMatches, initialUpdate, initialLeaderboard = null }: FeedJogosProps) {
  const [matches, setMatches] = useState<any[]>(initialMatches);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(initialUpdate);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      await fetch('/api/sync?mode=live').catch(() => {});
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
    if (!mounted) return [];
    let filtered = matches.filter(m => m.status === 'FT' || m.status === 'Match Finished');
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(m => {
        const teamA_trans = (COUNTRY_TRANSLATIONS[m.teamA] || m.teamA || '').toLowerCase();
        const teamB_trans = (COUNTRY_TRANSLATIONS[m.teamB] || m.teamB || '').toLowerCase();
        const teamA_orig = (m.teamA || '').toLowerCase();
        const teamB_orig = (m.teamB || '').toLowerCase();
        return teamA_trans.includes(q) || teamB_trans.includes(q) || teamA_orig.includes(q) || teamB_orig.includes(q);
      });
    }
    return filtered;
  }, [matches, mounted, searchQuery]);

  const activeMatches = useMemo(() => {
    if (!mounted) return matches;
    let filtered = matches.filter(m => m.status !== 'FT' && m.status !== 'Match Finished');
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(m => {
        const teamA_trans = (COUNTRY_TRANSLATIONS[m.teamA] || m.teamA || '').toLowerCase();
        const teamB_trans = (COUNTRY_TRANSLATIONS[m.teamB] || m.teamB || '').toLowerCase();
        const teamA_orig = (m.teamA || '').toLowerCase();
        const teamB_orig = (m.teamB || '').toLowerCase();
        return teamA_trans.includes(q) || teamB_trans.includes(q) || teamA_orig.includes(q) || teamB_orig.includes(q);
      });
    }
    return filtered;
  }, [matches, mounted, searchQuery]);

  const activeByRound = useMemo(() => groupByRound(activeMatches), [activeMatches]);
  const historyByRound = useMemo(() => groupByRound(historyMatches), [historyMatches]);

  if (!mounted) {
    return (
      <div className="px-6 py-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Carregando Arena...</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-3 p-0 fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border h-16 mb-0 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] md:relative md:bg-transparent md:border-t-0 md:border-b md:h-12 md:mb-8 md:backdrop-blur-none md:shadow-none">
          <TabsTrigger value="feed" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-t-2 md:data-[state=active]:border-t-0 md:data-[state=active]:border-b-2 data-[state=active]:border-primary font-headline font-semibold text-[10px] md:text-xs uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 rounded-none h-full">
            <Gamepad2 className="w-5 h-5 md:w-4 md:h-4" /> Jogos
          </TabsTrigger>
          <TabsTrigger value="rank" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-t-2 md:data-[state=active]:border-t-0 md:data-[state=active]:border-b-2 data-[state=active]:border-primary font-headline font-semibold text-[10px] md:text-xs uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 rounded-none h-full">
            <Trophy className="w-5 h-5 md:w-4 md:h-4" /> Ranking
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-t-2 md:data-[state=active]:border-t-0 md:data-[state=active]:border-b-2 data-[state=active]:border-primary font-headline font-semibold text-[10px] md:text-xs uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 rounded-none h-full">
            <History className="w-5 h-5 md:w-4 md:h-4" /> Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6 focus-visible:outline-none">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="font-headline font-bold text-lg flex items-center gap-2 whitespace-nowrap">
              <TrendingUp className="w-5 h-5 text-primary" />
              Partidas Abertas
            </h2>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <Compass className="w-5 h-5 text-muted-foreground hidden sm:block" />
              <div className="relative w-full max-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar time..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs rounded-full bg-secondary/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>
          
          {activeByRound.length > 0 ? (
            activeByRound.map(([round, roundMatches]) => (
              <div key={`active-${round}`} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground bg-background px-3">
                    {getRoundLabel(round)}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-4">
                  {roundMatches.map((match: any) => (
                    <MatchCard key={match.id} {...match} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-border/50 rounded-xl bg-card shadow-sm">
              <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">Nenhuma partida aberta no momento.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rank" className="mt-6 animate-in fade-in-50 focus-visible:outline-none">
          <Leaderboard initialData={initialLeaderboard} />
        </TabsContent>

        <TabsContent value="history" className="focus-visible:outline-none">
           <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-headline font-bold text-lg flex items-center gap-2 whitespace-nowrap">
                  <Award className="w-5 h-5 text-primary" />
                  Meus Resultados
                </h2>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <Compass className="w-5 h-5 text-muted-foreground hidden sm:block" />
                  <div className="relative w-full max-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar time..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-xs rounded-full bg-secondary/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>
              {historyByRound.length > 0 ? (
                historyByRound.map(([round, roundMatches]) => (
                  <div key={`history-${round}`} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground bg-background px-3">
                        {getRoundLabel(round)}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid gap-4">
                      {roundMatches.map((match: any) => (
                        <MatchCard key={match.id} {...match} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                  <History className="w-12 h-12 text-muted-foreground/30" />
                  <h3 className="font-headline font-bold text-lg">Sem Histórico</h3>
                  <p className="text-sm text-muted-foreground max-w-[280px]">Os jogos finalizados e seus pontos aparecerão aqui assim que as partidas terminarem.</p>
                </div>
              )}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
