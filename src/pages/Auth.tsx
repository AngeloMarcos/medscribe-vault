import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Activity, ArrowLeft } from "lucide-react";
import { authSchema } from "@/lib/validationSchemas";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { z } from "zod";

type AuthMode = "login" | "signup" | "forgot-password" | "reset-password";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres"),
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

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
    if (loading) return "Aguarde...";
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-premium">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Activity className="h-9 w-9 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">MedFlow</CardTitle>
          <CardDescription>{getTitle()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {mode !== "forgot-password" && (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={128}
                  required
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
            )}

            {mode === "signup" && (
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  maxLength={128}
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {getButtonText()}
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-center text-sm">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot-password");
                    setErrors({});
                  }}
                  className="block w-full text-muted-foreground hover:text-primary hover:underline"
                >
                  Esqueceu a senha?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrors({});
                    setPassword("");
                  }}
                  className="block w-full text-primary hover:underline"
                >
                  Não tem conta? Criar
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
                className="flex items-center justify-center gap-1 w-full text-primary hover:underline"
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
                className="flex items-center justify-center gap-1 w-full text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao login
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
