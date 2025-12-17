import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ticket, Monitor, Headphones, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketGenerator } from '@/components/queue/TicketGenerator';
import { OperatorPanel } from '@/components/queue/OperatorPanel';
import { CallDisplay } from '@/components/queue/CallDisplay';

export default function PainelChamador() {
  const [showDisplay, setShowDisplay] = useState(false);

  // Full screen display mode
  if (showDisplay) {
    return (
      <div className="fixed inset-0 z-50">
        <CallDisplay />
        <Button
          variant="secondary"
          className="fixed bottom-4 right-4 z-50"
          onClick={() => setShowDisplay(false)}
        >
          Fechar Painel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 pt-16 lg:pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Chamador</h1>
          <p className="text-muted-foreground">
            Gerencie senhas e chamadas de atendimento
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowDisplay(true)}
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir Painel de Exibição
        </Button>
      </div>

      {/* Main content */}
      <Tabs defaultValue="operator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="tickets" className="gap-2">
            <Ticket className="h-4 w-4" />
            <span className="hidden sm:inline">Senhas</span>
          </TabsTrigger>
          <TabsTrigger value="operator" className="gap-2">
            <Headphones className="h-4 w-4" />
            <span className="hidden sm:inline">Operador</span>
          </TabsTrigger>
          <TabsTrigger value="display" className="gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Painel</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <div className="max-w-md mx-auto">
            <TicketGenerator />
          </div>
        </TabsContent>

        <TabsContent value="operator">
          <div className="max-w-2xl mx-auto">
            <OperatorPanel />
          </div>
        </TabsContent>

        <TabsContent value="display">
          <div className="rounded-xl border bg-card overflow-hidden aspect-video">
            <CallDisplay />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
