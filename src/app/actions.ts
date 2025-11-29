'use server';

import {
  generateBrandKit,
  type BrandKitInput,
} from '@/ai/flows/generate-brand-kit-from-input';

export async function generateBrandKitAction(input: BrandKitInput) {
  try {
    const result = await generateBrandKit(input);
    return result;
  } catch (error) {
    console.error('AI generation failed:', error);
    // Propagate a user-friendly error message.
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error('Failed to generate brand kit from OpenAI.');
  }
}
