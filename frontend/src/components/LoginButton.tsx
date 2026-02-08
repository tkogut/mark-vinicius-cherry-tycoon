import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

export const LoginButton: React.FC = () => {
    const { isAuthenticated, login, logout, identity } = useAuth();

    if (isAuthenticated) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground hidden md:inline-block">
                    {identity?.getPrincipal().toText().slice(0, 5)}...{identity?.getPrincipal().toText().slice(-5)}
                </span>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <Button variant="default" size="sm" onClick={login} className="gap-2 bg-red-600 hover:bg-red-700">
            <User className="h-4 w-4" />
            Login with II
        </Button>
    );
};
