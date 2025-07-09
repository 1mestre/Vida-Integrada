import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

function selectApiKey(): string | undefined {
  const multiKeys = process.env.GOOGLE_API_KEYS;
  if (multiKeys) {
    const keys = multiKeys.split(',').map(k => k.trim()).filter(Boolean);
    if (keys.length > 0) {
      // Pick a random key from the list
      const randomIndex = Math.floor(Math.random() * keys.length);
      console.log(`Using Google AI API Key index: ${randomIndex}`); // Helps debug which key is used without logging the key
      return keys[randomIndex];
    }
  }

  // Fallback to single key variables for backward compatibility
  const singleKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if(!singleKey) {
    // This check runs when the server starts. If the key is missing in the Vercel environment,
    // the entire deployment will fail to start, which is a clear and immediate signal.
    throw new Error("CRITICAL: No Google AI API Key found. Please set GOOGLE_API_KEYS or GOOGLE_API_KEY in your environment variables.");
  }
  return singleKey;
}

export const ai = genkit({
  plugins: [
    googleAI({
      // Call the function to get the key string, then pass it to the plugin.
      apiKey: selectApiKey(),
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
