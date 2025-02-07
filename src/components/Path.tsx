import React from 'react';
import { Coordinates, Journey } from '../journey/Journey';

interface PathProps {
    journey: Journey
    isSelected: boolean
}

const Path: React.FC<PathProps> = ({ journey, isSelected }) => {
    return (
        <>
            {journey.path.map((coordinate: Coordinates, index: React.Key) => (
                <React.Fragment key={index}>
                    <div
                        style={{
                            position: 'absolute',
                            top: coordinate.y - 2.5,  // Center the circle by shifting half the width/height (3px)
                            left: coordinate.x - 2.5,
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            backgroundColor: journey.colorScheme.innerColor,
                            border: '1px solid ' + journey.colorScheme.outerColor,
                            pointerEvents: 'none', // Ensure it doesn’t block clicks
                            opacity: '80%',
                            zIndex: 49
                        }}
                    />
                    {
                        // A second pulsing circle on the last coordinte of the active journey
                        isSelected && index == (journey.path.length - 1) &&
                        <div
                            style={{
                                position: 'absolute',
                                top: coordinate.y - 2.5, 
                                left: coordinate.x - 2.5,
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                backgroundColor: journey.colorScheme.outerColor,
                                pointerEvents: 'none', 
                                zIndex: 48
                            }}
                            className='animate-ping'
                        />
                    }
                </React.Fragment>
            ))}
        </>
    )
};

export default Path;
