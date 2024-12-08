import React from 'react';

const vscode = (window as any).acquireVsCodeApi();

export function App() {
    const handleDestroy = () => {
        vscode.postMessage({
            command: 'destroy'
        });
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Destroy</h1>
            <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleDestroy}
            >
                Destroy
            </button>
        </div>
    );
};