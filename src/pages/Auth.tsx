import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Activity, ArrowLeft, Mail, Lock, Loader2 } from "lucide-react";
import { authSchema } from "@/lib/validationSchemas";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { z } from "zod";

type AuthMode = "login" | "signup" | "forgot-password" | "reset-password";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Mostrar loading enquanto verifica autenticação inicial
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(186,98%,20%)] via-[hsl(180,95%,28%)] to-[hsl(180,96%,38%)]">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  const handleLogin = async () => {
    setErrors({});
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      });
      if (error) throw error;
      
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
      
      // O useEffect irá redirecionar automaticamente quando isAuthenticated mudar
    } catch (error: any) {
      toast({
        title: "Erro",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setErrors({});
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "As senhas não conferem" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      toast({
        title: "Conta criada!",
        description: "Você pode fazer login agora.",
      });
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrors({});
    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir a senha.",
      });
      setMode("login");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      await handleLogin();
    } else if (mode === "signup") {
      await handleSignUp();
    } else if (mode === "forgot-password") {
      await handleForgotPassword();
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Entre na sua conta";
      case "signup":
        return "Criar nova conta";
      case "forgot-password":
        return "Recuperar senha";
      default:
        return "";
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case "login":
        return "Entrar";
      case "signup":
        return "Criar conta";
      case "forgot-password":
        return "Enviar email";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradiente de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(186,98%,20%)] via-[hsl(180,95%,28%)] to-[hsl(180,96%,38%)]" />
      
      {/* Círculos decorativos com blur */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[hsl(180,96%,38%)]/30 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-[hsl(180,95%,28%)]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Card com glassmorphism */}
      <Card className="relative z-10 w-full max-w-md mx-4 backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-2">
          {/* Logo/Ícone */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-white tracking-tight">
              MedFlow
            </CardTitle>
            <CardDescription className="text-white/70 text-base mt-1">
              {getTitle()}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          <form onSubmit={handleAuth} className="space-y-4">
            {/* Campo Email */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                  required
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20 h-12"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-300 pl-1">{errors.email}</p>
              )}
            </div>

            {/* Campo Senha */}
            {mode !== "forgot-password" && (
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                  <Input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={128}
                    required
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20 h-12"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-300 pl-1">{errors.password}</p>
                )}
              </div>
            )}

            {/* Confirmar Senha (Signup) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                  <Input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    maxLength={128}
                    required
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-white/20 h-12"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-300 pl-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Botão de ação */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-white/90 hover:bg-white text-[hsl(186,98%,20%)] font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {getButtonText()}
            </Button>
          </form>

          {/* Links de navegação */}
          <div className="mt-6 space-y-3 text-center">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot-password");
                    setErrors({});
                  }}
                  className="block w-full text-white/60 hover:text-white text-sm transition-colors"
                >
                  Esqueceu a senha?
                </button>
                <div className="h-px bg-white/20 my-4" />
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrors({});
                    setPassword("");
                  }}
                  className="block w-full text-white hover:text-white/80 font-medium transition-colors"
                >
                  Não tem conta? <span className="underline underline-offset-2">Criar agora</span>
                </button>
              </>
            )}

            {mode === "signup" && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrors({});
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="flex items-center justify-center gap-2 w-full text-white hover:text-white/80 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </button>
            )}

            {mode === "forgot-password" && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrors({});
                }}
                className="flex items-center justify-center gap-2 w-full text-white hover:text-white/80 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-white/40 text-sm">
          © {new Date().getFullYear()} MedFlow — Sistema de Gestão Hospitalar
        </p>
      </div>
    </div>
  );
};

export default Auth;
