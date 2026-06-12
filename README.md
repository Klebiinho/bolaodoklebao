# Palpiteiro Pro - Arena da Copa 2026

Parabéns! O seu banco de dados está configurado e pronto para a ação.

## 🚀 Como tudo funciona agora:

1. **Palpites Ativos**: Os jogos futuros aparecem na aba principal. Você pode dar seu palpite até 30 minutos antes do apito inicial.
2. **Histórico**: Assim que um jogo termina, o placar real é buscado automaticamente da API e seus pontos são calculados.
3. **Ranking**: O ranking global é recalculado em tempo real comparando todos os palpites dos usuários com os resultados reais das partidas.

## 🔧 Configurações do Supabase (Ação Necessária)

Para que os usuários consigam entrar no bolão, você deve:

1. Acessar o dashboard do Supabase.
2. Ir em **Authentication** -> **Providers**.
3. Ativar o provedor **Email**.
4. Desativar **Confirm Email** (opcional, para testes rápidos) se quiser que os usuários loguem imediatamente após o cadastro.

## 🏆 Sistema de Pontos
- **3 Pontos**: Acertar o placar exato (ex: apostou 2x1 e foi 2x1).
- **1 Ponto**: Acertar o vencedor ou empate, mas errar o placar (ex: apostou 1x0 e foi 3x0).
- **0 Pontos**: Errar completamente o resultado.

---
Feito por Kleber Venâncio
