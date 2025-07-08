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
  prompt: `You are a strict file categorization engine for a music production brand. Your task is to analyze ONLY the filename of an audio file and return a JSON object with its \`soundType\` and \`key\`.

**CRITICAL RULES:**
1.  **BASIS OF ANALYSIS:** Your entire analysis MUST be based *only* on the text of the filename. Do not infer or guess based on word meanings. If the filename is "explaining.wav", you do not know if it is a vocal. You only know the word is "explaining".
2.  **CATEGORY MATCHING:** Match the filename against the following keywords to determine the \`soundType\`. You MUST use the exact category name from this list. If no keyword is found, you MUST return 'Sin Categoría'.
    *   'Kick': "kick", "kik"
    *   'Snare': "snare", "snr"
    *   'Clap': "clap", "clp"
    *   'Hi-Hat': "hat", "hh", "hihat"
    *   'Perc': "perc", "percussion"
    *   'Rim': "rim", "rimshot"
    *   '808 & Bass': "808", "bass", "sub"
    *   'FX & Texture': "fx", "riser", "impact", "texture", "foley"
    *   'Vocal': "vocal", "vox", "chant", "phrase"
    *   'Oneshot Melodic': "melody", "oneshot", "pluck", "lead", "synth"
3.  **HI-HAT SPECIFIC LOGIC:** If the category is 'Hi-Hat', check for "open" or "oh" to assign 'Hi-Hat Open'. Check for "closed" or "ch" to assign 'Hi-Hat Closed'. Otherwise, use 'Hi-Hat'.
4.  **KEY DETECTION (TONALITY):** This is extremely strict.
    *   A \`key\` MUST be \`null\` unless it is EXPLICITLY present in the filename.
    *   Explicit keys look like: "C", "C#", "Db", "Gmaj", "Am", "F#m".
    *   If the sound is categorized as 'Oneshot Melodic' AND no key is found, the key MUST be 'C'.
    *   For ALL other categories, if no explicit key is found, the key MUST be \`null\`. Do NOT guess.

Analyze this filename and provide ONLY the JSON output: \`{{{filename}}}\``,
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
