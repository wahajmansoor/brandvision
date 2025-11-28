'use server';
/**
 * @fileOverview Generates a basic brand kit based on user-provided business information.
 *
 * - generateBrandKit - A function that generates a brand kit.
 * - BrandKitInput - The input type for the generateBrandKit function.
 * - BrandKitOutput - The return type for the generateBrandKit function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {openAI} from '@genkit-ai/compat-oai/openai';

const BrandKitInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  businessDescription: z.string().describe('A brief description of the business.'),
  industry: z.string().optional().describe('The industry the business operates in.'),
  location: z.string().optional().describe('The location of the business.'),
  logoDataUri: z
    .string()
    .optional()
    .describe(
      "The business's existing logo as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type BrandKitInput = z.infer<typeof BrandKitInputSchema>;

const BrandKitOutputSchema = z.object({
  colorPalette: z.array(z.string()).describe('A suggested color palette with 3-5 appropriate hex color codes.'),
  typographySuggestions: z.array(z.string()).describe('Suggested typography with 2-3 font family names.'),
  moodBoardIdeas: z.array(z.string()).describe('Mood board ideas with 3-5 descriptive ideas for a mood board.'),
});
export type BrandKitOutput = z.infer<typeof BrandKitOutputSchema>;

const generateBrandKitFlow = ai.defineFlow(
  {
    name: 'generateBrandKitFlow',
    inputSchema: BrandKitInputSchema,
    outputSchema: BrandKitOutputSchema,
  },
  async (input) => {
    const {text} = await ai.generate({
      model: openAI.model('gpt-4o'),
      prompt: `You are an expert branding consultant. Generate a brand kit based on the following business details.

Business Name: ${input.businessName}
Description: ${input.businessDescription}
${input.industry ? `Industry: ${input.industry}` : ''}
${input.location ? `Location: ${input.location}` : ''}
${input.logoDataUri ? `Analyze the provided logo for color and style influences. Logo: {{media url=${input.logoDataUri}}}` : ''}

Your response must be a valid JSON object with the following structure, and nothing else:
{
  "colorPalette": ["#..."],
  "typographySuggestions": ["Font Name"],
  "moodBoardIdeas": ["Idea"]
}`,
    });

    if (!text) {
      throw new Error('Failed to get a text response from the model.');
    }
    
    try {
      const parsedOutput = JSON.parse(text);
      return BrandKitOutputSchema.parse(parsedOutput);
    } catch (e) {
      console.error("Failed to parse AI model's JSON response.", e);
      throw new Error("AI model returned an invalid format.");
    }
  }
);

export async function generateBrandKit(input: BrandKitInput): Promise<BrandKitOutput> {
  return generateBrandKitFlow(input);
}
