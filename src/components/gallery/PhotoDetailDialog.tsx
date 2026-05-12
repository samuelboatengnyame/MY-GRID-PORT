import { Photo } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Trash2, 
  Download, 
  Info, 
  X, 
  Calendar, 
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Share2,
  Clock
} from 'lucide-react';
import { deletePhoto, updatePhoto } from '@/services/photoService';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import React from 'react';

interface PhotoDetailDialogProps {
  photo: Photo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function PhotoDetailDialog({ photo, open, onOpenChange, onNext, onPrev }: PhotoDetailDialogProps) {
  if (!photo) return null;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await deletePhoto(photo.id);
        toast.success('Photo deleted');
        onOpenChange(false);
      } catch (error) {
        toast.error('Failed to delete photo');
      }
    }
  };

  const toggleFavorite = async () => {
    try {
      await updatePhoto(photo.id, { isFavorite: !photo.isFavorite });
    } catch (error) {
      toast.error('Failed to update photo');
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.title || 'photo';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-fit h-fit max-h-[95vh] p-0 border-none bg-transparent shadow-none overflow-visible flex items-center justify-center">
        <div className="relative flex flex-col md:flex-row max-w-[1200px] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-neutral-800">
          {/* Main Image Area */}
          <div className="relative bg-black flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-[500px] md:w-[70vw] lg:w-[800px]">
            <img 
              src={photo.url} 
              alt={photo.title || 'Gallery image'} 
              className="max-w-full max-h-[70vh] md:max-h-[85vh] object-contain"
              referrerPolicy="no-referrer"
            />
            
            {/* Navigation (Mockup) */}
            <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-full glass text-white pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40"
                onClick={onPrev}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-12 w-12 rounded-full glass text-white pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40"
                onClick={onNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>

            {/* Mobile Controls Overlay */}
            <div className="absolute top-4 right-4 md:hidden flex gap-2">
              <Button variant="ghost" size="icon" className="glass h-10 w-10 text-white rounded-full" onClick={() => onOpenChange(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-[350px] p-6 flex flex-col gap-6 bg-neutral-900 text-neutral-200 overflow-y-auto max-h-[40vh] md:max-h-[85vh]">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-display font-bold leading-tight text-white">{photo.title || 'Untitled'}</h3>
              <div className="flex gap-2 shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-10 w-10 rounded-full ${photo.isFavorite ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20' : 'text-neutral-500 hover:bg-neutral-800'}`}
                  onClick={toggleFavorite}
                >
                  <Heart className={`h-5 w-5 ${photo.isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-neutral-400 hover:bg-neutral-800" onClick={downloadImage}>
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {photo.description && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Description</p>
                <p className="text-neutral-400 italic">"{photo.description}"</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 border-t border-neutral-800 pt-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Date Added
                </p>
                <p className="text-sm font-medium text-neutral-300">{photo.createdAt?.toDate().toLocaleDateString() || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Maximize2 className="h-3 w-3" />
                  Dimensions
                </p>
                <p className="text-sm font-medium text-neutral-300">{photo.width} × {photo.height}</p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-neutral-800 flex items-center gap-2">
              <Button variant="outline" className="flex-1 rounded-xl gap-2 font-medium border-neutral-800 hover:bg-neutral-800 text-neutral-300">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="ghost" className="h-10 w-10 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 p-0" onClick={handleDelete}>
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
