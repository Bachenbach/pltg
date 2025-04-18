class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 48;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpForce = -15;
        this.gravity = 0.8;
        this.health = 100;
        this.maxHealth = 100;
        this.abilities = [];
        this.isGrounded = false;
        this.direction = 1; // 1 for right, -1 for left
        
        this.initAbilities();
    }

    initAbilities() {
        this.abilities = [
            new Ability('fireball', 10, 1000),
            new Ability('iceBeam', 15, 2000),
            new Ability('lightning', 20, 3000)
        ];
    }

    update() {
        // Apply gravity
        this.velocityY += this.gravity;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Update abilities cooldown
        this.abilities.forEach(ability => ability.update());
    }

    render(ctx) {
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    jump() {
        if (this.isGrounded) {
            this.velocityY = this.jumpForce;
            this.isGrounded = false;
        }
    }

    useAbility(index) {
        if (index >= 0 && index < this.abilities.length) {
            this.abilities[index].activate(this);
        }
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        UI.updateHealthBar(this.health / this.maxHealth);
        
        if (this.health <= 0) {
            this.die();
        }
    }
}
