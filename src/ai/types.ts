
import { z } from 'zod';

/**
 * =================================================================
 * Brand Kit Types
 * =================================================================
 */

export const BrandKitInputSchema = z.object({
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

export const BrandKitOutputSchema = z.object({
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
});
export type BrandKitOutput = z.infer<typeof BrandKitOutputSchema>;

/**
 * =================================================================
 * SEO Kit Types
 * =================================================================
 */

export const SeoKitInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  businessDescription: z.string().describe('A brief description of the business.'),
  industry: z.string().optional().describe('The industry the business operates in.'),
});
export type SeoKitInput = z.infer<typeof SeoKitInputSchema>;

export const SeoKitOutputSchema = z.object({
  websiteTitle: z.string().describe('A concise and catchy title for the website homepage.'),
  tagline: z.string().describe('A short, memorable slogan or tagline for the brand.'),
  metaDescription: z.string().describe('An SEO-optimized meta description for the homepage, around 155 characters.'),
  keywords: z.array(z.string()).describe('A list of 5-10 relevant SEO keywords.'),
  homepageHeroHeading: z.string().describe('A compelling heading for the hero section of the homepage.'),
});
export type SeoKitOutput = z.infer<typeof SeoKitOutputSchema>;
