import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Palette, Upload, Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { TENANT_TYPE_LABELS, type TenantType } from '@/types/tenant';

const STEPS = [
  { id: 1, title: 'Informações', icon: Building2 },
  { id: 2, title: 'Logo', icon: Upload },
  { id: 3, title: 'Tema', icon: Palette },
];

const PRESET_COLORS = [
  { name: 'Teal', value: '#009688' },
  { name: 'Azul', value: '#2196F3' },
  { name: 'Verde', value: '#4CAF50' },
  { name: 'Roxo', value: '#9C27B0' },
  { name: 'Laranja', value: '#FF9800' },
  { name: 'Vermelho', value: '#F44336' },
];

export default function TenantOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refetchTenant } = useTenant();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<TenantType | ''>('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#009688');

  const canProceed = () => {
    if (currentStep === 1) {
      return name.trim().length >= 3 && type !== '';
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !type) {
      toast({
        title: 'Erro',
        description: 'Nome e tipo são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-tenant', {
        body: {
          name: name.trim(),
          type,
          logo_url: logoUrl || null,
          primary_color: primaryColor,
        },
      });

      if (error) {
        console.error('Error creating tenant:', error);
        toast({
          title: 'Erro ao criar estabelecimento',
          description: error.message || 'Tente novamente mais tarde',
          variant: 'destructive',
        });
        return;
      }

      if (data?.error) {
        toast({
          title: 'Erro',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso!',
        description: 'Seu estabelecimento foi criado com sucesso.',
      });

      // Refetch tenant data and navigate to dashboard
      await refetchTenant();
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                      ${isActive ? 'border-primary bg-primary text-primary-foreground' : ''}
                      ${isCompleted ? 'border-primary bg-primary/10 text-primary' : ''}
                      ${!isActive && !isCompleted ? 'border-muted-foreground/30 text-muted-foreground' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      step.id < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {currentStep === 1 && 'Informações do Estabelecimento'}
              {currentStep === 2 && 'Logo do Estabelecimento'}
              {currentStep === 3 && 'Personalização'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Preencha as informações básicas do seu estabelecimento'}
              {currentStep === 2 && 'Adicione um logo para identificar seu estabelecimento (opcional)'}
              {currentStep === 3 && 'Escolha a cor principal do seu sistema'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Estabelecimento *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Clínica São Lucas"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {name.length}/100 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Estabelecimento *</Label>
                  <Select value={type} onValueChange={(value) => setType(value as TenantType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TENANT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: Logo */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL do Logo</Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    placeholder="https://exemplo.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole a URL de uma imagem hospedada na internet
                  </p>
                </div>

                {/* Logo Preview */}
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/50">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="h-8 w-8 mx-auto mb-2" />
                        <span className="text-xs">Preview do logo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Theme */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Cor Principal</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setPrimaryColor(color.value)}
                        className={`
                          p-3 rounded-lg border-2 transition-all flex items-center gap-2
                          ${primaryColor === color.value ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-muted-foreground/30'}
                        `}
                        style={{ backgroundColor: `${color.value}15` }}
                      >
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-sm font-medium">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customColor">Ou escolha uma cor personalizada</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      id="customColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#009688"
                      maxLength={7}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <div className="flex items-center gap-3">
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-10 h-10 object-contain rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold" style={{ color: primaryColor }}>
                        {name || 'Nome do Estabelecimento'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {type ? TENANT_TYPE_LABELS[type as TenantType] : 'Tipo'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canProceed()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Criar Estabelecimento
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
