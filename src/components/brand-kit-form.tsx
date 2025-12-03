'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Combobox } from './ui/combobox';
import Image from 'next/image';
import ColorThief from 'colorthief';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const industries = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Education', value: 'Education' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Hospitality', value: 'Hospitality' },
  { label: 'Real Estate', value: 'Real Estate' },
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Entertainment', value: 'Entertainment' },
  { label: 'Non-profit', value: 'Non-profit' },
];

const formSchema = z.object({
  businessName: z.string().min(2, {
    message: 'Business name must be at least 2 characters.',
  }),
  businessDescription: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  logo: z.any().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface BrandKitFormProps {
  onSubmit: (data: FormValues, resizedLogoDataUri?: string, colors?: string[]) => void;
  isLoading: boolean;
}

function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (c: number) => `0${c.toString(16)}`.slice(-2);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


function LogoUploadDisplay({
  previewUrl,
  clearFile,
  onColorsExtracted,
}: {
  previewUrl: string;
  clearFile: () => void;
  onColorsExtracted: (colors: string[]) => void;
}) {
  const [colors, setColors] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const extractColors = () => {
      if (imgRef.current && imgRef.current.complete) {
        try {
          const colorThief = new ColorThief();
          const dominantColor = colorThief.getColor(imgRef.current);
          const palette = colorThief.getPalette(imgRef.current, 5);

          const allColors = [dominantColor, ...palette];
          
          const uniqueHexColors = [...new Set(allColors.map(rgb => rgbToHex(rgb[0], rgb[1], rgb[2])))];

          setColors(uniqueHexColors);
          onColorsExtracted(uniqueHexColors);
        } catch (error) {
          console.error('Error extracting colors:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    const imageElement = imgRef.current;
    if (imageElement) {
        imageElement.addEventListener('load', extractColors);
        if (imageElement.complete) {
            extractColors();
        }
        return () => {
            imageElement.removeEventListener('load', extractColors);
        };
    }
  }, [previewUrl, onColorsExtracted]);

  return (
    <div className="w-full space-y-4 p-4 border-2 border-dashed rounded-lg bg-muted/50">
        <div className="flex flex-col items-center justify-center w-full">
            <Image
                ref={imgRef}
                src={previewUrl}
                alt="Uploaded logo"
                width={128}
                height={128}
                className="max-h-24 w-auto object-contain rounded-md"
                crossOrigin="anonymous" 
            />
        </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground text-center">Extracted Logo Colors:</p>
        {loading && (
          <div className="flex justify-center gap-2 mt-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        )}
        {colors && (
          <div className="flex justify-center gap-2 flex-wrap mt-2">
            {colors.map((color, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full border-2 border-white/20 shadow"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={clearFile} className="w-full">
        <X className="w-4 h-4 mr-2" />
        Remove Logo
      </Button>
    </div>
  );
}

export function BrandKitForm({ onSubmit, isLoading }: BrandKitFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resizedDataUri, setResizedDataUri] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[] | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resizeAndCompressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onerror = reject;
        reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target?.result as string;
            img.onerror = reject;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 512;
                const MAX_HEIGHT = 512;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));
                
                ctx.drawImage(img, 0, 0, width, height);

                // Use JPEG for better compression of photos, with a quality setting.
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                resolve(dataUrl);
            };
        };
    });
  }, []);

  const processFile = useCallback(async (file: File | undefined) => {
    if (!file) {
      setPreviewUrl(null);
      setResizedDataUri(undefined);
      setExtractedColors(undefined);
      form.setValue('logo', undefined);
      return;
    }

    // Validate file type and size
    const acceptedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Please upload a PNG, JPG, or SVG file.", variant: "destructive" });
        return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({ title: "File Too Large", description: "Please upload a file smaller than 5MB.", variant: "destructive" });
        return;
    }

    form.setValue('logo', file);

    try {
        const resizedUri = await resizeAndCompressImage(file);
        setResizedDataUri(resizedUri);
        setPreviewUrl(resizedUri); // Show the resized image as preview
    } catch (error) {
        console.error("Image processing failed:", error);
        toast({ title: "Image Processing Failed", description: "Could not process the uploaded logo. Please try a different image.", variant: "destructive" });
        clearFile();
    }
  }, [form, resizeAndCompressImage, toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: '',
      businessDescription: '',
      industry: '',
      location: '',
    },
  });

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }

  function handleDragEnter(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.files = files;
      }
    }
  }

  function clearFile() {
    setPreviewUrl(null);
    setResizedDataUri(undefined);
    setExtractedColors(undefined);
    form.setValue('logo', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Create Your Brand</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your business details below to generate a complete visual identity in seconds.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => onSubmit(data, resizedDataUri, extractedColors))} className="space-y-6">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Acme Inc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="businessDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Your Business</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what you do, your values, and your target audience..."
                    className="resize-none h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo"
            render={() => (
              <FormItem>
                <FormLabel>Logo <span className="text-muted-foreground/80">(Optional)</span></FormLabel>
                {!previewUrl ? (
                    <FormControl>
                      <label
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 transition-colors ${
                          isDragging ? 'border-primary' : 'border-input'
                        }`}
                        htmlFor="logo-upload"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <p className="mb-1 text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">Upload a file</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
                        </div>
                        <Input id="logo-upload" type="file" className="hidden" accept=".png,.jpg,.jpeg,.svg,.webp" onChange={handleFileChange} ref={fileInputRef} />
                      </label>
                    </FormControl>
                ) : (
                  <LogoUploadDisplay previewUrl={previewUrl} clearFile={clearFile} onColorsExtracted={setExtractedColors} />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Industry <span className="text-muted-foreground/80">(Optional)</span></FormLabel>
                <Combobox
                  options={industries}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select or Type your Industry"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location <span className="text-muted-foreground/80">(Optional)</span></FormLabel>
                <FormControl>
                  <Input {...field} placeholder="City, Country" />
                </FormControl>
                <FormDescription>
                  If you add the location you will get best competitor websites
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          

          <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-light rounded-full">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Brand Kit'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
