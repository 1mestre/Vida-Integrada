
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
    // This step takes the user's simple idea and expands it into a full scene description.
    try {
      const enhancementPromptText = `You are a visual enhancement AI. Your task is to take a user's simple concept and transform it into a rich, detailed, single-paragraph visual scene description for an image generation AI.

**Core Concept from user:** "${prompt}"

**Your Mission:**
1.  **Analyze the Core Concept:** Deeply understand the mood, style, and key elements of the user's idea.
2.  **Build a Detailed Scene:** Describe a complete scene for a 3D render. Include specific details about:
    *   **Lighting:** Is it bright, moody, neon, natural?
    *   **Colors:** What is the dominant color palette?
    *   **Textures:** What materials are present (e.g., chrome, matte, wood, stone)?
    *   **Environment:** What subtle, out-of-focus objects or natural elements surround the main subject? These elements MUST be directly inspired by the Core Concept. For example, if the concept is "ocean vibes", describe sand, water, and palm trees. If it's "space odyssey", describe nebulae and stars.
3.  **Output Style:**
    *   Produce a single, coherent paragraph.
    *   Focus ONLY on visual descriptions. Do NOT mention text, fonts, or typography.
    *   Your entire output must be based on and expand upon the user's Core Concept.

Now, create the enhanced visual description based on the user's Core Concept provided above.`;
        
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
        const sensationPromptText = `Analyze the following visual description and summarize its core mood and feeling into a short, two-to-three word phrase (e.g., "moody mystery", "vibrant energy", "calm nostalgia"). Provide ONLY the phrase.

Visual Description:
>>>
${creativeContext}
>>>`;

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
    // This step combines all elements into a single, highly-structured prompt for the image AI.
    const finalImagePrompt = `Create a photorealistic 3D product shot of a modern product box. Follow these instructions precisely.

**Primary Subject: The Box**
*   **Angle & Focus:** The box is angled slightly (10-15 degrees) to show its front and one side. It must be in sharp, perfect focus.
*   **Text:** The text "${kitName}" must be displayed prominently on the box. It should be large, stylish, and perfectly legible, serving as a central, dominant design element.
*   **Surface Design:** The box surface MUST be decorated with abstract patterns and textures. These visuals are directly inspired by the scene description below. Absolutely NO pictures or illustrations of real-world objects on the box itself—only abstract art.

**Background & Scene**
*   **Scene Description:** The environment surrounding the box is as follows: ${creativeContext}.
*   **Bokeh Effect:** This background environment MUST be heavily blurred with a very shallow depth of field, creating a strong bokeh effect that makes the main product box pop.

**Overall Mood & Lighting**
*   **Atmosphere:** The lighting, colors, and overall atmosphere must evoke a sense of ${visualSensation}.`;

    return { finalPrompt: finalImagePrompt, error: undefined };
  }
);
