
'use server';
/**
 * @fileOverview An AI flow to generate a detailed, structured prompt for cover art generation based on a user concept.
 *
 * - generateArtPrompt - A function that takes a simple concept and returns a complex, structured image generation prompt.
 * - GenerateArtPromptInput - The input type for the function.
 * - GenerateArtPromptOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateArtPromptInputSchema = z.object({
  prompt: z.string().describe('A description of the desired cover art style, mood, and content.'),
  kitName: z.string().describe('The name of the kit to be visually included on the packaging.'),
  color1: z.string().describe('The primary/accent color in hex format (e.g., #FF5733).'),
  color2: z.string().describe('The secondary/background color in hex format (e.g., #333333).'),
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


// Schema for the AI's creative deconstruction output (NO COLORS)
const ArtElementsSchema = z.object({
    material1: z.string().describe("A type of floor material related to the concept (e.g., 'obsidian', 'polished concrete', 'ancient wood')."),
    contextualInspiration: z.string().describe("A 2-4 word phrase summarizing the art style (e.g., 'samurai noir', 'cyberpunk grit', 'ethereal waves')."),
    contextualObject1: z.string().describe("A single, distinct, tangible object directly related to the theme (e.g., 'a samurai sword', 'a neon circuit', 'a seashell')."),
    contextualObject2: z.string().describe("A second, different, tangible object directly related to the theme (e.g., 'a warrior mask', 'a data chip', 'a pearl')."),
    ambientAtmosphere: z.string().describe("A 2-4 word phrase for the overall mood (e.g., 'moody mystery', 'intense energy', 'serene calm').")
});

// Define the AI prompt that deconstructs the user's idea
const deconstructionPrompt = ai.definePrompt({
    name: 'deconstructArtConceptPrompt',
    input: { schema: z.object({ prompt: z.string() }) },
    output: { schema: ArtElementsSchema },
    prompt: `You are a master creative director. Your task is to deconstruct a user's musical concept into specific visual elements for a 3D product shot. Analyze the user's prompt and fill in the following JSON fields. Be creative but stay true to the core concept. The user will provide the colors separately.

**User's Concept:** "{{{prompt}}}"

**CRITICAL RULES:**
1.  **Material:** The \`material1\` must be a plausible floor surface.
2.  **Inspiration/Atmosphere:** These must be short, evocative phrases (2-4 words max).
3.  **Objects:** \`contextualObject1\` and \`contextualObject2\` must be distinct, tangible items directly related to the concept.

Provide ONLY the JSON object as your output.`,
});


const generateArtPromptFlow = ai.defineFlow(
  {
    name: 'generateArtPromptFlow',
    inputSchema: GenerateArtPromptInputSchema,
    outputSchema: GenerateArtPromptOutputSchema,
  },
  async ({prompt, kitName, color1, color2, model}) => {
    let artElements;

    // --- STEP 1: Deconstruct the user's concept with AI ---
    try {
        const { output } = await deconstructionPrompt(
            { prompt },
            { model: model ? `googleai/${model}` : 'googleai/gemini-2.0-flash' }
        );

        if (!output) {
            throw new Error('The AI failed to return the structured art elements.');
        }
        artElements = output;
    } catch (e: any) {
        console.error("AI deconstruction failed:", e);
        return {
            finalPrompt: '',
            error: `Failed to deconstruct prompt with AI: ${e.message}`
        };
    }

    // --- STEP 2: Assemble the final prompt using the user's exact template ---
    const finalPrompt = `Photorealistic 3D product shot of a slightly floating over the ${color1} floor ${artElements.material1} angled ${color2} box 10–15 degrees with patterns and textures inspired by the art of ${artElements.contextualInspiration}. The box prominently displays the large, stylish, and perfectly legible text "${kitName}" in ${artElements.contextualInspiration} inspired typography / font as a central design element. In the background, a heavily blurred, subtly visible, distorted ${artElements.contextualObject1} is laid down and ${artElements.contextualObject2} scattered across the floor, creating a strong bokeh effect and emphasizing the sharply focused box. The overall lighting and color palette should evoke a sense of ${artElements.ambientAtmosphere} atmosphere and a cinematic, high-quality render of soft, blurred ${color1} smoke on a deep ${color2} background. The smoke is dense but smooth, with a feathered, diffused texture — no sharp details — appearing as a glowing fog or vapor cloud.`;

    return { finalPrompt, error: undefined };
  }
);
