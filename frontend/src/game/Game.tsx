import React, { useState } from 'react';
import Board from './Board';
import Controls from './Controls';
import { useGameLoop } from './engine/useGameLoop';
import { TowerType, Position } from './engine/types';
import { TOWERS, LEVEL_1_PATH } from './engine/constants';

const Game: React.FC = () => {
    const { gameState, setGameState, startGame, skipWave, collectDrop } = useGameLoop();
    const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);

    const handleTileClick = (pos: Position) => {
        if (!selectedTower) return;

        // Check collision with path
        const isPath = LEVEL_1_PATH.some(p => p[0] === pos.y && p[1] === pos.x);
        if (isPath) return; // Cannot build on path

        // Check collision with existing towers
        const hasTower = gameState.towers.some(t => t.x === pos.x && t.y === pos.y);
        if (hasTower) return;

        // Check cost
        const cost = TOWERS[selectedTower.toUpperCase() as keyof typeof TOWERS].cost;
        if (gameState.gold < cost) return;

        // Build
        setGameState(prev => ({
            ...prev,
            gold: prev.gold - cost,
            towers: [
                ...prev.towers,
                {
                    id: crypto.randomUUID(),
                    type: selectedTower,
                    x: pos.x,
                    y: pos.y,
                    lastFired: 0,
                    angle: 0
                }
            ]
        }));
        setSelectedTower(null);
    };

    return (
        <div className="flex h-screen bg-stone-900 text-slate-200 overflow-hidden font-mono">
            {/* Game Area Wrapper */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-800 to-stone-950 opacity-50 z-0" />

                {/* Retro Frame */}
                <div className="relative z-10 p-4 bg-stone-800 rounded-xl shadow-2xl border-4 border-stone-700">
                    <div className="border border-stone-900 rounded-lg overflow-hidden ring-4 ring-black/40">
                        <Board
                            gameState={gameState}
                            onTileClick={handleTileClick}
                            onDropClick={collectDrop}
                        />
                    </div>
                </div>
            </div>

            {/* HUD / Controls */}
            <Controls
                gold={gameState.gold}
                lives={gameState.lives}
                stars={gameState.stars}
                wave={gameState.wave}
                waveTimer={gameState.waveTimer}
                selectedTower={selectedTower}
                onSelectTower={setSelectedTower}
                onStartGame={startGame}
                onSkipWave={skipWave}
                isPlaying={gameState.isPlaying}
            />

            {/* Game Over Modal */}
            {gameState.isGameOver && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
                    <div className="text-center p-12 border-2 border-red-600 bg-red-950/30 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                        <h1 className="text-7xl font-black text-red-500 mb-6 tracking-tighter">GAME OVER</h1>
                        <div className="text-2xl mb-8 font-bold">Survived {gameState.wave} Waves</div>
                        <div className="text-xl mb-8 text-yellow-400">Collected {gameState.stars} Stars!</div>
                        <button
                            className="px-8 py-4 bg-red-600 text-white font-bold text-xl rounded hover:bg-red-500 hover:scale-105 transition-all shadow-lg"
                            onClick={() => window.location.reload()}
                        >
                            TRY AGAIN
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game;
