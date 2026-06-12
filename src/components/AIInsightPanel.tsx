
'use client';

import { useState, useEffect } from 'react';
import { aiMatchInsights, AIMatchInsightsOutput } from '@/ai/flows/ai-match-insights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Trophy, BrainCircuit, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AIInsightPanelProps {
  teamA: string;
  teamB: string;
  teamARecentForm: string;
  teamBRecentForm: string;
  matchDate: string;
}

export function AIInsightPanel({ teamA, teamB, teamARecentForm, teamBRecentForm, matchDate }: AIInsightPanelProps) {
  const [insights, setInsights] = useState<AIMatchInsightsOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const result = await aiMatchInsights({
        teamA,
        teamB,
        teamARecentForm,
        teamBRecentForm,
        matchDate,
      });
      setInsights(result);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="mt-4">
      {loading && (
        <div className="flex flex-col items-center justify-center p-8 bg-card/50 rounded-xl border border-dashed border-primary/20 animate-pulse">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Processando estatísticas...</p>
        </div>
      )}

      {insights && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <Card className="bg-primary/5 border-primary/20 shadow-none overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2">
              <Sparkles className="w-4 h-4 text-primary opacity-50" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2 text-primary uppercase tracking-widest">
                <BrainCircuit className="w-4 h-4" />
                Insights do Analista
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="italic text-muted-foreground">"{insights.commentary}"</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-1 font-semibold text-primary">
                    <TrendingUp className="w-3 h-3" />
                    {teamA}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insights.teamAAnalysis}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-1 font-semibold text-primary">
                    <TrendingUp className="w-3 h-3" />
                    {teamB}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insights.teamBAnalysis}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-accent" />
                    <span className="font-bold text-accent">Palpite Sugerido</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-accent/30 text-accent">
                    Confiança: {insights.predictionConfidence}%
                  </Badge>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                  <p className="text-accent font-medium">{insights.likelyOutcome}</p>
                </div>
                <div className="mt-3">
                  <Progress value={insights.predictionConfidence} className="h-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
