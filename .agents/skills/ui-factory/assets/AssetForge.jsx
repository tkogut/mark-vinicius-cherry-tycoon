import React, { useState } from 'react';
import { Sparkles, Download, ThermometerSnowflake, Sun, Leaf, CloudRain, Loader2 } from 'lucide-react';

/**
 * ASSET FORGE v1.0
 * Narzędzie do generowania miniaturowych ikon drzew za pomocą modelu imagen-4.0-generate-001.
 */

const App = () => {
    const [generating, setGenerating] = useState(false);
    const [assets, setAssets] = useState({
        Winter: null,
        Spring: null,
        Summer: null,
        Autumn: null
    });
    const [error, setError] = useState(null);

    const apiKey = ""; // Klucz dostarczany przez środowisko

    const generateAsset = async (season) => {
        setGenerating(true);
        setError(null);

        const prompts = {
            Winter: "Miniature steampunk cherry tree, winter dormancy, bare copper branches, light snow dust, white background, isometric 3D render, toy model style, high fidelity",
            Spring: "Miniature steampunk cherry tree, spring awakening, tiny emerald buds, polished brass trunk, white background, isometric 3D render, high detail, toy model style",
            Summer: "Miniature steampunk cherry tree, summer harvest, lush emerald leaves, ruby cherries, golden brass trunk, white background, isometric 3D render, toy model style",
            Autumn: "Miniature steampunk cherry tree, autumn decay, yellow and amber leaves, dark brass trunk, white background, isometric 3D render, toy model style"
        };

        const promptText = prompts[season];

        const fetchWithRetry = async (retries = 5, delay = 1000) => {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instances: [{ prompt: promptText }],
                        parameters: { sampleCount: 1 }
                    })
                });

                if (!response.ok) throw new Error(`Błąd API: ${response.status}`);

                const result = await response.json();
                return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
            } catch (err) {
                if (retries > 0) {
                    await new Promise(res => setTimeout(res, delay));
                    return fetchWithRetry(retries - 1, delay * 2);
                }
                throw err;
            }
        };

        try {
            const imageUrl = await fetchWithRetry();
            setAssets(prev => ({ ...prev, [season]: imageUrl }));
        } catch (err) {
            setError(`Nie udało się wygenerować miniatury dla fazy ${season}.`);
        } finally {
            setGenerating(false);
        }
    };

    const SeasonCard = ({ season, icon: Icon, color }) => (
        <div className="bg-[#1c1c1e] border-2 border-[#B5A642]/30 rounded-xl p-4 flex flex-col items-center gap-4 transition-all hover:border-[#B5A642]">
            <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
                <Icon className={color.replace('bg-', 'text-')} size={24} />
            </div>
            <h3 className="text-[#B5A642] font-black uppercase tracking-tighter text-sm">{season}</h3>

            <div className="w-full aspect-square bg-black/40 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden relative">
                {assets[season] ? (
                    <img src={assets[season]} alt={season} className="w-full h-full object-contain p-2" />
                ) : (
                    <div className="text-[10px] text-stone-600 uppercase text-center px-4">
                        Brak miniatury w skali 1:1
                    </div>
                )}
                {generating && !assets[season] && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#B5A642]" />
                    </div>
                )}
            </div>

            <button
                onClick={() => generateAsset(season)}
                disabled={generating}
                className="w-full py-2 bg-[#B5A642] text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-[#FFD700] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
                <Sparkles size={12} /> {assets[season] ? 'Odśwież' : 'Generuj'}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0c0a09] text-stone-200 p-8 font-sans selection:bg-[#B5A642] selection:text-black">
            <div className="max-w-5xl mx-auto">
                <header className="mb-12 border-b-2 border-[#B5A642]/20 pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-[#B5A642] uppercase italic tracking-tighter">
                            Asset <span className="text-white">Forge</span>
                        </h1>
                        <p className="text-stone-500 text-xs font-mono mt-2 uppercase tracking-widest">
                            Generator miniaturowych komponentów roślinnych v1.0
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold rounded-full">
                            Scale: 1:128 (Mobile)
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 text-red-400 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SeasonCard season="Winter" icon={ThermometerSnowflake} color="bg-blue-400" />
                    <SeasonCard season="Spring" icon={Leaf} color="bg-emerald-400" />
                    <SeasonCard season="Summer" icon={Sun} color="bg-orange-400" />
                    <SeasonCard season="Autumn" icon={CloudRain} color="bg-amber-600" />
                </div>

                <section className="mt-16 p-8 border-2 border-[#B5A642]/30 bg-[#1c1c1e] rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles size={120} className="text-[#B5A642]" />
                    </div>
                    <h2 className="text-xl font-black text-[#B5A642] uppercase mb-4">Instrukcja dla Architekta</h2>
                    <div className="text-sm text-stone-400 space-y-4 max-w-2xl">
                        <p>
                            Wygenerowane miniatury są zoptymalizowane pod kątem <strong>izometrycznej siatki Sadu Imperialnego</strong>.
                            Dzięki zachowaniu spójnego oświetlenia typu "Miniature Studio", drzewka będą wyglądać jak fizyczne figurki na mosiężnym stole.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-xs font-mono">
                            <li>Użyj <span className="text-white">Summer</span> dla fazy Harvest (duże liście + rubiny).</li>
                            <li>Użyj <span className="text-white">Spring</span> dla fazy Awakening (szmaragdowe pąki).</li>
                            <li>Wersja <span className="text-white">Winter</span> posiada teksturę miedzi z delikatnym osadem szronu.</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default App;