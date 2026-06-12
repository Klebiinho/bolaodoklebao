
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { differenceInMinutes, parseISO } from 'date-fns';

interface MatchProps {
  id: string;
  teamA: string;
  teamB: string;
  badgeA: string;
  badgeB: string;
  displayDate: string;
  startTime: string; // ISO String
}

export function MatchCard({ id, teamA, teamB, badgeA, badgeB, displayDate, startTime }: MatchProps) {
  const [prediction, setPrediction] = useState({ a: '', b: '' });
  const [isSaved, setIsSaved] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const checkLockStatus = () => {
      const now = new Date();
      const matchStart = parseISO(startTime);
      const minutesUntilMatch = differenceInMinutes(matchStart, now);
      
      // Bloqueia se faltar 30 minutos ou menos
      if (minutesUntilMatch <= 30) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    };

    checkLockStatus();
    const interval = setInterval(checkLockStatus, 60000); // Checa a cada minuto
    return () => clearInterval(interval);
  }, [startTime]);

  const handleInput = (team: 'a' | 'b', val: string) => {
    if (isLocked) return;
    if (!/^\d*$/.test(val)) return;
    setPrediction(prev => ({ ...prev, [team]: val }));
    setIsSaved(false);
  };

  const handleSave = () => {
    if (isLocked) {
      toast({
        title: "Prazo encerrado",
        description: "Palpites devem ser feitos até 30 minutos antes do jogo.",
        variant: "destructive"
      });
      return;
    }
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
    <Card className={cn(
      "bg-card border-border/50 p-5 transition-all duration-300 relative overflow-hidden group",
      isLocked ? "opacity-75 grayscale-[0.5]" : "card-glow"
    )}>
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full transition-colors",
        isLocked ? "bg-muted" : "bg-primary/20 group-hover:bg-primary"
      )} />
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/60">
          <span className="flex items-center gap-1.5">
            {isLocked ? (
              <span className="flex items-center gap-1 text-red-400">
                <Lock className="w-3 h-3" /> PALPITES ENCERRADOS
              </span>
            ) : (
              <span className="flex items-center gap-1 text-accent">
                <Clock className="w-3 h-3 animate-pulse" /> ABERTO PARA PALPITES
              </span>
            )}
          </span>
          <span>{displayDate}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-3 group-hover:scale-110 transition-transform">
              {!isLocked && <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
              <img src={badgeA} alt={teamA} className="w-16 h-16 object-contain relative z-10" />
            </div>
            <span className="text-sm font-headline font-bold text-center line-clamp-1">{teamA}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              disabled={isLocked}
              value={prediction.a}
              onChange={(e) => handleInput('a', e.target.value)}
              className={cn(
                "w-12 h-16 text-center text-3xl score-digit bg-secondary/50 rounded-xl border-2 border-transparent outline-none transition-all",
                !isLocked && "focus:border-primary focus:bg-background",
                isLocked && "cursor-not-allowed opacity-50"
              )}
              placeholder="0"
            />
            <span className="text-muted-foreground font-headline font-bold opacity-30">VS</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              disabled={isLocked}
              value={prediction.b}
              onChange={(e) => handleInput('b', e.target.value)}
              className={cn(
                "w-12 h-16 text-center text-3xl score-digit bg-secondary/50 rounded-xl border-2 border-transparent outline-none transition-all",
                !isLocked && "focus:border-primary focus:bg-background",
                isLocked && "cursor-not-allowed opacity-50"
              )}
              placeholder="0"
            />
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-3 group-hover:scale-110 transition-transform">
              {!isLocked && <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />}
              <img src={badgeB} alt={teamB} className="w-16 h-16 object-contain relative z-10" />
            </div>
            <span className="text-sm font-headline font-bold text-center line-clamp-1">{teamB}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isLocked}
            className={cn(
              "flex-1 h-12 font-headline font-bold text-sm uppercase tracking-wider transition-all",
              isSaved ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90",
              isLocked && "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted"
            )}
          >
            {isLocked ? (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" /> Bloqueado
              </span>
            ) : isSaved ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Palpite Salvo
              </span>
            ) : (
              "Confirmar Palpite"
            )}
          </Button>
        </div>

        {isLocked && (
          <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tight">
            Os palpites para este jogo foram encerrados 30 minutos antes do início.
          </p>
        )}
      </div>
    </Card>
  );
}
