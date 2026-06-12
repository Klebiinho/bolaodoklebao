'use server';

import { getWorldCupMatches, getTeamBadge } from '@/services/sports-db';
import { fetchPastResults } from '@/app/actions/sportsApi';

/**
 * Server Action para buscar e formatar jogos sem problemas de CORS.
 */
export async function getFormattedMatches() {
  try {
    const [events, pastEvents] = await Promise.all([
      getWorldCupMatches(),
      fetchPastResults()
    ]);
    
    const formattedMatches = await Promise.all(events.map(async (event) => {
      const pastResult = pastEvents.find((p: any) => p.idEvent === event.idEvent);
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
    console.error("Erro ao formatar jogos:", error);
    throw new Error("Erro ao carregar dados da Copa.");
  }
}
