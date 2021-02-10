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
    },

    preload: function ()
    {
        this.load.image('city', 'assets/city.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('gabi', 'assets/gabi.png');
        this.load.image('titan', 'assets/titan.png');
        this.load.audio('chew', 'assets/eat.wav');
    },

    create: function ()
    {
        this.sound.resume()
        this.add.image(400, 300, 'city');

        var platforms = this.physics.add.staticGroup();
        var chew =this.sound.add('chew');

        platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        var player = this.physics.add.sprite(100, 450, 'titan');
        player.setDisplaySize(30,80)
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);


        this.cursors = this.input.keyboard.createCursorKeys();

        var gabis = this.physics.add.group({
            key: 'gabi',
            repeat: 50,
            setXY: { x: 2, y: 0, stepX: 15 }
        });

        gabis.children.iterate(function (child) {

            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        this.physics.add.collider(player, platforms);
        this.physics.add.collider(gabis, platforms);

        this.physics.add.overlap(player, gabis, this.eatGabi, null, this);

        this.player = player;
    },

    update: function ()
    {
        var cursors = this.cursors;
        var player = this.player;

        if (cursors.left.isDown)
        {
            player.setVelocityX(-160);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(160);
        }
        else
        {
            player.setVelocityX(0);
        }

        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }
    },

    eatGabi: function (player, gabi)
    {
        gabi.disableBody(true, true);
        this.chew.play();
        var h=this.player.displayHeight;
        var w=this.player.displayWidth;
        this.player.setDisplaySize((w+5),(h+5));
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
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