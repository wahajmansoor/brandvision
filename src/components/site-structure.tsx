'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from 'react-beautiful-dnd';
import { GripVertical, File, Plus, Trash2, Grip } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

type SiteItem = {
  id: string;
  page: string;
  sections: { id: string; name: string }[];
};

interface SiteStructureProps {
  initialStructure: { page: string; sections: string[] }[];
}

export function SiteStructure({ initialStructure }: SiteStructureProps) {
  const [structure, setStructure] = useState<SiteItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const transformedStructure = initialStructure.map((item, index) => ({
      id: `page-${index}-${Date.now()}`,
      page: item.page,
      sections: item.sections.map((section, sIndex) => ({
        id: `section-${index}-${sIndex}-${Date.now()}`,
        name: section,
      })),
    }));
    setStructure(transformedStructure);
  }, [initialStructure]);

  const onDragEnd: OnDragEndResponder = (result) => {
    const { source, destination, type } = result;

    if (!destination) {
      return;
    }

    const newStructure = Array.from(structure);

    if (type === 'PAGES') {
      const [reorderedItem] = newStructure.splice(source.index, 1);
      newStructure.splice(destination.index, 0, reorderedItem);
      setStructure(newStructure);
    } else { // SECTIONS
      const sourceDroppableId = source.droppableId;
      const destinationDroppableId = destination.droppableId;
      
      const sourcePageIndex = newStructure.findIndex(p => p.id === sourceDroppableId);
      const destPageIndex = newStructure.findIndex(p => p.id === destinationDroppableId);

      if (sourcePageIndex === -1 || destPageIndex === -1) return;

      const sourcePage = newStructure[sourcePageIndex];
      
      if (sourceDroppableId === destinationDroppableId) {
        // Reordering within the same page
        const newSections = Array.from(sourcePage.sections);
        const [reorderedSection] = newSections.splice(source.index, 1);
        newSections.splice(destination.index, 0, reorderedSection);
        
        newStructure[sourcePageIndex] = { ...sourcePage, sections: newSections };
        setStructure(newStructure);
      } else {
        // Moving section to a different page
        const destPage = newStructure[destPageIndex];
        const sourceSections = Array.from(sourcePage.sections);
        const destSections = Array.from(destPage.sections);

        const [movedSection] = sourceSections.splice(source.index, 1);
        destSections.splice(destination.index, 0, movedSection);

        newStructure[sourcePageIndex] = { ...sourcePage, sections: sourceSections };
        newStructure[destPageIndex] = { ...destPage, sections: destSections };
        setStructure(newStructure);
      }
    }
  };

  const addPage = () => {
    const newPage: SiteItem = {
      id: `page-new-${Date.now()}`,
      page: 'New Page',
      sections: [],
    };
    setStructure([...structure, newPage]);
  };

  const deletePage = (pageId: string) => {
    setStructure(structure.filter(p => p.id !== pageId));
  };
  
  const updatePageName = (pageId: string, newName: string) => {
    setStructure(structure.map(p => p.id === pageId ? { ...p, page: newName } : p));
  }

  const addSection = (pageId: string) => {
    const newStructure = structure.map(page => {
      if (page.id === pageId) {
        const newSection = { id: `section-new-${Date.now()}`, name: 'New Section' };
        return { ...page, sections: [...page.sections, newSection] };
      }
      return page;
    });
    setStructure(newStructure);
  };
  
  const deleteSection = (pageId: string, sectionId: string) => {
    setStructure(structure.map(p => {
      if (p.id === pageId) {
        return { ...p, sections: p.sections.filter(s => s.id !== sectionId) };
      }
      return p;
    }));
  }

  const updateSectionName = (pageId: string, sectionId: string, newName: string) => {
     setStructure(structure.map(p => {
      if (p.id === pageId) {
        return { ...p, sections: p.sections.map(s => s.id === sectionId ? { ...s, name: newName } : s) };
      }
      return p;
    }));
  }

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-2">
          <Droppable droppableId="all-pages" type="PAGES">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {structure.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps}>
                        <Card className="bg-muted/40">
                          <CardContent className="p-2">
                            <div className="flex items-center gap-2">
                              <span {...provided.dragHandleProps} className="cursor-grab text-muted-foreground">
                                <GripVertical size={20} />
                              </span>
                               <div className="bg-primary/10 text-primary p-2 rounded-md">
                                  <File size={20} />
                              </div>
                              <Input 
                                value={item.page} 
                                onChange={(e) => updatePageName(item.id, e.target.value)}
                                className="font-medium bg-transparent border-none focus-visible:ring-1 focus-visible:ring-ring" 
                              />
                              <Button variant="ghost" size="icon" onClick={() => addSection(item.id)}><Plus size={16}/></Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deletePage(item.id)}><Trash2 size={16}/></Button>
                            </div>
                            {item.sections.length > 0 && (
                              <div className="ml-8 mt-2">
                                  <Droppable droppableId={item.id} type="SECTIONS">
                                      {(provided) => (
                                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
                                              {item.sections.map((section, sIndex) => (
                                                  <Draggable key={section.id} draggableId={section.id} index={sIndex}>
                                                      {(provided) => (
                                                           <div ref={provided.innerRef} {...provided.draggableProps}>
                                                              <div className="flex items-center gap-2 p-1 bg-background/50 rounded-md">
                                                                  <span {...provided.dragHandleProps} className="cursor-grab text-muted-foreground">
                                                                      <Grip size={16}/>
                                                                  </span>
                                                                  <Input 
                                                                      value={section.name} 
                                                                      onChange={(e) => updateSectionName(item.id, section.id, e.target.value)}
                                                                      className="h-8 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-ring"
                                                                  />
                                                                  <Button variant="ghost" size="icon" className="text-destructive w-8 h-8" onClick={() => deleteSection(item.id, section.id)}><Trash2 size={14}/></Button>
                                                              </div>
                                                          </div>
                                                      )}
                                                  </Draggable>
                                              ))}
                                              {provided.placeholder}
                                          </div>
                                      )}
                                  </Droppable>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Button onClick={addPage} variant="outline" className="w-full">
            <Plus size={16} className="mr-2" /> Add Page
          </Button>
        </div>
      </DragDropContext>
    </div>
  );
}
