import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Plus, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CadastroFormDialog } from './CadastroFormDialog';
import {
  useEspecialidades,
  useCreateEspecialidade,
  useUpdateEspecialidade,
  Especialidade,
} from '@/hooks/useCadastros';

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  codigo: z.string().min(1, 'Código obrigatório'),
  descricao: z.string().optional(),
  cor_hex: z.string().optional(),
  ativo: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export function EspecialidadesTab() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Especialidade | null>(null);

  const { data: especialidades, isLoading } = useEspecialidades();
  const createMutation = useCreateEspecialidade();
  const updateMutation = useUpdateEspecialidade();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', codigo: '', descricao: '', cor_hex: '#3b82f6', ativo: true },
  });

  const filteredData = especialidades?.filter(
    (e) =>
      e.nome.toLowerCase().includes(search.toLowerCase()) ||
      e.codigo.toLowerCase().includes(search.toLowerCase())
  );

  const handleNew = () => {
    setEditing(null);
    form.reset({ nome: '', codigo: '', descricao: '', cor_hex: '#3b82f6', ativo: true });
    setDialogOpen(true);
  };

  const handleEdit = (item: Especialidade) => {
    setEditing(item);
    form.reset({
      nome: item.nome,
      codigo: item.codigo,
      descricao: item.descricao || '',
      cor_hex: item.cor_hex || '#3b82f6',
      ativo: item.ativo,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, nome: data.nome, codigo: data.codigo, descricao: data.descricao || null, cor_hex: data.cor_hex || null, ativo: data.ativo });
    } else {
      await createMutation.mutateAsync({ nome: data.nome, codigo: data.codigo, descricao: data.descricao || null, cor_hex: data.cor_hex || null, ativo: data.ativo });
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
            placeholder="Buscar especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nova Especialidade
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredData?.length === 0 && (
          <p className="text-center text-muted-foreground py-8 col-span-full">
            Nenhuma especialidade encontrada
          </p>
        )}
        {filteredData?.map((item) => (
          <Card key={item.id} className={!item.ativo ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.cor_hex && (
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.cor_hex }}
                      />
                    )}
                    <h4 className="font-medium text-foreground truncate">{item.nome}</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.codigo}
                    </Badge>
                    {!item.ativo && <Badge variant="secondary">Inativo</Badge>}
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
        title={editing ? 'Editar Especialidade' : 'Nova Especialidade'}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ODONTO" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cor_hex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} className="w-12 h-10 p-1" />
                        <Input {...field} placeholder="#3b82f6" className="flex-1" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
