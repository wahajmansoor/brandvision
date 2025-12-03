'use server';

import {
  generateBrandKit,
  type BrandKitInput,
} from '@/ai/flows/generate-brand-kit-from-input';
import OpenAI from 'openai';

export async function generateBrandKitAction(input: BrandKitInput) {
  if (!input) {
    throw new Error('Invalid input: The business information is missing.');
  }
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'The OPENAI_API_KEY is not configured. Please add it to your environment variables.'
    );
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const result = await generateBrandKit(client, input);
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
