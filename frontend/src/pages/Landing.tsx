import React from 'react'
import { Link } from 'react-router-dom'

const Landing: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
            <h1 className="text-5xl font-bold mb-8">Welcome to Linera Fight</h1>
            <p className="text-xl mb-8">Experience the next generation of on-chain gaming.</p>
            <Link
                to="/game"
                className="px-8 py-3 bg-pink-600 hover:bg-pink-700 rounded-full font-bold text-lg transition-colors"
            >
                Play Now
            </Link>
        </div>
    )
}

export default Landing
