import { Link } from '@tanstack/react-router';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { useBackend } from '../hooks/useBackend';

export default function MarketView() {
    const [sellQuantity, setSellQuantity] = useState(1000);
    const [saleType, setSaleType] = useState<'retail' | 'wholesale'>('retail');

    const { useInventory, sellCherries } = useBackend();
    const { data: inventory, isLoading } = useInventory();

    const handleSell = async () => {
        try {
            const result = await sellCherries.mutateAsync({ quantity: sellQuantity, saleType });
            if ('Ok' in result) {
                alert(`Sold ${sellQuantity} kg for ${result.Ok.toLocaleString()} PLN!`);
                setSellQuantity(100);
            } else {
                alert(`Error: ${result.Err}`);
            }
        } catch (error) {
            alert('Failed to sell cherries');
        }
    };

    if (isLoading || !inventory) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-bounce">🏪</div>
                    <h1 className="text-2xl font-bold text-indigo-900">Loading Market...</h1>
                </div>
            </div>
        );
    }

    // Mock prices (TODO: Get from backend)
    const prices = {
        retail: 18,
        wholesale: 12,
        organicRetail: 25,
        organicWholesale: 17,
    };

    const totalRevenue = saleType === 'retail'
        ? sellQuantity * prices.retail
        : sellQuantity * prices.wholesale;

    const maxQuantity = inventory.cherries + inventory.organicCherries;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link to="/">
                        <button className="bg-white hover:bg-gray-50 rounded-xl p-3 shadow-md transition-colors">
                            <ArrowLeft className="w-6 h-6 text-indigo-700" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-900">🏪 Market</h1>
                        <p className="text-indigo-600">Buy and sell cherries & parcels</p>
                    </div>
                </div>

                {/* Inventory Display */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
                    <h2 className="text-xl font-bold text-indigo-900 mb-4">Your Inventory</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-rose-50 rounded-xl p-4 border-2 border-rose-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-rose-600 font-semibold">Regular Cherries</div>
                                    <div className="text-3xl font-bold text-rose-900">{inventory.cherries.toLocaleString()} kg</div>
                                </div>
                                <span className="text-5xl">🍒</span>
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-green-600 font-semibold">Organic Cherries</div>
                                    <div className="text-3xl font-bold text-green-900">{inventory.organicCherries.toLocaleString()} kg</div>
                                </div>
                                <span className="text-5xl">♻️</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Prices */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
                    <h2 className="text-xl font-bold text-indigo-900 mb-4">Current Market Prices</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <div className="text-xs text-blue-600 font-semibold mb-1">Retail</div>
                            <div className="text-2xl font-bold text-blue-900">{prices.retail} PLN/kg</div>
                            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                <TrendingUp className="w-3 h-3" /> +2%
                            </div>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                            <div className="text-xs text-indigo-600 font-semibold mb-1">Wholesale</div>
                            <div className="text-2xl font-bold text-indigo-900">{prices.wholesale} PLN/kg</div>
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <TrendingDown className="w-3 h-3" /> -1%
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                            <div className="text-xs text-green-600 font-semibold mb-1">Organic Retail</div>
                            <div className="text-2xl font-bold text-green-900">{prices.organicRetail} PLN/kg</div>
                            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                <TrendingUp className="w-3 h-3" /> +5%
                            </div>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                            <div className="text-xs text-emerald-600 font-semibold mb-1">Organic Wholesale</div>
                            <div className="text-2xl font-bold text-emerald-900">{prices.organicWholesale} PLN/kg</div>
                            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                <TrendingUp className="w-3 h-3" /> +3%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sell Interface */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
                    <h2 className="text-xl font-bold text-indigo-900 mb-4">Sell Cherries</h2>

                    {/* Sale Type Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSaleType('retail')}
                                className={`p-4 rounded-xl border-2 transition-all ${saleType === 'retail'
                                        ? 'bg-blue-500 text-white border-blue-600'
                                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="font-bold">🏪 Retail</div>
                                <div className="text-sm opacity-90">{prices.retail} PLN/kg</div>
                            </button>
                            <button
                                onClick={() => setSaleType('wholesale')}
                                className={`p-4 rounded-xl border-2 transition-all ${saleType === 'wholesale'
                                        ? 'bg-indigo-500 text-white border-indigo-600'
                                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <div className="font-bold">🏭 Wholesale</div>
                                <div className="text-sm opacity-90">{prices.wholesale} PLN/kg</div>
                            </button>
                        </div>
                    </div>

                    {/* Quantity Slider */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quantity: {sellQuantity.toLocaleString()} kg
                        </label>
                        <input
                            type="range"
                            min="100"
                            max={maxQuantity || 100}
                            step="100"
                            value={sellQuantity}
                            onChange={(e) => setSellQuantity(Number(e.target.value))}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>100 kg</span>
                            <span>{maxQuantity.toLocaleString()} kg (max)</span>
                        </div>
                    </div>

                    {/* Revenue Preview */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 mb-6">
                        <div className="text-sm text-green-700 font-semibold mb-1">Estimated Revenue</div>
                        <div className="text-4xl font-bold text-green-900">{totalRevenue.toLocaleString()} PLN</div>
                        <div className="text-sm text-green-600 mt-1">
                            {sellQuantity.toLocaleString()} kg × {saleType === 'retail' ? prices.retail : prices.wholesale} PLN/kg
                        </div>
                    </div>

                    {/* Sell Button */}
                    <button
                        onClick={handleSell}
                        disabled={sellCherries.isPending || maxQuantity === 0}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02]"
                    >
                        {sellCherries.isPending ? 'Selling...' : `💰 Sell ${sellQuantity.toLocaleString()} kg for ${totalRevenue.toLocaleString()} PLN`}
                    </button>
                </div>

                {/* Purchase Parcel */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">🌍 Expand Your Farm</h2>
                    <p className="mb-4 opacity-90">Purchase new parcels to grow your cherry empire</p>
                    <button className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-3 rounded-xl font-bold transition-colors">
                        Browse Available Land
                    </button>
                </div>

            </div>
        </div>
    );
}
