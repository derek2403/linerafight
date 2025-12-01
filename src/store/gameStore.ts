import { create } from 'zustand';
import type { Fighter, BattleLog } from '../types';
import { fighters } from '../data/fighters';

interface GameState {
    allFighters: Fighter[];
    playerTeam: Fighter[];
    enemyTeam: Fighter[];
    currentTurn: 'Player' | 'Enemy';
    logs: BattleLog[];
    gameStatus: 'Selection' | 'Battle' | 'Victory' | 'Defeat';

    // Actions
    selectFighter: (fighterId: string) => void;
    removeFromTeam: (fighterId: string) => void;
    startGame: () => void;
    playerAction: (fighterId: string, skillId: string) => void;
    resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    allFighters: fighters,
    playerTeam: [],
    enemyTeam: [],
    currentTurn: 'Player',
    logs: [],
    gameStatus: 'Selection',

    selectFighter: (fighterId) => {
        const { playerTeam, allFighters } = get();
        if (playerTeam.length >= 3) return;
        const fighter = allFighters.find((f) => f.id === fighterId);
        if (fighter && !playerTeam.find((f) => f.id === fighterId)) {
            set({ playerTeam: [...playerTeam, { ...fighter }] });
        }
    },

    removeFromTeam: (fighterId) => {
        const { playerTeam } = get();
        set({ playerTeam: playerTeam.filter((f) => f.id !== fighterId) });
    },

    startGame: () => {
        const { playerTeam, allFighters } = get();
        if (playerTeam.length !== 3) return;

        // Randomly select 3 enemies
        const enemies = [...allFighters]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(f => ({ ...f, id: `enemy_${f.id}` })); // Ensure unique IDs for enemies

        set({
            enemyTeam: enemies,
            gameStatus: 'Battle',
            currentTurn: 'Player',
            logs: [{ id: Date.now().toString(), message: 'Battle Started!', type: 'info' }],
        });
    },

    playerAction: (fighterId, skillId) => {
        const { playerTeam, enemyTeam, currentTurn } = get();
        if (currentTurn !== 'Player') return;

        const attacker = playerTeam.find(f => f.id === fighterId);
        if (!attacker) return;

        const skill = attacker.skills.find(s => s.id === skillId);
        if (!skill) return;

        // Target random living enemy
        const livingEnemies = enemyTeam.filter(e => e.hp > 0);
        if (livingEnemies.length === 0) return;
        const targetIndex = Math.floor(Math.random() * livingEnemies.length);
        const target = livingEnemies[targetIndex];

        // Calculate damage
        // Simple formula: (Attack * SkillPower / Defense) * Random(0.85, 1.15)
        const randomFactor = Math.random() * 0.3 + 0.85;
        const damage = Math.floor((attacker.attack * skill.damage / target.defense) * randomFactor);

        // Apply damage
        const newEnemyTeam = enemyTeam.map(e => {
            if (e.id === target.id) {
                return { ...e, hp: Math.max(0, e.hp - damage) };
            }
            return e;
        });

        const log: BattleLog = {
            id: Date.now().toString(),
            message: `${attacker.name} used ${skill.name} on ${target.name} for ${damage} damage!`,
            type: 'damage'
        };

        set({
            enemyTeam: newEnemyTeam,
            logs: [...get().logs, log],
            currentTurn: 'Enemy'
        });

        // Check for victory
        if (newEnemyTeam.every(e => e.hp === 0)) {
            set({ gameStatus: 'Victory', logs: [...get().logs, { id: Date.now().toString(), message: 'You Won!', type: 'info' }] });
            return;
        }

        // Trigger Enemy Turn after delay
        setTimeout(() => {
            const { playerTeam, enemyTeam, gameStatus } = get();
            if (gameStatus !== 'Battle') return;

            // Enemy logic: Random living enemy attacks random living player
            const livingEnemies = enemyTeam.filter(e => e.hp > 0);
            const livingPlayers = playerTeam.filter(p => p.hp > 0);

            if (livingEnemies.length === 0 || livingPlayers.length === 0) return;

            const enemyAttacker = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
            const playerTarget = livingPlayers[Math.floor(Math.random() * livingPlayers.length)];
            const enemySkill = enemyAttacker.skills[Math.floor(Math.random() * enemyAttacker.skills.length)];

            const randomFactor = Math.random() * 0.3 + 0.85;
            const damage = Math.floor((enemyAttacker.attack * enemySkill.damage / playerTarget.defense) * randomFactor);

            const newPlayerTeam = playerTeam.map(p => {
                if (p.id === playerTarget.id) {
                    return { ...p, hp: Math.max(0, p.hp - damage) };
                }
                return p;
            });

            const enemyLog: BattleLog = {
                id: Date.now().toString(),
                message: `Enemy ${enemyAttacker.name} used ${enemySkill.name} on ${playerTarget.name} for ${damage} damage!`,
                type: 'damage'
            };

            set({
                playerTeam: newPlayerTeam,
                logs: [...get().logs, enemyLog],
                currentTurn: 'Player'
            });

            // Check for defeat
            if (newPlayerTeam.every(p => p.hp === 0)) {
                set({ gameStatus: 'Defeat', logs: [...get().logs, { id: Date.now().toString(), message: 'You Lost!', type: 'info' }] });
            }
        }, 1000);
    },

    resetGame: () => {
        set({
            playerTeam: [],
            enemyTeam: [],
            currentTurn: 'Player',
            logs: [],
            gameStatus: 'Selection'
        });
    }
}));
