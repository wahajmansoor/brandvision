'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Monitor, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

interface CompetitorWebsitesProps {
  initialUrls: string[];
}

export function CompetitorWebsites({ initialUrls }: CompetitorWebsitesProps) {
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    setUrls(initialUrls);
  }, [initialUrls]);

  const handleAddUrl = () => {
    if (newUrl.trim() !== '' && !urls.includes(newUrl.trim())) {
      // Basic URL validation
      try {
        const urlObject = new URL(newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`);
        setUrls([...urls, urlObject.hostname]);
        setNewUrl('');
      } catch (error) {
        // Handle invalid URL, maybe show a toast
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
          {urls.map((url, index) => (
            <li key={index} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <Link href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:underline">
                    {getDisplayUrl(url)}
                </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t space-y-2">
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
        </div>
      </CardContent>
    </Card>
  );
}
