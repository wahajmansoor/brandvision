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
      "The business's existing logo as a data URI."
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
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        bestChoice: z.boolean(),
      })
    )
    .describe('A list of recommended platforms for the business website.'),
  competitorWebsites: z
    .array(z.object({ name: z.string(), url: z.string() }))
    .describe('A list of top competitor websites with their name and URL.'),
});
export type BrandKitOutput = z.infer<typeof BrandKitOutputSchema>;

export async function generateBrandKit(input: BrandKitInput): Promise<BrandKitOutput> {
  const textPrompt = `
    You are an expert branding and web design consultant. Generate a brand kit and website strategy based on the following business details.
    
    If a logo is provided, you MUST analyze it. Identify the most prominent color in the logo and set that as the "primary" color in your response. Then, generate the secondary, accent, neutral, and background colors to be harmonious with that primary color.
    If no logo is provided, generate a fitting color palette based on the business description and industry.

    For the site structure, suggest a complete and logical website structure. Provide a list of top-level pages. For each page, provide a list of relevant sections or sub-pages only if it's logical. Some pages, like 'Contact', might not have any sections.
    For the recommended platforms, choose the best two for the business's needs, mark one as the 'bestChoice', and provide a concise description for why each is a good fit.
    For the competitor websites, find at least two real-world competitors.

    Business Name: ${input.businessName}
    Description: ${input.businessDescription}
    ${input.industry ? `Industry: ${input.industry}` : ''}
    ${location ? `Location: ${input.location}` : ''}

    Your response must be a valid JSON object with the following structure, and nothing else:
    {
      "colorPalette": { "primary": "#...", "secondary": "#...", "accent": "#...", "neutral": "#...", "background": "#..." },
      "typographySuggestions": { "heading": "Font Name", "body": "Font Name", "accent": "Font Name" },
      "siteStructure": [ 
        { "page": "Home", "sections": ["Hero", "About Us", "Services", "Testimonials", "Contact"] },
        { "page": "About Us", "sections": ["Our Story", "Our Mission", "Our Team"] },
        { "page": "Contact", "sections": [] }
      ],
      "recommendedPlatforms": [ { "name": "Platform 1", "description": "...", "bestChoice": true }, { "name": "Platform 2", "description": "...", "bestChoice": false } ],
      "competitorWebsites": [ { "name": "Competitor 1", "url": "https://competitor1.com" }, { "name": "Competitor 2", "url": "https://competitor2.com" } ]
    }
  `;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: textPrompt },
      ],
    },
  ];

  if (input.logoDataUri) {
    (messages[0].content as any[]).push({
      type: 'image_url',
      image_url: {
        url: input.logoDataUri,
      },
    });
  }


  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
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
