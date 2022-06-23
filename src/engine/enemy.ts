interface Enemy {
    damage: number;
    healthPoints: number;
    color: string;
    position: Vector2D;
    speed: number;
    path: Path;
    target: Vector2D;
    toDestroy: boolean;
}

function create_enemies_over_time(enemyTemplate:Enemy,enemyArray:(Enemy | undefined)[],count:number,timeout:number)
{
    let i = 0;
    let timer = setInterval(()=>{
        if(i==count-1)
        {
            clearInterval(timer);
        }
        enemyArray.push(create_enemy(enemyTemplate.healthPoints,enemyTemplate.damage,enemyTemplate.path,enemyTemplate.color,enemyTemplate.speed))
        i++;
    },timeout) 
}


function draw_enemy(e: Enemy, c: CanvasRenderingContext2D) {
    c.beginPath()
    c.arc(e.position.x, e.position.y, 12, 0, 2 * Math.PI)
    c.fillStyle = e.color
    c.fill()
    c.closePath()
}
function create_enemy(health: number,damage:number, p: Path, color: string, speed: number): Enemy {
    let enemy: Enemy = {
        healthPoints: health,
        color: color,
        position: p[0],
        speed: speed,
        path: p,
        target: p[1],
        toDestroy: false,
        damage:damage
    }
    return enemy
}
function navigate(e: Enemy): Vector2D {
    return vector_normalize(vector_subtract(e.position, e.target))
}
function is_near_target(e: Enemy): boolean {
    return vector_length(vector_subtract(e.target, e.position)) <= e.speed / 2
}
function move_in_direction(e: Enemy, d: Vector2D): void {
    e.position = vector_sum(e.position, vector_scale(d, e.speed))
}
function move_to_target(e: Enemy): void {

    if (is_near_target(e) && e.target == e.path[e.path.length - 1]) {
        e.toDestroy = true
        return
    }

    if (is_near_target(e)) {
        e.position = e.target
        e.target = e.path[e.path.indexOf(e.target) + 1]
        return
    }
    move_in_direction(e, vector_scale(navigate(e), -1))

}





