import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Landing from './pages/Landing';
import Game from './game/Game';
import { GameProvider } from './context/GameContext';

const Layout = () => {
    return (
        <div className="min-h-screen text-white font-sans">
            <Outlet />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <GameProvider>
            <Router>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Landing />} />
                        <Route path="/game" element={<Game />} />
                    </Route>
                </Routes>
            </Router>
        </GameProvider>
    );
};

export default App;
