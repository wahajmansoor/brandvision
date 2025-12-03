
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Monitor, Link as LinkIcon, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

export interface UrlItem {
  url: string;
  type: 'competitor' | 'reference' | 'search-result';
}

interface CompetitorWebsitesProps {
  urls: UrlItem[];
  onUrlsChange: (urls: UrlItem[]) => void;
}

export function CompetitorWebsites({ urls, onUrlsChange }: CompetitorWebsitesProps) {
  const [newUrl, setNewUrl] = useState('');
  const [urlType, setUrlType] = useState<'competitor' | 'reference'>('competitor');
  const { toast } = useToast();

  const handleAddUrl = () => {
    let trimmedUrl = newUrl.trim();
    if (trimmedUrl === '') return;

    // Stricter validation: check for a dot, which is essential for a valid domain.
    if (!trimmedUrl.includes('.')) {
        toast({
            title: 'Invalid URL',
            description: 'Please enter a valid website URL (e.g., example.com).',
            variant: 'destructive',
        });
        return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        trimmedUrl = `https://${trimmedUrl}`;
    }

    try {
      const urlObject = new URL(trimmedUrl);
      const hostname = urlObject.hostname.replace(/^www\./, '');
      
      // Prevent adding just a TLD like ".com"
      if (!hostname.split('.')[0].length) {
          throw new Error("Invalid domain.");
      }

      if (urls.some(item => getDisplayUrl(item.url) === hostname)) {
        toast({
          title: 'URL Already Exists',
          description: 'This website is already in your list.',
          variant: 'destructive',
        });
        return;
      }
      onUrlsChange([...urls, { url: hostname, type: urlType }]);
      setNewUrl('');

    } catch (error) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid website URL (e.g., example.com).',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    onUrlsChange(urls.filter(item => item.url !== urlToRemove));
  };
  
  const getDisplayUrl = (url: string) => {
    try {
      const urlObject = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObject.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };
  
  const getTypeDisplayName = (type: UrlItem['type']) => {
    if (type === 'search-result') return 'Search Result';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          Competitor & Reference Websites
        </CardTitle>
      </CardHeader>
      <CardContent>
        {urls.length > 0 ? (
            <ul className="space-y-3">
            {urls.map((item, index) => (
                <li key={index} className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        {item.type === 'search-result' ? (
                            <Search className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <LinkIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                    </div>
                    <Link href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:underline flex-grow">
                        {getDisplayUrl(item.url)}
                    </Link>
                    <Badge variant={'outline'} className="ml-auto capitalize">
                        {getTypeDisplayName(item.type)}
                    </Badge>
                    <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveUrl(item.url)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                </li>
            ))}
            </ul>
        ) : (
            <div className="text-center text-muted-foreground py-8">
                <p>No good competitor websites found, please provide more detail about your business.</p>
            </div>
        )}
        <div className="mt-4 pt-4 border-t space-y-4">
            <label className="text-sm font-medium">Add a Website</label>
            <RadioGroup
              defaultValue="competitor"
              value={urlType}
              onValueChange={(value: 'competitor' | 'reference') => setUrlType(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="competitor" id="r-competitor" />
                <Label htmlFor="r-competitor">Competitor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reference" id="r-reference" />
                <Label htmlFor="r-reference">Reference</Label>
              </div>
            </RadioGroup>
            <div className="flex w-full items-center space-x-2">
                <Input
                    type="url"
                    placeholder="example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddUrl();
                      }
                    }}
                />
                <Button type="button" onClick={handleAddUrl}>
                    Add
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
