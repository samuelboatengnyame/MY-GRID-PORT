import React, { useState } from 'react';
import { Photo } from '@/types';
import { motion } from 'motion/react';
import { Star, Heart, MoreVertical, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updatePhoto } from '@/services/photoService';

interface PhotoCardProps {
  photo: Photo;
  onClick: () => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await updatePhoto(photo.id, { isFavorite: !photo.isFavorite });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="group relative aspect-[4/3] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 border border-neutral-800 hover:border-neutral-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <img
        src={photo.url}
        alt={photo.title || 'Gallery image'}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      
      {/* Overlay */}
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-3 right-3 flex gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className={`h-9 w-9 rounded-full glass ${photo.isFavorite ? 'text-rose-500' : 'text-white'}`}
            onClick={toggleFavorite}
          >
            <Heart className={`h-5 w-5 ${photo.isFavorite ? 'fill-current' : ''}`} />
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full glass text-white">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
          <div className="max-w-[70%]">
            <h4 className="font-medium truncate text-sm sm:text-base">{photo.title || 'Untitled'}</h4>
            {photo.description && (
              <p className="text-xs opacity-80 truncate hidden sm:block">{photo.description}</p>
            )}
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full glass text-white shrink-0">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
