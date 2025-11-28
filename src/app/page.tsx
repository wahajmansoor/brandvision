'use client';

import { useState } from 'react';
import type { BrandKitOutput } from '@/ai/flows/generate-brand-kit-from-input';
import { BrandKitForm, type FormValues } from '@/components/brand-kit-form';
import { BrandKitDisplay } from '@/components/brand-kit-display';
import { generateBrandKitAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKitOutput | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (data: FormValues, file?: File) => {
    setIsLoading(true);
    setBrandKit(null);

    let logoDataUri: string | undefined = undefined;
    if (file) {
      const getBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      logoDataUri = await getBase64(file);
    }

    try {
      const result = await generateBrandKitAction({
        ...data,
        logoDataUri,
      });
      setBrandKit(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Generating Brand Kit',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen container mx-auto p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 text-transparent bg-clip-text flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
          Brand Vision In Seconds
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Instantly generate a complete brand kit. Just describe your business, upload your logo, and let our AI do the magic.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="w-full">
          <BrandKitForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
        <div className="w-full mt-10 lg:mt-0">
          <BrandKitDisplay brandKit={brandKit} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}
