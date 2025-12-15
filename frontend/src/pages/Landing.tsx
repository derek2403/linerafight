import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const handlePlayClick = () => {
        navigate('/game');
    };

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

            <div className="z-10 text-center max-w-2xl px-4 mb-40">
                <h1 className="text-8xl md:text-9xl font-['ThaleahFat'] tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 [-webkit-text-stroke:4px_black] drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
                    LINERA FIGHT
                </h1>
                <p className="text-xl md:text-3xl text-white mb-24 font-['ThaleahFat'] tracking-wide drop-shadow-md">
                    Defend the blockchain. Earn Stars. Survive the Waves.
                </p>

                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={handlePlayClick}
                        className="px-12 py-2 bg-yellow-400 text-white font-['ThaleahFat'] text-4xl rounded-lg hover:bg-yellow-300 hover:scale-105 transition-all border-4 border-black active:translate-y-1"
                    >
                        PLAY NOW
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center text-gray-800 text-xs font-mono font-bold">
                POWERED BY LINERA & DYNAMIC
            </div>
        </div>
    );
};

export default Landing;
