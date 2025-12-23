import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Plus, Pencil, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CadastroFormDialog } from './CadastroFormDialog';
import {
  useEquipes,
  useCreateEquipe,
  useUpdateEquipe,
  useEspecialidades,
  Equipe,
} from '@/hooks/useCadastros';

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  descricao: z.string().optional(),
  especialidade_id: z.string().optional(),
  ativo: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export function EquipesTab() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Equipe | null>(null);

  const { data: equipes, isLoading } = useEquipes();
  const { data: especialidades } = useEspecialidades();
  const createMutation = useCreateEquipe();
  const updateMutation = useUpdateEquipe();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', descricao: '', especialidade_id: '', ativo: true },
  });

  const filteredData = equipes?.filter((e) => e.nome.toLowerCase().includes(search.toLowerCase()));

  const handleNew = () => {
    setEditing(null);
    form.reset({ nome: '', descricao: '', especialidade_id: '', ativo: true });
    setDialogOpen(true);
  };

  const handleEdit = (item: Equipe) => {
    setEditing(item);
    form.reset({
      nome: item.nome,
      descricao: item.descricao || '',
      especialidade_id: item.especialidade_id || '',
      ativo: item.ativo,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, nome: data.nome, descricao: data.descricao || null, especialidade_id: data.especialidade_id || null, ativo: data.ativo });
    } else {
      await createMutation.mutateAsync({ nome: data.nome, descricao: data.descricao || null, especialidade_id: data.especialidade_id || null, ativo: data.ativo });
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
            placeholder="Buscar equipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Equipe
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredData?.length === 0 && (
          <p className="text-center text-muted-foreground py-8 col-span-full">Nenhuma equipe encontrada</p>
        )}
        {filteredData?.map((item) => (
          <Card key={item.id} className={!item.ativo ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary shrink-0" />
                    <h4 className="font-medium text-foreground truncate">{item.nome}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {item.especialidade?.nome && (
                      <Badge variant="outline" className="text-xs">
                        {item.especialidade.nome}
                      </Badge>
                    )}
                    {!item.ativo && <Badge variant="secondary">Inativa</Badge>}
                  </div>
                  {item.descricao && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.descricao}</p>
                  )}
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
        title={editing ? 'Editar Equipe' : 'Nova Equipe'}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Equipe</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="especialidade_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {especialidades?.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
