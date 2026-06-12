'use server';

/**
 * @fileOverview Server Action para buscar resultados reais da API TheSportsDB com tratamento robusto de erros.
 */

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';
const WORLD_CUP_ID = '4429';

export async function fetchPastResults() {
  try {
    const response = await fetch(`${BASE_URL}/eventspastleague.php?id=${WORLD_CUP_ID}`, {
      next: { revalidate: 300 } // Cache de 5 minutos
    });

    if (!response.ok) {
      console.warn('TheSportsDB API returned non-OK status:', response.status);
      return [];
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('TheSportsDB API returned non-JSON content:', contentType);
      return [];
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Erro ao buscar resultados passados:', error);
    return [];
  }
}
