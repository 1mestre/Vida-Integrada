
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
  prompt: `You are a master branding expert for DANODALS, a high-end music producer known for unique and impactful sound design. Your task is to coin a powerful, distinct, and marketable name for a single sound file.

**MISSION:**
1.  **Analyze & Deconstruct:** Deeply analyze the **Kit Vibe** and the **Original Sound Name**. Identify key themes, emotions, and objects.
2.  **Creative Expansion:** Do not just shorten the name. **Expand on the concepts.** Use metaphors, powerful verbs, evocative adjectives, and conceptual associations related to the vibe. The goal is a name that tells a small story.
3.  **Vibe Cohesion:** The new name MUST feel like it belongs to the kit. It should sound like a premium, professionally named sample.

**CONTEXT:**
-   **Kit Vibe / Description:** '{{kitDescription}}'
-   **Original Sound Name:** '{{originalName}}'

**EXAMPLES OF TRANSFORMATION:**
-   **Original:** "808_HARD_TRAP_BASS.wav", **Kit Vibe:** "Ancient samurai warrior" -> **New Name:** "RONIN'S ROAR"
-   **Original:** "Snare_lofi_vinyl.wav", **Kit Vibe:** "Late night rainy city" -> **New Name:** "NEON PUDDLE"
-   **Original:** "Kick_punchy_deep.wav", **Kit Vibe:** "Cosmic space journey" -> **New Name:** "ASTEROID IMPACT"

**CRITICAL RULE:**
Provide ONLY the new creative name. No quotes, no explanations, no sound category. Just the name itself.`,
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
    }, { model: input.model ? `googleai/${input.model}` : 'googleai/gemini-2.0-flash' });

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
