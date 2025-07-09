
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
  model: z.string().optional(),
});
type GenerateKitNamesInput = z.infer<typeof GenerateKitNamesInputSchema>;

const GenerateKitNamesOutputSchema = z.object({
  names: z.array(z.string()).length(4).describe('An array of 4 distinct and creative drum kit names.'),
});
type GenerateKitNamesOutput = z.infer<typeof GenerateKitNamesOutputSchema>;

export async function generateKitNames(input: GenerateKitNamesInput): Promise<GenerateKitNamesOutput> {
  return generateKitNamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKitNamesPrompt',
  input: {schema: z.object({prompt: z.string()}) },
  output: {schema: GenerateKitNamesOutputSchema},
  prompt: `You are a branding expert specializing in creative names for music products. Generate 4 creative, modern, and marketable names based on the following theme or concept. The names should be concise and evocative.

**CRITICAL RULE:** Do NOT include generic words like "Kit", "Drum", "Rhythm", "Beat", "Pack", or "Sounds". Just provide the creative names themselves.

Theme: {{{prompt}}}`,
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
    const {output} = await prompt(input, { model: input.model ? `googleai/${input.model}` : undefined });
    return output!;
  }
);
