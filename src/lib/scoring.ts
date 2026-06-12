
/**
 * @fileOverview Utilitário para cálculo de pontuação baseada nos palpites.
 */

export interface ScoreComparison {
  realHome: number;
  realAway: number;
  predHome: number;
  predAway: number;
}

/**
 * Calcula os pontos de um palpite.
 * - 3 pontos: Placar exato.
 * - 1 ponto: Acerto do vencedor ou empate (sem ser o placar exato).
 * - 0 pontos: Erro total.
 */
export function calculatePoints(data: ScoreComparison): number {
  const { realHome, realAway, predHome, predAway } = data;

  // Placar Exato
  if (realHome === predHome && realAway === predAway) {
    return 3;
  }

  // Determinar vencedor/empate real
  const realResult = realHome > realAway ? 'home' : realHome < realAway ? 'away' : 'draw';
  
  // Determinar vencedor/empate previsto
  const predResult = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';

  // Acerto da tendência (vencedor ou empate)
  if (realResult === predResult) {
    return 1;
  }

  return 0;
}
