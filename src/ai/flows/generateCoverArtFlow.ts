'use server';
/**
 * @fileOverview An AI flow to generate cover art and upload it to object storage.
 *
 * - generateCoverArt - A function that generates an image and returns its public URL.
 * - GenerateCoverArtInput - The input type for the generateCoverArt function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const GenerateCoverArtInputSchema = z.object({
  prompt: z.string().describe('A description of the desired cover art style, mood, and content.'),
});
export type GenerateCoverArtInput = z.infer<typeof GenerateCoverArtInputSchema>;

export async function generateCoverArt(input: GenerateCoverArtInput): Promise<string> {
    return generateCoverArtFlow(input);
}

// Ensure environment variables are loaded
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    throw new Error('Cloudflare R2 environment variables are not properly configured.');
}

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

const generateCoverArtFlow = ai.defineFlow(
  {
    name: 'generateCoverArtFlow',
    inputSchema: GenerateCoverArtInputSchema,
    outputSchema: z.string().url().describe('The public URL of the generated image in Cloudflare R2.'),
  },
  async ({prompt}) => {
    // Step 1: Generate the initial image
    const initialGeneration = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Artwork for a drum kit with the following theme: "${prompt}". Style: modern, high-resolution, cinematic, suitable for a music product cover. Do not include any text unless explicitly asked.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!initialGeneration.media.url) {
      throw new Error('Initial image generation failed.');
    }
    
    // Step 2: Refine the image to fix any text issues
    const refinementPrompt = [
      { media: { url: initialGeneration.media.url } },
      { text: "Analyze the provided image. If it contains any text that is distorted, illegible, or nonsensical, regenerate the image to correct the text, making it clear and artistically integrated. Maintain the original art style. If there is no text, or the text is already perfect, return the original image's style and composition." },
    ];
    
    const { media: finalMedia } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: refinementPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!finalMedia.url) {
        throw new Error('Image refinement failed to produce an image.');
    }
    
    // Step 3: Decode the base64 data URI from the FINAL image
    const base64Data = finalMedia.url.split(';base64,').pop();
    if (!base64Data) {
        throw new Error('Invalid data URI format.');
    }
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const contentType = finalMedia.url.substring(finalMedia.url.indexOf(':') + 1, finalMedia.url.indexOf(';'));

    // Step 4: Upload the image to R2
    const filename = `cover-art/${uuidv4()}.png`;
    
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: imageBuffer,
        ContentType: contentType,
      })
    );

    // Step 5: Return the public URL
    const finalUrl = `${publicUrl}/${filename}`;
    return finalUrl;
  }
);
