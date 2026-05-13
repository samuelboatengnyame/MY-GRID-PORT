/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { PhotoGrid } from '@/components/gallery/PhotoGrid';
import { UploadDialog } from '@/components/gallery/UploadDialog';
import { PhotoDetailDialog } from '@/components/gallery/PhotoDetailDialog';
import { subscribeToPhotos, subscribeToAlbums } from '@/services/photoService';
import { Photo, Album } from '@/types';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { LogIn, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const unsubscribePhotos = subscribeToPhotos((data) => {
        setPhotos(data);
        setIsLoading(false);
      });
      const unsubscribeAlbums = subscribeToAlbums((data) => {
        setAlbums(data);
      });
      return () => {
        unsubscribePhotos();
        unsubscribeAlbums();
      };
    } else {
      setPhotos([]);
      setAlbums([]);
      setIsLoading(false);
    }
  }, [user]);

  const filteredPhotos = useMemo(() => {
    let result = photos;
    
    if (activeTab === 'favorites') {
      result = result.filter(p => p.isFavorite);
    } else if (activeTab === 'recent') {
      // Already sorted by date in query, maybe just limit?
      result = result.slice(0, 20);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [photos, activeTab, searchQuery]);

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neutral-50">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-100"
        >
          <Sparkles className="h-10 w-10 text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar onSearch={setSearchQuery} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        {user ? (
          <>
            <Sidebar 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              onUploadClick={() => setUploadDialogOpen(true)}
              className={`${isSidebarOpen ? 'fixed inset-y-0 left-0 z-40 transform translate-x-0' : 'fixed inset-y-0 left-0 z-40 transform -translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 shadow-xl md:shadow-none bg-neutral-900 border-r border-neutral-800`}
            />
            
            <main className="flex-1 overflow-y-auto bg-neutral-950 scroll-smooth">
              <div className="max-w-screen-2xl mx-auto">
                <header className="px-6 pt-8 pb-2">
                  <div className="flex items-end justify-between">
                    <div>
                      <h1 className="text-3xl font-display font-bold tracking-tight text-white capitalize">
                        {activeTab === 'gallery' ? 'Discovery' : activeTab}
                      </h1>
                      <p className="text-neutral-500 mt-1">
                        {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'} in this view
                      </p>
                    </div>
                  </div>
                </header>

                <PhotoGrid 
                  photos={filteredPhotos} 
                  onPhotoClick={setSelectedPhoto} 
                  isLoading={isLoading} 
                />
              </div>
            </main>

            <UploadDialog 
              open={uploadDialogOpen} 
              onOpenChange={setUploadDialogOpen} 
            />
            
            <PhotoDetailDialog 
              photo={selectedPhoto}
              open={!!selectedPhoto}
              onOpenChange={() => setSelectedPhoto(null)}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-[2px]" />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-neutral-900 border border-neutral-800 p-8 sm:p-12 rounded-[40px] shadow-2xl max-w-lg w-full text-center"
            >
              <div className="bg-indigo-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Sparkles className="h-10 w-10 text-indigo-400" />
              </div>
              <h1 className="text-4xl font-display font-bold text-white mb-4 leading-tight">Your memories, <br/>beautifully organized.</h1>
              <p className="text-neutral-400 mb-10 text-lg leading-relaxed">
                Join Lumina to upload, organize, and share your favorite photos in a stunning, minimalist dark gallery.
              </p>
              <Button 
                onClick={signInWithGoogle} 
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white h-14 text-lg font-bold shadow-lg shadow-indigo-600/20 gap-3 border border-indigo-400/20"
              >
                <LogIn className="h-5 w-5" />
                Sign in with Google
              </Button>
            </motion.div>
          </div>
        )}
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}

