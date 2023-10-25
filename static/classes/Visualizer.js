export default class Visualizer {
    static canvas = document.querySelector('canvas');
    static ctx = Visualizer.canvas.getContext('2d');
    static clearViewports() {
        Visualizer.ctx.fillStyle = 'black';
        Visualizer.ctx.fillRect(0, 0, Visualizer.canvas.height, Visualizer.canvas.width);
    }
    static drawPointArray(points, width, color) {
        Visualizer.ctx.lineWidth = width;
        Visualizer.ctx.strokeStyle = color;
        for (const p of points) {
            Visualizer.ctx.beginPath();
            Visualizer.ctx.arc(p.x, p.y, 12, 0, 2 * Math.PI);
            Visualizer.ctx.stroke();
        }
    }
    static drawVectorArray(vectors, width, color, texture) {
        if (texture === 'dashed') {
            Visualizer.ctx.setLineDash([5, 15]);
        }
        else {
            Visualizer.ctx.setLineDash([]);
        }
        Visualizer.ctx.lineWidth = width;
        Visualizer.ctx.strokeStyle = color;
        for (const v of vectors) {
            Visualizer.ctx.beginPath();
            Visualizer.ctx.moveTo(v.start.x, v.start.y);
            Visualizer.ctx.lineTo(v.end.x, v.end.y);
            Visualizer.ctx.stroke();
        }
    }
}
//# sourceMappingURL=Visualizer.js.map