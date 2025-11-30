'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Monitor, Link as LinkIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export interface UrlItem {
  url: string;
  type: 'competitor' | 'reference';
}

interface CompetitorWebsitesProps {
  urls: UrlItem[];
  onUrlsChange: (urls: UrlItem[]) => void;
}

export function CompetitorWebsites({ urls, onUrlsChange }: CompetitorWebsitesProps) {
  const [newUrl, setNewUrl] = useState('');
  const [newUrlType, setNewUrlType] = useState<'competitor' | 'reference'>('competitor');
  const { toast } = useToast();

  const handleAddUrl = () => {
    const trimmedUrl = newUrl.trim();
    if (trimmedUrl === '') return;

    if (urls.some(item => item.url === trimmedUrl)) {
      toast({
        title: 'URL Already Exists',
        description: 'This website is already in your list.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const urlObject = new URL(trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`);
      onUrlsChange([...urls, { url: urlObject.hostname, type: newUrlType }]);
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
        <ul className="space-y-3">
          {urls.map((item, index) => (
            <li key={index} className="flex items-center gap-3 group">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <Link href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:underline flex-grow">
                    {getDisplayUrl(item.url)}
                </Link>
                <Badge variant={item.type === 'competitor' ? 'outline' : 'secondary'} className="ml-auto">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Badge>
                <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveUrl(item.url)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t space-y-4">
            <label className="text-sm font-medium">Add a Website</label>
            <div className="flex w-full items-center space-x-2">
                <Input
                    type="url"
                    placeholder="https://example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                />
                <Button type="button" onClick={handleAddUrl}>
                    Add
                </Button>
            </div>
            <RadioGroup defaultValue="competitor" onValueChange={(value: 'competitor' | 'reference') => setNewUrlType(value)} className="flex gap-4">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="competitor" id="r-competitor" />
                    <Label htmlFor="r-competitor">Competitor</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reference" id="r-reference" />
                    <Label htmlFor="r-reference">Reference</Label>
                </div>
            </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
