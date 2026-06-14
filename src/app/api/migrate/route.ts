import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Rota de migração para adicionar colunas int_round e str_group na tabela matches.
 * GET /api/migrate
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Tenta adicionar as colunas (ignora se já existirem)
    // Usamos uma abordagem via upsert com os campos — o Supabase ignora colunas que não existem
    // Vamos tentar fazer um update direto para testar se as colunas existem
    const { error: testError } = await supabase
      .from('matches')
      .update({ int_round: '1', str_group: 'A' })
      .eq('id_event', 'TEST_NONEXISTENT');

    if (testError && testError.message.includes('column')) {
      // As colunas não existem — precisam ser criadas manualmente
      return NextResponse.json({
        success: false,
        message: 'As colunas int_round e str_group não existem ainda. Execute o SQL abaixo no Supabase SQL Editor:',
        sql: `ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS int_round TEXT;\nALTER TABLE public.matches ADD COLUMN IF NOT EXISTS str_group TEXT;`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Colunas int_round e str_group já existem! Rode /api/sync?mode=full para popular os dados.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
