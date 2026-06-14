
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">Aguardando arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 transition-all duration-300">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-headline font-black text-4xl tracking-tighter text-primary italic uppercase leading-none">
            Bolão do <span className="text-foreground">Klebão</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mt-2">COPA DO MUNDO 2026 • O BOLÃO OFICIAL</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-border p-0 mb-6 h-12">
            <TabsTrigger value="login" className="rounded-none font-semibold uppercase text-[10px] tracking-widest data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-b-primary h-full">Entrar</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-none font-semibold uppercase text-[10px] tracking-widest data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-b-primary h-full">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="focus-visible:outline-none">
            <Card className="border border-border/50 bg-card rounded-xl shadow-sm">
              <form action={login}>
                <CardHeader>
                  <CardTitle className="font-headline font-bold text-xl uppercase tracking-tight">Bem-vindo de volta!</CardTitle>
                  <CardDescription className="text-xs">Acesse sua conta para continuar seus palpites.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login" className="text-xs font-bold uppercase tracking-wider">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-login"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background pl-10 h-12 border border-border rounded-md focus-visible:border-primary focus:border-primary transition-all focus:ring-0 focus-visible:ring-0 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-login" className="text-xs font-bold uppercase tracking-wider">Senha</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-login"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background pl-10 h-12 border border-border rounded-md focus-visible:border-primary focus:border-primary transition-all focus:ring-0 focus-visible:ring-0 shadow-sm"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full font-semibold uppercase tracking-widest h-12 text-xs group rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">
                    Entrar na Arena
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="focus-visible:outline-none">
            <Card className="border border-border/50 bg-card rounded-xl shadow-sm">
              <form action={signup}>
                <CardHeader>
                  <CardTitle className="font-headline font-bold text-xl uppercase tracking-tight">Crie sua conta</CardTitle>
                  <CardDescription className="text-xs">Entre na disputa pelo título de campeão do bolão.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-signup" className="text-xs font-bold uppercase tracking-wider">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name-signup"
                        name="name"
                        type="text"
                        placeholder="Como quer ser chamado?"
                        required
                        className="bg-background pl-10 h-12 border border-border rounded-md focus-visible:border-primary focus:border-primary transition-all focus:ring-0 focus-visible:ring-0 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup" className="text-xs font-bold uppercase tracking-wider">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-signup"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background pl-10 h-12 border border-border rounded-md focus-visible:border-primary focus:border-primary transition-all focus:ring-0 focus-visible:ring-0 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup" className="text-xs font-bold uppercase tracking-wider">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-signup"
                        name="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background pl-10 h-12 border border-border rounded-md focus-visible:border-primary focus:border-primary transition-all focus:ring-0 focus-visible:ring-0 shadow-sm"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full font-semibold uppercase tracking-widest h-12 text-xs rounded-md border border-border/50 bg-background text-foreground hover:bg-secondary transition-all shadow-sm">
                    Começar a Palpitar
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {loginError && (
          <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-none animate-in shake duration-500">
            <p className="text-xs text-destructive font-bold text-center uppercase tracking-wider leading-relaxed">
              {loginError}
            </p>
          </div>
        )}
        {loginMessage && (
          <div className="p-4 bg-primary/10 border-2 border-primary rounded-none animate-in zoom-in duration-500">
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
