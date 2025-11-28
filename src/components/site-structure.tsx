'use client';

import { useState, useEffect } from 'react';
import { File, Plus, Trash2, GripVertical, Shuffle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Reorder } from '@/components/ui/reorder';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Section = {
  id: string;
  name: string;
};

type Page = {
  id: string;
  page: string;
  sections: Section[];
};

interface SiteStructureProps {
  initialStructure: { page: string; sections: string[] }[];
}

export function SiteStructure({ initialStructure }: SiteStructureProps) {
  const [structure, setStructure] = useState<Page[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    const transformedStructure = initialStructure.map((item, index) => ({
      id: `page-${index}-${Date.now()}`,
      page: item.page,
      sections: item.sections.map((section, sIndex) => ({
        id: `section-${index}-${sIndex}-${Date.now()}`,
        name: section,
      })),
    }));
    setStructure(transformedStructure);
    setIsMounted(true);
  }, [initialStructure]);

  if (!isMounted) {
    return (
        <div className="space-y-2">
            <div className="h-24 w-full animate-pulse rounded-lg bg-muted"></div>
            <div className="h-24 w-full animate-pulse rounded-lg bg-muted"></div>
        </div>
    );
  }

  const addPage = () => {
    const newPage: Page = {
      id: `page-new-${Date.now()}`,
      page: 'New Page',
      sections: [],
    };
    setStructure([...structure, newPage]);
  };

  const deletePage = (pageId: string) => {
    setStructure(structure.filter((p) => p.id !== pageId));
  };

  const updatePageName = (pageId: string, newName: string) => {
    setStructure(structure.map((p) => (p.id === pageId ? { ...p, page: newName } : p)));
  };

  const addSection = (pageId: string) => {
    const newStructure = structure.map((page) => {
      if (page.id === pageId) {
        const newSection = { id: `section-new-${Date.now()}`, name: 'New Section' };
        return { ...page, sections: [...page.sections, newSection] };
      }
      return page;
    });
    setStructure(newStructure);
  };

  const deleteSection = (pageId: string, sectionId: string) => {
    setStructure(
      structure.map((p) => {
        if (p.id === pageId) {
          return { ...p, sections: p.sections.filter((s) => s.id !== sectionId) };
        }
        return p;
      })
    );
  };

  const updateSectionName = (pageId: string, sectionId: string, newName: string) => {
    setStructure(
      structure.map((p) => {
        if (p.id === pageId) {
          return { ...p, sections: p.sections.map((s) => (s.id === sectionId ? { ...s, name: newName } : s)) };
        }
        return p;
      })
    );
  };

  const handlePageReorder = (newOrder: Page[]) => {
    setStructure(newOrder);
  };
  
  const handleSectionReorder = (pageId: string, newOrder: Section[]) => {
    setStructure(
      structure.map((p) => {
        if (p.id === pageId) {
          return { ...p, sections: newOrder };
        }
        return p;
      })
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex justify-end mb-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant={isReordering ? 'secondary' : 'ghost'} size="sm" onClick={() => setIsReordering(!isReordering)}>
                        <Shuffle size={16} className="mr-2"/>
                        {isReordering ? 'Done' : 'Reorder'}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Toggle drag & drop mode</p>
                </TooltipContent>
            </Tooltip>
        </div>

        <Reorder.Group
          values={structure}
          onReorder={handlePageReorder}
          as="div"
          className="space-y-2"
          disabled={!isReordering}
        >
          {structure.map((item) => (
            <Reorder.Item key={item.id} value={item}>
                <Card className="bg-muted/40 group/page">
                  <CardContent className="p-2">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className={cn("cursor-grab", isReordering ? "":"hidden")}>
                         <GripVertical size={20} className="text-muted-foreground" />
                      </Button>
                      <div className="bg-primary/10 text-primary p-2 rounded-md">
                        <File size={20} />
                      </div>
                      <Input
                        value={item.page}
                        onChange={(e) => updatePageName(item.id, e.target.value)}
                        className="font-medium bg-transparent border-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      <div className="flex items-center opacity-0 group-hover/page:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => addSection(item.id)}>
                                <Plus size={16} />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Add Section</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deletePage(item.id)}>
                                <Trash2 size={16} />
                              </Button>
                          </TooltipTrigger>
                           <TooltipContent><p>Delete Page</p></TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    {item.sections.length > 0 && (
                      <div className="ml-10 mt-2 pl-2 border-l border-border">
                        <Reorder.Group 
                            values={item.sections} 
                            onReorder={(newOrder) => handleSectionReorder(item.id, newOrder)}
                            as="div"
                            className="space-y-1"
                            disabled={!isReordering}
                        >
                            {item.sections.map((section) => (
                                <Reorder.Item key={section.id} value={section}>
                                    <div className="flex items-center gap-2 group/section">
                                        <Button variant="ghost" size="icon" className={cn("w-8 h-8 cursor-grab", isReordering ? "":"hidden")}>
                                            <GripVertical size={14} className="text-muted-foreground"/>
                                        </Button>
                                        <Input
                                        value={section.name}
                                        onChange={(e) => updateSectionName(item.id, section.id, e.target.value)}
                                        className="h-8 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                        <div className="flex items-center opacity-0 group-hover/section:opacity-100 transition-opacity">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive w-8 h-8" onClick={() => deleteSection(item.id, section.id)}>
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent><p>Delete Section</p></TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                      </div>
                    )}
                  </CardContent>
                </Card>
            </Reorder.Item>
          ))}
        </Reorder.Group>
        
        <Button onClick={addPage} variant="outline" className="w-full">
          <Plus size={16} className="mr-2" /> Add Page
        </Button>
      </div>
    </TooltipProvider>
  );
}
