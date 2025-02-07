import React from 'react';
import { Coordinates, Journey } from '../journey/Journey';

interface PathProps {
    journey: Journey
}

const Path: React.FC<PathProps> = ({ journey }) => {
    return (
        <>
            {journey.path.map((coordinate: Coordinates, index: React.Key) => (
                <div
                    key={index}
                    style={{
                        position: 'absolute',
                        top: coordinate.y - 2.5,  // Center the circle by shifting half the width/height (3px)
                        left: coordinate.x - 2.5,
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        backgroundColor: journey.colorScheme.innerColor,
                        border: '1px solid '+journey.colorScheme.outerColor,
                        pointerEvents: 'none', // Ensure it doesn’t block clicks
                        opacity: '80%'
                    }}
                />
            ))}
        </>
    )
};

export default Path;
