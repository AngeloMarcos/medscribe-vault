import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Shield, 
  Settings, 
  User, 
  Blocks,
  Search,
  Clock
} from 'lucide-react';
import type { AuditEntityType, AuditAction, AuditLogWithUser } from '@/types/auditLog';

const ENTITY_LABELS: Record<AuditEntityType, { label: string; icon: React.ElementType }> = {
  permission: { label: 'Permissão', icon: Shield },
  module: { label: 'Módulo', icon: Blocks },
  user: { label: 'Usuário', icon: User },
  tenant_settings: { label: 'Configurações', icon: Settings },
};

const ACTION_LABELS: Record<AuditAction, { label: string; color: string }> = {
  grant: { label: 'Concedido', color: 'bg-success/20 text-success' },
  revoke: { label: 'Revogado', color: 'bg-destructive/20 text-destructive' },
  enable: { label: 'Habilitado', color: 'bg-success/20 text-success' },
  disable: { label: 'Desabilitado', color: 'bg-warning/20 text-warning' },
  add: { label: 'Adicionado', color: 'bg-primary/20 text-primary' },
  remove: { label: 'Removido', color: 'bg-destructive/20 text-destructive' },
  update: { label: 'Atualizado', color: 'bg-info/20 text-info' },
};

export function TenantAuditLogs() {
  const { tenant } = useTenant();
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['tenant-audit-logs', tenant?.id, entityFilter],
    queryFn: async () => {
      if (!tenant?.id) return [];

      let query = supabase
        .from('tenant_audit_log')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Buscar nomes dos usuários
      const userIds = [...new Set([
        ...(data?.map(log => log.user_id) || []),
        ...(data?.filter(log => log.target_user_id).map(log => log.target_user_id) || [])
      ])];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        return (data || []).map(log => ({
          ...log,
          user_name: profiles?.find(p => p.id === log.user_id)?.full_name,
          user_email: profiles?.find(p => p.id === log.user_id)?.email,
          target_user_name: log.target_user_id 
            ? profiles?.find(p => p.id === log.target_user_id)?.full_name 
            : null,
        })) as AuditLogWithUser[];
      }

      return (data || []) as AuditLogWithUser[];
    },
    enabled: !!tenant?.id,
  });

  const filteredLogs = logs?.filter(log => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.description?.toLowerCase().includes(searchLower) ||
      log.user_name?.toLowerCase().includes(searchLower) ||
      log.target_user_name?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar nos logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tipo de entidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="permission">Permissões</SelectItem>
            <SelectItem value="module">Módulos</SelectItem>
            <SelectItem value="user">Usuários</SelectItem>
            <SelectItem value="tenant_settings">Configurações</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Logs */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {filteredLogs?.map(log => {
            const entityConfig = ENTITY_LABELS[log.entity_type as AuditEntityType];
            const actionConfig = ACTION_LABELS[log.action as AuditAction];
            const EntityIcon = entityConfig?.icon || Settings;

            return (
              <Card key={log.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <EntityIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="text-xs">
                          {entityConfig?.label || log.entity_type}
                        </Badge>
                        <Badge className={`text-xs ${actionConfig?.color || ''}`}>
                          {actionConfig?.label || log.action}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">
                        {log.description || 'Sem descrição'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user_name || 'Usuário desconhecido'}
                        </span>
                        {log.target_user_name && (
                          <span>→ {log.target_user_name}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {(!filteredLogs || filteredLogs.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum registro de auditoria encontrado
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
