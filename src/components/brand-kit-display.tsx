'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { BrandKitOutput } from '@/ai/flows/generate-brand-kit-from-input';
import { Palette, Type, Globe, Network, Building2, ExternalLink, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { SiteStructure } from './site-structure';

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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
               <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
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
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Palette
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
              {Object.entries(brandKit.colorPalette).map(([name, color]) => (
                <div key={name} className="text-center">
                   <div className="relative group">
                    <div
                      className="w-full h-20 rounded-lg shadow-inner mb-2 border border-border/20"
                      style={{ backgroundColor: color }}
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer"
                      onClick={() => copyToClipboard(color, name)}
                    >
                      <Copy className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="capitalize text-sm font-medium mt-1">{name}</div>
                  <div className="text-muted-foreground text-xs font-mono">{color}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
  
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              {Object.entries(brandKit.typographySuggestions).map(([type, font]) => (
                 <div key={type} className="p-4 bg-muted/50 rounded-lg text-center">
                   <div className="text-sm capitalize text-muted-foreground">{type}</div>
                   <div className="text-lg font-semibold mt-1">{font}</div>
                 </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Site Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SiteStructure initialStructure={brandKit.siteStructure} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary p-2 rounded-lg">
                <Globe className="w-5 h-5" />
              </div>
              Recommended Platforms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {brandKit.recommendedPlatforms.map((platform) => (
              <div
                key={platform.name}
                className={`p-6 rounded-lg relative overflow-hidden ${
                  platform.bestChoice
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border'
                }`}
              >
                {platform.bestChoice && (
                    <div className="absolute top-0 right-0 h-16 w-16 text-primary-foreground/10">
                        <div className="absolute transform rotate-45 bg-primary text-center text-white font-semibold py-1 right-[-34px] top-[32px] w-[170px]">
                        </div>
                        <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 100 100">
                          <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="100" height="100" fill="url(#grid)" />
                        </svg>
                    </div>
                )}
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold">{platform.name}</h3>
                  <Badge
                    variant={platform.bestChoice ? 'secondary' : 'outline'}
                    className={platform.bestChoice ? 'bg-white/20 text-white' : ''}
                  >
                    {platform.bestChoice ? 'Best Choice' : 'Alternative'}
                  </Badge>
                </div>
                <p className={`mt-2 text-base ${platform.bestChoice ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {platform.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Top Competitors
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                {brandKit.competitorWebsites.map((site) => (
                    <li key={site.name} className="flex justify-between items-center p-3 bg-muted/50 rounded-md text-foreground">
                    <span>{site.name}</span>
                    <Link href={site.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                    </li>
                ))}
                </ul>
            </CardContent>
        </Card>
      </div>
    )
  }

  return <div className="h-full">{renderContent()}</div>;
}
