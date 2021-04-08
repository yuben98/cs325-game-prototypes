import "./phaser.js";

let prev=0;
let bestScore=0;

var StartScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function StartScene ()
    {
        Phaser.Scene.call(this, {key: 'startScene', active: true});
        this.text=null;
    },

    create: function() {
        this.add.text(32,100, 'Press Space to Start', { fontSize: '42px', fill: '#fff' });
        this.add.text(32,200, 'Use the Left and Right arrow keys to steer', { fontSize: '26px', fill: '#fff' });
        if (prev!=0) this.add.text(32,300, 'Your Score was '+prev, {fontSize: '32px', fill: '#fff' });
        if (bestScore!=0) this.add.text(32,400, 'Your Best Score is '+bestScore, {fontSize: '32px', fill: '#fff' });
        this.cursors = this.input.keyboard.createCursorKeys();
    },

    update: function() {
        var space= this.cursors.space.isDown;

        if (space) this.scene.start("gameScene");
    }

});

var GameScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function GameScene ()
    {
        Phaser.Scene.call(this, { key: 'gameScene', active: false });

        this.player = null;
        this.cursors = null;
        this.score = 0;
        this.scoreText=null;
        this.levelText = null;
        this.level=1;
        this.count=0;
        this.bestLevel = null;
        this.best=1;
        this.bestScoreText=null;
        this.newlevel=true;
    },

    preload: function ()
    {
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('car', 'assets/car.png', {frameWidth:80, frameHeight:90});
        this.load.image('wall', 'assets/wall.png');
        this.load.image('vwall', 'assets/vwall.png');
        this.load.image('lines', 'assets/lines.png');
        this.load.image('cone', 'assets/cone.png');
        this.load.image('tree', 'assets/tree.png');
        this.load.audio('music', 'assets/music.mp3');
        this.load.audio('engine', 'assets/engine.wav');
        this.load.audio('tire', 'assets/tire.mp3');
        this.load.audio('crash', 'assets/crash.wav');
    },

    create: function ()
    {
        this.add.image(400, 300, 'background');

        if (this.music ==null) {
            this.music=this.sound.add('music', {volume: 0.1});
            this.music.play();
            this.music.setLoop(true);
        }
        if (this.engineSound == null) {
            this.engineSound=this.sound.add('engine', {volume: 0.3});
            this.engineSound.play();
            this.engineSound.setLoop(true);
        }
        this.tire=this.sound.add('tire');
        this.crash=this.sound.add('crash');


        var wall = this.physics.add.staticGroup();
        wall.create(400,750,'wall').setSize(1000,5);

        

        this.lines=this.physics.add.group({
            allowGravity: false,
            immovable:true,
            velocityY: 300
        });

        this.cones=this.physics.add.group({
            allowGravity: false,
            immovable: true,
            velocityY: 300
        });

        var i;
        for (i=0; i<9; i++) this.lines.create(400,555-(i*91), 'lines');
        for (i=0; i<6; i++) this.cones.create(Phaser.Math.Between(100, 680),(-500+i*100)+Phaser.Math.Between(0,i*50), 'cone').setSize(25,35);


        this.physics.add.overlap(this.cones, wall, this.coneBack, null, this);
        this.physics.add.overlap(this.lines, wall, this.lineBack, null, this);


        this.player = this.physics.add.sprite(400, 550, 'car');
        this.player.body.setAllowGravity(false);
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        this.player.setInteractive({ pixelPerfect: true });

        this.trees=this.physics.add.group({
            allowGravity: false,
            immovable:true,
            velocityY: 300
        });

        for (i=0; i<2; i++) this.trees.create(Phaser.Math.Between(40,80),500-(300*i), 'tree');
        for (i=0; i<2; i++) this.trees.create(Phaser.Math.Between(730,760),500-(300*i), 'tree');

        this.physics.add.overlap(this.trees, wall, this.treeBack, null, this);

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('car', {start:0, end: 3}),
            repeat: 0
        });
        
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('car', {start:4, end: 7}),
            repeat: 0
        });

        this.anims.create({
            key: 'turn',
            frames: this.anims.generateFrameNumbers('car', {start:0, end: 0}),
            repeat: 0
        });
        this.player.anims.play('turn');

        var vwall=this.physics.add.staticGroup();
        vwall.create(92,550,'vwall').setSize(10,100).setAlpha(0);
        vwall.create(705,550, 'vwall').setSize(10,100).setAlpha(0);

        this.physics.add.collider(this.player, vwall);
        
        this.physics.add.overlap(this.player,this.cones, this.lose, null, this);


        this.levelText = this.add.text(16, 16, 'Level: 1', { fontSize: '32px', fill: '#000' });
        this.bestLevel = this.add.text(18,42, 'Best: '+this.best, {fontSize: '20px', fill: '#000'}); 
        this.scoreText=this.add.text(550,16, 'Score: 0', {fontSize: '32px', fill: '#000' });
        this.bestScoreText=this.add.text(550,42, 'Best: '+bestScore, {fontSize: '20px', fill: '#000' });

        this.cursors = this.input.keyboard.createCursorKeys();
    },

    update: function ()
    {
        var right= this.cursors.right.isDown;
        var left = this.cursors.left.isDown;

        if (this.newlevel) {    
            this.cones.create(Phaser.Math.Between(100, 680),-300, 'cone').setSize(25,35).setVelocityY(300+6*50);
            if (this.level < 7) {
            this.lines.setVelocityY(300+this.level*50);
            this.cones.setVelocityY(300+this.level*50);
            this.trees.setVelocityY(300+this.level*50);
            }
            this.newlevel=false;
        }

        if (right) {
            this.player.setVelocityX(250+this.level*40);
            if (this.player.anims.currentAnim.key == 'left') this.tire.play();
            if (this.player.anims.currentAnim.key !== 'right') this.player.anims.play('right', true);
            this.player.setSize(35,40);
        }

        else if (left) {
            this.player.setVelocityX(-250-this.level*40);
            if (this.player.anims.currentAnim.key == 'right') this.tire.play();
            if (this.player.anims.currentAnim.key !== 'left') this.player.anims.play('left', true);
            this.player.setSize(35,40);
        }

        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
            this.player.setSize(40,80);
            this.player.setOffset(21.5,5);
        }
    },


    lineBack: function(lines, wall) {
        lines.y=-122;
        this.score=this.score + 10;
        this.scoreText.setText('Score: '+ this.score);
        if (this.score > bestScore) {
            bestScore=this.score;
            this.bestScoreText.setText('Best: ' + bestScore);
        }
        this.count++;
        if (this.count==(40+(this.level-1)*20)) {
            this.level++;
            this.levelText.setText('Level: ' + this.level);
            if (this.best < this.level) {
                this.best=this.level;
                this.bestLevel.setText('Best: ' + this.best);
            }
            this.newlevel=true;
            this.count=0;
        }
    },

    coneBack: function(cone, wall) {
        cone.setPosition(Phaser.Math.Between(100,700), Phaser.Math.Between(-50,-200));
    },

    treeBack: function (tree, wall) {
        tree.y=-100;
        if (tree.x < 100) tree.x=Phaser.Math.Between(40,80);
        else tree.x=Phaser.Math.Between(730,760);
    },

    lose: function() {
        this.crash.play();
        this.level=1;
        prev=this.score;
        this.score=0;
        this.count=0;
        this.scene.start("startScene");
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
            debug: false,
            debugShowBody: true
        }
    },
    scene: [StartScene, GameScene]  
};

var game = new Phaser.Game(config);