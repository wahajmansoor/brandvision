'use client';

import { useState } from 'react';
import type { BrandKitOutput } from '@/ai/flows/generate-brand-kit-from-input';
import { BrandKitForm, type FormValues } from '@/components/brand-kit-form';
import { BrandKitDisplay } from '@/components/brand-kit-display';
import { generateBrandKitAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/app-logo';
import { Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen w-full">
      <header className="flex items-center justify-between p-4 border-b border-border/40">
        <AppLogo />
        <Button variant="ghost" size="icon">
            <Sun className="h-5 w-5" />
            <span className="sr-only">Toggle theme</span>
        </Button>
      </header>
      <main className="container mx-auto p-4 md:p-8 lg:p-12 xl:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12 xl:gap-24">
          <div className="w-full lg:col-span-1">
            <BrandKitForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
          <div className="w-full mt-10 lg:mt-0 lg:col-span-3">
            <BrandKitDisplay brandKit={brandKit} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
