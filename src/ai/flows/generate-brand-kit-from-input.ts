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

async function callOpenAI(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<BrandKitOutput> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: messages,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('OpenAI returned an empty response.');
  }

  try {
    const parsedOutput = JSON.parse(content);
    return BrandKitOutputSchema.parse(parsedOutput);
  } catch(e) {
    console.error("Failed to parse OpenAI response:", content, e);
    throw new Error('An unexpected response was received from the server.');
  }
}


export async function generateBrandKit(input: BrandKitInput): Promise<BrandKitOutput> {
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
    You are an expert branding and web design consultant. Generate a brand kit and website strategy based on the following business details.

    ${logoColorsPrompt}

    **JSON Structure Rules:**
    - Your response MUST be a single, valid JSON object and nothing else.
    - The JSON object must conform to the following schema.
    - businessName: MUST be the business name provided by the user.
    - colorPalette: MUST be an object with primary, secondary, accent, neutral, and background hex codes.
    - typographySuggestions: MUST be an object with 'heading', 'body', and 'accent' font suggestions.
    - siteStructure: MUST be an array of objects for the website's navigation. Each object should have a 'page' (string) and 'sections' (an array of strings). A page can have zero or more sections. For example, a simple 'Contact Us' page might have an empty sections array, while a 'Home' page might have several sections like "Hero", "About Us", and "Services". Generate a logical structure. Example: [{ "page": "Home", "sections": ["Hero", "About Us", "Services"] }, { "page": "Contact", "sections": [] }]
    - recommendedPlatforms: MUST be an array of objects, each with 'name' (string), 'description' (string), and 'bestChoice' (boolean).
    - competitorWebsites: MUST be an array of objects. Follow these strict rules for this field:
        1. **Simulate a Search**: If the user provides an industry and location, you MUST simulate a Google search for "Top ${input.industry || ''} in ${input.location || ''}" and return the top 3 organic (non-ad) search results.
        2. **Find Real, Live Websites**: The websites must be real, live, and operational. Before including a URL, you must act as if you have verified that the website is currently online and accessible.
        3. **No Broken or Placeholder Links**: Do NOT include any broken links, placeholder sites, domains that are for sale, or any URL that would result in a "This site can’t be reached" error.
        4. **No Service Providers or Directories**: Do NOT include any domain registrars, hosting providers, website builders (e.g., GoDaddy, Wix), or directory sites (e.g., Yelp, Yellow Pages). The results must be actual businesses in the specified industry.
        5. **Correct Format**: Each object in the array must have a 'url' (e.g., "example.com") and a 'type' which MUST be 'search-result'. If no industry or location is provided, return an empty array.

    **Business Details:**
    Business Name: ${input.businessName}
    Description: ${input.businessDescription}
    ${input.industry ? `Industry: ${input.industry}` : ''}
    ${input.location ? `Location: ${input.location}` : ''}

    Your response must be a valid JSON object following the specified schema, and nothing else.
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
      },
    });
  }
  
  try {
    console.log("Attempting to generate brand kit...");
    return await callOpenAI(messages);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // Re-throw the raw error to get more details in the UI
    throw error;
  }
}
