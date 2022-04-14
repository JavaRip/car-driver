export default class GameEngine {
    moveCar(posX, posY, movVec, speed, inputs) {
        const tau = Math.PI * 2;
        const rotationSpeed = 0.1;
        const accelRate = 0.3;
        const deccelRate = 1;
        const maxSpeed = 15;
        if (inputs.turnLeft === true)
            movVec = (movVec - rotationSpeed) % tau;
        if (inputs.turnRight === true)
            movVec = (movVec + rotationSpeed) % tau;
        if (inputs.accel === true) {
            if (speed + accelRate <= maxSpeed)
                speed += accelRate;
            else
                speed = maxSpeed;
            posX += Math.cos(movVec) * speed;
            posY += Math.sin(movVec) * speed;
        }
        else {
            if (speed - deccelRate > 0)
                speed -= accelRate;
            else
                speed = 0;
            posX += Math.cos(movVec) * speed;
            posY += Math.sin(movVec) * speed;
        }
        return { x: posX, y: posY };
    }
    findRealIntersect(rays1, rays2) {
        const intersects = [];
        for (const ray1 of rays1) {
            // isect short for intersect
            let isect = { length: Infinity, point: { x: NaN, y: NaN } };
            for (const ray2 of rays2) {
                const newIsectPoint = this._findTheoreticalIntersectionPoint(ray1, ray2);
                const newIsect = {
                    length: Math.hypot(ray1.start.x - newIsectPoint.x, ray1.start.y - newIsectPoint.y),
                    point: { x: newIsectPoint.x, y: newIsectPoint.y },
                };
                if (newIsect.length < isect.length)
                    isect = newIsect;
            }
            if (isect.point.x >= ray1.start.x &&
                isect.point.x <= ray1.start.x &&
                isect.point.y >= ray1.start.y &&
                isect.point.y <= ray1.start.y) {
                intersects.push(isect);
            }
            else if (isect.point.x <= ray1.start.x &&
                isect.point.x >= ray1.end.x &&
                isect.point.y <= ray1.start.y &&
                isect.point.y >= ray1.end.y) {
                intersects.push(isect);
            }
            else if (isect.point.x <= ray1.start.x &&
                isect.point.x >= ray1.end.x &&
                isect.point.y >= ray1.start.y &&
                isect.point.y <= ray1.end.y) {
                intersects.push(isect);
            }
            else if (isect.point.x >= ray1.start.x &&
                isect.point.x <= ray1.end.x &&
                isect.point.y <= ray1.start.y &&
                isect.point.y >= ray1.end.y) {
                intersects.push(isect);
            }
        }
        return intersects;
    }
    _findTheoreticalIntersectionPoint(ray1, ray2) {
        const denominator = ((ray2.start.x - ray2.end.x) * (ray1.start.y - ray1.end.y) -
            (ray2.start.y - ray2.end.y) * (ray1.start.x - ray1.end.x));
        const t = ((ray1.end.x - ray1.start.x) * (ray2.start.y - ray1.start.y) -
            (ray1.end.y - ray1.start.y) * (ray2.start.x - ray1.start.x)) /
            denominator;
        const u = ((ray2.end.x - ray2.start.x) * (ray2.start.y - ray1.start.y) -
            (ray2.end.y - ray2.start.y) * (ray2.start.x - ray1.start.x)) / denominator;
        // if points do intersect calculate where
        if (t > 0 && t < 1 && u > 0) {
            const intersectX = ray2.start.x + t * (ray2.end.x - ray2.start.x);
            const intersectY = ray2.start.y + t * (ray2.end.y - ray2.start.y);
            return { x: intersectX, y: intersectY };
        }
        else {
            return { x: Infinity, y: Infinity };
        }
    }
}
//# sourceMappingURL=gameEngine.js.map