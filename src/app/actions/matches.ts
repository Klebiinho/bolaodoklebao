
'use server';

import { getWorldCupMatches, getTeamBadge } from '@/services/sports-db';
import { fetchPastResults } from '@/app/actions/sportsApi';
import { createClient } from '@/utils/supabase/server';
import { calculatePoints } from '@/lib/scoring';

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
    
    let userPredictions: any[] = [];
    if (user) {
      const { data, error } = await supabase
        .from('Predictions')
        .select('*')
        .eq('user_id', user.id);
      
      if (!error && data) {
        userPredictions = data;
      }
    }

    const badgeCache: Record<string, string> = {};

    const formattedMatches = await Promise.all(events.map(async (event) => {
      const pastResult = pastEvents.find((p: any) => p.idEvent === event.idEvent);
      const prediction = userPredictions.find(p => p.match_id === event.idEvent);
      
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
      matches: JSON.parse(JSON.stringify(formattedMatches)),
      timestamp: new Date().toLocaleTimeString('pt-BR')
    };
  } catch (error) {
    console.error("Erro crítico ao formatar jogos:", error);
    return {
      matches: [],
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      error: "Não foi possível carregar os jogos."
    };
  }
}

export async function getLeaderboardData() {
  try {
    const supabase = await createClient();
    const pastEvents = await fetchPastResults();
    
    // Busca predições. Fazemos a busca de perfis separadamente para garantir compatibilidade
    // caso o relacionamento de chave estrangeira não seja detectado automaticamente.
    const { data: predictions, error: predError } = await supabase
      .from('Predictions')
      .select('*');

    if (predError || !predictions) {
      console.warn("Problema ao buscar predições:", predError);
      return [];
    }

    // Busca todos os perfis para fazer o merge em memória (mais resiliente)
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name');

    const profileMap: Record<string, string> = {};
    if (profiles) {
      profiles.forEach(p => {
        profileMap[p.id] = p.full_name || 'Usuário Sem Nome';
      });
    }

    const userPoints: Record<string, { name: string; points: number }> = {};

    predictions.forEach((pred: any) => {
      const matchResult = pastEvents.find((e: any) => e.idEvent === pred.match_id);
      
      if (matchResult && matchResult.intHomeScore !== null && matchResult.intAwayScore !== null) {
        const pts = calculatePoints({
          realHome: parseInt(matchResult.intHomeScore),
          realAway: parseInt(matchResult.intAwayScore),
          predHome: pred.predicted_home_score,
          predAway: pred.predicted_away_score
        });

        const userId = pred.user_id;
        if (!userPoints[userId]) {
          userPoints[userId] = { 
            name: profileMap[userId] || 'Anônimo', 
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
