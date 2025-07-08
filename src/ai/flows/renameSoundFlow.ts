'use server';
/**
 * @fileOverview An AI flow to generate a creative name for a sound file.
 *
 * - renameSound - A function that renames a sound based on its original name and kit context.
 * - RenameSoundInput - The input type for the renameSound function.
 * - RenameSoundOutput - The return type for the renameSound function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RenameSoundInputSchema = z.object({
  originalName: z.string().describe('The original, often messy, filename of the sound.'),
  kitDescription: z.string().describe('The overall theme or description of the drum kit.'),
});
export type RenameSoundInput = z.infer<typeof RenameSoundInputSchema>;

const RenameSoundOutputSchema = z.object({
  newName: z.string().describe('A single, creative, and marketable new name for the sound.'),
});
export type RenameSoundOutput = z.infer<typeof RenameSoundOutputSchema>;

export async function renameSound(input: RenameSoundInput): Promise<RenameSoundOutput> {
  return renameSoundFlow(input);
}

const prompt = ai.definePrompt({
  name: 'renameSoundPrompt',
  input: {schema: RenameSoundInputSchema},
  output: {schema: RenameSoundOutputSchema},
  prompt: `You are a creative assistant for a music producer named DANODALS.
Your task is to generate a new, creative, and marketable name for a single sound file that will be included in a drum kit.

The new name should be inspired by the original name but be more unique, shorter, and cooler. It should fit the vibe of the drum kit.

The drum kit has the following description: '{{kitDescription}}'
The original sound name is: '{{originalName}}'

Give me just the new name, without any extra text, quotes, or explanations. For example, if the original is "FREE_Metro_Boomin_Type_Snare_3_(Super_Trap).wav", a good new name could be "Metro Glitch" or "Super Snare".`,
});

const renameSoundFlow = ai.defineFlow(
  {
    name: 'renameSoundFlow',
    inputSchema: RenameSoundInputSchema,
    outputSchema: RenameSoundOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
