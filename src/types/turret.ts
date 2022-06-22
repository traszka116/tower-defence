interface Turret {
    target_away: boolean;
    position: Vector2D;
    color: string;
    range: number;
    target: Enemy | undefined;
    damage: number;

}

function create_turret(position: Vector2D, color: string, range: number, damage: number):Turret {
    return {
        position:position,
        color:color,
        range:range,
        damage:damage,
        target:undefined,
        target_away:true
    }
}

function draw_turret(t:Turret,c:CanvasRenderingContext2D){
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

function find_enemies_in_range(t:Turret,e:(Enemy | undefined)[]) : Enemy[]
{
    return e.filter(enemy => {
        if(enemy == undefined)
            return false
        return  (vector_distance(t.position,enemy.position) <= t.range)
    }) as Enemy[]
}

function find_nearest_enemy(t:Turret,e:Enemy[]):Enemy
{
    return e.sort((a,b)=>(vector_distance(a.position,t.position)-vector_distance(b.position,t.position)))[0]
}

function draw_laser(t:Turret,e:Enemy,c:CanvasRenderingContext2D)
{


    c.beginPath()
    c.strokeStyle = 'rgb(0, 150, 8)'
    c.lineWidth = 8
    c.moveTo(t.position.x,t.position.y)
    c.lineTo(e.position.x,e.position.y)
    c.stroke()
    c.closePath()

    c.beginPath()
    c.strokeStyle = 'rgb(0, 200, 8)'
    c.lineWidth = 3
    c.moveTo(t.position.x,t.position.y)
    c.lineTo(e.position.x,e.position.y)
    c.stroke()
    c.closePath()

}

