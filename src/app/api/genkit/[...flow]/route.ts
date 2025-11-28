import {registerFlows} from '@genkit-ai/next';

import '@/ai/flows/generate-brand-kit-from-input';

// The registerFlows() function will automatically use the configured
// Genkit instance from src/ai/genkit.ts.
registerFlows();
