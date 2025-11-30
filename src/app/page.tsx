'use client';

import { useState } from 'react';
import type { BrandKitOutput } from '@/ai/flows/generate-brand-kit-from-input';
import { BrandKitForm, type FormValues } from '@/components/brand-kit-form';
import { BrandKitDisplay } from '@/components/brand-kit-display';
import { generateBrandKitAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/app-logo';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKitOutput | null>(null);
  const [logoDataUri, setLogoDataUri] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const { setTheme } = useTheme();

  const handleFormSubmit = async (data: FormValues, file?: File, colors?: string[]) => {
    setIsLoading(true);
    setBrandKit(null);
    setLogoDataUri(undefined);

    let newLogoDataUri: string | undefined = undefined;
    if (file) {
      const getBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      newLogoDataUri = await getBase64(file);
      setLogoDataUri(newLogoDataUri);
    }

    try {
      const result = await generateBrandKitAction({
        ...data,
        logoDataUri: newLogoDataUri,
        logoColors: colors,
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
      <header className="p-4 border-b border-border/40">
        <div className="container mx-auto flex items-center justify-between">
          <AppLogo />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="container mx-auto py-8">
        <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-24">
          <div className="w-full flex-shrink-0 lg:w-[25%]">
            <BrandKitForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
          <div className="w-full mt-10 lg:mt-0">
            <BrandKitDisplay brandKit={brandKit} isLoading={isLoading} logoDataUri={logoDataUri} />
          </div>
        </div>
      </main>
    </div>
  );
}
