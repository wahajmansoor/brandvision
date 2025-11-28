import {genkit} from 'genkit';
import {openAI} from '@genkit-ai/compat-oai/openai';

export const ai = genkit({
  plugins: [openAI()],
  enableTracingAndMetrics: true,
});
