'use server';
/**
 * @fileOverview An AI flow to categorize a sound file based on its name.
 *
 * - categorizeSound - A function that analyzes a filename and returns its type and key.
 * - CategorizeSoundInput - The input type for the categorizeSound function.
 * - CategorizeSoundOutput - The return type for the categorizeSound function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const soundCategories = ['Kick', 'Snare', 'Clap', 'Hi-Hat', 'Hi-Hat Open', 'Hi-Hat Closed', 'Perc', 'Rim', '808 & Bass', 'FX & Texture', 'Vocal', 'Oneshot Melodic', 'Sin Categoría'] as const;
export type SoundType = (typeof soundCategories)[number];


const CategorizeSoundInputSchema = z.object({
  filename: z.string().describe('The original filename of the audio file.'),
});
export type CategorizeSoundInput = z.infer<typeof CategorizeSoundInputSchema>;

const CategorizeSoundOutputSchema = z.object({
  soundType: z.enum(soundCategories).describe('The determined category of the sound.'),
  key: z.string().nullable().describe('The musical key of the sound, if detectable. Otherwise, null.'),
});
export type CategorizeSoundOutput = z.infer<typeof CategorizeSoundOutputSchema>;

export async function categorizeSound(input: CategorizeSoundInput): Promise<CategorizeSoundOutput> {
  return categorizeSoundFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeSoundPrompt',
  input: {schema: CategorizeSoundInputSchema},
  output: {schema: CategorizeSoundOutputSchema},
  prompt: `You are an expert audio production assistant for the brand DANODALS. Your task is to analyze the name of an audio file and return a JSON object with its type and musical key.

You must strictly adhere to the following rules:
1.  **Valid Types**: The only valid values for the 'soundType' field are: 'Kick', 'Snare', 'Clap', 'Hi-Hat', 'Hi-Hat Open', 'Hi-Hat Closed', 'Perc', 'Rim', '808 & Bass', 'FX & Texture', 'Vocal', 'Oneshot Melodic'.
2.  **Default Type**: If you cannot determine the category from the name, you MUST use 'Sin Categoría'.
3.  **Hi-Hat Logic**:
    - If the name contains "open" or "oh", use 'Hi-Hat Open'.
    - If the name contains "closed" or "ch", use 'Hi-Hat Closed'.
    - Otherwise, if it's a hi-hat, use 'Hi-Hat'.
4.  **Key Detection**:
    - Only extract the key if it is explicitly in the name (e.g., "C#m", "Fmaj", "G#", "Amin").
    - For sounds in the 'Oneshot Melodic' category that do NOT have an explicit key, you MUST assume the key is 'C'.
    - For all other sound types (Kick, Snare, Perc, etc.), the key MUST be null unless explicitly stated in the filename.

Analyze this filename: {{{filename}}}`,
});

const categorizeSoundFlow = ai.defineFlow(
  {
    name: 'categorizeSoundFlow',
    inputSchema: CategorizeSoundInputSchema,
    outputSchema: CategorizeSoundOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
