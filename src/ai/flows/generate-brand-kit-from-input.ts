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
  colorPalette: z.array(z.string()).describe('A suggested color palette for the brand.'),
  typographySuggestions: z.array(z.string()).describe('Suggested typography for the brand.'),
  moodBoardIdeas: z.array(z.string()).describe('Mood board ideas for the brand.'),
});
export type BrandKitOutput = z.infer<typeof BrandKitOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateBrandKitPrompt',
  input: {schema: BrandKitInputSchema},
  output: {schema: BrandKitOutputSchema},
  prompt: `You are an expert branding consultant. Generate a brand kit based on the following business details.

Business Name: {{{businessName}}}
Description: {{{businessDescription}}}
{{#if industry}}Industry: {{{industry}}}{{/if}}
{{#if location}}Location: {{{location}}}{{/if}}
{{#if logoDataUri}}
Logo: {{media url=logoDataUri}}
{{/if}}

Your response must be a JSON object with three properties: 'colorPalette', 'typographySuggestions', and 'moodBoardIdeas'.
- 'colorPalette' should be an array of 3-5 appropriate hex color codes.
- 'typographySuggestions' should be an array of 2-3 font family names.
- 'moodBoardIdeas' should be an array of 3-5 descriptive ideas for a mood board.

Generate a cohesive brand kit that reflects the business's identity.`,
});

const generateBrandKitFlow = ai.defineFlow(
  {
    name: 'generateBrandKitFlow',
    inputSchema: BrandKitInputSchema,
    outputSchema: BrandKitOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateBrandKit(input: BrandKitInput): Promise<BrandKitOutput> {
  return generateBrandKitFlow(input);
}
