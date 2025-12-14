import React from 'react';
import { TOWERS } from './engine/constants';
import { TowerType } from './engine/types';
import towerBasic from './assets/tower-basic.png';
import towerSplash from './assets/tower-splash.png';
import towerSlow from './assets/tower-slow.png';

interface ControlsProps {
    gold: number;
    lives: number;
    wave: number;
    waveTimer: number;
    selectedTower: TowerType | null;
    onSelectTower: (type: TowerType) => void;
    onStartGame: () => void;
    onSkipWave: () => void;
    isPlaying: boolean;
}

const Controls: React.FC<ControlsProps> = ({
    gold, lives, wave, waveTimer, selectedTower, onSelectTower, onStartGame, onSkipWave, isPlaying
}) => {
    const getTowerImg = (type: string) => {
        switch (type) {
            case 'basic': return towerBasic;
            case 'splash': return towerSplash;
            case 'slow': return towerSlow;
            default: return towerBasic;
        }
    };

    return (
        <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-20">
            {/* Stats Header */}
            <div className="p-6 bg-gray-800 border-b border-gray-700 grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-3 rounded border border-white/10">
                    <div className="text-xs text-yellow-500 uppercase font-bold tracking-wider">Gold</div>
                    <div className="text-2xl font-bold text-white font-mono">${gold}</div>
                </div>
                <div className="bg-black/30 p-3 rounded border border-white/10">
                    <div className="text-xs text-red-500 uppercase font-bold tracking-wider">Health</div>
                    <div className="text-2xl font-bold text-white font-mono">{lives}%</div>
                </div>
                <div className="col-span-2 bg-black/30 p-2 rounded border border-white/10 flex justify-between items-center px-4">
                    <div>
                        <span className="text-blue-400 font-bold uppercase text-sm block">Wave</span>
                        <span className="text-xl font-mono text-white">{wave}</span>
                    </div>

                    {isPlaying && (
                        <div className="text-right">
                            <span className="text-gray-400 uppercase text-[10px] block tracking-widest">Next Wave</span>
                            <span className={`text-xl font-mono ${waveTimer < 5 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                                {Math.ceil(waveTimer)}s
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                <h3 className="mb-4 font-bold uppercase text-gray-400 text-xs tracking-widest border-b border-gray-700 pb-2">Construction</h3>
                <div className="space-y-3">
                    {Object.values(TOWERS).map((tower) => {
                        const canAfford = gold >= tower.cost;
                        return (
                            <button
                                key={tower.id}
                                onClick={() => onSelectTower(tower.id as TowerType)}
                                disabled={!canAfford}
                                className={`
                  w-full group relative overflow-hidden rounded-lg border-2 transition-all p-3 flex items-center gap-4 text-left
                  ${selectedTower === tower.id
                                        ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                        : canAfford
                                            ? 'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750'
                                            : 'bg-gray-800/50 border-gray-800 opacity-50 cursor-not-allowed grayscale'
                                    }
                `}
                            >
                                {/* Icon Preview */}
                                <div className="w-12 h-12 bg-black/50 rounded flex-shrink-0 relative overflow-hidden ring-1 ring-white/10 flex items-center justify-center p-1">
                                    <img
                                        src={getTowerImg(tower.id)}
                                        alt={tower.name}
                                        className="w-full h-full object-contain"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={`font-bold truncate ${selectedTower === tower.id ? 'text-blue-300' : 'text-gray-200'}`}>{tower.name}</span>
                                        <span className="font-mono text-yellow-400 text-sm">${tower.cost}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 flex gap-2">
                                        <span>DMG: {tower.damage}</span>
                                        <span>RNG: {tower.range}</span>
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="p-6 bg-gray-900 border-t border-gray-800">
                {!isPlaying ? (
                    <button
                        onClick={onStartGame}
                        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-lg shadow-lg uppercase tracking-wide border-2 border-green-400"
                    >
                        Start Game
                    </button>
                ) : (
                    <button
                        onClick={onSkipWave}
                        className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg rounded-lg shadow-lg uppercase tracking-wide border-2 border-gray-600 flex flex-col items-center justify-center gap-1"
                    >
                        <span className="text-sm text-gray-400">Call Early</span>
                        <span className="text-xs text-gray-500">Skip Timer</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Controls;
