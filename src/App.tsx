import React, { useEffect, useState } from 'react';
import { Reel } from './components/reel'; // Adjust the path as necessary
import './App.css';

const vscode = (window as any).acquireVsCodeApi();
const REEL_COUNT = 3;

export function App() {
    const [reelStates, setReelStates] = useState<(number | null)[]>(
        Array.from({ length: REEL_COUNT }).map(() => null)
    );
    const [targetPath, setTargetPath] = useState<string | null>(null);
    const [allReelsStopped, setAllReelsStopped] = useState(false);
    const [isZorome, setIsZorome] = useState(false);

    const getNowPermissions = () => {
        return reelStates.map(x => x ?? "?").join("");
    }

    const handleChmod = () => {
        vscode.postMessage({
            command: 'slotchmod',
            payload: {
                reelStates
            }
        });
    };

    const handleReelStop = (index: number, angle: number) => {
        const newReelStates = [...reelStates];
        newReelStates[index] = angle;

        setReelStates(newReelStates);
    };

    useEffect(() => {
        if (reelStates.every(state => state !== null)) {
            setAllReelsStopped(true);
            setIsZorome(new Set(reelStates).size === 1);
            handleChmod();
        }
    }, [reelStates]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.command === 'setTargetPath') {
                setTargetPath(message.targetPath);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <div className={`flex flex-col items-center justify-center h-screen p-4 ${allReelsStopped ? (isZorome ? 'gaming-bg' : '') : ''}`}>
            <h1 className="text-2xl font-bold mb-4 text-center">SlotCHMOD</h1>
            <p className="mb-4 text-lg font-mono bg-gray-800 text-white p-2 rounded">
                chmod {getNowPermissions()} {targetPath}
            </p>
            <div className="flex max-w-96 justify-around items-center mb-5 mt-5">
                {Array.from({ length: REEL_COUNT }).map((_, i) => (
                    <Reel key={i} index={i} onStop={handleReelStop} />
                ))}
            </div>
            {allReelsStopped && (
                <p className="text-xl font-bold mt-4">
                    {isZorome ? '🎉 おめでとう！！ ゾロ目が出ました！！！ 🎉' : 'コマンドを実行しました！'}
                </p>
            )}
        </div>
    );
};