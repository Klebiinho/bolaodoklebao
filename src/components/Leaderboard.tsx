
'use client';

import { Trophy, Medal, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Lucas "Golero"', points: 1240, trends: 'up', avatar: '1' },
  { rank: 2, name: 'Ana Souza', points: 1180, trends: 'down', avatar: '2' },
  { rank: 3, name: 'Mário Bet', points: 1150, trends: 'up', avatar: '3' },
  { rank: 4, name: 'Carla Silva', points: 940, trends: 'minus', avatar: '4' },
  { rank: 5, name: 'Bruno Predict', points: 890, trends: 'up', avatar: '5' },
];

export function Leaderboard() {
  return (
    <div className="space-y-4">
      <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-headline font-bold text-xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Ranking Global
          </h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Temporada: Março 2024</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Sua Posição</p>
          <p className="font-headline font-black text-2xl text-primary">#1.242</p>
        </div>
      </div>

      <div className="space-y-2">
        {MOCK_LEADERBOARD.map((user) => (
          <div
            key={user.rank}
            className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/50 hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className={cn(
                "w-8 font-headline font-black text-lg text-center",
                user.rank === 1 ? "text-yellow-400" : user.rank === 2 ? "text-gray-400" : user.rank === 3 ? "text-amber-600" : "text-muted-foreground"
              )}>
                {user.rank}
              </span>
              <Avatar className="w-10 h-10 border-2 border-secondary">
                <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/100/100`} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold text-sm">{user.name}</span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                  {user.trends === 'up' && <ChevronUp className="w-3 h-3 text-green-500" />}
                  {user.trends === 'down' && <ChevronDown className="w-3 h-3 text-red-500" />}
                  {user.trends === 'minus' && <Minus className="w-3 h-3 text-gray-500" />}
                  {user.trends === 'up' ? '+12 pos' : user.trends === 'down' ? '-4 pos' : 'Sem alteração'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-headline font-bold text-lg text-primary">{user.points}</span>
              <span className="text-[10px] block text-muted-foreground font-bold uppercase">PTS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
