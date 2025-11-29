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
import { UploadCloud, File as FileIcon, Loader2, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Combobox } from './ui/combobox';
import Image from 'next/image';

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
  industry: z.string().optional(),
  location: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface BrandKitFormProps {
  onSubmit: (data: FormValues, file?: File) => void;
  isLoading: boolean;
}

export function BrandKitForm({ onSubmit, isLoading }: BrandKitFormProps) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // cleanup
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

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
      setFile(files[0]);
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
      setFile(files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.files = files;
      }
    }
  }

  function clearFile() {
    setFile(undefined);
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
        <form onSubmit={form.handleSubmit((data) => onSubmit(data, file))} className="space-y-6">
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Logo <span className="text-muted-foreground/80">(Optional)</span></FormLabel>
            {!file ? (
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
                      <UploadCloud className={`w-8 h-8 mb-3 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="mb-1 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">Upload a file</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
                    </div>
                    <Input id="logo-upload" type="file" className="hidden" accept=".png,.jpg,.jpeg,.svg" onChange={handleFileChange} ref={fileInputRef} />
                  </label>
                </FormControl>
            ) : (
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground border rounded-lg p-2 bg-card">
                 {previewUrl && (
                    <Image
                      src={previewUrl}
                      alt="Logo preview"
                      width={40}
                      height={40}
                      className="object-contain rounded-md bg-muted/50 p-1"
                    />
                  )}
                <div className="flex-grow min-w-0">
                  <p className="truncate font-medium text-foreground">{file.name}</p>
                  <p className="text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={clearFile} className="w-8 h-8 flex-shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </FormItem>

          <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-light rounded-full">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Brand Kit'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
