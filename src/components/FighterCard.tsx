import React from 'react';
import type { Fighter } from '../types';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface FighterCardProps {
    fighter: Fighter;
    isSelected: boolean;
    onSelect: () => void;
    disabled: boolean;
}

const elementColors: Record<string, string> = {
    Fire: 'bg-red-500',
    Water: 'bg-blue-500',
    Grass: 'bg-green-500',
    Electric: 'bg-yellow-400',
    Rock: 'bg-stone-500',
    Wind: 'bg-sky-300',
    Ice: 'bg-cyan-200',
    Psychic: 'bg-purple-500',
    Ghost: 'bg-indigo-900',
    Dragon: 'bg-orange-600',
};

export const FighterCard: React.FC<FighterCardProps> = ({ fighter, isSelected, onSelect, disabled }) => {
    return (
        <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => !disabled && onSelect()}
            className={clsx(
                'relative p-2 rounded-xl border-2 cursor-pointer transition-all duration-200',
                isSelected ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-gray-200 bg-white hover:border-blue-300',
                disabled && !isSelected && 'opacity-50 cursor-not-allowed'
            )}
        >
            <div className={clsx('absolute top-1 right-1 w-3 h-3 rounded-full', elementColors[fighter.element])} />
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full mb-2 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    {fighter.avatar ? (
                        <img src={fighter.avatar} alt={fighter.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl">{fighter.name[0]}</span>
                    )}
                </div>
                <h3 className="text-xs font-bold text-gray-800">{fighter.name}</h3>
                <div className="text-[10px] text-gray-500">HP: {fighter.hp}</div>
                <div className="text-[10px] text-gray-500">Atk: {fighter.attack}</div>
            </div>
        </motion.div>
    );
};
