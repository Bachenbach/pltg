// levels.js
const BOSS_TYPES = {
    FIRE: {
        types: ['Phoenix', 'Dragon', 'Ifrit', 'Volcano', 'Flame Knight'],
        abilities: {
            Phoenix: ['Rebirth Flames', 'Fire Storm', 'Wing Blast'],
            Dragon: ['Fire Breath', 'Meteor Shower', 'Tail Swipe'],
            Ifrit: ['Hellfire', 'Magma Wave', 'Inferno Punch'],
            Volcano: ['Lava Eruption', 'Ash Cloud', 'Rock Throw'],
            FlameKnight: ['Flame Sword', 'Fire Shield', 'Burning Dash']
        }
    },
    ICE: {
        types: ['Frost Giant', 'Ice Queen', 'Glacier', 'Snow Beast', 'Frozen Knight'],
        abilities: {
            FrostGiant: ['Ice Stomp', 'Blizzard', 'Frozen Spikes'],
            IceQueen: ['Ice Storm', 'Freeze Ray', 'Crystal Shards'],
            Glacier: ['Avalanche', 'Ice Wall', 'Frost Nova'],
            SnowBeast: ['Ice Breath', 'Snow Storm', 'Frozen Claws'],
            FrozenKnight: ['Ice Blade', 'Frost Shield', 'Ice Dash']
        }
    },
    LIGHTNING: {
        types: ['Thunder God', 'Storm Drake', 'Lightning Lord', 'Tempest', 'Thunder Knight'],
        abilities: {
            ThunderGod: ['Lightning Strike', 'Thunder Clap', 'Electric Field'],
            StormDrake: ['Storm Breath', 'Lightning Chain', 'Thunder Wing'],
            LightningLord: ['Thunder Bolt', 'Electric Storm', 'Shock Wave'],
            Tempest: ['Tornado', 'Lightning Rain', 'Wind Slash'],
            ThunderKnight: ['Lightning Sword', 'Thunder Shield', 'Electric Dash']
        }
    },
    NATURE: {
        types: ['Ancient Tree', 'Forest Guardian', 'Vine Lord', 'Earth Golem', 'Nature Knight'],
        abilities: {
            AncientTree: ['Root Strike', 'Leaf Storm', 'Nature\'s Wrath'],
            ForestGuardian: ['Thorn Spray', 'Healing Aura', 'Forest Call'],
            VineLord: ['Vine Whip', 'Poison Cloud', 'Root Trap'],
            EarthGolem: ['Rock Throw', 'Ground Pound', 'Earth Shield'],
            NatureKnight: ['Vine Sword', 'Nature Shield', 'Forest Dash']
        }
    },
    SHADOW: {
        types: ['Dark Lord', 'Shadow Beast', 'Void Walker', 'Nightmare', 'Shadow Knight'],
        abilities: {
            DarkLord: ['Shadow Ball', 'Dark Void', 'Night Terror'],
            ShadowBeast: ['Shadow Claw', 'Dark Mist', 'Void Strike'],
            VoidWalker: ['Teleport Strike', 'Shadow Clone', 'Dark Portal'],
            Nightmare: ['Fear Aura', 'Dream Eater', 'Shadow Form'],
            ShadowKnight: ['Dark Sword', 'Shadow Shield', 'Void Dash']
        }
    },
    METAL: {
        types: ['Steel Golem', 'Mech Lord', 'Iron Giant', 'Machine King', 'Metal Knight'],
        abilities: {
            SteelGolem: ['Metal Crush', 'Gear Storm', 'Steel Defense'],
            MechLord: ['Missile Barrage', 'Laser Beam', 'Rocket Punch'],
            IronGiant: ['Steel Slam', 'Metal Storm', 'Iron Shield'],
            MachineKing: ['Circuit Overload', 'System Crash', 'Program Delete'],
            MetalKnight: ['Steel Sword', 'Metal Shield', 'Mech Dash']
        }
    }
};

// Boss Generator
class BossGenerator {
    static generateBoss(level) {
        const bossIndex = Math.floor(level / 3) - 1;
        const elementType = Object.keys(BOSS_TYPES)[bossIndex % 6];
        const bossType = BOSS_TYPES[elementType].types[Math.floor(bossIndex / 6) % 5];
        
        return {
            type: bossType,
            element: elementType,
            abilities: BOSS_TYPES[elementType].abilities[bossType],
            stats: {
                health: 100 + (bossIndex * 50),
                damage: 10 + (bossIndex * 2),
                speed: 2 + (bossIndex * 0.1)
            }
        };
    }
}

// Level Generator
const LEVELS = Array(90).fill(null).map((_, index) => {
    const levelNumber = index + 1;
    const isBossLevel = levelNumber % 3 === 0;
    
    return {
        level: levelNumber,
        difficulty: Math.ceil(levelNumber / 10),
        platforms: generatePlatforms(levelNumber),
        enemies: generateEnemies(levelNumber),
        coins: generateCoins(levelNumber),
        powerups: generatePowerups(levelNumber),
        boss: isBossLevel ? BossGenerator.generateBoss(levelNumber) : null,
        background: `background_${Math.ceil(levelNumber / 10)}`,
        music: `music_${isBossLevel ? 'boss' : 'level'}_${Math.ceil(levelNumber / 10)}`
    };
});

// Platform Generator
function generatePlatforms(level) {
    const platforms = [];
    const difficulty = Math.ceil(level / 10);
    
    // Add more complex platform patterns as difficulty increases
    const platformCount = 10 + difficulty * 2;
    
    for (let i = 0; i < platformCount; i++) {
        platforms.push({
            x: Math.random() * 700,
            y: 100 + (Math.random() * 400),
            width: 50 + Math.random() * 100,
            height: 20,
            type: Math.random() > 0.7 ? 'moving' : 'static',
            properties: {
                speed: Math.random() * 2,
                distance: Math.random() * 200
            }
        });
    }
    
    return platforms;
}

// Enemy Generator
function generateEnemies(level) {
    const enemies = [];
    const difficulty = Math.ceil(level / 10);
    
    const enemyCount = 5 + difficulty * 2;
    
    for (let i = 0; i < enemyCount; i++) {
        enemies.push({
            x: Math.random() * 700,
            y: Math.random() * 400,
            type: getEnemyType(difficulty),
            properties: {
                health: 20 + difficulty * 5,
                damage: 5 + difficulty,
                speed: 1 + difficulty * 0.2
            }
        });
    }
    
    return enemies;
}

// Enemy Type Generator
function getEnemyType(difficulty) {
    const types = [
        'slime', 'bat', 'skeleton',
        'ghost', 'goblin', 'wizard',
        'warrior', 'archer', 'mage',
        'assassin', 'knight', 'demon'
    ];
    
    return types[Math.min(Math.floor(Math.random() * difficulty), types.length - 1)];
}

// Coin Generator
function generateCoins(level) {
    const coins = [];
    const coinCount = 20 + Math.ceil(level / 10) * 5;
    
    for (let i = 0; i < coinCount; i++) {
        coins.push({
            x: Math.random() * 700,
            y: Math.random() * 400,
            value: Math.random() > 0.9 ? 5 : 1
        });
    }
    
    return coins;
}

// Powerup Generator
function generatePowerups(level) {
    const powerups = [];
    const powerupCount = 1 + Math.floor(level / 10);
    
    const types = [
        'health', 'speed', 'jump',
        'shield', 'damage', 'multishot'
    ];
    
    for (let i = 0; i < powerupCount; i++) {
        powerups.push({
            x: Math.random() * 700,
            y: Math.random() * 400,
            type: types[Math.floor(Math.random() * types.length)],
            duration: 10000 // 10 seconds
        });
    }
    
    return powerups;
}
