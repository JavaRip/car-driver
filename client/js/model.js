import { drawView } from './view.js';

class GameState {
  /**
   * Contains the information required for a running game.
   * @param {boolean} movingForwards shows if the player will move foward next frame
   * @param {boolean} movingBackwards shows if the player will move backwards next frame
   * @param {boolean} turningLeft indicates if the player will turn left in next frame
   * @param {boolean} turning Right indicates if the player will turn right in next frame
   * @param {object} playerPos the x and y coordinates of the player on the level
   * @param {number} playerLookAngle direction player is looking in radians (0 to 2 * PI)
   * @param {array} castRays array of the rays cast, includes the intersects of the rays
   * @param {object} lookVector a ray in the direction the player is facing
   * @param {number} movementSpeed value which shows how much the player moves per frame
   * @param {number} numRays the number of rays to be cast within the FOV
   * @param {number} fov the area around the player through which rays will be cast
   * @param {array} level an array of wall objects
   * @param {boolean} running a boolean to determine if the game goes to the next frame
   * @param {number} fps the number of milliseconds between frames (1000 / desired fps)
   */
  constructor() {
    this.movingForwards = false;
    this.movingBackwards = false;
    this.turningLeft = false;
    this.turningRight = false;
    this.playerPos = { x: 500, y: 500 };
    this.playerLookAngle = 0;
    this.castRays = [];
    this.lookVector = null;
    this.movementSpeed = 5;
    this.numRays = 50;
    this.fov = Math.PI * 2 / 4;
    this.rayLength = 75;
    this.level = null;
    this.running = false;
    this.fps = 1000 / 60;
  }
}

const GS = new GameState();

/**
 * Controls the player position and playerLookAngle. Every frame this function determines
 * if the player is moving or turning and if it is the direction to move the player to is
 * calculated based on the playerLookAngle to ensure the player is moving forward relative
 * to where they are facing.
 * A great demo on how trigonometry can be used for this can be found here:
 * https://portsoc.github.io/canvascircle/
 */

function movePlayer() {
  const tau = Math.PI * 2;
  const rotationSpeed = GS.movementSpeed / 50;
  if (GS.movingForwards) {
    GS.playerPos.x += GS.movementSpeed * Math.cos(GS.playerLookAngle);
    GS.playerPos.y += GS.movementSpeed * Math.sin(GS.playerLookAngle);
  }
  if (GS.turningLeft) {
    GS.playerLookAngle = (GS.playerLookAngle - rotationSpeed) % tau;
  }
  if (GS.movingBackwards) {
    GS.playerPos.x -= GS.movementSpeed * Math.cos(GS.playerLookAngle);
    GS.playerPos.y -= GS.movementSpeed * Math.sin(GS.playerLookAngle);
  }
  if (GS.turningRight) {
    GS.playerLookAngle = (GS.playerLookAngle + rotationSpeed) % tau;
  }
}

/**
 * This function casts rays from the player position. The direction of the rays is
 * determined by the angle offset. To draw the lookVector the angle offset will be the
 * playerLookAngle, to cast rays the angle offset will move incrementally across the FOV
 * @param {number} angleOffset angleOffset in radians
 */

function getRayRelativeToPlayerPosition(angleOffset) {
  // without offset, cast the ray directly down the direction the player is facing
  // use offset to cast ray relative to this position. Offset is in radians
  const rayOffsetX = Math.cos(GS.playerLookAngle + angleOffset);
  const rayOffsetY = Math.sin(GS.playerLookAngle + angleOffset);
  const rayExtendedX = rayOffsetX * GS.rayLength;
  const rayExtendedY = rayOffsetY * GS.rayLength;
  const rayEndpointX = GS.playerPos.x + rayExtendedX;
  const rayEndpointY = GS.playerPos.y + rayExtendedY;
  return { x1: GS.playerPos.x, y1: GS.playerPos.y, x2: rayEndpointX, y2: rayEndpointY };
}

/**
 * This function casts rays from the player position within the FOV. The angle difference
 * between rays is determined by the size of the FOV and the number of rays.
 *
 * The function starts by resetting the cast rays from the last frame, then calculating
 * the space between rays by dividing the number of rays by the field of view, it then
 * uses the getRayRelativeToPlayerPosition function to cast the rays across and within the
 * FOV
 */

function castRays() {
  GS.castRays = []; // reset cast rays from last frame
  const raySpacing = GS.fov / GS.numRays; // unit of ray spacing in radians
  const maxRayDiff = Math.floor(GS.numRays / 2);

  // i starts as negative max ray diff so the rays are cast with the lookDir in the middle
  for (let i = -maxRayDiff; i <= maxRayDiff; i += 1) {
    const ray = getRayRelativeToPlayerPosition(raySpacing * i);
    GS.castRays.push(ray);
  }
}

/**
 * This function detects any intersects between arrays and walls. It does this using a
 * line intersection algorithm. For details on the algorithm, see this wikipedia page:
 * https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection#Given_two_points_on_each_line_segment
 *
 * Note that this algorithm isn't from the wikipedia page, but the knowledge required to
 * write this algorithm is.
 * @param {object} ray ray vector object containing a start and an end point
 * @param {object} wall wall vector object, the same structure as the ray
 */

function findIntersect(ray, wall) {
  const denominator =
    ((wall.x1 - wall.x2) * (ray.y1 - ray.y2) - (wall.y1 - wall.y2) * (ray.x1 - ray.x2));
  const t =
    ((ray.x2 - ray.x1) * (wall.y1 - ray.y1) - (ray.y2 - ray.y1) * (wall.x1 - ray.x1)) /
    denominator;
  const u =
    ((wall.x2 - wall.x1) * (wall.y1 - ray.y1) - (wall.y2 - wall.y1) * (wall.x1 - ray.x1)) /
    denominator;

  // if points do intersect calculate where
  if (t > 0 && t < 1 && u > 0) {
    const intersectOnWallX = wall.x1 + t * (wall.x2 - wall.x1);
    const intersectOnWallY = wall.y1 + t * (wall.y2 - wall.y1);
    return { x: intersectOnWallX, y: intersectOnWallY };
  } else {
    return { x: Infinity, y: Infinity };
  }
}

/**
 * This function checks if any ray intersects with any wall. Because a ray pass through
 * and therefore intersect with multiple walls the shortest intersect is the one
 * attributed to the ray.
 */

function detectIntersects() {
  for (const ray of GS.castRays) {
    // placeholder intersect distance is infinite, any intersect is shorter than none
    ray.intersect = { distance: Infinity, x: null, y: null };
    for (const wall of GS.level) {
      const newIntersect = findIntersect(ray, wall);
      newIntersect.distance =
        Math.hypot(GS.playerPos.x - newIntersect.x, GS.playerPos.y - newIntersect.y);
      if (newIntersect.distance < ray.intersect.distance) {
        ray.intersect = newIntersect;
      }
    }
  }
}

// game loop
setInterval(() => { if (GS.running) gameLoop(); }, GS.fps);

/**
 * The game loop is called every every x milliseconds, where x is determined by the fps
 * set in the GameState. It moves the player, casts rays, detects the intersects for these
 * rays then updates the display. At a very high level these are all the steps required
 * for a raycasting engine.
 */

function gameLoop() {
  movePlayer();
  castRays();
  GS.lookVector = getRayRelativeToPlayerPosition(0);
  detectIntersects();
  drawView(GS.level, GS.playerPos, GS.castRays, GS.lookVector);
}

/**
 * This function is used by the level editor to add another wall to the current level.
 * @param {object} wall wall vector object
 */

function addWall(wall) {
  GS.level.push(wall);
}

/**
 * This function sets the movement of the player. As this is determined by the player
 * input it can happen between frames. As such this function does not move the player, but
 * tells the engine to move the player during the next frame.
 * @param {string} direction direction
 * @param {boolean} bool boolean to make movement start or stop
 */

function setMovement(direction, bool) {
  switch (direction) {
    case 'forwards':
      GS.movingForwards = bool;
      break;
    case 'left':
      GS.turningLeft = bool;
      break;
    case 'backwards':
      GS.movingBackwards = bool;
      break;
    case 'right':
      GS.turningRight = bool;
      break;
  }
}

/**
 * This function loads a level into the game engine.
 * @param {object} level level Refers to the level
 */

function loadLevel(level) {
  GS.level = level;
}

/**
 * This function returns the current level. This is used for sending the level to the
 * server to be saved.
 * @returns {object} level the current level
 */

function getLevel() {
  return GS.level;
}

/**
 * This function deletes a wall from the current level. This is used by the level editor
 * to undo the last wall added.
 */

function deleteWall() {
  GS.level.pop();
}

/**
 * @param {string} bool tells the game running state to start stop or toggle.
 */

function startGame(bool) {
  if (bool === 'toggle') {
    console.log('gameEngine: start');
    GS.running = !GS.running;
  } else {
    console.log(`gameEngine: ${String(bool)}`);
    GS.running = bool;
  }
}

// exports
export {
  loadLevel,
  startGame,
  gameLoop,
  setMovement,
  addWall,
  getLevel as wallArr,
  gameLoop as stepGameEngine,
  deleteWall,
};

// import only in test scripts

export {
  GS,
  movePlayer,
  castRays,
  detectIntersects,
  getLevel,
};
