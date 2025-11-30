'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Monitor, Link as LinkIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
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
      onUrlsChange([...urls, { url: urlObject.hostname, type: 'competitor' }]);
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
          Competitor Websites
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
                <Badge variant={'outline'} className="ml-auto">
                    Competitor
                </Badge>
                <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveUrl(item.url)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t space-y-4">
            <label className="text-sm font-medium">Add a Competitor Website</label>
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
        </div>
      </CardContent>
    </Card>
  );
}
