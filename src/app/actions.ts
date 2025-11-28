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
    throw new Error('Failed to generate brand kit. The AI model may be unavailable. Please try again later.');
  }
}
