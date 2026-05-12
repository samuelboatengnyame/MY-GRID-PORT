import { Button } from '@/components/ui/button';
import { 
  Image as ImageIcon, 
  FolderHeart, 
  Settings, 
  Star, 
  Clock, 
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
  onUploadClick: () => void;
}

const navItems = [
  { id: 'gallery', label: 'All Photos', icon: ImageIcon },
  { id: 'albums', label: 'Albums', icon: FolderHeart },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'recent', label: 'Recent', icon: Clock },
];

export function Sidebar({ activeTab, onTabChange, className, onUploadClick }: SidebarProps) {
  return (
    <aside className={cn("flex flex-col w-64 border-r border-neutral-800 bg-neutral-900/50 h-[calc(100vh-64px)] overflow-y-auto backdrop-blur-sm", className)}>
      <div className="p-4 flex flex-col gap-1">
        <Button 
          onClick={onUploadClick}
          className="mb-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-12 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="mr-2 h-5 w-5" />
          Upload Photo
        </Button>

        <p className="px-3 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Library</p>
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "justify-start gap-3 h-11 rounded-xl px-3 transition-all",
              activeTab === item.id 
                ? "bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20" 
                : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
            )}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-indigo-400" : "text-neutral-500")} />
            <span className="font-medium text-sm">{item.label}</span>
          </Button>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-neutral-800/50">
        <div className="mb-4 p-4 bg-neutral-800/40 rounded-xl border border-neutral-800">
           <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Storage</span>
             <span className="text-[10px] text-neutral-500 font-mono">1.2/10 GB</span>
           </div>
           <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
             <div className="w-[12%] h-full bg-indigo-500 rounded-full" />
           </div>
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl px-3 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50">
          <Settings className="h-4 w-4 text-neutral-500" />
          <span className="font-medium text-sm">Settings</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl px-3 text-red-400/80 hover:text-red-400 hover:bg-red-950/30 mt-1">
          <Trash2 className="h-4 w-4" />
          <span className="font-medium text-sm">Bin</span>
        </Button>
      </div>
    </aside>
  );
}
