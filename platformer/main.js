/**
 * Author: Vesa "VesQ" Laakso
 */

// Path to scripts folder is set via variable 'scripts_root'
// var scripts_root = "http://www.example.com/scripts/platformer/"


// Information about screen
var scr = {
  w : 640,            // Canvas width
  h : 480,            // --||-- height
  x : 0,              // Calculated when camera is moved
  y : 0,              // --||--
  fullscreen : false, // Is fullscreen mode toggled
  normalw : 0,        // Save normal canvas width
  normalh : 0         // and height when going to fullscr mode
}

// Information about camera
var camera = {
  x : 0,
  y : 0,
  border : 20   // How far away from the border of the canvas we may go
                // with our player before camera is moved
}

// Store information about player
var plr = {
  x : 0,            // -- Player x-coordinate
  y : 0,            // -- Player y-coordinate
  speed : 196,      // Movement, pixels per second
  w : 16,           // Player width
  h: 24,            // Player height
  anim : "stance",  // Current player animation
  frame : 0.0,      // What frame are we currently running in the animation (will be rounded)
  midair : true,    // Is the player currently mid-air (so that gravity affects)
  climbing : 0,     // Is the player currently climbing in ladders.
                    // 0 = not, 1 = yes, 2 = yes and moves horizontally
  safex : 0,        // -- Last player x-coordinate where there was no collision
  safey : 0,        // -- Last player y-coordinate where there was no collision
  weight : 70,      // Player weight in kg
  yPlus : 0,        // Gravity acceleration
  jumpPower : 25000 // Jump power in newtons
}

// Store objects that have gravity.
// Every object that gravity affects must have the following fields:
//  * y:        (float) y-coordinate
//  * yPlus:    (float) current acceleration in the vertical axis
//  * weight:   (float/int) weight in kg
//  * midair:   (boolean) sets the object to be mid-air and receive gravity updates
var gravObj = {};
function setGravity( key, obj, startYPlus ) {
  gravObj[key] = obj;
  if( typeof startYPlus === 'number' ) {
    obj.yPlus = startYPlus;
  }
}
function unsetGravity( key ) {
  if( key in gravObj ) {
    gravObj[key].yPlus = 0;
    delete gravObj[key];
  }
}

// Store information about tiles on sides and under the player
var tiles = {
  left : null,
  right : null,
  above : null,
  below : null,
  under : null
}

// Object to fit all sprites in
var sprites = {
  stance : null,
  runright : null,
  runleft : null,
  jumpright : null,
  jumpleft : null,
  climb : null,
  walls : null,
  ladders : null,
  coin : null,
  end : null
}
var spritesLoaded = 0;        // Amount of sprites already loaded
var allSpritesLoaded = false; // Are all sprites loaded

// Object to fit all levels in
var levels = {
  current : 0,
  "1" : {
    dataImg : null,
    tileMap : null,
    w : null,
    h : null,
    parTime : 60,     // How many seconds is counted as no negative points
    coins : 0         // How many coins are there in the level
  }
}
var levelsLoaded = 0;
var allLevelsLoaded = false;
var levelsAmount = 1;

// Game related variables
var game = {
  points : 0,         // How many points does the player have
  startTime : 0,      // When did the level start
  timePassed : 0,     // How much time has passed since starting the level
  coinsLeft : 0,      // How many coins are left
  tileMap : null      // Current tilemap
}

// Object for drawing stuff as debug info
var debugObj = {}
var DEBUG = false;

// Constant for gravity
var GRAVITY = 800;

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = scr.w;
canvas.height = scr.h;
$("#canvascontainer")[0].appendChild(canvas);

// Set an ID for the main canvas
$("#canvascontainer canvas").attr("id", "maincanvas");

// Set canvas' containers width and height
$("#canvascontainer").css( 'width', scr.w );
$("#canvascontainer").css( 'height', scr.h );

// Set canvas' containers background color to black
$("#canvascontainer").css( 'backgroundColor', '#000000' );

// ...and box-shadow to '0 0 15px 10px #AAAAAA;'
$("#canvascontainer").css( 'boxShadow', '0 0 15px 10px #AAAAAA' );

// Create temporary canvas for modifying images and such
var tmpCanvas = document.createElement("canvas");
var tmpCtx = tmpCanvas.getContext("2d");

// Load the sprites, one part is 16x24
function loadSprites() {
  // Stance
  loadSingleSprite( "stance", "images/stance.png" );

  // Run right
  loadSingleSprite( "runright", "images/run_right.png" );

  // Run left
  loadSingleSprite( "runleft", "images/run_left.png" );

  // Jump right
  loadSingleSprite( "jumpright", "images/jump_right.png" );

  // Jump left
  loadSingleSprite( "jumpleft", "images/jump_left.png" );

  // Climbing
  loadSingleSprite( "climb", "images/climb.png" );

  // Walls
  loadSingleSprite( "walls", "images/walls.png" );

  // Ladders
  loadSingleSprite( "ladders", "images/ladders.png" );

  // Coin
  loadSingleSprite( "coin", "images/coin.png" );

  // End
  loadSingleSprite( "end", "images/end.png" );
}

// Load one sprite
function loadSingleSprite( spriteName, fileName ) {
  sprites[spriteName] = new Image();
  sprites[spriteName].onload = function() {
    if( ++spritesLoaded === Object.keys(sprites).length ) {
      allSpritesLoaded = true;
    }
  }
  sprites[spriteName].src = scripts_root + fileName;
}

// Load the levels
function loadLevels() {
  levels["1"].dataImg = new Image();
    levels["1"].dataImg.onload = function() {
      if( ++levelsLoaded == levelsAmount ) {
        allLevelsLoaded = true;
      }
    }
  levels["1"].dataImg.src = scripts_root + "images/levels/1/data.png";
}

// Draw player
function drawPlayer() {
  // Check whether all sprites are loaded
  if( allSpritesLoaded != true ) {
    return false;
  }

  var frame = Math.round( plr.frame );
  switch( plr.anim ) {
    case "runright":
      ctx.drawImage( sprites.runright, frame*16, 0, 16, 24, plr.x, plr.y, 16, 24 );
      break;
    case "runleft":
      ctx.drawImage( sprites.runleft, frame*16, 0, 16, 24, plr.x, plr.y, 16, 24 );
      break;
    case "jumpright":
      ctx.drawImage( sprites.runright, 0, 0, 16, 24, plr.x, plr.y, 16, 24 );
      break;
    case "jumpleft":
      ctx.drawImage( sprites.runleft, 0, 0, 16, 24, plr.x, plr.y, 16, 24 );
      break;
    case "climb":
      ctx.drawImage( sprites.climb, frame*16, 0, 16, 24, plr.x, plr.y, 16, 24 );
      break;
    case "stance":
      ctx.drawImage( sprites.stance, 0, 0, 16, 24, plr.x, plr.y, 16, 24 );
      break;
    default:
      ctx.drawImage( sprites.stance, 0, 0, 16, 24, plr.x, plr.y, 16, 24 );
      return false;
  }
  return true;
}


// Handle keyboard controls
var keysDown = {};
var preventKeyDefaults = true;

$(window.top.document).keydown( function (e) {
  keysDown[e.keyCode] = true;
  if( e.keyCode != 122 && e.keyCode != 116 && preventKeyDefaults ) {
    // Don't prevent fullscr mode or refresh
    return false;
  }
  return true;
});

$(window.top.document).keyup( function (e) {
  if( e.keyCode in keysDown ) {
    delete keysDown[e.keyCode];
  }
  if( e.keyCode != 122 && preventKeyDefaults ) {
    // Don't prevent fullscr mode
    return false;
  }
  return true;
});

// Handle mouse clicking
var mouseClicked = false;
$(window.top.document).click( function(e) {
  //e.preventDefault();
  mouseClicked = true;
});

// Creating a new animation timer and appending it to the animTimers-object
function createAnimTimer( key, speed, maxValue, destroy ) {
  animTimers[key] = {};

  var tmpSpeed = maxValue / speed;
  var tmpDestroy = ( typeof destroy === "boolean" ) ? (destroy?1:0) : 0;

  animTimers[key].toggled = false;       // Is timer toggled
  animTimers[key].value = 0.0;           // Current value of the timer (from 0.0 to maxValue)
  animTimers[key].speed = tmpSpeed;      // How fast does timer go from 0.0 to maxValue in seconds
  animTimers[key].maxValue = maxValue    // Highest possible value. After this, reset value to 0.0
  animTimers[key].destroy = tmpDestroy;  // Should the timer be deleted after reaching maxValue
}
var animTimers = {};

// Creating a new flash that oscillates
function createFlash( key, speed ) {
  flashes[key] = {};

  flashes[key].value = 0.0;           // Current value of the timer (from 0.0 to 1.0)
  flashes[key].toggled = false;       // Is timer toggled
  flashes[key].running = false;       // Is the timer running
  flashes[key].speed = speed;         // How fast does timer go from 0.0 to 1.0 in seconds
  flashes[key].mod = 1;               // Are we going higher or lower (only used if oscillating)
}
var flashes = {};


// Render all stuff to screen
function render() {

  // Clear the screen
  ctx.clearRect(-camera.x,-camera.y,scr.w,scr.h);

  // Draw the level
  drawCurrentLevel();

  /* // Draw some text
  // ...add some flash
  var tmp = Math.round( 64.0 + animTimers.maintext.value * 191 );
  ctx.fillStyle = "rgb("+tmp+","+tmp+","+tmp+")";
  ctx.font = "24px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  var tmp = Math.round( 64.0 + animTimers.maintext.value * 191 );
  ctx.fillText("Hei, maailma!", 0, 0);
  */

  // Draw the amount of coins remaining
  ctx.fillStyle = "rgb(255,255,255)";
  ctx.font = "16px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top"
  ctx.fillText( "Coins remaining: " + game.coinsLeft, scr.x + 16, scr.y + 24 );
  ctx.fillText( "Time passed: " + Math.floor( game.timePassed / 1000 ), scr.x+16, scr.y+40 );

  // Draw some debug-info
  if( DEBUG ) {
    debugObj["plr.midair"] = plr.midair;
    debugObj["plr.climbing"] = plr.climbing;
    debugObj["plr.x:"] = plr.x;
    debugObj["plr.y:"] = plr.y;
    debugObj["camera.x:"] = camera.x;
    debugObj["camera.y:"] = camera.y;
    debugObj["Under tile:"] = getTilesAsString("under");
    debugObj["Left tile:"] = getTilesAsString("left");
    debugObj["Right tile:"] = getTilesAsString("right");
    debugObj["Above tile:"] = getTilesAsString("above");
    debugObj["Below tile:"] = getTilesAsString("below");

    drawDebug( scr.x + scr.w-150, scr.y+24 );
  }
  // Draw the dude
  drawPlayer();
}

// Draw debug info
function drawDebug( x, startY ) {
  ctx.fillStyle = "rgb(255,255,0)";
  ctx.font = "12px Helvetica";
  ctx.textBaseline = "top";
  var i = 0;
  for( o in debugObj ) {
    ctx.textAlign = "right";
    ctx.fillText( o, x, startY + i );
    ctx.textAlign = "left";
    ctx.fillText( debugObj[o], x+10, startY + i );
    i += 14;
  }

  // Clear the debug object after drawing
  for( o in debugObj ) {
    delete debugObj[o];
  }
}

// Main update function for doing stuff according to delta-time
function update( modifier ) {
  // Update flashes
  for( f in flashes ) {
    var flash = flashes[f];
    if( flash.toggled ) {
      flash.running = true;
      flash.value += modifier * flash.mod * flash.speed;
      if( flash.value > 1.0 ) { flash.value = 1.0; flash.mod = -1; }
      if( flash.value < 0.0 ) { flash.value = 0.0; flash.mod = 1; }
    }
    else if( flash.running ) {
      flash.mod = 1;
      flash.value -= modifier * flash.speed;
      if( flash.value < 0.0 ) {
        flash.value = 0.0;
        flash.running = false;
      }
    }
    else {
      flash.value = 0.0;
    }
  }

  // Update animation timers
  for( a in animTimers ) {
    var anim = animTimers[a];
    if( anim.toggled ) {
      anim.value += modifier * anim.speed;
      if( anim.value > anim.maxValue ) {
        if( anim.destroy > 0 ) {
          anim.destroy = 2;
          anim.value = anim.maxValue;
        }
        else {
          anim.value = 0.0;
        }
      }
    }
  }

  // Check if we finished the game!
  if( game.coinsLeft <= 0 && "end" in tiles.under ) {
    alert("Congratulations!\nYou beat the game!\nIt took you " + Math.floor( game.timePassed / 1000 ) + " seconds.");
    forceExit = true;
    return true;
  }

  if( 16 in keysDown && 68 in keysDown ) { // -- Shift + [D] --
    // Toggle debug
    DEBUG = !DEBUG;
    log('DEBUG toggled to ' + DEBUG);
    delete keysDown[68];
  }

  // Update keys that control player
  updatePlayerControls( modifier );


  if( !plr.climbing ) {
    // Check whether we are on anything solid and if not, we're mid-air.
    if( !inTile("below","solid")
         && ( !("ladders" in tiles.below) || ("ladders" in tiles.under) ) )
    {
      plr.midair = true;
    }
  }

  // Check frame limits
  if( plr.anim == "runleft" || plr.anim == "runright" ) {
    if( plr.frame > 15 ) { plr.frame = 0.0; }
  }
  else if ( plr.anim == "climb" ) {
    if( plr.frame < 0 ) { plr.frame = 5; }
    else if ( plr.frame > 5.0 ) { plr.frame = 0.0; }
  }

  // Check collisions with map
  var hitDirections = checkMapCollisions();
  if(DEBUG) debugObj["Hit wall"] = false;
  if( Object.keys(hitDirections).length > 0 ) {
    if(DEBUG) debugObj["Hit wall"] = getObjectAsString( hitDirections );
    if ( "above" in hitDirections && plr.yPlus > 0 ) {
      // We hit the ceiling so stop going up
      plr.yPlus = 0.0;
    }
  }

  // Move the player arbitrary with IJKL
  if(DEBUG) {
    if( (73 in keysDown)||(74 in keysDown)||(75 in keysDown)||(76 in keysDown) ) {
      plr.x = plr.safex += ( ( 76 in keysDown ) - ( 74 in keysDown ) ); // [L] - [J]
      plr.y = plr.safey += ( ( 75 in keysDown ) - ( 73 in keysDown ) ); // [K] - [I]
    }
  }

  // Update screen/canvas width and height
  updateScreenDimensions();

  // Update camera movement et cetera
  updateCamera();

  // Update passed time
  game.timePassed = Date.now() - game.startTime;

  // Position the canvas according to camera.x and camera.y
  ctx.restore();
  ctx.save();
  ctx.translate( Math.round( camera.x ), Math.round( camera.y ) );

  // Calcute screen coordinates, so we can glue stuff to it.
  scr.x = -Math.round( camera.x );
  scr.y = -Math.round( camera.y );
}

// Update keys that control player
function updatePlayerControls( modifier ) {

  var xMove = 0;
  var yMove = 0;

  // Running can only happen when player isn't climbing
  if ( plr.climbing == 0 ) {
    // Controlling left/right movement
    if (37 in keysDown) { // -- Left arrow --
      xMove -= plr.speed * modifier;
      // Only play animation if we are not mid-air
      if( !plr.midair ) {
        plr.anim = "runleft";
        plr.frame += plr.speed * modifier / 8;
      }
      else {
        plr.anim = "jumpleft"
      }
    }
    else if (39 in keysDown) { // -- Right arrow --
      xMove += plr.speed * modifier;
      if( !plr.midair ) {
        plr.anim = "runright";
        plr.frame += plr.speed * modifier / 8;
      }
      else {
        plr.anim = "jumpright"
      }
    }
    else if ( !plr.midair ) {
      // If player isn't moving nor mid-air, play stance animation.
      plr.anim = "stance";
      // Also reset running frame.
      plr.frame = 0.0
    }
  }
  else {
    // If the player is climbing, we may move horizontally, but slower than normal
    // If we move horizontally to a place where there's no ladders, unclimb.

    if (37 in keysDown) { // -- Left arrow --
      if( !(("ladders" in tiles.left) || ("wall" in tiles.left)) ) {
        if( !((38 in keysDown) || (40 in keysDown)) ) {
          // We release our grip from the ladders if there's no ladders or wall to the left
          // of the player nor are we pressing up/down arrow keys.
          plr.climbing = 0;
          plr.midair = true;
          plr.anim = "jumpleft"
          plr.frame = 0.0;
        }
      }
      else {
        // We move horizontally on the ladders
        xMove -= plr.speed * modifier / 2;
        plr.climbing = true;
      }
    }
    else if (39 in keysDown) { // -- Right arrow --
      if( !(("ladders" in tiles.right) || ("wall" in tiles.right)) ) {
        if( !((38 in keysDown) || (40 in keysDown)) ) {
          // We release our grip from the ladders if there's no ladders or wall to the right
          // of the player nor are we pressing up/down arrow keys.
          plr.climbing = false;
          plr.midair = true;
          plr.anim = "jumpright"
          plr.frame = 0.0;
        }
      }
      else {
        // We move horizontally on the ladders
        xMove += plr.speed * modifier / 2;
        plr.climbing = true;
      }
    }
  }

  // Controlling climbing ladders
  if (38 in keysDown) { // -- Up arrow --
    // Climb down the ladders

    // If we weren't climbing before, check are we under ladders
    // and if so, reset framecounter and set player climbing.
    if ( !plr.climbing ) {
      if ( "ladders" in tiles.under ) {
        // Center the player to the ladders horizontally
        if ( (tiles.under.ladders & 3) && (tiles.under.ladders & 12) ) {
          // Ceil X and Floor X, C? and F?
          if(DEBUG) {
            log("Centered player to ladders with: Math.round( "+ plr.x / 16 +" ) * 16 ");
            log("  Used math.round because tiles.under.ladders == " + tiles.under.ladders);
          }
          plr.x = Math.round( plr.x / 16 ) * 16;
          xMove = 0;
        }
        else if ( tiles.under.ladders & 3 ) {
          // Ceil X, C?
          if(DEBUG) {
            log("Centered player to ladders with: Math.ceil( "+ plr.x / 16 +" ) * 16 ");
            log("  Used math.ceil because tiles.under.ladders == " + tiles.under.ladders);
          }
          plr.x = Math.ceil( plr.x / 16 ) * 16;
          xMove = 0;
        }
        else if ( tiles.under.ladders & 12 ) {
          // Floor X, F?
          if(DEBUG) {
            log("Centered player to ladders with: Math.floor( "+ plr.x / 16 +" ) * 16 ");
            log("  Used math.floor because tiles.under.ladders == " + tiles.under.ladders);
          }
          plr.x = Math.floor( plr.x / 16 ) * 16;
          xMove = 0;
        }
        plr.climbing = true;
        plr.frame = 0;
        plr.anim = "climb";
      }
    }
    else {
      // We were climbing so animate the player and move it, if we are on ladders.
      if( "ladders" in tiles.under ) {
        plr.frame += plr.speed * modifier / 12;
        yMove -= plr.speed/2 * modifier;
      }
      else {
        // We moved off the ladders, so position the player directly above them.
        plr.y = Math.floor( (plr.y+1) / 24 ) * 24;
        plr.frame = 0;
        plr.climbing = false;
        yMove = 0;
      }
    }
  }
  else if (40 in keysDown) { // -- Down arrow --
    if( !plr.climbing ) {
      if ( "ladders" in tiles.under || "ladders" in tiles.below ) {
        // Center the player to the ladders horizontally
        var tileObj = null;
        if( "ladders" in tiles.below ) tileObj = tiles.below;
        else tileObj = tiles.under;
        if ( (tileObj.ladders & 3) && (tileObj.ladders & 12) ) {
          // Ceil X and Floor X, C? and F?
          if(DEBUG) {
            log("Centered player to ladders with: Math.round( "+ plr.x / 16 +" ) * 16 ");
            log("  Used math.round because tileObj.ladders == " + tileObj.ladders);
          }
          plr.x = Math.round( plr.x / 16 ) * 16;
          xMove = 0;
        }
        else if ( tileObj.ladders & 3 ) {
          // Ceil X, C?
          if(DEBUG) {
            log("Centered player to ladders with: Math.ceil( "+ plr.x / 16 +" ) * 16 ");
            log("  Used math.ceil because tileObj.ladders == " + tileObj.ladders);
          }
          plr.x = Math.ceil( plr.x / 16 ) * 16;
          xMove = 0;
        }
        else if ( tileObj.ladders & 12 ) {
          // Floor X, F?
          if(DEBUG) {
            log("Centered player to ladders with: Math.floor( "+ plr.x / 16 +" ) * 16 ");
            log("  Used math.floor because tileObj.ladders == " + tileObj.ladders);
          }
          plr.x = Math.floor( plr.x / 16 ) * 16;
          xMove = 0;
        }
        plr.climbing = true;
        plr.frame = 0;
        plr.anim = "climb";
      }
    }
    else {
      // We were climbing so animate the player and move it, if we are on ladders.
      if( "ladders" in tiles.under || "ladders" in tiles.below ) {
        plr.frame -= plr.speed * modifier / 12;
        yMove += plr.speed/2 * modifier;
      }
      else {
        plr.frame = 0;
        plr.climbing = false;
        yMove = 0;
      }
    }
  }

  plr.x += xMove;
  plr.y += yMove;

  // If we are climbing, we are not midair.
  if( plr.climbing ) plr.midair = false;

  // JUMP
  if( 90 in keysDown ) { // [Z]
    if( !plr.midair && !plr.climbing && !inTile("above","solid") ) {
      plr.yPlus = plr.jumpPower / plr.weight;
      plr.midair = true;
      // Decide what animation to play
      if( 37 in keysDown ) { // -- Left arrow --
        plr.anim = "jumpleft";
      }
      else if( 39 in keysDown ) { // -- Right arrow --
        plr.anim = "jumpright";
      }
      else {
        // If we're not moving anywhere, play something else than "stance" animation.
        plr.anim = "jumpright";
      }
    }
  }
}

// Update camera movement et cetera
function updateCamera() {

  /* // Don't let the player escape outside the screen!
  if ( plr.x + plr.w + camera.x > scr.w - camera.border ) {
    camera.x = scr.w - camera.border - plr.x - plr.w;
  }
  else if ( plr.x + camera.x < camera.border ) {
    camera.x = camera.border - plr.x;
  }
  if ( plr.y + plr.h + camera.y > scr.h - camera.border ) {
    camera.y = scr.h - camera.border - plr.y - plr.h;
  }
  else if ( plr.y + camera.y < camera.border ) {
    camera.y = camera.border - plr.y;
  }
  */

  // Glue the camera to the player
  camera.x = scr.w/2 - plr.x;
  camera.y = scr.h/2 - plr.y;

  // Camera can't go outside the worlds boundaries. If the world is smaller than
  // the screen, center the camera to the middle of the screen.
  var level = levels[levels.current];

  if( scr.w < level.w*16 ) {
    if ( camera.x > 0 ) camera.x = 0;
    if ( camera.x < scr.w - level.w*16 ) camera.x = scr.w - level.w*16;
  }
  else {
    camera.x = scr.w/2 - level.w*8;
  }
  if( scr.h < level.h*24 ) {
    if ( camera.y > 0 ) camera.y = 0;
    if ( camera.y < scr.h - level.h*24 ) camera.y = scr.h - level.h*24;
  }
  else {
    camera.y = scr.h/2 - level.h*12;
  }
}

// Update screen/canvas width and height
function updateScreenDimensions() {

  // If we want to change the canvas width or height, modify these variables below.
  var newWidth = scr.w;
  var newHeight = scr.h;

  // Check whether we pressed F11. If so, toggle fullscreen!
  if( 122 in keysDown ) {
    delete keysDown[122];
    scr.fullscreen = !scr.fullscreen;
    // Did we just toggle it ON?
    if ( scr.fullscreen ) {
      // Save old dimensions
      scr.normalw = scr.w;
      scr.normalh = scr.h;

      newWidth = screen.width;
      newHeight = screen.height;

      // Pop the canvas out of the normal flow
      $("#canvascontainer").css({
        'border': '0',
        'margin' : '0',
        'position' : 'absolute',
        'left' : '0',
        'top' : '0',
        'background-color': 'black'
      });
      $('*').css({'overflow' : 'hidden'});
    }
    else {
      // Reset old dimensions
      newWidth = scr.normalw;
      newHeight = scr.normalh;

      // Pop the canvas back to its normal position.
      $("#canvascontainer").css({
        'border': '1px solid #777',
        'margin-left': 'auto',
        'margin-right': 'auto',
        'margin-top': '20px',
        'position': 'static',
        'left' : 'auto',
        'top' : 'auto',
        'background-color': 'black'
      });
      $('*').css({'overflow' : 'visible'});
    }
  }
  // Wait for the browser to be in fullscreen before resizing canvas
  if( scr.fullscreen ) {
    var waitStart = Date.now();
    while( screen.availWidth < 1 || screen.availHeight < 1 ) {
      // Wait for max. 2,5s and then forget fullscreen
      if( Date.now() - waitStart > 2500 ) {
        scr.fullscreen = false;

        // Reset old dimensions
        newWidth = scr.normalw;
        newHeight = scr.normalh;

        // Pop the canvas back to its normal position.
        $("canvas").css('position','static');

        alert("fail");

        break;
      }
    }
    if ( scr.fullScreen ) {
      // If the while-loop waited successfully, set new dimensions.
      newWidth = screen.width;
      newHeight = screen.height;
    }
  }

  if ( newWidth != scr.w ) {
    scr.w = newWidth;
    $("#canvascontainer").width( scr.w );
    canvas.width = scr.w;
  }
  if ( newHeight != scr.h ) {
    scr.h = newHeight;
    $("#canvascontainer").height( scr.h );
    canvas.height = scr.h;
  }
}

// Update collisions with map
function checkMapCollisionsOld() {
  if ( !allLevelsLoaded ) {
    return {};
  }

  var level = levels[levels.current];

  var hitDirections = {};


  var leftX = Math.round((plr.x - (plr.w-1)/2) / 16 );
  var rightX = Math.round((plr.x + (plr.w-1)/2) / 16 );
  var aboveY = Math.round((plr.y - plr.h/2) / 24 );
  var belowY = Math.round((plr.y + plr.h/2) / 24 );

  // Check that we won't read over/under tileMap
  if( leftX < 0 || leftX >= level.w
      || rightX < 0 || rightX >= level.w
      || aboveY < 0 || aboveY >= level.h
      || belowY < 0 || belowY >= level.h )
  {
    // Let's just set all directions as if we had hit them.
    hitDirections["below"] = true;
    hitDirections["above"] = true;
    hitDirections["left"] = true;
    hitDirections["right"] = true;
  }
  // If we won't read over/under tileMap, go ahead and check collisions.
  else {
    var checkTile;
    checkTile = game.tileMap[leftX][aboveY];
    if( checkTile == "wall" || checkTile == "crumblingwall" ) {
      // We are hitting a wall from left and above
      if( inTile( "left", "solid" ) ) hitDirections["left"] = true;
      if( inTile( "above", "solid" ) ) hitDirections["above"] = true;

      // If we hit crumblign wall, set its timer on so it will crumble!
      if( checkTile == "crumblingwall" ) {
        animTimers["crumble("+leftX+","+aboveY+")"].toggled = true;
      }
    }
    checkTile = game.tileMap[leftX][belowY];
    if( checkTile == "wall" || checkTile == "crumblingwall" ) {
      // We are hitting a wall from left and below
      if( inTile( "left", "solid" ) ) hitDirections["left"] = true;
      if( inTile( "below", "solid" ) ) hitDirections["below"] = true;

      if( checkTile == "crumblingwall" ) {
        animTimers["crumble("+leftX+","+belowY+")"].toggled = true;
      }
    }
    checkTile = game.tileMap[rightX][aboveY];
    if( checkTile == "wall" || checkTile == "crumblingwall" ) {
      // We are hitting a wall from right and above
      if( inTile( "right", "solid" ) ) hitDirections["right"] = true;
      if( inTile( "above", "solid" ) ) hitDirections["above"] = true;

      if( checkTile == "crumblingwall" ) {
        animTimers["crumble("+rightX+","+aboveY+")"].toggled = true;
      }
    }
    checkTile = game.tileMap[rightX][belowY];
    if( checkTile == "wall" || checkTile == "crumblingwall" ) {
      // We are hitting a wall from right and below
      if( inTile( "right", "solid" ) ) hitDirections["right"] = true;
      if( inTile( "below", "solid" ) ) hitDirections["below"] = true;

      if( checkTile == "crumblingwall" ) {
        animTimers["crumble("+rightX+","+belowY+")"].toggled = true;
      }
    }
  }

  // Only restrict player's horizontal movement if there's collisions on sides
  if( "left" in hitDirections || "right" in hitDirections ) {
    plr.x = plr.safex;
  }
  else {
    plr.safex = plr.x;
  }

  // Only restrict player's vertical movement if there's collisions on above/below
  if( "above" in hitDirections && plr.y < plr.safey ) {
    plr.y = plr.safey;
  }
  else if( "below" in hitDirections && plr.y > plr.safey ) {
    plr.y = plr.safey;
  }
  else {
    plr.safey = plr.y;
  }

  return hitDirections;
}

function checkMapCollisions() {
  if ( !allLevelsLoaded ) {
    return {};
  }

  var level = levels[levels.current];

  var hitDirections = {};

  if( inTile("below", "solid") ) {
    hitDirections["below"] = true;
  }
  if( inTile("above", "solid") ) {
    if( plr.y < plr.safey ) {
      hitDirections["above"] = true;
    }
  }
  if( inTile("right", "solid") ) {
    if( plr.x > plr.safex ) {
      hitDirections["right"] = true;
    }
  }
  if( inTile("left", "solid") ) {
    if( plr.x < plr.safex ) {
      hitDirections["left"] = true;
    }
  }

  // Only restrict player's horizontal movement if there's collisions on sides
  if( "left" in hitDirections && plr.x < plr.safex ) {
    plr.x = plr.safex;
  }
  else if( "right" in hitDirections && plr.x > plr.safex ) {
    plr.x = plr.safex;
  }

  // Only restrict player's vertical movement if there's collisions on above/below
  if( "above" in hitDirections && plr.y < plr.safey ) {
    plr.y = plr.safey;
  }
  else if( "below" in hitDirections ) {
    if( plr.yPlus <= 0 && plr.y >= plr.safey ) {
      plr.y = Math.ceil( plr.safey / 24 ) * 24;
      plr.midair = false;
    }
  }

  plr.safex = plr.x;
  plr.safey = plr.y;

  return hitDirections;
}

// Update gravity on objects that have gravity
function updateGravity( modifier ) {
  for( o in gravObj ) {
    var obj = gravObj[o];
    if( obj.midair ) {
      obj.yPlus -= GRAVITY * modifier;
      obj.y -= obj.yPlus * modifier;
    }
    else {
      obj.yPlus = 0;
    }
  }
}

// Load a level and set it as the current one
function playLevel( level ) {
  if( allLevelsLoaded == false ) { return false; }
  var lvl = null;
  switch( level ) {
    case 1:
    case "1":
      levels.current = 1;
      levels.parTime = 60;
      lvl = "1";
      break;
    default:
      return false;
  }

  if( levels[lvl].tileMap != null ) {
    // We already have a tilemap, so reset level
    for( var x = 0; x < levels[lvl].w; ++x ) {
      for( var y = 0; y < levels[lvl].h; ++y ) {
        tile = levels[lvl].tileMap[x][y];

        // If that was the startpoint, set player coordinates.
        if( tile == "start" ) {
          plr.x = x*16 + plr.w/2;
          plr.y = y*24;
        }
        // If that was a crumbling wall, set it's timer
        else if( tile == "crumblingwall" ) {
          createAnimTimer( "crumble("+x+","+y+")", 1.0, 8.99, true );
        }
        // Or if that was a coin, set it's animation timer
        else if( tile == "coin" ) {
          // Speed is a random value from 0.5 to 1.5
          var speed = Math.floor( Math.random()*11 ) / 10 + 0.5;
          createAnimTimer( "coin("+x+","+y+")", speed, 5.99 );
          animTimers["coin("+x+","+y+")"].toggled = true;
        }
      }
    }
  }
  else {
    // We don't have the tilemap, so we need to create one from the image


    // ------------------------
    // Parse level img
    // ------------------------

    var width = levels[lvl].dataImg.width;
    var height = levels[lvl].dataImg.height;

    tmpCanvas.width = width;
    tmpCanvas.height = height;

    tmpCtx.drawImage( levels[lvl].dataImg, 0, 0 );

    var imageData = tmpCtx.getImageData( 0, 0, width, height );
    var data = imageData.data;

    var tileMap = new Array( width );
    for( var i=0; i<width; ++i ) {
      tileMap[i] = new Array( height );
    }

    var coins = 0;

    var x = 0;
    var y = 0;
    for (var i = 0, n = data.length; i < n; i += 4) {
      var tile = tileFromColor( data[i], data[i+1], data[i+2], data[i+3] );
      tileMap[x][y] = tile;

      // If that was the startpoint, set player coordinates.
      if( tile == "start" ) {
        plr.x = x*16 + plr.w/2;
        plr.y = y*24;
      }
      // If that was a crumbling wall, set it's timer
      else if( tile == "crumblingwall" ) {
        createAnimTimer( "crumble("+x+","+y+")", 1.0, 8.99, true );
      }
      // Or if that was a coin, set it's animation timer and add one to "coins" variable
      else if( tile == "coin" ) {
        // Speed is a random value from 0.5 to 1.5
        var speed = Math.floor( Math.random()*11 ) / 10 + 0.5;
        createAnimTimer( "coin("+x+","+y+")", speed, 5.99 );
        animTimers["coin("+x+","+y+")"].toggled = true;

        ++coins;
      }

      ++x;
      if( x >= width ) {
        x = 0;
        ++y;
      }
    }

    levels[lvl].tileMap = tileMap;
    levels[lvl].w = width;
    levels[lvl].h = height;
    levels[lvl].coins = coins;
  }

  // Update game variables
  game.coinsLeft = levels[lvl].coins;
  game.startTime = Date.now();
  game.timePassed = 0;
  game.tileMap = levels[lvl].tileMap;

  return true;
}

// Draw the current level
function drawCurrentLevel( ) {
  if ( levels.current < 1 ) {
    return false;
  }
  var level = levels[levels.current];

  // Limit those loops to draw only those tiles that are visible

  var x = Math.floor( scr.x / 16 ); if( x < 0 ) x = 0;
  var y = Math.floor( scr.y / 24 ); if( y < 0 ) y = 0;
  var nx = Math.ceil( ( scr.x + scr.w ) / 16 ); if( nx > level.w ) nx = level.w;
  var ny = Math.ceil( ( scr.y + scr.h ) / 24 ); if( ny > level.h ) ny = level.h;

  //var x = 0, y = 0, nx = level.w, ny = level.h;
  while(x < nx ) {
    while( y < ny ) {
      if( game.tileMap[x][y] == "wall" ) {
        ctx.drawImage( sprites.walls, 0, 0, 16, 24, x*16, y*24, 16, 24 );
      }
      else if( game.tileMap[x][y] == "ladders" ) {
        ctx.drawImage( sprites.ladders, 0, 0, 16, 24, x*16, y*24, 16, 24 );
      }
      else if( game.tileMap[x][y] == "coin" ) {
        var coinFrame = Math.floor( animTimers["coin("+x+","+y+")"].value );
        ctx.drawImage( sprites.coin, coinFrame*16, 0, 16, 24, x*16, y*24, 16, 24 );
      }
      else if( game.tileMap[x][y] == "crumblingwall" ) {
        var crumbleTimer = animTimers["crumble("+x+","+y+")"];
        if( crumbleTimer.destroy == 2 ) {
          // We have gone through the timer already, so we need to delete
          // the already-crumbled wall from the tilemap as well as the timer.
          game.tileMap[x][y] = "";
          delete animTimers["crumble("+x+","+y+")"];
        }
        else {
          var crumbleFrame = Math.floor( crumbleTimer.value );
          ctx.drawImage( sprites.walls, crumbleFrame*16, 0, 16, 24, x*16, y*24, 16, 24 );
        }
      }
      else if( game.tileMap[x][y] == "end" ) {
        // Check if we have collected all coins and show the correct frame based on it
        if( game.coinsLeft > 0 ) {
          ctx.drawImage( sprites.end, 0, 0, 16, 24, x*16, y*24, 16, 24 );
        }
        else {
          ctx.drawImage( sprites.end, 16, 0, 16, 24, x*16, y*24, 16, 24 );
        }
      }
      ++y;
    }
    ++x;
    y = 0;
  }
}

// Get tile type based on the RGBa value of a pixel
function tileFromColor( r, g, b, a ) {
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

// Update nearby tiles and set the info to tiles-object
// Also pick coins
function updateNearbyTiles() {
  if ( !allLevelsLoaded ) {
    return "";
  }
  var tileCeilX = Math.ceil( ( plr.x-1 ) / 16 );
  var tileFloorX = Math.floor( ( plr.x+1 ) / 16 );
  var tileCeilY = Math.ceil( ( plr.y-1 ) / 24 );
  var tileFloorY = Math.floor( ( plr.y+1 ) / 24 );

  /*
  debugObj["tileCeilX"] = tileCeilX;
  debugObj["tileFloorX"] = tileFloorX;
  debugObj["tileCeilY"] = tileCeilY;
  debugObj["tileFloorY"] = tileFloorY;
  */

  // Reset tiles
  for( t in tiles ) {
    delete tiles[t];
  }
  tiles.under = {};
  tiles.left = {};
  tiles.right = {};
  tiles.above = {};
  tiles.below = {};

  tiles.under[game.tileMap[tileCeilX][tileCeilY]] |= 1;
  tiles.under[game.tileMap[tileCeilX][tileFloorY]] |= 2;
  tiles.under[game.tileMap[tileFloorX][tileCeilY]] |= 4;
  tiles.under[game.tileMap[tileFloorX][tileFloorY]] |= 8;

  if( "coin" in tiles.under ) {
    if( game.tileMap[tileCeilX][tileCeilY] == "coin"  ) {
      --game.coinsLeft;
      game.tileMap[tileCeilX][tileCeilY] = "";
      delete animTimers["coin("+tileCeilX+","+tileCeilY+")"];
    }
    if( game.tileMap[tileCeilX][tileFloorY] == "coin" ) {
      --game.coinsLeft;
      game.tileMap[tileCeilX][tileFloorY] = "";
      delete animTimers["coin("+tileCeilX+","+tileFloorY+")"];
    }
    if( game.tileMap[tileFloorX][tileCeilY] == "coin" ) {
      --game.coinsLeft;
      game.tileMap[tileFloorX][tileCeilY] = "";
      delete animTimers["coin("+tileFloorX+","+tileCeilY+")"];
    }
    if( game.tileMap[tileFloorX][tileFloorY] == "coin" ) {
      --game.coinsLeft;
      game.tileMap[tileFloorX][tileFloorY] = "";
      delete animTimers["coin("+tileFloorX+","+tileFloorY+")"];
    }
  }

  if( tileCeilX > 0 ) {
    tiles.left[game.tileMap[tileCeilX-1][tileCeilY]] |= 4;
    tiles.left[game.tileMap[tileCeilX-1][tileFloorY]] |= 8;
  } else {
    tiles.left["wall"] |= 4;
    tiles.left["wall"] |= 8;
  }

  if( tileFloorX < levels[levels.current].w ) {
    tiles.right[game.tileMap[tileFloorX+1][tileCeilY]] |= 1;
    tiles.right[game.tileMap[tileFloorX+1][tileFloorY]] |= 2;
  } else {
    tiles.right["wall"] |= 1;
    tiles.right["wall"] |= 2;
  }

  if( tileCeilY > 0 ) {
    tiles.above[game.tileMap[tileCeilX][tileCeilY-1]] |= 2;
    tiles.above[game.tileMap[tileFloorX][tileCeilY-1]] |= 8;
  } else {
    tiles.above["wall"] |= 2;
    tiles.above["wall"] |= 8;
  }

  if( tileFloorY < levels[levels.current].h ) {
    tiles.below[game.tileMap[tileCeilX][tileFloorY+1]] |= 1;
    tiles.below[game.tileMap[tileFloorX][tileFloorY+1]] |= 4;
    if( plr.yPlus >= 0 && "crumblingwall" in tiles.below ) {
      if( tiles.below.crumblingwall & 1 ) {
        animTimers["crumble("+tileCeilX+","+(tileFloorY+1)+")"].toggled = true;
      }
      if( tiles.below.crumblingwall & 4 ) {
        animTimers["crumble("+tileFloorX+","+(tileFloorY+1)+")"].toggled = true;
      }
    }
  } else {
    tiles.below["wall"] |= 1;
    tiles.below["wall"] |= 4;
  }
}

// Check if some sort of tile is in a specific direction
// Example: check if there's ladders below the player:
//    inTile( "below", "ladders" );
// Example2: check if there's a solid block right to the player:
//    inTile( "right", "solid" );
function inTile( direction, tileType ) {
  switch( tileType ) {
    case "solid":
      return ( ("wall" in tiles[direction]) || ("crumblingwall" in tiles[direction]) );
    default:
      return ( tileType in tiles[direction] );
  }
}

// Returns the tiles in certain direction as a string. Useful for debugging.
function getTilesAsString( direction ) {
  var ret = "";
  for( o in tiles[direction] ) {
    if( o != "" ) {
      var pos = "";
      var bitmask = tiles[direction][o];
      if( bitmask & 1 ) pos += "CC";
      if( bitmask & 2 ) pos += "CF";
      if( bitmask & 4 ) pos += "FC";
      if( bitmask & 8 ) pos += "FF";

      ret += pos + ":" + o;
    }
  }
  return ret;
}

// Gets any objects prop+values as a string
function getObjectAsString( obj ) {
  var ret = "";
  for( o in obj ) {
    ret += o+":" + obj[o] + " ";
  }
  return ret;
}

// Reset
function reset() {
  // Delete flashes
  for( f in flashes ) {
    delete flashes[f];
  }

  // Delete animTimers
  for( a in animTimers ) {
    delete animTimers[a];
  }

  // Reset nearby tiles
  for( t in tiles ) {
    delete tiles[t];
  }
  tiles.under = {};
  tiles.left = {};
  tiles.right = {};
  tiles.above = {};
  tiles.below = {};

  // Reset game variables
  game.points = 0;
  game.startTime = 0;
  game.timePassed = 0;
  game.coinsLeft = 0;

  // Unset gravitys
  for ( g in gravObj ) {
    unsetGravity(g);
  }

  // Set gravity for player
  setGravity( "player", plr );
}

// Reset level
function resetLevel() {
  // First reset the game
  reset();

  // Then load the current level again
  playLevel( levels.current );
}

// Main loop
var forceExit = false;
var main = function () {
  if( 19 in keysDown || forceExit == true ) { // -- Pause/break --
    // Emergency stop. Need to refresh page to start the script again.
    // Disable key-prevention, too.
    log("!!! Emergency stop !!!");
    preventKeyDefaults = false;
    clearInterval( mainInterval );
    return false;
  }

  var now = Date.now();
  var delta = now - then;

  if( levels.current != 1 ) {
    playLevel( 1 );
  } else {
    updateNearbyTiles();
    update( delta / 1000 );
    updateGravity( delta / 1000 );
    render();
  }

  mouseClicked = false;
  then = now;
};

// Run it!
loadSprites();
loadLevels();
reset();
var then = Date.now();
var mainInterval = setInterval(main, 10); // Run (almost) as fast as possible