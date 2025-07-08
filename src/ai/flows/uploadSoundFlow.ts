'use server';
/**
 * @fileOverview An AI flow to upload a sound file to object storage.
 *
 * - uploadSound - A function that uploads a sound and returns its public URL.
 * - UploadSoundInput - The input type for the uploadSound function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const UploadSoundInputSchema = z.object({
  soundDataUri: z.string().describe("The sound file as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  filename: z.string().describe('The original filename of the sound.'),
});
export type UploadSoundInput = z.infer<typeof UploadSoundInputSchema>;

export async function uploadSound(input: UploadSoundInput): Promise<string> {
    return uploadSoundFlow(input);
}

// --- R2 Configuration and Validation ---
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
    throw new Error(`R2 Configuration Error: The following environment variables are missing on the server: ${missingVars.join(', ')}`);
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

const uploadSoundFlow = ai.defineFlow(
  {
    name: 'uploadSoundFlow',
    inputSchema: UploadSoundInputSchema,
    outputSchema: z.string().url().describe('The public URL of the uploaded sound in Cloudflare R2.'),
  },
  async ({soundDataUri, filename}) => {
    // Step 1: Decode the base64 data URI
    const base64Data = soundDataUri.split(';base64,').pop();
    if (!base64Data) {
        throw new Error('Invalid data URI format.');
    }
    const soundBuffer = Buffer.from(base64Data, 'base64');
    const contentType = soundDataUri.substring(soundDataUri.indexOf(':') + 1, soundDataUri.indexOf(';'));

    // Step 2: Upload the sound to R2
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const uniqueFilename = `sounds/${uuidv4()}-${safeFilename}`;
    
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFilename,
        Body: soundBuffer,
        ContentType: contentType,
      })
    );

    // Step 3: Return the public URL
    const finalUrl = `${publicUrl}/${uniqueFilename}`;
    return finalUrl;
  }
);
