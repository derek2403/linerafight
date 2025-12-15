import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicWidget, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import towersImg from '../game/assets/tower-basic.png';
import enemiesImg from '../game/assets/enemy-soldier.png';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const isLoggedIn = useIsLoggedIn();

    return (
        <div className="relative h-screen overflow-hidden flex flex-col items-center justify-center">
            {/* Background with pixel vibe */}
            {/* Background Video */}
            {/* Background Image */}
            <img
                src="/background.png"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            <div className="z-10 text-center max-w-2xl px-4">
                <h1 className="text-6xl md:text-8xl font-['ThaleahFat'] tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 [-webkit-text-stroke:4px_black] drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
                    LINERA DEFENSE
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 mb-12 font-mono">
                    Defend the blockchain. Earn Stars. Survive the Waves.
                </p>

                <div className="flex justify-center gap-8 mb-12 drop-shadow-2xl">
                    <img src={towersImg} className="w-24 h-24 object-contain animate-bounce" style={{ imageRendering: 'pixelated', animationDelay: '0s' }} />
                    <img src={enemiesImg} className="w-24 h-24 object-contain animate-bounce" style={{ imageRendering: 'pixelated', animationDelay: '0.2s' }} />
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <DynamicWidget />
                    </div>

                    {isLoggedIn && (
                        <button
                            onClick={() => navigate('/game')}
                            className="px-8 py-4 bg-green-600 text-white font-bold text-xl rounded hover:bg-green-500 hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.5)] uppercase tracking-widest border-2 border-green-400"
                        >
                            Enter Game
                        </button>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center text-gray-600 text-xs font-mono">
                POWERED BY LINERA & DYNAMIC
            </div>
        </div>
    );
};

export default Landing;
