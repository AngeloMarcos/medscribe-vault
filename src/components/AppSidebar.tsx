import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  CalendarHeart,
  UserRound,
  CalendarPlus,
  CalendarDays,
  ClipboardList,
  FileUp,
  RotateCcw,
  RefreshCw,
  FolderOpen,
  Search,
  BarChart3,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Pill,
  ShieldCheck,
  KeyRound,
  Syringe,
  Smile,
  Grid3X3,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useModules } from "@/hooks/useModules";
import { Permission, PERMISSIONS } from "@/types/auth";
import { ModuleKey } from "@/types/modules";
import { ThemeToggle } from "@/components/ThemeToggle";

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  permission?: Permission;
  moduleKey?: ModuleKey;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { name: "Painel Geral", href: "/", icon: Activity, moduleKey: "dashboard" },
  {
    name: "Ambulatório",
    icon: CalendarHeart,
    moduleKey: "ambulatorio",
    children: [
      { name: "Marcar Consulta", href: "/marcar-consulta", icon: CalendarPlus },
      { name: "Lista de Pacientes", href: "/lista-pacientes", icon: UserRound },
      { name: "Grades de Agendamento", href: "/grades", icon: CalendarDays },
    ],
  },
  {
    name: "Odontologia",
    icon: Smile,
    moduleKey: "odontologia",
    children: [
      { name: "Agendar Atendimento", href: "/odonto/agendar", icon: CalendarPlus },
      { name: "Lista de Pacientes", href: "/odonto/pacientes", icon: UserRound },
      { name: "Odontograma", href: "/odonto/odontograma", icon: Grid3X3 },
      { name: "Plano de Tratamento", href: "/odonto/tratamento", icon: FileText },
    ],
  },
  { name: "Pacientes", href: "/patients", icon: UserRound, permission: PERMISSIONS.VIEW_PATIENTS, moduleKey: "pacientes" },
  {
    name: "Prescrição Médica",
    icon: ClipboardList,
    permission: PERMISSIONS.PRESCRIBE,
    moduleKey: "prescricao",
    children: [
      { name: "Lista de Pacientes", href: "/prescription", icon: UserRound },
    ],
  },
  { name: "Enfermagem", href: "/enfermagem", icon: Syringe, permission: PERMISSIONS.ADMINISTER_MEDS, moduleKey: "enfermagem" },
  { name: "Farmácia", href: "/farmacia", icon: Pill, permission: PERMISSIONS.DISPENSE, moduleKey: "farmacia" },
  { name: "Importar SISREG", href: "/importar-sisreg", icon: FileUp, moduleKey: "sisreg" },
  { name: "Estornar Consulta", href: "/estornar", icon: RotateCcw, moduleKey: "ambulatorio" },
  { name: "Atualizar Consulta", href: "/atualizar", icon: RefreshCw, moduleKey: "ambulatorio" },
  { name: "Cadastros", href: "/cadastros", icon: FolderOpen, moduleKey: "administracao" },
  { name: "Pesquisas", href: "/pesquisas", icon: Search },
  { name: "Diária", href: "/diaria", icon: BarChart3, moduleKey: "relatorios" },
  { name: "Relatórios", href: "/relatorios", icon: ClipboardCheck, moduleKey: "relatorios" },
  { 
    name: "Administração", 
    icon: ShieldCheck, 
    permission: PERMISSIONS.ALL, 
    moduleKey: "administracao",
    children: [
      { name: "Usuários", href: "/usuarios", icon: UserRound },
      { name: "Permissões", href: "/permissoes", icon: KeyRound },
      { name: "Auditoria", href: "/auditoria", icon: FileText },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { hasPermission, isAdmin } = useAuth();
  const { tenant } = useTenant();
  const { isModuleEnabled, isLoading: modulesLoading } = useModules();
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

  // Filter menu items based on enabled modules
  const filterByModules = (items: MenuItem[]): MenuItem[] => {
    if (modulesLoading) return items;
    
    return items.filter((item) => {
      // No module key - always show
      if (!item.moduleKey) return true;
      // Check if module is enabled
      return isModuleEnabled(item.moduleKey);
    }).map((item) => {
      if (item.children) {
        const filteredChildren = filterByModules(item.children);
        // If no children left after filtering, hide parent
        if (filteredChildren.length === 0 && item.children.length > 0) {
          return null;
        }
        return { ...item, children: filteredChildren };
      }
      return item;
    }).filter(Boolean) as MenuItem[];
  };

  const visibleMenuItems = filterByModules(filterMenuItems(menuItems));

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
              (isExpanded || childActive) && "bg-sidebar-accent/60",
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
          "flex items-center gap-3 px-4 py-3 text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 rounded-lg mx-2",
          active && "bg-sidebar-accent text-sidebar-foreground font-semibold",
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
            {tenant?.logo_url ? (
              <img 
                src={tenant.logo_url} 
                alt={`${tenant.name} Logo`} 
                className="w-11 h-11 rounded-xl shadow-sm object-cover"
              />
            ) : (
              <img 
                src="/logo.svg" 
                alt="HealthFlow Logo" 
                className="w-11 h-11 rounded-xl shadow-sm"
              />
            )}
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">
                {tenant?.name || 'HealthFlow'}
              </h1>
              <p className="text-[9px] text-sidebar-foreground/70 font-medium leading-tight">
                Sistema de Gestão Clínica
              </p>
              {tenant && (
                <p className="text-[8px] text-sidebar-foreground/50 font-normal leading-tight">
                  {tenant.name}
                </p>
              )}
            </div>
          </div>
        )}
        {collapsed && (
          tenant?.logo_url ? (
            <img 
              src={tenant.logo_url} 
              alt={`${tenant.name} Logo`} 
              className="w-11 h-11 rounded-xl shadow-sm mx-auto object-cover"
            />
          ) : (
            <img 
              src="/logo.svg" 
              alt="HealthFlow Logo" 
              className="w-11 h-11 rounded-xl shadow-sm mx-auto"
            />
          )
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
      <div className="lg:hidden fixed top-0 left-0 z-50 p-3 bg-background border-b border-border w-full flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
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
            <SheetContent side="left" className="p-0 w-72 bg-sidebar border-0">
              <div className="h-full flex flex-col">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            {tenant?.logo_url ? (
              <img 
                src={tenant.logo_url} 
                alt={`${tenant.name} Logo`} 
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <img 
                src="/logo.svg" 
                alt="HealthFlow Logo" 
                className="w-8 h-8 rounded-lg"
              />
            )}
            <div>
              <span className="font-semibold text-foreground text-sm">
                {tenant?.name || 'HealthFlow'}
              </span>
              {tenant && (
                <p className="text-[8px] text-muted-foreground leading-tight">{tenant.name}</p>
              )}
            </div>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex h-screen bg-sidebar flex-col transition-all duration-300 sticky top-0",
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
              "w-full text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200",
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
