import React from 'react';
import { Coordinates, Journey } from '../journey/Journey';
import { useNavigate } from 'react-router-dom';

interface FooterButtonsProps {
    calibrationPoint1: Coordinates | null
    calibrationPoint2: Coordinates | null
    currentJourney: Journey | undefined,
    resetCalibration: () => void
    undoJourney: () => void
    zoomIn: () => void
    zoomOut: () => void
    resetZoom: () => void
}

const FooterButtons: React.FC<FooterButtonsProps> = ({
    calibrationPoint1,
    calibrationPoint2,
    currentJourney,
    resetCalibration,
    undoJourney,
    zoomIn,
    zoomOut,
    resetZoom
}) => {
    const navigate = useNavigate()

    return (
        <>
            {/* Bottom Left */}
            <div className="fixed bottom-4 left-4 z-50 flex space-x-3 text-xl">
                <button
                    className="bg-gray-700 text-white px-3 py-2 hover:bg-gray-600"
                    onClick={() => navigate('/')}
                >
                    Back
                </button>
                {(calibrationPoint1 || calibrationPoint2) &&
                    <button
                        className="bg-red-700 text-white px-3 py-2 hover:bg-red-600"
                        onClick={resetCalibration}
                    >
                        Reset Scale
                    </button>
                }
                {currentJourney && currentJourney.path.length > 0 &&
                    <button
                        className="bg-gray-700 text-white font-medium px-3 py-2 hover:bg-gray-600"
                        onClick={undoJourney}
                    >
                        Undo
                    </button>
                }
            </div>

            {/* Bottom Right Zoom Buttons */}
            <div className="fixed bottom-4 right-4 z-50 flex space-x-3 text-xl">
                <button
                    className="bg-gray-700 text-white font-medium px-3 py-2 hover:bg-gray-600"
                    onClick={resetZoom}
                >
                    Reset Zoom
                </button>
                <button
                    className="bg-gray-700 w-10 text-white font-medium px-3 py-2 hover:bg-gray-600"
                    onClick={zoomIn}
                >
                    +
                </button>
                <button
                    className="bg-gray-700 w-10 text-white font-medium px-3 py-2 hover:bg-gray-600"
                    onClick={zoomOut}
                >
                    -
                </button>
            </div>
        </>
    )
};

export default FooterButtons;
