// Let's try to load something
require(["require", "jquery", "game", "config", "lib/kinetic-v3.9.0"], function (require, $, game, config) {
  // Start running things after the DOM is ready
  $(document).ready(function () {
    // Initialize variables
    var Game,
      // Init Kinetic Stage
      stage = new Kinetic.Stage({
        container: 'canvascontainer',
        width: config.canvasWidth,
        height: config.canvasHeight
      }),
      // --  Create the layers we need  --
      // background layer, under everything
      bgLayer = new Kinetic.Layer({name: 'background'}),
      // static layer, from where stuff can be moved to the next layer if
      // a need for animation comes
      staticLayer = new Kinetic.Layer({name: 'static'}),
      // animation layer, this is where animations, which still are below
      // objects, reside
      animLayer = new Kinetic.Layer({name: 'animation'}),
      // object layer, this is where the player and other objects are
      objLayer = new Kinetic.Layer({name: 'object'}),
      // overAnimation layer, this is where the animations, which are drawn over
      // the objects, reside
      overAnimLayer = new Kinetic.Layer({name: 'overAnimation'}),
      // overStatic layer, this is where static stuff, that are drawn over the
      // objects, reside. If something that is here needs to be animated, it is
      // moved to the overAnimation layer
      overStaticLayer = new Kinetic.Layer({name: 'overStatic'}),
      // and finally, the HUD (Heads Up Display), which gets drawn over
      // everything in the game. This is where scores etc. are. This layer is
      // always fixed at the same position, relative to the whole canvas itself.
      hudLayer = new Kinetic.Layer({name: 'hud'});

    // Don't allow canvas's to be selected like regular text
    bgLayer.getCanvas().onselectstart = function () { return false; }
    staticLayer.getCanvas().onselectstart = function () { return false; }
    animLayer.getCanvas().onselectstart = function () { return false; }
    objLayer.getCanvas().onselectstart = function () { return false; }
    overAnimLayer.getCanvas().onselectstart = function () { return false; }
    overStaticLayer.getCanvas().onselectstart = function () { return false; }
    hudLayer.getCanvas().onselectstart = function () { return false; }

    // Now let's add the layers, in the correct order, to the stage
    stage.add(bgLayer);
    stage.add(staticLayer);
    stage.add(animLayer);
    stage.add(objLayer);
    stage.add(overAnimLayer);
    stage.add(overStaticLayer);
    stage.add(hudLayer);

    // Create a new game
    Game = new game.Game(stage, config);

    // Start the game. From now on, everything is handled within the game.js
    Game.init();
  });
});
