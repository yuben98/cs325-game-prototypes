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
    preload: function () {
        this.load.image('bg', 'assets/background.png');
        this.load.image('fricon', 'assets/freeze.png');
    },

    create: function() {
        this.add.image(400,300,'bg');
        this.add.image(235,140, 'fricon').setScale(0.85);
        this.add.text(32,60, 'Use WASD to move.', { fontSize: '42px', fill: '#000' });
        this.add.text(32,120, 'Collect  to stack freezes.', { fontSize: '42px', fill: '#000' });
        this.add.text(32,180, 'Press SPACE to use up freezes.', { fontSize: '42px', fill: '#000' });

        if (prev!=0) this.add.text(32,300, 'Your Score was '+prev, {fontSize: '32px', fill: '#000' });
        if (bestScore!=0) this.add.text(32,350, 'Your Best Score is '+bestScore, {fontSize: '32px', fill: '#000' });

        this.add.text(32,470, 'Press SPACE to advance...', { fontSize: '50px', fill: '#000' });

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
        this.scoreText = null;
        this.level=1;
        this.count=0;
        this.bestText = null;
        this.best=0;
        this.bullet1=null;
        this.bullet2=null;
        this.killed1=false;
        this.killed2=false;
        this.shooting=false;
        this.freezing=false;
        this.freezes=0;
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
        this.load.audio('walk', 'assets/walk.wav');
        this.load.audio('zombs', 'assets/zombs.wav');
        this.load.audio('freezeSound', 'assets/freezeSound.wav');
        this.load.audio('tone', 'assets/tone.wav');
        this.load.image('wall', 'assets/wall.png');
        this.load.image('vwall', 'assets/vwall.png');
        this.load.image('zbody', 'assets/zbody.png');
        this.load.image('freeze', 'assets/freeze.png');
    },

    create: function ()
    {
        this.add.image(400, 300, 'background').setDepth(-2);
        this.shot=this.sound.add('shot');
        this.zombdeath=this.sound.add('zombdeath');
        this.cry=this.sound.add('cry', {volume: 0.2});
        this.tone=this.sound.add('tone');
        this.freezeSound=this.sound.add('freezeSound', {volume: 2});
        this.walk=this.sound.add('walk', {setLoop: true});

        this.zombs=this.sound.add('zombs', {
        volume: 0.08,
        setLoop: true
        });
        this.zombs.play();

        this.player = this.physics.add.sprite(400, 300, 'player').setScale(0.5);
        this.player.setSize(30,40);
        this.player.body.setAllowGravity(false);
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);

        this.pwr= this.physics.add.image(-200,-200, 'freeze').setScale(0.8);

        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', {start:0, end: 3}),
            duration: 500,
            repeat: -1
        });

        this.anims.create({
            key: 'zdown',
            frames: this.anims.generateFrameNumbers('zombie', {start:0, end: 3}),
            duration: 1000,
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
            duration: 1000,
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

        this.bullet1=this.physics.add.image(-200, -200, 'bullet');
        this.bullet1.setBounce(0);
        this.bullet1.setVisible(false);
        this.bullet2=this.physics.add.image(-200, -200, 'bullet');
        this.bullet2.setBounce(0);
        this.bullet2.setVisible(false);

        this.zombies=this.physics.add.group({
            setAllowGravity: false,
            setCollideWorldBounds: true
        });
        for (var i=0; i<3; i++) this.zombies.create(Phaser.Math.Between(-10,-50), Phaser.Math.Between(-10,-50), 'zombie').setScale(0.5);
        for (var i=0; i<3; i++) this.zombies.create(Phaser.Math.Between(810,850), Phaser.Math.Between(-10,-50), 'zombie').setScale(0.5);
        for (var i=0; i<3; i++) this.zombies.create(Phaser.Math.Between(-10,-50), Phaser.Math.Between(610,650), 'zombie').setScale(0.5);
        for (var i=0; i<3; i++) this.zombies.create(Phaser.Math.Between(810,850), Phaser.Math.Between(610,650), 'zombie').setScale(0.5);

        this.zombies.children.iterate(zombie => {
            zombie.anims.play('zleft', true);
            zombie.setSize(30,40);
        });
        this.physics.add.overlap(this.zombies, this.bullet1, this.killZombie, null, this);
        this.physics.add.overlap(this.zombies, this.bullet2, this.killZombie, null, this);
        this.physics.add.overlap(this.player, this.pwr, this.addFreeze, null, this);
        this.physics.add.overlap(this.player, this.zombies, this.lose, null, this);
        this.physics.add.collider(this.zombies,this.zombies);

        this.scoreText = this.add.text(350, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        this.bestText = this.add.text(360,42, 'Best: '+bestScore, {fontSize: '16px', fill: '#000'});
        this.freezeText= this.add.text(340, 560, 'Freezes left: 0',{fontSize: '16px', fill: '#000'});

        this.cursors = this.input.keyboard.addKeys({
			left: Phaser.Input.Keyboard.KeyCodes.A,
			right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
		});

        this.input.mouse.disableContextMenu();
        this.player.anims.play('stup', true);
    },

    update: function ()
    {
        if (!this.zombs.isPlaying) this.zombs.play();

        var right= this.cursors.right.isDown;
        var left = this.cursors.left.isDown;
        var up= this.cursors.up.isDown;
        var down= this.cursors.down.isDown;
        var space= this.cursors.space.isDown;

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

        if (space && this.freezes>0) {
            if (this.freezing) return;
            this.freezes--;
            this.freeze();
        }

        this.input.on('pointerdown', this.shoot, this);

        if (!this.freezing) {
            this.zombies.children.iterate(zombie => {
                var xdiff = zombie.x - this.player.x;
                var ydiff= zombie.y - this.player.y;

                if (ydiff<-20) {
                    zombie.setVelocityY(1.5*this.score+30);
                    if (zombie.anims.currentAnim.key !='zdown') zombie.anims.play('zdown', true);
                }
                else if (ydiff>20) {
                    zombie.setVelocityY(-1.5*this.score-30);
                    if (zombie.anims.currentAnim.key !='zup') zombie.anims.play('zup', true);
                }
                else zombie.setVelocityY(0);

                if (xdiff<-20) {
                    zombie.setVelocityX(30+this.score*1.5);
                    if (zombie.anims.currentAnim.key !='zright') zombie.anims.play('zright', true);
                }
                else if (xdiff>20) {
                    zombie.setVelocityX(-1.5 * this.score -30);
                    if (zombie.anims.currentAnim.key !='zleft') zombie.anims.play('zleft', true);
                }
                else zombie.setVelocityX(0);
            });
        }
    },

    shoot: function() {
        if (this.shot.isPlaying) return;
        var b=null;
        var vx=0;
        var vy=0;
        var angle=0;
        
        if (this.bullet1.x <-10 || this.bullet1.x >810 || this.bullet1.y >610 || this.bullet1.y < -10)  b = this.bullet1;
        else if (this.bullet2.x <-10 || this.bullet2.x >810 || this.bullet2.y >610 || this.bullet2.y < -10) b = this.bullet2;
        else return;

        if (this.player.anims.currentAnim.key == 'right' || this.player.anims.currentAnim.key == 'stright') vx=750;
        if (this.player.anims.currentAnim.key == 'left' || this.player.anims.currentAnim.key == 'stleft') vx=-750;
        if (this.player.anims.currentAnim.key == 'up' || this.player.anims.currentAnim.key == 'stup') vy=-750;
        if (this.player.anims.currentAnim.key == 'down' || this.player.anims.currentAnim.key == 'stdown') vy=750;
        
        if (vx!=0) angle =90;
        this.shot.play();

        b.setVisible(true);
        b.setPosition(this.player.x, this.player.y);
        b.setVelocity(vx,vy);
        b.setAngle(angle);
        if (b==this.bullet1) this.killed1=false;
        else this.killed2=false;
        this.freezing=false;
    },

    killZombie: function(bullet, zombie) {
        var angle=0;
        var ydiff=this.player.y - zombie.y;
        var xdiff=this.player.x - zombie.x
        var r=Phaser.Math.Between(0,3);
        if (bullet == this.bullet1 && this.killed1==true) return;
        if (bullet == this.bullet2 && this.killed2==true) return;
        
        if (bullet == this.bullet1) this.killed1=true;
        else this.killed2=true;

        if (ydiff > 20) angle +=90;
        else if (ydiff < -20) angle+=270;
        if (xdiff <-20) angle +=180;
        this.add.image(zombie.x, zombie.y, 'zbody').setScale(0.5).setAngle(angle).setDepth(-1);

        if (this.score % 10 ==0 && this.score > 1) this.pwr.setPosition(zombie.x, zombie.y);

        switch (r) {
            case 0:
                zombie.x=-40;
                zombie.y=-40;
                break;
            case 1:
                zombie.x=840;
                zombie.y=-40;
                break;
            case 2:
                zombie.x=-40;
                zombie.y=640;
                break;
            case 3:
                zombie.x=840;
                zombie.y=640;
                break;
        }
        this.zombdeath.play();
        bullet.setVisible(false);
        this.score++;
        this.scoreText.setText('Score: '+ this.score);
    },

    addFreeze: function() {
        this.tone.play();
        this.freezes++;
        this.pwr.x=-200;
        this.pwr.y=-200;
        this.freezeText.setText('Freezes Left: '+ this.freezes);
    },

    freeze: function() {
        this.freezing=true;
        this.zombies.children.iterate( zombie => {
            zombie.setVelocity(0,0);
        });
        this.freezeSound.play();
        this.freezeText.setText('Freezes Left: '+ this.freezes);
    },

    lose: function() {
        this.cry.play();
        if (bestScore< this.score) bestScore=this.score;
        prev=this.score;
        this.zombs.stop();
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
            gravity: { y: 0 },
            debug: false,
            debugShowBody: true
        }
    },
    scene: [StartScene, GameScene]
};

var game = new Phaser.Game(config);