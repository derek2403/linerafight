import React, { useState, useEffect, useRef } from 'react';
import Board from './Board';
import Controls from './Controls';
import { useGameLoop } from './engine/useGameLoop';
import { TowerType, Position } from './engine/types';
import { TOWERS, LEVEL_1_PATH } from './engine/constants';
import { useGame } from '../context/GameContext';
import ConnectWallet from '../components/ConnectWallet';
import EnemyInfo from './EnemyInfo';

const Game: React.FC = () => {
    const { gameState, setGameState, startGame: localStartGame, skipWave, collectDrop } = useGameLoop();
    const [selectedTower, setSelectedTower] = useState<TowerType | null>(null);
    const { startGame: chainStartGame, processWave, endGame: chainEndGame, isConnecting } = useGame();

    // Track wave to trigger chain actions
    const prevWaveRef = useRef(gameState.wave);

    // Track if we are in a game session to call EndGame on game over
    const isSessionActiveRef = useRef(false);

    useEffect(() => {
        const syncChain = async () => {
            // Check for Game Start (Wave 1 and was not playing or wave 0?)
            if (gameState.isPlaying && !isSessionActiveRef.current) {
                isSessionActiveRef.current = true;
                // Trigger Chain Start
                await chainStartGame(1); // Default wager 1
            }

            // Check for Wave Progression
            if (gameState.wave > prevWaveRef.current && prevWaveRef.current > 0) {
                // Wave Survived -> Battle/Hit
                await processWave(gameState.wave);
            }
            prevWaveRef.current = gameState.wave;

            // Check for Game Over
            if (gameState.isGameOver && isSessionActiveRef.current) {
                isSessionActiveRef.current = false;
                await chainEndGame();
            }
        };

        syncChain();
    }, [gameState.wave, gameState.isPlaying, gameState.isGameOver, chainStartGame, processWave, chainEndGame]);

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
        <div className="flex h-screen w-screen text-slate-200 overflow-hidden font-mono bg-stone-950">
            {/* Left Sidebar - Enemy Info */}
            <EnemyInfo />

            {/* Center - Game Board */}
            <div className="flex-1 relative flex items-center justify-center bg-stone-900/50 shadow-inner">
                {/* Retro Frame */}
                <div className="relative p-4 bg-stone-800 rounded-xl shadow-2xl border-4 border-stone-700">
                    <div className="border border-stone-900 rounded-lg overflow-hidden ring-4 ring-black/40">
                        <Board
                            gameState={gameState}
                            onTileClick={handleTileClick}
                            onDropClick={collectDrop}
                        />
                    </div>
                </div>

                {/* Connection Status Overlay - Centered or Top Left of Board Area */}
                {isConnecting && (
                    <div className="absolute top-4 left-4 bg-blue-900/80 px-4 py-2 rounded text-xs text-blue-200 animate-pulse border border-blue-500 z-50">
                        Connecting to Linera...
                    </div>
                )}
            </div>

            {/* Right Sidebar - Wallet & Controls */}
            <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-20">
                {/* Wallet Connection Header */}
                <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                    <ConnectWallet />
                </div>

                {/* Controls - Takes remaining height */}
                <div className="flex-1 overflow-hidden">
                    <Controls
                        gold={gameState.gold}
                        lives={gameState.lives}
                        stars={gameState.stars}
                        wave={gameState.wave}
                        waveTimer={gameState.waveTimer}
                        selectedTower={selectedTower}
                        onSelectTower={setSelectedTower}
                        onStartGame={localStartGame}
                        onSkipWave={skipWave}
                        isPlaying={gameState.isPlaying}
                    />
                </div>
            </div>

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
