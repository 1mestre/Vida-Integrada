'use server';
/**
 * @fileOverview An AI flow to upload a cover art image to object storage.
 *
 * - uploadCoverArt - A function that uploads an image and returns its public URL.
 * - UploadCoverArtInput - The input type for the uploadCoverArt function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const UploadCoverArtInputSchema = z.object({
  imageDataUri: z.string().describe("The image file as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
type UploadCoverArtInput = z.infer<typeof UploadCoverArtInputSchema>;

export async function uploadCoverArt(input: UploadCoverArtInput): Promise<string> {
    return uploadCoverArtFlow(input);
}

const uploadCoverArtFlow = ai.defineFlow(
  {
    name: 'uploadCoverArtFlow',
    inputSchema: UploadCoverArtInputSchema,
    outputSchema: z.string().url().describe('The public URL of the uploaded image in Cloudflare R2.'),
  },
  async ({imageDataUri}) => {
    // R2 Configuration
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

    // Step 1: Decode the base64 data URI
    const base64Data = imageDataUri.split(';base64,').pop();
    if (!base64Data) {
        throw new Error('Invalid data URI format.');
    }
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const contentType = imageDataUri.substring(imageDataUri.indexOf(':') + 1, imageDataUri.indexOf(';'));

    // Step 2: Upload the image to R2
    const fileExtension = contentType.split('/')[1] || 'png';
    const uniqueFilename = `cover-art/${uuidv4()}.${fileExtension}`;
    
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFilename,
        Body: imageBuffer,
        ContentType: contentType,
      })
    );

    // Step 3: Return the public URL
    const finalUrl = `${publicUrl}/${uniqueFilename}`;
    return finalUrl;
  }
);
