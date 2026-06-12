
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Lock, Clock, Circle, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { differenceInMinutes, parseISO, isAfter, addHours } from 'date-fns';
import { calculatePoints } from '@/lib/scoring';

interface MatchProps {
  id: string;
  teamA: string;
  teamB: string;
  badgeA: string;
  badgeB: string;
  displayDate: string;
  startTime: string;
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
      let matchStart: Date;
      
      try {
        matchStart = parseISO(startTime);
      } catch (e) {
        matchStart = new Date(startTime);
      }

      const matchEnd = addHours(matchStart, 2);
      
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
        description: "O prazo para palpites encerrou.",
        variant: "destructive"
      });
      return;
    }
    if (prediction.a === '' || prediction.b === '') {
      toast({
        title: "Campos vazios",
        description: "Preencha o placar antes de confirmar.",
        variant: "destructive"
      });
      return;
    }
    setIsSaved(true);
    toast({
      title: "Palpite Confirmado!",
      description: `Registrado para ${teamA} x ${teamB}.`,
    });
  };

  const points = (status === 'FINISHED' && isSaved && realScoreA !== null && realScoreB !== null) 
    ? calculatePoints({
        realHome: parseInt(realScoreA),
        realAway: parseInt(realScoreB),
        predHome: parseInt(prediction.a),
        predAway: parseInt(prediction.b)
      })
    : null;

  const isInteractionDisabled = status !== 'UPCOMING';

  return (
    <Card className={cn(
      "bg-card border-border/50 p-5 transition-all duration-300 relative overflow-hidden group",
      isInteractionDisabled ? "opacity-95" : "card-glow"
    )}>
      <div className={cn(
        "absolute top-0 left-0 w-1.5 h-full transition-colors",
        status === 'LIVE' ? "bg-red-500 animate-pulse" : 
        status === 'FINISHED' ? "bg-primary/40" : "bg-primary/20 group-hover:bg-primary"
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
            {status === 'UPCOMING' && <span className="text-accent flex items-center gap-1"><Clock className="w-3 h-3" /> PALPITES ABERTOS</span>}
          </span>
          <span className="text-muted-foreground/60">{displayDate}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center flex-1">
            <div className="relative w-14 h-14 mb-3">
              <Image 
                src={`${badgeA}/tiny`} 
                alt={teamA} 
                width={56} 
                height={56}
                className="object-contain drop-shadow-sm"
              />
            </div>
            <span className="text-[11px] font-headline font-black text-center uppercase tracking-tighter">{teamA}</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 flex-[1.5]">
            {(status === 'LIVE' || status === 'FINISHED') && (
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Resultado Real</span>
                <div className="flex items-center gap-3 bg-secondary/30 px-3 py-1 rounded-full border border-border/30">
                  <span className="text-2xl font-black italic tracking-tighter">{realScoreA || '0'}</span>
                  <span className="text-muted-foreground/30 font-bold text-[10px]">X</span>
                  <span className="text-2xl font-black italic tracking-tighter">{realScoreB || '0'}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  disabled={isInteractionDisabled}
                  value={prediction.a}
                  onChange={(e) => handleInput('a', e.target.value)}
                  className={cn(
                    "w-10 h-12 text-center text-xl font-black bg-secondary/30 rounded-lg border-2 border-transparent outline-none",
                    !isInteractionDisabled && "focus:border-primary",
                    isInteractionDisabled && "opacity-60"
                  )}
                  placeholder="-"
                />
                <span className="text-muted-foreground/20 font-headline font-bold text-xs">VS</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  disabled={isInteractionDisabled}
                  value={prediction.b}
                  onChange={(e) => handleInput('b', e.target.value)}
                  className={cn(
                    "w-10 h-12 text-center text-xl font-black bg-secondary/30 rounded-lg border-2 border-transparent outline-none",
                    !isInteractionDisabled && "focus:border-primary",
                    isInteractionDisabled && "opacity-60"
                  )}
                  placeholder="-"
                />
              </div>
              <span className="text-[8px] text-muted-foreground mt-2 uppercase font-black tracking-widest">Meu Palpite</span>
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="relative w-14 h-14 mb-3">
              <Image 
                src={`${badgeB}/tiny`} 
                alt={teamB} 
                width={56} 
                height={56}
                className="object-contain drop-shadow-sm"
              />
            </div>
            <span className="text-[11px] font-headline font-black text-center uppercase tracking-tighter">{teamB}</span>
          </div>
        </div>

        {status === 'UPCOMING' && (
          <Button
            onClick={handleSave}
            className={cn(
              "w-full h-10 font-headline font-bold text-xs uppercase tracking-wider rounded-xl transition-all",
              isSaved ? "bg-green-600 hover:bg-green-700" : "bg-primary"
            )}
          >
            {isSaved ? <Check className="w-4 h-4 mr-2" /> : null}
            {isSaved ? "Palpite Registrado" : "Confirmar Palpite"}
          </Button>
        )}

        {status === 'FINISHED' && points !== null && (
          <div className={cn(
            "w-full py-2.5 rounded-xl flex items-center justify-center gap-2 border animate-in fade-in zoom-in duration-500",
            points === 3 ? "bg-green-500/10 border-green-500/30 text-green-500" :
            points === 1 ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
            "bg-secondary/20 border-border/50 text-muted-foreground"
          )}>
            <Award className={cn("w-4 h-4", points > 0 && "animate-bounce")} />
            <span className="text-xs font-black uppercase tracking-widest">
              {points === 3 ? "Placar Exato! +3 PTS" : points === 1 ? "Acertou Vencedor! +1 PT" : "0 Pontos"}
            </span>
          </div>
        )}

        {status === 'FINISHED' && !isSaved && (
          <div className="w-full py-2.5 bg-secondary/10 rounded-xl flex items-center justify-center border border-dashed border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Nenhum palpite feito</span>
          </div>
        )}
      </div>
    </Card>
  );
}
