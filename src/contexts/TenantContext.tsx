import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tenant, TenantUser, TenantType } from '@/types/tenant';

interface TenantContextType {
  tenant: Tenant | null;
  tenantUser: TenantUser | null;
  isLoading: boolean;
  isOwner: boolean;
  hasTenant: boolean;
  refetchTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenant = useCallback(async () => {
    if (!user?.id) {
      setTenant(null);
      setTenantUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch tenant_user for the current user
      const { data: tenantUserData, error: tenantUserError } = await supabase
        .from('tenant_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (tenantUserError) {
        console.error('Error fetching tenant_user:', tenantUserError);
        setIsLoading(false);
        return;
      }

      if (!tenantUserData) {
        // User has no tenant assigned
        setTenant(null);
        setTenantUser(null);
        setIsLoading(false);
        return;
      }

      setTenantUser({
        id: tenantUserData.id,
        tenant_id: tenantUserData.tenant_id,
        user_id: tenantUserData.user_id,
        is_owner: tenantUserData.is_owner ?? false,
        is_active: tenantUserData.is_active ?? true,
        created_at: tenantUserData.created_at ?? '',
      });

      // Fetch the tenant details
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantUserData.tenant_id)
        .eq('is_active', true)
        .maybeSingle();

      if (tenantError) {
        console.error('Error fetching tenant:', tenantError);
        setIsLoading(false);
        return;
      }

      if (tenantData) {
        setTenant({
          id: tenantData.id,
          name: tenantData.name,
          slug: tenantData.slug,
          type: tenantData.type as TenantType,
          settings: (tenantData.settings as Record<string, unknown>) ?? {},
          logo_url: tenantData.logo_url,
          theme: (tenantData.theme as { primary: string }) ?? { primary: '#009688' },
          is_active: tenantData.is_active ?? true,
          created_at: tenantData.created_at ?? '',
          updated_at: tenantData.updated_at ?? '',
        });
      }
    } catch (error) {
      console.error('Error in fetchTenant:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      fetchTenant();
    }
  }, [authLoading, fetchTenant]);

  const value: TenantContextType = {
    tenant,
    tenantUser,
    isLoading: isLoading || authLoading,
    isOwner: tenantUser?.is_owner ?? false,
    hasTenant: !!tenant,
    refetchTenant: fetchTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
