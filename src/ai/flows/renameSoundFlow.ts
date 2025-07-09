
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

// This schema is for the AI prompt itself, which only needs the creative context.
const RenamePromptInputSchema = z.object({
  originalName: z.string().describe('The original, often messy, filename of the sound.'),
  kitDescription: z.string().describe('The overall theme or description of the drum kit.'),
});

// This is the public-facing input schema for our flow.
const RenameSoundInputSchema = z.object({
  originalName: z.string().describe('The original filename of the sound.'),
  kitDescription: z.string().describe('The overall theme or description of the drum kit.'),
  soundType: z.string().describe('The category of the sound, e.g., "Snare", "Kick".'),
  model: z.string().optional(),
});
type RenameSoundInput = z.infer<typeof RenameSoundInputSchema>;


const RenameSoundOutputSchema = z.object({
  newName: z.string().describe('A single, creative, and marketable new name for the sound, including its category.'),
});
type RenameSoundOutput = z.infer<typeof RenameSoundOutputSchema>;

export async function renameSound(input: RenameSoundInput): Promise<RenameSoundOutput> {
  return renameSoundFlow(input);
}

// This prompt is lean. It only asks the AI for the creative part of the name.
const prompt = ai.definePrompt({
  name: 'renameSoundPrompt',
  input: {schema: RenamePromptInputSchema},
  // The AI's output is just the creative name, not the final formatted string.
  output: {schema: z.object({ newName: z.string() })}, 
  prompt: `You are a creative assistant for a music producer named DANODALS.
Your task is to generate a new, creative, and marketable name for a single sound file that will be included in a drum kit.

The new name should be inspired by the original name but be more unique, shorter, and cooler. It should fit the vibe of the drum kit.

The drum kit has the following description: '{{kitDescription}}'
The original sound name is: '{{originalName}}'

Give me just the new creative name, without any extra text, quotes, explanations, or the sound category. For example, if the original is "FREE_Metro_Boomin_Type_Snare_3_(Super_Trap).wav", a good new name could be "Metro Glitch" or "Super Snare".`,
});


const renameSoundFlow = ai.defineFlow(
  {
    name: 'renameSoundFlow',
    inputSchema: RenameSoundInputSchema,
    outputSchema: RenameSoundOutputSchema,
  },
  async (input) => {
    // 1. Call the AI with only the info it needs for the creative part.
    const { output } = await prompt({
      originalName: input.originalName,
      kitDescription: input.kitDescription,
    }, { model: input.model ? `googleai/${input.model}` : undefined });

    if (!output?.newName) {
      throw new Error("AI failed to generate a creative name.");
    }
    
    // 2. The AI returns just the creative name (e.g., "Bronze Roar").
    const creativeName = output.newName;

    // 3. We format it deterministically here to ensure consistency.
    const finalName = `${creativeName} - ${input.soundType}`;
    
    // 4. Return the fully formatted name as the flow's output.
    return { newName: finalName };
  }
);
