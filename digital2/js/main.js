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
        this.music=null;
        this.i=0;
        this.n=0;
        this.count=0;
        this.oasis=null;
        this.winSound=null;
        },
    

    preload: function ()
    {
        this.load.image('background', 'assets/background.png');
        this.load.image('platform', 'assets/platform.png');
        this.load.image('camel', 'assets/camel.png');
        this.load.image('wall', 'assets/wall.png')
        this.load.image('oasis', 'assets/oasis.png');
        this.load.audio('music', 'assets/music.mp3');
        this.load.image('cloud', 'assets/cloud.png');
        this.load.audio('winsound', 'assets/winsound.mp3');

    },

    create: function ()
    {
        this.add.image(400, 300, 'background');
        if (this.music ==null) {
            this.music=this.sound.add('music');
            this.music.play();
            this.music.setLoop(true);
        }
        if (this.winSound ==null) {
            this.winSound=this.sound.add('winsound');
            this.winSound.setLoop(false);
        }

        var ground = this.physics.add.staticGroup();
        ground.create(400,568,'platform').setScale(2).refreshBody();
        ground.create(-500,300,'wall');

        var platforms = this.physics.add.group({
            immovable: true,
            allowGravity: false,
            velocityX: -400
        });

        platforms.create(0,220, 'platform');
        for(this.i=1;this.i<10;this.i++) platforms.create((this.i*300),Phaser.Math.Between(220,450),'platform').setScale(0.3);

        var clouds = this.physics.add.group({
            allowGravity: false,
            immovable: true,
            velocityX: Phaser.Math.Between(-200,-300)
        });

        for (this.n=0;this.n<8; this.n++) clouds.create((this.n*150),Phaser.Math.Between(60,400),'cloud').setScale(Phaser.Math.Between(0.5,1));


        this.player=this.physics.add.sprite(50,150,'camel');
        this.player.setDisplaySize(130,110);
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);

        this.physics.add.overlap(this.player,ground, this.lose, null, this);
        this.physics.add.collider(this.player, platforms);
        this.physics.add.overlap(platforms, ground, this.chargeUp, null, this);
        this.physics.add.overlap(clouds, ground, this.cloudBack, null, this);

        
        this.oasis= this.physics.add.image(750,490,'oasis');
        this.oasis.setDisplaySize(180,100);
        this.physics.add.collider(this.oasis, ground);
        this.physics.add.overlap(this.player, this.oasis, this.win, null, this);
        
        this.cursors = this.input.keyboard.createCursorKeys();
    },


    update: function ()
    {

        var up = this.cursors.up.isDown;
        var down= this.cursors.down.isDown;

        if(this.count==20) this.oasis.setVelocityX(-1000);

        if (up && this.player.body.touching.down)
        {
            this.player.setVelocityY(-700);
        }
        if (down && !(this.player.body.touching.down)) {
            this.player.setVelocityY(3000);
        }

    },

    lose: function(player ,ground){
        this.count=0;
        this.scene.start("gameScene");
    },

    win: function(player, oasis){
        this.count=0;
        this.winSound.play();
        this.scene.start("gameScene");
    },

    chargeUp: function(platforms, ground){
        this.count++;
        platforms.setPosition(this.i*300, Phaser.Math.Between(220,450));
    },

    cloudBack: function(clouds, ground) {
        clouds.setPosition(this.n*150, Phaser.Math.Between(60,500));
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
            gravity: { y: 420 },
            debug: false
        }
    },
    scene: GameScene
};

var game = new Phaser.Game(config);