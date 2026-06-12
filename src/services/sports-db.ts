
/**
 * @fileOverview Serviço para interação com a API TheSportsDB focado na Copa 2026.
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

// Fallback de jogos para 2026 (EUA, México e Canadá) com IDs reais para busca de escudos
const MOCK_2026_MATCHES: SportsEvent[] = [
  {
    idEvent: 'mock1',
    strEvent: 'Estados Unidos vs México',
    strFilename: '',
    strHomeTeam: 'USA',
    strAwayTeam: 'Mexico',
    idHomeTeam: '133602',
    idAwayTeam: '133604',
    dateEvent: '2026-06-11',
    strTime: '21:00:00',
    strThumb: '',
    strTimestamp: '2026-06-11T21:00:00Z'
  },
  {
    idEvent: 'mock2',
    strEvent: 'Brasil vs Argentina',
    strFilename: '',
    strHomeTeam: 'Brazil',
    strAwayTeam: 'Argentina',
    idHomeTeam: '133597',
    idAwayTeam: '133600',
    dateEvent: '2026-06-15',
    strTime: '18:00:00',
    strThumb: '',
    strTimestamp: '2026-06-15T18:00:00Z'
  },
  {
    idEvent: 'mock3',
    strEvent: 'Canadá vs Inglaterra',
    strFilename: '',
    strHomeTeam: 'Canada',
    strAwayTeam: 'England',
    idHomeTeam: '133611',
    idAwayTeam: '133612',
    dateEvent: '2026-06-12',
    strTime: '15:00:00',
    strThumb: '',
    strTimestamp: '2026-06-12T15:00:00Z'
  },
  {
    idEvent: 'mock4',
    strEvent: 'França vs Alemanha',
    strFilename: '',
    strHomeTeam: 'France',
    strAwayTeam: 'Germany',
    idHomeTeam: '133613',
    idAwayTeam: '133614',
    dateEvent: '2026-06-20',
    strTime: '20:00:00',
    strThumb: '',
    strTimestamp: '2026-06-20T20:00:00Z'
  },
  {
    idEvent: 'mock5',
    strEvent: 'Espanha vs Portugal',
    strFilename: '',
    strHomeTeam: 'Spain',
    strAwayTeam: 'Portugal',
    idHomeTeam: '133615',
    idAwayTeam: '133616',
    dateEvent: '2026-06-22',
    strTime: '16:00:00',
    strThumb: '',
    strTimestamp: '2026-06-22T16:00:00Z'
  }
];

export async function getWorldCupMatches(): Promise<SportsEvent[]> {
  try {
    // Tenta buscar temporada 2026
    const response = await fetch(`${BASE_URL}/eventsseason.php?id=${WORLD_UP_ID}&s=2026`);
    const data = await response.json();
    
    // Se a API não retornar nada para 2026 (comum na chave 123), usamos o mock planejado
    if (!data.events || data.events.length === 0) {
      return MOCK_2026_MATCHES;
    }
    
    return data.events;
  } catch (error) {
    console.error('Erro ao buscar jogos da Copa 2026:', error);
    return MOCK_2026_MATCHES;
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
