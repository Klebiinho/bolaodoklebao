
/**
 * @fileOverview Serviço para interação com a API TheSportsDB.
 */

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';
const WORLD_UP_ID = '4429';

export interface SportsEvent {
  idEvent: string;
  strEvent: string;
  strFilename: string;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  idAwayTeam: string;
  dateEvent: string;
  strTime: string;
  strThumb: string;
  strTimestamp: string;
}

export interface Team {
  idTeam: string;
  strTeamBadge: string;
}

export async function getWorldCupMatches(): Promise<SportsEvent[]> {
  try {
    // Buscamos os eventos da temporada de 2022 como exemplo para garantir que tenhamos dados
    // Já que a próxima Copa do Mundo (2026) pode não ter eventos agendados na API gratuita ainda.
    const response = await fetch(`${BASE_URL}/eventsseason.php?id=${WORLD_UP_ID}&s=2022`);
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Erro ao buscar jogos da Copa:', error);
    return [];
  }
}

export async function getTeamDetails(idTeam: string): Promise<Team | null> {
  try {
    const response = await fetch(`${BASE_URL}/lookupteam.php?id=${idTeam}`);
    const data = await response.json();
    return data.teams ? data.teams[0] : null;
  } catch (error) {
    console.error('Erro ao buscar detalhes do time:', error);
    return null;
  }
}
