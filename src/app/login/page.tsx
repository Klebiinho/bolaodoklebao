
import { login, signup } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string; error: string };
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 min-h-screen mx-auto">
      <div className="flex flex-col items-center mb-8 gap-2">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 border border-primary/20">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-headline font-black text-3xl tracking-tighter text-primary italic uppercase leading-none">
          Palpiteiro<span className="text-foreground">Pro</span>
        </h1>
        <p className="text-muted-foreground text-sm font-medium">Faça login para começar a palpitar</p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <form>
          <CardHeader>
            <CardTitle className="font-headline font-bold">Acesse sua conta</CardTitle>
            <CardDescription>
              Entre com seu e-mail ou crie uma conta nova.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="bg-secondary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-secondary/30"
              />
            </div>
            {searchParams?.error && (
              <p className="text-xs text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                {searchParams.error}
              </p>
            )}
            {searchParams?.message && (
              <p className="text-xs text-primary font-medium bg-primary/10 p-3 rounded-lg border border-primary/20 animate-in fade-in slide-in-from-top-1">
                {searchParams.message}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button formAction={login} className="w-full font-bold uppercase tracking-wider h-11">
              Entrar
            </Button>
            <Button
              formAction={signup}
              variant="outline"
              className="w-full font-bold uppercase tracking-wider h-11 border-border/50"
            >
              Cadastrar
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest mt-8">
        Copa do Mundo 2026 • Firebase Studio
      </p>
    </div>
  );
}
