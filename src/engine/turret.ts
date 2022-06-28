interface Turret {
    position: Vector2D;
    color: string;
    range: number;
    damage: number;
    type: string;
    max_cooldown: number;
    remaining_cooldown: number;
    selected: boolean;
    cost:number;
    level:number;
}

function create_turret(position: Vector2D, color: string, range: number, damage: number, cooldown: number, type: string,cost:number): Turret {
    return {
        position: position,
        color: color,
        range: range,
        damage: damage,
        type: type,
        max_cooldown: cooldown,
        remaining_cooldown: cooldown,
        selected: false,
        cost:cost,
        level:1
    }
}

function draw_turret(t: Turret, c: CanvasRenderingContext2D) {
    if (t.selected) {
        c.beginPath()
        c.arc(t.position.x, t.position.y, t.range, 0, 2 * Math.PI)
        // c.fillStyle = "rgba(0,0,0,0.3)"
        c.lineWidth = 3
        c.strokeStyle = "rgba(0,0,0,0.3)"
        c.stroke()
        c.closePath()
    }
    c.beginPath()
    c.arc(t.position.x, t.position.y, 20, 0, 2 * Math.PI)
    c.fillStyle = t.color
    c.fill()
    c.closePath()
    c.fillStyle = "black"
    c.fillText(t.type.charAt(0), t.position.x-12, t.position.y + 13)

}

function find_enemies_in_range(t: Turret, e: (Enemy | undefined)[]): Enemy[] {
    return e.filter(enemy => {
        if (enemy == undefined)
            return false
        return (vector_distance(t.position, enemy.position) <= t.range)
    }) as Enemy[]
}

function deal_damage(e: Enemy, dmg: number): void {

    e.healthPoints -= dmg;
}
