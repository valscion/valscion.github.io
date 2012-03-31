/**
 * Configuration
 */

define(function configDefine() {
  var objKey, tmpObj, mirrorObj,
    config = {
      canvasWidth: 800,
      canvasHeight: 600,
      sprites: {
        source: "../media/sprites.png",
        frameWidth: 16,
        frameHeight: 24,
        runRight: {
          x: 0,
          y: 0,
          frames: {
            count: 16,
            time: 50
          }
        },
        runLeft: {
          mirror: "runRight"
        },
        hangRight: {
          x: 0,
          y: 1,
          frames: {
            count: 10,
            time: 80
          }
        },
        hangLeft: {
          mirror: "hangRight"
        },
        coin: {
          x: 10,
          y: 1,
          frames: {
            count: 6,
            time: 150
          }
        },
        climb: {
          x: 0,
          y: 2,
          frames: {
            count: 6,
            time: 80
          }
        },
        wall: {
          x: 6,
          y: 2,
          frames: {
            count: 1
          }
        },
        crumblingWall: {
          x: 6,
          y: 2,
          frames: {
            count: 9,
            time: 120
          }
        },
        ladders: {
          x: 1,
          y: 3,
          frames: {
            count: 1
          }
        },
        laddersOff: {
          x: 2,
          y: 3,
          frames: {
            count: 1
          }
        },
        rope: {
          x: 3,
          y: 3,
          frames: {
            count: 1
          }
        }
      },
      levels: [
        {
          name: "Hello, world!",
          source: "../media/levels/01_hello-world/data.png"
        },
        {
          name: "Oh my",
          source: "../media/levels/02_oh-my/data.png"
        }
      ]
    };

  // Put a real pointer in place of the mirror in sprites that mirror another sprite. Yo dawg.
  for (objKey in config.sprites) {
    if (config.sprites.hasOwnProperty(objKey)) {
      tmpObj = config.sprites[objKey];
      if ('object' === typeof tmpObj && tmpObj.hasOwnProperty("mirror")) {
        mirrorObj = config.sprites[tmpObj.mirror];
        tmpObj.mirror = true;
        tmpObj.x = mirrorObj.x;
        tmpObj.y = mirrorObj.y;
        tmpObj.frames = mirrorObj.frames;
      }
    }
  }

  // Return our stuff
  return config
});