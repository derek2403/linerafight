import React, { useState, useEffect, useRef } from 'react';
import type { BattleLog as BattleLogType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, X } from 'lucide-react';

interface BattleLogProps {
    logs: BattleLogType[];
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    return (
        <>
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="absolute top-4 left-4 w-12 h-12 bg-gray-900/90 rounded-full border-2 border-gray-700 shadow-lg z-10 flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
            >
                <Scroll size={20} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900 w-full max-w-xs rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[60%]"
                        >
                            <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-800/50">
                                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                    <Scroll size={16} className="text-yellow-500" />
                                    Battle Logs
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                                {logs.length === 0 && (
                                    <div className="text-gray-500 text-center text-xs py-4">No logs yet...</div>
                                )}
                                {logs.map((log) => (
                                    <div key={log.id} className="text-xs text-gray-300 border-b border-gray-800/50 pb-1 last:border-0">
                                        <span className="text-gray-500 text-[10px] mr-2">
                                            {new Date(parseInt(log.id)).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                        {log.message}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
