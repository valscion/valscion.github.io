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
  /** Is the game ready to be drawn */
  this.ready = false;
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
      // We're ready, allow drawing
      self.ready = true;

      // Do some initial drawing
      self.draw();
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
    //  1. [DONE] Draw the separate frames to the temporary canvas
    //  2. [DONE] Save the canvas data
    //  3. Pass the saved data to create a new image
    //  4. Save the new created image to the place where it belongs to in this.sprites object

    for (obj in sprites) {
      if (sprites.hasOwnProperty(obj) && obj !== "source" && obj !== "frameWidth" && obj !== "frameHeight") {
        sprite = sprites[obj];
        sprite.frames.width = frameWidth;
        sprite.frames.height = frameHeight;
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
   * @param {Object} sprite.frames  Information about frames
   * @param sprite.frames.width  Width of a single frame
   * @param sprite.frames.height  Height of a single frame
   * @param sprite.frames.count  How many animation frames are there
   * @param sprite.frames.time  If sprite.frame.count > 1 then this is how long a single frame plays
   * @param sprite.name  The name of the sprite
   * @param sprite.x  Where the sprite is located at in the image
   * @param sprite.y  Where the sprite is located at in the image
   * @param sprite.mirrored  Should every frame be mirrored or not
   */
  createSingleSprite: function (img, sprite) {
    debug.groupCollapsed('Creating sprite ' + sprite.name);
    debug.dir(img);
    debug.dir(sprite);


    var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      width = sprite.frames.count * sprite.frames.width,
      height = sprite.frames.height,
      newImg = new Image(),
      i;

    canvas.width = width;
    canvas.height = height;

    ctx.save();
    // If mirrored, then scale horizontally by -1 to actually mirror the image
    if (sprite.mirrored) {
      ctx.scale(-1, 1);
    }

    for (i = 0; i < sprite.frames.count; i++) {
      ctx.drawImage(
        // Image source
        img,
        // Source X
        sprite.x + sprite.frames.width * (sprite.mirrored ? sprite.frames.count - i - 1 : i),
        // Source Y
        sprite.y,
        // Source width
        sprite.frames.width,
        // Source height
        sprite.frames.height,
        // Destination X
        sprite.frames.width * (sprite.mirrored ? i - sprite.frames.count : i),
        // Destination Y
        0,
        // Destination width
        sprite.frames.width,
        // Destination height
        sprite.frames.height
      );
    }
    ctx.restore();

    newImg.src = canvas.toDataURL();

    // Store the image
    this.sprites[sprite.name] = {
      img: newImg,
      frames: sprite.frames
    };

    debug.groupEnd();
  },

  /** Draws stuff */
  draw: function () {
    var staticLayer = this.stage.getChild('static'),
      i,
      spriteNames = Object.keys(this.sprites),
      self = this;

    for (i = 0; i < spriteNames.length; i++) {
      // anonymous function to induce scope
      (function () {
        var sprite = self.sprites[spriteNames[i]],
          shape = new Kinetic.Shape({
            drawFunc: function () {
              var ctx = this.getContext();
              ctx.drawImage(
                // Image
                sprite.img,
                // Source X
                this.currentFrame * sprite.frames.width,
                // Source Y
                0,
                // Source width
                sprite.frames.width,
                // Source height
                sprite.frames.height,
                // Destination X
                0,
                // Destination Y
                0,
                // Destination width
                sprite.frames.width,
                // Destination height
                sprite.frames.height
              )
            },
            x: 10,
            y: 10 + i * (sprite.frames.height + 10),
            currentFrame: 0,
            draggable: true
          });

        shape.on('mouseover', function () {
          $('#canvascontainer').css({'cursor': 'pointer'});
        });
        shape.on('mouseout', function () {
          $('#canvascontainer').css({'cursor': 'default'});
        });

        staticLayer.add(shape);

        // Add the shape to the sprite
        sprite.shape = shape;
      })();
    }

    // Invoke the draw
    staticLayer.draw();

    // Start animations loop
    this.stage.onFrame(function (frame) {
      self.animationDraw(frame);
    });

    this.stage.start();
  },

  /** Drawing of animations */
  animationDraw: function (frame) {
    var i,
      staticLayer = this.stage.getChild('static'),
      spriteNames = Object.keys(this.sprites),
      sprite;

    for (i = 0; i < spriteNames.length; i++) {
      sprite = this.sprites[spriteNames[i]];

      if (sprite.frames.count <= 1) {
        // Nothing to animate here
        continue;
      }

      //sprite.shape.x = 150 * Math.sin(frame.time * 2 * Math.PI / 2000) + 150;

      sprite.shape.currentFrame = Math.floor(frame.time / sprite.frames.time) % sprite.frames.count;
      //sprite.shape.x = 0;
    }

    staticLayer.draw();
  }
}

// Expose the `Game` class in an object, in "Game" field
return {"Game": Game};

});