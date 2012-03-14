/**
 * Configuration
 */

define({
  canvasWidth: 800,
  canvasHeight: 600,
  sprites: {
    source: "../media/sprites.png",
    frameWidth: 16,
    frameHeight: 24,
    runRight: {
      x: 0,
      y: 0,
      frames: 16
    },
    runLeft: {
      mirror: this.runRight
    },
    hangRight: {
      x: 0,
      y: 1,
      frames: 10
    },
    hangLeft: {
      mirror: this.hangRight
    },
    coin: {
      x: 10,
      y: 1,
      frames: 6
    },
    climb: {
      x: 0,
      y: 2,
      frames: 6
    },
    wall: {
      x: 6,
      y: 2,
      frames: 1
    },
    crumblingWall: {
      x: 6,
      y: 2,
      frames: 9
    },
    ladders: {
      x: 1,
      y: 3,
      frames: 1
    },
    laddersOff: {
      x: 2,
      y: 3,
      frames: 1
    },
    rope: {
      x: 3,
      y: 3,
      frames: 1
    }
  }
});