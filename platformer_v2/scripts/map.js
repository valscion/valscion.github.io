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
  /** Current level number, zero-indexed */
  this.currentLevel = 1;
  /** Tile images */
  this.tiles = {};
  /** Map shape */
  this.shape;
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

    // Set the map tile sprites
    this.tiles[this.game.config.tiles["wall"]] = this.game.sprites["wall"].img;
    this.tiles[this.game.config.tiles["crumblingwall"]] = this.game.sprites["wall"].img;
    this.tiles[this.game.config.tiles["ladders"]] = this.game.sprites["ladders"].img;
    this.tiles[this.game.config.tiles["coin"]] = this.game.sprites["coin"].img;
    this.tiles[this.game.config.tiles["start"]] = this.game.sprites["coin"].img;
    this.tiles[this.game.config.tiles["end"]] = this.game.sprites["coin"].img;


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

        // Save the name, too
        level.name = config.levels[i].name;
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
      width = image.width,
      height = image.height,
      data,
      x, y, index,
      r, g, b, a,
      buffer, uint8View;

    canvas.width = width;
    canvas.height = height;

    level.data = [];

    ctx.drawImage(image, 0, 0);

    data = ctx.getImageData(0, 0, width, height).data;

    // Go through the image and create a nice array from all the pixels
    for (x = 0; x < width; ++x) {
      level.data[x] = [];
      for (y = 0; y < height; ++y) {
        index = (y * width + x) * 4;
        r = data[index];
        g = data[++index];
        b = data[++index];
        a = data[++index];

        level.data[x][y] = this.tileFromColor(r, g, b, a);
      }
    }

    // Create an 8-bit array from all the types of walls
    buffer = new ArrayBuffer(width * height);
    uint8View = new Uint8Array(buffer);
    for (var y = 0; y < height; ++y) {
      for (var x = 0; x < width; ++x) {
        var index = y * width + x;
        uint8View[index] = level.data[x][y];
      }
    }
    level.data = uint8View;

    // Save level width and height
    level.width = width;
    level.height = height;

    // Process the map to an image
    this.createImage(level);
  },

  /** Get tile type based on the RGBa value of a pixel */
  tileFromColor: function (r, g, b, a) {
    var tileTypes = this.game.config.tiles;

    if( a == 0 ) { // Nothing
      return tileTypes[""];
    }

    if( r == 0 && g == 0 && b == 0 ) { // Wall
      return tileTypes["wall"];
    }

    if( r == 0 && g == 255 && b == 0 ) { // Ladders
      return tileTypes["ladders"];
    }

    if( r == 0 && g == 0 && b == 255 ) { // Coin
      return tileTypes["coin"];
    }

    if( r == 255 && g == 0 && b == 0 ) { // Start point
      return tileTypes["start"];
    }

    if( r == 128 && g == 128 && b == 128 ) { // Crumbling wall
      return tileTypes["crumblingwall"];
    }

    if( r == 0 && g == 255 && b == 255 ) { // End
      return tileTypes["end"];
    }

    return tileTypes[""];
  },

  /** Gets a tile from given coordinates */
  getTile: function (x, y) {
    var level = this.levels[this.currentLevel],
      index = y * level.width + x;

    if (index > (level.width * level.height)) {
      debug.warn('Trying to get tile from outside the range! ('+x+', '+y+')');
      return 0;
    }

    return level[index] || 0;
  },

  /** Creates the static bits of map as an image */
  createImage: function (level) {
    var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      tileWidth = 16,
      tileHeight = 24,
      tileType,
      newImg = new Image(),
      x, y;

    canvas.width = tileWidth * level.width;
    canvas.height = tileHeight * level.height;

    for (x = 0; x < level.width; x++) {
      for (y = 0; y < level.height; y++) {
        tileType = level.data[y * level.width + x];
        if (!tileType) {
          continue;
        }
        //debug.log("Calling ctx.drawImage with x: " + x + " and y: " + y);
        ctx.drawImage(
          this.tiles[tileType],
          x * 16,
          y * 24,
          16,
          24
        );
      }
    }

    level.image = new Image();
    level.image.src = canvas.toDataURL();
  },

  /** Adds the map to the static layer and draws it. Call only once per map! */
  draw: function () {
    var staticLayer = this.game.stage.getChild('static'),
      level = this.levels[this.currentLevel];

    this.shape = new Kinetic.Image({
      image: level.image,
      width: 600,
      height: 400,
      x: 0,
      y: 0
    });

    staticLayer.add(this.shape);

    staticLayer.draw();
  }
}

// Expose the `Map` class as a member in `definition` member
return {definition: Map};
});