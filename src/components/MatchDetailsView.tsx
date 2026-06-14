'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Activity, Users, BarChart3 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

interface MatchDetailsProps {
  matchId: string;
  teamA: string;
  teamB: string;
  badgeA: string;
  badgeB: string;
  date: string;
}

export function MatchDetailsView({ matchId, teamA, teamB, badgeA, badgeB, date }: MatchDetailsProps) {
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/match-details?teamA=${encodeURIComponent(teamA)}&teamB=${encodeURIComponent(teamB)}&date=${encodeURIComponent(date)}`);
        const result = await res.json();
        if (res.ok) {
          setLiveData(result);
        } else {
          setLiveData(null);
        }
      } catch (err) {
        setLiveData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [teamA, teamB, date]);

  const data = useMemo(() => {
    // Mapeamento padrão (vazio)
    const baseStats = {
      goalsA: [],
      goalsB: [],
      stats: [
        { label: "Posse de bola", a: "0%", b: "0%", valA: 50, valB: 50 },
        { label: "Chutes", a: 0, b: 0, valA: 50, valB: 50 },
        { label: "Chutes a gol", a: 0, b: 0, valA: 50, valB: 50 },
        { label: "Passes", a: 0, b: 0, valA: 50, valB: 50 },
        { label: "Precisão de passe", a: "0%", b: "0%", valA: 50, valB: 50 },
        { label: "Faltas", a: 0, b: 0, valA: 50, valB: 50 },
        { label: "Cartões amarelos", a: 0, b: 0, valA: 50, valB: 50 },
        { label: "Cartões vermelhos", a: 0, b: 0, valA: 50, valB: 50 },
        { label: "Impedimentos", a: 0, b: 0, valA: 50, valB: 50 },
        { label: "Escanteios", a: 0, b: 0, valA: 50, valB: 50 }
      ],
      group: [
        { pos: 1, team: teamA, badge: badgeA, pts: 0, pj: 0, v: 0, e: 0, d: 0, gm: 0, gc: 0, sg: 0 },
        { pos: 2, team: "A definir", badge: "https://www.thesportsdb.com/images/media/team/badge/vxvuwt1421865463.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gm: 0, gc: 0, sg: 0 },
        { pos: 3, team: teamB, badge: badgeB, pts: 0, pj: 0, v: 0, e: 0, d: 0, gm: 0, gc: 0, sg: 0 },
        { pos: 4, team: "A definir", badge: "https://www.thesportsdb.com/images/media/team/badge/vxvuwt1421865463.png", pts: 0, pj: 0, v: 0, e: 0, d: 0, gm: 0, gc: 0, sg: 0 }
      ]
    };

    if (!liveData || !liveData.statistics || liveData.statistics.length === 0) {
      return baseStats;
    }

    // Processa estatísticas reais
    const statsHome = liveData.statistics[0]?.statistics || [];
    const statsAway = liveData.statistics[1]?.statistics || [];

    const getStat = (arr: any[], type: string) => {
      const s = arr.find((item: any) => item.type === type);
      return s ? s.value : 0;
    };

    // Função auxiliar para barras
    const calcVal = (valA: any, valB: any, isPct = false) => {
      if (valA === null) valA = 0;
      if (valB === null) valB = 0;
      let numA = typeof valA === 'string' ? parseInt(valA) : valA;
      let numB = typeof valB === 'string' ? parseInt(valB) : valB;
      
      if (isPct) {
        return { a: `${numA}%`, b: `${numB}%`, pA: numA, pB: numB };
      }
      
      let total = numA + numB;
      if (total === 0) return { a: numA, b: numB, pA: 50, pB: 50 };
      return { a: numA, b: numB, pA: (numA/total)*100, pB: (numB/total)*100 };
    };

    const mapStat = (label: string, type: string, isPct = false) => {
      const valA = getStat(statsHome, type);
      const valB = getStat(statsAway, type);
      const r = calcVal(valA, valB, isPct);
      return { label, a: r.a, b: r.b, valA: r.pA, valB: r.pB };
    };

    baseStats.stats = [
      mapStat("Posse de bola", "Ball Possession", true),
      mapStat("Chutes", "Total Shots"),
      mapStat("Chutes a gol", "Shots on Goal"),
      mapStat("Passes", "Total passes"),
      mapStat("Precisão de passe", "Passes %", true),
      mapStat("Faltas", "Fouls"),
      mapStat("Cartões amarelos", "Yellow Cards"),
      mapStat("Cartões vermelhos", "Red Cards"),
      mapStat("Impedimentos", "Offsides"),
      mapStat("Escanteios", "Corner Kicks")
    ];

    // Gols
    if (liveData.events) {
      const goals = liveData.events.filter((e: any) => e.type === 'Goal');
      goals.forEach((g: any) => {
        const text = `${g.player.name} ${g.time.elapsed}'`;
        if (g.team.name.toLowerCase().includes(teamA.toLowerCase().split(' ')[0])) {
          baseStats.goalsA.push(text as never);
        } else {
          baseStats.goalsB.push(text as never);
        }
      });
    }

    return baseStats;
  }, [liveData, teamA, teamB, badgeA, badgeB]);

  return (
    <div className="mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-4 fade-in duration-300">
      
      {/* Resumo dos Gols */}
      {(data.goalsA.length > 0 || data.goalsB.length > 0) && (
        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-6 px-2">
          <div className="flex flex-col gap-1 items-start w-1/2">
            {data.goalsA.map((g, i) => (
              <span key={i} className="flex items-center gap-1">
                ⚽ {g}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-1 items-end w-1/2 text-right">
            {data.goalsB.map((g, i) => (
              <span key={i} className="flex items-center gap-1">
                {g} ⚽
              </span>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 border border-border/50 h-10 p-1 rounded-lg mb-4">
          <TabsTrigger value="minute" className="rounded-md font-headline font-semibold text-[10px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-full">
            <Activity className="w-3 h-3 mr-1.5" /> Minuto
          </TabsTrigger>
          <TabsTrigger value="lineup" className="rounded-md font-headline font-semibold text-[10px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-full">
            <Users className="w-3 h-3 mr-1.5" /> Escalação
          </TabsTrigger>
          <TabsTrigger value="stats" className="rounded-md font-headline font-semibold text-[10px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all h-full">
            <BarChart3 className="w-3 h-3 mr-1.5" /> Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="minute" className="focus-visible:outline-none p-4 bg-card rounded-lg border border-border/50 max-h-[300px] overflow-y-auto space-y-3">
          {loading ? (
            <p className="text-center text-xs text-muted-foreground font-semibold uppercase tracking-widest animate-pulse">Carregando eventos...</p>
          ) : liveData?.events?.length > 0 ? (
            liveData.events.map((ev: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 text-xs border-b border-border/50 pb-2 last:border-0">
                <span className="font-bold w-12 text-center bg-secondary py-1 rounded text-[10px]">{ev.time.elapsed}'</span>
                <img src={ev.team.logo} alt={ev.team.name} className="w-4 h-4 object-contain" />
                <div className="flex flex-col flex-1">
                  <span className="font-bold">{ev.player.name}</span>
                  <span className="text-[10px] text-muted-foreground">{ev.type} - {ev.detail}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-muted-foreground font-semibold uppercase tracking-widest">Aguardando eventos da partida ao vivo.</p>
          )}
        </TabsContent>

        <TabsContent value="lineup" className="focus-visible:outline-none p-4 bg-card rounded-lg border border-border/50 max-h-[300px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-xs text-muted-foreground font-semibold uppercase tracking-widest animate-pulse">Carregando escalações...</p>
          ) : liveData?.lineups?.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {liveData.lineups.map((lineup: any, idx: number) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                    <img src={lineup.team.logo} alt={lineup.team.name} className="w-5 h-5 object-contain" />
                    <span className="font-bold text-[10px] uppercase truncate">{lineup.team.name}</span>
                    <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded ml-auto">{lineup.formation}</span>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Titulares</span>
                    {lineup.startXI?.map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <span className="w-4 text-center font-bold text-[9px] text-muted-foreground">{p.player.number}</span>
                        <span className="truncate flex-1">{p.player.name}</span>
                        <span className="text-[8px] font-bold opacity-50">{p.player.pos}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground font-semibold uppercase tracking-widest">Escalações não disponíveis no momento.</p>
          )}
        </TabsContent>

        <TabsContent value="stats" className="focus-visible:outline-none space-y-6">
          <div className="bg-card rounded-lg border border-border/50 p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <img src={badgeA} alt={teamA} className="w-6 h-6 object-contain" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estatísticas Oficiais</span>
              <img src={badgeB} alt={teamB} className="w-6 h-6 object-contain" />
            </div>

            <div className="space-y-4">
              {data.stats.map((stat, idx) => {
                const pctA = stat.valA;
                const pctB = stat.valB;

                return (
                  <div key={idx} className="flex flex-col gap-1 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100 cursor-default">
                    <div className="flex justify-between items-end text-xs font-bold">
                      <span>{stat.a}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                      <span>{stat.b}</span>
                    </div>
                    <div className="h-1.5 w-full flex bg-secondary rounded-full overflow-hidden">
                      <div className="bg-orange-500/40 h-full transition-all duration-500" style={{ width: `${pctA}%` }} />
                      <div className="bg-blue-500/40 h-full transition-all duration-500" style={{ width: `${pctB}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="text-center pt-2">
                {loading ? (
                  <span className="text-[9px] text-muted-foreground uppercase font-semibold animate-pulse">Consultando API ao vivo...</span>
                ) : liveData ? (
                  <span className="text-[9px] text-primary uppercase font-semibold">Dados reais atualizados agorinha!</span>
                ) : (
                  <span className="text-[9px] text-muted-foreground uppercase font-semibold">Os dados serão preenchidos pela API quando o jogo começar</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
            <div className="bg-secondary/30 p-2 text-center border-b border-border/50">
              <span className="text-[10px] font-bold uppercase tracking-widest">Classificação do Grupo</span>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-[10px] text-left">
                <thead className="bg-secondary/50 text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Equipe</th>
                    <th className="px-2 py-2 font-bold">Pts</th>
                    <th className="px-2 py-2 font-semibold text-center">PJ</th>
                    <th className="px-2 py-2 font-semibold text-center">V</th>
                    <th className="px-2 py-2 font-semibold text-center">E</th>
                    <th className="px-2 py-2 font-semibold text-center">D</th>
                    <th className="px-2 py-2 font-semibold text-center">SG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.group.map((row) => (
                    <tr key={row.pos} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-3 py-2 flex items-center gap-2">
                        <span className={cn("w-4 font-bold text-center", row.pos <= 2 ? "text-primary" : "text-muted-foreground")}>{row.pos}</span>
                        <img src={row.badge} className="w-4 h-4 object-contain opacity-50" alt="" />
                        <span className="font-bold whitespace-nowrap opacity-50">{row.team}</span>
                      </td>
                      <td className="px-2 py-2 font-bold text-primary opacity-50">{row.pts}</td>
                      <td className="px-2 py-2 text-center opacity-50">{row.pj}</td>
                      <td className="px-2 py-2 text-center opacity-50">{row.v}</td>
                      <td className="px-2 py-2 text-center opacity-50">{row.e}</td>
                      <td className="px-2 py-2 text-center opacity-50">{row.d}</td>
                      <td className="px-2 py-2 text-center font-semibold opacity-50">{row.sg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
