import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { ModuleKey, TenantModule } from '@/types/modules';
import { AVAILABLE_MODULES } from '@/config/modules';

interface ModuleContextType {
  modules: TenantModule[];
  enabledModules: ModuleKey[];
  isLoading: boolean;
  isModuleEnabled: (moduleKey: ModuleKey) => boolean;
  isRouteEnabled: (route: string) => boolean;
  enableModule: (moduleKey: ModuleKey) => Promise<void>;
  disableModule: (moduleKey: ModuleKey) => Promise<void>;
  refetchModules: () => Promise<void>;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const [modules, setModules] = useState<TenantModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchModules = useCallback(async () => {
    if (!tenant?.id) {
      setModules([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tenant_modules')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (error) {
        console.error('Error fetching modules:', error);
        setModules([]);
      } else {
        setModules((data || []) as TenantModule[]);
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    if (!tenantLoading) {
      fetchModules();
    }
  }, [tenantLoading, fetchModules]);

  const enabledModules: ModuleKey[] = modules
    .filter(m => m.is_enabled)
    .map(m => m.module_key);

  const isModuleEnabled = useCallback((moduleKey: ModuleKey): boolean => {
    const module = modules.find(m => m.module_key === moduleKey);
    // Se o módulo não está registrado, considera como habilitado por padrão
    if (!module) return true;
    return module.is_enabled;
  }, [modules]);

  const isRouteEnabled = useCallback((route: string): boolean => {
    // Encontra o módulo que corresponde à rota
    const moduleConfig = AVAILABLE_MODULES.find(m => 
      m.routes.some(r => route === r || route.startsWith(r + '/'))
    );
    
    // Se não há módulo para a rota, permite acesso
    if (!moduleConfig) return true;
    
    return isModuleEnabled(moduleConfig.key);
  }, [isModuleEnabled]);

  const enableModule = useCallback(async (moduleKey: ModuleKey) => {
    if (!tenant?.id) return;

    const existingModule = modules.find(m => m.module_key === moduleKey);

    if (existingModule) {
      await supabase
        .from('tenant_modules')
        .update({ 
          is_enabled: true, 
          enabled_at: new Date().toISOString(),
          disabled_at: null 
        })
        .eq('id', existingModule.id);
    } else {
      await supabase
        .from('tenant_modules')
        .insert({ 
          tenant_id: tenant.id, 
          module_key: moduleKey, 
          is_enabled: true 
        });
    }

    await fetchModules();
  }, [tenant?.id, modules, fetchModules]);

  const disableModule = useCallback(async (moduleKey: ModuleKey) => {
    if (!tenant?.id) return;

    const existingModule = modules.find(m => m.module_key === moduleKey);

    if (existingModule) {
      await supabase
        .from('tenant_modules')
        .update({ 
          is_enabled: false, 
          disabled_at: new Date().toISOString() 
        })
        .eq('id', existingModule.id);

      await fetchModules();
    }
  }, [tenant?.id, modules, fetchModules]);

  const value: ModuleContextType = {
    modules,
    enabledModules,
    isLoading: isLoading || tenantLoading,
    isModuleEnabled,
    isRouteEnabled,
    enableModule,
    disableModule,
    refetchModules: fetchModules,
  };

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModules must be used within a ModuleProvider');
  }
  return context;
}
