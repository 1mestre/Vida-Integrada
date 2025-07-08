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
    // Step 1: Generate the image data URI with AI
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Artwork for a drum kit with the following theme: "${prompt}". Style: modern, high-resolution, cinematic, suitable for a music product cover.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
        throw new Error('Image generation failed to produce an image.');
    }
    
    // Step 2: Decode the base64 data URI
    const base64Data = media.url.split(';base64,').pop();
    if (!base64Data) {
        throw new Error('Invalid data URI format.');
    }
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const contentType = media.url.substring(media.url.indexOf(':') + 1, media.url.indexOf(';'));

    // Step 3: Upload the image to R2
    const filename = `cover-art/${uuidv4()}.png`;
    
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: imageBuffer,
        ContentType: contentType,
      })
    );

    // Step 4: Return the public URL
    const finalUrl = `${publicUrl}/${filename}`;
    return finalUrl;
  }
);
