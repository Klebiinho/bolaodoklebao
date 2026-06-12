/**
 * @fileOverview Serviço para interação com a API TheSportsDB focado na Copa 2026.
 */

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';
const WORLD_CUP_ID = '4429';

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
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus?: string; // Algumas versões da API retornam status
}

export interface Team {
  idTeam: string;
  strTeamBadge: string;
}

// Fallback de segurança caso a API gratuita retorne lista vazia para 2026
const now = new Date();
const formatIso = (date: Date) => date.toISOString();

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
    strTimestamp: formatIso(new Date(now.getTime() + 86400000)), // Amanhã
    intHomeScore: null,
    intAwayScore: null
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
    strTimestamp: formatIso(new Date(now.getTime() - 3600000)), // Começou faz 1 hora (AO VIVO)
    intHomeScore: '1',
    intAwayScore: '1'
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
    strTimestamp: formatIso(new Date(now.getTime() - 86400000)), // Ontem (ENCERRADO)
    intHomeScore: '0',
    intAwayScore: '2'
  }
];

export async function getWorldCupMatches(): Promise<SportsEvent[]> {
  try {
    const response = await fetch(`${BASE_URL}/eventsseason.php?id=${WORLD_CUP_ID}&s=2026`);
    const data = await response.json();
    
    // Se a API retornar eventos, usamos eles. Caso contrário, usamos o fallback de 2026.
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
