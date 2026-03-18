import { Weather } from '@/declarations/backend.did';
import { WeatherEventType } from '@/components/season/WeatherEventModal';

export interface WeatherMapping {
    type: WeatherEventType;
    name: string;
    description: string;
}

export const mapBackendWeather = (weather: Weather): WeatherMapping => {
    const type = Object.keys(weather)[0] as keyof Weather;

    switch (type) {
        case 'Sunny':
            return {
                type: 'Ideal',
                name: 'Golden Sunshine',
                description: 'Perfect weather conditions for cherry growth and worker morale.'
            };
        case 'Rainy':
            return {
                type: 'Storm',
                name: 'Nutrient Rain',
                description: 'Steady rainfall is hydrating the soil, but heavy storms may impact harvest quality.'
            };
        case 'Frost':
            return {
                type: 'Frost',
                name: 'Spring Frost',
                description: 'Cold front detected. Delicate blossoms are at risk of freezing.'
            };
        case 'Heatwave':
            return {
                type: 'Heatwave',
                name: 'Scorching Heat',
                description: 'Extreme temperatures are stressing the trees. Soil is drying out rapidly.'
            };
        case 'Drought':
            return {
                type: 'Drought',
                name: 'Severe Drought',
                description: 'Prolonged lack of rain. Irrigation is critical to prevent crop failure.'
            };
        case 'Flood':
            return {
                type: 'Storm',
                name: 'Flash Flood',
                description: 'Excessive water is saturating the roots. Risk of rot and infrastructure damage.'
            };
        case 'PestOutbreak':
            return {
                type: 'Pest',
                name: 'Aphid Infestation',
                description: 'Swiftly spreading pests are damaging the foliage.'
            };
        case 'DiseaseOutbreak':
            return {
                type: 'Disease',
                name: 'Bacterial Canker',
                description: 'A dangerous pathogen is spreading through the orchard.'
            };
        default:
            return {
                type: 'Ideal',
                name: 'Stable Conditions',
                description: 'No significant weather anomalies detected.'
            };
    }
};
