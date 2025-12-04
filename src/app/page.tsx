'use client';

import { useState } from 'react';
import type { BrandKitOutput, SeoKitOutput } from '@/ai/types';
import { BrandKitForm, type FormValues } from '@/components/brand-kit-form';
import { BrandKitDisplay } from '@/components/brand-kit-display';
import { SeoKitDisplay } from '@/components/seo-kit-display';
import { generateBrandKitAction, generateSeoKitAction } from '@/app/actions';
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
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKitOutput | null>(null);
  const [seoKit, setSeoKit] = useState<SeoKitOutput | null>(null);
  const [logoDataUri, setLogoDataUri] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const { setTheme } = useTheme();

  const handleFormSubmit = async (data: FormValues, resizedLogoDataUri?: string, colors?: string[]) => {
    setIsLoading(true);
    setBrandKit(null);
    setSeoKit(null);
    setLogoDataUri(resizedLogoDataUri);

    try {
      // Run both actions in parallel
      const [brandResult, seoResult] = await Promise.all([
        generateBrandKitAction({
          ...data,
          logoDataUri: resizedLogoDataUri,
          logoColors: colors,
        }),
        generateSeoKitAction(data),
      ]);
      setBrandKit(brandResult);
      setSeoKit(seoResult);
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
    <div className="min-h-screen w-full flex flex-col">
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
      <main className="container mx-auto py-8 flex-grow">
        <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-24">
          <div className="w-full flex-shrink-0 lg:w-[25%]">
            <BrandKitForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
          <div className="w-full mt-10 lg:mt-0">
            <SeoKitDisplay seoKit={seoKit} isLoading={isLoading} />
            {(seoKit || isLoading) && <Separator className="my-8" />}
            <BrandKitDisplay brandKit={brandKit} isLoading={isLoading} logoDataUri={logoDataUri} />
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © 2025 Brand Vision In Seconds. Crafted with love by{' '}
        <a
            href="https://wahajmansoor.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
        >
            Wahaj Mansoor
        </a>
      </footer>
    </div>
  );
}
