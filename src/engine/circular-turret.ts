interface CircularTurret extends Turret {
    burstRadius:number
}


function create_circular_turret(position: Vector2D, color: string, range: number, damage: number,cooldown:number,cost:number):CircularTurret
{
    let temp = create_turret(position,color,range,damage,cooldown,'circular',cost) as CircularTurret
    temp.burstRadius = 0;
    return temp
}

function draw_burst(t: CircularTurret) {

    setTimeout(()=>{
        t.burstRadius = t.range * 3/4
    },50)
    setTimeout(() => {
        t.burstRadius = t.range
    }, 100)
    setTimeout(()=>{
        t.burstRadius = 0
    },200)
}

