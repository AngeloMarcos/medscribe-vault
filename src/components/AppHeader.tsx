import { useState } from "react";
import { Search, Bell, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/components/auth/UserProfile";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="h-14 lg:h-[72px] bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="h-full px-3 lg:px-6 flex items-center justify-between gap-2 lg:gap-4">
        {/* Mobile Search Overlay */}
        {mobileSearchOpen && (
          <div className="absolute inset-0 bg-card z-50 flex items-center px-3 lg:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente, prontuário..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSearchOpen(false)}
              className="ml-2 shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Desktop Search */}
        <div className="flex-1 max-w-md hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paciente, prontuário, consulta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary transition-all duration-200"
            />
          </div>
        </div>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileSearchOpen(true)}
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Spacer for mobile */}
        <div className="flex-1 lg:hidden" />

        {/* Right side */}
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center p-0 text-[10px] lg:text-xs bg-destructive">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 lg:w-80">
              <DropdownMenuLabel>Notificações (3)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-label text-sm">Paciente aguardando</span>
                </div>
                <p className="text-helper ml-4">
                  Maria Bezerly • Sala 39
                </p>
                <span className="text-helper ml-4">há 2 min</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-label text-sm">Nova consulta</span>
                </div>
                <p className="text-helper ml-4">
                  João Silva • 14/12 às 15:00
                </p>
                <span className="text-helper ml-4">há 15 min</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <span className="text-label text-sm">Exame disponível</span>
                </div>
                <p className="text-helper ml-4">
                  Hemograma de Ana Paula
                </p>
                <span className="text-helper ml-4">há 1 hora</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary font-medium cursor-pointer">
                Ver todas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
