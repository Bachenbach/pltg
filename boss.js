class Boss {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 64;
        this.height = 64;
        this.health = 100;
        this.maxHealth = 100;
        this.patterns = this.initPatterns();
        this.currentPattern = 0;
        this.attackCooldown = 0;
    }

    initPatterns() {
        switch(this.type) {
            case 'fire':
                return [
                    this.fireBreath,
                    this.meteorShower,
                    this.flameWall
                ];
            case 'ice':
                return [
                    this.iceSpikes,
                    this.blizzard,
                    this.freezeRay
                ];
            case 'thunder':
                return [
                    this.lightningStrike,
                    this.thunderStorm,
                    this.electroField
                ];
        }
    }

    update() {
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        } else {
            this.executePattern();
            this.attackCooldown = 120; // 2 seconds at 60 FPS
        }
    }

    executePattern() {
        const pattern = this.patterns[this.currentPattern];
        pattern.call(this);
        this.currentPattern = (this.currentPattern + 1) % this.patterns.length;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        UI.updateBossHealthBar(this.health / this.maxHealth);
        
        if (this.health <= 0) {
            this.die();
        }
    }
}
