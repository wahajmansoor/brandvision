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
import { UploadCloud, File as FileIcon, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';

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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: 'Acme Studio',
      businessDescription: '',
      industry: 'Technology',
      location: 'City, Country',
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
    <div className="w-full max-w-lg">
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
                  <Input {...field} />
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
              <FormItem>
                <FormLabel>Industry <span className="text-muted-foreground/80">(Optional)</span></FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Logo</FormLabel>
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
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground border rounded-md p-2 bg-card">
                <FileIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate flex-grow">{file.name}</span>
                <button type="button" onClick={clearFile} className="ml-2 text-destructive hover:text-destructive/80 font-bold">&times;</button>
              </div>
            )}
          </FormItem>

          <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-semibold">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Generate Brand Kit'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
