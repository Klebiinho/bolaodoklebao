'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Lock, Clock, Circle, Award, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { differenceInMinutes, parseISO, isAfter, addHours } from 'date-fns';
import { calculatePoints } from '@/lib/scoring';
import { createClient } from '@/utils/supabase/client';
import { MatchDetailsView } from './MatchDetailsView';

const COUNTRY_TRANSLATIONS: Record<string, string> = {
  // Américas (CONMEBOL e CONCACAF)
  "Argentina": "Argentina",
  "Brazil": "Brasil",
  "Canada": "Canadá",
  "Colombia": "Colômbia",
  "Curacao": "Curaçao",
  "Ecuador": "Equador",
  "Haiti": "Haiti",
  "Mexico": "México",
  "Panama": "Panamá",
  "Paraguay": "Paraguai",
  "United States": "Estados Unidos",
  "USA": "Estados Unidos",
  "Uruguay": "Uruguai",

  // Europa (UEFA)
  "Austria": "Áustria",
  "Belgium": "Bélgica",
  "Bosnia and Herzegovina": "Bósnia e Herzegovina",
  "Croatia": "Croácia",
  "Czech Republic": "República Tcheca",
  "England": "Inglaterra",
  "France": "França",
  "Germany": "Alemanha",
  "Netherlands": "Holanda",
  "Norway": "Noruega",
  "Portugal": "Portugal",
  "Scotland": "Escócia",
  "Spain": "Espanha",
  "Sweden": "Suécia",
  "Switzerland": "Suíça",
  "Turkey": "Turquia",
  "Türkiye": "Turquia",

  // Ásia e Oceania (AFC e OFC)
  "Australia": "Austrália",
  "Iran": "Irã",
  "Iraq": "Iraque",
  "Japan": "Japão",
  "Jordan": "Jordânia",
  "New Zealand": "Nova Zelândia",
  "Qatar": "Catar",
  "Saudi Arabia": "Arábia Saudita",
  "South Korea": "Coreia do Sul",
  "Uzbekistan": "Uzbequistão",

  // África (CAF)
  "Algeria": "Argélia",
  "Cape Verde": "Cabo Verde",
  "DR Congo": "RD Congo",
  "Egypt": "Egito",
  "Ghana": "Gana",
  "Ivory Coast": "Costa do Marfim",
  "Morocco": "Marrocos",
  "Senegal": "Senegal",
  "South Africa": "África do Sul",
  "Tunisia": "Tunísia",
  "Italy": "Itália"
};

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
  userPrediction?: { a: number; b: number } | null;
}

export function MatchCard({ id, teamA, teamB, badgeA, badgeB, displayDate, startTime, realScoreA, realScoreB, userPrediction }: MatchProps) {
  const [prediction, setPrediction] = useState({ 
    a: userPrediction?.a.toString() || '', 
    b: userPrediction?.b.toString() || '' 
  });
  const [isSaved, setIsSaved] = useState(!!userPrediction);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'UPCOMING' | 'LOCKED' | 'LIVE' | 'FINISHED'>('UPCOMING');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const supabase = createClient();

  const getTranslatedName = (name: string) => COUNTRY_TRANSLATIONS[name] || name;

  useEffect(() => {
    let interval: NodeJS.Timeout;

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
        if (interval) clearInterval(interval);
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
    interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Sincroniza estado local com props se elas mudarem
  useEffect(() => {
    if (userPrediction) {
      setPrediction({
        a: userPrediction.a.toString(),
        b: userPrediction.b.toString()
      });
      setIsSaved(true);
    }
  }, [userPrediction]);

  const handleInput = (team: 'a' | 'b', val: string) => {
    if (status !== 'UPCOMING') return;
    if (!/^\d*$/.test(val)) return;
    setPrediction(prev => ({ ...prev, [team]: val }));
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (status !== 'UPCOMING') {
      toast({
        title: "Acesso negado",
        description: "O prazo para palpites encerrou (30 min antes do jogo).",
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

    setIsSaving(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar logado para salvar palpites.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('Predictions')
        .upsert({
          match_id: id,
          user_id: user.id,
          predicted_home_score: parseInt(prediction.a),
          predicted_away_score: parseInt(prediction.b),
        }, { 
          onConflict: 'match_id, user_id' 
        });

      if (error) throw error;

      setIsSaved(true);
      toast({
        title: "Palpite Confirmado!",
        description: `Registrado para ${getTranslatedName(teamA)} x ${getTranslatedName(teamB)}.`,
      });
    } catch (error: any) {
      console.error("Erro ao salvar palpite:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao tentar registrar seu palpite.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const points = (status === 'FINISHED' && isSaved && realScoreA !== null && realScoreB !== null) 
    ? calculatePoints({
        realHome: parseInt(realScoreA),
        realAway: parseInt(realScoreB),
        predHome: parseInt(prediction.a),
        predAway: parseInt(prediction.b)
      })
    : null;

  const isInteractionDisabled = status !== 'UPCOMING' || isSaving;

  return (
    <Card className={cn(
      "bg-card border border-border/50 rounded-xl p-5 shadow-sm transition-all duration-300 relative group hover:border-primary/30",
      isInteractionDisabled && status !== 'UPCOMING' ? "opacity-95" : ""
    )}>

      
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold">
          <span className="flex items-center gap-1.5">
            {status === 'LIVE' && (
              <span className="flex items-center gap-1.5 text-red-500">
                <Circle className="w-2 h-2 fill-current animate-pulse" /> AO VIVO
              </span>
            )}
            {status === 'FINISHED' && <span className="text-muted-foreground">ENCERRADO</span>}
            {status === 'LOCKED' && <span className="text-red-400 flex items-center gap-1"><Lock className="w-3 h-3" /> PALPITES ENCERRADOS</span>}
            {status === 'UPCOMING' && <span className="text-accent flex items-center gap-1"><Clock className="w-3 h-3" /> PALPITES ABERTOS</span>}
          </span>
          <span className="text-muted-foreground/60">{displayDate}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col items-center flex-1">
            <div className="w-14 h-14 mb-3 flex items-center justify-center">
              <img 
                src={badgeA} 
                alt={getTranslatedName(teamA)} 
                className="max-w-full max-h-full object-contain drop-shadow-md"
              />
            </div>
            <span className="text-[11px] font-headline font-black text-center uppercase tracking-tighter line-clamp-1">
              {getTranslatedName(teamA)}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 flex-[1.5]">
            {(status === 'LIVE' || status === 'FINISHED') && (
              <div className="flex flex-col items-center">
                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mb-1 bg-secondary px-2 py-0.5 rounded-sm">Placar Oficial</span>
                <div className="flex items-center gap-3 bg-transparent px-3 py-1">
                  <span className="text-2xl font-headline font-semibold tracking-tighter">{realScoreA || '0'}</span>
                  <span className="text-muted-foreground/40 font-bold text-[10px]">X</span>
                  <span className="text-2xl font-headline font-semibold tracking-tighter">{realScoreB || '0'}</span>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center w-full">
              <div className="flex items-center gap-3">
                <input
                  id={`home-score-${id}`}
                  name={`home-score-${id}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  disabled={isInteractionDisabled}
                  value={prediction.a}
                  onChange={(e) => handleInput('a', e.target.value)}
                  className={cn(
                    "w-12 h-12 text-center text-xl font-headline font-semibold bg-background rounded-md border border-border shadow-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary",
                    (status !== 'UPCOMING' || isSaving) && "opacity-60"
                  )}
                  placeholder="-"
                />
                <span className="text-muted-foreground/20 font-headline font-bold text-xs">VS</span>
                <input
                  id={`away-score-${id}`}
                  name={`away-score-${id}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  disabled={isInteractionDisabled}
                  value={prediction.b}
                  onChange={(e) => handleInput('b', e.target.value)}
                  className={cn(
                    "w-12 h-12 text-center text-xl font-headline font-semibold bg-background rounded-md border border-border shadow-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary",
                    (status !== 'UPCOMING' || isSaving) && "opacity-60"
                  )}
                  placeholder="-"
                />
              </div>
              <span className="text-[8px] text-muted-foreground mt-2 uppercase font-black tracking-widest">Meu Palpite</span>
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="w-14 h-14 mb-3 flex items-center justify-center">
              <img 
                src={badgeB} 
                alt={getTranslatedName(teamB)} 
                className="max-w-full max-h-full object-contain drop-shadow-md"
              />
            </div>
            <span className="text-[11px] font-headline font-black text-center uppercase tracking-tighter line-clamp-1">
              {getTranslatedName(teamB)}
            </span>
          </div>
        </div>

        {status === 'UPCOMING' && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "w-full h-11 font-headline font-semibold text-xs uppercase tracking-wider rounded-md border border-transparent shadow-sm hover:-translate-y-0.5 transition-all",
              isSaved ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isSaved ? (
              <Check className="w-4 h-4 mr-2" />
            ) : null}
            {isSaving ? "Salvando..." : isSaved ? "Palpite Registrado" : "Confirmar Palpite"}
          </Button>
        )}

        {status === 'FINISHED' && points !== null && (
          <div className={cn(
            "w-full py-3 rounded-lg flex items-center justify-center gap-2 border border-border/50 animate-in fade-in zoom-in duration-500 shadow-sm",
            points === 3 ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
            points === 1 ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
            "bg-secondary text-muted-foreground"
          )}>
            <Award className={cn("w-4 h-4", points > 0 && "animate-bounce")} />
            <span className="text-xs font-black uppercase tracking-widest">
              {points === 3 ? "Placar Exato! +3 PTS" : points === 1 ? "Acertou Vencedor! +1 PT" : "0 Pontos"}
            </span>
          </div>
        )}

        {status === 'FINISHED' && points === null && !isSaved && (
          <div className="w-full py-3 bg-secondary/50 rounded-lg flex items-center justify-center border border-border/50">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Nenhum palpite feito</span>
          </div>
        )}

        <Button 
          variant="ghost" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-8 text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-secondary/50 hover:text-foreground mt-2"
        >
          {isExpanded ? (
            <>Menos sobre esse jogo <ChevronUp className="w-3 h-3 ml-2" /></>
          ) : (
            <>Mais sobre esse jogo <ChevronDown className="w-3 h-3 ml-2" /></>
          )}
        </Button>

        {isExpanded && (
          <MatchDetailsView 
            matchId={id} 
            teamA={getTranslatedName(teamA)} 
            teamB={getTranslatedName(teamB)} 
            badgeA={badgeA} 
            badgeB={badgeB} 
            date={startTime}
          />
        )}
      </div>
    </Card>
  );
}
