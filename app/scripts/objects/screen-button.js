export default class ScreenButton extends Phaser.GameObjects.Sprite {
  /**
   *  My custom sprite.
   *
   *  @constructor
   *  @class Button
   *  @extends Phaser.GameObjects.Sprite
   *  @param {Phaser.Scene} scene - The scene that owns this sprite.
   *  @param {number} x - The horizontal coordinate relative to the scene viewport.
   *  @param {number} y - The vertical coordinate relative to the scene viewport.
   */
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    this.on('pointerdown', this.pressed, this);
    //this.on('pointerover', this.pressed, this);
    this.on('pointerup', this.released, this);
    this.on('pointerout', this.released, this);

    this.setOrigin(0);
    this.setInteractive();
    this.setAlpha(0.5);

    this.isDown = false;
    // follow to camera
    this.setScrollFactor(0);

    //  Add this game object to the owner scene.
    scene.children.add(this);
  }

  pressed() {
    this.isDown = true;
  }

  released() {
    this.isDown = false;
  }
}
