import React from 'react';
import { Coordinates } from '../journey/Journey';

interface TopBannerProps {
    calibrationPoint1: Coordinates | null
    calibrationPoint2: Coordinates | null
    calibrationComplete: Boolean
    distanceInput: string
    setDistanceInput: (input: string) => void
    handleCalibrate: () => void
}

const TopBanner: React.FC<TopBannerProps> = ({
    calibrationPoint1,
    calibrationPoint2,
    calibrationComplete,
    distanceInput,
    setDistanceInput,
    handleCalibrate
}) => {
    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-600 bg-opacity-70 text-white text-center py-2 px-3 z-50">
            {!calibrationComplete && !(calibrationPoint1 && calibrationPoint2) &&
                <h2 className="text-lg px-2">Click on two places on the map to set the scale.</h2>
            }

            {calibrationPoint1 && calibrationPoint2 && !calibrationComplete && (
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg px-2">Enter the distance of your selection (in miles):</h2>
                    <input
                        type="number"
                        value={distanceInput}
                        onChange={(e) => setDistanceInput(e.target.value)}
                        className="border border-gray-300 px-3 py-2 w-24"
                    />
                    <button
                        onClick={handleCalibrate}
                        className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                        Submit
                    </button>
                </div>
            )}
            {calibrationComplete &&
                <h2 className="text-lg">Draw a path on the map to calcualte the distance and travel time.</h2>
            }
        </div>
    )
};

export default TopBanner;
