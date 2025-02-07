import { ColorScheme, Journey } from "./Journey";

const colorSchemes: ColorScheme[] = [
    new ColorScheme('red', '#ff0000', '#8b0000'),
    new ColorScheme('blue', '#0800ff', '#0f0063'),
    new ColorScheme('yellow', '#f0bb35', '#bf8e11'),
    new ColorScheme('green', '#4ec43f', '#2d9120'),
    new ColorScheme('purple', '#a22ca8', '#6e1a73'),
    new ColorScheme('lblue', '#60d4d6', '#3babad'),
    new ColorScheme('orange', '#db8144', '#9c5221'),
]

export class JourneyFactory {
    public static create(existingJourneys: Journey[]): Journey {
        const availableColors = colorSchemes.filter(colorScheme => {
            return !existingJourneys.find(journey => journey.colorScheme.name == colorScheme.name)
        })

        const selectedColor = availableColors.length > 0
            ? availableColors[0]  // Pick first available unique color
            : colorSchemes[Math.floor(Math.random() * colorSchemes.length)]; // Pick a random color

        return new Journey([], 0, 24, selectedColor);
    }
}