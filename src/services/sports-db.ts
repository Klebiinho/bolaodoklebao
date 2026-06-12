/**
 * @fileOverview Serviço para interação com a API TheSportsDB focado na Copa 2026 com tratamento de erros aprimorado.
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
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
}

/**
 * Busca os jogos da Copa 2026 no servidor.
 */
export async function getWorldCupMatches(): Promise<SportsEvent[]> {
  try {
    // Tenta buscar jogos da temporada 2026
    const response = await fetch(`${BASE_URL}/eventsseason.php?id=${WORLD_CUP_ID}&s=2026`, {
      next: { revalidate: 60 } 
    });
    
    if (!response.ok) return getMockMatches();

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return getMockMatches();
    
    const data = await response.json();
    
    // Se a API retornar eventos, tenta injetar os badges se eles não existirem
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
 * Busca o escudo oficial de um time diretamente da API.
 */
export async function getTeamBadge(idTeam: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/lookupteam.php?id=${idTeam}`, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) return getDefaultBadge(idTeam);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) return getDefaultBadge(idTeam);
    
    const data = await response.json();
    const badge = data.teams?.[0]?.strTeamBadge;
    
    // Retorna o badge com /preview para performance mobile
    return badge ? `${badge}/preview` : getDefaultBadge(idTeam);
  } catch (error) {
    return getDefaultBadge(idTeam);
  }
}

/**
 * Fallback para escudos caso a API falhe, evitando imagens de paisagem.
 */
function getDefaultBadge(idTeam: string): string {
  return `https://www.thesportsdb.com/images/media/team/badge/placeholder.png`;
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
