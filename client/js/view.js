// global variables
const VIEW = {
  canvases: {
    topDownCanvas: null,
  },
};

/**
 * Clear viewports is run at the start of every frame to clear the drawing of the previous
 * frame. Without this function every frame drawn would be drawn over the previous.
 */

function clearViewports() {
  const canvases = VIEW.canvases;
  for (const key of Object.keys(canvases)) {
    const canvas = canvases[key];
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.height, canvas.width);
  }
}

/**
 * This function will draw an array of vectors to a passed canvas element.
 * @param {array} vectors array of objects with start and end coordinates, walls or rays
 * @param {object} ctx the context of the canvas being drawn on
 * @param {number} lineWidth the thickness of the line to draw on the canvas
 * @param {string} strokeColor the colour to draw the stroke
 */

function drawVectorArray(vectors, ctx, lineWidth, strokeColor) {
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeColor;
  for (const vector of vectors) {
    ctx.beginPath();
    ctx.moveTo(vector.x1, vector.y1);
    ctx.lineTo(vector.x2, vector.y2);
    ctx.stroke();
  }
}

/**
 * This function will draw an array of points on a canvas as filled circles.
 * @param {array} points an array of single point coordinates
 * @param {object} ctx the canvas context to draw to
 * @param {number} poinSize the size of the points to draw
 * @param {string} pointColor the color to draw the points
 */

function drawPointArray(points, ctx, pointSize, pointColor) {
  ctx.lineWidth = pointSize;
  ctx.fillStyle = pointColor;
  for (const point of points) {
    if (point.distance !== Infinity) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI); // draw player
      ctx.fill();
    }
  }
}

/**
 * This function draws the top down view of the game state.
 * @param {array} level an array of vectors, the level to draw
 * @param {object} playerPos the coordinate point of the player on the canvas
 * @param {array} rays an array of vectors, the rays which have been cast
 * @param {object} lookVectorthe vector indicating the direction the player is looking in
 */

function drawTopDownView(level, playerPos, rays, lookVector) {
  const tdctx = VIEW.canvases.topDownCanvas.getContext('2d');
  // draw map
  drawVectorArray(level, tdctx, 5, 'white');
  // draw FOV markers
  drawVectorArray([rays[0], rays[rays.length - 1]], tdctx, 3, 'cornflowerblue');
  // draw direction of movement (where the player is looking
  drawVectorArray([lookVector], tdctx, 3, 'lime');
  drawPointArray([playerPos], tdctx, 5, 'white');
  drawPointArray(rays.map(ray => ray.intersect), tdctx, 2, 'white');
}

/**
 * This function clears the previous frame from the canvas element then draws the current
 * frame.
 * @param {array} level an array of wall vector objects, the current level
 * @param {object} playerPos the coordinates of the player
 * @param {array} castRays the rays which have been cast including their intersects
 * @param {object} lookVector the vector in the direction the player is facing
 */

function drawView(level, playerPos, castRays, lookVector) {
  clearViewports();
  drawTopDownView(level, playerPos, castRays, lookVector);
}

function initViewports(topDownCanvas) {
  VIEW.canvases.topDownCanvas = topDownCanvas;
}

export {
  initViewports,
  togglePauseMenu,
  displayLevelBrowser,
  displayLevelEditor,
  displayGameScreen,
  returnToMenu,
  drawView,
};

// testing only
export {
  VIEW,
  clearViewports,
  drawFirstPersonView,
  drawTopDownView,
};
