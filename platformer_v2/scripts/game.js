/**
 * General game logic, loads more stuff as necessary.
 */

// When this definition is called, jQuery (or $), Kinetic and debug is defined.
define(function GameDefine() {
  /** @constructor */
  var Game = function Game(stage) {
    this.stage = stage;
  }

  /** Initializing function */
  Game.prototype.init = function () {
    debug.groupCollapsed('Init');
    debug.info('Hello, world!');
    debug.debug($);
    debug.debug(Kinetic);
    debug.debug(this.stage);
    debug.groupEnd();
  }
  
  return {"Game": Game};
});