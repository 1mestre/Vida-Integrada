'use server';
/**
 * @fileOverview An AI flow to generate creative drum kit names.
 *
 * - generateKitNames - A function that generates names based on a prompt.
 * - GenerateKitNamesInput - The input type for the generateKitNames function.
 * - GenerateKitNamesOutput - The return type for the generateKitNames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKitNamesInputSchema = z.object({
  prompt: z.string().describe('A description of the drum kit genre, style, or vibe.'),
});
export type GenerateKitNamesInput = z.infer<typeof GenerateKitNamesInputSchema>;

const GenerateKitNamesOutputSchema = z.object({
  names: z.array(z.string()).length(4).describe('An array of 4 distinct and creative drum kit names.'),
});
export type GenerateKitNamesOutput = z.infer<typeof GenerateKitNamesOutputSchema>;

export async function generateKitNames(input: GenerateKitNamesInput): Promise<GenerateKitNamesOutput> {
  return generateKitNamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKitNamesPrompt',
  input: {schema: GenerateKitNamesInputSchema},
  output: {schema: GenerateKitNamesOutputSchema},
  prompt: `You are a creative assistant for a music producer named DANODALS. Your task is to generate 4 creative, modern, and marketable names for a drum kit based on the following description. The names should be unique, catchy, and suitable for the specified genre.

Description: {{{prompt}}}`,
});

const generateKitNamesFlow = ai.defineFlow(
  {
    name: 'generateKitNamesFlow',
    inputSchema: GenerateKitNamesInputSchema,
    outputSchema: GenerateKitNamesOutputSchema,
  },
  async (input) => {
    if (!input.prompt) {
        // Return empty array if prompt is empty, to avoid errors.
        return { names: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
