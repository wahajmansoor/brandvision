'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { BrandKitOutput } from '@/ai/types';
import { Palette, Type, Globe, Network, Image as ImageIcon, Download, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { SiteStructure, type StructureItem } from './site-structure';
import { CompetitorWebsites, type UrlItem } from './competitor-websites';
import { Button } from './ui/button';
import { BrandKitPdfLayout } from './brand-kit-pdf-layout';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState, useEffect, useCallback } from 'react';
import { ColorPicker } from './ui/color-picker';
import { Input } from './ui/input';

interface BrandKitDisplayProps {
  brandKit: BrandKitOutput | null;
  isLoading: boolean;
  logoDataUri?: string;
}

export function BrandKitDisplay({ brandKit: initialBrandKit, isLoading, logoDataUri }: BrandKitDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [editableBrandKit, setEditableBrandKit] = useState<BrandKitOutput | null>(initialBrandKit);

  useEffect(() => {
    setEditableBrandKit(initialBrandKit);
  }, [initialBrandKit]);

  const handleStructureChange = useCallback((newStructure: StructureItem[]) => {
    setEditableBrandKit(prev => {
        if (!prev) return null;
        const updatedSiteStructure = newStructure.map(page => ({
            page: page.name,
            sections: page.children?.map(section => section.name) || [],
        }));
        if (JSON.stringify(prev.siteStructure) === JSON.stringify(updatedSiteStructure)) {
            return prev;
        }
        return { ...prev, siteStructure: updatedSiteStructure };
    });
  }, []);

  const handleCompetitorUrlsChange = useCallback((newUrls: UrlItem[]) => {
    setEditableBrandKit(prev => {
        if (!prev) return null;
        if (JSON.stringify(prev.competitorWebsites) === JSON.stringify(newUrls)) {
            return prev;
        }
        return { ...prev, competitorWebsites: newUrls };
    });
  }, []);

  const handleColorChange = (name: string, newColor: string) => {
    setEditableBrandKit(prev => {
      if (!prev) return null;
      return {
        ...prev,
        colorPalette: {
          ...prev.colorPalette,
          [name]: newColor,
        },
      };
    });
  };

  const handleColorNameChange = (oldName: string, newName: string) => {
    if (!newName || oldName === newName) return;

    setEditableBrandKit(prev => {
      if (!prev) return null;
      
      const newPalette = { ...prev.colorPalette };
      const colorValue = newPalette[oldName as keyof typeof newPalette];
      
      const updatedPalette: { [key: string]: string } = {};
      for (const key in newPalette) {
        if (key === oldName) {
          updatedPalette[newName] = colorValue;
        } else if (key !== newName) {
          updatedPalette[key] = newPalette[key as keyof typeof newPalette];
        }
      }

      return {
        ...prev,
        colorPalette: updatedPalette,
      };
    });
  };
  
  const handleAddColor = () => {
    setEditableBrandKit(prev => {
      if (!prev) return null;
      const newColorName = `newColor${Object.keys(prev.colorPalette).length + 1}`;
      return {
          ...prev,
          colorPalette: {
              ...prev.colorPalette,
              [newColorName]: '#000000'
          }
      };
    });
  };

  const deleteColor = (colorName: string) => {
    setEditableBrandKit(prev => {
      if (!prev) return null;
      const newPalette = { ...prev.colorPalette };
      delete newPalette[colorName as keyof typeof newPalette];
      return {
        ...prev,
        colorPalette: newPalette,
      };
    });
  };


  const handleDownloadPdf = async () => {
    const pdfContainer = document.getElementById('pdf-container');
    if (!pdfContainer || !editableBrandKit) return;
    
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(pdfContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff', // Ensure white background
        });
    
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
    
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('Brand Vision In Seconds By Wahaj Mansoor.pdf');
    } catch (error) {
        console.error("Failed to generate PDF", error);
    } finally {
        setIsDownloading(false);
    }
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {logoDataUri && (
              <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-6">
                        <Skeleton className="h-24 w-24 rounded-lg" />
                    </CardContent>
                  </Card>
              </div>
            )}
            <div className={logoDataUri ? "lg:col-span-3" : "lg:col-span-4"}>
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
            </div>
          </div>
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
  
    if (!editableBrandKit) {
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

    const competitorUrlItems = editableBrandKit.competitorWebsites || [];

    return (
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <div className="fixed -left-[9999px] top-0 opacity-0" aria-hidden="true">
            {editableBrandKit && (
                <div id="pdf-container" style={{ width: '1200px' }}>
                    <BrandKitPdfLayout brandKit={editableBrandKit} logoDataUri={logoDataUri} />
                </div>
            )}
        </div>
        <div className="flex justify-end">
            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {logoDataUri && (
                <div className="lg:col-span-1">
                  <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                              <ImageIcon className="w-5 h-5" />
                              Logo
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center p-6 bg-muted/20 rounded-lg">
                          <Image 
                              src={logoDataUri}
                              alt="Uploaded Logo"
                              width={128}
                              height={128}
                              className="object-contain max-h-32"
                          />
                      </CardContent>
                  </Card>
                </div>
            )}
            <div className={logoDataUri ? "lg:col-span-3" : "lg:col-span-4"}>
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl">
                          <Palette className="w-5 h-5" />
                          Color Palette
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6">
                          {Object.entries(editableBrandKit.colorPalette).map(([name, color]) => (
                              <div key={name} className="relative group text-center space-y-2">
                                  <div className="relative">
                                      <ColorPicker color={color} onChange={(newColor) => handleColorChange(name, newColor)}>
                                          <div
                                              className="w-full h-20 rounded-lg shadow-inner border border-border/20 cursor-pointer"
                                              style={{ backgroundColor: color }}
                                          />
                                      </ColorPicker>
                                      <Button
                                          variant="destructive"
                                          size="icon"
                                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => deleteColor(name)}
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </Button>
                                  </div>
                                  <div>
                                      <Input
                                        type="text"
                                        defaultValue={name}
                                        onBlur={(e) => handleColorNameChange(name, e.target.value)}
                                        className="capitalize text-sm font-medium text-center h-8 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-ring"
                                      />
                                      <div className="text-muted-foreground text-xs font-mono">{color}</div>
                                  </div>
                              </div>
                          ))}
                          <div className="flex items-center justify-center min-h-[120px]">
                              <Button variant="outline" size="icon" onClick={handleAddColor} className="w-20 h-20 rounded-lg">
                                  <Plus className="w-8 h-8 text-muted-foreground" />
                              </Button>
                          </div>
                      </div>
                  </CardContent>
              </Card>
            </div>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              {Object.entries(editableBrandKit.typographySuggestions).map(([type, font]) => (
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
            <SiteStructure 
              initialStructure={editableBrandKit.siteStructure || []} 
              onStructureChange={handleStructureChange} 
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
                Recommended Platforms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editableBrandKit.recommendedPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className={`p-6 rounded-lg relative overflow-hidden ${
                    platform.bestChoice
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold">{platform.name}</h3>
                    {platform.bestChoice ? (
                      <Badge
                        variant={'secondary'}
                        className={'bg-white/20 text-white'}
                      >
                        Best Choice
                      </Badge>
                    ) : (
                      <Badge variant={'outline'}>
                        Alternative
                      </Badge>
                    )}
                  </div>
                  <p className={`mt-2 text-base ${platform.bestChoice ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {platform.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <CompetitorWebsites 
            urls={competitorUrlItems} 
            onUrlsChange={handleCompetitorUrlsChange} 
          />
        </div>
      </div>
    )
  }

  return <div className="h-full">{renderContent()}</div>;
}
