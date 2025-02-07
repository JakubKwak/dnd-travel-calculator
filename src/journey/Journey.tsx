import { measurePath } from "../draw/PathDraw"

export class Journey {
    constructor(
        public path: Coordinates[] = [],
        public totalDistance: number = 0,
        public milesPerDay: number = 24,
        public colorScheme: ColorScheme = new ColorScheme('white', 'white', 'white')
    ) { }

    public static fromJson(obj: any): Journey {
        return new Journey(obj.path, obj.totalDistance, obj.milesPerDay, obj.colorScheme)
    }

    public addCoordinate(coord: Coordinates): void {
        this.path.push(coord)
        this.totalDistance = measurePath(this.path)
    }

    public popCoordinate(): void {
        if (this.path.length > 0) {
            this.path.pop()
            this.totalDistance = measurePath(this.path)
        }
    }

    public resetCoordinates(): void {
        this.path = []
        this.totalDistance = 0
    }
}

export class Coordinates {
    constructor(
        public x: number,
        public y: number
    ) { }
}

export class ColorScheme {
    constructor(
        public name: string,
        public innerColor: string,
        public outerColor: string,
    ) { }
}
