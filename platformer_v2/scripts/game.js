/**
 * General game logic, loads more stuff as necessary.
 */

// When this definition is called, jQuery (or $), Kinetic and debug is defined.
define(["require"], function GameDefine(require) {

/** @constructor */
var Game = function Game(stage, config) {
  /** KineticJS Stage */
  this.stage = stage;
  /** Config, @see config.js */
  this.config = config;
  /** Sprites */
  this.sprites = {};
};

/** Initializing function */
Game.prototype.init = function () {
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
  this.loadMedia(function () {
    // Create and draw the sprites after media is loaded
    self.drawSprites();
  });
};

/** Loads media and draws some sort of loading bar (TODO: The loading bar ;D) */
Game.prototype.loadMedia = function (callback) {
  // Load media.json from ../media/media.json
  var url = require.toUrl('../media/media.json');
  $.ajax(url, {
    dataType: 'json',
    error: function (jqXHR, textStatus, errorThrown) {
      debug.error('Failed to fetch ' + url);
      debug.group('error arguments');
      debug.dir(jqXHR);
      debug.log(textStatus);
      debug.log(errorThrown);
      debug.groupEnd();
    },
    success: function (data, textStatus) {
      debug.info('Fetched media.json: ' + textStatus);
      debug.dir(data);
    }
  });
};

/** Draws the sprites */
Game.prototype.drawSprites = function () {

};

// Expose the `Game` function in an object, in "Game" field
return {"Game": Game};

});