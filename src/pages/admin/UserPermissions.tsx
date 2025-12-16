import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  ShieldX, 
  User, 
  ChevronDown, 
  ChevronUp,
  Save,
  RotateCcw
} from 'lucide-react';
import { PERMISSIONS, ROLE_PERMISSIONS, ROLE_LABELS, AppRole, Permission } from '@/types/auth';
import type { TenantUserPermissions } from '@/types/tenantPermissions';

const PERMISSION_LABELS: Record<string, string> = {
  all: 'Acesso Total',
  prescribe: 'Prescrever',
  view_patients: 'Ver Pacientes',
  clinical_docs: 'Docs Clínicos',
  request_exams: 'Solicitar Exames',
  administer_meds: 'Administrar Med.',
  view_prescriptions: 'Ver Prescrições',
  vital_signs: 'Sinais Vitais',
  nursing_notes: 'Anotações Enf.',
  dispense: 'Dispensar Med.',
  stock_control: 'Controle Estoque',
  patient_registration: 'Cadastro Pac.',
  scheduling: 'Agendamento',
  view_own_data: 'Ver Próprios Dados',
};

const PERMISSION_CATEGORIES = {
  clinical: {
    label: 'Clínico',
    permissions: ['prescribe', 'clinical_docs', 'request_exams', 'view_prescriptions'],
  },
  nursing: {
    label: 'Enfermagem',
    permissions: ['administer_meds', 'vital_signs', 'nursing_notes'],
  },
  pharmacy: {
    label: 'Farmácia',
    permissions: ['dispense', 'stock_control'],
  },
  administrative: {
    label: 'Administrativo',
    permissions: ['patient_registration', 'scheduling', 'view_patients'],
  },
};

interface UserPermissionRow {
  userId: string;
  email: string;
  fullName: string;
  role: AppRole | null;
  tenantPermissions: TenantUserPermissions | null;
}

export default function UserPermissions() {
  const { tenant } = useTenant();
  const { isAdmin } = useAuth();
  const { logPermissionChange } = useAuditLog();
  const queryClient = useQueryClient();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, { granted: string[], denied: string[] }>>({});

  const { data: users, isLoading } = useQuery({
    queryKey: ['tenant-users-permissions', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const { data: tenantUsers, error: tuError } = await supabase
        .from('tenant_users')
        .select('user_id')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true);

      if (tuError) throw tuError;
      if (!tenantUsers?.length) return [];

      const userIds = tenantUsers.map(tu => tu.user_id);

      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (pError) throw pError;

      const { data: roles, error: rError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rError) throw rError;

      const { data: permissions, error: permError } = await supabase
        .from('tenant_user_permissions')
        .select('*')
        .eq('tenant_id', tenant.id)
        .in('user_id', userIds);

      if (permError) throw permError;

      return profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        const userPermissions = permissions?.find(p => p.user_id === profile.id);

        return {
          userId: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: userRole?.role as AppRole | null,
          tenantPermissions: userPermissions as TenantUserPermissions | null,
        };
      }) || [];
    },
    enabled: !!tenant?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async ({ userId, userName, granted, denied, oldGranted, oldDenied }: { 
      userId: string; 
      userName: string;
      granted: string[]; 
      denied: string[];
      oldGranted: string[];
      oldDenied: string[];
    }) => {
      if (!tenant?.id) throw new Error('Tenant não encontrado');

      const { data: existing } = await supabase
        .from('tenant_user_permissions')
        .select('id')
        .eq('tenant_id', tenant.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('tenant_user_permissions')
          .update({
            granted_permissions: granted,
            denied_permissions: denied,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tenant_user_permissions')
          .insert({
            tenant_id: tenant.id,
            user_id: userId,
            granted_permissions: granted,
            denied_permissions: denied,
          });

        if (error) throw error;
      }

      await logPermissionChange({
        action: 'update',
        targetUserId: userId,
        beforeValue: { granted: oldGranted, denied: oldDenied },
        afterValue: { granted, denied },
        description: `Permissões alteradas para ${userName}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users-permissions'] });
      toast.success('Permissões salvas');
    },
    onError: (error) => {
      console.error('Error saving permissions:', error);
      toast.error('Erro ao salvar permissões');
    },
  });

  const getBasePermissions = (role: AppRole | null): string[] => {
    if (!role) return [];
    return ROLE_PERMISSIONS[role] || [];
  };

  const getPermissionState = (user: UserPermissionRow, permission: string): 'base' | 'granted' | 'denied' | 'none' => {
    const changes = pendingChanges[user.userId];
    const granted = changes?.granted || user.tenantPermissions?.granted_permissions || [];
    const denied = changes?.denied || user.tenantPermissions?.denied_permissions || [];
    const base = getBasePermissions(user.role);

    if (denied.includes(permission)) return 'denied';
    if (granted.includes(permission)) return 'granted';
    if (base.includes(permission)) return 'base';
    return 'none';
  };

  const togglePermission = (user: UserPermissionRow, permission: string) => {
    const currentState = getPermissionState(user, permission);
    const base = getBasePermissions(user.role);
    const isBasePermission = base.includes(permission);
    
    const currentChanges = pendingChanges[user.userId] || {
      granted: [...(user.tenantPermissions?.granted_permissions || [])],
      denied: [...(user.tenantPermissions?.denied_permissions || [])],
    };

    let newGranted = [...currentChanges.granted];
    let newDenied = [...currentChanges.denied];

    if (currentState === 'none' || currentState === 'denied') {
      newDenied = newDenied.filter(p => p !== permission);
      if (!isBasePermission && !newGranted.includes(permission)) {
        newGranted.push(permission);
      }
    } else {
      newGranted = newGranted.filter(p => p !== permission);
      if (!newDenied.includes(permission)) {
        newDenied.push(permission);
      }
    }

    setPendingChanges(prev => ({
      ...prev,
      [user.userId]: { granted: newGranted, denied: newDenied },
    }));
  };

  const handleSave = (userId: string) => {
    const changes = pendingChanges[userId];
    if (!changes) return;

    const user = users?.find(u => u.userId === userId);
    const oldGranted = user?.tenantPermissions?.granted_permissions || [];
    const oldDenied = user?.tenantPermissions?.denied_permissions || [];

    saveMutation.mutate({
      userId,
      userName: user?.fullName || 'Usuário',
      granted: changes.granted,
      denied: changes.denied,
      oldGranted,
      oldDenied,
    });

    setPendingChanges(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  const handleReset = (userId: string) => {
    setPendingChanges(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  const hasPendingChanges = (userId: string) => {
    return !!pendingChanges[userId];
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 space-y-4">
        <Skeleton className="h-8 w-48 lg:w-64" />
        <Skeleton className="h-24 lg:h-32 w-full" />
        <Skeleton className="h-24 lg:h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Permissões por Usuário</h1>
        <p className="text-xs lg:text-sm text-muted-foreground">
          Customize permissões individuais
        </p>
      </div>

      <div className="space-y-3 lg:space-y-4">
        {users?.map(user => (
          <Card key={user.userId} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors p-3 lg:p-6"
              onClick={() => setExpandedUser(expandedUser === user.userId ? null : user.userId)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                  <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm lg:text-base truncate">{user.fullName}</CardTitle>
                    <CardDescription className="text-xs lg:text-sm truncate">{user.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1 lg:gap-3 shrink-0">
                  {user.role && (
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                  )}
                  {hasPendingChanges(user.userId) && (
                    <Badge variant="secondary" className="bg-warning/20 text-warning text-xs">
                      Pendente
                    </Badge>
                  )}
                  {expandedUser === user.userId ? (
                    <ChevronUp className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>

            {expandedUser === user.userId && (
              <CardContent className="border-t p-3 lg:p-6">
                <div className="space-y-4 lg:space-y-6">
                  {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
                    <div key={categoryKey}>
                      <h4 className="text-xs lg:text-sm font-medium text-muted-foreground mb-2 lg:mb-3">
                        {category.label}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
                        {category.permissions.map(permission => {
                          const state = getPermissionState(user, permission);
                          const isActive = state === 'base' || state === 'granted';
                          const isOverride = state === 'granted' || state === 'denied';

                          return (
                            <div
                              key={permission}
                              className={`flex items-center justify-between p-2 lg:p-3 rounded-lg border transition-colors ${
                                isOverride 
                                  ? state === 'granted' 
                                    ? 'border-success/30 bg-success/5' 
                                    : 'border-destructive/30 bg-destructive/5'
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 lg:gap-2 min-w-0">
                                {isActive ? (
                                  <ShieldCheck className="h-3 w-3 lg:h-4 lg:w-4 text-success shrink-0" />
                                ) : (
                                  <ShieldX className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground shrink-0" />
                                )}
                                <span className="text-xs lg:text-sm truncate">
                                  {PERMISSION_LABELS[permission] || permission}
                                </span>
                              </div>
                              <Switch
                                checked={isActive}
                                onCheckedChange={() => togglePermission(user, permission)}
                                className="shrink-0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {hasPendingChanges(user.userId) && (
                    <>
                      <Separator />
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReset(user.userId)}
                          className="h-8 lg:h-9 text-xs lg:text-sm"
                        >
                          <RotateCcw className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                          Descartar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(user.userId)}
                          disabled={saveMutation.isPending}
                          className="h-8 lg:h-9 text-xs lg:text-sm"
                        >
                          <Save className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                          Salvar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {(!users || users.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              Nenhum usuário encontrado
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
