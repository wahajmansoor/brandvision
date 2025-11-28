'use server';
/**
 * @fileOverview Generates a basic brand kit based on user-provided business information.
 *
 * - generateBrandKit - A function that generates a brand kit.
 * - BrandKitInput - The input type for the generateBrandKit function.
 * - BrandKitOutput - The return type for the generateBrandKit function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
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

export async function generateBrandKit(input: BrandKitInput): Promise<BrandKitOutput> {
  return generateBrandKitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBrandKitPrompt',
  input: {schema: BrandKitInputSchema},
  output: {schema: BrandKitOutputSchema},
  prompt: `You are an expert branding consultant. You will generate a basic brand kit based on the provided business information.

  Business Name: {{{businessName}}}
  Business Description: {{{businessDescription}}}
  {{#if industry}}Industry: {{{industry}}}{{/if}}
  {{#if location}}Location: {{{location}}}{{/if}}
  {{#if logoDataUri}}
  Logo: {{media url=logoDataUri}}
  {{/if}}

  Based on this information, generate the following:

  *   **Color Palette:** Suggest 3-5 colors that would be appropriate for the brand, as hex codes.
  *   **Typography Suggestions:** Suggest 2-3 fonts that would be appropriate for the brand.
  *   **Mood Board Ideas:** Suggest 3-5 mood board ideas that would be appropriate for the brand.

  Ensure that the generated brand kit is cohesive and reflects the business's identity.
  Output the values as JSON conforming to the schema descriptions.`,
});

const generateBrandKitFlow = ai.defineFlow(
  {
    name: 'generateBrandKitFlow',
    inputSchema: BrandKitInputSchema,
    outputSchema: BrandKitOutputSchema,
  },
  async input => {
    const llmResponse = await ai.generate({
      model: 'gemini-1.5-pro-latest',
      prompt: prompt.prompt,
      input: input,
      output: {
        schema: BrandKitOutputSchema,
      },
    });

    return llmResponse.output;
  }
);
