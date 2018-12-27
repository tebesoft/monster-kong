import ScreenButton from './screen-button';

export default class ScreenButtonJump extends ScreenButton {
  /**
   *  My custom sprite.
   *
   *  @constructor
   *  @class ScreenButtonAction
   *  @extends Phaser.GameObjects.Sprite
   *  @param {Phaser.Scene} scene - The scene that owns this sprite.
   *  @param {number} x - The horizontal coordinate relative to the scene viewport.
   *  @param {number} y - The vertical coordinate relative to the scene viewport.
   */
  constructor(scene, x, y) {
    super(scene, x, y, 'actionButton');

    //  Add this game object to the owner scene.
    scene.children.add(this);
  }


}
