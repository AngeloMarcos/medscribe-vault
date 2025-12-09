import { useNavigate } from "react-router-dom";
import { ChevronDown, User, Settings, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { AppRole } from "@/types/auth";

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  medico: "Médico",
  enfermeiro: "Enfermeiro",
  farmaceutico: "Farmacêutico",
  tecnico_enfermagem: "Técnico de Enfermagem",
  recepcao: "Recepcionista",
};

const ROLE_BADGE_COLORS: Record<AppRole, string> = {
  admin: "bg-red-100 text-red-700 border-red-200",
  medico: "bg-blue-100 text-blue-700 border-blue-200",
  enfermeiro: "bg-green-100 text-green-700 border-green-200",
  farmaceutico: "bg-purple-100 text-purple-700 border-purple-200",
  tecnico_enfermagem: "bg-yellow-100 text-yellow-700 border-yellow-200",
  recepcao: "bg-gray-100 text-gray-700 border-gray-200",
};

export function UserProfile() {
  const { profile, roles, isAdmin, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const userRole = roles[0] as AppRole | undefined;

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Desconectado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3 hover:bg-muted/50 transition-colors">
          <Avatar className="w-8 h-8">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-[#015D67] to-[#038C8C] text-white font-semibold text-xs">
              {getInitials(profile?.full_name || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium truncate max-w-[120px]">
              {profile?.full_name || "Usuário"}
            </p>
            <p className="text-xs text-muted-foreground">
              {userRole ? ROLE_LABELS[userRole] : "Sem perfil"}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* Header with user info */}
        <div className="px-3 py-3 space-y-2">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-[#015D67] to-[#038C8C] text-white font-semibold">
                {getInitials(profile?.full_name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.full_name || "Usuário"}</p>
              <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
          {userRole && (
            <Badge className={`${ROLE_BADGE_COLORS[userRole]} border text-xs`}>
              {ROLE_LABELS[userRole]}
            </Badge>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Navigation links */}
        <DropdownMenuItem 
          onClick={() => navigate("/perfil")}
          className="cursor-pointer py-2.5"
        >
          <User className="mr-2 h-4 w-4" />
          Meu Perfil
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuItem 
              onClick={() => navigate("/admin/configuracoes")}
              className="cursor-pointer py-2.5"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate("/usuarios")}
              className="cursor-pointer py-2.5"
            >
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Usuários
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
