import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface HealthBarProps {
    current: number;
    max: number;
    label: string;
    level: number;
    isEnemy?: boolean;
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max, label, level, isEnemy }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));

    return (
        <div className={clsx("w-full max-w-[160px] bg-gray-800/80 p-2 rounded-lg backdrop-blur-sm border border-gray-700", isEnemy ? "ml-auto" : "mr-auto")}>
            <div className="flex justify-between text-white text-xs font-bold mb-1">
                <span>{label}</span>
                <span className="text-yellow-400">Lv.{level}</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                    className={clsx(
                        "h-full rounded-full transition-colors duration-300",
                        percentage > 50 ? "bg-green-500" : percentage > 20 ? "bg-yellow-500" : "bg-red-500"
                    )}
                />
            </div>
            <div className="text-[10px] text-right text-gray-400 mt-0.5">
                {current}/{max}
            </div>
        </div>
    );
};
