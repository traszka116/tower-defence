interface Turret {
    position: Vector2D;
    color: string;
    range: number;
    damage: number;
    type: string;
    max_cooldown:number;
    remaining_cooldown:number;
}

function create_turret(position: Vector2D, color: string, range: number, damage: number,cooldown:number,type:string): Turret {
    return {
        position: position,
        color: color,
        range: range,
        damage: damage,
        type:type,
        max_cooldown:cooldown,
        remaining_cooldown:cooldown
    }
}

function draw_turret(t: Turret, c: CanvasRenderingContext2D) {
    c.beginPath()
    c.arc(t.position.x, t.position.y, t.range, 0, 2 * Math.PI)
    c.fillStyle = "rgba(0,0,0,0.3)"
    c.fill()
    c.closePath()

    c.beginPath()
    c.arc(t.position.x, t.position.y, 20, 0, 2 * Math.PI)
    c.fillStyle = t.color
    c.fill()
    c.closePath()
}

function find_enemies_in_range(t: Turret, e: (Enemy | undefined)[]): Enemy[] {
    return e.filter(enemy => {
        if (enemy == undefined)
            return false
        return (vector_distance(t.position, enemy.position) <= t.range)
    }) as Enemy[]
}

function deal_damage(e: Enemy, dmg: number): void {

    e.healthPoints -= dmg ;
}
