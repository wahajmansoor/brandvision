'use client';

import { useState, useEffect, useCallback } from 'react';
import { File, Plus, Trash2, GripVertical, Shuffle, CornerDownRight, Folder, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Reorder, useReorderItem } from '@/components/ui/reorder';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export type StructureItem = {
  id: string;
  name: string;
  type: 'page' | 'section';
  children?: StructureItem[];
};

interface SiteStructureProps {
  initialStructure: { page: string; sections: string[] }[];
  onStructureChange: (structure: StructureItem[]) => void;
}

function NodeItem({
  item,
  level = 0,
  isReordering,
  updateItemName,
  deleteItem,
  addItem,
  handleReorder,
}: {
  item: StructureItem;
  level?: number;
  isReordering: boolean;
  updateItemName: (itemId: string, newName: string) => void;
  deleteItem: (itemId: string) => void;
  addItem: (parentId: string, type: 'page' | 'section') => void;
  handleReorder: (parentId: string | null, newOrder: StructureItem[]) => void;
}) {
  const { dragControls, isDragging } = useReorderItem();
  const [isOpen, setIsOpen] = useState(true);

  const canHaveChildren = item.type === 'page';
  const hasChildren = canHaveChildren && item.children && item.children.length > 0;

  const itemIcon =
    item.type === 'page' ? (
      hasChildren ? (
        isOpen ? <FolderOpen size={18} /> : <Folder size={18} />
      ) : (
        <File size={18} />
      )
    ) : (
      <CornerDownRight size={14} className="ml-1" />
    );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("flex items-center gap-2 group/item", isDragging && "opacity-50", level > 0 && "pl-4")}>
        <Button variant="ghost" size="icon" className={cn("w-8 h-8 cursor-grab", isReordering ? "" : "hidden")} onPointerDown={(e) => dragControls.start(e)}>
          <GripVertical size={16} className="text-muted-foreground" />
        </Button>
        
        <CollapsibleTrigger asChild disabled={!canHaveChildren}>
          <div className={cn('flex items-center gap-2 flex-grow', { 'cursor-pointer': canHaveChildren })}>
            <div className={cn("p-1.5 rounded-md", item.type === 'page' ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}>{itemIcon}</div>
            <Badge variant={item.type === 'page' ? 'secondary' : 'outline'} className="border-dashed h-6">{item.type}</Badge>
            <Input
              value={item.name}
              onChange={(e) => updateItemName(item.id, e.target.value)}
              className="h-9 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
            />
          </div>
        </CollapsibleTrigger>
        
        <div className="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
          {item.type === 'page' && (
            <>
            <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { addItem(item.id, 'section'); setIsOpen(true); }}>
                    <Plus size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Add Section</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { addItem(item.id, 'page'); setIsOpen(true); }}>
                    <File size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Add Sub-page</p></TooltipContent>
              </Tooltip>
            </>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive w-8 h-8" onClick={() => deleteItem(item.id)}>
                <Trash2 size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Delete {item.type}</p></TooltipContent>
          </Tooltip>
        </div>
      </div>
      {hasChildren && (
        <CollapsibleContent>
            <div className="ml-5 pl-4 border-l border-border">
                <Reorder value={item.children!} onReorder={(newOrder) => handleReorder(item.id, newOrder)} className="space-y-1 py-1">
                    {item.children!.map((child) => (
                        <Reorder.Item key={child.id} value={child}>
                            <NodeItem
                                item={child}
                                level={level + 1}
                                isReordering={isReordering}
                                updateItemName={updateItemName}
                                deleteItem={deleteItem}
                                addItem={addItem}
                                handleReorder={handleReorder}
                            />
                        </Reorder.Item>
                    ))}
                </Reorder>
            </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export function SiteStructure({ initialStructure, onStructureChange }: SiteStructureProps) {
  const [structure, setStructure] = useState<StructureItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    const transformedStructure = (initialStructure || []).map((item, index) => ({
      id: `page-${index}-${Date.now()}`,
      name: item.page,
      type: 'page' as const,
      children: (item.sections || []).map((section, sIndex) => ({
        id: `section-${index}-${sIndex}-${Date.now()}`,
        name: section,
        type: 'section' as const,
      })),
    }));
    setStructure(transformedStructure);
    setIsMounted(true);
  }, [initialStructure]);
  
  useEffect(() => {
    if (isMounted) {
      onStructureChange(structure);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structure, isMounted]);

  if (!isMounted) {
    return (
        <div className="space-y-2">
            <div className="h-24 w-full animate-pulse rounded-lg bg-muted"></div>
            <div className="h-24 w-full animate-pulse rounded-lg bg-muted"></div>
        </div>
    );
  }
  
  const addItem = (parentId: string | null, type: 'page' | 'section') => {
    const newItem: StructureItem = {
      id: `${type}-new-${Date.now()}`,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type,
      ...(type === 'page' && { children: [] }),
    };

    if (parentId === null) {
      setStructure(prev => [...prev, newItem]);
    } else {
      setStructure(prev => {
        const updateChildren = (items: StructureItem[]): StructureItem[] => {
            return items.map(item => {
                if (item.id === parentId) {
                    return { ...item, children: [...(item.children || []), newItem] };
                }
                if (item.children) {
                    return { ...item, children: updateChildren(item.children) };
                }
                return item;
            });
        };
        return updateChildren(prev);
      });
    }
  };

  const deleteItem = (itemId: string) => {
    const removeItem = (items: StructureItem[]): StructureItem[] => {
        return items.filter(item => item.id !== itemId).map(item => {
            if (item.children) {
                return { ...item, children: removeItem(item.children) };
            }
            return item;
        });
    };
    setStructure(removeItem);
  };
  
  const updateItemName = (itemId: string, newName: string) => {
     const update = (items: StructureItem[]): StructureItem[] => {
        return items.map(item => {
            if (item.id === itemId) {
                return { ...item, name: newName };
            }
            if (item.children) {
                return { ...item, children: update(item.children) };
            }
            return item;
        });
    };
    setStructure(update);
  };

  const handleReorder = (parentId: string | null, newOrder: StructureItem[]) => {
    if (parentId === null) {
      setStructure(newOrder);
    } else {
       const reorderChildren = (items: StructureItem[]): StructureItem[] => {
        return items.map(item => {
            if (item.id === parentId) {
                return {...item, children: newOrder};
            }
            if (item.children) {
                return { ...item, children: reorderChildren(item.children) };
            }
            return item;
        });
      };
      setStructure(reorderChildren);
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-end mb-4">
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

          <div className="space-y-2">
            <Reorder value={structure} onReorder={(newOrder) => handleReorder(null, newOrder)} className="space-y-2">
                {structure.map((item) => (
                    <Reorder.Item key={item.id} value={item}>
                        <NodeItem 
                            item={item}
                            isReordering={isReordering}
                            updateItemName={updateItemName}
                            deleteItem={deleteItem}
                            addItem={addItem}
                            handleReorder={handleReorder}
                        />
                    </Reorder.Item>
                ))}
            </Reorder>
          </div>
          
          <Button onClick={() => addItem(null, 'page')} variant="outline" className="w-full mt-4">
            <Plus size={16} className="mr-2" /> Add Page
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
