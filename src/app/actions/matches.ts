'use server';

import { getWorldCupMatches, getTeamBadge } from '@/services/sports-db';
import { fetchPastResults } from '@/app/actions/sportsApi';

/**
 * Server Action para buscar e formatar jogos sem problemas de CORS.
 */
export async function getFormattedMatches() {
  try {
    // Usamos Promise.allSettled para garantir que mesmo que uma chamada falhe, tenhamos algo para mostrar
    const [eventsResult, pastEventsResult] = await Promise.allSettled([
      getWorldCupMatches(),
      fetchPastResults()
    ]);
    
    const events = eventsResult.status === 'fulfilled' ? eventsResult.value : [];
    const pastEvents = pastEventsResult.status === 'fulfilled' ? pastEventsResult.value : [];
    
    const formattedMatches = await Promise.all(events.map(async (event) => {
      const pastResult = pastEvents.find((p: any) => p.idEvent === event.idEvent);
      
      // Tentamos buscar badges, se falhar usamos o fallback interno do getTeamBadge
      const [badgeA, badgeB] = await Promise.all([
        getTeamBadge(event.idHomeTeam),
        getTeamBadge(event.idAwayTeam)
      ]);

      return {
        id: event.idEvent,
        teamA: event.strHomeTeam,
        teamB: event.strAwayTeam,
        badgeA,
        badgeB,
        displayDate: `${event.dateEvent} - ${event.strTime.substring(0, 5)}`,
        startTime: event.strTimestamp,
        realScoreA: pastResult?.intHomeScore || event.intHomeScore,
        realScoreB: pastResult?.intAwayScore || event.intAwayScore,
      };
    }));

    return {
      matches: formattedMatches,
      timestamp: new Date().toLocaleTimeString()
    };
  } catch (error) {
    console.error("Erro crítico ao formatar jogos:", error);
    // Em caso de erro catastrófico, retornamos uma estrutura mínima para não quebrar o app
    return {
      matches: [],
      timestamp: new Date().toLocaleTimeString()
    };
  }
}
