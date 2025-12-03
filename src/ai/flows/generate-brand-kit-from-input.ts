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

const BrandKitInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  businessDescription: z.string().describe('A brief description of the business.'),
  industry: z.string().optional().describe('The industry the business operates in.'),
  location: z.string().optional().describe('The location of the business.'),
  logoDataUri: z
    .string()
    .optional()
    .describe(
      "A resized and compressed version of the business's logo as a data URI."
    ),
  logoColors: z.array(z.string()).optional().describe('A list of hex colors extracted from the logo.'),
});
export type BrandKitInput = z.infer<typeof BrandKitInputSchema>;

const WebsiteItemSchema = z.object({
  url: z.string().describe('The domain name of the website (e.g., example.com).'),
  type: z.enum(['competitor', 'reference', 'search-result']).describe("The type of website, either 'competitor', 'reference', or 'search-result'."),
});

const BrandKitOutputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
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
    .array(WebsiteItemSchema)
    .describe('A list of top competitor website URLs.'),
});
export type BrandKitOutput = z.infer<typeof BrandKitOutputSchema>;

function cleanAndParseJson(rawContent: string): any {
  // Find the start and end of the JSON object
  const jsonStart = rawContent.indexOf('{');
  const jsonEnd = rawContent.lastIndexOf('}');
  
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('No JSON object found in the response.');
  }

  // Extract the JSON string
  const jsonString = rawContent.substring(jsonStart, jsonEnd + 1);

  // Parse the extracted JSON string
  return JSON.parse(jsonString);
}


async function callOpenAI(client: OpenAI, messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<BrandKitOutput> {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: messages,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  try {
    const parsedOutput = cleanAndParseJson(content);
    return BrandKitOutputSchema.parse(parsedOutput);
  } catch(e: any) {
    console.error("Failed to parse OpenAI response. Raw content:", content);
    console.error("Parsing Error:", e);
    throw new Error('An unexpected response was received from the server.');
  }
}


export async function generateBrandKit(client: OpenAI, input: BrandKitInput): Promise<BrandKitOutput> {
  const logoColorsPrompt = input.logoColors && input.logoColors.length > 0 ? `
    **Extracted Logo Colors:**
    You have been provided with the following key colors extracted directly from the user's logo: ${input.logoColors.join(', ')}.
    You MUST use these colors to build the color palette. Select the most appropriate colors from this list for the primary, secondary, accent, neutral, and background roles. Do not invent new colors. The final palette must be diverse and functional, using the provided colors as the source of truth.
  ` : `
    **Color Palette Generation Rules:**
    1. If a logo image is provided, you MUST analyze the image and extract the exact key colors from it to create the entire color palette (primary, secondary, accent, neutral, background). The palette MUST be derived directly from the logo's colors.
    2. If NO logo is provided, you MUST generate a fitting color palette based solely on the business description and industry.
  `;

  const textPrompt = `
    You are an expert branding and web design consultant. Your task is to generate a comprehensive brand kit and website strategy.

    **Business Details:**
    - Name: ${input.businessName}
    - Description: ${input.businessDescription}
    ${input.industry ? `- Industry: ${input.industry}` : ''}
    ${input.location ? `- Location: ${input.location}` : ''}

    ${logoColorsPrompt}

    **Competitor Research Rules:**
    - You MUST find real, operational competitor websites by analyzing the user's business description, industry, and location.
    - The websites MUST be real, live, and operational.
    - Do NOT invent websites or include sites that result in a 404 error.
    - Do NOT include websites that are for sale, such as those listed on 'hugedomains.com' or other domain marketplaces.
    - Do NOT include directories (Yelp), social media, website builders (Wix), or placeholder sites.
    - Return the top 3-5 organic competitor results.
    - If no relevant competitors are found, you MUST return an empty array for the 'competitorWebsites' field.

    **Site Structure Rules:**
    - Create a logical and relevant site structure based on the business type.
    - For pages like 'FAQ' or 'Contact Us', ensure the sections within them are meaningful (e.g., a 'Contact Us' page might have sections like 'Contact Form', 'Our Location', 'Business Hours').
    - Do NOT create redundant structures where a page's only section is the same as the page title (e.g., a page 'FAQ' with only one section called 'FAQ').

    **Output Format Rules:**
    - Your response MUST be a single, valid JSON object and nothing else. Do not wrap it in markdown or any other text.
    - The JSON object must strictly conform to the following schema:
      - businessName: The exact business name provided.
      - colorPalette: An object with 'primary', 'secondary', 'accent', 'neutral', and 'background' hex codes.
      - typographySuggestions: An object with 'heading', 'body', and 'accent' font family suggestions.
      - siteStructure: An array of objects, each with 'page' (string) and 'sections' (array of strings). Example: [{ "page": "Home", "sections": ["Hero", "Services"] }]
      - recommendedPlatforms: An array of objects, each with 'name', 'description', and 'bestChoice' (boolean).
      - competitorWebsites: An array of objects. Each object must have a 'url' (e.g., "example.com") and a 'type' of 'search-result'. Return an empty array if no relevant competitors are found.
  `;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'user',
      content: [
        { type: 'text', text: textPrompt }
      ]
    },
  ];

  if (input.logoDataUri) {
    (messages[0].content as OpenAI.Chat.Completions.ChatCompletionContentPart[]).push({
      type: 'image_url',
      image_url: {
        url: input.logoDataUri,
        // The detail parameter is not directly available but this shows intent
        // The actual resizing happens on the client
      },
    });
  }
  
  try {
    return await callOpenAI(client, messages);
  } catch (error) {
    console.error('Error in generateBrandKit calling OpenAI API:', error);
    // Re-throw the original error to provide more details in the server logs/UI
    throw error;
  }
}
