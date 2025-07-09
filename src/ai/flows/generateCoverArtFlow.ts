
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
    
    // --- STEP 1: ENHANCE PROMPT ---
    try {
      const enhancementPromptText = `You are a visual enhancement AI. Your task is to take a user's simple concept and transform it into a rich, detailed, single-paragraph visual scene description for an image generation AI.

**Core Concept from user:** "${prompt}"

**Your Mission:**
1.  **Analyze the Core Concept:** Deeply understand the mood, style, and key elements of the user's idea.
2.  **Build a Detailed Scene:** Describe a complete scene for a 3D render. Include specific details about:
    *   **Lighting:** Is it bright, moody, neon, natural?
    *   **Colors:** What is the dominant color palette?
    *   **Textures:** What materials are present (e.g., chrome, matte, wood, stone)?
    *   **Environment:** What objects or natural elements surround the main subject? These elements MUST be directly inspired by the Core Concept. For example, if the concept is "ocean vibes", describe sand, water, and palm trees. If it's "space odyssey", describe nebulae and stars.
3.  **Output Style:**
    *   Produce a single, coherent paragraph.
    *   Focus ONLY on visual descriptions. Do NOT mention text, fonts, or typography.
    *   Your entire output must be based on and expand upon the user's Core Concept.

**Example Transformation:**
*   **User's Core Concept:** "lo-fi, chill, study vibes"
*   **Your Enhanced Output:** "A cozy, dimly-lit room at dusk, with soft rain streaking down a large window. A gentle, warm glow emanates from a vintage-style lamp, casting long, soft shadows across a worn wooden desk. Steam rises from a ceramic mug, and a few potted succulents sit quietly on a nearby shelf. The atmosphere is calm, introspective, and perfect for focused study, with a palette of muted blues, warm oranges, and deep browns."

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

    // --- STEP 2: BUILD THE FINAL, ROBUST PROMPT ---
    const finalImagePrompt = `You are a master 3D packaging artist. Your single task is to create a photorealistic product shot of a box. Follow these rules with extreme precision.

**RULE 1: THE BOX SURFACE IS FOR ABSTRACT GRAPHICS ONLY.**
- The faces of the box MUST be decorated with abstract patterns and textures.
- These patterns should be inspired by the "Creative Context" below.
- The box MUST NOT have any pictures or illustrations of real-world objects on it. NO speakers, NO instruments, NO people, NO landscapes. The surface is for abstract art.

**RULE 2: THE BOX MUST DISPLAY LARGE, CLEAR TEXT.**
- The box MUST visibly display the text: "${kitName}".
- This text must be **large, stylish, perfectly legible, and a central, dominant part of the design.**

**RULE 3: THE BACKGROUND SCENE.**
- The scene around the box must contain ONE subtle, out-of-focus object related to music creation (like a synthesizer, headphones, or a vintage radio).
- **CRITICAL CLARIFICATION:** This audio element must be in the **environment/background ONLY**. Do NOT place it on or inside the product box itself. The box's design should be clean and only contain the required text and abstract graphics inspired by the creative context.

**RULE 4: CAMERA AND COMPOSITION.**
- **Product Focus:** This is a professional product shot. The box is the hero. It must be in sharp focus.
- **Box Angle:** The box should be angled slightly, about 10-15 degrees, to show its front and one side, emphasizing its 3D form.
- **Background Blur:** The background must be heavily blurred using a very shallow depth of field (bokeh effect) to make the main product box pop.

**CREATIVE CONTEXT (For mood, color, and texture inspiration):**
>>>
${creativeContext}
>>>

**FINAL CHECKLIST (YOU MUST OBEY):**
1. Does the box surface have pictures of real things on it? **IT MUST BE NO.** Only abstract patterns.
2. Is the text "${kitName}" on the box, large and easy to read? **IT MUST BE YES.**
3. Is there a music item in the background, separate from the box? **IT MUST BE YES.**
4. Is the background heavily blurred and the box in sharp focus? **IT MUST BE YES.**`;

    return { finalPrompt: finalImagePrompt, error: undefined };
  }
);
