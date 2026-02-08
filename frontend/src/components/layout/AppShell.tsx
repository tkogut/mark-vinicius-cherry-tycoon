import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Edit3 } from 'lucide-react';
import { LoginButton } from '../auth/LoginButton';
import { SiFacebook } from 'react-icons/si';

export function AppShell() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[oklch(0.75_0.15_30)] to-[oklch(0.65_0.18_15)] flex items-center justify-center text-white font-bold text-lg shadow-md">
                MV
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight">Mark Vinicius Cherry Tycoon</h1>
                <p className="text-xs text-muted-foreground">Game Design Document</p>
              </div>
            </div>
            <LoginButton />
          </div>

          {/* Navigation Tabs */}
          <Tabs value={currentPath} className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-auto">
              <TabsTrigger
                value="/"
                onClick={() => navigate({ to: '/' })}
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="w-4 h-4" />
                <span className="font-medium">GDD</span>
              </TabsTrigger>
              <TabsTrigger
                value="/plan-input"
                onClick={() => navigate({ to: '/plan-input' })}
                className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Edit3 className="w-4 h-4" />
                <span className="font-medium">Plan Input</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto print:hidden">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1 flex-wrap">
            © 2026. Built with{' '}
            <span className="text-[oklch(0.65_0.18_15)]">❤</span> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
