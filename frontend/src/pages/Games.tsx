import React from 'react'

const Games: React.FC = () => {
    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Available Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-2xl font-bold mb-4">Blackjack</h3>
                    <p className="mb-4">Classic card game. Beat the dealer to 21.</p>
                    <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Play Blackjack</button>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-2xl font-bold mb-4">Roulette</h3>
                    <p className="mb-4">Spin the wheel and test your luck.</p>
                    <button className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">Play Roulette</button>
                </div>
            </div>
        </div>
    )
}

export default Games
