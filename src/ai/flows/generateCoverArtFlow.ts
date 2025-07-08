
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
});
type GenerateCoverArtInput = z.infer<typeof GenerateCoverArtInputSchema>;

// The new output schema that includes the final URL and the enhanced prompt
const GenerateCoverArtOutputSchema = z.object({
    finalUrl: z.string().url().describe('The public URL of the generated image in Cloudflare R2.'),
    enhancedPrompt: z.string().describe('The AI-enhanced prompt that was used to generate the image.'),
});
type GenerateCoverArtOutput = z.infer<typeof GenerateCoverArtOutputSchema>;


export async function generateCoverArt(input: GenerateCoverArtInput): Promise<GenerateCoverArtOutput> {
    return generateCoverArtFlow(input);
}

// --- R2 Configuration and Validation ---
// Se leen las credenciales y la configuración de Cloudflare R2 desde las variables de entorno.
// Estas deben estar configuradas tanto en tu entorno local (.env) como en Vercel.
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

// Validación: Si falta alguna de las variables, el servidor lanzará un error claro y específico.
const missingVars = [];
if (!accountId) missingVars.push('CLOUDFLARE_ACCOUNT_ID');
if (!accessKeyId) missingVars.push('R2_ACCESS_KEY_ID');
if (!secretAccessKey) missingVars.push('R2_SECRET_ACCESS_KEY');
if (!bucketName) missingVars.push('R2_BUCKET_NAME');
if (!publicUrl) missingVars.push('R2_PUBLIC_URL or NEXT_PUBLIC_R2_PUBLIC_URL');

if (missingVars.length > 0) {
    throw new Error(`R2 Configuration Error: The following environment variables are missing on the server: ${missingVars.join(', ')}`);
}

// Se crea un cliente S3 para interactuar con el almacenamiento de R2.
const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});
// --- End Configuration ---

const generateCoverArtFlow = ai.defineFlow(
  {
    name: 'generateCoverArtFlow',
    inputSchema: GenerateCoverArtInputSchema,
    outputSchema: GenerateCoverArtOutputSchema, // Use the new output schema
  },
  async ({prompt}) => {
    // ---- PASO 0: MEJORA DEL PROMPT ----
    const enhancementPromptText = `You are a creative director for a music brand. A user has provided a core concept for a product's packaging. Your task is to expand this concept into a slightly more detailed and descriptive paragraph that an image generation AI can use.

    **Core Concept:** "${prompt}"

    **Instructions:**
    1.  **Extend, Don't Invent:** Your main goal is to elaborate on the user's core concept. Do not introduce new, unrelated themes or elements.
    2.  **Translate to a Visual for a Box:** Describe how the core concept could be represented visually *on a product box*. Focus on mood, atmosphere, color palettes, and textures that are directly relatable to the concept provided.
    3.  **Describe the Vibe:** Use evocative, artistic language to describe the overall feeling and aesthetic of the packaging.
    4.  **Single Paragraph Output:** The final output must be a single, coherent paragraph, without any titles or labels.
    
    Example:
    User Concept: "Dark trap, Travis Scott style"
    Your Output: "A moody, cinematic 3D render of a premium product box with a dark, enigmatic aesthetic inspired by Travis Scott's 'Astroworld'. The packaging features a blend of matte black textures and subtle, iridescent details that catch the light. The scene is lit with atmospheric neon glows in deep purples and reds, casting long, soft shadows. The overall composition feels grounded yet otherworldly, with a focus on tactile realism, and a hint of cosmic mystery."`;
    
    const enhancementResult = await ai.generate({
        prompt: enhancementPromptText,
        model: 'googleai/gemini-2.5-flash',
    });
    
    const enhancedPrompt = enhancementResult.text;
    if (!enhancedPrompt) {
        throw new Error('Failed to enhance the prompt. The AI did not return a description.');
    }

    // ---- PASO 1: GENERACIÓN DE LA IMAGEN ----
    // Este prompt es extremadamente explícito para evitar la generación de texto.
    const imageGenerationPrompt = `A realistic, handcrafted 3D-rendered product packaging. The box should appear modern and premium with a natural, organic aesthetic. Emphasize depth, physicality, and tactile design—soft textures, subtle imperfections, and smooth transitions between surfaces. Lighting should feel cinematic and ambient, avoiding overly sharp digital edges. The composition must appear thoughtfully layered, grounded in realism, and artistically composed.
    
    CRITICAL COMMAND: The packaging design MUST BE PURELY GRAPHICAL. It must not contain any words, letters, text, typography, or numbers of any kind. This is a visual-only template. I will reject any image that contains text.
    
    The visual theme that inspires the packaging's graphical elements is: "${enhancedPrompt}".`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imageGenerationPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
      throw new Error('Initial image generation failed.');
    }
    
    // ---- PASO 2: DECODIFICACIÓN Y SUBIDA ----
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

    // ---- PASO 3: DEVOLUCIÓN DE RESULTADOS ----
    const finalUrl = `${publicUrl}/${filename}`;
    return { finalUrl, enhancedPrompt };
  }
);
