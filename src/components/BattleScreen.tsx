import React from 'react';
import { useGameStore } from '../store/gameStore';
import { HealthBar } from './HealthBar';
import { BattleLog } from './BattleLog';
import { Controls } from './Controls';
import { motion } from 'framer-motion';

export const BattleScreen: React.FC = () => {
    const { playerTeam, enemyTeam, logs, currentTurn, playerAction, gameStatus, resetGame } = useGameStore();

    // For simplicity in this version, we assume 1v1 active battle, but the store supports 3v3.
    // We'll display the first living fighter from each team as the "active" one.
    const activePlayer = playerTeam.find(p => p.hp > 0) || playerTeam[0];
    const activeEnemy = enemyTeam.find(e => e.hp > 0) || enemyTeam[0];

    const handleAttack = (skillId: string) => {
        if (currentTurn === 'Player' && activePlayer.hp > 0) {
            playerAction(activePlayer.id, skillId);
        }
    };

    if (gameStatus === 'Victory' || gameStatus === 'Defeat') {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8 text-center">
                <h1 className="text-4xl font-black mb-4">{gameStatus === 'Victory' ? 'VICTORY!' : 'DEFEAT...'}</h1>
                <button
                    onClick={resetGame}
                    className="px-8 py-3 bg-blue-600 rounded-full font-bold hover:bg-blue-500 transition-colors"
                >
                    Play Again
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-full bg-gradient-to-b from-blue-100 to-white overflow-hidden">
            {/* Background Arena */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />

            {/* Battle Logs */}
            <BattleLog logs={logs} />

            {/* Battle Area */}
            <div className="h-2/3 relative p-4 flex flex-col justify-between">

                {/* Enemy Section */}
                <div className="flex flex-col items-end">
                    <HealthBar
                        current={activeEnemy.hp}
                        max={activeEnemy.maxHp}
                        label={activeEnemy.name}
                        level={activeEnemy.level}
                        isEnemy
                    />
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="mt-4 w-32 h-32 relative"
                    >
                        {activeEnemy.avatar ? (
                            <img src={activeEnemy.avatar} alt={activeEnemy.name} className="w-full h-full object-contain drop-shadow-xl" />
                        ) : (
                            <div className="w-full h-full bg-gray-400 rounded-lg flex items-center justify-center shadow-xl border-4 border-gray-300">
                                <span className="text-4xl">😈</span>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Player Section */}
                <div className="flex flex-col items-start mb-12">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="mb-4 w-32 h-32 relative"
                    >
                        {activePlayer.avatar ? (
                            <img src={activePlayer.avatar} alt={activePlayer.name} className="w-full h-full object-contain drop-shadow-xl" />
                        ) : (
                            <div className="w-full h-full bg-blue-400 rounded-lg flex items-center justify-center shadow-xl border-4 border-blue-300">
                                <span className="text-4xl">🦸</span>
                            </div>
                        )}
                    </motion.div>
                    <HealthBar
                        current={activePlayer.hp}
                        max={activePlayer.maxHp}
                        label={activePlayer.name}
                        level={activePlayer.level}
                    />
                </div>
            </div>

            {/* Controls */}
            <Controls
                activeFighter={activePlayer}
                onAttack={handleAttack}
                disabled={currentTurn !== 'Player' || activePlayer.hp <= 0}
            />
        </div>
    );
};
