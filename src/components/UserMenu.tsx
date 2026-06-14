'use client';

import { useState } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfileModal } from './UserProfileModal';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
  user: any;
  onLogout: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const avatarUrl = user?.user_metadata?.avatar_url;
  const name = user?.user_metadata?.full_name;
  const team = user?.user_metadata?.favorite_team;

  return (
    <>
      <div className="flex items-center gap-3">
        {team && (
          <div className="hidden md:flex items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary px-3 py-1.5 rounded-full border border-border/50">
            {team}
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center relative cursor-pointer hover:border-primary/50 transition-colors shadow-sm outline-none">
              <Avatar className="w-full h-full rounded-full">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-secondary text-muted-foreground text-xs font-bold">
                  {name ? name[0].toUpperCase() : <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-48 z-[60] rounded-xl p-2 border-border/50 shadow-lg bg-background">
            <DropdownMenuLabel className="font-semibold uppercase tracking-tighter text-[10px] text-muted-foreground truncate px-2 pb-2">
              {name || user.email}
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-border/50" />
            
            <DropdownMenuItem 
              className="cursor-pointer font-bold uppercase text-xs h-8 rounded-md mt-1 mb-1 focus:bg-secondary/50 focus:text-foreground"
              onSelect={(e) => {
                // Abre o modal após um micro-atraso para garantir que o Dropdown limpou o lock da tela
                setTimeout(() => setIsModalOpen(true), 50);
              }}
            >
              <Settings className="w-3 h-3 mr-2" />
              Meu Perfil
            </DropdownMenuItem>
            
            <form action={onLogout}>
              <button type="submit" className="w-full">
                <DropdownMenuItem className="cursor-pointer font-bold uppercase text-xs h-8 rounded-md text-destructive focus:text-destructive focus:bg-destructive/10 w-full">
                  <LogOut className="w-3 h-3 mr-2" />
                  Sair
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <UserProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={user} 
      />
    </>
  );
}
