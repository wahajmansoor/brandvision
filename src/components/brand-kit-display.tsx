'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { BrandKitOutput } from '@/ai/flows/generate-brand-kit-from-input';
import { Palette, Type, Image as ImageIcon, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";

interface BrandKitDisplayProps {
  brandKit: BrandKitOutput | null;
  isLoading: boolean;
}

export function BrandKitDisplay({ brandKit, isLoading }: BrandKitDisplayProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard!",
      description: text,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <Skeleton className="h-20 w-20 rounded-lg" />
              <Skeleton className="h-20 w-20 rounded-lg" />
              <Skeleton className="h-20 w-20 rounded-lg" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!brandKit) {
    return (
      <Card className="flex flex-col items-center justify-center h-full text-center border-dashed min-h-[400px] lg:min-h-full">
        <CardHeader>
          <div className="mx-auto bg-muted rounded-full p-4 w-fit mb-4">
            <Wand2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <CardTitle>Your Brand Kit Awaits</CardTitle>
          <CardDescription>Fill out the form to generate your brand assets.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle>Generated Brand Kit</CardTitle>
        <CardDescription>Here are the AI-generated assets for your brand.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Palette className="w-5 h-5" />
            Color Palette
          </h3>
          <div className="flex flex-wrap gap-4">
            {brandKit.colorPalette.map((color) => (
              <div key={color} className="text-center group cursor-pointer" onClick={() => copyToClipboard(color)}>
                <div
                  className="w-20 h-20 rounded-lg shadow-md mb-2 border border-border transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color }}
                />
                <Badge variant="secondary" className="cursor-pointer transition-colors group-hover:bg-primary group-hover:text-primary-foreground">{color}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Type className="w-5 h-5" />
            Typography Suggestions
          </h3>
          <ul className="space-y-2">
            {brandKit.typographySuggestions.map((font) => (
              <li key={font} className="p-3 bg-muted/50 rounded-md text-foreground">
                {font}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <ImageIcon className="w-5 h-5" />
            Mood Board Ideas
          </h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {brandKit.moodBoardIdeas.map((idea) => (
              <li key={idea}>{idea}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
