'use server';
/**
 * @fileOverview Generates an SEO starter kit based on user-provided business information.
 *
 * - generateSeoKit - A function that generates SEO suggestions.
 */

import OpenAI from 'openai';
import { SeoKitOutputSchema, type SeoKitInput, type SeoKitOutput } from '@/ai/types';

function cleanAndParseJson(rawContent: string): any {
  const jsonMatch = rawContent.match(/```json([\s\S]*?)```/);
  const jsonString = jsonMatch ? jsonMatch[1].trim() : rawContent;
  
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    // Fallback for when the model doesn't use markdown
    const firstBrace = rawContent.indexOf('{');
    const lastBrace = rawContent.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      return JSON.parse(rawContent.substring(firstBrace, lastBrace + 1));
    }
    throw e;
  }
}

async function callOpenAI(client: OpenAI, messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]): Promise<SeoKitOutput> {
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
    return SeoKitOutputSchema.parse(parsedOutput);
  } catch(e: any) {
    console.error("Failed to parse OpenAI response for SEO Kit. Raw content:", content);
    console.error("Parsing Error:", e);
    throw new Error('An unexpected response was received from the server.');
  }
}

export async function generateSeoKit(client: OpenAI, input: SeoKitInput): Promise<SeoKitOutput> {
  const textPrompt = `
    You are an expert SEO and marketing copywriter. Your task is to generate an SEO starter kit for a business.

    **Business Details:**
    - Name: ${input.businessName}
    - Description: ${input.businessDescription}
    ${input.industry ? `- Industry: ${input.industry}` : ''}

    **Instructions:**
    - **Website Title:** Create a compelling, SEO-friendly title for the website's homepage. Keep it under 60 characters.
    - **Tagline:** Write a short, catchy tagline that captures the brand's essence.
    - **Meta Description:** Write a meta description for the homepage. It should be engaging and between 150-160 characters.
    - **Keywords:** Generate a list of 5-10 relevant keywords that the business should target.
    - **Homepage Hero Heading:** Create a powerful and attention-grabbing heading for the hero section of the homepage.

    **Output Format Rules:**
    - Your response MUST be a single, valid JSON object and nothing else. Do not wrap it in markdown or any other text.
    - The JSON object must strictly conform to the following schema:
      - websiteTitle: string
      - tagline: string
      - metaDescription: string
      - keywords: array of strings
      - homepageHeroHeading: string
  `;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{
      role: 'user',
      content: textPrompt
  }];
  
  try {
    return await callOpenAI(client, messages);
  } catch (error) {
    console.error('Error in generateSeoKit calling OpenAI API:', error);
    throw error;
  }
}
