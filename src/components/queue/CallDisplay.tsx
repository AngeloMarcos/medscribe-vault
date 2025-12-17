import { useEffect, useState, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { useCallHistory } from '@/hooks/useQueueTickets';
import { cn } from '@/lib/utils';

export function CallDisplay() {
  const { history } = useCallHistory();
  const [currentCall, setCurrentCall] = useState<{ ticket: string; guiche: string } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const lastCallIdRef = useRef<string | null>(null);

  // Detect new calls and trigger animation
  useEffect(() => {
    if (history.length > 0) {
      const latestCall = history[0];
      if (latestCall.id !== lastCallIdRef.current) {
        lastCallIdRef.current = latestCall.id;
        setCurrentCall({
          ticket: latestCall.ticket_number,
          guiche: latestCall.guiche,
        });
        setIsAnimating(true);

        // Speak the call
        speakCall(latestCall.ticket_number, latestCall.guiche);

        // Reset animation after a delay
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [history]);

  const speakCall = (ticket: string, guiche: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(
        `Senha ${ticket.split('').join(' ')}, ${guiche}`
      );
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel de Chamadas</h1>
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            <span className="text-sm">Áudio Ativado</span>
          </div>
        </div>
      </header>

      {/* Main display */}
      <main className="flex-1 container mx-auto p-8 flex flex-col items-center justify-center">
        {currentCall ? (
          <div
            className={cn(
              'text-center transition-all duration-500',
              isAnimating && 'animate-pulse scale-110'
            )}
          >
            <p className="text-muted-foreground text-xl mb-4">Senha Chamada</p>
            <div
              className={cn(
                'bg-card rounded-3xl shadow-2xl p-12 border-4',
                isAnimating ? 'border-primary' : 'border-transparent'
              )}
            >
              <p className="text-8xl md:text-9xl font-black text-primary tracking-wider">
                {currentCall.ticket}
              </p>
              <div className="mt-8 text-3xl md:text-4xl font-semibold text-muted-foreground">
                {currentCall.guiche}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-4xl font-light">Aguardando chamadas...</p>
          </div>
        )}

        {/* Recent calls */}
        <div className="mt-12 w-full max-w-2xl">
          <h2 className="text-lg font-semibold text-muted-foreground mb-4 text-center">
            Últimas Chamadas
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {history.slice(1, 6).map((call) => (
              <div
                key={call.id}
                className="bg-card/50 rounded-xl p-4 text-center border border-border/50"
              >
                <p className="text-2xl font-bold text-foreground">{call.ticket_number}</p>
                <p className="text-sm text-muted-foreground">{call.guiche}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer with time */}
      <footer className="bg-card border-t border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <p className="text-muted-foreground">Sistema de Filas - HealthFlow</p>
          <p className="text-xl font-mono">
            {new Date().toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </footer>
    </div>
  );
}
