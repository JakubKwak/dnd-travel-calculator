import { Journey } from "../journey/Journey";

// Draw a line between all points
export const drawJourneys = (joruneys: Journey[], canvas: HTMLCanvasElement) => {
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const dpr = 4;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    
    const ctx = canvas.getContext('2d')!;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr)

    joruneys.forEach((Journey: Journey) => {
        const path = Journey.path
        if (path.length < 2) return; // Only draw lines if there are at least two points
    
        // Set the line style
        ctx.strokeStyle = Journey.colorScheme.innerColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
    
        // Begin drawing the path
        ctx.beginPath();
        const firstPoint = path[0];
        ctx.moveTo(firstPoint.x, firstPoint.y);
    
        // Draw lines to each subsequent point
        path.slice(1).forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
    
        // Render the path
        ctx.stroke();
    })

};

// Measure the distance between all points in a path
export const measurePath = (path: { y: any; x: any; }[]): number => {
    let totalDistance = 0
    if (path.length > 1) {
        path.slice(1).forEach((point, index) => {
            const previousPoint = path[index]
            totalDistance += distanceBetween(point.x, point.y, previousPoint.x, previousPoint.y)
        });
    }

    return totalDistance
}

// Measure the distance between two points
export const distanceBetween = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(
        Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
    );
}