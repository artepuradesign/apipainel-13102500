import { useState, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/services/api";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultToRegister?: boolean;
}

const LoginModal = ({ isOpen, onClose, defaultToRegister = false }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(!defaultToRegister);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sincronizar estado com prop quando modal abre
  useEffect(() => {
    if (isOpen) {
      setIsLogin(!defaultToRegister);
    }
  }, [isOpen, defaultToRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/login.php' : '/cadastro.php';
      const body = isLogin 
        ? { email, senha: password }
        : { nome, email, senha: password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao processar requisição');
      }

      // Salvar dados do usuário
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('usuario', JSON.stringify(data.data.usuario));

      // Compatibilidade com páginas administrativas
      if (data.data.usuario.tipo === 'admin') {
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.data.usuario));
        sessionStorage.setItem('adminToken', data.data.token);
        sessionStorage.setItem('adminUser', JSON.stringify(data.data.usuario));
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
      }

      toast({
        title: isLogin ? "Login realizado!" : "Cadastro realizado!",
        description: `Bem-vindo, ${data.data.usuario.nome}!`,
      });

      // Limpar formulário
      setNome("");
      setEmail("");
      setPassword("");
      onClose();

      // Recarregar a página para atualizar o estado de autenticação
      // Isso garante que o useAuth detecte o novo login
      if (data.data.usuario.tipo === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        // Se estiver no checkout, apenas recarregar para continuar a compra
        window.location.reload();
      }

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao processar requisição",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNome("");
    setEmail("");
    setPassword("");
    setIsLogin(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] max-w-[400px] p-0 overflow-hidden">
        {/* Header with logo and security badge */}
        <div className="bg-background border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <span className="text-xl font-bold text-foreground">iPlace</span>
              <span className="text-xs text-muted-foreground ml-1">seminovos</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">100% seguro</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {isLogin ? "Fazer login" : "Criar conta"}
              </DialogTitle>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                {isLogin ? "Não sou cadastrado" : "Já tenho conta"}
              </button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Nome completo*
                </label>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full"
                  required={!isLogin}
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Email*
              </label>
              <Input
                type="email"
                placeholder="nome@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Senha*
              </label>
              <Input
                type="password"
                placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            {isLogin && (
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Não sei a minha senha
              </button>
            )}

            <Button
              type="submit"
              className="w-full bg-foreground hover:bg-foreground/90 text-background font-medium py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aguarde...
                </>
              ) : (
                isLogin ? "Entrar" : "Criar conta"
              )}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full py-6 flex items-center justify-center gap-3"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Entrar com Facebook
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
