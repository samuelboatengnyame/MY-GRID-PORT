import React, { useState, useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Globe, UploadCloud, Link, Loader2 } from 'lucide-react';
import { addPhoto } from '@/services/photoService';
import { toast } from 'sonner';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [method, setMethod] = useState<'upload' | 'link'>('upload');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) {
        toast.error('File size exceeds 4MB limit');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 4 * 1024 * 1024
  } as any);

  const handleUpload = async () => {
    if (method === 'upload' && !preview) return;
    if (method === 'link' && !url) return;

    setUploading(true);
    try {
      const sourceUrl = method === 'upload' ? preview! : url;
      
      // Load image to get dimensions and for canvas processing
      const img = new Image();
      img.src = sourceUrl;
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Image load timed out')), 15000);
        img.onload = () => {
          clearTimeout(timeout);
          resolve(null);
        };
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Failed to load image. If using a URL, it might be blocked by its source.'));
        };
      });

      let finalUrlToStore = sourceUrl;
      let finalWidth = img.width;
      let finalHeight = img.height;

      // Robust compression for local uploads or large URLs
      if (sourceUrl.startsWith('data:') || sourceUrl.length > 1000000) {
        const MAX_DIMENSION = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not create canvas context');
        ctx.drawImage(img, 0, 0, width, height);

        // Quality compression loop
        let quality = 0.9;
        const MAX_BYTES = 1048487; // User specified limit
        
        finalUrlToStore = canvas.toDataURL('image/jpeg', quality);
        
        while (finalUrlToStore.length > MAX_BYTES && quality > 0.1) {
          quality -= 0.1;
          finalUrlToStore = canvas.toDataURL('image/jpeg', quality);
        }

        if (finalUrlToStore.length > MAX_BYTES) {
          // One last attempt at very low quality
          finalUrlToStore = canvas.toDataURL('image/jpeg', 0.05);
          if (finalUrlToStore.length > MAX_BYTES) {
            throw new Error('Image is too complex to compress under 1MB. Please try a smaller or simpler image.');
          }
        }

        finalWidth = width;
        finalHeight = height;
      }

      await addPhoto({
        url: finalUrlToStore,
        title: title || (file?.name ? file.name.split('.')[0] : 'Untitled'),
        description,
        width: Math.round(finalWidth),
        height: Math.round(finalHeight),
        isFavorite: false,
        albumId: null // Support for albums can be added here
      });

      toast.success('Photo uploaded successfully');
      setFile(null);
      setPreview(null);
      setUrl('');
      setTitle('');
      setDescription('');
      onOpenChange(false);
    } catch (error: any) {
      console.error(error);
      const message = error.message?.includes('{') ? 'Check your internet or permissions' : (error.message || 'Failed to upload photo');
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-display font-bold">Add Photo</DialogTitle>
          <DialogDescription>Add a new memory to your gallery.</DialogDescription>
        </DialogHeader>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex p-1 bg-neutral-100 rounded-xl gap-1">
            <Button 
              className={`flex-1 h-10 rounded-lg gap-2 text-sm font-medium transition-all ${method === 'upload' ? 'bg-white shadow-sm text-indigo-600 hover:bg-white' : 'bg-transparent text-neutral-500 hover:bg-neutral-200'}`}
              variant="ghost"
              onClick={() => setMethod('upload')}
            >
              <UploadCloud className="h-4 w-4" />
              Upload File
            </Button>
            <Button 
              className={`flex-1 h-10 rounded-lg gap-2 text-sm font-medium transition-all ${method === 'link' ? 'bg-white shadow-sm text-indigo-600 hover:bg-white' : 'bg-transparent text-neutral-500 hover:bg-neutral-200'}`}
              variant="ghost"
              onClick={() => setMethod('link')}
            >
              <Link className="h-4 w-4" />
              Image URL
            </Button>
          </div>

          {method === 'upload' ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer min-h-[240px] relative overflow-hidden ${isDragActive ? 'border-indigo-400 bg-indigo-50/50' : 'border-neutral-200 hover:border-neutral-300'}`}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="absolute inset-0 group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-indigo-50 rounded-full">
                    <Upload className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-neutral-900">Click or drag images here</p>
                    <p className="text-sm text-neutral-500 mt-1">PNG, JPG, WEBP up to 1MB</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="url">Photo URL</Label>
              <Input 
                id="url" 
                placeholder="https://example.com/photo.jpg" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="rounded-xl h-12 focus-visible:ring-indigo-500"
              />
              {url && (
                <div className="mt-4 rounded-xl overflow-hidden aspect-video bg-neutral-100 border relative group">
                  <img src={url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white bg-black/40 hover:bg-black/60 rounded-full h-8 w-8" onClick={() => setUrl('')}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input 
                id="title" 
                placeholder="Enter photo title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description (Optional)</Label>
              <Input 
                id="desc" 
                placeholder="Where was this taken?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl focus-visible:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-neutral-50 border-t gap-3">
          <Button variant="ghost" className="rounded-xl font-medium" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button 
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-medium px-8 flex-1 sm:flex-none" 
            onClick={handleUpload}
            disabled={uploading || (method === 'upload' ? !file : !url)}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add to Gallery'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
