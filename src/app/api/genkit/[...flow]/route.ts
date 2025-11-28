import {registerFlows} from '@genkit-ai/next';
import {ai} from '@/ai/genkit';

import '@/ai/flows/generate-brand-kit-from-input';

// By importing 'ai' from '@/ai/genkit', we are ensuring that the same
// configured Genkit instance is used across the application.
// The registerFlows() function will automatically use this instance.
registerFlows();
