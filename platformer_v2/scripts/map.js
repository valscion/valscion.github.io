/**
 * Map and tileset stuff
 */


// When this definition is called, jQuery (or $), Kinetic and debug is defined.
define(["require"], function MapDefine(require) {

/** @constructor */
var Map = function (game) {
  /** @link {Game} */
  this.game = game;
  /** Levels */
  this.levels = [];
};


Map.prototype = {

  /** Loads the map.
   * @param {Function} callback  Call this function after map is successfully loaded
   */
  init: function (callback) {
    this.levels = new Array(this.game.config.levels.length);
    this.load(callback);
  },

  /** Loads the maps from configured places
   * @param {Function} callback  Called when map is loaded
   */
  load: function (callback) {
    var config = this.game.config,
      i,
      self = this,
      loadedLevels = 0;
    for (i = 0; i < config.levels.length; i++) {
      this.levels[i] = {};
      // Anonymous function to induce scope
      (function () {
        var level = self.levels[i];
        level.img = new Image();
        level.img.onload = function () {
          self.processLevel(level);
          if (++loadedLevels >= config.levels.length) {
            callback();
          }
        };
        level.img.src = require.toUrl(config.levels[i].source);
      })();
    }
  },

  /** Processes a single level image to tileset data and stuff
   * @param level
   */
  processLevel: function (level) {
    var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      image = level.img,
      data,
      x, y, index,
      r, g, b, a;

    canvas.width = image.width;
    canvas.height = image.height;

    level.data = [];

    ctx.drawImage(image, 0, 0);

    data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (x = 0; x < canvas.width; ++x) {
      level.data[x] = [];
      for (y = 0; y < canvas.height; ++y) {
        index = (y * canvas.width + x) * 4;
        r = data[index];
        g = data[++index];
        b = data[++index];
        a = data[++index];

        level.data[x][y] = this.tileFromColor(r, g, b, a);
      }
    }
  },

  /** Get tile type based on the RGBa value of a pixel */
  tileFromColor: function (r, g, b, a) {
    if( a == 0 ) { // Nothing
      return "";
    }

    if( r == 0 && g == 0 && b == 0 ) { // Wall
      return "wall";
    }

    if( r == 0 && g == 255 && b == 0 ) { // Ladders
      return "ladders";
    }

    if( r == 0 && g == 0 && b == 255 ) { // Coin
      return "coin";
    }

    if( r == 255 && g == 0 && b == 0 ) { // Start point
      return "start";
    }

    if( r == 128 && g == 128 && b == 128 ) { // Crumbling wall
      return "crumblingwall";
      // return "wall";
    }

    if( r == 0 && g == 255 && b == 255 ) { // End
      return "end";
    }

    return "";
  }
}

// Expose the `Map` class as a member in `definition` member
return {definition: Map};
});