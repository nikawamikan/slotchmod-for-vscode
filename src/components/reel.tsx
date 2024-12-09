import React, { useState, useEffect } from 'react';
import './reel.css';

const DELAY_MS = 64;

interface ReelProps {
    index: number;
    onStop: (index: number, angle: number) => void;
}

export function Reel({ index, onStop }: ReelProps) {
    const [isRotating, setIsRotating] = useState(true);
    const [rotationAngle, setRotationAngle] = useState(0);

    const toggleRotation = () => {
        setIsRotating(!isRotating);

        onStop(index, (Math.abs(rotationAngle) % 360) / 45); // 親コンポーネントにインデックスと角度を通知
    };

    useEffect(() => {
        let intervalId: number | null = null;

        if (isRotating) {
            intervalId = window.setInterval(() => {
                setRotationAngle(prevAngle => prevAngle - 45);
            }, DELAY_MS);
        } else if (intervalId !== null) {
            clearInterval(intervalId);
        }

        return () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
            }
        };
    }, [isRotating, rotationAngle, onStop, index]);

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="scene">
                <div className="reel"
                    style={{ transform: `rotateX(${rotationAngle}deg)`, transition: `${DELAY_MS * 1.1}ms` }}
                >
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="face"
                            style={{ transform: `rotateX(${i * 45}deg) translateZ(120px)` }}>
                            {i}
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-36">
                <button
                    className={`mt-5 px-4 py-2 rounded ${isRotating ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}
                    onClick={toggleRotation}
                    disabled={!isRotating}
                >
                    Stop
                </button>
            </div>
        </div>
    );
};