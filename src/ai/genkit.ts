import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
    // This check runs when the server starts. If the key is missing in the Vercel environment,
    // the entire deployment will fail to start, which is a clear and immediate signal.
    throw new Error("CRITICAL: GOOGLE_API_KEY or GOOGLE_AI_API_KEY environment variable is not set. The AI features cannot be initialized.");
}


export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
