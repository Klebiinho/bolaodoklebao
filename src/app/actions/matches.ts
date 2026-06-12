
'use server';

import { getWorldCupMatches, getTeamBadge } from '@/services/sports-db';
import { fetchPastResults } from '@/app/actions/sportsApi';
import { createClient } from '@/utils/supabase/server';
import { calculatePoints } from '@/lib/scoring';

/**
 * Server Action para buscar e formatar jogos e dados do usuário.
 * Otimizado para reduzir o número de chamadas de API e tratar erros de forma robusta.
 */
export async function getFormattedMatches() {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    const [eventsResult, pastEventsResult] = await Promise.allSettled([
      getWorldCupMatches(),
      fetchPastResults()
    ]);
    
    const events = eventsResult.status === 'fulfilled' ? eventsResult.value : [];
    const pastEvents = pastEventsResult.status === 'fulfilled' ? pastEventsResult.value : [];
    
    // Buscar palpites do usuário se estiver logado
    let userPredictions: any[] = [];
    if (user) {
      const { data } = await supabase
        .from('Predictions')
        .select('*')
        .eq('user_id', user.id);
      userPredictions = data || [];
    }

    // Cache local de badges para evitar requisições duplicadas na mesma execução
    const badgeCache: Record<string, string> = {};

    const formattedMatches = await Promise.all(events.map(async (event) => {
      const pastResult = pastEvents.find((p: any) => p.idEvent === event.idEvent);
      const prediction = userPredictions.find(p => p.match_id === event.idEvent);
      
      // Otimização: busca badges em paralelo e usa cache
      const [badgeA, badgeB] = await Promise.all([
        badgeCache[event.idHomeTeam] || (badgeCache[event.idHomeTeam] = await getTeamBadge(event.idHomeTeam)),
        badgeCache[event.idAwayTeam] || (badgeCache[event.idAwayTeam] = await getTeamBadge(event.idAwayTeam))
      ]);

      const realScoreA = pastResult?.intHomeScore || event.intHomeScore;
      const realScoreB = pastResult?.intAwayScore || event.intAwayScore;

      return {
        id: event.idEvent,
        teamA: event.strHomeTeam,
        teamB: event.strAwayTeam,
        badgeA,
        badgeB,
        displayDate: `${event.dateEvent} - ${event.strTime?.substring(0, 5) || ''}`,
        startTime: event.strTimestamp,
        realScoreA: realScoreA !== null ? realScoreA.toString() : null,
        realScoreB: realScoreB !== null ? realScoreB.toString() : null,
        userPrediction: prediction ? {
          a: prediction.predicted_home_score,
          b: prediction.predicted_away_score
        } : null
      };
    }));

    return {
      matches: JSON.parse(JSON.stringify(formattedMatches)), // Garante serialização total
      timestamp: new Date().toLocaleTimeString()
    };
  } catch (error) {
    console.error("Erro crítico ao formatar jogos:", error);
    return {
      matches: [],
      timestamp: new Date().toLocaleTimeString(),
      error: "Não foi possível carregar os jogos."
    };
  }
}

/**
 * Server Action para calcular o ranking global.
 */
export async function getLeaderboardData() {
  try {
    const supabase = await createClient();
    
    // 1. Buscar todos os resultados reais
    const pastEvents = await fetchPastResults();
    
    // 2. Buscar todos os palpites e nomes dos usuários
    const { data: predictions, error } = await supabase
      .from('Predictions')
      .select('*, profiles:user_id(full_name)');

    if (error || !predictions) return [];

    const userPoints: Record<string, { name: string; points: number }> = {};

    predictions.forEach((pred: any) => {
      const matchResult = pastEvents.find((e: any) => e.idEvent === pred.match_id);
      if (matchResult && matchResult.intHomeScore !== null) {
        const pts = calculatePoints({
          realHome: parseInt(matchResult.intHomeScore),
          realAway: parseInt(matchResult.intAwayScore),
          predHome: pred.predicted_home_score,
          predAway: pred.predicted_away_score
        });

        const userId = pred.user_id;
        if (!userPoints[userId]) {
          userPoints[userId] = { 
            name: pred.profiles?.full_name || 'Anônimo', 
            points: 0 
          };
        }
        userPoints[userId].points += pts;
      }
    });

    const result = Object.entries(userPoints)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.points - a.points);

    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Erro ao carregar leaderboard:", error);
    return [];
  }
}
