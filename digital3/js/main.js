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
    },

    preload: function ()
    {
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('ship', 'assets/ship.png', {frameWidth:200, frameHeight:200});
        this.load.image('wave', 'assets/wave.png');
        this.load.image('wall', 'assets/wall.png');
        this.load.image('vwall', 'assets/vwall.png');
        this.load.image('pirate', 'assets/pirate.png');
        this.load.audio('music', 'assets/music.mp3');
        this.load.audio('shipsound', 'assets/shipsound.wav');
    },

    create: function ()
    {
        this.add.image(400, 300, 'background');

        if (this.music ==null) {
            this.music=this.sound.add('music', {volume: 0.3});
            this.music.play();
            this.music.setLoop(true);
        }
        if (this.shipSound == null) {
            this.shipSound=this.sound.add('shipsound', {volume: 0.7});
            this.shipSound.play();
            this.shipSound.setLoop(true);
        }

        var wall = this.physics.add.staticGroup();
        wall.create(400,800,'wall');
        wall.create(-50,300, 'vwall');
        wall.create(850,300, 'vwall');

        var waves=this.physics.add.group({
            allowGravity: false,
            immovable:true,
            velocityY: 400
        });

        var pirates=this.physics.add.group({
            allowGravity: false,
            immovable:true,
            velocityY: 400,
            velocityX: Phaser.Math.Between(-150,150)
        });


        var i=0;
        for (i=0; i<8; i++) waves.create(Phaser.Math.Between(50,150),(i*100)+Phaser.Math.Between(0,50), 'wave');
        this.physics.add.overlap(waves, wall, this.waveBack, null, this);

        for (i=0; i<6; i++) pirates.create(i*100+Phaser.Math.Between(50,150),(i*50)+Phaser.Math.Between(0,50), 'pirate').setScale(0.2);
        this.physics.add.overlap(pirates, wall, this.pirateBack, null, this);

        this.player = this.physics.add.sprite(400, 525, 'ship').setScale(0.57);
        this.player.body.setAllowGravity(false);
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(50,80);

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('ship', {start:1, end: 4}),
            repeat: 0
        });
        
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('ship', {start:9, end: 12}),
            repeat: 0
        });

        this.anims.create({
            key: 'turn',
            frames: this.anims.generateFrameNumbers('ship', {start:0, end: 0}),
            repeat: 0
        });
        this.player.anims.play('turn');

        this.physics.add.overlap(this.player,pirates, this.lose, null, this);


        
        this.scoreText = this.add.text(16, 16, 'Level: 1', { fontSize: '32px', fill: '#000' });
    },

    update: function ()
    {
        var mousx = this.input.mousePointer.x;
        var difx=(mousx-this.player.x);

        if (difx < -20) {
            this.player.setVelocityX(-400-(this.level*200));
            if (this.player.anims.currentAnim.key !== 'left') this.player.anims.play('left', true);
            this.player.setSize(60,40);
        }

        else if (difx > 20) {
            this.player.setVelocityX(400+this.level*200);
            if (this.player.anims.currentAnim.key !== 'right') this.player.anims.play('right', true);
            this.player.setSize(60,40);
        }

        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
            this.player.setSize(50,80);
        }

        

    },

    waveBack: function(waves, wall) {
        waves.y=-50;
        waves.x=Phaser.Math.Between(50,750);
        waves.setVelocityY(400+this.level*100);
        this.count++;
        this.scoreText.setText('Level: ' + this.level);
        if (this.count==(40+(this.level-1)*20)) {
            this.level++;
            this.count=0;
        }
    },

    pirateBack: function(pirate, wall) {
        pirate.y=-50;
        pirate.x=Phaser.Math.Between(50,750);
        pirate.setVelocityY(400+this.level*100);
        pirate.setVelocityX(Phaser.Math.Between(-150-this.level*50,150+this.level*50));
        pirate.setScale(this.level *0.05+ 0.2);
    },

    lose: function() {
        this.level=1;
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
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: GameScene
};

var game = new Phaser.Game(config);