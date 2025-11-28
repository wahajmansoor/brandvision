'use server';
/**
 * @fileOverview Generates a basic brand kit based on user-provided business information using the OpenAI API.
 *
 * - generateBrandKit - A function that generates a brand kit.
 * - BrandKitInput - The input type for the generateBrandKit function.
 * - BrandKitOutput - The return type for the generateBrandKit function.
 */

import OpenAI from 'openai';
import {z} from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BrandKitInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  businessDescription: z.string().describe('A brief description of the business.'),
  industry: z.string().optional().describe('The industry the business operates in.'),
  location: z.string().optional().describe('The location of the business.'),
  logoDataUri: z
    .string()
    .optional()
    .describe(
      "The business's existing logo as a data URI. This is not currently used by the OpenAI implementation."
    ),
});
export type BrandKitInput = z.infer<typeof BrandKitInputSchema>;

const BrandKitOutputSchema = z.object({
  colorPalette: z.array(z.string()).describe('A suggested color palette with 3-5 appropriate hex color codes.'),
  typographySuggestions: z.array(z.string()).describe('Suggested typography with 2-3 font family names.'),
  moodBoardIdeas: z.array(z.string()).describe('Mood board ideas with 3-5 descriptive ideas for a mood board.'),
});
export type BrandKitOutput = z.infer<typeof BrandKitOutputSchema>;

export async function generateBrandKit(input: BrandKitInput): Promise<BrandKitOutput> {
  const prompt = `
    You are an expert branding consultant. Generate a brand kit based on the following business details.

    Business Name: ${input.businessName}
    Description: ${input.businessDescription}
    ${input.industry ? `Industry: ${input.industry}` : ''}
    ${input.location ? `Location: ${input.location}` : ''}

    Your response must be a valid JSON object with the following structure, and nothing else:
    {
      "colorPalette": ["#..."],
      "typographySuggestions": ["Font Name"],
      "moodBoardIdeas": ["Idea"]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('OpenAI returned an empty response.');
    }

    const parsedOutput = JSON.parse(content);
    return BrandKitOutputSchema.parse(parsedOutput);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to generate brand kit from OpenAI.');
  }
}
