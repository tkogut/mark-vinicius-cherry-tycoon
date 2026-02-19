import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const VolumeControl: React.FC = () => {
    const { isMuted, toggleMute } = useAudio();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className={isMuted ? "text-rose-400 hover:text-rose-300" : "text-emerald-400 hover:text-emerald-300"}
                    >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 border-slate-700 text-slate-100">
                    <p>{isMuted ? "Unmute Audio" : "Mute Audio"}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
