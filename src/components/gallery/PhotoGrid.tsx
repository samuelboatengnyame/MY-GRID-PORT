import React from 'react';
import { Photo } from '@/types';
import { PhotoCard } from './PhotoCard';
import { motion, AnimatePresence } from 'motion/react';
import { Database, ImageOff } from 'lucide-react';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  isLoading: boolean;
}

export function PhotoGrid({ photos, onPhotoClick, isLoading }: PhotoGridProps) {
  if (isLoading) {
    return (
      <div className="gallery-grid p-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-2xl bg-neutral-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-500 gap-4 p-6 text-center">
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-full">
          <ImageOff className="h-10 w-10 text-neutral-600" />
        </div>
        <div>
          <h3 className="text-xl font-display font-semibold text-white">No photos yet</h3>
          <p className="mt-1 text-neutral-500">Upload your first photo to start your gallery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div 
        layout
        className="gallery-grid"
      >
        <AnimatePresence>
          {photos.map((photo) => (
            <PhotoCard 
              key={photo.id} 
              photo={photo} 
              onClick={() => onPhotoClick(photo)} 
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
