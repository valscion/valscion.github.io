/** @namespace */
var vesq = {

	/** Tilemap */
	tilemap: {
		/** Tilemap width */
		width: 12,
		/** Tilemap height */
		height: 10,
		/** How wide is one tile (in pixels) */
		tileWidth: 40,
		/** How high is one tile (in pixels) */
		tileHeight: 40,
		/** Raw tilemap data in an [y][x] array, gets processed to tilemap.data */
		raw: [
			[1,1,1,1,1,1,1,1,1,1,1,1],
			[1,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,1,1,1,1,1,0,0,1],
			[1,0,0,0,1,0,0,0,1,0,0,1],
			[1,0,0,0,1,0,1,0,1,0,0,1],
			[1,0,0,0,1,1,1,0,1,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,1],
			[1,0,0,0,0,0,0,0,0,0,0,1],
			[1,1,1,1,1,1,1,1,1,1,1,1]
		],
		/** Processed tilemap data is in here */
		data: null,
		/** Processes tilemap.raw to tilemap.data */
		init: function () {
			var buffer, uint8View, x, y, index;

			buffer = new ArrayBuffer(vesq.tilemap.width * vesq.tilemap.height);
			uint8View = new Uint8Array(buffer);
			for (y = 0; y < vesq.tilemap.height; ++y) {
				for (x = 0; x < vesq.tilemap.width; ++x) {
					index = y * vesq.tilemap.width + x;
					uint8View[index] = vesq.tilemap.raw[y][x];
				}
			}

			vesq.tilemap.data = uint8View;
		},
		/** Fetches a tile from the given x- and y-coordinates */
		get: function (tileX, tileY) {
			var index;

			// If the map hasn't been initialized yet, return null.
			if (vesq.tilemap.data === null) {
				return null;
			}

			if (tileX < 0 || tileX >= vesq.tilemap.width || tileY < 0 || tileY >= vesq.tilemap.height) {
				// We're outside of the map, return null.
				return null;
			}

			// Calculate the index in our single-dimensional array
			index = tileY * vesq.tilemap.width + tileX;

			return vesq.tilemap.data[index];
		}
	},

	/** Gets called when DOM is ready */
	init: function () {
		// Process raw tilemap to 8-bit array
		vesq.tilemap.init();
		// Setup Kinetic
		var stage = new Kinetic.Stage('canvascontainer', 800, 600),
			tilemapLayer = new Kinetic.Layer({name: 'tilemap'}),
			objectLayer = new Kinetic.Layer({name: 'object'}),
			x,
			y;

		// Draw the tilemap to tilemapLayer
		for (x = 0; x < vesq.tilemap.width; x++) {
			for (y = 0; y < vesq.tilemap.height; y++) {
				// Closure?
				(function () {
					var tmpShape = new Kinetic.Rect({
						x: x * vesq.tilemap.tileWidth,
						y: y * vesq.tilemap.tileHeight,
						width: vesq.tilemap.tileWidth,
						height: vesq.tilemap.tileHeight,
						alpha: 0.5,
						fill: (vesq.tilemap.get(x, y) === 1) ? '#aa0' : '#00a'
					});
					// Attach various listeners to this shape
					tmpShape.on("mouseover", function () { vesq.tile.mouseover(tmpShape); });
					tmpShape.on("click", function () { vesq.tile.click(tmpShape); });
					tmpShape.on("mouseout", function () { vesq.tile.mouseout(tmpShape); });
					tmpShape.on("touchstart", function () { vesq.tile.touchstart(tmpShape); });
					tmpShape.on("touchend", function () { vesq.tile.touchend(tmpShape); });

					// Add this shape (tile) to the map
					tilemapLayer.add(tmpShape);
				})();
			}
		}

		// Add the tilemapLayer and objectLayer to stage
		stage.add(tilemapLayer);
		stage.add(objectLayer);
	},

	/** Tile related functions */
	tile: {
		/** Gets called when the mouse hovers over any tile */
		mouseover: function (tileShape) {
			// Don't animate if set to stop animating for this tile
			if (tileShape.vesq && tileShape.vesq.noAnimations) {
				return;
			}
			var stage = tileShape.getStage(),
				objectLayer = stage.getChild('object');

			tileShape.moveTo(objectLayer);
			tileShape.setAlpha(0.5);
			objectLayer.draw();
		},
		/** Gets called when user clicks on a tile */
		click: function (tileShape) {
			var stage = tileShape.getStage(),
				tilemapLayer = stage.getChild('tilemap'),
				objectLayer = stage.getChild('object');

			if (!tileShape.vesq) {
				tileShape.vesq = {};
			}

			// Toggle the animation of this tile
			tileShape.vesq.noAnimations = !tileShape.vesq.noAnimations;

			tileShape.moveTo(objectLayer);
			if (tileShape.vesq.noAnimations) {
				tileShape.setAlpha(1.0);
				objectLayer.draw();
			} else {
				tileShape.setAlpha(0.5);
				objectLayer.draw();
			}
		},
		/** Gets called when the mouse is no longer over a tile */
		mouseout: function (tileShape) {
			return;
			// Don't animate if set to stop animating for this tile
			if (tileShape.vesq && tileShape.vesq.noAnimations) {
				return;
			}
			var stage = tileShape.getStage(),
				tilemapLayer = stage.getChild('tilemap'),
				objectLayer = stage.getChild('object');

			tileShape.setAlpha(1.0);
			objectLayer.draw();
			tileShape.moveTo(tilemapLayer);
		},
		/** Gets called when a tile is touched */
		touchstart: function (tileShape) {
			// Call mouseover
			vesq.tile.mouseover(tileShape);
		},
		/** Gets called when a tile is no longer touched */
		touchend: function (tileShape) {
			// Call mouseout
			vesq.tile.mouseout(tileShape);
		}
	}
}
