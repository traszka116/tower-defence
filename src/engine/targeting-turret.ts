
interface TargetingTurret extends Turret {
    target: Enemy | null;
}

function draw_laser(t: TargetingTurret, c: CanvasRenderingContext2D) {

    if (t.target != undefined && t.target != null) {
        let e = t.target
        c.beginPath()
        c.strokeStyle = 'rgb(0, 150, 8)'
        c.lineWidth = 8
        c.moveTo(t.position.x, t.position.y)
        c.lineTo(e.position.x, e.position.y)
        c.stroke()
        c.closePath()

        c.beginPath()
        c.strokeStyle = 'rgb(0, 200, 8)'
        c.lineWidth = 3
        c.moveTo(t.position.x, t.position.y)
        c.lineTo(e.position.x, e.position.y)
        c.stroke()
        c.closePath()
    }
}

function find_nearest_enemy(t: TargetingTurret, e: Enemy[]): Enemy {
    return e.sort((a, b) => (vector_distance(a.position, t.position) - vector_distance(b.position, t.position)))[0]
}

function is_target_to_far(t: TargetingTurret): boolean {
    if (t.target == null) {
        return false
    }
    return vector_distance(t.target.position, t.position) > t.range
}

function lock_on_target(t: TargetingTurret, e: Enemy[]) {
    let nearest_in_range: (Enemy | undefined) = find_nearest_enemy(t, find_enemies_in_range(t, e))
    if (nearest_in_range != undefined) {
        t.target = nearest_in_range
        return
    }
    t.target = null
}

function create_targeting_turret(position: Vector2D, color: string, range: number, damage: number): TargetingTurret {
    return {
        position: position,
        color: color,
        range: range,
        damage: damage,
        target: null,
        type: "targeting",
        max_cooldown:1000,
        remaining_cooldown:1000

    }
}

function TargetingTurret_attack(t: TargetingTurret, c: CanvasRenderingContext2D) {
    if (t.target != null) {
        draw_laser(t, c)
        deal_damage(t.target, t.damage)
    }
}