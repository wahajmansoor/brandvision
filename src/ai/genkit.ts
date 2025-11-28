import {genkit} from 'genkit';
import {openAI} from 'genkitx-openai';

export const ai = genkit({
  plugins: [openAI({model: 'gpt-4o-mini'})],
});
