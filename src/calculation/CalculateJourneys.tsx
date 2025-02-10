import { Journey } from "../journey/Journey"

export function calculateJourneyDistance(journey: Journey, mapScale: number): number {
    if (!journey.path.length) {
        return 0
    }
    return Math.round(journey.totalDistance * mapScale)
}

export function calculateJourneyTime(journey: Journey, mapScale: number): number {
    if (!journey.path.length) {
        return 0
    }
    return Math.round((journey.totalDistance * mapScale) / journey.milesPerDay * 10) / 10
}

export function calculateTotalDistance(journeys: Journey[], mapScale: number): number {
    let total = 0
    journeys.forEach(journey => {
        total += calculateJourneyDistance(journey, mapScale)
    })
    return Math.round(total * 10) / 10
}

export function calculateTotalTime(journeys: Journey[], mapScale: number): number {
    let total = 0
    journeys.forEach(journey => {
        total += calculateJourneyTime(journey, mapScale)
    })
    return Math.round(total * 10) / 10
}