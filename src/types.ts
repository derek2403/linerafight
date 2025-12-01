export type ElementType = 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Rock' | 'Wind' | 'Ice' | 'Psychic' | 'Ghost' | 'Dragon';

export interface Skill {
    id: string;
    name: string;
    damage: number;
    type: ElementType;
    cooldown: number;
    description: string;
    animation?: string; // For future use
}

export interface Fighter {
    id: string;
    name: string;
    element: ElementType;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
    level: number;
    skills: Skill[];
    avatar?: string; // URL or color code
}

export interface BattleLog {
    id: string;
    message: string;
    type: 'info' | 'damage' | 'heal' | 'turn';
}
