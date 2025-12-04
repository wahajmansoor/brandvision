
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { SeoKitOutput } from '@/ai/types';
import { Badge } from '@/components/ui/badge';
import { FileText, Tags, Search, Type, Heading } from 'lucide-react';

interface SeoKitDisplayProps {
  seoKit: SeoKitOutput | null;
  isLoading: boolean;
}

const SectionCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <Card className="flex-1">
        <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
                {icon}
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

export function SeoKitDisplay({ seoKit, isLoading }: SeoKitDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                    <Skeleton className="h-8 w-28 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!seoKit) {
    return null; // Don't render anything if there's no data and not loading
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                    <Search className="w-6 h-6 text-primary" />
                    Your SEO Starter Kit
                </CardTitle>
                <CardDescription>Use these suggestions to boost your website's visibility on search engines.</CardDescription>
            </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <SectionCard icon={<Type className="w-5 h-5" />} title="Website Title">
                <p className="text-lg font-semibold">{seoKit.websiteTitle}</p>
            </SectionCard>
            <SectionCard icon={<Tags className="w-5 h-5" />} title="Tagline">
                <p className="text-lg font-semibold text-muted-foreground italic">"{seoKit.tagline}"</p>
            </SectionCard>
        </div>

        <SectionCard icon={<Heading className="w-5 h-5" />} title="Homepage Hero Heading">
            <p className="text-2xl font-bold tracking-tight">{seoKit.homepageHeroHeading}</p>
        </SectionCard>
        
        <SectionCard icon={<FileText className="w-5 h-5" />} title="Meta Description">
            <p className="text-sm text-muted-foreground">{seoKit.metaDescription}</p>
        </SectionCard>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Tags className="w-5 h-5" />
                    Keywords
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {seoKit.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-sm font-normal">{keyword}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
