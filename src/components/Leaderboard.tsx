
'use client';

import { Trophy, ChevronUp, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { getLeaderboardData } from '@/app/actions/matches';

interface LeaderboardProps {
  initialData?: any[];
}

export function Leaderboard({ initialData = [] }: LeaderboardProps) {
  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Apenas se não vierem dados por prop, fazemos o fetch
    if (initialData.length === 0) {
      setLoading(true);
      async function fetchRank() {
        const rank = await getLeaderboardData();
        setData(rank);
        setLoading(false);
      }
      fetchRank();
    }
  }, [initialData]);

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border/50 p-6 rounded-xl mb-8 flex items-center justify-between shadow-sm">
        <div className="space-y-1">
          <h3 className="font-headline font-bold text-xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Ranking Global
          </h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Baseado em resultados reais</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Participantes</p>
          <p className="font-headline font-black text-2xl text-primary">{data.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-transparent">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">Calculando Pontos...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
          {data.length > 0 ? (
            data.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-transparent p-4 border-b border-border/50 last:border-b-0 hover:bg-secondary/50 transition-colors"
                >
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "w-8 font-headline font-black text-lg text-center",
                    index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-400" : index === 2 ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                  <Avatar className="w-10 h-10 border border-border/50 rounded-full">
                    <AvatarFallback className="bg-secondary text-muted-foreground font-bold text-xs uppercase">{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{user.name}</span>
                    <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                      Ativo na Copa
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-headline font-bold text-lg text-primary">{user.points}</span>
                  <span className="text-[10px] block text-muted-foreground font-bold uppercase">PTS</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border border-border/50 rounded-xl shadow-sm bg-card">
              <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest">Nenhum palpite computado ainda.</p>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
