import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/contexts/AuthContext';
import { useModules } from '@/hooks/useModules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Users, 
  Settings, 
  Palette,
  Save,
  Loader2,
  Trash2,
  Crown,
  Puzzle,
  Lock,
} from 'lucide-react';
import { TENANT_TYPE_LABELS, TenantType } from '@/types/tenant';
import { AVAILABLE_MODULES } from '@/config/modules';
import type { ModuleKey } from '@/types/modules';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TenantUserWithProfile {
  id: string;
  user_id: string;
  is_owner: boolean;
  is_active: boolean;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
  } | null;
}

const CATEGORY_LABELS = {
  core: 'Essenciais',
  clinical: 'Clínicos',
  administrative: 'Administrativos',
};

const CATEGORY_ORDER: Array<'core' | 'clinical' | 'administrative'> = ['core', 'clinical', 'administrative'];

export default function TenantSettings() {
  const { tenant, tenantUser, isOwner, refetchTenant } = useTenant();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { modules, isModuleEnabled, enableModule, disableModule, isLoading: isLoadingModules, refetchModules } = useModules();

  const [formData, setFormData] = useState({
    name: '',
    type: 'clinica_geral' as TenantType,
    logo_url: '',
    primary_color: '#009688',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [togglingModules, setTogglingModules] = useState<Set<string>>(new Set());

  // Load tenant data into form
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        type: tenant.type,
        logo_url: tenant.logo_url || '',
        primary_color: tenant.theme?.primary || '#009688',
      });
    }
  }, [tenant]);

  // Fetch tenant users
  const { data: tenantUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['tenant-users', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      // First get tenant_users
      const { data: tuData, error: tuError } = await supabase
        .from('tenant_users')
        .select('id, user_id, is_owner, is_active, created_at')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: true });
      
      if (tuError) throw tuError;
      if (!tuData) return [];
      
      // Then get profiles for each user
      const userIds = tuData.map(tu => tu.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);
      
      if (profilesError) throw profilesError;
      
      // Map profiles to tenant users
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      
      return tuData.map(tu => ({
        ...tu,
        profiles: profilesMap.get(tu.user_id) || null,
      })) as TenantUserWithProfile[];
    },
    enabled: !!tenant?.id,
  });

  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!tenant?.id) throw new Error('Tenant not found');
      
      const { error } = await supabase
        .from('tenants')
        .update({
          name: data.name,
          type: data.type,
          logo_url: data.logo_url || null,
          theme: { primary: data.primary_color },
          updated_at: new Date().toISOString(),
        })
        .eq('id', tenant.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Configurações salvas',
        description: 'As configurações foram atualizadas com sucesso.',
      });
      refetchTenant();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove user from tenant
  const removeUserMutation = useMutation({
    mutationFn: async (tenantUserId: string) => {
      const { error } = await supabase
        .from('tenant_users')
        .update({ is_active: false })
        .eq('id', tenantUserId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Usuário removido',
        description: 'O usuário foi removido do estabelecimento.',
      });
      queryClient.invalidateQueries({ queryKey: ['tenant-users', tenant?.id] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao remover',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTenantMutation.mutateAsync(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleModuleToggle = async (moduleKey: ModuleKey, enabled: boolean) => {
    setTogglingModules(prev => new Set(prev).add(moduleKey));
    try {
      if (enabled) {
        await enableModule(moduleKey);
        toast({
          title: 'Módulo habilitado',
          description: `O módulo foi habilitado com sucesso.`,
        });
      } else {
        await disableModule(moduleKey);
        toast({
          title: 'Módulo desabilitado',
          description: `O módulo foi desabilitado com sucesso.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o módulo.',
        variant: 'destructive',
      });
    } finally {
      setTogglingModules(prev => {
        const next = new Set(prev);
        next.delete(moduleKey);
        return next;
      });
    }
  };

  const getModulesByCategory = (category: 'core' | 'clinical' | 'administrative') => {
    return AVAILABLE_MODULES.filter(m => m.category === category);
  };

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum estabelecimento associado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Configurações do Estabelecimento
          </h2>
          <p className="text-muted-foreground">
            Gerencie as configurações de {tenant.name}
          </p>
        </div>
        {isOwner && (
          <Badge variant="outline" className="gap-1">
            <Crown className="h-3 w-3" />
            Proprietário
          </Badge>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          {isOwner && (
            <>
              <TabsTrigger value="modules" className="gap-2">
                <Puzzle className="h-4 w-4" />
                Módulos
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Usuários
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados do estabelecimento de saúde
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Estabelecimento</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isOwner}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: TenantType) => setFormData({ ...formData, type: value })}
                    disabled={!isOwner}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TENANT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Identificador (slug)</Label>
                <Input
                  id="slug"
                  value={tenant.slug}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  O identificador não pode ser alterado
                </p>
              </div>

              {isOwner && (
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalização</CardTitle>
              <CardDescription>
                Personalize a aparência do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo_url">URL do Logo</Label>
                <Input
                  id="logo_url"
                  type="url"
                  placeholder="https://exemplo.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  disabled={!isOwner}
                />
                <p className="text-xs text-muted-foreground">
                  URL de uma imagem para usar como logo (recomendado: 200x200px)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary_color">Cor Principal</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-16 h-10 p-1"
                    disabled={!isOwner}
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    placeholder="#009688"
                    className="flex-1"
                    disabled={!isOwner}
                  />
                </div>
              </div>

              {formData.logo_url && (
                <div className="space-y-2">
                  <Label>Preview do Logo</Label>
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <img 
                      src={formData.logo_url} 
                      alt="Logo preview" 
                      className="h-16 w-16 object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {isOwner && (
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Modules Management (Owner only) */}
        {isOwner && (
          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Módulos</CardTitle>
                <CardDescription>
                  Ative ou desative os módulos disponíveis para seu estabelecimento.
                  Módulos marcados com cadeado são obrigatórios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingModules ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {CATEGORY_ORDER.map(category => {
                      const categoryModules = getModulesByCategory(category);
                      if (categoryModules.length === 0) return null;

                      return (
                        <div key={category} className="space-y-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {CATEGORY_LABELS[category]}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {categoryModules.length} módulos
                            </Badge>
                          </div>
                          <Separator />
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {categoryModules.map(moduleConfig => {
                              const IconComponent = moduleConfig.icon;
                              const enabled = isModuleEnabled(moduleConfig.key);
                              const isToggling = togglingModules.has(moduleConfig.key);
                              const canDisable = moduleConfig.canDisable;

                              return (
                                <div
                                  key={moduleConfig.key}
                                  className={`relative p-4 border rounded-lg transition-colors ${
                                    enabled 
                                      ? 'bg-primary/5 border-primary/20' 
                                      : 'bg-muted/30 border-border'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className={`p-2 rounded-lg ${
                                        enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                      }`}>
                                        <IconComponent className="h-5 w-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium text-foreground truncate">
                                            {moduleConfig.name}
                                          </h4>
                                          {!canDisable && (
                                            <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                          {moduleConfig.description}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      {isToggling ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                      ) : (
                                        <Switch
                                          checked={enabled}
                                          onCheckedChange={(checked) => handleModuleToggle(moduleConfig.key, checked)}
                                          disabled={!canDisable}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Users Management (Owner only) */}
        {isOwner && (
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Usuários do Estabelecimento</CardTitle>
                    <CardDescription>
                      Gerencie os usuários que têm acesso a este estabelecimento
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tenantUsers?.filter(u => u.is_active).map((tenantUser) => (
                      <div
                        key={tenantUser.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {tenantUser.profiles?.full_name || 'Usuário'}
                              {tenantUser.is_owner && (
                                <Badge variant="secondary" className="ml-2">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Proprietário
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tenantUser.profiles?.email || tenantUser.user_id}
                            </p>
                          </div>
                        </div>
                        
                        {!tenantUser.is_owner && tenantUser.user_id !== user?.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover {tenantUser.profiles?.full_name || 'este usuário'} 
                                  do estabelecimento? Esta ação pode ser desfeita posteriormente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeUserMutation.mutate(tenantUser.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    ))}

                    {(!tenantUsers || tenantUsers.filter(u => u.is_active).length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
