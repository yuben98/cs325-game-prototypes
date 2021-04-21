import "./phaser.js";

// You can copy-and-paste the code from any of the examples at https://examples.phaser.io here.
// You will need to change the `parent` parameter passed to `new Phaser.Game()` from
// `phaser-example` to `game`, which is the id of the HTML element where we
// want the game to go.
// The assets (and code) can be found at: https://github.com/photonstorm/phaser3-examples
// You will need to change the paths you pass to `this.load.image()` or any other
// loading functions to reflect where you are putting the assets.
// All loading functions will typically all be found inside `preload()`.

// The simplest class example: https://phaser.io/examples/v3/view/scenes/scene-from-es6-class

var GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function GameScene ()
    {
        Phaser.Scene.call(this, { key: 'gameScene', active: true });

        this.player = null;
        this.cursors = null;
        this.score = 0;
        this.scoreText = null;
        this.level=1;
        this.count=0;
        this.bestText = null;
        this.best=0;
        this.bullet=null;
        this.killed=false;
    },

    preload: function ()
    {
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('player', 'assets/player.png', {frameWidth:100, frameHeight:80});
        this.load.spritesheet('zombie', 'assets/zombie.png', {frameWidth:100, frameHeight:80});        
        this.load.image('bullet', 'assets/bullet.png');
        this.load.audio('cry', 'assets/cry.wav');
        this.load.audio('shot', 'assets/shot.wav');
        this.load.audio('zombdeath', 'assets/zombdeath.wav');
        this.load.image('wall', 'assets/wall.png');
        this.load.image('vwall', 'assets/vwall.png');
        this.load.audio('walk', 'assets/walk.wav');
    },

    create: function ()
    {
        this.add.image(400, 300, 'background');
        this.shot=this.sound.add('shot');
        this.zombdeath=this.sound.add('zombdeath');
        this.cry=this.sound.add('cry');
        if (this.walk==null) {
            this.walk=this.sound.add('walk');
            this.walk.setLoop(true);
        }


        this.player = this.physics.add.sprite(400, 550, 'player').setScale(0.5);
        this.player.setSize(30,40);
        this.player.body.setAllowGravity(false);
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);


        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', {start:0, end: 3}),
            duration: 500,
            repeat: -1
        });

        this.anims.create({
            key: 'zdown',
            frames: this.anims.generateFrameNumbers('zombie', {start:0, end: 3}),
            duration: 500,
            repeat: -1
        });

        this.anims.create({
            key: 'stdown',
            frames: this.anims.generateFrameNumbers('player', {start:0, end: 0}),
            duration: 500,
            repeat: 0
        });

        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', {start:4, end: 7}),
            duration: 500,
            repeat: -1
        });

        this.anims.create({
            key: 'zup',
            frames: this.anims.generateFrameNumbers('zombie', {start:4, end: 7}),
            duration: 500,
            repeat: -1
        });

        this.anims.create({
            key: 'stup',
            frames: this.anims.generateFrameNumbers('player', {start:4, end: 4}),
            duration: 500,
            repeat: 0
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', {start:8, end: 11}),
            duration: 500,
            repeat: -1
        });

        this.anims.create({
            key: 'zleft',
            frames: this.anims.generateFrameNumbers('zombie', {start:8, end: 11}),
            duration: 500,
            repeat: -1
        });

        this.anims.create({
            key: 'stleft',
            frames: this.anims.generateFrameNumbers('player', {start:8, end: 8}),
            duration: 500,
            repeat: 0
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', {start:12, end: 15}),
            duration: 500,
            repeat: -1
        });

        this.anims.create({
            key: 'zright',
            frames: this.anims.generateFrameNumbers('zombie', {start:12, end: 15}),
            duration: 500,
            repeat: -1
        });

        this.anims.create({
            key: 'stright',
            frames: this.anims.generateFrameNumbers('player', {start:12, end: 12}),
            duration: 500,
            repeat: 0
        });

        this.bullet=this.physics.add.image(400, 550, 'bullet');
        this.bullet.setBounce(0);
        this.bullet.setVisible(false);

        this.zombies=this.physics.add.group({
            setAllowGravity: false,
            immovable: true,
            setCollideWorldBounds: true
        });
        for (var i=0; i<10; i++) {
            this.zombies.create(Phaser.Math.Between(750,780), Phaser.Math.Between(20,50), 'zombie').setScale(0.5);
        }
        this.zombies.children.iterate(zombie => {
            zombie.anims.play('zleft', true);
            zombie.setSize(30,40);
        })
        this.physics.add.overlap(this.zombies, this.bullet, this.killZombie, null, this);
        this.physics.add.overlap(this.player, this.zombies, this.lose, null, this);

        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        this.bestText = this.add.text(18,42, 'Best: '+this.best, {fontSize: '16px', fill: '#000'}); 

        this.cursors = this.input.keyboard.addKeys({
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
		});

        this.input.mouse.disableContextMenu();
        this.player.anims.play('stup', true);
    },

    update: function ()
    {
        var right= this.cursors.right.isDown;
        var left = this.cursors.left.isDown;
        var up= this.cursors.up.isDown;
        var down= this.cursors.down.isDown;

        if (right) {
            if (!(down || up)) this.player.setVelocityX(200);
            else this.player.setVelocityX(100+this.score*2);
            if (this.player.anims.currentAnim.key != 'right') this.player.anims.play('right', true);
            if (!this.walk.isPlaying) this.walk.play();
        }

        else if (left) {
            if (!(down || up)) this.player.setVelocityX(-200);
            else this.player.setVelocityX(-100-this.score*2);
            if (this.player.anims.currentAnim.key !='left') this.player.anims.play('left', true);
            if (!this.walk.isPlaying) this.walk.play();       
        }
        else this.player.setVelocityX(0);

        if (up) {
            if (!(right || left)) this.player.setVelocityY(-200);
            else this.player.setVelocityY(-100-this.score*2);
            if (this.player.anims.currentAnim.key != 'up') this.player.anims.play('up', true);
            if (!this.walk.isPlaying) this.walk.play();
        }

        else if (down) {
            if (!(right || left)) this.player.setVelocityY(200);
            else this.player.setVelocityY(100+this.score*2);
            if (this.player.anims.currentAnim.key != 'down') this.player.anims.play('down', true);
            if (!this.walk.isPlaying) this.walk.play();
        }
        else this.player.setVelocityY(0);
        
        if(!right && !left && !up && !down ) {
            this.walk.pause();
            if (this.player.anims.currentAnim.key == 'right') this.player.anims.play('stright', true);
            if (this.player.anims.currentAnim.key =='left') this.player.anims.play('stleft', true);
            if (this.player.anims.currentAnim.key =='up') this.player.anims.play('stup', true);
            if (this.player.anims.currentAnim.key =='down') this.player.anims.play('stdown', true);
        }

        this.input.on('pointerdown', this.shoot, this);

        this.zombies.children.iterate(zombie => {
            if (zombie.x < this.player.x) {
                zombie.setVelocityX(20+this.score*2);
                if (zombie.anims.currentAnim == null && zombie.anims.currentAnim.key != 'zright') zombie.anims.play('zright', true);
            }
            else if (zombie.x > this.player.x) {
                zombie.setVelocityX(-2 * this.score -20);
                if (zombie.anims.currentAnim == null && zombie.anims.currentAnim.key != 'zleft') zombie.anims.play('zleft', true);
            }

            if (zombie.y < this.player.y) {
                zombie.setVelocityY(this.score* 2 +20);
                if (zombie.anims.currentAnim == null && zombie.anims.currentAnim.key != 'zdown') zombie.anims.play('zdown', true);
            }

            else if (zombie.y > this.player.y) {
                zombie.setVelocityY(-2 * this.score-20);
                if (zombie.anims.currentAnim == null && zombie.anims.currentAnim.key != 'zup') zombie.anims.play('zup', true);
            }

        })
    },

    shoot: function() {

        var vx=0;
        var vy=0;
        var angle=0;

        if (this.player.anims.currentAnim.key == 'right' || this.player.anims.currentAnim.key == 'stright') vx=800;
        if (this.player.anims.currentAnim.key == 'left' || this.player.anims.currentAnim.key == 'stleft') vx=-800;
        if (this.player.anims.currentAnim.key == 'up' || this.player.anims.currentAnim.key == 'stup') vy=-800;
        if (this.player.anims.currentAnim.key == 'down' || this.player.anims.currentAnim.key == 'stdown') vy=800;
        
        if (vx!=0) angle =90;

        if (this.shot.isPlaying) return;
        this.shot.play();

        this.bullet.setVisible(true);
        this.bullet.setPosition(this.player.x, this.player.y);
        this.bullet.setVelocity(vx,vy);
        this.bullet.setAngle(angle);
        this.killed=false;
    },

    killZombie: function(bullet, zombie) {
        if (this.killed==true) return;
        this.killed=true;
        bullet.x=-200;  
        bullet.y=-200; 
        bullet.setVelocity(0,0);
        zombie.x=Phaser.Math.Between(700,780);
        zombie.y=Phaser.Math.Between(20,100);
        this.zombdeath.play();
        bullet.setVisible(false); 
        this.score++;
        this.scoreText.setText('Score: '+ this.score);
    },

    lose: function() {
        this.cry.play();
        if (this.best < this.score) this.best=this.score;
        this.score=0;
        this.count=0;
        this.scene.start("gameScene");
    } 

});

var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
            debugShowBody: true
        }
    },
    scene: GameScene
};

var game = new Phaser.Game(config);