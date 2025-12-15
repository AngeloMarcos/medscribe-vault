import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TenantAuditLogs } from '@/components/admin/TenantAuditLogs';
import UserActivityLogs from '@/components/admin/UserActivityLogs';
import { Shield, Activity } from 'lucide-react';

export default function AuditLogs() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Auditoria</h1>
        <p className="text-muted-foreground">
          Histórico de alterações em permissões, módulos e configurações
        </p>
      </div>

      <Tabs defaultValue="tenant" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tenant" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Logs do Tenant
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Atividade Geral
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenant" className="mt-6">
          <TenantAuditLogs />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <UserActivityLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
