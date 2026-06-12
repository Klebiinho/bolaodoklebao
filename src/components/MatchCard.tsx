
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIInsightPanel } from './AIInsightPanel';
import { Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface MatchProps {
  id: string;
  teamA: string;
  teamB: string;
  badgeA: string;
  badgeB: string;
  date: string;
  teamARecentForm: string;
  teamBRecentForm: string;
}

export function MatchCard({ id, teamA, teamB, badgeA, badgeB, date, teamARecentForm, teamBRecentForm }: MatchProps) {
  const [prediction, setPrediction] = useState({ a: '', b: '' });
  const [isSaved, setIsSaved] = useState(false);

  const handleInput = (team: 'a' | 'b', val: string) => {
    if (!/^\d*$/.test(val)) return;
    setPrediction(prev => ({ ...prev, [team]: val }));
    setIsSaved(false);
  };

  const handleSave = () => {
    if (prediction.a === '' || prediction.b === '') {
      toast({
        title: "Campos vazios",
        description: "Preencha o placar completo antes de confirmar.",
        variant: "destructive"
      });
      return;
    }
    setIsSaved(true);
    toast({
      title: "Palpite Confirmado!",
      description: `Seu palpite para ${teamA} x ${teamB} foi registrado.`,
    });
  };

  return (
    <Card className="bg-card border-border/50 p-5 card-glow transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AO VIVO EM BREVE
          </span>
          <span>{date}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-3 group-hover:scale-110 transition-transform">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src={badgeA} alt={teamA} className="w-16 h-16 object-contain relative z-10" />
            </div>
            <span className="text-sm font-headline font-bold text-center line-clamp-1">{teamA}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={prediction.a}
              onChange={(e) => handleInput('a', e.target.value)}
              className="w-12 h-16 text-center text-3xl score-digit bg-secondary/50 rounded-xl border-2 border-transparent focus:border-primary focus:bg-background outline-none transition-all"
              placeholder="0"
            />
            <span className="text-muted-foreground font-headline font-bold opacity-30">VS</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={prediction.b}
              onChange={(e) => handleInput('b', e.target.value)}
              className="w-12 h-16 text-center text-3xl score-digit bg-secondary/50 rounded-xl border-2 border-transparent focus:border-primary focus:bg-background outline-none transition-all"
              placeholder="0"
            />
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-3 group-hover:scale-110 transition-transform">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src={badgeB} alt={teamB} className="w-16 h-16 object-contain relative z-10" />
            </div>
            <span className="text-sm font-headline font-bold text-center line-clamp-1">{teamB}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className={cn(
              "flex-1 h-12 font-headline font-bold text-sm uppercase tracking-wider transition-all",
              isSaved ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"
            )}
          >
            {isSaved ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Palpite Salvo
              </span>
            ) : (
              "Confirmar Palpite"
            )}
          </Button>
        </div>

        <AIInsightPanel
          teamA={teamA}
          teamB={teamB}
          teamARecentForm={teamARecentForm}
          teamBRecentForm={teamBRecentForm}
          matchDate={date}
        />
      </div>
    </Card>
  );
}
