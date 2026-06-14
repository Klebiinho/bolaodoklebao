
'use server';

import { getWorldCupMatches, getLocalBadge } from '@/services/sports-db';
import { createClient } from '@/utils/supabase/server';
import { calculatePoints } from '@/lib/scoring';

export async function getFormattedMatches() {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    const eventsResult = await Promise.allSettled([
      getWorldCupMatches()
    ]);
    
    const events = eventsResult[0].status === 'fulfilled' ? eventsResult[0].value : [];
    
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


    const formattedMatches = await Promise.all(events.map(async (event) => {
      const prediction = userPredictions.find(p => p.match_id === event.idEvent);
      
      const badgeA = getLocalBadge(event.strHomeTeam);
      const badgeB = getLocalBadge(event.strAwayTeam);

      const realScoreA = event.intHomeScore;
      const realScoreB = event.intAwayScore;

      let brtDateStr = `${event.dateEvent} - ${event.strTime?.substring(0, 5) || ''}`;
      if (event.dateEvent && event.strTime) {
        const d = new Date(`${event.dateEvent}T${event.strTime}Z`);
        if (!isNaN(d.getTime())) {
          brtDateStr = d.toLocaleDateString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }).replace(', ', ' - ');
        }
      }

      return {
        id: event.idEvent,
        teamA: event.strHomeTeam,
        teamB: event.strAwayTeam,
        badgeA,
        badgeB,
        displayDate: brtDateStr,
        startTime: event.strTimestamp,
        realScoreA: realScoreA !== null ? realScoreA.toString() : null,
        realScoreB: realScoreB !== null ? realScoreB.toString() : null,
        status: event.strStatus,
        round: event.intRound || null,
        group: event.strGroup || null,
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
    
    // Dispara todas as consultas ao banco SIMULTANEAMENTE para não bloquear o carregamento
    const [pastEvents, predictionsResult, profilesResult] = await Promise.all([
      getWorldCupMatches(),
      supabase.from('Predictions').select('*'),
      supabase.from('profiles').select('id, full_name')
    ]);

    const { data: predictions, error: predError } = predictionsResult;
    const { data: profiles, error: profError } = profilesResult;

    if (predError || !predictions) {
      console.warn("Problema ao buscar predições:", predError);
      return [];
    }

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
