export default class Controller {
  constructor() {
    this.turnLeft = false;
    this.turnRight = false;
    this.accel = false;
    this.parseUserInputBound = this._parseUserInput.bind(this);
    document.addEventListener('keydown', this.parseUserInputBound);
    document.addEventListener('keyup', this.parseUserInputBound);
  }

  getInput() {
    return { turnLeft: this.turnLeft, turnRight: this.turnRight, accel: this.accel };
  }

  async getApiInput(GS) {
    const res = await fetch(
      '/gamestate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gamestate: `${GS.posX}, ${GS.posY}, ${GS.movVec}, ${GS.speed}`,
        }),
      });

    const nextMove = await res.json();

    nextMove[0] === '0' ? this.turnLeft = false : this.turnLeft = true;
    nextMove[1] === '0' ? this.turnRight = false : this.turnRight = true;
    nextMove[2] === '0' ? this.accel = false : this.accel = true;
  }

  _parseUserInput(event) {
    switch (event.key) {
      case 'a':
      case 'ArrowLeft':
        event.type === 'keydown' ? this.turnLeft = true : this.turnLeft = false;
        break;
      case 'd':
      case 'ArrowRight':
        event.type === 'keydown' ? this.turnRight = true : this.turnRight = false;
        break;
      case 'w':
      case 'ArrowUp':
        event.type === 'keydown' ? this.accel = true : this.accel = false;
        break;
    }
  }
}
