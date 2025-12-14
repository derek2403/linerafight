import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Enemy, Tower, Projectile, EnemyType, Drop } from './types';
import { ENEMIES, TOWERS, LEVEL_1_PATH, INITIAL_GOLD, INITIAL_LIVES } from './constants';

const WAVE_INTERVAL = 15; // Seconds between waves
const SPAWN_RATE = 0.8; // Seconds between enemies in a wave
const DROP_CHANCE = 0.3; // 30% chance

export const useGameLoop = () => {
    const [gameState, setGameState] = useState<GameState>({
        gold: INITIAL_GOLD,
        lives: INITIAL_LIVES,
        stars: 0,
        wave: 1,
        isPlaying: false,
        isGameOver: false,
        enemies: [],
        towers: [],
        projectiles: [],
        drops: [],
        waveTimer: 0,
        spawnQueue: [],
        spawnTimer: 0,
    });

    const lastTimeRef = useRef<number>(0);
    const requestRef = useRef<number>();

    const generateWaveFn = (wave: number) => {
        // Base: A=2, B=2, C=1. Formula: Ceil(Base * 1.2^(wave-1))
        const multiplier = Math.pow(1.2, wave - 1);

        const countScouts = Math.ceil(2 * multiplier);
        const countSoldiers = Math.ceil(2 * multiplier);
        const countTanks = Math.ceil(1 * multiplier);

        const queue: EnemyType[] = [];
        for (let i = 0; i < countScouts; i++) queue.push('scout');
        for (let i = 0; i < countSoldiers; i++) queue.push('soldier');
        for (let i = 0; i < countTanks; i++) queue.push('tank');

        return queue.sort(() => Math.random() - 0.5);
    };

    const startGame = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            isPlaying: true,
            wave: 0,
            waveTimer: 0,
            spawnQueue: [],
            stars: 0,
            drops: []
        }));
    }, []);

    const skipWave = useCallback(() => {
        setGameState(prev => ({ ...prev, waveTimer: 0 }));
    }, []);

    const collectDrop = useCallback((dropId: string) => {
        setGameState(prev => {
            const drop = prev.drops.find(d => d.id === dropId);
            if (!drop) return prev;
            return {
                ...prev,
                stars: prev.stars + drop.value,
                drops: prev.drops.filter(d => d.id !== dropId)
            };
        });
    }, []);

    const updateGame = useCallback((time: number) => {
        const deltaTime = Math.min((time - lastTimeRef.current) / 1000, 0.1);
        lastTimeRef.current = time;

        setGameState(prev => {
            if (!prev.isPlaying || prev.isGameOver) return prev;

            let nextWaveTimer = prev.waveTimer - deltaTime;
            let nextSpawnTimer = prev.spawnTimer - deltaTime;
            let nextSpawnQueue = [...prev.spawnQueue];
            let nextEnemies = [...prev.enemies];
            let nextDrops = [...prev.drops];
            let nextWave = prev.wave;

            // 1. Spawning
            if (nextSpawnQueue.length > 0) {
                if (nextSpawnTimer <= 0) {
                    const enemyType = nextSpawnQueue.shift();
                    if (enemyType) {
                        const template = ENEMIES[enemyType.toUpperCase() as keyof typeof ENEMIES];
                        nextEnemies.push({
                            id: crypto.randomUUID(),
                            type: enemyType,
                            hp: template.hp,
                            maxHp: template.hp,
                            speed: template.speed,
                            x: LEVEL_1_PATH[0][1],
                            y: LEVEL_1_PATH[0][0],
                            pathIndex: 0,
                            frozen: 0,
                        });
                        nextSpawnTimer = SPAWN_RATE;
                    }
                }
            }

            // 2. Next Wave Trigger
            if (nextWaveTimer <= 0) {
                nextWave = prev.wave + 1;
                const newTroops = generateWaveFn(nextWave);
                nextSpawnQueue = [...nextSpawnQueue, ...newTroops];
                nextWaveTimer = WAVE_INTERVAL;
            }

            // 3. Movement & Collision
            const movedEnemies = nextEnemies.map(enemy => {
                const targetNode = LEVEL_1_PATH[enemy.pathIndex + 1];
                if (!targetNode) return { ...enemy, reached: true };

                const targetX = targetNode[1];
                const targetY = targetNode[0];
                const dx = targetX - enemy.x;
                const dy = targetY - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 0.1) {
                    return { ...enemy, pathIndex: enemy.pathIndex + 1, x: targetX, y: targetY };
                }

                const moveDist = enemy.speed * deltaTime * (enemy.frozen > 0 ? 0.5 : 1);
                const ratio = Math.min(1, moveDist / dist);

                return {
                    ...enemy,
                    x: enemy.x + dx * ratio,
                    y: enemy.y + dy * ratio,
                    frozen: Math.max(0, enemy.frozen - deltaTime),
                };
            });

            const leakedEnemies = movedEnemies.filter((e: any) => e.reached);
            const activeEnemies = movedEnemies.filter((e: any) => !e.reached && e.hp > 0);

            let livesLost = 0;
            leakedEnemies.forEach((e: any) => {
                const template = Object.values(ENEMIES).find(t => t.id === e.type);
                livesLost += template?.damage || 0;
            });
            const nextLives = Math.max(0, prev.lives - livesLost);

            // Towers Fire
            const nextProjectiles = [...prev.projectiles];
            const nextTowers = prev.towers.map(tower => {
                if (time - tower.lastFired < 0) return tower;
                const template = Object.values(TOWERS).find(t => t.id === tower.type);
                if (!template || time - tower.lastFired < template.cooldown) return tower;

                const target = activeEnemies.find(e => {
                    const dx = e.x - tower.x;
                    const dy = e.y - tower.y;
                    return Math.sqrt(dx * dx + dy * dy) <= template.range;
                });

                if (target) {
                    nextProjectiles.push({
                        id: crypto.randomUUID(),
                        x: tower.x,
                        y: tower.y,
                        targetId: target.id,
                        damage: template.damage,
                        speed: 10,
                        active: true,
                        type: tower.type,
                    });
                    return { ...tower, lastFired: time, angle: Math.atan2(target.y - tower.y, target.x - tower.x) };
                }
                return tower;
            });

            // Projectiles Process
            let goldEarned = 0;
            const survivingEnemies: Enemy[] = [];
            const enemyMap = new Map(activeEnemies.map(e => [e.id, e]));

            nextProjectiles.forEach(proj => {
                if (!proj.active) return;
                const target = enemyMap.get(proj.targetId);
                if (!target || target.hp <= 0) { proj.active = false; return; }

                const dx = target.x - proj.x;
                const dy = target.y - proj.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 0.5) {
                    proj.active = false;
                    target.hp -= proj.damage;
                    if (proj.type === 'slow') target.frozen = 2;
                    if (target.hp <= 0) {
                        const template = Object.values(ENEMIES).find(t => t.id === target.type);
                        goldEarned += template?.reward || 0;
                        // Drop Logic
                        if (Math.random() < DROP_CHANCE) {
                            nextDrops.push({
                                id: crypto.randomUUID(),
                                x: target.x,
                                y: target.y,
                                value: 1,
                                createdAt: time
                            });
                        }
                    }
                } else {
                    const move = proj.speed * deltaTime;
                    proj.x += (dx / dist) * move;
                    proj.y += (dy / dist) * move;
                }
            });
            enemyMap.forEach(e => { if (e.hp > 0) survivingEnemies.push(e); });

            // Despawn Drops? (Optional: let them persist for now or just max count)
            // For now infinite duration.

            return {
                ...prev,
                wave: nextWave,
                waveTimer: nextWaveTimer,
                spawnQueue: nextSpawnQueue,
                spawnTimer: nextSpawnTimer,
                lives: nextLives,
                gold: prev.gold + goldEarned,
                isGameOver: nextLives === 0,
                enemies: survivingEnemies,
                towers: nextTowers,
                projectiles: nextProjectiles.filter(p => p.active),
                drops: nextDrops
            };
        });

        requestRef.current = requestAnimationFrame(updateGame);
    }, []);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateGame);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [updateGame]);

    return {
        gameState,
        setGameState,
        startGame,
        skipWave,
        collectDrop
    };
};
