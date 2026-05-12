import { auth, signInWithGoogle, signOut } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Search, Image as ImageIcon, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NavbarProps {
  onSearch: (query: string) => void;
  onMenuClick: () => void;
}

export function Navbar({ onSearch, onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden text-neutral-400" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white hidden sm:block">Lumina</span>
          </div>
        </div>

        <div className="flex-1 max-w-md relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input 
            className="pl-10 bg-neutral-900 border-neutral-800 rounded-full h-10 w-full text-neutral-200 focus-visible:ring-indigo-500 placeholder:text-neutral-500" 
            placeholder="Search your photos..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-white leading-none">{user.displayName}</span>
                <span className="text-xs text-neutral-500">{user.email}</span>
              </div>
              <img 
                src={user.photoURL || ''} 
                alt={user.displayName || 'User'} 
                className="h-9 w-9 rounded-full border border-neutral-800 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <Button variant="ghost" size="icon" onClick={signOut} className="text-neutral-400 hover:text-white">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button onClick={signInWithGoogle} className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
