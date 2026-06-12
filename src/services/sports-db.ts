/**
 * @fileOverview Serviço para interação com a API TheSportsDB focado na Copa 2026.
 */

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';
const WORLD_CUP_ID = '4429';

export interface SportsEvent {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  idAwayTeam: string;
  dateEvent: string;
  strTime: string;
  strTimestamp: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus?: string;
}

/**
 * Busca os jogos da Copa 2026 no servidor.
 */
export async function getWorldCupMatches(): Promise<SportsEvent[]> {
  try {
    const response = await fetch(`${BASE_URL}/eventsseason.php?id=${WORLD_CUP_ID}&s=2026`, {
      next: { revalidate: 60 } 
    });
    
    if (!response.ok) throw new Error('Falha na API TheSportsDB');
    
    const data = await response.json();
    
    if (data.events && data.events.length > 0) {
      return data.events;
    }
    
    return getMockMatches();
  } catch (error) {
    console.error('Erro ao buscar jogos da Copa 2026:', error);
    return getMockMatches();
  }
}

/**
 * Busca o escudo oficial de um time.
 */
export async function getTeamBadge(idTeam: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/lookupteam.php?id=${idTeam}`, {
      next: { revalidate: 3600 }
    });
    const data = await response.json();
    return data.teams?.[0]?.strTeamBadge || `https://picsum.photos/seed/${idTeam}/200/200`;
  } catch (error) {
    return `https://picsum.photos/seed/${idTeam}/200/200`;
  }
}

function getMockMatches(): SportsEvent[] {
  const now = new Date();
  return [
    {
      idEvent: '1',
      strEvent: 'Estados Unidos vs México',
      strHomeTeam: 'USA',
      strAwayTeam: 'Mexico',
      idHomeTeam: '133602',
      idAwayTeam: '133604',
      dateEvent: '2026-06-11',
      strTime: '21:00:00',
      strTimestamp: new Date(now.getTime() + 86400000).toISOString(),
      intHomeScore: null,
      intAwayScore: null
    },
    {
      idEvent: '2',
      strEvent: 'Brasil vs Argentina',
      strHomeTeam: 'Brazil',
      strAwayTeam: 'Argentina',
      idHomeTeam: '133597',
      idAwayTeam: '133600',
      dateEvent: '2026-06-15',
      strTime: '18:00:00',
      strTimestamp: new Date(now.getTime() - 3600000).toISOString(),
      intHomeScore: '1',
      intAwayScore: '1'
    },
    {
      idEvent: '3',
      strEvent: 'França vs Alemanha',
      strHomeTeam: 'France',
      strAwayTeam: 'Germany',
      idHomeTeam: '133598',
      idAwayTeam: '133601',
      dateEvent: '2026-06-12',
      strTime: '15:00:00',
      strTimestamp: new Date(now.getTime() - 172800000).toISOString(),
      intHomeScore: '2',
      intAwayScore: '0'
    }
  ];
}
