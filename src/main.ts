const tickSpeed = 1000 / 30;
const canvas = document.querySelector('#can') as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D


const player = {
    wave: 1,
    healthPoints: 100,
    money:0
}   





let path: Path =
    [
        { x: 100, y: 100 },
        { x: 300, y: 140 },
        { x: 500, y: 250 },
        { x: 600, y: 550 },
        { x: 800, y: 350 },
        { x: 900, y: 350 }
    ]



// let turrets: Turret[] = []
// let enemies: (Enemy | undefined)[] = []





// 
// let enemy: Enemy = create_enemy(10,5,path,"orange",50)

// let targeting_turret : TargetingTurret = create_targeting_turret({x:110,y:50},"blue",90,10)

// draw_turret(targeting_turret,ctx)
// lock_on_target(targeting_turret,[enemy])
// TargetingTurret_attack(targeting_turret,ctx)


let enemies:Enemy[] = []
create_enemies_over_time(create_enemy(10,5 , path, "red", 2), enemies, 10, 400)

let turrets:Turret[] = []
turrets.push(create_targeting_turret({x:620,y:470},"blue",90,10))

let loop: NodeJS.Timer = setInterval(()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    draw_path(path, ctx)
    
    
    turrets.forEach(t=>{
        draw_turret(t,ctx)
        if(t.type == "targeting")
        {
            const tt:TargetingTurret = t as TargetingTurret 
            if(tt.target != undefined && tt.target?.healthPoints<=0)
                tt.target = null                
            if(tt.target == null || is_target_to_far(tt))
                lock_on_target(tt,enemies)            
            if (tt.target != null)
                draw_laser(tt, ctx)
            if(t.remaining_cooldown <= 0){
                if (tt.target != null){
                    deal_damage(tt.target,tt.damage)
                    t.remaining_cooldown = t.max_cooldown
            }}
            if(t.remaining_cooldown>0)
                t.remaining_cooldown -= tickSpeed
        }
        

    })
    
    enemies.forEach(e=>{
        move_to_target(e)
        draw_enemy(e,ctx)
        if(e.healthPoints <= 0)
        enemies.splice(enemies.indexOf(e),1)
    })




},tickSpeed)














// let main_loop: NodeJS.Timer = setInterval(() => {

//     ctx.clearRect(0, 0, canvas.width, canvas.height)


    
// }, timeScale)









