import React from 'react';
import { Coordinates } from '../journey/Journey';

interface CalibrationPathProps {
    calibrationPoint1: Coordinates | null;
    calibrationPoint2: Coordinates | null;
    calibrationComplete: Boolean;
}

const CalibrationPath: React.FC<CalibrationPathProps> = ({ calibrationPoint1, calibrationPoint2, calibrationComplete }) => {
    return (
        <>
            {calibrationPoint1 && calibrationPoint2 && !calibrationComplete && (
                <svg
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', top: '0', left: '0', pointerEvents: 'none' }}
                >
                    <line
                        x1={calibrationPoint1.x}
                        y1={calibrationPoint1.y}
                        x2={calibrationPoint2.x}
                        y2={calibrationPoint2.y}
                        stroke="blue"
                        strokeWidth="1"
                        strokeDasharray="2,2"  // Dotted line pattern: 2px dash, 2px gap
                    />
                </svg>
            )}
            {calibrationPoint1 && !calibrationComplete && (
                <div
                    style={{
                        position: 'absolute',
                        top: calibrationPoint1.y - 2.5,
                        left: calibrationPoint1.x - 2.5,
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        backgroundColor: 'blue',
                        border: '1px solid #0f0063',
                        opacity: '80%'
                    }}
                />
            )}
            {calibrationPoint2 && !calibrationComplete && (
                <div
                    style={{
                        position: 'absolute',
                        top: calibrationPoint2.y - 2.5,
                        left: calibrationPoint2.x - 2.5,
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        backgroundColor: 'blue',
                        border: '1px solid #0f0063',
                        opacity: '80%'
                    }}
                />
            )}
        </>
    )
};

export default CalibrationPath;
