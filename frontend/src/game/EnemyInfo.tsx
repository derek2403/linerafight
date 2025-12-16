import React from 'react';
import { ENEMIES } from './engine/constants';
import enemyScout from './assets/enemy-scout.png';
import enemySoldier from './assets/enemy-soldier.png';
import enemyTank from './assets/enemy-tank.png';

const EnemyInfo: React.FC = () => {
    const getEnemyImg = (type: string) => {
        switch (type) {
            case 'scout': return enemyScout;
            case 'soldier': return enemySoldier;
            case 'tank': return enemyTank;
            default: return enemyScout;
        }
    };

    return (
        <div className="w-80 h-full bg-gray-900 border-r border-gray-800 flex flex-col shadow-2xl z-20 overflow-y-auto">
            <div className="p-6 bg-gray-800 border-b border-gray-700">
                <h2 className="text-xl font-bold text-red-500 uppercase tracking-widest">Enemies</h2>
                <p className="text-xs text-gray-400 mt-1">Know your enemy to survive.</p>
            </div>

            <div className="p-6 space-y-6">
                {Object.values(ENEMIES).map((enemy) => (
                    <div key={enemy.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-red-500/50 transition-colors group">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-16 h-16 bg-black/40 rounded flex items-center justify-center p-2 ring-1 ring-white/10 group-hover:ring-red-500/30 transition-all">
                                <img
                                    src={getEnemyImg(enemy.id)}
                                    alt={enemy.name}
                                    className="w-full h-full object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-200">{enemy.name}</h3>
                                <div className="text-xs text-yellow-500 font-mono">Reward: ${enemy.reward}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-black/20 p-2 rounded">
                                <div className="text-gray-500 uppercase tracking-wider text-[10px]">Health</div>
                                <div className="text-gray-300 font-mono">{enemy.hp} HP</div>
                            </div>
                            <div className="bg-black/20 p-2 rounded">
                                <div className="text-gray-500 uppercase tracking-wider text-[10px]">Speed</div>
                                <div className="text-gray-300 font-mono">{enemy.speed} tiles/s</div>
                            </div>
                            <div className="bg-black/20 p-2 rounded col-span-2">
                                <div className="text-gray-500 uppercase tracking-wider text-[10px]">Damage</div>
                                <div className="text-red-400 font-mono">{enemy.damage} Lives</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EnemyInfo;
