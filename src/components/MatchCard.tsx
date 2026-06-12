
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Lock, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { differenceInMinutes, parseISO, isAfter, addHours } from 'date-fns';

interface MatchProps {
  id: string;
  teamA: string;
  teamB: string;
  badgeA: string;
  badgeB: string;
  displayDate: string;
  startTime: string; // ISO String
  realScoreA: string | null;
  realScoreB: string | null;
}

export function MatchCard({ id, teamA, teamB, badgeA, badgeB, displayDate, startTime, realScoreA, realScoreB }: MatchProps) {
  const [prediction, setPrediction] = useState({ a: '', b: '' });
  const [isSaved, setIsSaved] = useState(false);
  const [status, setStatus] = useState<'UPCOMING' | 'LOCKED' | 'LIVE' | 'FINISHED'>('UPCOMING');

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const matchStart = parseISO(startTime);
      const matchEnd = addHours(matchStart, 2); // Estimativa de 2h de jogo
      
      if (isAfter(now, matchEnd)) {
        setStatus('FINISHED');
      } else if (isAfter(now, matchStart)) {
        setStatus('LIVE');
      } else {
        const minsToStart = differenceInMinutes(matchStart, now);
        if (minsToStart <= 30) {
          setStatus('LOCKED');
        } else {
          setStatus('UPCOMING');
        }
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleInput = (team: 'a' | 'b', val: string) => {
    if (status !== 'UPCOMING') return;
    if (!/^\d*$/.test(val)) return;
    setPrediction(prev => ({ ...prev, [team]: val }));
    setIsSaved(false);
  };

  const handleSave = () => {
    if (status !== 'UPCOMING') {
      toast({
        title: "Acesso negado",
        description: "O prazo para palpites encerrou ou o jogo já começou.",
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

  const isInteractionDisabled = status !== 'UPCOMING';

  return (
    <Card className={cn(
      "bg-card border-border/50 p-5 transition-all duration-300 relative overflow-hidden group",
      isInteractionDisabled ? "opacity-90" : "card-glow"
    )}>
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full transition-colors",
        status === 'LIVE' ? "bg-red-500 animate-pulse" : 
        status === 'FINISHED' ? "bg-muted" : "bg-primary/20 group-hover:bg-primary"
      )} />
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold">
          <span className="flex items-center gap-1.5">
            {status === 'LIVE' && (
              <span className="flex items-center gap-1.5 text-red-500">
                <Circle className="w-2 h-2 fill-current animate-pulse" /> AO VIVO
              </span>
            )}
            {status === 'FINISHED' && <span className="text-muted-foreground">ENCERRADO</span>}
            {status === 'LOCKED' && <span className="text-red-400 flex items-center gap-1"><Lock className="w-3 h-3" /> BLOQUEADO</span>}
            {status === 'UPCOMING' && <span className="text-accent flex items-center gap-1"><Clock className="w-3 h-3" /> ABERTO</span>}
          </span>
          <span className="text-muted-foreground/60">{displayDate}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center flex-1">
            <img src={badgeA} alt={teamA} className="w-14 h-14 object-contain mb-2" />
            <span className="text-xs font-headline font-bold text-center line-clamp-1">{teamA}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            {/* Placar Real (Se existir) */}
            {(status === 'LIVE' || status === 'FINISHED') && (
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl font-black italic text-foreground tracking-tighter">
                  {realScoreA || '0'}
                </span>
                <span className="text-muted-foreground/30 font-bold text-xs">X</span>
                <span className="text-4xl font-black italic text-foreground tracking-tighter">
                  {realScoreB || '0'}
                </span>
              </div>
            )}

            {/* Inputs de Palpite */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  disabled={isInteractionDisabled}
                  value={prediction.a}
                  onChange={(e) => handleInput('a', e.target.value)}
                  className={cn(
                    "w-10 h-12 text-center text-xl score-digit bg-secondary/30 rounded-lg border-2 border-transparent outline-none transition-all",
                    !isInteractionDisabled && "focus:border-primary focus:bg-background",
                    isInteractionDisabled && "cursor-not-allowed opacity-50 bg-secondary/10"
                  )}
                  placeholder="0"
                />
                <span className="text-[8px] text-muted-foreground mt-1 uppercase font-bold">Meu Palpite</span>
              </div>
              
              <span className="text-muted-foreground/20 font-headline font-bold text-sm mb-4">VS</span>
              
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  disabled={isInteractionDisabled}
                  value={prediction.b}
                  onChange={(e) => handleInput('b', e.target.value)}
                  className={cn(
                    "w-10 h-12 text-center text-xl score-digit bg-secondary/30 rounded-lg border-2 border-transparent outline-none transition-all",
                    !isInteractionDisabled && "focus:border-primary focus:bg-background",
                    isInteractionDisabled && "cursor-not-allowed opacity-50 bg-secondary/10"
                  )}
                  placeholder="0"
                />
                <span className="text-[8px] text-muted-foreground mt-1 uppercase font-bold">Meu Palpite</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <img src={badgeB} alt={teamB} className="w-14 h-14 object-contain mb-2" />
            <span className="text-xs font-headline font-bold text-center line-clamp-1">{teamB}</span>
          </div>
        </div>

        {status === 'UPCOMING' && (
          <Button
            onClick={handleSave}
            className={cn(
              "w-full h-11 font-headline font-bold text-xs uppercase tracking-wider transition-all rounded-xl",
              isSaved ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"
            )}
          >
            {isSaved ? <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Palpite Registrado</span> : "Confirmar Palpite"}
          </Button>
        )}

        {status === 'LOCKED' && (
          <div className="w-full py-3 bg-secondary/30 rounded-xl flex items-center justify-center gap-2 border border-border/50">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Entradas Bloqueadas (Pré-jogo)</span>
          </div>
        )}

        {(status === 'LIVE' || status === 'FINISHED') && (
          <div className="w-full py-3 bg-secondary/10 rounded-xl flex items-center justify-center gap-2 border border-dashed border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Acompanhando Resultado Real</span>
          </div>
        )}
      </div>
    </Card>
  );
}
