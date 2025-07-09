
'use server';
/**
 * @fileOverview An AI flow to generate a detailed prompt for cover art generation.
 *
 * - generateArtPrompt - A function that enhances a user prompt and returns a structured prompt for an image AI.
 * - GenerateArtPromptInput - The input type for the function.
 * - GenerateArtPromptOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateArtPromptInputSchema = z.object({
  prompt: z.string().describe('A description of the desired cover art style, mood, and content.'),
  kitName: z.string().describe('The name of the kit to be visually included on the packaging.'),
  model: z.string().optional(),
});
export type GenerateArtPromptInput = z.infer<typeof GenerateArtPromptInputSchema>;

const GenerateArtPromptOutputSchema = z.object({
    finalPrompt: z.string().describe('The final, detailed prompt ready to be used in an image generation AI.'),
    error: z.string().optional().describe('An error message if prompt generation failed.'),
});
export type GenerateArtPromptOutput = z.infer<typeof GenerateArtPromptOutputSchema>;


export async function generateArtPrompt(input: GenerateArtPromptInput): Promise<GenerateArtPromptOutput> {
    return generateArtPromptFlow(input);
}

const generateArtPromptFlow = ai.defineFlow(
  {
    name: 'generateArtPromptFlow',
    inputSchema: GenerateArtPromptInputSchema,
    outputSchema: GenerateArtPromptOutputSchema,
  },
  async ({prompt, kitName, model}) => {
    let creativeContext = '';
    
    // --- STEP 1: ENHANCE PROMPT (CREATIVE DIRECTOR AI) ---
    // This step takes the user's simple idea and expands it into a description of visuals and mood.
    try {
      const enhancementPromptText = `You are a visual creative director AI. Your task is to take a user's simple concept and transform it into a rich, detailed, single-paragraph visual description. This description will inspire the abstract patterns and textures for a product design.

**Core Concept from user:** "${prompt}"

**Your Mission:**
1.  **Analyze the Core Concept:** Deeply understand the mood, style, and key elements of the user's idea. Stick closely to the words provided.
2.  **Describe Abstract Visuals:** Create a description focusing exclusively on:
    *   **Lighting:** Is it bright, moody, neon, natural, dramatic?
    *   **Color Palette:** What are the dominant and accent colors?
    *   **Textures & Patterns:** What abstract materials, patterns, or feelings are evoked (e.g., smooth chrome, rough stone, flowing energy, sharp geometric lines)?
3.  **Critical Rules:**
    *   Produce a single, coherent paragraph.
    *   Your entire output MUST be based on and expand upon the user's Core Concept. Do not invent new, unrelated themes.
    *   Focus ONLY on abstract visual descriptions of light, color, and texture.
    *   DO NOT describe a specific scene or any real-world objects. The background is fixed later.
    *   DO NOT mention text, fonts, or typography.

Now, generate the enhanced visual description based on the user's Core Concept provided above.`;
        
        const enhancementResult = await ai.generate({
            prompt: enhancementPromptText,
            model: model ? `googleai/${model}` : 'googleai/gemini-2.0-flash',
        });
        
        creativeContext = enhancementResult.text;
        if (!creativeContext) {
            throw new Error('The AI failed to return an enhanced description.');
        }
    } catch (e: any) {
        return { 
            finalPrompt: '', 
            error: `Failed to enhance prompt: ${e.message}` 
        };
    }

    // --- STEP 2: SUMMARIZE SENSATION (MOOD AI) ---
    // This step distills the creative context into a short, evocative phrase.
    let visualSensation = '';
    try {
      const sensationPromptText = `Analyze the following visual description and summarize its core mood and feeling into a short, two-to-three word phrase. Provide ONLY the phrase.

**Examples:**
- Description about a beach concept -> "summer heat"
- Description about a mystery concept -> "moody mystery"
- Description about a vibrant concept -> "vibrant energy"

**Visual Description to Analyze:**
>>>
${creativeContext}
>>>

Now, provide ONLY the summary phrase.`;

        const sensationResult = await ai.generate({
            prompt: sensationPromptText,
            model: model ? `googleai/${model}` : 'googleai/gemini-2.0-flash',
        });
        
        visualSensation = sensationResult.text.trim().replace(/["']/g, ''); // Clean up output
        if (!visualSensation) {
            throw new Error('The AI failed to generate a visual sensation summary.');
        }
    } catch (e: any) {
        console.warn("Could not generate visual sensation, using a fallback.", e);
        visualSensation = 'a unique and striking atmosphere'; // Provide a generic but useful fallback
    }


    // --- STEP 3: ASSEMBLE THE FINAL, ROBUST PROMPT (3D ARTIST AI) ---
    // This step combines all elements into the user-specified template.
    const finalImagePrompt = `imagine prompt: Photorealistic 3D product shot of a slightly angled rectangular and vertical box (10-15 degrees) with abstract patterns and textures inspired (${creativeContext}). The box prominently displays the large, stylish, and perfectly legible text "${kitName}" as a central design element. The background features a heavily blurred, subtly visible, distorted black over-ear headphones and a synth rests on a surface black electronic keyboard with white keys and various knobs and sliders, creating a strong bokeh effect and emphasizing the sharply focused box. The overall lighting and color palette should evoke a sense of (${visualSensation}).`;

    return { finalPrompt: finalImagePrompt, error: undefined };
  }
);
