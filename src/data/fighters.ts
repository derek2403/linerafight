import type { Fighter } from '../types';

import fireImg from '../assets/fighters/fire.png';
import waterImg from '../assets/fighters/water.png';
import grassImg from '../assets/fighters/grass.png';
import electricImg from '../assets/fighters/electric.png';
import rockImg from '../assets/fighters/rock.png';
import windImg from '../assets/fighters/wind.png';
import iceImg from '../assets/fighters/ice.png';

// Reusing images for missing ones due to rate limit
const psychicImg = electricImg;
const ghostImg = windImg;
const dragonImg = fireImg;

export const fighters: Fighter[] = [
    {
        id: '1',
        name: 'Ignis',
        element: 'Fire',
        hp: 120,
        maxHp: 120,
        attack: 60,
        defense: 40,
        speed: 50,
        level: 5,
        avatar: fireImg,
        skills: [
            { id: 's1_1', name: 'Ember', damage: 40, type: 'Fire', cooldown: 0, description: 'A small flame attack.' },
            { id: 's1_2', name: 'Fireball', damage: 70, type: 'Fire', cooldown: 2, description: 'A powerful ball of fire.' },
        ],
    },
    {
        id: '2',
        name: 'Aqua',
        element: 'Water',
        hp: 140,
        maxHp: 140,
        attack: 45,
        defense: 55,
        speed: 45,
        level: 5,
        avatar: waterImg,
        skills: [
            { id: 's2_1', name: 'Bubble', damage: 35, type: 'Water', cooldown: 0, description: 'A stream of bubbles.' },
            { id: 's2_2', name: 'Hydro Pump', damage: 80, type: 'Water', cooldown: 3, description: 'A high-pressure water blast.' },
        ],
    },
    {
        id: '3',
        name: 'Terra',
        element: 'Grass',
        hp: 150,
        maxHp: 150,
        attack: 50,
        defense: 60,
        speed: 30,
        level: 5,
        avatar: grassImg,
        skills: [
            { id: 's3_1', name: 'Vine Whip', damage: 40, type: 'Grass', cooldown: 0, description: 'Strikes with a vine.' },
            { id: 's3_2', name: 'Solar Beam', damage: 90, type: 'Grass', cooldown: 4, description: 'Absorbs light to attack.' },
        ],
    },
    {
        id: '4',
        name: 'Volt',
        element: 'Electric',
        hp: 100,
        maxHp: 100,
        attack: 70,
        defense: 30,
        speed: 80,
        level: 5,
        avatar: electricImg,
        skills: [
            { id: 's4_1', name: 'Shock', damage: 45, type: 'Electric', cooldown: 0, description: 'A jolt of electricity.' },
            { id: 's4_2', name: 'Thunderbolt', damage: 75, type: 'Electric', cooldown: 2, description: 'A strong electric blast.' },
        ],
    },
    {
        id: '5',
        name: 'Rocky',
        element: 'Rock',
        hp: 180,
        maxHp: 180,
        attack: 55,
        defense: 80,
        speed: 20,
        level: 5,
        avatar: rockImg,
        skills: [
            { id: 's5_1', name: 'Rock Throw', damage: 30, type: 'Rock', cooldown: 0, description: 'Throws a small rock.' },
            { id: 's5_2', name: 'Earthquake', damage: 60, type: 'Rock', cooldown: 3, description: 'Shakes the ground.' },
        ],
    },
    {
        id: '6',
        name: 'Zephyr',
        element: 'Wind',
        hp: 110,
        maxHp: 110,
        attack: 50,
        defense: 35,
        speed: 90,
        level: 5,
        avatar: windImg,
        skills: [
            { id: 's6_1', name: 'Gust', damage: 35, type: 'Wind', cooldown: 0, description: 'A sudden gust of wind.' },
            { id: 's6_2', name: 'Tornado', damage: 65, type: 'Wind', cooldown: 2, description: 'Creates a small tornado.' },
        ],
    },
    {
        id: '7',
        name: 'Frost',
        element: 'Ice',
        hp: 130,
        maxHp: 130,
        attack: 55,
        defense: 50,
        speed: 40,
        level: 5,
        avatar: iceImg,
        skills: [
            { id: 's7_1', name: 'Ice Shard', damage: 40, type: 'Ice', cooldown: 0, description: 'Hurls shards of ice.' },
            { id: 's7_2', name: 'Blizzard', damage: 70, type: 'Ice', cooldown: 3, description: 'Summons a snowstorm.' },
        ],
    },
    {
        id: '8',
        name: 'Psycho',
        element: 'Psychic',
        hp: 100,
        maxHp: 100,
        attack: 80,
        defense: 30,
        speed: 60,
        level: 5,
        avatar: psychicImg,
        skills: [
            { id: 's8_1', name: 'Confusion', damage: 50, type: 'Psychic', cooldown: 0, description: 'Confuses the enemy.' },
            { id: 's8_2', name: 'Psychic Blast', damage: 85, type: 'Psychic', cooldown: 3, description: 'A powerful mental wave.' },
        ],
    },
    {
        id: '9',
        name: 'Shadow',
        element: 'Ghost',
        hp: 90,
        maxHp: 90,
        attack: 75,
        defense: 20,
        speed: 70,
        level: 5,
        avatar: ghostImg,
        skills: [
            { id: 's9_1', name: 'Lick', damage: 30, type: 'Ghost', cooldown: 0, description: 'Licks the enemy.' },
            { id: 's9_2', name: 'Shadow Ball', damage: 80, type: 'Ghost', cooldown: 2, description: 'Hurls a shadowy blob.' },
        ],
    },
    {
        id: '10',
        name: 'Draco',
        element: 'Dragon',
        hp: 160,
        maxHp: 160,
        attack: 70,
        defense: 60,
        speed: 55,
        level: 5,
        avatar: dragonImg,
        skills: [
            { id: 's10_1', name: 'Dragon Breath', damage: 50, type: 'Dragon', cooldown: 0, description: 'Breathes fire.' },
            { id: 's10_2', name: 'Outrage', damage: 90, type: 'Dragon', cooldown: 4, description: 'A rampage of destruction.' },
        ],
    },
];
