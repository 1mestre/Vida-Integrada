
'use server';
/**
 * @fileOverview An AI flow that takes granular user inputs for a scene, enhances them with creative details, and generates a final, structured image prompt.
 *
 * - generateArtPrompt - The main function that orchestrates the enhancement and assembly.
 * - GenerateArtPromptInput - The input type for the function, containing all user-provided elements.
 * - GenerateArtPromptOutput - The return type for the function, containing the final prompt.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Public-facing input schema for the entire flow
const GenerateArtPromptInputSchema = z.object({
  kitName: z.string().describe('The name of the kit to be visually included on the packaging.'),
  color1: z.string().describe('The primary/accent color in hex format (e.g., #FF5733).'),
  color2: z.string().describe('The secondary/background color in hex format (e.g., #333333).'),
  inspiration: z.string().describe("The core art style or concept (e.g., 'samurai noir', 'cyberpunk grit')."),
  floorMaterial: z.string().describe("The base material for the floor (e.g., 'obsidian', 'polished concrete')."),
  object1: z.string().describe("The first key object for the background (e.g., 'a samurai sword', 'a neon circuit')."),
  object2: z.string().describe("The second key object for the background (e.g., 'a data chip', 'a warrior mask')."),
  atmosphere: z.string().describe("The desired mood or feeling (e.g., 'moody mystery', 'intense energy')."),
  model: z.string().optional(),
});
export type GenerateArtPromptInput = z.infer<typeof GenerateArtPromptInputSchema>;

// Internal schema for the AI's enhancement output
const EnhancedElementsSchema = z.object({
    enhancedInspiration: z.string().describe("An enhanced, more descriptive version of the original art style inspiration."),
    enhancedFloorMaterial: z.string().describe("An enhanced, more descriptive version of the original floor material."),
    enhancedObject1: z.string().describe("An enhanced, more descriptive version of the first object."),
    enhancedObject2: z.string().describe("An enhanced, more descriptive version of the second object."),
    enhancedAtmosphere: z.string().describe("An enhanced, more descriptive version of the original atmosphere."),
    fontType: z.string().describe("A font style that matches the inspiration (e.g., 'a sharp, modern serif')."),
    color1Name: z.string().describe("A descriptive name for the primary color (e.g., 'vibrant orange')."),
    color2Name: z.string().describe("A descriptive name for the secondary color (e.g., 'deep charcoal gray')."),
});

// The AI prompt that performs the creative enhancement
const enhancementPrompt = ai.definePrompt({
    name: 'enhanceArtElementsPrompt',
    input: { schema: GenerateArtPromptInputSchema.omit({ kitName: true, model: true }) },
    output: { schema: EnhancedElementsSchema },
    prompt: `You are a creative director and a visual detail artist. Your task is to take a user's raw concepts for a 3D product shot and enhance them with rich, descriptive details. You will also suggest a font style and translate hex colors into descriptive names.

**CRITICAL RULES:**
1.  **Enhance, Don't Replace:** If the user says "sword", you describe the sword (e.g., "a gleaming, battle-worn katana sword"). You do not change it to a "gun".
2.  **Be Descriptive:** Use powerful adjectives and sensory details.
3.  **Font & Color:** Suggest a font style that matches the inspiration and give descriptive names to the hex colors.
4.  **Provide ONLY the JSON object as your output.**

**USER'S RAW CONCEPTS:**
-   **Art Style Inspiration:** "{{inspiration}}"
-   **Floor Material:** "{{floorMaterial}}"
-   **Object 1:** "{{object1}}"
-   **Object 2:** "{{object2}}"
-   **Atmosphere:** "{{atmosphere}}"
-   **Primary Color (Hex):** "{{color1}}"
-   **Secondary Color (Hex):** "{{color2}}"

**EXAMPLE OF ENHANCEMENT:**
-   **User Input:** inspiration: "samurai noir", floorMaterial: "concrete", object1: "sword", object2: "mask", atmosphere: "moody mystery", color1: "#FF5733", color2: "#333333"
-   **Your JSON Output:**
    {
        "enhancedInspiration": "the stoic, high-contrast art of samurai noir cinema",
        "enhancedFloorMaterial": "cracked, rain-slicked polished concrete",
        "enhancedObject1": "a gleaming, battle-worn katana sword half-hidden in shadow",
        "enhancedObject2": "a traditional, porcelain oni warrior mask with menacing features",
        "enhancedAtmosphere": "a moody, enigmatic, and suspenseful mystery",
        "fontType": "a sharp, modern serif with calligraphic influences",
        "color1Name": "vibrant blood orange",
        "color2Name": "deep charcoal gray"
    }

Now, enhance the user's concepts provided above.`,
});

const GenerateArtPromptOutputSchema = z.object({
    finalPrompt: z.string().describe('The final, detailed prompt ready to be used in an image generation AI.'),
    error: z.string().optional().describe('An error message if prompt generation failed.'),
});
type GenerateArtPromptOutput = z.infer<typeof GenerateArtPromptOutputSchema>;


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
    const finalPrompt = `Photorealistic 3D product shot of a slightly floating over the ${enhancedElements.color1Name} ${enhancedElements.enhancedFloorMaterial} floor, with an angled ${enhancedElements.color2Name} box 10–15 degrees with patterns and textures inspired by the art of ${enhancedElements.enhancedInspiration}. The box prominently displays the large, stylish, and perfectly legible text "${input.kitName}" in ${enhancedElements.fontType} typography font as a central design box element. In the background, a heavily blurred, subtly visible, distorted in right side: black headphone laid in floor, ${enhancedElements.enhancedObject1} is laid down.  and in left side ${enhancedElements.enhancedObject2} and a black synth keyboard with knobs both elements scattered across the floor, creating a strong bokeh effect and emphasizing the sharply focused box. The overall lighting and color palette should evoke a sense of ${enhancedElements.enhancedAtmosphere} atmosphere and a cinematic, high-quality render of soft, blurred ${enhancedElements.color1Name} smoke on a deep ${enhancedElements.color2Name} background. The smoke is dense but smooth, with a feathered, diffused texture — no sharp details — appearing as a glowing fog or vapor cloud.`;

    return { finalPrompt, error: undefined };
  }
);
