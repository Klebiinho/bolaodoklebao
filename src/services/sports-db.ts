/**
 * @fileOverview Serviço de dados da Copa do Mundo 2026.
 * 
 * ESTRATÉGIA DE ECONOMIA DE REQUISIÇÕES:
 * ─────────────────────────────────────────
 * 1. O app NUNCA faz requisições à API TheSportsDB para renderizar páginas.
 *    Tudo é lido do banco de dados Supabase (tabela 'matches').
 * 
 * 2. A sincronização com a API acontece APENAS via /api/sync:
 *    - mode=full  → Busca TODOS os jogos da temporada (2 requests). Rodar 1x/dia.
 *    - mode=live  → Busca APENAS jogos com placar mudando (1 request). Rodar a cada 5-10 min em dia de jogo.
 * 
 * 3. Jogos com status 'FT' (Full Time) são marcados como finalizados no banco
 *    e NUNCA mais geram requisições à API.
 * 
 * 4. Escudos/bandeiras são servidos localmente de /public/badges/ (0 requests).
 */

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';
const WORLD_CUP_ID = '4429';

import { createClient } from '@/utils/supabase/server';

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
  intRound?: string;
  strGroup?: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
}

// ════════════════════════════════════════════════════════════════
// LEITURA — Sempre do banco de dados, ZERO requisições externas
// ════════════════════════════════════════════════════════════════

/**
 * Lê todos os jogos da tabela 'matches' do Supabase.
 * Essa função é chamada por todas as páginas do app.
 * NÃO faz nenhuma requisição à API externa.
 */
export async function getWorldCupMatches(): Promise<SportsEvent[]> {
  try {
    const supabase = await createClient();

    const { data: dbMatches, error } = await supabase
      .from('matches')
      .select('*')
      .order('str_timestamp', { ascending: true });

    if (error) {
      console.error('Erro ao buscar jogos do banco:', error);
      return [];
    }

    if (!dbMatches || dbMatches.length === 0) {
      return [];
    }

    return dbMatches.map((m: any) => ({
      idEvent: m.id_event,
      strEvent: m.str_event,
      strHomeTeam: m.str_home_team,
      strAwayTeam: m.str_away_team,
      idHomeTeam: m.id_home_team,
      idAwayTeam: m.id_away_team,
      dateEvent: m.date_event,
      strTime: m.str_time,
      strTimestamp: m.str_timestamp,
      intHomeScore: m.int_home_score,
      intAwayScore: m.int_away_score,
      strStatus: m.str_status,
      intRound: m.int_round,
      strGroup: m.str_group
    }));
  } catch (error) {
    console.error('Erro ao buscar jogos no Supabase:', error);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════
// SINCRONIZAÇÃO — Só roda quando chamada via /api/sync
// ════════════════════════════════════════════════════════════════

/**
 * SYNC COMPLETO — Busca TODOS os jogos da Copa 2026 varrendo dia a dia.
 * A API free retorna no máximo 3-5 jogos por endpoint, então precisamos
 * buscar por data (eventsday.php) para cada dia do torneio.
 * Inclui delay de 2s entre requisições para evitar rate-limit (erro 1015).
 * Ideal para: rodar 1x por dia, ou quando precisar popular o banco.
 */
export async function syncFullToDB() {
  try {
    const supabase = await createClient();
    let events: any[] = [];

    // Gera todas as datas da fase de grupos da Copa 2026 (11/Jun - 28/Jun)
    // + oitavas/quartas/semi/final (29/Jun - 19/Jul)
    const startDate = new Date('2026-06-11');
    const endDate = new Date('2026-07-19');
    const dates: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    // Função auxiliar para delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Busca jogos dia a dia com delay de 2s entre cada request
    for (const date of dates) {
      try {
        const res = await fetch(
          `${BASE_URL}/eventsday.php?d=${date}&l=${WORLD_CUP_ID}`,
          { cache: 'no-store' }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.events)) {
            events = [...events, ...data.events];
          }
        }
      } catch { /* ignora erros individuais */ }
      await delay(2000); // 2 segundos entre requests para evitar rate-limit
    }

    // Também busca past e next como fallback (pegam jogos do dia atual)
    try {
      const [pastRes, nextRes] = await Promise.all([
        fetch(`${BASE_URL}/eventspastleague.php?id=${WORLD_CUP_ID}`, { cache: 'no-store' }),
        fetch(`${BASE_URL}/eventsnextleague.php?id=${WORLD_CUP_ID}`, { cache: 'no-store' })
      ]);
      for (const res of [pastRes, nextRes]) {
        if (res.ok) {
          try {
            const data = await res.json();
            if (Array.isArray(data.events)) events = [...events, ...data.events];
          } catch { /* ignora */ }
        }
      }
    } catch { /* ignora */ }

    if (events.length === 0) {
      return { success: false, error: 'API não retornou nenhum evento', count: 0 };
    }

    // Remove duplicatas por idEvent
    const uniqueEvents = Array.from(
      new Map(events.map(item => [item.idEvent, item])).values()
    );

    let upsertCount = 0;
    for (const event of uniqueEvents) {
      const { error } = await supabase.from('matches').upsert({
        id_event: event.idEvent,
        str_event: event.strEvent,
        str_home_team: event.strHomeTeam,
        str_away_team: event.strAwayTeam,
        id_home_team: event.idHomeTeam,
        id_away_team: event.idAwayTeam,
        date_event: event.dateEvent,
        str_time: event.strTime,
        str_timestamp: event.strTimestamp,
        int_home_score: event.intHomeScore,
        int_away_score: event.intAwayScore,
        str_status: event.strStatus,
        int_round: event.intRound || null,
        str_group: event.strGroup || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id_event' });

      if (!error) upsertCount++;
    }

    return { success: true, count: upsertCount, mode: 'full' };
  } catch (error: any) {
    console.error('Erro no sync completo:', error);
    return { success: false, error: error.message, count: 0 };
  }
}

/**
 * SYNC LEVE — Busca APENAS os resultados recentes (jogos ao vivo / recém-finalizados)
 * e atualiza SOMENTE os jogos que ainda NÃO estão com status 'FT' no banco.
 * Gasta 1 requisição na API.
 * Ideal para: rodar a cada 5-10 minutos em dia de jogo.
 */
export async function syncLiveToDB() {
  try {
    const supabase = await createClient();

    // Primeiro, busca do banco quais jogos ainda NÃO estão finalizados
    const { data: pendingMatches } = await supabase
      .from('matches')
      .select('id_event')
      .or('str_status.is.null,str_status.neq.FT');

    if (!pendingMatches || pendingMatches.length === 0) {
      return { success: true, count: 0, mode: 'live', message: 'Todos os jogos já estão finalizados.' };
    }

    const pendingIds = new Set(pendingMatches.map(m => m.id_event));

    // Busca os resultados mais recentes da API com cache de 60s para evitar flood se tiver muitos usuários
    const res = await fetch(
      `${BASE_URL}/eventspastleague.php?id=${WORLD_CUP_ID}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return { success: false, error: `API retornou status ${res.status}`, count: 0 };
    }

    let apiEvents: any[] = [];
    try {
      const data = await res.json();
      apiEvents = data.events || [];
    } catch {
      return { success: false, error: 'Resposta da API não é JSON válido', count: 0 };
    }

    // Filtra: só atualiza jogos que estão no nosso banco e que NÃO estão finalizados
    const toUpdate = apiEvents.filter(e => pendingIds.has(e.idEvent));

    let updateCount = 0;
    for (const event of toUpdate) {
      const { error } = await supabase
        .from('matches')
        .update({
          int_home_score: event.intHomeScore,
          int_away_score: event.intAwayScore,
          str_status: event.strStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id_event', event.idEvent);

      if (!error) updateCount++;
    }

    return { success: true, count: updateCount, mode: 'live' };
  } catch (error: any) {
    console.error('Erro no sync leve:', error);
    return { success: false, error: error.message, count: 0 };
  }
}

// ════════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ════════════════════════════════════════════════════════════════

/**
 * Retorna o caminho para a bandeira local de um time.
 */
export function getLocalBadge(teamName: string): string {
  if (!teamName) return getDefaultBadge();
  return `/badges/${teamName.replace(/\s+/g, '_')}.png`;
}

export async function getTeamBadge(idTeam: string): Promise<string> {
  return getDefaultBadge();
}

function getDefaultBadge(): string {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23888" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
}
