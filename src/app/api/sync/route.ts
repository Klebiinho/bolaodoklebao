import { NextResponse } from 'next/server';
import { syncFullToDB, syncLiveToDB } from '@/services/sports-db';

/**
 * Rota de sincronização inteligente.
 * 
 * USO:
 *   GET /api/sync?mode=full  → Puxa TODOS os jogos da temporada (2 requests na API). Rodar 1x/dia.
 *   GET /api/sync?mode=live  → Atualiza APENAS placares de jogos não-finalizados (1 request). Rodar a cada 5-10 min.
 *   GET /api/sync             → Padrão: mode=live
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'live';

    let result;
    if (mode === 'full') {
      result = await syncFullToDB();
    } else {
      result = await syncLiveToDB();
    }

    if (result.success) {
      return NextResponse.json({
        message: `Sincronização (${result.mode}) concluída`,
        atualizados: result.count,
        modo: result.mode,
        horario: new Date().toLocaleTimeString('pt-BR')
      });
    } else {
      return NextResponse.json(
        { error: 'Falha na sincronização', detalhes: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno', detalhes: error.message },
      { status: 500 }
    );
  }
}
