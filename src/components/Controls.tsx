import React from 'react';
import type { Fighter } from '../types';
import { motion } from 'framer-motion';

interface ControlsProps {
    activeFighter: Fighter;
    onAttack: (skillId: string) => void;
    disabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ activeFighter, onAttack, disabled }) => {
    return (
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gray-800 rounded-t-3xl p-6 flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
            <h2 className="text-white font-bold text-xl mb-4 text-center">Controls</h2>
            <div className="grid grid-cols-2 gap-4 flex-1">
                {activeFighter.skills.map((skill) => (
                    <motion.button
                        key={skill.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => !disabled && onAttack(skill.id)}
                        disabled={disabled}
                        className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-3 flex flex-col items-center justify-center transition-colors border border-gray-600"
                    >
                        <span className="text-white font-bold text-sm mb-1">{skill.name}</span>
                        <span className="text-xs text-gray-400">{skill.type} • {skill.damage} DMG</span>
                    </motion.button>
                ))}
            </div>
            <div className="mt-4 text-center text-gray-500 text-xs">
                {disabled ? "Enemy's Turn..." : "Your Turn"}
            </div>
        </div>
    );
};
