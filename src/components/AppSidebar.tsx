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
  Pill,
  ShieldCheck,
  Syringe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { Permission, PERMISSIONS } from "@/types/auth";

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  permission?: Permission;
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
  { name: "Pacientes", href: "/patients", icon: Users, permission: PERMISSIONS.VIEW_PATIENTS },
  {
    name: "Prescrição Médica",
    icon: FileText,
    permission: PERMISSIONS.PRESCRIBE,
    children: [
      { name: "Lista de Pacientes", href: "/prescription", icon: Users },
    ],
  },
  { name: "Enfermagem", href: "/enfermagem", icon: Syringe, permission: PERMISSIONS.ADMINISTER_MEDS },
  { name: "Farmácia", href: "/farmacia", icon: Pill, permission: PERMISSIONS.DISPENSE },
  { name: "Importar SISREG", href: "/importar-sisreg", icon: Upload },
  { name: "Estornar Consulta", href: "/estornar", icon: RotateCcw },
  { name: "Atualizar Consulta", href: "/atualizar", icon: RefreshCw },
  { name: "Cadastros", href: "/cadastros", icon: FolderOpen },
  { name: "Pesquisas", href: "/pesquisas", icon: Search },
  { name: "Diária", href: "/diaria", icon: BarChart3 },
  { name: "Relatórios", href: "/relatorios", icon: FileBarChart },
  { name: "Administração", href: "/usuarios", icon: ShieldCheck, permission: PERMISSIONS.ALL },
];

export function AppSidebar() {
  const location = useLocation();
  const { hasPermission, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Ambulatório"]);

  // Filter menu items based on permissions
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter((item) => {
      // No permission required - show to all
      if (!item.permission) return true;
      // Admin sees everything
      if (isAdmin) return true;
      // Check specific permission
      return hasPermission(item.permission);
    }).map((item) => {
      if (item.children) {
        return { ...item, children: filterMenuItems(item.children) };
      }
      return item;
    });
  };

  const visibleMenuItems = filterMenuItems(menuItems);

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href?: string) => href && location.pathname === href;
  const isChildActive = (children?: MenuItem[]) => 
    children?.some((child) => isActive(child.href));

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const active = isActive(item.href);
    const childActive = isChildActive(item.children);

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 rounded-lg mx-2",
              (isExpanded || childActive) && "bg-sidebar-accent/50",
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
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                )}
              </>
            )}
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              !collapsed && isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="ml-4 mt-1 space-y-1">
              {item.children?.map((child) => renderMenuItem(child, depth + 1))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href || "#"}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-sidebar-foreground/90 hover:bg-white/10 hover:text-sidebar-foreground transition-all duration-200 rounded-xl mx-2",
          active && "bg-white/20 text-sidebar-foreground font-semibold shadow-sm",
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

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/25 rounded-xl flex items-center justify-center shadow-sm">
              <Stethoscope className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">MedFlow</h1>
              <p className="text-[10px] text-white/80 font-medium">MentoArk Health</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-11 h-11 bg-white/25 rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <Stethoscope className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1" role="menu">
          {visibleMenuItems.map((item) => renderMenuItem(item))}
        </nav>
      </ScrollArea>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-3 bg-background border-b w-full flex items-center gap-3 shadow-sm">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-primary border-0">
            <div className="h-full flex flex-col">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="font-semibold text-foreground text-sm">MedFlow</span>
            <p className="text-[9px] text-muted-foreground">MentoArk Health</p>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex h-screen bg-primary flex-col transition-all duration-300 sticky top-0",
          collapsed ? "w-20" : "w-72"
        )}
        role="navigation"
        aria-label="Menu principal"
      >
        <SidebarContent />

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200",
              collapsed && "px-2"
            )}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <X className="h-5 w-5 mr-2" />
                <span>Recolher</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
