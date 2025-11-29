'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Monitor, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface UrlItem {
  url: string;
  type: 'competitor' | 'reference';
}

interface CompetitorWebsitesProps {
  initialUrls: string[];
}

export function CompetitorWebsites({ initialUrls }: CompetitorWebsitesProps) {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newUrlType, setNewUrlType] = useState<'competitor' | 'reference'>('competitor');

  useEffect(() => {
    setUrls(initialUrls.map(url => ({ url, type: 'competitor' })));
  }, [initialUrls]);

  const handleAddUrl = () => {
    if (newUrl.trim() !== '' && !urls.some(item => item.url === newUrl.trim())) {
      try {
        const urlObject = new URL(newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`);
        setUrls([...urls, { url: urlObject.hostname, type: newUrlType }]);
        setNewUrl('');
      } catch (error) {
        console.error("Invalid URL format");
      }
    }
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
            <li key={index} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <Link href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:underline">
                    {getDisplayUrl(item.url)}
                </Link>
                <Badge variant={item.type === 'competitor' ? 'outline' : 'secondary'} className="ml-auto">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Badge>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t space-y-4">
            <label className="text-sm font-medium text-muted-foreground">Reference Website</label>
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
