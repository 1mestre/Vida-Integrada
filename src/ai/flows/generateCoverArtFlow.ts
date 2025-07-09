
'use server';
/**
 * @fileOverview An AI flow to generate cover art and upload it to object storage.
 *
 * - generateCoverArt - A function that generates an image and returns its public URL and the enhanced prompt used.
 * - GenerateCoverArtInput - The input type for the generateCoverArt function.
 * - GenerateCoverArtOutput - The return type for the generateCoverArt function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const GenerateCoverArtInputSchema = z.object({
  prompt: z.string().describe('A description of the desired cover art style, mood, and content.'),
  kitName: z.string().describe('The name of the kit to be visually included on the packaging.'),
});
type GenerateCoverArtInput = z.infer<typeof GenerateCoverArtInputSchema>;

// The new output schema that includes the final URL, the enhanced prompt, and a potential error.
const GenerateCoverArtOutputSchema = z.object({
    finalUrl: z.string().url().nullable().describe('The public URL of the generated image, or null if an error occurred.'),
    enhancedPrompt: z.string().describe('The AI-enhanced prompt that was used to generate the image.'),
    error: z.string().optional().describe('An error message if the image generation failed.'),
});
export type GenerateCoverArtOutput = z.infer<typeof GenerateCoverArtOutputSchema>;


export async function generateCoverArt(input: GenerateCoverArtInput): Promise<GenerateCoverArtOutput> {
    return generateCoverArtFlow(input);
}

const generateCoverArtFlow = ai.defineFlow(
  {
    name: 'generateCoverArtFlow',
    inputSchema: GenerateCoverArtInputSchema,
    outputSchema: GenerateCoverArtOutputSchema,
  },
  async ({prompt, kitName}) => {
    // --- R2 Configuration moved inside the flow ---
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

    const missingVars = [];
    if (!accountId) missingVars.push('CLOUDFLARE_ACCOUNT_ID');
    if (!accessKeyId) missingVars.push('R2_ACCESS_KEY_ID');
    if (!secretAccessKey) missingVars.push('R2_SECRET_ACCESS_KEY');
    if (!bucketName) missingVars.push('R2_BUCKET_NAME');
    if (!publicUrl) missingVars.push('R2_PUBLIC_URL or NEXT_PUBLIC_R2_PUBLIC_URL');
    
    if (missingVars.length > 0) {
      const errorMsg = `R2 Configuration Error: The following environment variables are missing on the server: ${missingVars.join(', ')}`;
      return { finalUrl: null, enhancedPrompt: prompt, error: errorMsg };
    }

    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
          accessKeyId,
          secretAccessKey,
      },
    });
    // --- End Configuration ---
    
    let creativeContext = '';
    
    // --- STEP 0: ENHANCE PROMPT ---
    try {
      const enhancementPromptText = `You are a creative director AI. A user has provided a core concept. Your task is to expand this into a vivid, single-paragraph visual description for an image generation AI.

        **Core Concept:** ${prompt}
        
        **CRITICAL INSTRUCTIONS:**
        1.  **NO TEXT WORDS:** Do NOT use words like "typography", "text", "letters", "words", "font", or "type" in your output.
        2.  **VISUALS ONLY:** Describe only visual elements: colors, textures, lighting, mood, composition, and objects.
        3.  **DESCRIBE A SCENE:** Frame your description as a scene for a 3D render of a product box.
        4.  **THEMATIC ELEMENTS:** The scene surrounding the box should include subtle, thematic elements that relate to the creative context. For example, if the context is 'soft and bouncy', you could include soft, plush objects nearby.
        5.  **SINGLE PARAGRAPH:** Output a single, coherent paragraph.
        
        Example:
        User Concept: "Dark trap, Travis Scott style"
        Your Output: "A moody, cinematic 3D render of a premium product box with a dark, enigmatic aesthetic. The packaging features a blend of matte black textures and subtle, iridescent details that catch the light. The scene is lit with atmospheric neon glows in deep purples and reds, casting long, soft shadows. The overall composition feels grounded yet otherworldly, with a focus on tactile realism, and a hint of cosmic mystery."`;
        
        const enhancementResult = await ai.generate({
            prompt: enhancementPromptText,
            model: 'googleai/gemini-2.5-flash',
        });
        
        creativeContext = enhancementResult.text;
        if (!creativeContext) {
            throw new Error('The AI failed to return an enhanced description.');
        }
    } catch (e: any) {
        // If enhancement fails, we can't proceed. Return the error.
        return { 
            finalUrl: null, 
            enhancedPrompt: prompt, // Return original prompt as it's all we have
            error: `Failed to enhance prompt: ${e.message}` 
        };
    }

    // --- Define the final image generation prompt ---
    const finalImagePrompt = `You are a 3D packaging artist. Generate a cinematic 3D render of a product box.

— VISUAL STYLE —
The scene must be abstract, highly stylized, and cinematic. Use only visual elements like lighting, textures, reflections, shadows, colors, and mood.

— SPECIAL TEXT INSTRUCTIONS —
The design must include **exactly one word or phrase**, rendered as part of the product case in a clean, futuristic, or grunge typographic style: "${kitName}".
This text must be large, legible, and occupy a significant portion of the packaging front.
This text must appear on the product box, label, or front cover, as if it were real packaging.
Do NOT include any other words, numbers, or characters anywhere in the image.

— BOX & ENVIRONMENT DETAILS —
**Audio Motif:** The background of the scene MUST include a subtle, out-of-focus element related to audio or music (e.g., a synthesizer, headphones, a microphone, speakers, or a radio).
**CRITICAL CLARIFICATION:** This audio element must be in the **environment/background ONLY**. Do NOT place it on or inside the product box itself. The box's design should be clean and only contain the required text and abstract graphics inspired by the creative context.

— CREATIVE CONTEXT (USE FOR INSPIRATION, DON’T OUTPUT THIS TEXT) —
${creativeContext}

Make sure the text "${kitName}" is clearly visible but naturally blended into the packaging design.`;


    // --- STEP 1 & 2: GENERATE IMAGE & UPLOAD ---
    try {
        const generationResult = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: finalImagePrompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        
        const media = generationResult.media;

        if (!media || !media.url) {
          throw new Error('La IA no devolvió una imagen. Intenta con una descripción diferente.');
        }
        
        const base64Data = media.url.split(';base64,').pop();
        if (!base64Data) {
            throw new Error('Invalid data URI format.');
        }
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const contentType = media.url.substring(media.url.indexOf(':') + 1, media.url.indexOf(';'));

        const filename = `cover-art/${uuidv4()}.png`;
        
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: filename,
            Body: imageBuffer,
            ContentType: contentType,
          })
        );

        const finalUrl = `${publicUrl}/${filename}`;
        return { finalUrl, enhancedPrompt: finalImagePrompt, error: undefined };

    } catch (e: any) {
        let errorMessage = `Error inesperado en la generación de imagen: ${e.message}`;
        if (e.message && (e.message.includes('429') || e.message.toLowerCase().includes('quota'))) {
            errorMessage = 'Límite de cuota diario de la API alcanzado. La cuota se reinicia cada 24 horas (medianoche, Hora del Pacífico). Para una solución inmediata, añade una API key de un proyecto de Google Cloud diferente.';
        }
        // On image generation failure, return the final prompt and the error.
        return { finalUrl: null, enhancedPrompt: finalImagePrompt, error: errorMessage };
    }
  }
);
