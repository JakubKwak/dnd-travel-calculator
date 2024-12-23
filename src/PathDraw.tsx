// Draw a line between all points
export const drawLine = (circles: { y: any; x: any; }[], canvas: HTMLCanvasElement) => {
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const dpr = 4;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    
    const ctx = canvas.getContext('2d')!;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr)

    if (circles.length < 2) return; // Only draw lines if there are at least two circles

    // Set the line style
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);

    // Begin drawing the path
    ctx.beginPath();
    const firstCircle = circles[0];
    ctx.moveTo(firstCircle.x, firstCircle.y);

    // Draw lines to each subsequent circle
    circles.slice(1).forEach(circle => {
        ctx.lineTo(circle.x, circle.y);
    });

    // Render the path
    ctx.stroke();
};

// Measure the distance between all points in a path
export const measurePath = (circles: { y: any; x: any; }[]): number => {
    let totalDistance = 0
    if (circles.length > 1) {
        circles.slice(1).forEach((circle, index) => {
            const previousCircle = circles[index]
            totalDistance += distanceBetween(circle.x, circle.y, previousCircle.x, previousCircle.y)
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