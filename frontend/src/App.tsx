import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Landing, Games } from './pages';
import Layout from './components/Layout';
import "./App.css";

import { GameProvider } from './context/GameContext';

function App() {
    return (
        <GameProvider>
            <Router>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Landing />} />
                        <Route path="/games" element={<Games />} />
                    </Route>
                </Routes>
            </Router>
        </GameProvider>
    );
}

export default App;
