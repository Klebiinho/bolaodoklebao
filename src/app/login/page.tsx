
'use client';

import { use, useState, useEffect } from 'react';
import { login, signup } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage(props: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const resolvedParams = use(props.searchParams);
  const loginError = resolvedParams.error;
  const loginMessage = resolvedParams.message;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evita Hydration Mismatch renderizando um estado estável até que o cliente esteja montado
  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Aguardando arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4 border border-primary/20 shadow-2xl shadow-primary/10 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-headline font-black text-4xl tracking-tighter text-primary italic uppercase leading-none">
            Palpiteiro<span className="text-foreground">Pro</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium tracking-wide">COPA DO MUNDO 2026 • O BOLÃO OFICIAL</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-xl mb-6">
            <TabsTrigger value="login" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">Entrar</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
              <form action={login}>
                <CardHeader>
                  <CardTitle className="font-headline font-bold text-xl">Bem-vindo de volta!</CardTitle>
                  <CardDescription>Acesse sua conta para continuar seus palpites.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-login"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        className="bg-secondary/30 pl-10 h-11 border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-login">Senha</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-login"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="bg-secondary/30 pl-10 h-11 border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full font-bold uppercase tracking-widest h-12 text-xs group">
                    Entrar na Arena
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
              <form action={signup}>
                <CardHeader>
                  <CardTitle className="font-headline font-bold text-xl">Crie sua conta</CardTitle>
                  <CardDescription>Entre na disputa pelo título de maior palpiteiro.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-signup">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name-signup"
                        name="name"
                        type="text"
                        placeholder="Como quer ser chamado?"
                        required
                        className="bg-secondary/30 pl-10 h-11 border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-signup"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        className="bg-secondary/30 pl-10 h-11 border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-signup"
                        name="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        required
                        className="bg-secondary/30 pl-10 h-11 border-border/50 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" variant="secondary" className="w-full font-bold uppercase tracking-widest h-12 text-xs border border-primary/20 hover:bg-primary/10 hover:text-primary transition-all">
                    Começar a Palpitar
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {loginError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl animate-in shake duration-500">
            <p className="text-xs text-destructive font-bold text-center uppercase tracking-wider leading-relaxed">
              {loginError}
            </p>
          </div>
        )}
        {loginMessage && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl animate-in zoom-in duration-500">
            <p className="text-xs text-primary font-bold text-center uppercase tracking-wider leading-relaxed">
              {loginMessage}
            </p>
          </div>
        )}

        <footer className="text-center">
          <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.3em] opacity-50">
            FEITO POR KLEBER VENÂNCIO
          </p>
        </footer>
      </div>
    </div>
  );
}
