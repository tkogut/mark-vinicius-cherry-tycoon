import React, { useState } from 'react';
import { FastForward, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdvanceSeasonButtonProps {
    onAdvance: () => Promise<void>;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
}

export const AdvanceSeasonButton: React.FC<AdvanceSeasonButtonProps> = ({
    onAdvance,
    isLoading = false,
    disabled = false,
    className,
}) => {
    const [isAdvancing, setIsAdvancing] = useState(false);

    const handleClick = async () => {
        setIsAdvancing(true);
        try {
            await onAdvance();
        } finally {
            setIsAdvancing(false);
        }
    };

    const loading = isLoading || isAdvancing;

    return (
        <Button
            onClick={handleClick}
            disabled={disabled || loading}
            variant="default"
            size="sm"
            className={cn(
                "gap-2 bg-purple-600 hover:bg-purple-700 text-white",
                className
            )}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <FastForward className="h-4 w-4" />
            )}
            Advance Season
        </Button>
    );
};
