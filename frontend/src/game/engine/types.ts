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

export interface SpawnEvent {
    type: EnemyType;
    delay: number; // Time until spawn in seconds relative to wave start, or absolute? 
    // Let's make it simple: Frame countdown or similar.
    // Actually simpler: Queue of types, with a spawn timer.
}

export interface GameState {
    gold: number;
    lives: number;
    wave: number;
    isPlaying: boolean;
    isGameOver: boolean;
    enemies: Enemy[];
    towers: Tower[];
    projectiles: Projectile[];

    // Wave Logic
    waveTimer: number; // Seconds until next wave
    spawnQueue: EnemyType[]; // Enemies waiting to enter this wave
    spawnTimer: number; // Time until next enemy in queue spawns
}
