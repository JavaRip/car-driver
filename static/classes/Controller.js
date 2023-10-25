export default class Controller {
    static turnLeft = false;
    static turnRight = false;
    static accel = false;
    static init() {
        document.addEventListener('keydown', (event) => {
            Controller.parseUserInput(event);
        });
        document.addEventListener('keyup', (event) => {
            Controller.parseUserInput(event);
        });
    }
    static getInput() {
        return {
            turnLeft: Controller.turnLeft,
            turnRight: Controller.turnRight,
            accel: Controller.accel,
        };
    }
    static async getApiInput(carState) {
        const res = await fetch('/getMove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carState),
        });
        const controlArr = await res.json();
        const inputs = {
            turnLeft: Boolean(Number(controlArr[0])),
            turnRight: Boolean(Number(controlArr[1])),
            accel: Boolean(Number(controlArr[2])),
        };
        if (res.ok) {
            return inputs;
        }
        else {
            throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
    }
    static parseUserInput(event) {
        switch (event.key) {
            case 'a':
            case 'ArrowLeft':
                event.type === 'keydown' ? Controller.turnLeft = true : Controller.turnLeft = false;
                break;
            case 'd':
            case 'ArrowRight':
                event.type === 'keydown' ? Controller.turnRight = true : Controller.turnRight = false;
                break;
            case 'w':
            case 'ArrowUp':
                event.type === 'keydown' ? Controller.accel = true : Controller.accel = false;
                break;
        }
    }
}
//# sourceMappingURL=Controller.js.map