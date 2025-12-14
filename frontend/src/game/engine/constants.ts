export const GRID_SIZE = 20; // 20x20 grid
export const CELL_SIZE = 40; // Pixels
export const FPS = 60;

export const INITIAL_GOLD = 100;
export const INITIAL_LIVES = 100;

export const TOWERS = {
    BASIC: {
        id: 'basic',
        name: 'Turret',
        cost: 50,
        range: 3,
        damage: 10,
        cooldown: 500, // ms
        color: '#3b82f6', // Fallback color
        type: 'single' as const,
    },
    SPLASH: {
        id: 'splash',
        name: 'Cannon',
        cost: 120,
        range: 4,
        damage: 20,
        cooldown: 1500,
        radius: 2, // AoE radius
        color: '#10b981',
        type: 'splash' as const,
    },
    SLOW: {
        id: 'slow',
        name: 'Ice',
        cost: 150,
        range: 3,
        damage: 2,
        cooldown: 800,
        slowFactor: 0.5,
        color: '#0ea5e9',
        type: 'slow' as const,
    },
};

export const ENEMIES = {
    SCOUT: {
        id: 'scout',
        name: 'Scout',
        hp: 20,
        speed: 3, // tiles per second
        reward: 10,
        damage: 5,
        color: '#eab308',
    },
    SOLDIER: {
        id: 'soldier',
        name: 'Soldier',
        hp: 50,
        speed: 1.5,
        reward: 20,
        damage: 10,
        color: '#ef4444',
    },
    TANK: {
        id: 'tank',
        name: 'Tank',
        hp: 150,
        speed: 0.8,
        reward: 50,
        damage: 20,
        color: '#3b82f6',
    },
};

// Simple winding path for 20x20 grid
// Represented as array of [row, col]
export const LEVEL_1_PATH: [number, number][] = [
    ...Array.from({ length: 5 }, (_, i) => [2, i] as [number, number]), // Start > Right
    ...Array.from({ length: 14 }, (_, i) => [i + 2, 4] as [number, number]), // Down
    ...Array.from({ length: 12 }, (_, i) => [15, i + 4] as [number, number]), // Right
    ...Array.from({ length: 12 }, (_, i) => [15 - i, 15] as [number, number]), // Up
    ...Array.from({ length: 4 }, (_, i) => [3, 15 + i] as [number, number]), // Right to End
];
