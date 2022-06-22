const timeScale = 1000 / 30;
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



let turrets: Turret[] = []
let enemies: (Enemy | undefined)[] = []


turrets.push(create_turret({ x: 100, y: 160 }, 'purple', 70, 10))
turrets.push(create_turret({ x: 500, y: 180 }, 'purple', 70, 10))
turrets.push(create_turret({ x: 610, y: 470 }, 'purple', 70, 10))

create_enemies_over_time(create_enemy(10,5 , path, "red", 2), enemies, 5, 400)


let main_loop: NodeJS.Timer = setInterval(() => {

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    draw_path(path, ctx)

    turrets.forEach(turret => {

        draw_turret(turret, ctx)
        if (turret.target == undefined || turret.target_away) {
            turret.target = find_nearest_enemy(turret, find_enemies_in_range(turret, enemies))
            turret.target_away = false
        }
        if (turret.target != undefined) {
            if (vector_distance(turret.target.position, turret.position) > turret.range) {
                turret.target_away = true

            }
            if (turret.target && !turret.target_away) {
                draw_laser(turret, turret.target, ctx)
                deal_damage(turret.target, turret.damage / timeScale)
                if (turret.target.healthPoints <= 0) {
                    turret.target = undefined
                }

            }





        }
    })
    enemies.forEach(enemy => {
        if (enemy !== undefined) {
            move_to_target(enemy)
            draw_enemy(enemy, ctx)
            if (enemy.healthPoints < 0) {
                player.money += enemy.damage
                enemies.splice(enemies.indexOf(enemy), 1)
            }

            if (vector_distance(enemy.position, enemy.path[enemy.path.length - 1]) <= 10) {
                player.healthPoints -= enemy.damage
                enemies.splice(enemies.indexOf(enemy), 1)

            }
        }


    });

    ctx.fillStyle = 'black'
    ctx.font = '50px serif';
    ctx.fillText(`health: ${player.healthPoints}        money: ${player.money}       wave: ${player.wave}`, 0,50)
    
}, timeScale)









