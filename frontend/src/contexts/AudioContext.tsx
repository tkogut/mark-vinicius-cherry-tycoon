import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Howl, Howler } from 'howler';
import { SOUNDS } from '@/config/sounds';

interface AudioContextType {
    isMuted: boolean;
    volume: number;
    toggleMute: () => void;
    setVolume: (vol: number) => void;
    playSFX: (key: string, vol?: number) => void;
    playBGM: (key: string) => void;
    stopBGM: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        const saved = localStorage.getItem('mv_audio_muted');
        return saved ? JSON.parse(saved) : false;
    });

    const [volume, setVolumeState] = useState<number>(() => {
        const saved = localStorage.getItem('mv_audio_volume');
        return saved ? parseFloat(saved) : 0.5;
    });

    const bgmRef = useRef<Howl | null>(null);
    const currentBgmKey = useRef<string | null>(null);

    useEffect(() => {
        Howler.mute(isMuted);
        localStorage.setItem('mv_audio_muted', JSON.stringify(isMuted));
    }, [isMuted]);

    useEffect(() => {
        Howler.volume(volume);
        localStorage.setItem('mv_audio_volume', volume.toString());
    }, [volume]);

    const toggleMute = () => setIsMuted(prev => !prev);
    const setVolume = (vol: number) => setVolumeState(Math.max(0, Math.min(1, vol)));

    const playSFX = (src: string, vol: number = 1.0) => {
        if (isMuted) return;
        const sound = new Howl({
            src: [src],
            volume: vol,
            autoplay: true,
        });
    };

    const playBGM = (src: string) => {
        if (currentBgmKey.current === src && bgmRef.current?.playing()) return;

        if (bgmRef.current) {
            bgmRef.current.fade(volume, 0, 1000);
            setTimeout(() => {
                bgmRef.current?.stop();
            }, 1000);
        }

        const bgm = new Howl({
            src: [src],
            loop: true,
            volume: 0,
            html5: true, // Force HTML5 Audio for large files to assume streaming/caching
        });

        bgmRef.current = bgm;
        currentBgmKey.current = src;

        bgm.play();
        bgm.fade(0, volume * 0.5, 2000); // Fade in to 50% relative volume for BGM
    };

    const stopBGM = () => {
        if (bgmRef.current) {
            bgmRef.current.fade(volume * 0.5, 0, 1000);
            setTimeout(() => {
                bgmRef.current?.stop();
                currentBgmKey.current = null;
            }, 1000);
        }
    };

    // Initialize global mute/volume on mount
    useEffect(() => {
        Howler.mute(isMuted);
        Howler.volume(volume);
    }, []);

    // Helper to preload common sounds
    useEffect(() => {
        // Optional: Preload critical SFX
        new Howl({ src: [SOUNDS.UI.CLICK], preload: true });
        new Howl({ src: [SOUNDS.UI.SUCCESS], preload: true });
    }, []);

    return (
        <AudioContext.Provider value={{ isMuted, volume, toggleMute, setVolume, playSFX, playBGM, stopBGM }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
