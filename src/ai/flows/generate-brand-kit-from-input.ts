
'use server';
/**
 * @fileOverview Generates a basic brand kit based on user-provided business information using the OpenAI API.
 *
 * - generateBrandKit - A function that generates a brand kit.
 */

import OpenAI from 'openai';
import {
  BrandKitInputSchema,
  BrandKitOutputSchema,
  type BrandKitInput,
  type BrandKitOutput
} from '@/ai/types';


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
    model: 'gpt-4o-mini',
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

    **Site Structure Rules:**
    - Create a logical and relevant site structure based on the business type.
    - If you include pages like 'FAQ' or 'Contact Us', they must be top-level pages and their 'sections' array MUST be empty. Do not create sections for these pages.
    - For all other pages, ensure the sections within them are meaningful and not redundant (e.g., a 'Services' page should have sections like 'Web Design', 'Branding', not a single section called 'Services').

    **Output Format Rules:**
    - Your response MUST be a single, valid JSON object and nothing else. Do not wrap it in markdown or any other text.
    - The JSON object must strictly conform to the following schema:
      - businessName: The exact business name provided.
      - colorPalette: An object with 'primary', 'secondary', 'accent', 'neutral', and 'background' hex codes.
      - typographySuggestions: An object with 'heading', 'body', and 'accent' font family suggestions.
      - siteStructure: An array of objects, each with 'page' (string) and 'sections' (array of strings). Example: [{ "page": "Home", "sections": ["Hero", "Services"] }]
      - recommendedPlatforms: An array of objects, each with 'name', 'description', and 'bestChoice' (boolean).
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
    // Re-validate the input before making the API call
    BrandKitInputSchema.parse(input);
    const result = await callOpenAI(client, messages);
    return result;
  } catch (error) {
    console.error('Error in generateBrandKit calling OpenAI API:', error);
    // Re-throw the original error to provide more details in the server logs/UI
    throw error;
  }
}
