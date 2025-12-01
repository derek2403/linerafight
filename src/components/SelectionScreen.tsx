import React from 'react';
import { useGameStore } from '../store/gameStore';
import { FighterCard } from './FighterCard';
import { motion } from 'framer-motion';

export const SelectionScreen: React.FC = () => {
    const { allFighters, playerTeam, selectFighter, removeFromTeam, startGame } = useGameStore();

    const handleSelect = (id: string) => {
        if (playerTeam.find(f => f.id === id)) {
            removeFromTeam(id);
        } else {
            selectFighter(id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 p-4">
            <header className="mb-4">
                <h1 className="text-2xl font-black text-gray-800 mb-1">Select Team</h1>
                <p className="text-sm text-gray-500">Choose 3 fighters ({playerTeam.length}/3)</p>
            </header>

            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-3 pb-20">
                {allFighters.map((fighter) => (
                    <FighterCard
                        key={fighter.id}
                        fighter={fighter}
                        isSelected={!!playerTeam.find(f => f.id === fighter.id)}
                        onSelect={() => handleSelect(fighter.id)}
                        disabled={playerTeam.length >= 3 && !playerTeam.find(f => f.id === fighter.id)}
                    />
                ))}
            </div>

            <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    disabled={playerTeam.length !== 3}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                >
                    Start Battle
                </motion.button>
            </div>
        </div>
    );
};
