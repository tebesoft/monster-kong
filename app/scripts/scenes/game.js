import Ground from '@/objects/ground';
import Platform from '@/objects/platform';
import Player from '@/objects/player';
import ScreenButtonJump from '@/objects/screen-button-jump';
import ScreenButtonMove from '@/objects/screen-button-move';


export default class Game extends Phaser.Scene {
  /**
   *  A sample Game scene, displaying the Phaser logo.
   *
   *  @extends Phaser.Scene
   */
  constructor() {
    super({key: 'Game'});
  }

  /**
   *  Called when a scene is initialized. Method responsible for setting up
   *  the game objects of the scene.
   *
   *  @protected
   *  @param {object} data Initialization parameters.
   */
  create(/* data */) {

    this.cameras.main.setBounds(0, 0, 360, 700);
    this.physics.world.setBounds(0, 0, 360, 700);

    this.ground = this.physics.add.existing(new Ground(this, 0, 638));
    this.ground.body.allowGravity = false;
    this.ground.body.immovable = true;

    this.levelData = this.cache.json.get('level');

    // platforms
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    this.levelData.platformData.forEach((element) => {
      let platform = this.add.existing(new Platform(this, element.x, element.y));
      this.platforms.add(platform);
    });

    // fires
    this.fires = this.physics.add.group({
      allowGravity: false
    });

    if (!this.anims.get('fire')) {
      this.anims.create({
        key: 'fire',
        frames: this.anims.generateFrameNumbers('fire'),
        frameRate: 4,
        repeat: -1
      });
    }

    this.levelData.fireData.forEach((element) => {
      let fire = this.fires.create(element.x, element.y, 'fire');
      fire.anims.load('fire');
      fire.anims.play('fire');
    });

    // goal
    this.goal = this.physics.add.sprite(this.levelData.goal.x, this.levelData.goal.y, 'goal');
    this.goal.body.allowGravity = false;

    // this.platform = this.physics.add.existing(new Platform(this, 0, 300));
    // this.platform.body.allowGravity = false;
    // this.platform.body.immovable = true;

    this.player = this.add.existing(new Player(this, this.levelData.playerStart.x, this.levelData.playerStart.y));
    this.physics.add.existing(this.player);

    if (!this.anims.get(this.player.animKeys.walking)) {
      this.anims.create({
        key: this.player.animKeys.walking,
        frames: this.anims.generateFrameNumbers(this.player.texture.key, { start: 0, end: 2 }),
        frameRate: 6,
        repeat: -1
      });
    }

    if (!this.anims.get(this.player.animKeys.standing)) {
      this.anims.create({
        key: this.player.animKeys.standing,
        frames: this.anims.generateFrameNumbers(this.player.texture.key, { start: 3, end: 3 }),
        frameRate: 1,
        repeat: 0
      });
    }

    this.player.anims.load(this.player.animKeys.walking);
    this.player.anims.load(this.player.animKeys.standing);

    this.player.body.setCollideWorldBounds();
    this.cameras.main.startFollow(this.player);

    // barrels
    this.barrels = this.physics.add.group();

    this.createBarrel();
    this.barrelCreator = this.time.addEvent({
      delay: 1000 * this.levelData.barrelFrequency,
      callback: this.createBarrel,
      //args: [],
      callbackScope: this,
      loop: true
    });

    this.barrelDeadPoint = this.physics.add.sprite(0, 630, 'barrel');
    this.barrelDeadPoint.body.allowGravity = false;
    this.barrelDeadPoint.setAlpha(0);


    this.leftArrow = this.add.existing(new ScreenButtonMove(this, 20, 535));
    this.rightArrow = this.add.existing(new ScreenButtonMove(this, 110, 535));
    this.actionButton = this.add.existing(new ScreenButtonJump(this, 280, 535));

    // collisions
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.barrels, this.platforms);
    this.physics.add.collider(this.barrels, this.ground);

    this.physics.add.overlap(this.player, this.fires, this.killPlayer, ()=>{}, this);
    this.physics.add.overlap(this.player, this.barrels, this.killPlayer, ()=>{}, this);
    this.physics.add.overlap(this.player, this.goal, this.win, ()=>{}, this);
    this.physics.add.overlap(this.barrelDeadPoint, this.barrels, this.killBarrel, ()=>{}, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    //this.player.
  }

  killPlayer() {
    this.scene.restart();
  }

  win() {
    alert('win');
    this.scene.restart();
  }

  createBarrel() {
    const barrel = this.barrels.getFirstDead(true, this.levelData.goal.x, this.levelData.goal.y, 'barrel');
    barrel.setActive(true);
    barrel.body.setVelocityX(this.levelData.barrelSpeed);
    barrel.body.setCollideWorldBounds();
    barrel.body.setBounce(1, 0.2);
  }

  killBarrel(barrel1, barrel2) {
    this.barrels.kill(barrel2);
  }

  /**
   *  Called when a scene is updated. Updates to game logic, physics and game
   *  objects are handled here.
   *
   *  @protected
   *  @param {number} t Current internal clock time.
   *  @param {number} dt Time elapsed since last update.
   */
  update(/* t, dt */) {
    if (this.cursors.left.isDown || this.leftArrow.isDown)
    {
      this.player.body.setVelocityX(-this.player.runningSpeed);
      this.player.flipX = 0;
      this.player.anims.play(this.player.animKeys.walking, true);
    }
    else if (this.cursors.right.isDown || this.rightArrow.isDown)
    {
      this.player.body.setVelocityX(this.player.runningSpeed);
      this.player.flipX = -1;
      this.player.anims.play(this.player.animKeys.walking, true);
    }
    else
    {
      this.player.body.setVelocityX(0);
      this.player.anims.play(this.player.animKeys.standing);
    }
    if ( (this.actionButton.isDown || this.cursors.up.isDown) && this.player.body.touching.down) {
      this.player.body.setVelocityY(-this.player.jumpingSpeed);
    }

    // rotate barrels
    this.barrels.getChildren().forEach((barrel) => {
      if (barrel.body.velocity.x < 0) {
        barrel.angle -= 10;
      } else {
        barrel.angle += 10;
      }

    });

  }
}
