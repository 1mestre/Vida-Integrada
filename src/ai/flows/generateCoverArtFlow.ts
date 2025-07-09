
'use server';
/**
 * @fileOverview An AI flow that takes granular user inputs for a scene, enhances them with creative details, and generates a final, structured image prompt.
 *
 * - generateArtPrompt - The main function that orchestrates the enhancement and assembly.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Public-facing input schema for the entire flow
const GenerateArtPromptInputSchema = z.object({
  kitName: z.string().describe('The name of the kit to be visually included on the packaging.'),
  color1: z.string().describe('The primary/accent color in hex format (e.g., #FF5733).'),
  color2: z.string().describe('The secondary/background color in hex format (e.g., #333333).'),
  inspiration: z.string().optional().describe("The core art style or concept (e.g., 'samurai noir', 'cyberpunk grit')."),
  floorMaterial: z.string().optional().describe("The base material for the floor (e.g., 'obsidian', 'polished concrete')."),
  object1: z.string().optional().describe("The first key object for the background (e.g., 'a samurai sword', 'a neon circuit')."),
  object2: z.string().optional().describe("The second key object for the background (e.g., 'a data chip', 'a warrior mask')."),
  atmosphere: z.string().optional().describe("The desired mood or feeling (e.g., 'moody mystery', 'intense energy')."),
  fontType: z.string().optional().describe("A specific font style to use (e.g., 'a sharp, modern serif')."),
  model: z.string().optional(),
});
export type GenerateArtPromptInput = z.infer<typeof GenerateArtPromptInputSchema>;

// Internal schema for the AI's enhancement output
const EnhancedElementsSchema = z.object({
    enhancedInspiration: z.string().describe("An enhanced, descriptive version of the original inspiration. Empty if not provided."),
    enhancedFloorMaterial: z.string().describe("An enhanced, descriptive version of the original floor material. Empty if not provided."),
    enhancedObject1: z.string().describe("An enhanced, descriptive version of the first object. Empty if not provided."),
    enhancedObject2: z.string().describe("An enhanced, descriptive version of the second object. Empty if not provided."),
    enhancedAtmosphere: z.string().describe("An enhanced, descriptive version of the original atmosphere. Empty if not provided."),
    color1Name: z.string().describe("A descriptive name for the primary color (e.g., 'vibrant orange')."),
    color2Name: z.string().describe("A descriptive name for the secondary color (e.g., 'deep charcoal gray')."),
    abstractMotif: z.string().describe("A simple, abstract surrounding motif like 'floating cubes' or 'glossy water drops'. Empty if not provided."),
});

// The AI prompt that performs the creative enhancement
const enhancementPrompt = ai.definePrompt({
    name: 'enhanceArtElementsPrompt',
    input: { schema: GenerateArtPromptInputSchema.omit({ kitName: true, model: true }).partial() },
    output: { schema: EnhancedElementsSchema.partial().extend({ color1Name: z.string(), color2Name: z.string() }) },
    prompt: `You are a creative director and a visual detail artist. Your task is to take a user's raw concepts for a 3D product shot and enhance them with rich, descriptive details. You will also translate hex colors into descriptive names and generate a simple abstract motif.

**CRITICAL RULES:**
1.  **Enhance, Don't Replace:** If the user provides a concept (e.g., "sword"), describe it in more detail (e.g., "a gleaming, battle-worn katana sword"). You do not change it to a "gun".
2.  **Handle Missing Concepts:** If a user concept (like inspiration, floorMaterial, etc.) is NOT PROVIDED, you MUST return an empty string for its corresponding "enhanced" field.
3.  **Color Naming:** You MUST ALWAYS provide descriptive names for the hex colors.
4.  **Abstract Motif:** Based on the **Art Style Inspiration**, generate a simple, abstract surrounding motif. Think simple shapes and textures: floating cubes, glossy water drops, chrome spikes, glowing circles, viscous slime, etc. This should be a short phrase. If inspiration is missing, leave the motif empty.
5.  **Provide ONLY the JSON object as your output.**

**USER'S RAW CONCEPTS (some may be missing):**
-   **Art Style Inspiration:** "{{inspiration}}"
-   **Floor Material:** "{{floorMaterial}}"
-   **Object 1:** "{{object1}}"
-   **Object 2:** "{{object2}}"
-   **Atmosphere:** "{{atmosphere}}"
-   **Font Style:** "{{fontType}}"
-   **Primary Color (Hex):** "{{color1}}"
-   **Secondary Color (Hex):** "{{color2}}"

**EXAMPLE OF ENHANCEMENT:**
-   **User Input:** inspiration: "samurai noir", floorMaterial: "concrete", object1: "sword", atmosphere: "moody mystery", color1: "#FF5733", color2: "#333333"
-   **Your JSON Output:**
    {
        "enhancedInspiration": "the stoic, high-contrast art of samurai noir cinema",
        "enhancedFloorMaterial": "cracked, rain-slicked polished concrete",
        "enhancedObject1": "a gleaming, battle-worn katana sword half-hidden in shadow",
        "enhancedAtmosphere": "a moody, enigmatic, and suspenseful mystery",
        "abstractMotif": "sharp, ink-like black shards",
        "color1Name": "vibrant blood orange",
        "color2Name": "deep charcoal gray"
    }

Now, enhance the user's concepts provided above.`,
});

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
  async (input) => {
    let enhancedElements;

    // --- STEP 1: Enhance the user's concepts with AI ---
    try {
        const { output } = await enhancementPrompt(
            {
                inspiration: input.inspiration,
                floorMaterial: input.floorMaterial,
                object1: input.object1,
                object2: input.object2,
                atmosphere: input.atmosphere,
                fontType: input.fontType,
                color1: input.color1,
                color2: input.color2,
            },
            { model: input.model ? `googleai/${input.model}` : 'googleai/gemini-2.5-flash-preview' }
        );

        if (!output) {
            throw new Error('The AI failed to return the enhanced art elements.');
        }
        enhancedElements = output;
    } catch (e: any) {
        console.error("AI enhancement failed:", e);
        return {
            finalPrompt: '',
            error: `Failed to enhance prompt with AI: ${e.message}`
        };
    }

    // --- STEP 2: Assemble the final prompt using the user's exact template ---
    const finalPrompt = `Photorealistic 3D product shot of a slightly floating over the ${enhancedElements.color1Name} ${enhancedElements.enhancedFloorMaterial || ''} floor angled ${enhancedElements.color2Name} box 10–15 degrees with patterns and textures inspired by the art of ${enhancedElements.enhancedInspiration || ''}. The box prominently displays the large, stylish, and perfectly legible text "${input.kitName}" in ${input.fontType ? `${input.fontType} ` : ''}typography font as a central design box element. In the background, a heavily blurred, subtly visible, distorted in right side: black headphone laid on the floor, ${enhancedElements.enhancedObject1 || ''} is laid down. And in left side ${enhancedElements.enhancedObject2 || ''} and a black synth keyboard with knobs, both elements scattered across the floor, creating a strong bokeh effect and emphasizing the sharply focused box. ${enhancedElements.abstractMotif ? `The box is surrounded by ${enhancedElements.abstractMotif}, complementing the scene with sculptural visual energy and textural contrast. ` : ''}The overall lighting and color palette should evoke a sense of ${enhancedElements.enhancedAtmosphere || 'a cinematic'} atmosphere and a cinematic, high-quality render of soft, blurred ${enhancedElements.color1Name} smoke on a deep ${enhancedElements.color2Name} background. The smoke is dense but smooth, with a feathered, diffused texture — no sharp details — appearing as a glowing fog or vapor cloud.`
    .replace(/\s{2,}/g, ' ').trim();

    return { finalPrompt, error: undefined };
  }
);
