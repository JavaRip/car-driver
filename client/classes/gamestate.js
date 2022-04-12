export default class GameState {
  constructor(posX, posY, map, movVec, speed, rotSpeed) {
    this.posX = posX;
    this.posY = posY;
    this.body = [];
    this.bodyRays = [];
    this.bodyIntersects = [];
    this.movVec = movVec;
    this.movRay = null;
    this.speed = speed;
    this.rotSpeed = rotSpeed;
    this.map = map;
  }
}
