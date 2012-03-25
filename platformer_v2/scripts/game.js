/**
 * General game logic, loads more stuff as necessary.
 */

// When this definition is called, jQuery (or $), Kinetic and debug is defined.
define(["require"], function GameDefine(require) {

/** @constructor */
var Game = function (stage, config) {
  /** KineticJS Stage */
  this.stage = stage;
  /** Config, @see config.js */
  this.config = config;
  /** Sprites */
  this.sprites = {};
};


Game.prototype = {
  /** Initializing function */
  init: function () {
    var self = this;

    debug.groupCollapsed('Init');
    debug.info('Hello, world!');
    debug.debug($);
    debug.debug(Kinetic);
    debug.debug(this.stage);
    debug.groupEnd();

    // Set the #canvascontainer width and height according to the loaded config
    $("#canvascontainer").width(this.config.canvasWidth);
    $("#canvascontainer").height(this.config.canvasHeight);

    // Load the media
    this.loadMedia(function (spriteImg) {
      // Split the sprites
      self.createSprites(spriteImg);
    });
  },

  /** Loads media */
  loadMedia: function (callback) {
    var spriteImg = new Image();
    spriteImg.onload = function () {
      callback(spriteImg);
    };
    spriteImg.src = require.toUrl(this.config.sprites.source);
  },

  /** Splits the spritesheet to separate sprites */
  createSprites: function (spriteImg) {
    // Create a new temporary canvas
    var canvas   = document.createElement("canvas"),
      ctx        = canvas.getContext("2d"),
      frameWidth = this.config.sprites.frameWidth,
      frameHeight = this.config.sprites.frameHeight,
      // Calculate total amount of frames
      frameCount = (spriteImg.width * spriteImg.height) / (frameWidth * frameHeight),
      sprites = this.config.sprites,
      obj,
      sprite;

    if (frameCount !== Math.round(frameCount)) {
      throw new TypeError(this.config.sprites.source + ' has irregural frame widths or heights');
    }

    // TODO:
    //  1. Draw the separate frames to the temporary canvas
    //  2. Save the canvas data
    //  3. Pass the saved data to create a new image
    //  4. Save the new created image to the place where it belongs to in this.sprites object
    //  5. Goto 1.

    for (obj in sprites) {
      if (sprites.hasOwnProperty(obj) && obj !== "source" && obj !== "frameWidth" && obj !== "frameHeight") {
        sprite = sprites[obj];
        sprite.frameW = frameWidth;
        sprite.frameH = frameHeight;
        sprite.name = obj;
        sprite.mirrored = !!sprite.mirror;
        sprite.x = frameWidth * sprite.x;
        sprite.y = frameHeight * sprite.y;
        this.createSingleSprite(spriteImg, sprite);
      }
    }
  },
  
  /** Creates a single sprite
   * @param {Image} img  A loaded image of all sprites
   * @param {Object} sprite  Object that contains info of how the sprite is made
   * @param sprite.frameW  Width of a single frame
   * @param sprite.frameH  Height of a single frame
   * @param sprite.name  The name of the sprite
   * @param sprite.x  Where the sprite is located at in the image
   * @param sprite.y  Where the sprite is located at in the image
   * @param sprite.frames  How many animation frames are there
   * @param sprite.mirrored  Should every frame be mirrored or not
   */
  createSingleSprite: function (img, sprite) {
    debug.groupCollapsed('Creating sprite ' + sprite.name);
    debug.dir(img);
    debug.dir(sprite);
    
    
    var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      width = sprite.frames * sprite.frameW,
      height = sprite.frameH,
      newImg = new Image(),
      i;
    
    canvas.width = width;
    canvas.height = height;
    
    for (i = 0; i < sprite.frames; i++) {
      ctx.drawImage(
        img,                           // Image source
        sprite.x + sprite.frameW  * i, // Source X
        sprite.y,                      // Source Y
        sprite.frameW,                 // Source width
        sprite.frameH,                 // Source height
        sprite.frameW * i,             // Dest. X
        0,                             // Dest. Y
        sprite.frameW,                 // Dest. width
        sprite.frameH                  // Dest. height
      );
    }
    
    newImg.src = canvas.toDataURL();
    
    $(newImg).appendTo($("#canvascontainer").parent()).
      css({visibility: 'hidden'}).
      wrap('<div>').
      parent('div').
      css({border: '1px dashed #aaa', 'float': 'left', margin: '10px', lineHeight: 0}).
      hover(function () {
        $(this).children('img').css({visibility: 'visible'});
      }, function () {
        $(this).children('img').css({visibility: 'hidden'});
      });
    
    debug.groupEnd();
  }
}

// Expose the `Game` class in an object, in "Game" field
return {"Game": Game};

});