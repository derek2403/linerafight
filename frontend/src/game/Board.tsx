import React from 'react';
import { GameState, Position } from './engine/types';
import { CELL_SIZE, GRID_SIZE, LEVEL_1_PATH } from './engine/constants';

// Map & Entities
import tileGrass from './assets/tile-grass.png';
import tilePath from './assets/tile-path.png';
import itemStar from './assets/item-star.png';

// Towers
import towerBasic from './assets/tower-basic.png';
import towerSplash from './assets/tower-splash.png';
import towerSlow from './assets/tower-slow.png';

// Enemies
import enemyScout from './assets/enemy-scout.png';
import enemySoldier from './assets/enemy-soldier.png';
import enemyTank from './assets/enemy-tank.png';

interface BoardProps {
    gameState: GameState;
    onTileClick: (pos: Position) => void;
    onDropClick: (id: string) => void;
}

const Board: React.FC<BoardProps> = ({ gameState, onTileClick, onDropClick }) => {
    const isPath = (x: number, y: number) => {
        return LEVEL_1_PATH.some(p => p[0] === y && p[1] === x);
    };

    const getTowerImg = (type: string) => {
        switch (type) {
            case 'basic': return towerBasic;
            case 'splash': return towerSplash;
            case 'slow': return towerSlow;
            default: return towerBasic;
        }
    };

    const getEnemyImg = (type: string) => {
        switch (type) {
            case 'scout': return enemyScout;
            case 'soldier': return enemySoldier;
            case 'tank': return enemyTank;
            default: return enemyScout;
        }
    };

    return (
        <div
            className="relative shadow-2xl select-none overflow-hidden"
            style={{
                width: GRID_SIZE * CELL_SIZE,
                height: GRID_SIZE * CELL_SIZE,
                imageRendering: 'pixelated',
            }}
        >
            {/* Grid Layer */}
            {Array.from({ length: GRID_SIZE }).map((_, y) => (
                <div key={y} className="flex h-[40px]">
                    {Array.from({ length: GRID_SIZE }).map((_, x) => (
                        <div
                            key={`${x}-${y}`}
                            onClick={() => onTileClick({ x, y })}
                            className={`cursor-pointer ${isPath(x, y) ? '' : 'hover:brightness-110 active:brightness-90'}`}
                            style={{
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                                backgroundImage: `url(${isPath(x, y) ? tilePath : tileGrass})`,
                                backgroundSize: '100% 100%',
                                transition: 'filter 0.1s',
                            }}
                        />
                    ))}
                </div>
            ))}

            {/* Drops Layer (Below enemies/towers? Or above? Above is easier to click) */}
            {gameState.drops.map(drop => (
                <div
                    key={drop.id}
                    onClick={(e) => { e.stopPropagation(); onDropClick(drop.id); }}
                    className="absolute z-40 cursor-pointer hover:scale-125 transition-transform animate-bounce"
                    style={{
                        left: drop.x * CELL_SIZE + CELL_SIZE / 4,
                        top: drop.y * CELL_SIZE + CELL_SIZE / 4,
                        width: CELL_SIZE / 2,
                        height: CELL_SIZE / 2,
                        backgroundImage: `url(${itemStar})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            ))}

            {/* Enemies Layer */}
            {gameState.enemies.map(enemy => (
                <div
                    key={enemy.id}
                    className="absolute pointer-events-none"
                    style={{
                        left: enemy.x * CELL_SIZE,
                        top: enemy.y * CELL_SIZE,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundImage: `url(${getEnemyImg(enemy.type)})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        zIndex: 10,
                    }}
                >
                    {/* Health Bar */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-black/50 rounded overflow-hidden">
                        <div
                            className={`h-full ${enemy.frozen > 0 ? 'bg-cyan-400' : 'bg-green-500'}`}
                            style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                        />
                    </div>
                </div>
            ))}

            {/* Towers Layer */}
            {gameState.towers.map(tower => (
                <div
                    key={tower.id}
                    className="absolute"
                    style={{
                        left: tower.x * CELL_SIZE,
                        top: tower.y * CELL_SIZE,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundImage: `url(${getTowerImg(tower.type)})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        transform: `rotate(${tower.angle}rad)`,
                        zIndex: 20
                    }}
                />
            ))}

            {/* Projectiles Layer */}
            {gameState.projectiles.map(proj => (
                <div
                    key={proj.id}
                    className={`absolute w-3 h-3 rounded-full shadow-sm z-30 ${proj.type === 'slow' ? 'bg-cyan-300 shadow-cyan-300' :
                            proj.type === 'splash' ? 'bg-black border border-gray-600' :
                                'bg-yellow-400'
                        }`}
                    style={{
                        left: proj.x * CELL_SIZE + CELL_SIZE / 2 - 6,
                        top: proj.y * CELL_SIZE + CELL_SIZE / 2 - 6,
                    }}
                />
            ))}
        </div>
    );
};

export default Board;
