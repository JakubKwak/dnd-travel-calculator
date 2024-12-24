import React from "react";
import { Component } from "react";
import { withRouter } from "./App";
import { drawLine, measurePath, distanceBetween } from "./PathDraw";

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
            milesPerDay: 24,
            distanceInput: "100",
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
        if (this.divRef.current === null) {
            return console.error("Cannot mount Map Viewer component, references NULL")
        }
        this.divRef.current.addEventListener('wheel', this.handleWheel, { passive: false });
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
        if (e.button === 1) this.setState({ isDragging: false }); // Middle click
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
        this.placePathPoints(e.clientX, e.clientY)
    };

    togglePlaceCircle = () => {
        this.setState({ isPlacingCircle: !this.state.isPlacingCircle });
    };

    resetPath = () => {
        const canvas = this.canvasRef.current!
        this.setState({ circles: [], totalDistance: 0 });
        drawLine([], canvas)
    };

    resetCalibration = () => {
        this.setState({
            point1: null,
            point2: null,
            calibrationComplete: false
        })
    }

    calibrate = () => {
        const distance = parseFloat(this.state.distanceInput);
        if (!isNaN(distance) && this.state.point1 && this.state.point2) {
            const { point1, point2 } = this.state;

            // Calculate the distance between the two points in pixels
            const pixelDistance = distanceBetween(point2.x, point2.y, point1.x, point1.y)

            // Calculate the scaling factor
            const mapScale = distance / distanceBetween(point2.x, point2.y, point1.x, point1.y)
            console.log('mapscale', distance, pixelDistance, this.state.scale, mapScale)
            this.setState({ mapScale: mapScale, calibrationComplete: true });
        }
    };

    placePathPoints = (x: number, y: number) => {
        if (!this.state.isPlacingCircle) return

        const img = this.mapRef.current!;
        const rect = img.getBoundingClientRect();
        const canvas = this.canvasRef.current!

        // Calculate click coordinates relative to the container
        x = (x - rect.left) / this.state.scale;
        y = (y - rect.top) / this.state.scale;
        this.setState((prevState: { circles: any; }) => {
            const newCircles = [...prevState.circles, { x, y }];
            // Draw the new path and recalculate the total distance
            drawLine(newCircles, canvas);
            const totalDistance = measurePath(newCircles) * this.state.mapScale
            this.setState({ totalDistance: totalDistance })

            return {
                circles: newCircles,
            };
        });
    }

    placeCalibrationPoints = (x: number, y: number) => {
        const img = this.mapRef.current!;
        const rect = img.getBoundingClientRect();

        // Calculate click coordinates relative to the container
        x = (x - rect.left) / this.state.scale;
        y = (y - rect.top) / this.state.scale;

        if (!this.state.point1) {
            this.setState({
                point1: { x: x, y: y },
            });
        } else if (!this.state.point2) {
            this.setState({
                point2: { x: x, y: y },
            });
        }
    };

    render() {
        const { point1, point2, scale, distanceInput, calibrationComplete, position, isDragging, isPlacingCircle, totalDistance, milesPerDay } = this.state;
        const imageUrl = this.props.location.state?.imageUrl;

        if (!imageUrl) {
            return <div>No image found. Please upload an image first.</div>;
        }

        return (
            <div
                ref={this.divRef}
                style={{
                    cursor: isDragging
                        ? 'grabbing'
                        : isPlacingCircle
                            ? 'crosshair' // Custom cursor for circle placement
                            : 'auto',
                }}
                id='map'
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
                onMouseLeave={this.handleMouseUp}
                onWheel={this.handleWheel}
                onClick={this.handleImageClick}
            >

                {/* Top Left */}
                <div className="fixed top-4 left-4 z-50 flex space-x-3">
                    <button
                        className="bg-gray-700 text-white font-medium px-3 py-2 rounded hover:bg-gray-600"
                        onClick={() => this.props.navigate('/')}
                    >
                        Back
                    </button>

                    {(point1 || point2) &&
                        <button
                            className="bg-red-700 text-white font-medium px-3 py-2 rounded hover:bg-red-600"
                            onClick={() => this.resetCalibration()}
                        >
                            Reset Scale
                        </button>
                    }
                </div>

                {/* Top Banner */}
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-700 bg-opacity-50 text-white text-center py-2 px-6 rounded-lg shadow-lg z-50">
                    {!calibrationComplete && !(point1 && point2) &&
                        <h2 className="text-lg">Click on two places on the map to set the scale.</h2>
                    }

                    {point1 && point2 && !calibrationComplete && (
                        <div className="flex items-center space-x-4">
                            <h2 className="text-lg">Enter the distance of your selection (in miles):</h2>
                            <input
                                type="number"
                                value={distanceInput}
                                onChange={(e) => this.setState({ distanceInput: e.target.value })}
                                className="border border-gray-300 rounded-lg px-3 py-2 w-40"
                            />
                            <button
                                onClick={this.calibrate}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                            >
                                Submit
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom Left */}
                <div className="fixed bottom-4 left-4 bg-gray-700 bg-opacity-50 text-white text-center py-2 px-6 rounded-lg shadow-lg z-50 text-xl">
                    <div className="flex flex-row mb-2 justify-between gap-3 items-center">
                        <p className="text-gray-300">By Ship:</p>
                        <button
                            className="bg-gray-700 text-white text-small rounded hover:bg-gray-600 p-1"
                            onClick={() => this.setState({ milesPerDay: 90 })}
                        >
                            Fast
                        </button>
                        <button
                            className="bg-gray-700 text-white text-small rounded hover:bg-gray-600 p-1"
                            onClick={() => this.setState({ milesPerDay: 60 })}
                        >
                            Normal
                        </button>
                        <button
                            className="bg-gray-700 text-white text-small rounded hover:bg-gray-600 p-1"
                            onClick={() => this.setState({ milesPerDay: 30 })}
                        >
                            Slow
                        </button>
                    </div>
                    <div className="flex flex-row mb-2 justify-between gap-3 items-center">
                        <p className="text-gray-300">On Foot:</p>
                        <button
                            className="bg-gray-700 text-white text-small rounded hover:bg-gray-600 p-1"
                            onClick={() => this.setState({ milesPerDay: 30 })}
                        >
                            Fast
                        </button>
                        <button
                            className="bg-gray-700 text-white text-small rounded hover:bg-gray-600 p-1"
                            onClick={() => this.setState({ milesPerDay: 24 })}
                        >
                            Normal
                        </button>
                        <button
                            className="bg-gray-700 text-white text-small rounded hover:bg-gray-600 p-1"
                            onClick={() => this.setState({ milesPerDay: 18 })}
                        >
                            Slow
                        </button>
                    </div>
                    <div className="flex flex-row gap-3 mb-8">
                        <p>Miles Per Day:</p>
                        <input
                            type="number"
                            value={milesPerDay}
                            onChange={(e) => this.setState({ milesPerDay: e.target.value })}
                            className="border border-gray-300 rounded-lg w-20 text-small pl-1"
                        />
                    </div>

                    <p>Total Distance: {Math.round(totalDistance)} Miles</p>
                    <p>Travel Time: {Math.round(totalDistance / milesPerDay * 10) / 10} Days</p>
                </div>

                {/* Bottom Right */}
                <div className="fixed bottom-4 right-4 z-50 flex space-x-3">

                    {calibrationComplete &&
                        <button
                            className="bg-green-700 text-white font-medium px-3 py-2 rounded hover:bg-green-600"
                            onClick={() => this.togglePlaceCircle()}
                        >
                            {isPlacingCircle ? 'Finish Drawing Path' : 'Begin Drawing Path'}
                        </button>
                    }
                    {totalDistance > 0 &&
                        <button
                            className="bg-red-700 text-white font-medium px-3 py-2 rounded hover:bg-red-600"
                            onClick={() => this.resetPath()}
                        >
                            Reset Path
                        </button>
                    }

                    <button
                        className="bg-gray-700 w-10 text-white font-medium px-3 py-2 rounded hover:bg-gray-600"
                        onClick={() =>
                            this.setState((prevState: any) => ({
                                scale: Math.min(prevState.scale * 1.2, 5),
                            }))
                        }
                    >
                        +
                    </button>
                    <button
                        className="bg-gray-700 w-10 text-white font-medium px-3 py-2 rounded hover:bg-gray-600"
                        onClick={() =>
                            this.setState((prevState: any) => ({
                                scale: Math.max(prevState.scale * 0.8, 0.1),
                            }))
                        }
                    >
                        -
                    </button>
                </div>

                <div
                    ref={this.mapRef}
                    style={{
                        position: 'absolute',
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center',

                        marginTop: '-25%', // Adjust by half the height of the image to ensure it's centered
                        marginLeft: '-30%', // Adjust by half the width of the image to ensure it's centered
                    }}
                >
                    {/* Image */}
                    <img
                        src={imageUrl}
                        alt="Zoomable map"
                        style={{
                            display: 'block',
                            maxWidth: '100vw',
                            maxHeight: '100vh',
                            userSelect: 'none',
                        }}
                    />
                    {/* Calibration points: Show circles where the user clicked */}
                    {point1 && !calibrationComplete && (
                        <div
                            style={{
                                position: 'absolute',
                                top: `${point1.y - 2.5}px`,
                                left: `${point1.x - 2.5}px`,
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                backgroundColor: 'yellow',
                                border: '1px solidrgb(139, 125, 0)',
                                opacity: '80%'
                            }}
                        />
                    )}
                    {point2 && !calibrationComplete && (
                        <div
                            style={{
                                position: 'absolute',
                                top: `${point2.y - 2.5}px`,
                                left: `${point2.x - 2.5}px`,
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                backgroundColor: 'yellow',
                                border: '1px solidrgb(139, 125, 0)',
                                opacity: '80%'
                            }}
                        />
                    )}

                    {/* Show line between the two points for reference */}
                    {point1 && point2 && !calibrationComplete && (
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
                                strokeDasharray="2,2"  // Dotted line pattern: 2px dash, 2px gap
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
                                top: circle.y - 2.5,  // Center the circle by shifting half the width/height (3px)
                                left: circle.x - 2.5,
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                backgroundColor: 'red',
                                border: '1px solid #8b0000',
                                pointerEvents: 'none', // Ensure it doesn’t block clicks
                                opacity: '80%'
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export const ImageViewerWithRouter = withRouter(MapViewer);
