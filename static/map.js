import Vector from './classes/Vector.js';
import Point from './classes/Point.js';
const circleMap = [
    new Vector(new Point(50, 750), new Point(50, 250)),
    new Vector(new Point(50, 250), new Point(75, 175)),
    new Vector(new Point(75, 175), new Point(175, 75)),
    new Vector(new Point(250, 50), new Point(175, 75)),
    new Vector(new Point(250, 50), new Point(750, 50)),
    new Vector(new Point(750, 50), new Point(825, 75)),
    new Vector(new Point(825, 75), new Point(925, 175)),
    new Vector(new Point(925, 175), new Point(950, 250)),
    new Vector(new Point(950, 250), new Point(950, 750)),
    new Vector(new Point(950, 750), new Point(925, 825)),
    new Vector(new Point(925, 825), new Point(825, 925)),
    new Vector(new Point(825, 925), new Point(750, 950)),
    new Vector(new Point(750, 950), new Point(250, 950)),
    new Vector(new Point(250, 950), new Point(175, 925)),
    new Vector(new Point(175, 925), new Point(75, 825)),
    new Vector(new Point(75, 825), new Point(50, 750)),
    new Vector(new Point(250, 350), new Point(250, 650)),
    new Vector(new Point(250, 650), new Point(350, 750)),
    new Vector(new Point(350, 750), new Point(650, 750)),
    new Vector(new Point(650, 750), new Point(750, 650)),
    new Vector(new Point(750, 650), new Point(750, 350)),
    new Vector(new Point(750, 350), new Point(650, 250)),
    new Vector(new Point(650, 250), new Point(350, 250)),
    new Vector(new Point(350, 250), new Point(250, 350)),
];
const straightMap = [
    new Vector(new Point(50, 750), new Point(50, 250)),
    new Vector(new Point(80, 750), new Point(80, 250)),
];
const maps = {
    circleMap,
    straightMap,
};
export default maps;
//# sourceMappingURL=map.js.map