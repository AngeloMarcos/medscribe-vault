import { useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileDown,
  FileSpreadsheet,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReportStats } from "@/hooks/useDashboardStats";
import { toast } from "sonner";

export default function Relatorios() {
  const today = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(today), 'yyyy-MM-dd'));
  const [quickFilter, setQuickFilter] = useState("month");

  const { profissionalStats, periodStats, isLoading } = useReportStats(startDate, endDate);

  const handleQuickFilter = (value: string) => {
    setQuickFilter(value);
    const now = new Date();
    
    switch (value) {
      case "week":
        setStartDate(format(subMonths(now, 0), 'yyyy-MM-dd').slice(0, 8) + '01');
        setEndDate(format(now, 'yyyy-MM-dd'));
        break;
      case "month":
        setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
        break;
      case "quarter":
        setStartDate(format(subMonths(now, 3), 'yyyy-MM-dd'));
        setEndDate(format(now, 'yyyy-MM-dd'));
        break;
    }
  };

  const escapeHtml = (v: unknown): string =>
    String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const exportToPDF = () => {
    // Criar conteúdo para impressão
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Não foi possível abrir a janela de impressão");
      return;
    }

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Produção</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #00A896; padding-bottom: 10px; }
          .period { color: #666; margin-bottom: 20px; }
          .summary { display: flex; gap: 20px; margin-bottom: 30px; }
          .summary-card { background: #f5f5f5; padding: 15px; border-radius: 8px; flex: 1; }
          .summary-card h3 { margin: 0 0 5px 0; font-size: 14px; color: #666; }
          .summary-card p { margin: 0; font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f8f9fa; font-weight: 600; }
          .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .badge-success { background: #dcfce7; color: #166534; }
          .badge-warning { background: #fef3c7; color: #92400e; }
          .badge-danger { background: #fee2e2; color: #991b1b; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>Relatório de Produção por Profissional</h1>
        <p class="period">Período: ${format(new Date(startDate), 'dd/MM/yyyy')} a ${format(new Date(endDate), 'dd/MM/yyyy')}</p>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Total de Consultas</h3>
            <p>${periodStats?.total || 0}</p>
          </div>
          <div class="summary-card">
            <h3>Finalizadas</h3>
            <p style="color: #16a34a;">${periodStats?.finalizados || 0}</p>
          </div>
          <div class="summary-card">
            <h3>Ausentes</h3>
            <p style="color: #dc2626;">${periodStats?.ausentes || 0}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Especialidade</th>
              <th>Total</th>
              <th>Finalizados</th>
              <th>Ausentes</th>
              <th>Taxa Comp.</th>
            </tr>
          </thead>
          <tbody>
            ${profissionalStats?.map(p => `
              <tr>
                <td>${escapeHtml(p.nome)}</td>
                <td>${escapeHtml(p.especialidade)}</td>
                <td>${escapeHtml(p.total_consultas)}</td>
                <td>${escapeHtml(p.finalizados)}</td>
                <td>${escapeHtml(p.ausentes)}</td>
                <td>
                  <span class="badge ${p.taxa_comparecimento >= 80 ? 'badge-success' : p.taxa_comparecimento >= 50 ? 'badge-warning' : 'badge-danger'}">
                    ${escapeHtml(p.taxa_comparecimento)}%
                  </span>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="6">Nenhum dado encontrado</td></tr>'}
          </tbody>
        </table>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    toast.success("Relatório PDF gerado!");
  };

  const exportToExcel = () => {
    if (!profissionalStats || profissionalStats.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    // Criar CSV
    const headers = ["Profissional", "Especialidade", "Total Consultas", "Finalizados", "Ausentes", "Taxa Comparecimento"];
    const rows = profissionalStats.map(p => [
      p.nome,
      p.especialidade,
      p.total_consultas,
      p.finalizados,
      p.ausentes,
      `${p.taxa_comparecimento}%`
    ]);

    const csv = [headers, ...rows].map(row => row.join(";")).join("\n");
    
    // Download
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_producao_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast.success("Arquivo Excel (CSV) exportado!");
  };

  const getTaxaBadge = (taxa: number) => {
    if (taxa >= 80) return <Badge className="bg-success/15 text-success border-success/30">{taxa}%</Badge>;
    if (taxa >= 50) return <Badge className="bg-warning/15 text-warning border-warning/30">{taxa}%</Badge>;
    return <Badge className="bg-destructive/15 text-destructive border-destructive/30">{taxa}%</Badge>;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-page-title">Relatórios</h1>
          <p className="text-caption mt-1">Produção por profissional e estatísticas</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={exportToPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border border-border shadow-sm rounded-2xl">
        <CardHeader className="pb-4 px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <CardTitle className="text-card-title">Filtros</CardTitle>
              <CardDescription className="text-caption mt-0.5">Selecione o período do relatório</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Período Rápido</Label>
              <Select value={quickFilter} onValueChange={handleQuickFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="lastMonth">Mês Anterior</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Data Final</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border border-border shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-muted">
                <BarChart3 className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Consultas</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{periodStats?.total || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/15">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Finalizadas</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-success">{periodStats?.finalizados || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/15">
                <Users className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ausentes</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-destructive">{periodStats?.ausentes || 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/15">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa Geral</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-primary">
                    {periodStats?.total && periodStats.total > 0
                      ? Math.round(((periodStats.total - (periodStats.ausentes || 0)) / periodStats.total) * 100)
                      : 0}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professionals Table */}
      <Card className="bg-card border border-border shadow-sm rounded-2xl">
        <CardHeader className="pb-4 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-card-title">Produção por Profissional</CardTitle>
                <CardDescription className="text-caption mt-0.5">
                  {format(new Date(startDate), "dd/MM/yyyy", { locale: ptBR })} - {format(new Date(endDate), "dd/MM/yyyy", { locale: ptBR })}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : profissionalStats && profissionalStats.length > 0 ? (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Profissional</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Finalizados</TableHead>
                    <TableHead className="text-center">Ausentes</TableHead>
                    <TableHead className="text-center">Taxa Comp.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profissionalStats.map((prof) => (
                    <TableRow key={prof.id}>
                      <TableCell className="font-medium">{prof.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{prof.especialidade}</TableCell>
                      <TableCell className="text-center font-semibold">{prof.total_consultas}</TableCell>
                      <TableCell className="text-center text-success">{prof.finalizados}</TableCell>
                      <TableCell className="text-center text-destructive">{prof.ausentes}</TableCell>
                      <TableCell className="text-center">{getTaxaBadge(prof.taxa_comparecimento)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dado encontrado para o período selecionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
