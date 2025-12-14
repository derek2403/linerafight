export type TowerType = 'basic' | 'splash' | 'slow';
export type EnemyType = 'scout' | 'soldier' | 'tank';

export interface Position {
    x: number;
    y: number;
}

export interface Entity extends Position {
    id: string;
}

export interface Enemy extends Entity {
    type: EnemyType;
    hp: number;
    maxHp: number;
    speed: number;
    pathIndex: number;
    frozen: number;
}

export interface Tower extends Entity {
    type: TowerType;
    lastFired: number;
    angle: number;
}

export interface Projectile extends Entity {
    targetId: string;
    damage: number;
    speed: number;
    active: boolean;
    type: TowerType;
}

export interface Drop extends Entity {
    value: number;
    createdAt: number; // For despawning if needed, or animation
}

export interface GameState {
    gold: number;
    lives: number;
    stars: number; // New currency
    wave: number;
    isPlaying: boolean;
    isGameOver: boolean;
    enemies: Enemy[];
    towers: Tower[];
    projectiles: Projectile[];
    drops: Drop[]; // Active drops on board

    // Wave Logic
    waveTimer: number;
    spawnQueue: EnemyType[];
    spawnTimer: number;
}
