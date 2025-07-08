'use server';
/**
 * @fileOverview An AI flow to generate cover art for a drum kit.
 *
 * - generateCoverArt - A function that generates an image based on a prompt.
 * - GenerateCoverArtInput - The input type for the generateCoverArt function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCoverArtInputSchema = z.object({
  prompt: z.string().describe('A description of the desired cover art style, mood, and content.'),
});
export type GenerateCoverArtInput = z.infer<typeof GenerateCoverArtInputSchema>;

export async function generateCoverArt(input: GenerateCoverArtInput): Promise<string> {
    return generateCoverArtFlow(input);
}

const generateCoverArtFlow = ai.defineFlow(
  {
    name: 'generateCoverArtFlow',
    inputSchema: GenerateCoverArtInputSchema,
    outputSchema: z.string().describe('A data URI of the generated PNG image.'),
  },
  async ({prompt}) => {
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
    
    return media.url;
  }
);
