'use server';

import {
  generateBrandKit,
  type BrandKitInput,
} from '@/ai/flows/generate-brand-kit-from-input';
import {
  generateSeoKit,
  type SeoKitInput,
} from '@/ai/flows/generate-seo-kit';
import OpenAI from 'openai';

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      'The OPENAI_API_KEY is not configured. Please add it to your environment variables.'
    );
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function generateBrandKitAction(input: BrandKitInput) {
  if (!input) {
    throw new Error('Invalid input: The business information is missing.');
  }
  
  const client = getOpenAIClient();

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


export async function generateSeoKitAction(input: SeoKitInput) {
  if (!input) {
    throw new Error('Invalid input: The business information is missing.');
  }

  const client = getOpenAIClient();

  try {
    const result = await generateSeoKit(client, input);
    return result;
  } catch (error) {
    console.error('AI SEO generation failed:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to generate SEO kit from OpenAI.');
  }
}
