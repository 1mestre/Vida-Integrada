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

// R2/S3 Client Configuration
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

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
