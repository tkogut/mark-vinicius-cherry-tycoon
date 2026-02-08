import { Link } from '@tanstack/react-router';
import { ArrowLeft, Droplet, Sprout, TreeDeciduous, Leaf } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';

export default function FarmView() {
    const { usePlayerFarm, harvestCherries, waterParcel, fertilizeParcel, plantTrees, startOrganicConversion } = useBackend();
    const { data: farm, isLoading } = usePlayerFarm();

    const handleHarvest = async (parcelId: string) => {
        try {
            const result = await harvestCherries.mutateAsync(parcelId);
            if ('Ok' in result) {
                alert(`Harvested ${result.Ok} kg of cherries!`);
            } else {
                alert(`Error: ${result.Err}`);
            }
        } catch (error) {
            alert('Failed to harvest cherries');
        }
    };

    const handleWater = async (parcelId: string) => {
        try {
            const result = await waterParcel.mutateAsync(parcelId);
            if ('Ok' in result) {
                alert(result.Ok);
            } else {
                alert(`Error: ${result.Err}`);
            }
        } catch (error) {
            alert('Failed to water parcel');
        }
    };

    const handleFertilize = async (parcelId: string) => {
        try {
            const result = await fertilizeParcel.mutateAsync(parcelId);
            if ('Ok' in result) {
                alert(result.Ok);
            } else {
                alert(`Error: ${result.Err}`);
            }
        } catch (error) {
            alert('Failed to fertilize parcel');
        }
    };

    const handlePlantTrees = async (parcelId: string) => {
        const quantity = prompt('How many trees to plant?', '10');
        if (!quantity) return;

        try {
            const result = await plantTrees.mutateAsync({ parcelId, quantity: Number(quantity) });
            if ('Ok' in result) {
                alert(result.Ok);
            } else {
                alert(`Error: ${result.Err}`);
            }
        } catch (error) {
            alert('Failed to plant trees');
        }
    };

    const handleGoOrganic = async (parcelId: string) => {
        try {
            const result = await startOrganicConversion.mutateAsync(parcelId);
            if ('Ok' in result) {
                alert(result.Ok);
            } else {
                alert(`Error: ${result.Err}`);
            }
        } catch (error) {
            alert('Failed to start organic conversion');
        }
    };

    if (isLoading || !farm) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🚜</div>
                    <h1 className="text-2xl font-bold text-green-900">Loading Farm...</h1>
                </div>
            </div>
        );
    }

    const getSoilColor = (type: string) => {
        switch (type) {
            case 'SandyClay': return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'Clay': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'Sandy': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Waterlogged': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getWaterLevelColor = (level: number) => {
        if (level < 0.3) return 'bg-red-500';
        if (level < 0.6) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getFertilityColor = (fertility: number) => {
        if (fertility < 0.4) return 'bg-red-500';
        if (fertility < 0.7) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <button className="bg-white hover:bg-gray-50 rounded-xl p-3 shadow-md transition-colors">
                            <ArrowLeft className="w-6 h-6 text-emerald-700" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-emerald-900">🚜 My Farm</h1>
                        <p className="text-emerald-600">Manage your cherry orchards</p>
                    </div>
                </div>

                {/* Purchase Parcel Button */}
                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-lg p-6 transition-all duration-200 transform hover:scale-[1.02]">
                    <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl">🌍</span>
                        <div className="text-left">
                            <div className="text-xl font-bold">Purchase New Parcel</div>
                            <div className="text-sm opacity-90">Expand your farm (60,000 PLN/hectare)</div>
                        </div>
                    </div>
                </button>

                {/* Parcels Grid */}
                <div className="space-y-4">
                    {farm.parcels.map((parcel) => (
                        <div key={parcel.id} className="bg-white rounded-2xl shadow-lg border-2 border-emerald-200 overflow-hidden">

                            {/* Parcel Header */}
                            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold">{parcel.size} hectare parcel</h3>
                                        <p className="text-sm opacity-90">{parcel.region.province} Province</p>
                                    </div>
                                    {parcel.organicCertified && (
                                        <div className="bg-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                                            ♻️ Organic Certified
                                        </div>
                                    )}
                                    {parcel.isOrganic && !parcel.organicCertified && (
                                        <div className="bg-yellow-500 px-3 py-1 rounded-full text-sm font-semibold">
                                            🌱 Converting to Organic
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Parcel Details */}
                            <div className="p-6 space-y-4">

                                {/* Soil & Trees Info */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className={`rounded-xl p-3 border-2 ${getSoilColor(parcel.soilType)}`}>
                                        <div className="text-xs font-semibold opacity-75">Soil Type</div>
                                        <div className="text-sm font-bold">{parcel.soilType}</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-3 border-2 border-blue-200">
                                        <div className="text-xs font-semibold text-blue-600">pH Level</div>
                                        <div className="text-sm font-bold text-blue-900">{parcel.pH.toFixed(1)}</div>
                                    </div>
                                    <div className="bg-green-50 rounded-xl p-3 border-2 border-green-200">
                                        <div className="text-xs font-semibold text-green-600">Trees</div>
                                        <div className="text-sm font-bold text-green-900">{parcel.plantedTrees} ({parcel.treeAge}y)</div>
                                    </div>
                                    <div className="bg-purple-50 rounded-xl p-3 border-2 border-purple-200">
                                        <div className="text-xs font-semibold text-purple-600">Quality</div>
                                        <div className="text-sm font-bold text-purple-900">{parcel.quality}/100</div>
                                    </div>
                                </div>

                                {/* Progress Bars */}
                                <div className="space-y-3">
                                    {/* Water Level */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                                <Droplet className="w-4 h-4" /> Water Level
                                            </span>
                                            <span className="text-xs text-gray-600">{(parcel.waterLevel * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all ${getWaterLevelColor(parcel.waterLevel)}`}
                                                style={{ width: `${parcel.waterLevel * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Fertility */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                                <Sprout className="w-4 h-4" /> Fertility
                                            </span>
                                            <span className="text-xs text-gray-600">{(parcel.fertility * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all ${getFertilityColor(parcel.fertility)}`}
                                                style={{ width: `${parcel.fertility * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t-2 border-gray-100">
                                    <button
                                        onClick={() => handleHarvest(parcel.id)}
                                        disabled={harvestCherries.isPending}
                                        className="bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>🍒</span> Harvest
                                    </button>
                                    <button
                                        onClick={() => handleWater(parcel.id)}
                                        disabled={waterParcel.isPending}
                                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Droplet className="w-4 h-4" /> Water
                                    </button>
                                    <button
                                        onClick={() => handleFertilize(parcel.id)}
                                        disabled={fertilizeParcel.isPending}
                                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Sprout className="w-4 h-4" /> Fertilize
                                    </button>
                                    <button
                                        onClick={() => handlePlantTrees(parcel.id)}
                                        disabled={plantTrees.isPending}
                                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <TreeDeciduous className="w-4 h-4" /> Plant
                                    </button>
                                    {!parcel.isOrganic && (
                                        <button
                                            onClick={() => handleGoOrganic(parcel.id)}
                                            disabled={startOrganicConversion.isPending}
                                            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Leaf className="w-4 h-4" /> Go Organic
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
