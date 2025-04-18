class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = null;
        this.currentLevel = 0;
        this.enemies = [];
        this.coins = [];
        this.platforms = [];
        this.particles = [];
        this.powerups = [];
        
        this.score = 0;
        this.gameLoop = this.gameLoop.bind(this);
        this.init();
    }

    init() {
        this.player = new Player(100, 100);
        this.loadLevel(this.currentLevel);
        this.setupEventListeners();
        requestAnimationFrame(this.gameLoop);
    }

    loadLevel(levelIndex) {
        const levelData = LEVELS[levelIndex];
        this.platforms = levelData.platforms.map(p => new Platform(p.x, p.y, p.width, p.height));
        this.enemies = levelData.enemies.map(e => new Enemy(e.x, e.y, e.type));
        this.coins = levelData.coins.map(c => new Coin(c.x, c.y));
        
        if (levelData.boss) {
            this.boss = new Boss(levelData.boss.x, levelData.boss.y, levelData.boss.type);
        }
    }

    gameLoop(timestamp) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.update();
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }

    update() {
        this.player.update();
        this.enemies.forEach(enemy => enemy.update());
        if (this.boss) this.boss.update();
        
        this.checkCollisions();
        this.updateParticles();
        this.checkGameStatus();
    }

    render() {
        this.platforms.forEach(platform => platform.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.coins.forEach(coin => coin.render(this.ctx));
        this.particles.forEach(particle => particle.render(this.ctx));
        if (this.boss) this.boss.render(this.ctx);
        this.player.render(this.ctx);
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleInput(e, true));
        window.addEventListener('keyup', (e) => this.handleInput(e, false));
    }

    handleInput(e, isKeyDown) {
        this.player.handleInput(e.key, isKeyDown);
    }
}

// Start the game
window.onload = () => {
    const game = new Game();
};
