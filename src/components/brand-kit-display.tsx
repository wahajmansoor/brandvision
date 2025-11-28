'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { BrandKitOutput } from '@/ai/flows/generate-brand-kit-from-input';
import { Palette, Type, Image as ImageIcon, Globe, Network, Building2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';

interface BrandKitDisplayProps {
  brandKit: BrandKitOutput | null;
  isLoading: boolean;
}

export function BrandKitDisplay({ brandKit, isLoading }: BrandKitDisplayProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `Copied ${label} to clipboard!`,
      description: text,
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="bg-transparent border-dashed">
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
        <div className="flex flex-col items-center justify-center h-full text-center border-2 border-dashed border-border rounded-lg p-8 min-h-[400px] lg:min-h-full">
            <div className="mx-auto bg-muted rounded-full p-3 mb-4 ring-8 ring-muted/20">
              <Palette className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
            <p className="text-muted-foreground max-w-xs">Fill out the business details on the left to instantly generate a comprehensive brand starter kit.</p>
        </div>
      );
    }

    return (
      <Card className="animate-in fade-in-50 duration-500 bg-transparent border-dashed">
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
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {Object.entries(brandKit.colorPalette).map(([name, color]) => (
                <div key={name} className="text-center group cursor-pointer" onClick={() => copyToClipboard(color, name)}>
                  <div
                    className="w-full h-20 rounded-lg shadow-md mb-2 border border-border/20 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: color }}
                  />
                  <div className="capitalize text-sm font-medium">{name}</div>
                  <Badge variant="secondary" className="cursor-pointer transition-colors group-hover:bg-primary group-hover:text-primary-foreground">{color}</Badge>
                </div>
              ))}
            </div>
          </div>
  
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Type className="w-5 h-5" />
              Typography
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {Object.entries(brandKit.typographySuggestions).map(([type, font]) => (
                 <div key={type} className="p-4 bg-muted/50 rounded-md">
                   <div className="text-sm capitalize text-muted-foreground">{type}</div>
                   <div className="text-lg font-semibold">{font}</div>
                 </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Network className="w-5 h-5" />
              Site Structure
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {brandKit.siteStructure.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="font-medium">{item.page}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-4">
                      {item.sections.map((section, i) => <li key={i}>{section}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Globe className="w-5 h-5" />
              Recommended Platforms
            </h3>
            <div className="flex flex-wrap gap-2">
              {brandKit.recommendedPlatforms.map((platform) => (
                <Badge key={platform} variant="outline" className="text-base py-1 px-3">{platform}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Building2 className="w-5 h-5" />
              Top Competitors
            </h3>
            <ul className="space-y-2">
              {brandKit.competitorWebsites.map((site) => (
                <li key={site.name} className="p-3 bg-muted/50 rounded-md text-foreground flex justify-between items-center">
                  <span>{site.name}</span>
                  <Link href={site.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                     <ExternalLink className="w-4 h-4" />
                  </Link>
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
    )
  }

  return <div className="h-full">{renderContent()}</div>;
}
