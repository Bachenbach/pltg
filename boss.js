// boss.js
class Boss {
    constructor(bossData) {
        this.type = bossData.type;
        this.element = bossData.element;
        this.abilities = bossData.abilities;
        this.stats = bossData.stats;
        
        this.currentHealth = this.stats.health;
        this.currentPhase = 0;
        this.phases = [
            { healthThreshold: 1.0, pattern: this.phase1Pattern.bind(this) },
            { healthThreshold: 0.6, pattern: this.phase2Pattern.bind(this) },
            { healthThreshold: 0.3, pattern: this.phase3Pattern.bind(this) }
        ];
        
        this.attackCooldown = 0;
        this.currentPattern = null;
        this.isEnraged = false;
    }

    update(player) {
        this.updatePhase();
        this.updatePattern(player);
        this.updateCooldowns();
    }

    updatePhase() {
        const healthPercentage = this.currentHealth / this.stats.health;
        for (let i = this.phases.length - 1; i >= 0; i--) {
            if (healthPercentage <= this.phases[i].healthThreshold) {
                if (this.currentPhase !== i) {
                    this.currentPhase = i;
                    this.onPhaseChange();
                }
                break;
            }
        }
    }

    onPhaseChange() {
        // Trigger phase change effects
        ParticleSystem.emit('phaseChange', this.position, this.element);
        if (this.currentPhase === this.phases.length - 1) {
            this.isEnraged = true;
        }
    }

    useAbility(abilityName) {
        const ability = this.abilities.find(a => a.name === abilityName);
        if (ability && ability.cooldown <= 0) {
            this.executeAbility(ability);
            ability.cooldown = ability.maxCooldown;
        }
    }

    executeAbility(ability) {
        // Each boss type has unique ability implementations
        switch(ability.name) {
            case 'Rebirth Flames':
                this.castRebirthFlames();
                break;
            case 'Ice Storm':
                this.castIceStorm();
                break;
            // ... implement all other abilities
        }
    }

    takeDamage(amount) {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        UI.updateBossHealth(this.currentHealth / this.stats.health);
        
        if (this.currentHealth <= 0) {
            this.die();
        }
    }

    die() {
        // Drop special items
        this.dropLoot();
        // Trigger death animation
        ParticleSystem.emit('bossDeath', this.position, this.element);
        // Trigger level completion
        GameManager.onBossDefeated(this);
    }
}

class BossAbility {
    constructor(name, damage, cooldown, duration) {
        this.name = name;
        this.damage = damage;
        this.cooldown = 0;
        this.maxCooldown = cooldown;
        this.duration = duration;
        this.isActive = false;
        this.projectiles = [];
    }

    update() {
        if (this.cooldown > 0) {
            this.cooldown--;
        }
    }
}

class BossProjectile {
    constructor(x, y, targetX, targetY, speed, damage, element) {
        this.x = x;
        this.y = y;
        this.element = element;
        this.damage = damage;
        this.speed = speed;
        this.active = true;
        
        // Calculate direction
        const angle = Math.atan2(targetY - y, targetX - x);
        this.velocityX = Math.cos(angle) * speed;
        this.velocityY = Math.sin(angle) * speed;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Create element-specific particles
        ParticleSystem.emit(this.element, this.x, this.y, 1);
    }

    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = this.getElementColor();
        ctx.fill();
    }

    getElementColor() {
        const colors = {
            FIRE: '#ff4400',
            ICE: '#00ffff',
            LIGHTNING: '#ffff00',
            NATURE: '#00ff00',
            SHADOW: '#660066',
            METAL: '#cccccc'
        };
        return colors[this.element] || '#ffffff';
    }
}

class Boss {
    constructor(bossData) {
        this.type = bossData.type;
        this.element = bossData.element;
        this.x = 400;
        this.y = 300;
        this.width = 64;
        this.height = 64;
        this.stats = bossData.stats;
        this.currentHealth = this.stats.health;
        this.abilities = this.initializeAbilities(bossData.abilities);
        
        this.state = {
            phase: 0,
            isInvulnerable: false,
            isEnraged: false,
            patternIndex: 0,
            attackCooldown: 0
        };

        this.patterns = this.initializePatterns();
        this.projectiles = [];
    }

    initializeAbilities(abilityNames) {
        return abilityNames.map(name => {
            const abilityData = this.getAbilityData(name);
            return new BossAbility(
                name,
                abilityData.damage,
                abilityData.cooldown,
                abilityData.duration
            );
        });
    }

    getAbilityData(name) {
        // Define base stats for abilities
        const baseStats = {
            damage: 20,
            cooldown: 180,
            duration: 60
        };

        // Ability-specific modifications
        const abilityModifiers = {
            'Rebirth Flames': { damage: 1.5, cooldown: 2, duration: 1.5 },
            'Fire Storm': { damage: 1.2, cooldown: 0.8, duration: 2 },
            'Wing Blast': { damage: 0.8, cooldown: 0.5, duration: 0.5 },
            // Add modifiers for all abilities...
        };

        const modifier = abilityModifiers[name] || { damage: 1, cooldown: 1, duration: 1 };

        return {
            damage: baseStats.damage * modifier.damage,
            cooldown: baseStats.cooldown * modifier.cooldown,
            duration: baseStats.duration * modifier.duration
        };
    }

    initializePatterns() {
        return {
            phase1: [
                this.basicAttackPattern.bind(this),
                this.circularAttackPattern.bind(this),
                this.randomProjectilePattern.bind(this)
            ],
            phase2: [
                this.dualAttackPattern.bind(this),
                this.crossAttackPattern.bind(this),
                this.spiralAttackPattern.bind(this)
            ],
            phase3: [
                this.bulletHellPattern.bind(this),
                this.combinationPattern.bind(this),
                this.ultimatePattern.bind(this)
            ]
        };
    }

    update(player) {
        this.updateState(player);
        this.updateAbilities();
        this.updateProjectiles();
        this.executeCurrentPattern(player);
    }

    updateState(player) {
        // Update phase based on health
        const healthPercentage = this.currentHealth / this.stats.health;
        if (healthPercentage <= 0.3 && this.state.phase < 2) {
            this.enterPhase(2);
        } else if (healthPercentage <= 0.6 && this.state.phase < 1) {
            this.enterPhase(1);
        }

        // Update attack cooldown
        if (this.state.attackCooldown > 0) {
            this.state.attackCooldown--;
        }

        // Update position based on player location
        this.moveTowardsPlayer(player);
    }

    enterPhase(phase) {
        this.state.phase = phase;
        this.state.isInvulnerable = true;
        this.state.patternIndex = 0;
        
        // Phase transition effects
        ParticleSystem.emit('phaseTransition', this.x, this.y, 50, this.element);
        
        // Temporary invulnerability
        setTimeout(() => {
            this.state.isInvulnerable = false;
        }, 2000);

        // Enrage at final phase
        if (phase === 2) {
            this.state.isEnraged = true;
            this.stats.speed *= 1.5;
        }
    }

    moveTowardsPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 100) {
            this.x += (dx / distance) * this.stats.speed;
            this.y += (dy / distance) * this.stats.speed;
        }
    }

    executeCurrentPattern(player) {
        if (this.state.attackCooldown <= 0) {
            const patterns = this.patterns[`phase${this.state.phase + 1}`];
            patterns[this.state.patternIndex](player);
            
            this.state.patternIndex = (this.state.patternIndex + 1) % patterns.length;
            this.state.attackCooldown = this.state.isEnraged ? 90 : 120;
        }
    }

    // Attack Patterns
    basicAttackPattern(player) {
        const projectile = new BossProjectile(
            this.x, this.y,
            player.x, player.y,
            5, this.stats.damage,
            this.element
        );
        this.projectiles.push(projectile);
    }

    circularAttackPattern() {
        const projectileCount = 8;
        for (let i = 0; i < projectileCount; i++) {
            const angle = (i / projectileCount) * Math.PI * 2;
            const projectile = new BossProjectile(
                this.x, this.y,
                this.x + Math.cos(angle) * 100,
                this.y + Math.sin(angle) * 100,
                4, this.stats.damage,
                this.element
            );
            this.projectiles.push(projectile);
        }
    }

    spiralAttackPattern() {
        const spiralCount = 20;
        const angleStep = (Math.PI * 2) / spiralCount;
        
        for (let i = 0; i < spiralCount; i++) {
            setTimeout(() => {
                const angle = angleStep * i;
                const projectile = new BossProjectile(
                    this.x, this.y,
                    this.x + Math.cos(angle) * 100,
                    this.y + Math.sin(angle) * 100,
                    3, this.stats.damage,
                    this.element
                );
                this.projectiles.push(projectile);
            }, i * 100);
        }
    }

    bulletHellPattern(player) {
        const waves = 3;
        const projectilesPerWave = 12;
        
        for (let wave = 0; wave < waves; wave++) {
            setTimeout(() => {
                for (let i = 0; i < projectilesPerWave; i++) {
                    const angle = (i / projectilesPerWave) * Math.PI * 2;
                    const projectile = new BossProjectile(
                        this.x, this.y,
                        this.x + Math.cos(angle) * 100,
                        this.y + Math.sin(angle) * 100,
                        3 + wave, this.stats.damage,
                        this.element
                    );
                    this.projectiles.push(projectile);
                }
            }, wave * 500);
        }
    }

    updateProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update();
            
            // Remove projectiles that are off-screen
            if (projectile.x < 0 || projectile.x > 800 ||
                projectile.y < 0 || projectile.y > 600) {
                return false;
            }
            
            return projectile.active;
        });
    }

    render(ctx) {
        // Render boss
        ctx.fillStyle = this.getElementColor();
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, 
                    this.width, this.height);

        // Render projectiles
        this.projectiles.forEach(projectile => projectile.render(ctx));

        // Render health bar
        this.renderHealthBar(ctx);
    }

    renderHealthBar(ctx) {
        const barWidth = 100;
        const barHeight = 10;
        const healthPercentage = this.currentHealth / this.stats.health;

        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 20,
                    barWidth, barHeight);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 20,
                    barWidth * healthPercentage, barHeight);
    }

    takeDamage(amount) {
        if (!this.state.isInvulnerable) {
            this.currentHealth = Math.max(0, this.currentHealth - amount);
            ParticleSystem.emit('damage', this.x, this.y, 5, this.element);

            if (this.currentHealth <= 0) {
                this.die();
            }
        }
    }

    die() {
        // Create death explosion
        ParticleSystem.emit('explosion', this.x, this.y, 50, this.element);
        
        // Drop rewards
        this.dropRewards();
        
        // Trigger level completion
        GameManager.onBossDefeated(this);
    }

    dropRewards() {
        // Drop health and power-ups
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const distance = 50;
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;
            
            GameManager.spawnPowerup(x, y);
        }
    }
}


