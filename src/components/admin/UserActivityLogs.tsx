import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  Search,
  Filter,
  Loader2,
  User,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
  RefreshCw,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Json } from "@/integrations/supabase/types";

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  resource: string | null;
  resource_id: string | null;
  details: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  login: <LogIn className="h-4 w-4" />,
  logout: <LogOut className="h-4 w-4" />,
  create: <Plus className="h-4 w-4" />,
  update: <Edit className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  view: <Eye className="h-4 w-4" />,
  default: <Activity className="h-4 w-4" />,
};

const ACTION_COLORS: Record<string, string> = {
  login: "bg-green-100 text-green-800 border-green-200",
  logout: "bg-gray-100 text-gray-800 border-gray-200",
  create: "bg-blue-100 text-blue-800 border-blue-200",
  update: "bg-yellow-100 text-yellow-800 border-yellow-200",
  delete: "bg-red-100 text-red-800 border-red-200",
  view: "bg-purple-100 text-purple-800 border-purple-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

const ACTION_LABELS: Record<string, string> = {
  login: "Login",
  logout: "Logout",
  create: "Criação",
  update: "Atualização",
  delete: "Exclusão",
  view: "Visualização",
  password_reset: "Reset de Senha",
  role_change: "Alteração de Perfil",
};

const PAGE_SIZE = 20;

export default function UserActivityLogs() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["activity-logs", search, actionFilter, page],
    queryFn: async () => {
      let query = supabase
        .from("user_activity_log")
        .select(
          `
          id,
          user_id,
          action,
          resource,
          resource_id,
          details,
          ip_address,
          user_agent,
          created_at
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      const offset = (page - 1) * PAGE_SIZE;
      query = query.range(offset, offset + PAGE_SIZE - 1);

      const { data: logs, error, count } = await query;

      if (error) throw error;

      // Fetch user profiles for logs
      const userIds = [...new Set((logs || []).map((log) => log.user_id).filter(Boolean))];
      
      let profiles: Record<string, { email: string; full_name: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);

        if (profileData) {
          profiles = profileData.reduce((acc, profile) => {
            acc[profile.id] = { email: profile.email, full_name: profile.full_name };
            return acc;
          }, {} as Record<string, { email: string; full_name: string }>);
        }
      }

      const enrichedLogs: ActivityLog[] = (logs || []).map((log) => ({
        ...log,
        user_email: log.user_id ? profiles[log.user_id]?.email : undefined,
        user_name: log.user_id ? profiles[log.user_id]?.full_name : undefined,
      }));

      // Client-side search
      const filteredLogs = search
        ? enrichedLogs.filter(
            (log) =>
              log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
              log.user_name?.toLowerCase().includes(search.toLowerCase()) ||
              log.action.toLowerCase().includes(search.toLowerCase()) ||
              log.resource?.toLowerCase().includes(search.toLowerCase())
          )
        : enrichedLogs;

      return {
        logs: filteredLogs,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / PAGE_SIZE),
      };
    },
  });

  const getActionIcon = (action: string) => {
    return ACTION_ICONS[action] || ACTION_ICONS.default;
  };

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || ACTION_COLORS.default;
  };

  const getActionLabel = (action: string) => {
    return ACTION_LABELS[action] || action;
  };

  const formatDetails = (details: Json | null) => {
    if (!details || typeof details !== 'object' || Array.isArray(details)) return "-";
    
    const entries = Object.entries(details as Record<string, unknown>).slice(0, 3);
    return entries.map(([key, value]) => `${key}: ${value}`).join(", ");
  };

  const logs = data?.logs || [];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuário ou ação..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        
        <Select
          value={actionFilter}
          onValueChange={(value) => {
            setActionFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ações</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
            <SelectItem value="create">Criação</SelectItem>
            <SelectItem value="update">Atualização</SelectItem>
            <SelectItem value="delete">Exclusão</SelectItem>
            <SelectItem value="password_reset">Reset de Senha</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead className="hidden lg:table-cell">Detalhes</TableHead>
                  <TableHead className="hidden md:table-cell">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Nenhum log de atividade encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        <div className="font-medium">
                          {format(new Date(log.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {format(new Date(log.created_at), "HH:mm:ss", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate max-w-[150px]">
                              {log.user_name || "Sistema"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {log.user_email || "-"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getActionColor(log.action)} flex items-center gap-1 w-fit`}
                        >
                          {getActionIcon(log.action)}
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.resource ? (
                          <div>
                            <span className="font-medium">{log.resource}</span>
                            {log.resource_id && (
                              <span className="text-muted-foreground text-xs block">
                                ID: {log.resource_id.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                        {formatDetails(log.details)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {log.ip_address || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  );
}
