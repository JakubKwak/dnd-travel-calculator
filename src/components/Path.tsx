import React from 'react';
import { Coordinates, Journey } from '../journey/Journey';

interface PathProps {
    journey: Journey
    isSelected: boolean
}

const Path: React.FC<PathProps> = ({ journey, isSelected }) => {
    const pointSvg = (coordinate: Coordinates, animated: boolean = false) => {
        return (
            <svg
                className={animated ? 'animate-ping' : ''}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={journey.colorScheme.outerColor}
                style={{
                    position: 'absolute',
                    top: coordinate.y - 2.5,  // Center the X by shifting half the width/height (3px)
                    left: coordinate.x - 2.5,
                    color: journey.colorScheme.outerColor,
                    width: 5,
                    height: 5,
                    pointerEvents: 'none', // Ensure it doesn’t block clicks
                    opacity: '80%',
                    zIndex: 49
                }}
            >
                <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
            </svg>
        )
    }

    return (
        <>
            {journey.path.map((coordinate: Coordinates, index: React.Key) => (
                <React.Fragment key={index}>
                    {pointSvg(coordinate)}
                    {
                        // A second pulsing X on the last coordinte of the active journey
                        isSelected && index == (journey.path.length - 1) && pointSvg(coordinate, true)
                    }
                </React.Fragment >
            ))}
        </>
    )
};

export default Path;
