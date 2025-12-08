import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  CalendarPlus,
  CalendarDays,
  Stethoscope,
  FileText,
  Upload,
  RotateCcw,
  RefreshCw,
  FolderOpen,
  Search,
  BarChart3,
  FileBarChart,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { name: "Painel Geral", href: "/", icon: LayoutDashboard },
  {
    name: "Ambulatório",
    icon: Calendar,
    children: [
      { name: "Marcar Consulta", href: "/marcar-consulta", icon: CalendarPlus },
      { name: "Lista de Pacientes", href: "/lista-pacientes", icon: Users },
      { name: "Grades de Agendamento", href: "/grades", icon: CalendarDays },
    ],
  },
  { name: "Pacientes", href: "/patients", icon: Users },
  { name: "Prescrição", href: "/prescricao", icon: FileText },
  { name: "Enfermagem", href: "/enfermagem", icon: Stethoscope },
  { name: "Importar SISREG", href: "/importar-sisreg", icon: Upload },
  { name: "Estornar Consulta", href: "/estornar", icon: RotateCcw },
  { name: "Atualizar Consulta", href: "/atualizar", icon: RefreshCw },
  { name: "Cadastros", href: "/cadastros", icon: FolderOpen },
  { name: "Pesquisas", href: "/pesquisas", icon: Search },
  { name: "Diária", href: "/diaria", icon: BarChart3 },
  { name: "Relatórios", href: "/relatorios", icon: FileBarChart },
  { name: "Usuários", href: "/usuarios", icon: UserCog },
];

export function AppSidebar() {
  const location = useLocation();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Ambulatório"]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Desconectado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href?: string) => href && location.pathname === href;

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const active = isActive(item.href);

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 rounded-lg mx-2",
              collapsed && "justify-center px-2"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left text-sm font-medium">
                  {item.name}
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </>
            )}
          </button>
          {!collapsed && isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children?.map((child) => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href || "#"}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 rounded-lg mx-2",
          active && "bg-white/10 border-l-4 border-white text-sidebar-foreground font-semibold",
          collapsed && "justify-center px-2",
          depth > 0 && "py-2.5 text-sm"
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", depth > 0 && "h-4 w-4")} />
        {!collapsed && (
          <span className={cn("text-sm font-medium", depth > 0 && "text-xs")}>
            {item.name}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "h-screen bg-gradient-to-b from-primary to-primary/90 flex flex-col transition-all duration-300 sticky top-0",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">MedFlow</h1>
              <p className="text-xs text-white/70">Sistema de Gestão</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-white/10"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-white/90 hover:bg-white/10 hover:text-white",
            collapsed && "justify-center px-2"
          )}
        >
          <Bell className="h-5 w-5" />
          {!collapsed && <span>Notificações</span>}
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 text-white/90 hover:bg-white/10 hover:text-white",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
