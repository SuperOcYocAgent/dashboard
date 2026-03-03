"use client";
import { Search, RefreshCw, Bell, User, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between h-full px-4 lg:px-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg lg:text-xl font-semibold text-foreground ml-10 lg:ml-0">Dashboard</h1>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 flex-1 lg:flex-none justify-end">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="w-40 lg:w-64 pl-10 bg-card border-border/50 focus:border-primary/50"
            />
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-border/50 hover:bg-muted hidden sm:flex"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden lg:inline">Refresh</span>
          </Button>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
            <Bell className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
