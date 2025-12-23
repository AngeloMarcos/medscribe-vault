import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Plus, Pencil, Loader2, DoorOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CadastroFormDialog } from './CadastroFormDialog';
import { useSalas, useCreateSala, useUpdateSala, Sala } from '@/hooks/useCadastros';

const schema = z.object({
  numero: z.string().min(1, 'Número obrigatório'),
  nome: z.string().optional(),
  andar: z.string().optional(),
  tipo: z.string().optional(),
  capacidade: z.number().min(1).default(1),
  ativo: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export function SalasTab() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Sala | null>(null);

  const { data: salas, isLoading } = useSalas();
  const createMutation = useCreateSala();
  const updateMutation = useUpdateSala();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { numero: '', nome: '', andar: '', tipo: 'consultorio', capacidade: 1, ativo: true },
  });

  const filteredData = salas?.filter(
    (s) =>
      s.numero.toLowerCase().includes(search.toLowerCase()) ||
      (s.nome && s.nome.toLowerCase().includes(search.toLowerCase()))
  );

  const handleNew = () => {
    setEditing(null);
    form.reset({ numero: '', nome: '', andar: '', tipo: 'consultorio', capacidade: 1, ativo: true });
    setDialogOpen(true);
  };

  const handleEdit = (item: Sala) => {
    setEditing(item);
    form.reset({
      numero: item.numero,
      nome: item.nome || '',
      andar: item.andar || '',
      tipo: item.tipo || 'consultorio',
      capacidade: item.capacidade,
      ativo: item.ativo,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, numero: data.numero, nome: data.nome || null, andar: data.andar || null, tipo: data.tipo || null, capacidade: data.capacidade, ativo: data.ativo });
    } else {
      await createMutation.mutateAsync({ numero: data.numero, nome: data.nome || null, andar: data.andar || null, tipo: data.tipo || null, capacidade: data.capacidade, equipamentos: null, ativo: data.ativo });
    }
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sala..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Sala
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredData?.length === 0 && (
          <p className="text-center text-muted-foreground py-8 col-span-full">Nenhuma sala encontrada</p>
        )}
        {filteredData?.map((item) => (
          <Card key={item.id} className={!item.ativo ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-primary shrink-0" />
                    <h4 className="font-medium text-foreground">Sala {item.numero}</h4>
                  </div>
                  {item.nome && <p className="text-sm text-muted-foreground mt-1">{item.nome}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {item.andar && (
                      <Badge variant="outline" className="text-xs">
                        {item.andar}º andar
                      </Badge>
                    )}
                    {item.tipo && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {item.tipo}
                      </Badge>
                    )}
                    {!item.ativo && <Badge variant="destructive">Inativa</Badge>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CadastroFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Editar Sala' : 'Nova Sala'}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="andar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Andar</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Consultório Odontológico" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="consultorio">Consultório</SelectItem>
                        <SelectItem value="procedimento">Procedimento</SelectItem>
                        <SelectItem value="exame">Exame</SelectItem>
                        <SelectItem value="espera">Espera</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editing ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </CadastroFormDialog>
    </div>
  );
}
