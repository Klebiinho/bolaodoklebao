'use server';
/**
 * @fileOverview Provides AI-generated insights and predictive analysis for sports matches.
 *
 * - aiMatchInsights - A function that provides AI-generated insights for an upcoming match.
 * - AIMatchInsightsInput - The input type for the aiMatchInsights function.
 * - AIMatchInsightsOutput - The return type for the aiMatchInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIMatchInsightsInputSchema = z.object({
  teamA: z.string().describe("Name of the first team."),
  teamB: z.string().describe("Name of the second team."),
  teamARecentForm: z.string().describe("Description of Team A's recent performance and statistics."),
  teamBRecentForm: z.string().describe("Description of Team B's recent performance and statistics."),
  matchDate: z.string().describe("Date and time of the upcoming match."),
});
export type AIMatchInsightsInput = z.infer<typeof AIMatchInsightsInputSchema>;

const AIMatchInsightsOutputSchema = z.object({
  commentary: z.string().describe("General commentary and overview of the match, highlighting key aspects."),
  teamAAnalysis: z.string().describe("Detailed analysis of Team A's performance, strengths, and weaknesses."),
  teamBAnalysis: z.string().describe("Detailed analysis of Team B's performance, strengths, and weaknesses."),
  likelyOutcome: z.string().describe("Prediction of the most likely outcome of the match (e.g., Team A wins, Draw, Team B wins) along with a brief explanation."),
  predictionConfidence: z.number().int().min(0).max(100).describe("A confidence score for the prediction, from 0 (very low confidence) to 100 (very high confidence)."),
});
export type AIMatchInsightsOutput = z.infer<typeof AIMatchInsightsOutputSchema>;

export async function aiMatchInsights(input: AIMatchInsightsInput): Promise<AIMatchInsightsOutput> {
  return aiMatchInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMatchInsightsPrompt',
  input: { schema: AIMatchInsightsInputSchema },
  output: { schema: AIMatchInsightsOutputSchema },
  prompt: `You are an expert sports analyst providing in-depth predictive analysis for an upcoming sports match.
Your task is to analyze the provided team information and generate a comprehensive commentary, individual team performance analysis, a likely outcome, and a confidence score.

Match Details:
Team A: {{{teamA}}}
Team B: {{{teamB}}}
Match Date: {{{matchDate}}}

Recent Form Team A: {{{teamARecentForm}}}
Recent Form Team B: {{{teamBRecentForm}}}

Based on the information above, provide the following:

commentary: Provide a general overview of the match, highlighting any key rivalries, stakes, or interesting dynamics.
teamAAnalysis: Analyze Team A's recent performance, including their strengths, weaknesses, key players, and current momentum.
teamBAnalysis: Analyze Team B's recent performance, including their strengths, weaknesses, key players, and current momentum.
likelyOutcome: Based on your analysis, predict the most probable outcome of the match (e.g., "Team A to win with a score of 2-1", "A draw is highly likely", "Team B expected to dominate 3-0"). Provide a brief justification.
predictionConfidence: On a scale of 0 to 100, how confident are you in your prediction?`,
});

const aiMatchInsightsFlow = ai.defineFlow(
  {
    name: 'aiMatchInsightsFlow',
    inputSchema: AIMatchInsightsInputSchema,
    outputSchema: AIMatchInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
