import React, { useEffect, useState } from 'react';

interface WeatherEffectsProps {
    weatherState?: any[]; // Option type from backend, so array [] or [{weather: {'Rainy': null}, ...}]
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({ weatherState }) => {
    const [particles, setParticles] = useState<number[]>([]);

    const weatherEvent = weatherState && weatherState.length > 0 ? weatherState[0] : null;
    const weatherType = weatherEvent ? Object.keys(weatherEvent.weather)[0] : null;

    useEffect(() => {
        if (weatherType === 'Rainy' || weatherType === 'Frost') {
            // Generate random starting positions for particles
            const count = weatherType === 'Rainy' ? 100 : 50;
            const newParticles = Array.from({ length: count }, () => Math.random() * 100);
            setParticles(newParticles);
        } else {
            setParticles([]);
        }
    }, [weatherType]);

    if (!weatherType) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Rainy Effect */}
            {weatherType === 'Rainy' && (
                <div className="absolute inset-0 bg-blue-900/10">
                    {particles.map((left, i) => (
                        <div
                            key={i}
                            className="absolute top-0 w-[2px] h-12 bg-blue-400/50"
                            style={{
                                left: `${left}%`,
                                animation: `rain-fall ${0.5 + Math.random()}s linear infinite`,
                                animationDelay: `-${Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Frost/Snow Effect */}
            {weatherType === 'Frost' && (
                <div className="absolute inset-0 bg-slate-900/10">
                    {particles.map((left, i) => (
                        <div
                            key={i}
                            className="absolute top-0 w-2 h-2 rounded-full bg-white/70 filter blur-[1px]"
                            style={{
                                left: `${left}%`,
                                animation: `snow-drift ${3 + Math.random() * 3}s linear infinite`,
                                animationDelay: `-${Math.random() * 4}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Heatwave / Drought Effect */}
            {(weatherType === 'Heatwave' || weatherType === 'Drought') && (
                <div className="absolute inset-0 bg-orange-600/10 mix-blend-overlay">
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"
                        style={{ animation: 'heat-pulse 4s ease-in-out infinite' }}
                    />
                </div>
            )}

            {/* Sunny Effect */}
            {weatherType === 'Sunny' && (
                <div className="absolute inset-0 bg-yellow-400/5 mix-blend-overlay flex justify-end">
                    <div
                        className="w-[150vw] h-[150vh] absolute -top-[50vh] -right-[50vw] bg-[radial-gradient(circle_at_center,rgba(253,224,71,0.15),transparent_40%)]"
                        style={{ animation: 'sun-beam 8s ease-in-out infinite', transformOrigin: 'center' }}
                    />
                </div>
            )}
        </div>
    );
};
