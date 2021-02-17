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
        this.load.image('background', 'assets/background.png');
        this.load.image('platform', 'assets/platform.png');
        this.load.image('camel', 'assets/camel.png');
        this.load.image('oasis', 'assets/oasis.png');
        this.load.audio('music', 'assets/music.mp3');
    },

    create: function ()
    {
        this.add.image(400, 300, 'background');
        var music=this.sound.add('music');
        music.play();
        music.setLoop(true);

        var addedPlatforms=0;
        var platformGroup = this.add.group({
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }

        });

        var platformPool = this.add.group({
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform)
            }
        });

        this.addPlatform(800, 400, 600 * ([0.4-0.8]));

        var player=this.physics.add.sprite(50,450,'camel');
        player.setDisplaySize(35,28);
        player.setBounce(0);
        player.setGravity(600);

        this.physics.add.collider(player, platformGroup);

        this.input.mouse.capture=true;

        addPlatform(platformWidth, posX, posY)
        {
            this.addedPlatforms ++;
            let platform;
            if(this.platformPool.getLength()){
                platform = this.platformPool.getFirst();
                platform.x = posX;
                platform.y = posY;
                platform.active = true;
                platform.visible = true;
                this.platformPool.remove(platform);
                let newRatio =  platformWidth / platform.displayWidth;
                platform.displayWidth = platformWidth;
                platform.tileScaleX = 1 / platform.scaleX;
            }
            else{
                platform = this.add.tileSprite(posX, posY, platformWidth, 32, "platform");
                this.physics.add.existing(platform);
                platform.body.setImmovable(true);
                platform.body.setVelocityX(Phaser.Math.Between(300, 300) * -1);
                this.platformGroup.add(platform);
            }
            this.nextPlatformDistance = Phaser.Math.Between(80, 300);
        }
    },


    update: function ()
    {
        var left = game.input.activePointer.leftButton.isDown;
        var right = game.input.activePointer.rightButton.isDown;
        var player = this.player;

        if (left && player.body.touching.down)
        {
            player.setVelocityY(-700);
        }
        if (right && !(player.body.touching.down)) {
            player.setVelocityy(500);
        }

        if(player.y > game.config.height){
            this.scene.start("PlayGame");
        }
        this.player.x = 100;

        let minDistance = game.config.width;
        let rightmostPlatformHeight = 0;
        this.platformGroup.getChildren().forEach(function(platform){
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            if(platformDistance < minDistance){
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if(platform.x < - platform.displayWidth / 2){
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        if(minDistance > this.nextPlatformDistance){
            let nextPlatformWidth = Phaser.Math.Between(90, 300);
            let platformRandomHeight = 20 * Phaser.Math.Between(-5, 5);
            let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
            let minPlatformHeight = game.config.height * 0.4;
            let maxPlatformHeight = game.config.height * 0.8;
            let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2, nextPlatformHeight);
        }

    },


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
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: GameScene
};

var game = new Phaser.Game(config);