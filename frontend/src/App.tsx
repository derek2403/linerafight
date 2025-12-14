import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing, Games } from './pages';
import Game from './game/Game';
import Layout from './components/Layout';


import { GameProvider } from './context/GameContext';

function App() {
    return (
        <GameProvider>
            <Router>
                <Routes>
                    {/* Main Layout Pages */}
                    <Route element={<Layout />}>
                        <Route path="/" element={<Landing />} />
                        <Route path="/games" element={<Games />} />
                    </Route>

                    {/* Full Screen Game Route */}
                    <Route path="/game" element={<Game />} />
                </Routes>
            </Router>
        </GameProvider>
    );
}

export default App;
