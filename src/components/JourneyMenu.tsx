import React from 'react';
import { Journey } from '../journey/Journey';
import { calculateJourneyDistance, calculateJourneyTime } from '../calculation/CalculateJourneys';

interface JourneyMenuProps {
    journey: Journey
    mapScale: number
    isOpen: boolean
    title: string
    onClick: () => void
    onDelete: () => void
    onReset: () => void
    setMilesPerDay: (miles: number) => void // Needs to go through a setter for proper reactivity 
}

const JourneyMenu: React.FC<JourneyMenuProps> = ({ journey, mapScale, isOpen, title, onClick: onClick, onDelete, onReset, setMilesPerDay }) => {
    const handleClick = (event: React.MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName.toLowerCase() === "button") {
            return;
        }
        if (!isOpen) {
            onClick()
        }
    }

    return (
        <div
            className={`bg-gray-700 bg-opacity-80 text-white text-center py-2 px-2 z-50 text-xl cursor-default mb-2 ${!isOpen ? 'hover:bg-gray-500 hover:bg-opacity-80 hover:cursor-pointer' : ''}`}
            onClick={handleClick}
        >
            <div className='flex justify-between'>
                <h1 className='text-2xl pb-2'>
                    <span style={{ color: journey.colorScheme.innerColor }}>o </span>
                    {title}
                </h1>
                <button className='bg-red-500 w-8 h-8 hover:bg-red-400' onClick={onDelete}>
                    X
                </button>
            </div>
            {
                isOpen &&
                <>
                    <div className="flex mb-2 justify-between items-center gap-4">
                        <p className="text-gray-300 ml-2">By Ship:</p>
                        <div className="flex justify-between gap-3 items-center">
                            <button
                                className="bg-gray-800 text-white text-small hover:bg-gray-700 p-1"
                                onClick={() => setMilesPerDay(90)}
                            >
                                Fast
                            </button>
                            <button
                                className="bg-gray-800 text-white text-small hover:bg-gray-700 p-1"
                                onClick={() => setMilesPerDay(60)}
                            >
                                Normal
                            </button>
                            <button
                                className="bg-gray-800 text-white text-small hover:bg-gray-700 p-1"
                                onClick={() => setMilesPerDay(30)}
                            >
                                Slow
                            </button>
                        </div>
                    </div>
                    <div className="flex mb-2 justify-between items-center gap-4">
                        <p className="text-gray-300 ml-2">On Foot:</p>
                        <div className="flex justify-between gap-3 items-center">
                            <button
                                className="bg-gray-800 text-white text-small hover:bg-gray-700 p-1"
                                onClick={() => setMilesPerDay(30)}
                            >
                                Fast
                            </button>
                            <button
                                className="bg-gray-800 text-white text-small hover:bg-gray-700 p-1"
                                onClick={() => setMilesPerDay(24)}
                            >
                                Normal
                            </button>
                            <button
                                className="bg-gray-800 text-white text-small hover:bg-gray-700 p-1"
                                onClick={() => setMilesPerDay(18)}
                            >
                                Slow
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-row justify-center gap-3 my-4">
                        <p>Miles Per Day:</p>
                        <input
                            type="number"
                            value={journey.milesPerDay}
                            onChange={(e) => setMilesPerDay(Number(e.target.value) ?? 1)}
                            className="border border-gray-300 w-20 text-small pl-1 bg-black"
                        />
                    </div>
                </>
            }

            <div className="flex justify-between gap-3 items-center mx-2">
                <p>Distance:</p>
                <p className="text-2xl">{calculateJourneyDistance(journey, mapScale)} Miles</p>
            </div>
            <div className="flex justify-between gap-3 items-center mx-2">
                <p>Travel Time:</p>
                <p className="text-2xl">{calculateJourneyTime(journey, mapScale)} Days</p>
            </div>

            {
                isOpen &&
                <button
                    className="bg-red-700 text-white font-medium px-3 py-2 hover:bg-red-600 disabled:bg-gray-800 text-sm w-full"
                    disabled={journey.path.length === 0}
                    onClick={onReset}
                >
                    Reset Journey
                </button>
            }
        </div>
    )
};

export default JourneyMenu;
