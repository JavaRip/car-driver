export default class Visualizer {
    static clearViewports(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.height, canvas.width);
    }
    static drawPointArray(canvas, points, width, color) {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        for (const p of points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 12, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
    static drawVectorArray(canvas, vectors, width, color) {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        for (const v of vectors) {
            ctx.beginPath();
            ctx.moveTo(v.start.x, v.start.y);
            ctx.lineTo(v.end.x, v.end.y);
            ctx.stroke();
        }
    }
}
//# sourceMappingURL=visualizer.js.map