import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Plus, Pencil, UserX, Phone, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CadastroFormDialog } from './CadastroFormDialog';
import {
  useProfissionais,
  useCreateProfissional,
  useUpdateProfissional,
  useDeleteProfissional,
  useEspecialidades,
  Profissional,
} from '@/hooks/useCadastros';

const profissionalSchema = z.object({
  nome: z.string().min(3, 'Nome obrigatório'),
  cpf: z.string().min(11, 'CPF obrigatório'),
  registro_profissional: z.string().min(1, 'Registro obrigatório'),
  tipo_registro: z.string().min(1, 'Tipo obrigatório'),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  especialidade_id: z.string().optional(),
  ativo: z.boolean().default(true),
});

type FormData = z.infer<typeof profissionalSchema>;

export function ProfissionaisTab() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Profissional | null>(null);

  const { data: profissionais, isLoading } = useProfissionais();
  const { data: especialidades } = useEspecialidades();
  const createMutation = useCreateProfissional();
  const updateMutation = useUpdateProfissional();
  const deleteMutation = useDeleteProfissional();

  const form = useForm<FormData>({
    resolver: zodResolver(profissionalSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      registro_profissional: '',
      tipo_registro: 'CRM',
      telefone: '',
      email: '',
      especialidade_id: '',
      ativo: true,
    },
  });

  const filteredData = profissionais?.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.registro_profissional.toLowerCase().includes(search.toLowerCase())
  );

  const handleNew = () => {
    setEditing(null);
    form.reset({
      nome: '',
      cpf: '',
      registro_profissional: '',
      tipo_registro: 'CRM',
      telefone: '',
      email: '',
      especialidade_id: '',
      ativo: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (item: Profissional) => {
    setEditing(item);
    form.reset({
      nome: item.nome,
      cpf: item.cpf,
      registro_profissional: item.registro_profissional,
      tipo_registro: item.tipo_registro,
      telefone: item.telefone || '',
      email: item.email || '',
      especialidade_id: item.especialidade_id || '',
      ativo: item.ativo,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, ...data, telefone: data.telefone || null, email: data.email || null, especialidade_id: data.especialidade_id || null });
    } else {
      await createMutation.mutateAsync({ nome: data.nome, cpf: data.cpf, registro_profissional: data.registro_profissional, tipo_registro: data.tipo_registro, telefone: data.telefone || null, email: data.email || null, especialidade_id: data.especialidade_id || null, equipe_id: null, ativo: data.ativo });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar profissional..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Profissional
        </Button>
      </div>

      {/* List */}
      <div className="grid gap-3">
        {filteredData?.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhum profissional encontrado</p>
        )}
        {filteredData?.map((item) => (
          <Card key={item.id} className={!item.ativo ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-foreground truncate">{item.nome}</h4>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {item.tipo_registro} {item.registro_profissional}
                    </Badge>
                    {!item.ativo && <Badge variant="secondary">Inativo</Badge>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    {item.especialidade?.nome && <span>{item.especialidade.nome}</span>}
                    {item.telefone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {item.telefone}
                      </span>
                    )}
                    {item.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {item.email}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {item.ativo && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <UserX className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <CadastroFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? 'Editar Profissional' : 'Novo Profissional'}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
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
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="000.000.000-00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tipo_registro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Registro</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CRM">CRM</SelectItem>
                        <SelectItem value="CRO">CRO</SelectItem>
                        <SelectItem value="COREN">COREN</SelectItem>
                        <SelectItem value="CRF">CRF</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="registro_profissional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Registro</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="12345" />
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

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(00) 00000-0000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
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
