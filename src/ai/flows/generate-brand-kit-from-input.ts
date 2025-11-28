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
  colorPalette: z.object({
    primary: z.string().describe('The primary color hex code.'),
    secondary: z.string().describe('The secondary color hex code.'),
    accent: z.string().describe('The accent color hex code.'),
    neutral: z.string().describe('The neutral color hex code.'),
    background: z.string().describe('The background color hex code.'),
  }),
  typographySuggestions: z.object({
    heading: z.string().describe('Suggested font family for headings.'),
    body: z.string().describe('Suggested font family for body text.'),
    accent: z.string().describe('Suggested font family for accent text.'),
  }),
  siteStructure: z
    .array(z.object({ page: z.string(), sections: z.array(z.string()) }))
    .describe('A suggested site structure with pages and sections for each page.'),
  recommendedPlatforms: z
    .array(z.string())
    .describe('A list of recommended platforms (e.g., Shopify, Webflow, WordPress) for the business website.'),
  competitorWebsites: z
    .array(z.object({ name: z.string(), url: z.string() }))
    .describe('A list of top competitor websites with their name and URL.'),
});
export type BrandKitOutput = z.infer<typeof BrandKitOutputSchema>;

export async function generateBrandKit(input: BrandKitInput): Promise<BrandKitOutput> {
  const prompt = `
    You are an expert branding and web design consultant. Generate a brand kit and website strategy based on the following business details.

    Business Name: ${input.businessName}
    Description: ${input.businessDescription}
    ${input.industry ? `Industry: ${input.industry}` : ''}
    ${input.location ? `Location: ${input.location}` : ''}

    Your response must be a valid JSON object with the following structure, and nothing else:
    {
      "colorPalette": { "primary": "#...", "secondary": "#...", "accent": "#...", "neutral": "#...", "background": "#..." },
      "typographySuggestions": { "heading": "Font Name", "body": "Font Name", "accent": "Font Name" },
      "siteStructure": [ { "page": "Home", "sections": ["Hero", "About Us", "Services", "Testimonials", "Contact"] } ],
      "recommendedPlatforms": ["Platform 1", "Platform 2"],
      "competitorWebsites": [ { "name": "Competitor 1", "url": "https://competitor1.com" } ]
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
