
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCard } from '@/components/MatchCard';
import { Leaderboard } from '@/components/Leaderboard';
import { Trophy, Gamepad2, History, TrendingUp, Bell } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

const FEATURED_MATCHES = [
  {
    id: 'm1',
    teamA: 'Brasil',
    teamB: 'França',
    badgeA: 'https://picsum.photos/seed/br/200/200',
    badgeB: 'https://picsum.photos/seed/fr/200/200',
    date: 'Hoje, 21:00',
    teamARecentForm: 'Brasil venceu os últimos 4 jogos, ataque em excelente fase com média de 2.5 gols por partida.',
    teamBRecentForm: 'França vem de um empate e duas vitórias apertadas, defesa sólida mas meio-campo desfalcado.'
  },
  {
    id: 'm2',
    teamA: 'Argentina',
    teamB: 'Alemanha',
    badgeA: 'https://picsum.photos/seed/ar/200/200',
    badgeB: 'https://picsum.photos/seed/de/200/200',
    date: 'Amanhã, 16:30',
    teamARecentForm: 'Messi em grande fase, time invicto há 10 jogos em casa.',
    teamBRecentForm: 'Time em reconstrução, oscilando muito nos resultados fora de casa.'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen max-w-2xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-5 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="font-headline font-black text-2xl tracking-tighter text-primary italic uppercase leading-none">
            Palpiteiro<span className="text-foreground">Pro</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Sport Prediction Engine</p>
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
                Destaques do Dia
              </h2>
            </div>
            
            <div className="grid gap-6">
              {FEATURED_MATCHES.map((match) => (
                <MatchCard key={match.id} {...match} />
              ))}
            </div>

            <div className="mt-12 p-8 bg-secondary/20 rounded-3xl border-2 border-dashed border-border/50 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-foreground">Mais jogos em breve</h3>
                <p className="text-xs text-muted-foreground mt-1">Fique ligado para novas oportunidades de palpite.</p>
              </div>
            </div>
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
                  <h3 className="font-headline font-bold">Nenhum palpite resolvido</h3>
                  <p className="text-sm text-muted-foreground max-w-[240px] mt-2">
                    Acompanhe aqui o resultado dos seus palpites anteriores e quantos pontos você ganhou.
                  </p>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Navigation Mobile Fixed (optional enhancement) */}
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
