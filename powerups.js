// powerups.js
class Powerup {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 20;
        this.height = 20;
        this.active = true;
        this.floatOffset = 0;
        this.floatSpeed = 0.05;
    }

    update() {
        this.floatOffset = Math.sin(Date.now() * this.floatSpeed) * 5;
    }

    render(ctx) {
        ctx.fillStyle = this.getPowerupColor();
        ctx.fillRect(this.x, this.y + this.floatOffset, this.width, this.height);
    }

    getPowerupColor() {
        const colors = {
            'health': '#ff0000',
            'speed': '#00ff00',
            'damage': '#ff6600',
            'shield': '#0099ff',
            'multishot': '#ff00ff'
        };
        return colors[this.type] || '#ffffff';
    }

    applyEffect(player) {
        switch(this.type) {
            case 'health':
                player.heal(50);
                break;
            case 'speed':
                player.addSpeedBoost(5, 10000); // 10 seconds
                break;
            case 'damage':
                player.addDamageBoost(2, 10000);
                break;
            case 'shieldx=31 reference-tracker>0 reference-tracker>mark marker-i7 reference-tracker>nde<mark marker-index=26 reference-tracker>x=25 reference-tracker>24 reference-tracker>ark marker-index=23 reference-tracker>ndex=22 reference-tracker>k mark<mark marker-index=21 reference-tracker>er-index=20 reference-tracker>rk marker-index=6 <markracker> marker-indrker-ind<maracker>k marker-index=9 reference-ex=1ference-tracker>mark marker-index=15 reference-tracker>rker-index=14 reference-tracker>=12 reference-tracker>1 reference-tracker>0 reference-tracker>tracker>ex=8 reference-tracker>ex=7 reference-tracker>reference-tracker>e-tracker>reference-tracker>dex=3 reference-tracker>-tracker><mark marker-index=1 reference-tracker>rence-tracker>':
                player.activateShield(10000);
                break;
            case 'multishot':
                player.activateMultishot(10000);
                break;
        }
    }
}

// score.js
class ScoreManager {
    constructor() {
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.multiplier = 1;
        this.combo = 0;
        this.comboTimer = 0;
    }

    addScore(points) {
        this.score += points * this.multiplier;
        this.combo++;
        this.comboTimer = 120; // 2 seconds at 60fps
        this.updateMultiplier();
        this.updateHighScore();
    }

    updateMultiplier() {
        this.multiplier = 1 + Math.floor(this.combo / 10) * 0.5;
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
    }

    update() {
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer === 0) {
                this.combo = 0;
                this.multiplier = 1;
            }
        }
    }
}

// gameState.js
class GameState {
    constructor() {
        this.currentLevel = 1;
        this.playerStats = {
            health: 100,
            maxHealth: 100,
            coins: 0,
            lives: 3
        };
        this.unlockedLevels = parseInt(localStorage.getItem('unlockedLevels')) || 1;
        this.scoreManager = new ScoreManager();
    }

    saveProgress() {
        localStorage.setItem('playerStats', JSON.stringify(this.playerStats));
        localStorage.setItem('unlockedLevels', this.unlockedLevels);
    }

    loadProgress() {
        const savedStats = localStorage.getItem('playerStats');
        if (savedStats) {
            this.playerStats = JSON.parse(savedStats);
        }
    }

    unlockLevel(level) {
        if (level > this.unlockedLevels) {
            this.unlockedLevels = level;
            this.saveProgress();
        }
    }
}

// collision.js
class CollisionManager {
    static checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    static checkPlatformCollision(entity, platform) {
        const collision = this.checkCollision(entity, platform);
        
        if (collision) {
            // Check if falling onto platform
            if (entity.velocityY > 0 && 
                entity.y + entity.height - entity.velocityY <= platform.y) {
                entity.y = platform.y - entity.height;
                entity.velocityY = 0;
                entity.isGrounded = true;
                return 'top';
            }
            // Check for side collisions
            else if (entity.velocityX > 0) {
                entity.x = platform.x - entity.width;
                return 'left';
            }
            else if (entity.velocityX < 0) {
                entity.x = platform.x + platform.width;
                return 'right';
            }
            // Check for bottom collision
            else if (entity.velocityY < 0) {
                entity.y = platform.y + platform.height;
                entity.velocityY = 0;
                return 'bottom';
            }
        }
        return null;
    }
}

// camera.js
class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.target = null;
    }

    follow(target) {
        this.target = target;
    }

    update() {
        if (this.target) {
            // Center the camera on the target
            this.x = this.target.x - this.width / 2;
            this.y = this.target.y - this.height / 2;

            // Camera bounds
            this.x = Math.max(0, Math.min(this.x, LEVEL_WIDTH - this.width));
            this.y = Math.max(0, Math.min(this.y, LEVEL_HEIGHT - this.height));
        }
    }

    apply(ctx) {
        ctx.save();
        ctx.translate(-this.x, -this.y);
    }

    restore(ctx) {
        ctx.restore();
    }
}

// levelManager.js
class LevelManager {
    constructor() {
        this.currentLevel = null;
        this.platforms = [];
        this.enemies = [];
        this.powerups = [];
        this.coins = [];
        this.boss = null;
    }

    loadLevel(levelNumber) {
        const levelData = LEVELS[levelNumber - 1];
        
        this.currentLevel = levelNumber;
        this.platforms = levelData.platforms.map(p => new Platform(p.x, p.y, p.width, p.height));
        this.enemies = levelData.enemies.map(e => new Enemy(e.x, e.y, e.type));
        this.powerups = levelData.powerups.map(p => new Powerup(p.x, p.y, p.type));
        this.coins = levelData.coins.map(c => new Coin(c.x, c.y));
        
        if (levelData.boss) {
            this.boss = new Boss(levelData.boss);
        }
    }

    update(player) {
        // Update all level elements
        this.updatePlatforms();
        this.updateEnemies(player);
        this.updatePowerups(player);
        this.updateCoins(player);
        if (this.boss) this.boss.update(player);
        
        // Check win condition
        this.checkLevelCompletion();
    }

    render(ctx, camera) {
        camera.apply(ctx);
        
        // Render all level elements
        this.platforms.forEach(p => p.render(ctx));
        this.enemies.forEach(e => e.render(ctx));
        this.powerups.forEach(p => p.render(ctx));
        this.coins.forEach(c => c.render(ctx));
        if (this.boss) this.boss.render(ctx);
        
        camera.restore(ctx);
    }

    checkLevelCompletion() {
        if (this.boss && !this.boss.active) {
            GameManager.onLevelComplete(this.currentLevel);
        } else if (!this.boss && this.enemies.length === 0) {
            GameManager.onLevelComplete(this.currentLevel);
        }
    }
}
