import { useGameStore } from './store/gameStore';
import { Layout } from './components/Layout';
import { SelectionScreen } from './components/SelectionScreen';
import { BattleScreen } from './components/BattleScreen';

function App() {
  const { gameStatus } = useGameStore();

  return (
    <Layout>
      {gameStatus === 'Selection' && <SelectionScreen />}
      {gameStatus === 'Battle' && <BattleScreen />}
      {gameStatus === 'Victory' && <BattleScreen />}
      {gameStatus === 'Defeat' && <BattleScreen />}
    </Layout>
  );
}

export default App;
