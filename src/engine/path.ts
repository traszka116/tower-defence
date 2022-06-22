type Path = Array<Vector2D> // start, turning points, end


function draw_path(p:Path,c:CanvasRenderingContext2D) {
    c.beginPath();
    let b: Vector2D = {
        x: path[0].x,
        y: path[0].y
    }
    let e: Vector2D = {
        x: path[path.length - 1].x,
        y: path[path.length - 1].y
    }
    c.strokeStyle = "black";
    c.lineWidth = 10;
    p.forEach(np => {
        c.lineTo(np.x, np.y);
    });
    c.stroke()
    c.closePath();
    c.fillStyle = "blue"
    c.fillRect(b.x - 10, b.y - 10, 20, 20)
    c.fillStyle = "green"
    c.fillRect(e.x - 10, e.y - 10, 20, 20)
}