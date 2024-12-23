import React from "react";
import { Component } from "react";
import { withRouter } from "./App";

class MapViewer extends Component<any, any> {
    divRef: React.RefObject<HTMLDivElement>;
    mapRef: React.RefObject<HTMLDivElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;

    constructor(props: any) {
        super(props);
        this.state = {
            scale: 1,
            position: { x: 0, y: 0 },
            isDragging: false,
            dragStart: { x: 0, y: 0 },
            circles: [],
            totalDistance: 0,
            isPlacingCircle: false,
            distanceInput: "",
            point1: null,  // First point of the calibration line
            point2: null,  // Second point of the calibration line
            mapScale: 1, // User input for the known distance
            calibrationComplete: false, // Flag to check if calibration is done
        };
        this.divRef = React.createRef();
        this.mapRef = React.createRef();
        this.canvasRef = React.createRef();
    }


    componentDidMount() {
        if (this.divRef.current !== null) {
            this.divRef.current.addEventListener('wheel', this.handleWheel, { passive: false });
        }
        const { state } = this.props.location;
        if (!state || !state.imageUrl) {
            this.props.navigate('/');
        }
    }

    componentWillUnmount() {
        if (this.divRef.current !== null) {
            this.divRef.current.removeEventListener('wheel', this.handleWheel, {});
        }
    }

    handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 1) return; // Middle click

        e.preventDefault()
        this.setState({
            isDragging: true,
            dragStart: {
                x: e.clientX - this.state.position.x,
                y: e.clientY - this.state.position.y,
            },
        });
    };

    handleMouseMove = (e: React.MouseEvent) => {
        if (this.state.isDragging) {
            e.preventDefault()
            this.setState({
                position: {
                    x: e.clientX - this.state.dragStart.x,
                    y: e.clientY - this.state.dragStart.y,
                },
            });
        }
    };

    handleMouseUp = (e: React.MouseEvent) => {
        if (e.button !== 1) return; // Middle click
        this.setState({ isDragging: false });
    };

    handleWheel = (e: { stopPropagation: () => void; deltaY: number; }) => {
        e.stopPropagation();
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.setState((prevState: any) => ({
            scale: Math.min(Math.max(0.1, prevState.scale * scaleFactor), 5),
        }));
    };

    handleImageClick = (e: { target: { tagName: string; }; clientX: number; clientY: number; }) => {
        if (e.target.tagName !== 'IMG') return

        this.placeCalibrationPoints(e.clientX, e.clientY)

        if (!this.state.isPlacingCircle) return

        const img = this.mapRef.current!;
        const rect = img.getBoundingClientRect();

        // Calculate click coordinates relative to the container
        const x = (e.clientX - rect.left) / this.state.scale - 3;
        const y = (e.clientY - rect.top) / this.state.scale - 3;

        this.setState((prevState: { circles: any; }) => {
            const newCircles = [...prevState.circles, { x, y }]; // Add new circle
            this.drawLine(newCircles); // Draw line between new and previous circle
            this.measurePath(newCircles);

            return {
                circles: newCircles,
            };
        });
    };

    togglePlaceCircle = () => {
        this.setState({ isPlacingCircle: !this.state.isPlacingCircle });
    };

    resetPath = () => {
        this.setState({ circles: [], totalDistance: 0});
        this.drawLine([])
    };


    drawLine = (circles: { y: any; x: any; }[]) => {
        const canvas = this.canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (circles.length < 2) return; // Only draw lines if there are at least two circles

        // Set the line style
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;

        // Begin drawing the path
        ctx.beginPath();
        const firstCircle = circles[0];
        ctx.moveTo(firstCircle.x + 3, firstCircle.y + 3);

        // Draw lines to each subsequent circle
        circles.slice(1).forEach(circle => {
            ctx.lineTo(circle.x + 3, circle.y + 3);
        });
        console.log(circles)

        // Render the path
        ctx.stroke();
    };

    measurePath = (circles: { y: any; x: any; }[]) => {
        let totalDistance = 0
        if (circles.length > 1) {
            circles.slice(1).forEach((circle, index) => {
                const previousCircle = circles[index]
                const pixelDistance = Math.sqrt(
                    Math.pow(circle.x - previousCircle.x, 2) + Math.pow(circle.y - previousCircle.y, 2)
                );
                totalDistance += pixelDistance
                console.log('pixelDistance', pixelDistance)
            });
            totalDistance = totalDistance * this.state.mapScale
            console.log('totalDistance', totalDistance, this.state.mapScale)

        }
        console.log(this.state)
        this.setState({totalDistance: totalDistance})
    }

    handleCalibrationInput = () => {
        const distance = parseFloat(this.state.distanceInput);
        if (!isNaN(distance) && this.state.point1 && this.state.point2) {
            const { point1, point2 } = this.state;

            // Calculate the distance between the two points in pixels
            const pixelDistance = Math.sqrt(
                Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
            );

            // Calculate the scaling factor
            const mapScale = distance / pixelDistance
            console.log('mapscale', distance, pixelDistance, this.state.scale, mapScale)
            this.setState({ mapScale: mapScale, calibrationComplete: true });
        }
    };

    // Handle mouse click for placing points on the map
    placeCalibrationPoints = (x: number, y: number) => {
        const { point1, point2 } = this.state;

        const img = this.mapRef.current!;
        const rect = img.getBoundingClientRect();

        // Calculate click coordinates relative to the container
        x = (x - rect.left) / this.state.scale;
        y = (y - rect.top) / this.state.scale;

        if (!point1) {
            this.setState({
                point1: { x: x, y: y },
            });
        } else if (!point2) {
            this.setState({
                point2: { x: x, y: y },
            });
        }
    };

    render() {
        const { point1, point2, scale, distanceInput, calibrationComplete, position, isDragging, isPlacingCircle, totalDistance } = this.state;
        const imageUrl = this.props.location.state?.imageUrl;

        if (!imageUrl) {
            return <div>No image found. Please upload an image first.</div>;
        }

        return (
            <div
                ref={this.divRef}
                style={{
                    width: '100vw',
                    height: '100vh',
                    overflow: 'hidden',
                    cursor: isDragging
                        ? 'grabbing'
                        : isPlacingCircle
                            ? 'crosshair' // Custom cursor for circle placement
                            : 'auto',
                }}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
                onMouseLeave={this.handleMouseUp}
                onWheel={this.handleWheel}
                onClick={this.handleImageClick}
            >
                <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1 }}>
                    <button
                        onClick={() => this.props.navigate('/')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#4a5568',
                            color: 'white',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            float: 'left'
                        }}
                    >
                        Back
                    </button>

                    {!calibrationComplete && !(point1 && point2) &&
                        <h3 style={{ float: 'left' }}>Click on two places on the map to set a scale.</h3>
                    }

                    {point1 && point2 && !calibrationComplete && (
                        <div
                            style={{
                                backgroundColor: 'white',
                                padding: '2px',
                                borderRadius: '2px',
                            }}
                        >
                            <input
                                type="number"
                                value={distanceInput}
                                onChange={(e) => this.setState({ distanceInput: e.target.value })}
                                placeholder="Enter known distance in miles"
                            />
                            <button onClick={this.handleCalibrationInput}>Calibrate</button>
                        </div>
                    )}
                </div>


                <div
                    ref={this.mapRef}
                    style={{
                        position: 'absolute',
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center',
                    }}
                >
                    {/* Image */}
                    <img
                        src={imageUrl}
                        alt="Zoomable map"
                        style={{
                            display: 'block',
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            userSelect: 'none',
                        }}
                    />
                    {/* Calibration points: Show circles where the user clicked */}
                    {point1 && (
                        <div
                            style={{
                                position: 'absolute',
                                top: `${point1.y - 2}px`,
                                left: `${point1.x - 2}px`,
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: 'yellow',
                            }}
                        />
                    )}
                    {point2 && (
                        <div
                            style={{
                                position: 'absolute',
                                top: `${point2.y - 2}px`,
                                left: `${point2.x - 2}px`,
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: 'yellow',
                            }}
                        />
                    )}

                    {/* Show line between the two points for reference */}
                    {point1 && point2 && (
                        <svg
                            width="100%"
                            height="100%"
                            style={{ position: 'absolute', top: '0', left: '0', pointerEvents: 'none' }}
                        >
                            <line
                                x1={point1.x}
                                y1={point1.y}
                                x2={point2.x}
                                y2={point2.y}
                                stroke="yellow"
                                strokeWidth="1"
                            />
                        </svg>
                    )}

                    {/* Canvas for drawing lines */}
                    <canvas
                        ref={this.canvasRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            pointerEvents: 'none', // Don't block interactions with the image or circles
                        }}
                    />
                    {/* Circles */}
                    {this.state.circles.map((circle: { y: any; x: any; }, index: React.Key | null | undefined) => (
                        <div
                            key={index}
                            style={{
                                position: 'absolute',
                                top: circle.y,
                                left: circle.x,
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: 'red',
                                pointerEvents: 'none', // Ensure it doesn’t block clicks
                            }}
                        />
                    ))}
                </div>


                <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1 }}>
                    <div>
                        <p>Total Disance: {Math.round(totalDistance)} Miles</p>
                        <p>Travel Time: {Math.round(totalDistance / 24 * 10) / 10} Days</p>
                    </div>

                    {calibrationComplete &&
                        <button onClick={() => this.togglePlaceCircle()}>{isPlacingCircle ? 'Finish Placing' : 'Place Circle'}</button>
                    }
                    {totalDistance > 0 &&
                        <button onClick={() => this.resetPath()}>Reset Path</button>
                    }


                    {/* Zoom In Button*/}
                    <button
                        onClick={() =>
                            this.setState((prevState: any) => ({
                                scale: Math.min(prevState.scale * 1.2, 5),
                            }))
                        }
                        style={{
                            padding: '8px',
                            marginRight: '8px',
                            backgroundColor: '#4a5568',
                            color: 'white',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        +
                    </button>
                    {/* Zoom Out Button*/}
                    <button
                        onClick={() =>
                            this.setState((prevState: any) => ({
                                scale: Math.max(prevState.scale * 0.8, 0.1),
                            }))
                        }
                        style={{
                            padding: '8px',
                            backgroundColor: '#4a5568',
                            color: 'white',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        -
                    </button>
                </div>
            </div>
        );
    }
}

export const ImageViewerWithRouter = withRouter(MapViewer);
