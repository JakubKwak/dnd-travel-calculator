import React from "react";
import { Component } from "react";
import { withRouter } from "../App";
import { drawJourneys, distanceBetween } from "../draw/PathDraw";
import { getImageFromIndexedDB } from "../ImageStorage";
import { Coordinates, Journey } from "../journey/Journey";
import Path from "./Path";
import CalibrationPath from "./CalibrationPath";
import JourneyMenu from "./JourneyMenu";
import FooterButtons from "./FooterButtons";
import TopBanner from "./TopBanner";
import { JourneyFactory } from "../journey/JourneyFactory";

// TODO
// Needs a lot of refactoring and splitting up

interface MapViewerState {
    // Zooming/Panning controls
    imageUrl: string | null
    scale: number;
    position: Coordinates;
    isDragging: boolean;
    dragStart: Coordinates;
    width: number;
    height: number;
    // Calibration
    distanceInput: string;
    calibrationPoint1: Coordinates | null;
    calibrationPoint2: Coordinates | null;
    calibrationComplete: boolean;
    mapScale: number;
    // Journey Calculation
    journeys: Journey[];
    currentJourney: number;
}

class MapViewer extends Component<any, any> {
    divRef: React.RefObject<HTMLDivElement>;
    mapRef: React.RefObject<HTMLDivElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;

    constructor(props: any) {
        super(props);
        this.state = {
            // Zooming/Panning controls
            scale: 1,
            position: new Coordinates(0,0),
            isDragging: false,
            dragStart: new Coordinates(0,0),
            width: 0,
            height: 0,

            // Calibration
            distanceInput: "100",
            calibrationPoint1: null,  // First point of the calibration line
            calibrationPoint2: null,  // Second point of the calibration line
            calibrationComplete: false, // Flag to check if calibration is done
            mapScale: 1,

            // Journey Calculation
            journeys: [],
            currentPath: 0,
        };
        this.divRef = React.createRef();
        this.mapRef = React.createRef();
        this.canvasRef = React.createRef();
    }

    getCurrentJourney(): Journey | undefined {
        return this.state.journeys[this.state.currentJourney]
    }


    componentDidMount() {
        if (this.divRef.current === null) {
            return console.error("Cannot mount Map Viewer component, references NULL")
        }
        this.divRef.current.addEventListener('wheel', this.handleWheel, { passive: false });


        // Load state from localStorage when the component mounts
        const savedState = localStorage.getItem('appState');
        if (savedState) {
            const parsedState = JSON.parse(savedState) as MapViewerState
            // Preserve journeys as instances of Journey class, to keep methods
            parsedState.journeys = parsedState.journeys.map((obj: any) => Journey.fromJson(obj));

            // reset the imageUrl and fetch it again
            parsedState.imageUrl = null;
            this.setState(parsedState, () => {
                this.fetchImage();
                const canvas = this.canvasRef.current!
                drawJourneys(parsedState.journeys, canvas);
            });
            return
        }
        this.fetchImage();
        // Set an initial width to avoid scaling issues when window is resized
        this.setState({ width: window.innerWidth })
        this.setState({ height: window.innerHeight })

    }

    componentDidUpdate(_prevProps: any, prevState: Readonly<any>) {
        // Save state to localStorage whenever it changes
        if (prevState !== this.state) {
            localStorage.setItem('appState', JSON.stringify(this.state));
        }
    }

    componentWillUnmount() {
        if (this.divRef.current !== null) {
            this.divRef.current.removeEventListener('wheel', this.handleWheel, {});
        }
    }

    fetchImage = async () => {
        try {
            const file = await getImageFromIndexedDB();
            if (file) {
                const objectUrl = URL.createObjectURL(file);
                this.setState({ imageUrl: objectUrl });
            }
        } catch (error) {
            console.error('Error fetching image from IndexedDB:', error);
        }
    };

    //
    // Image Zoom/Drag Controls
    //
    handleMouseDown = (e: React.MouseEvent) => {
        // Middle click or CTRL + Left Click
        if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
            e.preventDefault()
            this.setState({
                isDragging: true,
                dragStart: {
                    x: e.clientX - this.state.position.x,
                    y: e.clientY - this.state.position.y,
                },
            });
        }
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

    handleMouseUp = () => {
        this.setState({ isDragging: false })
    };

    handleWheel = (e: { stopPropagation: () => void; deltaY: number; }) => {
        e.stopPropagation();
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.setState((prevState: any) => ({
            scale: Math.min(Math.max(0.1, prevState.scale * scaleFactor), 5),
        }));
    };

    //
    // Coordinate Placing Controls
    //

    handleImageClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'IMG' || e.ctrlKey) return

        this.placeCalibrationPoints(e.clientX, e.clientY)
        this.placeCoordinate(e.clientX, e.clientY)
    };

    placeCoordinate = (x: number, y: number) => {
        if (!this.state.calibrationComplete) return
        const canvas = this.canvasRef.current!

        this.setState((prevState: MapViewerState) => {
            const journeys = prevState.journeys
            let currentJourney = this.state.currentJourney
            let journey = this.getCurrentJourney()
            if (!journey) {
                // Add a new journey if it does not exist yet
                journeys.push(new Journey())
                currentJourney = journeys.length - 1
                journey = journeys[currentJourney]
            }

            journey.addCoordinate(this.calculateCoords(x, y))
            drawJourneys(journeys, canvas);

            return { journeys: journeys, currentJourney: currentJourney }
        });
    }

    calculateCoords = (x: number, y: number): Coordinates => {
        const img = this.mapRef.current!;
        const rect = img.getBoundingClientRect();

        // Calculate click coordinates relative to the container
        x = (x - rect.left) / this.state.scale;
        y = (y - rect.top) / this.state.scale;

        return new Coordinates(x, y)
    }

    placeCalibrationPoints = (x: number, y: number) => {
        const coords = this.calculateCoords(x, y)
        if (!this.state.calibrationPoint1) {
            this.setState({
                calibrationPoint1: { x: coords.x, y: coords.y },
            });
        } else if (!this.state.calibrationPoint2) {
            this.setState({
                calibrationPoint2: { x: coords.x, y: coords.y },
            });
        }
    };

    //
    // Button Handlers
    //

    resetJourney = () => {
        this.setState((prevState: MapViewerState) => {
            const journey = this.getCurrentJourney()
            if (journey === undefined) {
                return
            }
            journey.path = []
            journey.totalDistance = 0

            const canvas = this.canvasRef.current!
            const journeys = prevState.journeys
            drawJourneys(journeys, canvas)

            return { journeys: journeys };
        });
    };

    undoJourney = () => {
        this.setState((prevState: MapViewerState) => {
            const journey = this.getCurrentJourney()
            if (journey === undefined) {
                return
            }
            journey.popCoordinatae()
            const journeys = prevState.journeys
            const canvas = this.canvasRef.current!
            drawJourneys(journeys, canvas)

            return { journeys: journeys };
        });
    };

    resetCalibration = () => {
        this.setState({
            calibrationPoint1: null,
            calibrationPoint2: null,
            calibrationComplete: false,
        })
    }

    addJourney = () => {
        this.setState((prevState: MapViewerState) => {
            const journeys = prevState.journeys
            journeys.push(JourneyFactory.create(journeys))
            console.log(this.state.journeys)
            return { journeys: journeys, currentJourney: journeys.length - 1 };
        });
    }

    removeJourney = (journeyKey: number) => {
        this.setState((prevState: MapViewerState) => {
            let journeys = prevState.journeys
            let currentJourney = prevState.currentJourney
            journeys = journeys.filter((_journey, key) => key !== journeyKey)
            if (currentJourney >= journeyKey) {
                 // Shift current index down by 1 if we removed below it
                currentJourney = Math.max(0, currentJourney - 1)
            }
            const canvas = this.canvasRef.current!
            drawJourneys(journeys, canvas)
            return { journeys: journeys, currentJourney: currentJourney };
        });
    }

    calibrate = () => {
        const distance = parseFloat(this.state.distanceInput);
        if (!isNaN(distance) && this.state.calibrationPoint1 && this.state.calibrationPoint2) {
            const { calibrationPoint1, calibrationPoint2 } = this.state;

            // Calculate the scaling factor
            const mapScale = distance / distanceBetween(calibrationPoint2.x, calibrationPoint2.y, calibrationPoint1.x, calibrationPoint1.y)
            this.setState({ mapScale: mapScale, calibrationComplete: true });
        }
    };

    selectJourney = (journeyIndex: number) => {
        if (journeyIndex >= this.state.journeys.length) {
            return
        }
        this.setState({
            currentJourney: journeyIndex,
        });
    }

    // Sets the miles per day on the CURRENT journey only!
    setMilesPerDay = (milesPerDay: number) => {
        this.setState((prevState: MapViewerState) => {
            const journeys = prevState.journeys
            let journey = this.getCurrentJourney()
            if (!journey) {
                return {}
            }
            journey.milesPerDay = milesPerDay

            return { journeys: journeys }// todo fix/clean up
        });
    }

    zoomIn = () => {
        this.setState((prevState: any) => ({
            scale: Math.min(prevState.scale * 1.2, 5),
        }))
    }

    zoomOut = () => {
        this.setState((prevState: any) => ({
            scale: Math.max(prevState.scale * 0.8, 0.1),
        }))
    }

    resetZoom = () => {
        this.setState({
            position: new Coordinates(0,0),
            scale: 1
        })
    }

    setDistanceInput = (value: string) => {
        this.setState({ distanceInput: value })
    }


    render() {
        const { calibrationPoint1, calibrationPoint2, scale, distanceInput, calibrationComplete, position, isDragging, journeys, imageUrl, width, height, mapScale } = this.state;

        return (
            <div
                ref={this.divRef}
                style={{
                    cursor: isDragging
                        ? 'grabbing'
                        : 'crosshair',
                    width: `${width}px`,
                    height: `${height}px`,
                    overflow: 'hidden',
                }}
                id='map'
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
                onMouseLeave={this.handleMouseUp}
                onWheel={this.handleWheel}
                onClick={this.handleImageClick}
                className="pixelify-sans"
            >

                {/* Top Right */}
                <div className="fixed top-4 right-4 z-50 flex space-x-3">
                    <div className="bg-gray-500 w-10 text-white text-center px-4 py-2 hover:bg-gray-300 cursor-pointer group">
                        ?
                        <div className="absolute overflow-hidden top-10 right-0 w-0 h-0 p-0 opacity-0 group-hover:w-80 group-hover:h-40 group-hover:p-4 group-hover:opacity-100 transition-all duration-300 bg-white">
                            <p className="text-gray-700 text-lg mb-4">To Zoom: Use Scroll Wheel or the + - buttons in the bottom right.</p>
                            <p className="text-gray-700 text-lg">To Pan: Hold Middle Click or CTRL + Left Click and drag.</p>
                        </div>
                    </div>
                </div>

                {/* Top Banner */}
                <TopBanner
                    calibrationPoint1={calibrationPoint1}
                    calibrationPoint2={calibrationPoint2}
                    calibrationComplete={calibrationComplete}
                    distanceInput={distanceInput}
                    setDistanceInput={this.setDistanceInput}
                    handleCalibrate={this.calibrate}
                />

                {/* Top Left Journey Windows */}
                <div className="fixed top-0 left-0 z-50 p-4 h-[calc(100%-70px)] overflow-y-auto no-scrollbar">
                    {
                        journeys.map((journey: Journey, key: number) => (
                            <JourneyMenu
                                title={"Journey " + (key + 1)}
                                isOpen={this.state.currentJourney == key}
                                journey={journey}
                                mapScale={mapScale}
                                key={key}
                                onClick={() => this.selectJourney(key)}
                                onDelete={() => this.removeJourney(key)}
                                setMilesPerDay={this.setMilesPerDay}
                            />
                        ))
                    }
                </div>

                <FooterButtons
                    calibrationPoint1={calibrationPoint1}
                    calibrationPoint2={calibrationPoint2}
                    calibrationComplete={calibrationComplete}
                    currentJourney={this.getCurrentJourney()}
                    resetCalibration={this.resetCalibration}
                    addJourney={this.addJourney}
                    resetJourney={this.resetJourney}
                    undoJourney={this.undoJourney}
                    zoomIn={this.zoomIn}
                    zoomOut={this.zoomOut}
                    resetZoom={this.resetZoom}
                />

                <div
                    ref={this.mapRef}
                    style={{
                        position: 'absolute',
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center',
                        width: `${width}px`,
                        height: `${height}px`,
                    }}
                >
                    {/* Image */}
                    <img
                        src={imageUrl}
                        alt="Zoomable map"
                        className="z-10"
                        style={{
                            display: 'block',
                            maxWidth: `${width}px`,
                            maxHeight: `${height}px`,
                            userSelect: 'none',
                        }}
                    />

                    <CalibrationPath
                        calibrationPoint1={calibrationPoint1}
                        calibrationPoint2={calibrationPoint2}
                        calibrationComplete={calibrationComplete}
                    />

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
                    {/* Path */}
                    {
                        this.state.journeys.map((journey: Journey, index: React.Key) => (
                            <Path journey={journey} key={index} />
                        ))
                    }
                </div>
            </div>
        );
    }
}

export const ImageViewerWithRouter = withRouter(MapViewer);
