import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamA = searchParams.get('teamA')?.toLowerCase();
    const teamB = searchParams.get('teamB')?.toLowerCase();
    const dateStr = searchParams.get('date'); 

    const apiKey = process.env.API_SPORTS_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API_SPORTS_KEY não configurada no servidor.' }, { status: 500 });
    }

    if (!teamA || !teamB || !dateStr) {
      return NextResponse.json({ error: 'Parâmetros ausentes' }, { status: 400 });
    }

    // Pega apenas a data YYYY-MM-DD
    const dateOnly = dateStr.split('T')[0];

    // Passo 1: Buscar todos os jogos daquele dia
    // Fazemos um cache pesado de 24 horas (86400 segundos) pois a lista de jogos do dia raramente muda de ID
    const fixturesRes = await fetch(`https://v3.football.api-sports.io/fixtures?date=${dateOnly}`, {
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: 86400 } 
    });
    
    const fixturesData = await fixturesRes.json();
    if (!fixturesData || !fixturesData.response || fixturesData.response.length === 0) {
      return NextResponse.json({ error: 'Nenhum jogo encontrado nessa data' }, { status: 404 });
    }

    // Tentar encontrar o jogo correspondente usando fuzzy search simples nos nomes
    // Como os nomes vêm de APIs diferentes, precisamos checar substrings (ex: "Brazil" vs "Brasil")
    const fixture = fixturesData.response.find((f: any) => {
      const h = f.teams.home.name.toLowerCase();
      const a = f.teams.away.name.toLowerCase();
      
      const teamAWords = teamA.split(' ')[0]; // Pega primeira palavra pra aumentar chance de match
      const teamBWords = teamB.split(' ')[0];

      return (h.includes(teamAWords) || a.includes(teamAWords)) && 
             (h.includes(teamBWords) || a.includes(teamBWords));
    });

    if (!fixture) {
      return NextResponse.json({ error: 'Jogo específico não encontrado no provedor de detalhes' }, { status: 404 });
    }

    const fixtureId = fixture.fixture.id;

    // Passo 2: Buscar os detalhes completos do jogo (Stats, Escalações, Eventos)
    // Fazemos um cache de 5 minutos (300 segundos). Assim, só gastamos 1 requisição a cada 5 min por jogo.
    const detailsRes = await fetch(`https://v3.football.api-sports.io/fixtures?id=${fixtureId}`, {
      headers: { 'x-apisports-key': apiKey },
      next: { revalidate: 300 }
    });

    const detailsData = await detailsRes.json();
    const matchDetails = detailsData.response[0];

    if (!matchDetails) {
      return NextResponse.json({ error: 'Detalhes indisponíveis' }, { status: 404 });
    }

    // Montando o payload final simplificado para o frontend
    const payload = {
      events: matchDetails.events || [],
      lineups: matchDetails.lineups || [],
      statistics: matchDetails.statistics || []
    };

    return NextResponse.json(payload);

  } catch (error) {
    console.error("Erro na API interna match-details:", error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
