import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
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

// Labels para permissões
const PERMISSION_LABELS: Record<string, string> = {
  all: 'Acesso Total',
  prescribe: 'Prescrever Medicamentos',
  view_patients: 'Visualizar Pacientes',
  clinical_docs: 'Documentos Clínicos',
  request_exams: 'Solicitar Exames',
  administer_meds: 'Administrar Medicamentos',
  view_prescriptions: 'Visualizar Prescrições',
  vital_signs: 'Sinais Vitais',
  nursing_notes: 'Anotações de Enfermagem',
  dispense: 'Dispensar Medicamentos',
  stock_control: 'Controle de Estoque',
  patient_registration: 'Cadastro de Pacientes',
  scheduling: 'Agendamento',
  view_own_data: 'Visualizar Próprios Dados',
};

// Categorias de permissões
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
  const queryClient = useQueryClient();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, { granted: string[], denied: string[] }>>({});

  // Buscar usuários do tenant com suas permissões
  const { data: users, isLoading } = useQuery({
    queryKey: ['tenant-users-permissions', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      // Buscar usuários do tenant
      const { data: tenantUsers, error: tuError } = await supabase
        .from('tenant_users')
        .select('user_id')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true);

      if (tuError) throw tuError;
      if (!tenantUsers?.length) return [];

      const userIds = tenantUsers.map(tu => tu.user_id);

      // Buscar profiles
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (pError) throw pError;

      // Buscar roles
      const { data: roles, error: rError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rError) throw rError;

      // Buscar permissões do tenant
      const { data: permissions, error: permError } = await supabase
        .from('tenant_user_permissions')
        .select('*')
        .eq('tenant_id', tenant.id)
        .in('user_id', userIds);

      if (permError) throw permError;

      // Montar array de usuários
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

  // Mutation para salvar permissões
  const saveMutation = useMutation({
    mutationFn: async ({ userId, granted, denied }: { userId: string; granted: string[]; denied: string[] }) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-users-permissions'] });
      toast.success('Permissões salvas com sucesso');
    },
    onError: (error) => {
      console.error('Error saving permissions:', error);
      toast.error('Erro ao salvar permissões');
    },
  });

  // Obter permissões base do role
  const getBasePermissions = (role: AppRole | null): string[] => {
    if (!role) return [];
    return ROLE_PERMISSIONS[role] || [];
  };

  // Obter estado atual de uma permissão
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

  // Toggle permissão
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
      // Ativar: adicionar em granted, remover de denied
      newDenied = newDenied.filter(p => p !== permission);
      if (!isBasePermission && !newGranted.includes(permission)) {
        newGranted.push(permission);
      }
    } else {
      // Desativar: adicionar em denied, remover de granted
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

  // Salvar alterações de um usuário
  const handleSave = (userId: string) => {
    const changes = pendingChanges[userId];
    if (!changes) return;

    saveMutation.mutate({
      userId,
      granted: changes.granted,
      denied: changes.denied,
    });

    // Limpar pending changes após salvar
    setPendingChanges(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  // Resetar alterações de um usuário
  const handleReset = (userId: string) => {
    setPendingChanges(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  // Verificar se tem alterações pendentes
  const hasPendingChanges = (userId: string) => {
    return !!pendingChanges[userId];
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Permissões por Usuário</h1>
        <p className="text-muted-foreground">
          Customize permissões individuais para usuários deste tenant
        </p>
      </div>

      <div className="space-y-4">
        {users?.map(user => (
          <Card key={user.userId} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedUser(expandedUser === user.userId ? null : user.userId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{user.fullName}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user.role && (
                    <Badge variant="outline">
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                  )}
                  {hasPendingChanges(user.userId) && (
                    <Badge variant="secondary" className="bg-warning/20 text-warning">
                      Alterações pendentes
                    </Badge>
                  )}
                  {expandedUser === user.userId ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>

            {expandedUser === user.userId && (
              <CardContent className="border-t">
                <div className="py-4 space-y-6">
                  {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
                    <div key={categoryKey}>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        {category.label}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.permissions.map(permission => {
                          const state = getPermissionState(user, permission);
                          const isActive = state === 'base' || state === 'granted';
                          const isOverride = state === 'granted' || state === 'denied';

                          return (
                            <div
                              key={permission}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                isOverride 
                                  ? state === 'granted' 
                                    ? 'border-success/30 bg-success/5' 
                                    : 'border-destructive/30 bg-destructive/5'
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isActive ? (
                                  <ShieldCheck className="h-4 w-4 text-success" />
                                ) : (
                                  <ShieldX className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm">
                                  {PERMISSION_LABELS[permission] || permission}
                                </span>
                                {state === 'base' && (
                                  <Badge variant="outline" className="text-xs">
                                    Do perfil
                                  </Badge>
                                )}
                                {state === 'granted' && (
                                  <Badge variant="outline" className="text-xs border-success/50 text-success">
                                    Concedida
                                  </Badge>
                                )}
                                {state === 'denied' && (
                                  <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">
                                    Negada
                                  </Badge>
                                )}
                              </div>
                              <Switch
                                checked={isActive}
                                onCheckedChange={() => togglePermission(user, permission)}
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
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReset(user.userId)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Descartar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(user.userId)}
                          disabled={saveMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
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
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum usuário encontrado neste tenant
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
