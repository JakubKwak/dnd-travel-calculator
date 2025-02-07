import { Journey } from "../journey/Journey"

export function calculateDistance(journey: Journey, mapScale: number): number {
    if (!journey) {
        return 0
    }
    return Math.round(journey.totalDistance * mapScale)
}

export function calculateTotalTime(journey: Journey, mapScale: number): number {
    if (!journey) {
        return 0
    }
    return Math.round((journey.totalDistance * mapScale) / journey.milesPerDay * 10) / 10
}